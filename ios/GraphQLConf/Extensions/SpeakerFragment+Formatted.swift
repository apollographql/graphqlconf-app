import Foundation
import ConnectorAPI

extension SpeakerFragment {

  var formattedWorkBio: String {
    "\(self.company), \(self.position)"
  }

  var avatarURL: URL? {
    if avatar.hasPrefix("//") {
      return URL(string: "https:" + avatar)
    }

    return URL(string: avatar)
  }

}
