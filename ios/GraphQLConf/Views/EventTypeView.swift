import SwiftUI

struct EventTypeView: View {

  enum Style {
    case fill
    case stroke
  }

  let eventType: String

  var body: some View {
    HStack {
      Text(eventType)
        .frame(alignment: .leading)
        .font(.HostGrotesk.small)
        .foregroundStyle(Theme.primaryText)
        .padding(EdgeInsets(top: 2, leading: 6, bottom: 2, trailing: 6))
        .background {
          Rectangle()
            .stroke(eventTypeColor(for: eventType, style: .stroke))
            .fill(eventTypeColor(for: eventType, style: .fill))
        }
      Spacer()
    }
  }

  fileprivate func eventTypeColor(for eventType: String, style: Style) -> Color {
    let color = EventTypeColorMap.colors[eventType] ?? EventTypeColorMap.default

    switch style {
    case .fill: return color.opacity(0.25)
    case .stroke: return color
    }
  }

}
