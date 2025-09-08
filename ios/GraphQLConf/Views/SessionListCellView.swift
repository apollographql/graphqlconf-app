import SwiftUI
import ConnectorAPI

struct SessionListCellView: View {

  let session: AugmentedSessionFragment

  var isPastSession: Bool {
    session.endDate < Date.now
  }

  var body: some View {
    VStack {
      HStack {
        if let eventType = session.formattedEventType {
          EventTypeView(eventType: eventType)
          Spacer()
          BookmarkNotificationView(session: session)
        }
      }

      HStack {
        Text(session.sessionFragment.title)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .multilineTextAlignment(.leading)
          .font(.HostGrotesk.xlarge)
          .foregroundStyle(Theme.primaryText)

        if session.formattedEventType == nil {
          Spacer()
          BookmarkNotificationView(session: session)
        }
      }

      if !session.sessionFragment.speakers.isEmpty {
        Text(session.joinedSpeakers)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .multilineTextAlignment(.leading)
          .font(.HostGrotesk.large)
          .foregroundStyle(Theme.primaryText)
      }

      Spacer(minLength: 16)
      HStack {
        if let venueName = session.formattedVenue {
          Text(venueName)
            .frame(alignment: .leading)
            .multilineTextAlignment(.leading)
            .font(.HostGrotesk.large)
            .foregroundStyle(Theme.primaryText)
        }
        Spacer()
        Text(session.formattedStartEndTime)
          .frame(alignment: .trailing)
          .font(.HostGrotesk.large)
          .foregroundStyle(Theme.primaryText)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(.all, 12)
    .background {
      Rectangle()
        .stroke(Theme.cellStroke)
        .fill(Theme.cellBackground)
    }

    .opacity(self.isPastSession ? 0.5 : 1.0)
  }

}
