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
          .sorted { speaker1, speaker2 in
            if let name1 = speaker1.name, let name2 = speaker2.name {
              return name1 < name2
            }

          // Last resort: leave element where it is
          return false
        }
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
