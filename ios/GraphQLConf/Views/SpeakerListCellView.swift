import SwiftUI
import ConnectorAPI
import SDWebImageSwiftUI

struct SpeakerListCellView: View {

  let speaker: SpeakerFragment

  // TODO: tappable scroll index by alphabet

  var body: some View {
    LazyVStack {
      HStack {
        if let avatarURL = speaker.avatarURL {
          WebImage(url: avatarURL) { image in
            image
              .resizable()
              .scaledToFill()
              .saturation(0.0)
          } placeholder: {
            ProgressView()
              .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          }
            .frame(maxWidth: 96, maxHeight: 96, alignment: .center)
            .aspectRatio(contentMode: .fill)
            .clipped()
            .overlay(Theme.avatarOverlay)
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
