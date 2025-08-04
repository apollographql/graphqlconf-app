import SwiftUI
import ConnectorAPI

struct SessionListCellView: View {

  let session: SessionFragment

  var body: some View {
    VStack {
      if let eventType = session.formattedEventType {
        EventTypeView(eventType: eventType)
      }

      Text(session.formattedName)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .multilineTextAlignment(.leading)
        .font(.HostGrotesk.large)
        .foregroundStyle(Theme.primaryText)

      if let speakers = session.speakers?.compactMap({ $0.name }) {
        Text(speakers.joined(separator: ", "))
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .font(.HostGrotesk.medium)
          .foregroundStyle(Theme.primaryText)
      }

      if session.venue?.name != nil || (session.event?.start_time != nil && session.event?.end_time != nil) {
        Spacer(minLength: 16)
        HStack {
          if let venueName = session.venue?.name {
            Text(venueName)
              .frame(alignment: .leading)
              .font(.HostGrotesk.medium)
              .foregroundStyle(Theme.primaryText)
          }
          Spacer()
          if let startTime = session.event?.start_time, let endTime = session.event?.end_time {
            Text("\(startTime) - \(endTime)")
              .frame(alignment: .trailing)
              .font(.HostGrotesk.medium)
              .foregroundStyle(Theme.primaryText)
          }
        }
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(.all, 16)
    .background {
      Rectangle()
        .stroke(Theme.cellStroke)
        .fill(Theme.cellBackground)
    }
  }

}
