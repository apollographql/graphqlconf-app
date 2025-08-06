import SwiftUI
import ConnectorAPI

struct SpeakerListView: View {

  @Binding var speakers: [SpeakerFragment]

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 16) {
        ForEach(speakers, id: \.self) { speaker in
          NavigationLink(destination: SpeakerDetailView(speaker: speaker)) {
            SpeakerListCellView(speaker: speaker)
          }
        }
      }
      .padding(.all, 16)
    }
    .background(Theme.mainBackground)
  }
}
