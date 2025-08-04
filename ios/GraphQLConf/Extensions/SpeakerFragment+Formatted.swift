import Foundation
import ConnectorAPI

extension SpeakerFragment {

  var formattedWorkBio: String? {
    var result: String = ""

    if let company = self.company {
      result.append(company)
    }
    if let position = self.position {
      if !result.isEmpty {
        result.append(", ")
      }
      result.append(position)
    }

    return result.isEmpty ? nil : result
  }

  var avatarURL: URL? {
    guard let url = self.avatar else { return nil }

    if url.hasPrefix("//") {
      return URL(string: "https:" + url)
    }

    return URL(string: url)
  }

}
