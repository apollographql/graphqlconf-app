import Foundation

extension Bundle {
  var venueMapURL: URL {
    return url(forResource: "GraphQL25_Map_082925", withExtension: "pdf")!
  }
}
