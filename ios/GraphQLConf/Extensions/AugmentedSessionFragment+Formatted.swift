import Foundation
import ConnectorAPI

extension AugmentedSessionFragment {

  /// All speakers names joined with a comma separator.
  var joinedSpeakers: String {
    self.sessionFragment.speakers.compactMap({ $0.name }).joined(separator: ", ")
  }

  /// Uppercased event type name.
  ///
  /// Note: Some event types are not shown and will return `nil`.
  var formattedEventType: String? {
    let eventType = self.sessionFragment.event_type.uppercased()

    switch eventType {
    case "REGISTRATION + BADGE PICK-UP", "SOLUTIONS SHOWCASE", "UNCONFERENCE":
      return nil
    default:
      return eventType
    }
  }

  /// To be used as the label for the session section. Formatted as `<weekday>, <month> <day>`.
  var formattedSectionDate: String {
    DateFormatter.sharedDateWriter.dateFormat = "EEEE, MMMM dd"
    return DateFormatter.sharedDateWriter.string(from: self.startDate)
  }

  /// Event time formatted as `<start time> - <end time>`
  var formattedStartEndTime: String {
    DateFormatter.sharedDateWriter.dateFormat = "h:mm a"

    let startTimeString = DateFormatter.sharedDateWriter.string(from: self.startDate)
    let endTimeString = DateFormatter.sharedDateWriter.string(from: self.endDate)
    
    return "\(startTimeString) - \(endTimeString)"
  }

  /// Event time formatted as `<month> <day>, <start time> - <end time>`.
  var formattedDateTime: String {
    DateFormatter.sharedDateWriter.dateFormat = "MMMM d"
    let weekdayMonthString = DateFormatter.sharedDateWriter.string(from: self.startDate)

    DateFormatter.sharedDateWriter.dateFormat = "h:mm a"
    let startTimeString = DateFormatter.sharedDateWriter.string(from: self.startDate)
    let endTimeString = DateFormatter.sharedDateWriter.string(from: self.endDate)

    return "\(weekdayMonthString), \(startTimeString) - \(endTimeString)"
  }

  /// Event start time.
  var formattedStartTime: String {
    DateFormatter.sharedDateWriter.dateFormat = "h:mm a"
    return DateFormatter.sharedDateWriter.string(from: self.startDate)
  }

  /// Notification date calculated as 10 minutes before the startDate.
  var notificationDate: Date? {
    Calendar.current.date(byAdding: .minute, value: -10, to: self.startDate)
  }

  /// Identifier used when requesting a local notification.
  var notificationIdentifier: String {
    sessionFragment.id
  }

}
