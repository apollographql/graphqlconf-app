import ConnectorAPI

extension SessionFragment {

  /// Name of the session otherwise a placeholder if `name` is `null`.
  var formattedName: String {
    self.name ?? "To be Announced"
  }

  /// All speakers names joined with a comma separator.
  var joinedSpeakers: String? {
    self.speakers?.compactMap({ $0.name }).joined(separator: ", ")
  }

  /// Event start formatted as `<month> <day>, <start time> - <end time>`
  var formattedDateTime: String? {
    var dateTime: String = ""

    if let month = self.event?.start_month, let day = self.event?.start_day {
      dateTime.append("\(month) \(day)")
    }
    if let startTime = self.event?.start_time, let endTime = self.event?.end_time {
      if !dateTime.isEmpty {
        dateTime.append(", ")
      }
      dateTime.append("\(startTime) - \(endTime)")
    }

    return dateTime.isEmpty ? nil : dateTime
  }

  /// Uppercased event type name.
  ///
  /// Note: Some event types are not shown and will return `nil`.
  var formattedEventType: String? {
    guard let eventType = self.event?.type?.uppercased() else {
      return nil
    }

    switch eventType {
    case "REGISTRATION + BADGE PICK-UP", "SOLUTIONS SHOWCASE", "UNCONFERENCE":
      return nil
    default:
      return eventType
    }
  }

  /// To be used as the label for the session section. Formatted as `<weekday>, <month> <day>`.
  var formattedSectionDate: String {
    if let weekDay = self.event?.start_weekday, let month = self.event?.start_month, let day = self.event?.start_day {
      return "\(weekDay), \(month) \(day)"
    }

    if let startDate = self.event?.start_date {
      return startDate
    }

    return "--"
  }

}
