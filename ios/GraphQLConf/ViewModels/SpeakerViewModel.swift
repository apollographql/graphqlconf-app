import Foundation
import Apollo
import ConnectorAPI

class SpeakerViewModel: ObservableObject {

  @Published var speakers: [SpeakerFragment] = []

  func fetchAllSpeakers() async throws {
    do {
      for try await response in try Network.shared.apollo.fetch(
        query: AllSpeakersQuery(),
        cachePolicy: .cacheAndNetwork
      ) {
        guard let data = response.data?.speakers else { return }

        let sortedSpeakers = data.compactMap({ $0.fragments.speakerFragment })
          .sorted { $0.name < $1.name }
        let sendableSpeakers = sortedSpeakers

        await MainActor.run {
          self.speakers = sendableSpeakers
        }
      }

    } catch {
      #warning("Handle error!")
    }
  }
}
