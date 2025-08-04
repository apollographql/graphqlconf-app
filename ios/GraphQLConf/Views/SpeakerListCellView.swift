import SwiftUI
import ConnectorAPI

struct SpeakerListCellView: View {

  let speaker: SpeakerFragment

  var body: some View {
    LazyVStack {
      if let avatarURL = speaker.avatarURL {
        AsyncImage(url: avatarURL) { image in
          image.image?.scaledToFill()
        }
        .frame(alignment: .center)
      }

      VStack(spacing: 0) {
        if let name = speaker.name {
          Text(name)
            .frame(maxWidth: .infinity, alignment: .leading)
            .font(.HostGrotesk.large)
            .foregroundStyle(Theme.primaryText)
        }

        if let workBio = speaker.formattedWorkBio {
          Text(workBio)
            .frame(maxWidth: .infinity, alignment: .leading)
            .font(.HostGrotesk.medium)
            .foregroundStyle(Theme.primaryText)
        }

        Spacer()
      }

      if let about = speaker.about {

      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(.all, 16)
    .background {
      Rectangle()
        .stroke(Theme.cellStroke)
        .fill(Theme.cellBackground)
    }
  }

}
