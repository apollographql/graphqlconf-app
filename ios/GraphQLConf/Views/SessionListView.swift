import SwiftUI
import ConnectorAPI

struct SessionListView: View {

  /// Master schedule passed from view model whihc is used as the data source for `sessionList`.
  @Binding var schedule: [[AugmentedSessionFragment]]
  /// Used to populate the list with/without any filtering applied.
  @State private(set) var sessionList: [[AugmentedSessionFragment]] = [[]]

  @Environment(\.bookmarkFilter) var bookmarkFilter

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
        ScrollView {
          LazyVStack(spacing: 16, pinnedViews: .sectionHeaders) {
            ForEach(sessionList, id: \.self) { section in
              Section {
                ForEach(section, id: \.self) { session in
                  NavigationLink(destination: SessionDetailView(session: session)) {
                    SessionListCellView(session: session)
                  }
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
          pendingNotificationRequests.contains { notificationRequest in
            notificationRequest.identifier == session.notificationIdentifier
          } ? session : nil
        }

        return filteredSection.isEmpty ? nil : filteredSection
      }
    }
  }
}
