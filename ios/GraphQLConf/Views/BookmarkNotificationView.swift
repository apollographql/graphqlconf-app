import SwiftUI
import UserNotifications

struct BookmarkNotificationView: View {

  // TODO: Refactor bookmark + notification functions. There should be one 'bookmark' add/remove function that handles
  // notification and local (past events). There are lots of places right now where you need particular knowledge about
  // how things are handled. The goal is to remove that complexity and make it easy to work with.

  enum BookmarkSource {
    case pendingNotification
    case bookmark
  }

  let session: AugmentedSessionFragment

  @State private var showBookmarkNotificationAlert: Bool = false
  @State private var showDeniedNotificationsAlert: Bool = false
  @State private var saturation: Double = 0.0
  @State private var image: ImageResource = .bookmark

  var body: some View {
    Image(self.image)
      .foregroundStyle(Theme.tint)
      .frame(width: 48, height: 24, alignment: .center)
      .saturation(self.saturation)

      .onAppear() {
        Task {
          if await hasPendingNotificationRequests(for: session) {
            applyBookmarkIndicator(.pendingNotification)

          } else if hasBookmark(for: session) {
            applyBookmarkIndicator(.bookmark)

          } else {
            removeBookmarkIndicator()
          }
        }
      }
      .onTapGesture {
        Task {
          await handleBookmarkRequest()
        }
      }

      .alert("Session Bookmark", isPresented: $showBookmarkNotificationAlert) {
        Button("OK") {
          Task {
            await requestAppPermissions()
          }
        }
        Button("Cancel", role: .cancel) { }

      } message: {
        Text("Bookmarking a session will schedule a notification 10 minutes before the start time.\n\nPlease allow notifications on the following permission request.")
      }
      .alert("Notification Permission Required", isPresented: $showDeniedNotificationsAlert) {
      } message: {
        Text("Session bookmarks require notification permissions to work correctly. Please go to your device's settings and enable notifications for this app.")
      }
  }

  func applyBookmarkIndicator(_ source: BookmarkSource) {
    switch source {
    case .pendingNotification: self.image = .bookmarkFilled
    case .bookmark: self.image = .bookmark
    }

    self.saturation = 1.0
  }

  func removeBookmarkIndicator() {
    self.image = .bookmark
    self.saturation = 0.0
  }

  func requestAppPermissions() async {
    do {
      if try await !UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) {
        self.showDeniedNotificationsAlert = true

      } else {
        await scheduleSessionNotification(for: session)
      }

    } catch {}
  }

  func handleBookmarkRequest() async {
    let center = UNUserNotificationCenter.current()

    switch await center.notificationSettings().authorizationStatus {
    case .authorized:
      await toggleSessionNotification(for: session)

    case .notDetermined:
      self.showBookmarkNotificationAlert = true

    case .denied:
      self.showDeniedNotificationsAlert = true

    default: // .provisional, .ephemeral, and @unknown
      break
    }
  }

  // MARK: Notifications

  func toggleSessionNotification(for session: AugmentedSessionFragment) async {
    if await hasPendingNotificationRequests(for: session) {
      await removeAllSessionNotifications(for: session)
      removeBookmark(for: session)
      removeBookmarkIndicator()

    } else if hasBookmark(for: session) {
      removeBookmark(for: session)
      removeBookmarkIndicator()

    } else {
      await scheduleSessionNotification(for: session)
    }
  }

  func hasPendingNotificationRequests(for session: AugmentedSessionFragment) async -> Bool {
    return await UNUserNotificationCenter.current().pendingNotificationRequests().contains { notificationRequest in
      notificationRequest.identifier == session.notificationIdentifier
    }
  }

  func scheduleSessionNotification(for session: AugmentedSessionFragment) async {
    let content = UNMutableNotificationContent()
    content.title = "Session starting soon!"
    content.sound = UNNotificationSound.default
    content.body = "\"\(session.sessionFragment.title)\" is starting at \(session.formattedStartTime)"
    if let venueName = session.formattedVenue {
      content.body += " in \(venueName)"
    }
    content.body += "."

    guard let notificationDate = session.notificationDate else {
      #warning("Present alert - failed to schedule notification!")
      return
    }
    let dateComponents = Calendar.current.dateComponents(in: DateFormatter.sharedTimezone, from: notificationDate)
    let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)
    let request = UNNotificationRequest(identifier: session.notificationIdentifier, content: content, trigger: trigger)

    do {
      if notificationDate > Date.now {
        try await UNUserNotificationCenter.current().add(request)
        addBookmark(notificationDate, for: session) // this enables bookmarked sessions to remain bookmarked once finished
        applyBookmarkIndicator(.pendingNotification)
#if DEBUG
        print("Pending notification requests: \(await UNUserNotificationCenter.current().pendingNotificationRequests().count)")
#endif

      } else {
        addBookmark(notificationDate, for: session)
        applyBookmarkIndicator(.bookmark)
      }

    }catch {
      #warning("Present alert - failed to schedule notification!")
    }
  }

  func removeAllSessionNotifications(for session: AugmentedSessionFragment) async {
    UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [session.notificationIdentifier])

#if DEBUG
    print("Pending notification requests: \(await UNUserNotificationCenter.current().pendingNotificationRequests().count)")
#endif
  }

  // MARK: Local Bookmarks

  func hasBookmark(for session: AugmentedSessionFragment) -> Bool {
    UserDefaults.standard.object(forKey: session.notificationIdentifier) != nil ? true : false
  }

  func addBookmark(_ object: Any?, for session: AugmentedSessionFragment) {
    UserDefaults.standard.setValue(object, forKey: session.notificationIdentifier)
  }

  func removeBookmark(for session: AugmentedSessionFragment) {
    UserDefaults.standard.removeObject(forKey: session.notificationIdentifier)
  }

}
