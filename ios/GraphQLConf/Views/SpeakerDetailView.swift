import SwiftUI
import ConnectorAPI

struct SpeakerDetailView: View {

  let speaker: SpeakerFragment

  // TODO: striped overlay as on web
  // TODO: "Returning speaker" label (requires 'years' to be populated)
  // TODO: Sessions list

  var body: some View {
    ScrollView {
      VStack {
        Text(speaker.name)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .multilineTextAlignment(.leading)
          .font(.HostGrotesk.h3)
          .foregroundStyle(Theme.primaryText)

        Text(speaker.formattedWorkBio)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .multilineTextAlignment(.leading)
          .font(.HostGrotesk.large)
          .foregroundStyle(Theme.primaryText)

        if let avatarURL = speaker.avatarURL {
          AsyncImage(url: avatarURL) { image in
            image.image?
              .resizable()
              .scaledToFill()
              .saturation(0.0)
              .overlay(Theme.avatarOverlay)
          }
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          .aspectRatio(contentMode: .fill)
          .clipped()
        }

        if !speaker.about.isEmpty {
          Text(speaker.about)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .multilineTextAlignment(.leading)
            .font(.HostGrotesk.large)
            .foregroundStyle(Theme.primaryText)
        }
      }
      .toolbarRole(.editor)
    }
    .scrollIndicators(.never)
    .padding(.all, 16)
    .background(Theme.mainBackground)
    .toolbarBackground(.visible, for: .navigationBar)
    .toolbarBackground(Theme.navigationBarReverse, for: .navigationBar)
  }
}
