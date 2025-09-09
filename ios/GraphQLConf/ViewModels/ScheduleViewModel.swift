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

#if DEBUG
        let date: Date = .now
        let startDate: Date = Calendar.current.date(byAdding: .minute, value: 12, to: date)!
        let endDate: Date = Calendar.current.date(byAdding: .minute, value: 22, to: date)!

        sortedSchedule.insert(
          contentsOf: [[
            AugmentedSessionFragment(
              sessionFragment: SessionFragment(
                id: UUID().uuidString,
                title: "Debug Event",
                description: "A fake event added to test bookmark notification.",
                start: DateFormatter.sharedDateReader.string(from: startDate),
                end: DateFormatter.sharedDateReader.string(from: endDate),
                event_type: "Debug",
                room: SessionFragment.Room(
                  name: "Home",
                  floor: 0
                ),
                speakers: [
                  SessionFragment.Speaker(
                    id: "calvincestari",
                    name: "Calvin Cestari",
                    about: "",
                    company: "Apollo",
                    position: "Software Engineer",
                    avatar: "",
                    socialUrls: [
                      SessionFragment.Speaker.SocialUrl(
                        service: .case(.linkedIn),
                        url: "https://linkedin.com"
                      )
                    ]
                  )
                ]
              ),
              startDate: startDate,
              endDate: endDate,
            )
          ]],
          at: 0
        )
#endif

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
