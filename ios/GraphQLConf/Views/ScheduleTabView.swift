import SwiftUI

struct ScheduleTabView: View {

  @StateObject private var viewModel = ScheduleViewModel()

  var body: some View {
    VStack {
      if viewModel.schedule.isEmpty {
        Text("Fetching schedule...")
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          .font(.HostGrotesk.h3)
          .foregroundStyle(Theme.tint)
          .background(.clear)

      } else {
        SessionListView(schedule: $viewModel.schedule)
      }
    }
    .toolbarBackground(Theme.tabBar, for: .tabBar)
    .toolbarBackground(.visible, for: .tabBar)

    .onAppear {
      Task {
        try await viewModel.fetchAllEventsSchedule()
      }
    }
  }

}

#Preview {
  ScheduleTabView()
}
