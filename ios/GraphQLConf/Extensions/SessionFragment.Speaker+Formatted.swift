import ConnectorAPI

extension SessionFragment.Speaker {
  var formattedWorkBio: String? {
    "\(self.company), \(self.position)"
  }
}
