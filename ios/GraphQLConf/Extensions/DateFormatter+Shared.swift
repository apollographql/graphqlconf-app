import Foundation

extension DateFormatter {

  static var sharedTimezone: TimeZone { TimeZone(identifier: "Europe/Amsterdam")! }
  static var sharedLocale: Locale { Locale(identifier: "en_US") }

  static let sharedDateReader: DateFormatter = {
    let formatter = DateFormatter()
    formatter.locale = sharedLocale
    formatter.timeZone = sharedTimezone
    formatter.dateFormat = "yyyy-MM-dd'T'HH:mm"

    return formatter
  }()

  static let sharedDateWriter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.locale = sharedLocale
    formatter.timeZone = sharedTimezone

    return formatter
  }()

}
