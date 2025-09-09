import Foundation
import Apollo
import ConnectorAPI

/// A `SessionFragment` with the stringly-typed `start` and `end` dates converted into `Date` values.
struct AugmentedSessionFragment: Hashable {
  let sessionFragment: SessionFragment
  let startDate: Date
  let endDate: Date
}

class ScheduleViewModel: ObservableObject {

  @Published var schedule: [[AugmentedSessionFragment]] = []

  func fetchAllEventsSchedule() async throws {
    do {
      for try await response in try Network.shared.apollo.fetch(
        query: AllSessionsQuery(),
        cachePolicy: .cacheAndNetwork
      ) {
        guard let sessions = response.data?.sessions else { return }

        DateFormatter.sharedDateWriter.dateFormat = "yyyy-MM-dd"

        var sections: [String: [AugmentedSessionFragment]] = [:]
        for session in sessions.compactMap({ $0.fragments.sessionFragment }) {
          if session.title.lowercased().contains("canal cruise") {
            continue // Manually remove the 'Canal Cruise' event.
          }

          guard
            let startDate = DateFormatter.sharedDateReader.date(from: session.start),
            let endDate = DateFormatter.sharedDateReader.date(from: session.end)
          else {
            continue // Nuclear option: If the dates cannot be parsed then drop the session
          }

          let sectionDate = DateFormatter.sharedDateWriter.string(from: startDate)
          sections[sectionDate, default: []].append(
            AugmentedSessionFragment(sessionFragment: session, startDate: startDate, endDate: endDate)
          )
        }

        let sortedSections = sections.sorted { $0.key < $1.key }
        var sortedSchedule: [[AugmentedSessionFragment]] = []
        for section in sortedSections {
          sortedSchedule.append(section.value.sorted { $0.startDate < $1.startDate })
        }

        let sendableSchedule = sortedSchedule

        await MainActor.run {
          self.schedule = sendableSchedule
        }
      }

    } catch {
      #warning("Handle error!")
    }
  }
}
