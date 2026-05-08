import Foundation
import Apollo
import ConnectorAPI

class SponsorViewModel: ObservableObject {

  @Published var sponsorGroups: [GetSponsorGroupsQuery.Data.SponsorGroup] = []

  func fetchSponsorGroups() async throws {
    do {
      for try await response in try Network.shared.apollo.fetch(
        query: GetSponsorGroupsQuery(),
        cachePolicy: .cacheAndNetwork
      ) {
        guard let data = response.data?.sponsorGroups else { return }

        let sendableGroups = data
        await MainActor.run {
          self.sponsorGroups = sendableGroups
        }
      }

    } catch {
      #warning("Handle error!")
    }
  }
}
