import SwiftUI
import ConnectorAPI

struct SessionDetailView: View {

  let session: AugmentedSessionFragment

  var body: some View {
    ScrollView {
      VStack {
        if let eventType = session.formattedEventType {
          EventTypeView(eventType: eventType)
        }
        
        Text(session.sessionFragment.title)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .multilineTextAlignment(.leading)
          .font(.HostGrotesk.h3)
          .foregroundStyle(Theme.primaryText)
        Spacer(minLength: 16)

        Text(session.formattedDateTime)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .font(.HostGrotesk.medium)
          .foregroundStyle(Theme.primaryText)
        if let venueName = session.sessionFragment.venue {
          Text(venueName)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .font(.HostGrotesk.medium)
            .foregroundStyle(Theme.primaryText)
        }

        if !session.sessionFragment.description.isEmpty {
          Spacer(minLength: 20)
          Text("Description")
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .font(.HostGrotesk.h3)
            .foregroundStyle(Theme.primaryText)
          Text(session.sessionFragment.description)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .multilineTextAlignment(.leading)
            .font(.HostGrotesk.medium)
            .foregroundStyle(Theme.primaryText)
        }

        if !session.sessionFragment.speakers.isEmpty {
          Spacer(minLength: 20)
          Text("Speakers")
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .font(.HostGrotesk.h3)
            .foregroundStyle(Theme.primaryText)
          LazyVStack(spacing: 0) {
            ForEach(session.sessionFragment.speakers, id: \.username) { speaker in
              SessionDetailSpeakerCellView(speaker: speaker)
            }
          }
        }
      }
      .toolbarRole(.editor)
    }
    .scrollIndicators(.never)
    .padding(.all, 16)
    .background(Theme.mainBackground)
    .toolbarBackground(.visible, for: .navigationBar)
    .toolbarBackground(Theme.navigationBarReverse, for: .navigationBar)
  }
}
