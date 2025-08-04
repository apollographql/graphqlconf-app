import SwiftUI

struct MainView: View {

  var body: some View {
    NavigationStack {
      TabView {
        ScheduleView()
          .tabItem {
            Image(systemName: "clock")
          }

        SpeakerView()
          .tabItem {
            Image(systemName: "person.2")
          }

        AboutView()
          .tabItem {
            Image(systemName: "info.square")
          }
      }
      .tint(Theme.tint)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .principal) {
          Text("GraphQLConf 2025")
            .foregroundStyle(Theme.tintReverse)
            .font(.HostGrotesk.navigationTitle)
        }
      }
      .toolbarBackground(.visible, for: .navigationBar)
      .toolbarBackground(Theme.navigationBarReverse, for: .navigationBar)
    }
    .tint(Theme.tintReverse)
  }

}

#Preview {
  MainView()
}
