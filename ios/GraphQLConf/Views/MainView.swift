import SwiftUI

struct MainView: View {

  enum TabIdentifier {
    case schedule
    case speakers
    case info

    var title: String {
      switch self {
      case .schedule: "Schedule"
      case .speakers: "Speakers"
      case .info: "Info"
      }
    }
  }

  @State private var selectedTab: TabIdentifier = .schedule
  @State private var bookmarkFilter: Bool = false
  @State private var scrollToNow: Bool = false

  var body: some View {
    NavigationStack {
      TabView(selection: self.$selectedTab) {
        ScheduleTabView()
          .tabItem {
            Image(.calendar)
          }
          .tag(TabIdentifier.schedule)

        SpeakersTabView()
          .tabItem {
            Image(.people)
          }
          .tag(TabIdentifier.speakers)

        InfoTabView()
          .tabItem {
            Image(.info)
          }
          .tag(TabIdentifier.info)
      }
      .tint(Theme.tint)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .principal) {
          Text(selectedTab.title)
            .foregroundStyle(Theme.tintReverse)
            .font(.HostGrotesk.navigationTitle)
        }
        if self.selectedTab == .schedule {
          ToolbarItem(placement: .topBarLeading) {
            Button {
              scrollToNow.toggle()
            } label: {
              Image(.clock)
            }
          }
          ToolbarItem(placement: .topBarTrailing) {
            Button {
              bookmarkFilter.toggle()
            } label: {
              Image(bookmarkFilter ? .bookmarkFilled : .bookmark)
            }
          }
        }
      }
      .toolbarBackground(.visible, for: .navigationBar)
      .toolbarBackground(Theme.navigationBarReverse, for: .navigationBar)

      .environment(\.bookmarkFilter, self.bookmarkFilter)
      .environment(\.scrollToNow, self.scrollToNow)
    }
    .tint(Theme.tintReverse)
  }

}

#Preview {
  MainView()
}
