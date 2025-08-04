import ConnectorAPI

extension SessionFragment.Speaker {
  var formattedName: String {
    self.name ?? "Speaker"
  }

  var workBio: String? {
    var result: String = ""

    if let company = self.company {
      result.append(company)
    }
    if let position = self.position {
      if !result.isEmpty {
        result.append(", ")
      }
      result.append(position)
    }

    return result.isEmpty ? nil : result
  }
}
