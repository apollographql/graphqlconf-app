import SwiftUI

struct SponsorsTabView: View {

  @StateObject private var viewModel = SponsorViewModel()

  var body: some View {
    VStack {
      if viewModel.sponsorGroups.isEmpty {
        Text("Fetching sponsors...")
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          .font(.HostGrotesk.h3)
          .foregroundStyle(Theme.tint)
          .background(.clear)

      } else {
        SponsorListView(sponsorGroups: viewModel.sponsorGroups)
      }
    }
    .background(Theme.mainBackground)
    .toolbarBackground(Theme.tabBar, for: .tabBar)
    .toolbarBackground(.visible, for: .tabBar)

    .onAppear {
      Task {
        try await viewModel.fetchSponsorGroups()
      }
    }
  }

}

#Preview {
  SponsorsTabView()
}
