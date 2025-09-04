import SwiftUI
import ConnectorAPI

extension SocialService {

  var image: ImageResource {
    switch self {
    case .facebook: .facebook
    case .instagram: .instagram
    case .linkedIn: .linkedin
    case .twitter: .X
    case .other: .info
    }
  }

}
