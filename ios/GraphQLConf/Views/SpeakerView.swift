import SwiftUI

struct SpeakerView: View {

  @StateObject private var viewModel = SpeakerViewModel()

  var body: some View {
    VStack {
      if viewModel.speakers.isEmpty {
        Text("Fetching speakers...")
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          .font(.HostGrotesk.h3)
          .foregroundStyle(Theme.tint)
          .background(.clear)

      } else {
        SpeakerListView(speakers: $viewModel.speakers)
      }
    }
    .toolbarBackground(Theme.tabBar, for: .tabBar)
    .toolbarBackground(.visible, for: .tabBar)

    .onAppear {
      Task {
        try await viewModel.fetchAllSpeakers()
      }
    }

  }

}

#Preview {
  SpeakerView()
}
