import SwiftUI

extension EnvironmentValues {
  /// Used to signal when the session list is being filtered to show only bookmarked sessions.
  @Entry var bookmarkFilter: Bool = false
  /// Used to signal when the user wants to scroll to the current date/time in the session list.
  @Entry var scrollToNow: Bool = false
}
