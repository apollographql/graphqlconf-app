import Foundation
import Apollo
import ApolloSQLite

class Network {

  static let shared = Network()

  private let url = URL(string: "https://graphqlconf.app/graphql")!

  private(set) lazy var apollo: ApolloClient = {
    do {
      let store: ApolloStore

      if let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first {
        let documentsURL = URL(fileURLWithPath: documentsPath)
        let sqliteFileURL = documentsURL.appendingPathComponent("apollo_db.sqlite")
        let sqliteCache = try SQLiteNormalizedCache(fileURL: sqliteFileURL)
        store = ApolloStore(cache: sqliteCache)

      } else {
        store = ApolloStore(cache: InMemoryNormalizedCache())
      }

      let networkTransport = RequestChainNetworkTransport(
        urlSession: URLSession(configuration: .default),
        interceptorProvider: DefaultInterceptorProvider.shared,
        store: store,
        endpointURL: self.url
      )

      return ApolloClient(networkTransport: networkTransport, store: store)

    } catch {
      // If for any reason we cannot use a persistent cache then move forward without it
      return ApolloClient(url: self.url)
    }
  }()

}
