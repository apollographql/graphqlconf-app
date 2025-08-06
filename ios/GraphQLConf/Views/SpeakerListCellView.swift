import SwiftUI
import ConnectorAPI

struct SpeakerListCellView: View {

  let speaker: SpeakerFragment

  // TODO: striped overlay as on web
  // TODO: tappable scroll index by alphabet
  // TODO: "Returning speaker" label (requires 'years' to be populated)

  var body: some View {
    LazyVStack {
      HStack {
        if let avatarURL = speaker.avatarURL {
          AsyncImage(url: avatarURL) { image in
            image.image?
              .resizable()
              .scaledToFill()
              .saturation(0.0)
              .overlay(Theme.avatarOverlay)
          }
            .frame(maxWidth: 96, maxHeight: 96, alignment: .center)
            .aspectRatio(contentMode: .fill)
            .clipped()
        }
        
        VStack(spacing: 6) {
          Text(speaker.name)
            .frame(maxWidth: .infinity, alignment: .leading)
            .font(.HostGrotesk.xlarge)
            .foregroundStyle(Theme.primaryText)
          Text(speaker.formattedWorkBio)
            .frame(maxWidth: .infinity, alignment: .leading)
            .multilineTextAlignment(.leading)
            .font(.HostGrotesk.large)
            .foregroundStyle(Theme.primaryText)
          Spacer()
        }
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(.all, 12)
    .background {
      Rectangle()
        .stroke(Theme.cellStroke)
        .fill(Theme.cellBackground)
    }
  }

}
