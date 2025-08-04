import Foundation
import Apollo
import ConnectorAPI

class ScheduleViewModel: ObservableObject {

  @Published var schedule: [[SessionFragment]] = []

  func fetchAllEventsSchedule() async throws {
    do {
      for try await response in try Network.shared.apollo.fetch(
        query: AllEventsScheduleQuery(),
        cachePolicy: .cacheAndNetwork
      ) {
        guard let data = response.data?.schedule_2025 else { return }

        var sections: [String: [SessionFragment]] = [:]
        for session in data.compactMap({ $0.fragments.sessionFragment }) {
          guard let startDate = session.event?.start_date else {
            continue // If the session doesn't have an event or start_date then drop it
          }

          sections[startDate, default: []].append(session)
        }

        let sortedSections = sections.sorted { $0.key < $1.key }
        var sortedSchedule: [[SessionFragment]] = []
        for section in sortedSections {
          sortedSchedule.append(section.value.sorted { session1, session2 in
            if let time1 = session1.event?.start_time_epoch, let time2 = session2.event?.start_time_epoch {
              return time1 < time2
            }

            // Last resort: leave element where it is
            return false
          })
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
