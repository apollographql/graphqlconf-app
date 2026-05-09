import SwiftUI
import ConnectorAPI

struct SearchTabView: View {

  @StateObject private var viewModel = SearchViewModel()

  var body: some View {
    VStack {
      TextField("Search sessions and speakers", text: $viewModel.searchText)
        .textFieldStyle(.roundedBorder)
        .autocorrectionDisabled()
        .padding(EdgeInsets(top: 16, leading: 16, bottom: 0, trailing: 16))

        .onChange(of: viewModel.searchText) { _, _ in
          viewModel.search()
        }

      if viewModel.searchText.isEmpty {
        Spacer()

      } else if !viewModel.hasResults {
        Text("No results found")
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          .font(.HostGrotesk.h3)
          .foregroundStyle(Theme.tint)

      } else {
        ScrollView {
          LazyVStack(spacing: 16, pinnedViews: .sectionHeaders) {
            if !viewModel.sessionResults.isEmpty {
              Section {
                ForEach(viewModel.sessionResults, id: \.sessionFragment.id) { session in
                  NavigationLink(destination: SessionDetailView(session: session)) {
                    SessionListCellView(session: session)
                  }
                }
              } header: {
                Text("Sessions")
                  .frame(maxWidth: .infinity, alignment: .leading)
                  .padding(EdgeInsets(top: 8, leading: 0, bottom: 8, trailing: 0))
                  .font(.HostGrotesk.h3)
                  .foregroundStyle(Theme.primaryText)
                  .background(Theme.mainBackground)
              }
            }

            if !viewModel.speakerResults.isEmpty {
              Section {
                ForEach(viewModel.speakerResults, id: \.id) { speaker in
                  NavigationLink(destination: SpeakerDetailView(speaker: speaker)) {
                    SpeakerListCellView(speaker: speaker)
                  }
                }
              } header: {
                Text("Speakers")
                  .frame(maxWidth: .infinity, alignment: .leading)
                  .padding(EdgeInsets(top: 8, leading: 0, bottom: 8, trailing: 0))
                  .font(.HostGrotesk.h3)
                  .foregroundStyle(Theme.primaryText)
                  .background(Theme.mainBackground)
              }
            }
          }
          .padding(EdgeInsets(top: 8, leading: 16, bottom: 16, trailing: 16))
        }
      }
    }
    .background(Theme.mainBackground)
    .toolbarBackground(Theme.tabBar, for: .tabBar)
    .toolbarBackground(.visible, for: .tabBar)

    .onAppear {
      Task {
        await viewModel.fetchDataIfNeeded()
      }
    }
  }
}

#Preview {
  SearchTabView()
}
