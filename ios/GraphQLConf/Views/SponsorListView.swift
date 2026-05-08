import SwiftUI
import ConnectorAPI
import SDWebImageSwiftUI

struct SponsorListView: View {

  let sponsorGroups: [GetSponsorGroupsQuery.Data.SponsorGroup]

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 16, pinnedViews: .sectionHeaders) {
        ForEach(sponsorGroups, id: \.name) { group in
          Section {
            LazyVStack(spacing: 0) {
              ForEach(group.sponsors, id: \.name) { sponsor in
                sponsorLogo(sponsor: sponsor)
              }
            }
          } header: {
            Text(group.name)
              .frame(maxWidth: .infinity, alignment: .center)
              .padding(EdgeInsets(top: 8, leading: 0, bottom: 8, trailing: 0))
              .font(.HostGrotesk.h3)
              .foregroundStyle(Theme.primaryText)
              .background(Theme.mainBackground)
          }
        }
      }
      .padding(.all, 16)
    }
    .background(Theme.mainBackground)
  }

  private func sponsorLogo(sponsor: GetSponsorGroupsQuery.Data.SponsorGroup.Sponsor) -> some View {
    return WebImage(url: URL(string: sponsor.logoLight)) { image in
      image
        .resizable()
        .scaledToFit()
    } placeholder: {
      ProgressView()
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    }
    .frame(maxWidth: .infinity)
  }
}
