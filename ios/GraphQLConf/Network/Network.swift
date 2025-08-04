import Foundation
import Apollo

class Network {

  static let shared = Network()

  private(set) lazy var apollo: ApolloClient = {
    ApolloClient(url: URL(string: "http://localhost:4000/")!)
  }()
}
