import SwiftUI

struct InfoCellView: View {

  let title: String
  var hasIndicator: Bool = false

  var body: some View {
    HStack {
      Text(self.title)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .multilineTextAlignment(.leading)
        .font(.HostGrotesk.xlarge)
        .foregroundStyle(Theme.primaryText)

      Spacer()

      if hasIndicator {
        Image(.rightArrow)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(.all, 12)
    .background {
      Rectangle()
        .stroke(Theme.cellStroke)
        .fill(Theme.cellBackground)
    }
  }

}

#Preview {
  InfoCellView(title: "Preview Text")
}
