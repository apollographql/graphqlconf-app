import SwiftUI
import ConnectorAPI

struct SessionDetailSpeakerCellView: View {

  let speaker: SessionFragment.Speaker

  var body: some View {
    VStack {
      Text(speaker.formattedName)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .font(.HostGrotesk.xxlarge)
        .foregroundStyle(Theme.primaryText)

      if let workBio = speaker.workBio {
        Text(workBio)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .font(.HostGrotesk.medium)
          .foregroundStyle(Theme.primaryText)
      }
    }
    // Without this maxWidth the VStack pushed beyond the horizontal bounds and the vertical cell strokes are hidden.
    // I can't figure out why but I'm not wasting any more time on it - this 'fixes' it.
    .frame(maxWidth: UIScreen.main.bounds.width - 58, maxHeight: .infinity, alignment: .center)
    .padding(.all, 12)
    .background {
      Rectangle()
        .stroke(Theme.cellStroke)
        .fill(Theme.cellBackground)
    }
  }
  
}
