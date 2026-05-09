import Foundation
import Apollo
import ConnectorAPI

class SearchViewModel: ObservableObject {

  @Published var sessionResults: [AugmentedSessionFragment] = []
  @Published var speakerResults: [SpeakerFragment] = []
  @Published var searchText: String = ""

  private var sessions: [AugmentedSessionFragment] = []
  private var speakers: [SpeakerFragment] = []

  func fetchData() async {
    async let sessionsResult: Void = fetchSessions()
    async let speakersResult: Void = fetchSpeakers()
    _ = await (sessionsResult, speakersResult)
  }

  var hasResults: Bool {
    !sessionResults.isEmpty || !speakerResults.isEmpty
  }

  func search() {
    let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

    guard !query.isEmpty else {
      sessionResults = []
      speakerResults = []
      return
    }

    sessionResults = sessions.filter { session in
      let fragment = session.sessionFragment
      return fragment.title.lowercased().contains(query) ||
          fragment.description.lowercased().contains(query) ||
          fragment.event_type.lowercased().contains(query) ||
          fragment.speakers.contains(where: { $0.name.lowercased().contains(query) })
    }

    speakerResults = speakers.filter { speaker in
      speaker.name.lowercased().contains(query) ||
          speaker.company.lowercased().contains(query) ||
          speaker.position.lowercased().contains(query) ||
          speaker.about.lowercased().contains(query)
    }
  }

  private func fetchSessions() async {
    do {
      for try await response in try Network.shared.apollo.fetch(
        query: AllSessionsQuery(),
        cachePolicy: .cacheAndNetwork
      ) {
        guard let data = response.data?.sessions else { return }

        var allSessions: [AugmentedSessionFragment] = []
        for session in data.compactMap({ $0.fragments.sessionFragment }) {
          guard
            let startDate = DateFormatter.sharedDateReader.date(from: session.start),
            let endDate = DateFormatter.sharedDateReader.date(from: session.end)
          else { continue }

          allSessions.append(
            AugmentedSessionFragment(sessionFragment: session, startDate: startDate, endDate: endDate)
          )
        }

        sessions = allSessions.sorted { $0.startDate < $1.startDate }
        await MainActor.run { search() }
      }
    } catch {}
  }

  private func fetchSpeakers() async {
    do {
      for try await response in try Network.shared.apollo.fetch(
        query: AllSpeakersQuery(),
        cachePolicy: .cacheAndNetwork
      ) {
        guard let data = response.data?.speakers else { return }

        speakers = data.compactMap({ $0.fragments.speakerFragment })
          .sorted { $0.name < $1.name }
        await MainActor.run { search() }
      }
    } catch {}
  }
}
