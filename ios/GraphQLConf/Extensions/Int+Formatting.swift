import Foundation

private extension NumberFormatter {
  static var ordinalFormatter: NumberFormatter {
    let formatter = NumberFormatter()
    formatter.numberStyle = .ordinal

    return formatter
  }
}

extension Int {
  var ordinal: String {
    guard self != 0 else { return "Ground" }

    return NumberFormatter.ordinalFormatter.string(from: NSNumber(value: self)) ?? ""
  }
}
