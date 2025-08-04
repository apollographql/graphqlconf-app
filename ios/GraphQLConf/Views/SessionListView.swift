import SwiftUI
import ConnectorAPI

struct SessionListView: View {

  @Binding var schedule: [[SessionFragment]]

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 16, pinnedViews: .sectionHeaders) {
        ForEach(schedule, id: \.self) { section in
          Section {
            ForEach(section) { session in
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
      .padding(.all, 16)
    }
    .background(Theme.mainBackground)
  }
}
