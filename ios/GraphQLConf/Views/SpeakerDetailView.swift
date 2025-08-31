import SwiftUI
import ConnectorAPI
import SDWebImageSwiftUI

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
          WebImage(url: avatarURL) { image in
            image
              .resizable()
              .scaledToFill()
              .saturation(0.0)
          } placeholder: {
            ProgressView()
              .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          }
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          .aspectRatio(contentMode: .fill)
          .clipped()
          .overlay(Theme.avatarOverlay)
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
