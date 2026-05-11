import SwiftUI
import ConnectorAPI

struct SearchTabView: View {

  @StateObject private var viewModel = SearchViewModel()
  @FocusState private var isTextFieldFocused: Bool

  var body: some View {
    VStack(spacing: 0) {
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

      if #available(iOS 26.0, *) {
        GlassEffectContainer {
          HStack(spacing: 8) {
            TextField("Search sessions and speakers", text: $viewModel.searchText)
              .textFieldStyle(.plain)
              .autocorrectionDisabled()
              .focused($isTextFieldFocused)
              .submitLabel(.search)
              .padding(.horizontal, 12)
              .frame(maxHeight: .infinity)
              .glassEffect(.regular.interactive())

            if isTextFieldFocused || !viewModel.searchText.isEmpty {
              Button {
                viewModel.searchText = ""
                viewModel.search()
                isTextFieldFocused = false
              } label: {
                Image(.close)
                  .frame(maxWidth: 38, maxHeight: 46) // This is not the correct way to be sizing the button content
              }
              .buttonStyle(.glass)
              .clipShape(.circle)
            }
          }
          .frame(height: 60)
          .background(.clear)
          .padding(EdgeInsets(top: 8, leading: 21, bottom: 8, trailing: 21))
        }
        .environment(\.colorScheme, .light)
      } else {
        Divider()
        HStack(spacing: 12) {
          TextField("Search sessions and speakers", text: $viewModel.searchText)
            .textFieldStyle(.roundedBorder)
            .autocorrectionDisabled()
            .focused($isTextFieldFocused)
            .submitLabel(.search)
            .frame(height: 49)

          if isTextFieldFocused || !viewModel.searchText.isEmpty {
            Button {
              viewModel.searchText = ""
              viewModel.search()
              isTextFieldFocused = false
            } label: {
              Image(.close)
                .frame(width: 49, height: 49)
            }
            .foregroundStyle(Theme.tint)
          }
        }
        .padding(.horizontal, 16)
        .background(Theme.mainBackground)
        .environment(\.colorScheme, .light)
      }
    }
    .background(Theme.mainBackground)
    .toolbarBackground(Theme.tabBar, for: .tabBar)
    .toolbarBackground(.visible, for: .tabBar)
    .onChange(of: viewModel.searchText) { _, _ in
      viewModel.search()
    }
    .onAppear {
      if viewModel.searchText.isEmpty {
        isTextFieldFocused = true
      }
    }
    .task {
      await viewModel.fetchData()
    }
  }
}

#Preview {
  SearchTabView()
}
