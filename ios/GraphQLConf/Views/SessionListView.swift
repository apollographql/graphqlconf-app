import SwiftUI
import ConnectorAPI

struct SessionListView: View {

  /// Master schedule passed from view model which is used as the data source for `sessionList`.
  @Binding var schedule: [[AugmentedSessionFragment]]
  /// Used to populate the list with any filtering applied.
  @State private var sessionList: [[AugmentedSessionFragment]] = [[]]

  @Environment(\.bookmarkFilter) var bookmarkFilter
  @Environment(\.scrollToNow) var scrollToNow

  var body: some View {
    VStack {
      if sessionList.isEmpty {
        Text("Only bookmarked sessions will show up in this filter.")
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          .multilineTextAlignment(.center)
          .font(.HostGrotesk.h3)
          .foregroundStyle(Theme.tint)
          .background(.clear)

      } else {
        ScrollViewReader { proxy in
          ScrollView {
            LazyVStack(spacing: 16, pinnedViews: .sectionHeaders) {
              ForEach(sessionList, id: \.self) { section in
                Section {
                  ForEach(section, id: \.self) { session in
                    NavigationLink(destination: SessionDetailView(session: session)) {
                      SessionListCellView(session: session)
                    }
                    .id(session.sessionFragment.id)
                  }
                } header: {
                  // Build section title from the first element since they will all be on the same day
                  Text(section.first?.formattedSectionDate ?? "--")
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    .padding(EdgeInsets(top: 8, leading: 0, bottom: 8, trailing: 0))
                    .font(.HostGrotesk.large)
                    .foregroundStyle(Theme.primaryText)
                    .background(Theme.mainBackground)
                }
              }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.all, 16)
          }
          .scrollDisabled(sessionList.isEmpty)

          .onChange(of: scrollToNow) { oldValue, newValue in
            if let scrollIdentifier = scrollIdentifierForNow() {
              withAnimation {
                proxy.scrollTo(scrollIdentifier, anchor: .center)
              }
            }
          }
        }
      }
    }
    .background(Theme.mainBackground)

    .onAppear {
      applyBookmarkFilter(value: bookmarkFilter)
    }
    .onChange(of: bookmarkFilter) { oldValue, newValue in
      applyBookmarkFilter(value: newValue)
    }
  }

  func applyBookmarkFilter(value isFiltered: Bool) {
    guard isFiltered else {
      sessionList = schedule
      return
    }
    
    Task {
      let pendingNotificationRequests = await UNUserNotificationCenter.current().pendingNotificationRequests()

      sessionList = schedule.compactMap { section in
        let filteredSection = section.compactMap { session in
          if pendingNotificationRequests.contains(where: { $0.identifier == session.notificationIdentifier }) {
            return session
          }
          if UserDefaults.standard.object(forKey: session.notificationIdentifier) != nil {
            return session
          }

          return nil
        }

        return filteredSection.isEmpty ? nil : filteredSection
      }
    }
  }

  func scrollIdentifierForNow() -> ID? {
#if DEBUG
    let startDate = sessionList.first?.first?.startDate
    let endDate = sessionList.last?.last?.endDate
    let timeInterval = endDate!.timeIntervalSince1970 - startDate!.timeIntervalSince1970
    let randomOffset = Double.random(in: 0..<timeInterval)
    let now = startDate!.addingTimeInterval(randomOffset)

    let formatter = DateFormatter()
    formatter.locale = DateFormatter.sharedLocale
    formatter.timeZone = DateFormatter.sharedTimezone
    formatter.dateFormat = "yyyy-MM-dd'T'HH:mm"

    print("Now - \(formatter.string(from: now))")
#else
    let now = Date.now
#endif
    var scrollIdentifier = sessionList.first?.first?.sessionFragment.id

    for section in sessionList {
      for session in section {
        if session.startDate <= now {
          scrollIdentifier = session.sessionFragment.id
        }
      }
    }

#if DEBUG
    let session = sessionList.compactMap({ $0.first(where: { $0.sessionFragment.id == scrollIdentifier }) })
    print("Scrolling to session: \(session.first?.sessionFragment.title) with id: \(scrollIdentifier)")
#endif

    return scrollIdentifier
  }
}
