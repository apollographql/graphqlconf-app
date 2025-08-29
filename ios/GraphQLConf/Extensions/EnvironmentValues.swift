import SwiftUI

extension EnvironmentValues {
  /// Used to signal when the session list is being filtered to show only bookmarked sessions.
  @Entry var bookmarkFilter: Bool = false
}
