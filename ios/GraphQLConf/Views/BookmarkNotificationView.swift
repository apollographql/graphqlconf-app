import SwiftUI
import UserNotifications

struct BookmarkNotificationView: View {

  let session: AugmentedSessionFragment

  @State private var showBookmarkNotificationAlert: Bool = false
  @State private var showDeniedNotificationsAlert: Bool = false
  @State private var saturation: Double = 0.0

  var body: some View {
    Image(.bookmark)
      .foregroundStyle(Theme.tint)
      .frame(width: 48, height: 24, alignment: .center)
      .saturation(self.saturation)
      .onTapGesture {
        Task {
          await handleSessionNotification()
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
      .onAppear() {
        Task {
          self.saturation = Double(await pendingNotificationRequests(for: session))
        }
      }
  }

  func handleSessionNotification() async {
    let center = UNUserNotificationCenter.current()

    switch await center.notificationSettings().authorizationStatus {
    case .authorized:
      await checkSessionNotification(for: session)

    case .notDetermined:
      self.showBookmarkNotificationAlert = true

    case .denied:
      self.showDeniedNotificationsAlert = true

    default: // .provisional, .ephemeral + @unknown
      break
    }
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

  func checkSessionNotification(for session: AugmentedSessionFragment) async {
    if await pendingNotificationRequests(for: session) == 0 {
      await scheduleSessionNotification(for: session)

    } else {
      await removeAllSessionNotifications(for: session)
    }
  }

  func pendingNotificationRequests(for session: AugmentedSessionFragment) async -> Int {
    return await UNUserNotificationCenter.current().pendingNotificationRequests().count { notificationRequest in
      notificationRequest.identifier == session.notificationIdentifier
    }
  }

  func scheduleSessionNotification(for session: AugmentedSessionFragment) async {
    let content = UNMutableNotificationContent()
    content.title = "Session starting soon!"
    content.sound = UNNotificationSound.default
    content.body = "\"\(session.sessionFragment.title)\" is starting at \(session.formattedStartTime)"
    if let venueName = session.sessionFragment.venue {
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
      try await UNUserNotificationCenter.current().add(request)
      self.saturation = 1.0

#if DEBUG
      print("Pending notification requests: \(await UNUserNotificationCenter.current().pendingNotificationRequests().count)\n\(await UNUserNotificationCenter.current().pendingNotificationRequests())")
#endif

    }catch {
      #warning("Present alert - failed to schedule notification!")
    }
  }

  func removeAllSessionNotifications(for session: AugmentedSessionFragment) async {
    UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [session.notificationIdentifier])
    self.saturation = 0.0

#if DEBUG
    print("Pending notification requests: \(await UNUserNotificationCenter.current().pendingNotificationRequests().count)\n\(await UNUserNotificationCenter.current().pendingNotificationRequests())")
#endif
  }

}
