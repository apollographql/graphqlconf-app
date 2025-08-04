import SwiftUI
import ConnectorAPI

struct SessionDetailView: View {

  let session: SessionFragment
  
  var body: some View {
    ScrollView {
      VStack {
        if let eventType = session.formattedEventType {
          EventTypeView(eventType: eventType)
        }
        
        Text(session.formattedName)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
          .multilineTextAlignment(.leading)
          .font(.HostGrotesk.h3)
          .foregroundStyle(Theme.primaryText)
        Spacer(minLength: 16)

        if let dateTime = session.formattedDateTime {
          Text(dateTime)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .font(.HostGrotesk.medium)
            .foregroundStyle(Theme.primaryText)
        }
        if let venueName = session.venue?.name {
          Text(venueName)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .font(.HostGrotesk.medium)
            .foregroundStyle(Theme.primaryText)
        }

        if let description = session.description, !description.isEmpty {
          Spacer(minLength: 20)
          Text("Description")
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .font(.HostGrotesk.h3)
            .foregroundStyle(Theme.primaryText)
          Text(description)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .multilineTextAlignment(.leading)
            .font(.HostGrotesk.medium)
            .foregroundStyle(Theme.primaryText)
        }

        if let speakers = session.speakers {
          Spacer(minLength: 20)
          Text("Speakers")
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .font(.HostGrotesk.h3)
            .foregroundStyle(Theme.primaryText)
          LazyVStack(spacing: 0) {
            ForEach(speakers, id: \.username) { speaker in
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
