import SwiftUI
import ConnectorAPI
import SDWebImageSwiftUI

struct SpeakerDetailView: View {

  let speaker: SpeakerFragment

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

        if !speaker.socialUrls.isEmpty {
          Spacer(minLength: 16)
          HStack(spacing: 0) {
            Spacer().frame(maxWidth: .infinity)
            ForEach(speaker.socialUrls, id: \.self) { socialResource in
              if let url = URL(string: socialResource.url), let image = socialResource.service.value?.image {
                Link(destination: url) {
                  Image(image)
                    .tint(Theme.primaryText)
                    .frame(width: 60, height: 60)
                }
              }
            }
          }
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
