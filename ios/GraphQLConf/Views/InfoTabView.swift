import SwiftUI

struct InfoTabView: View {

  enum InfoLinks: CaseIterable, Identifiable {
    case codeOfConduct
    case privacyPolicy
    case healthAndSafety
    case inclusionAndDiversity
    case graphqlOrg

    var title: String {
      switch self {
      case .codeOfConduct: "Code of conduct"
      case .privacyPolicy: "Privacy policy"
      case .healthAndSafety: "Health & safety"
      case .inclusionAndDiversity: "Inclusion & diversity"
      case .graphqlOrg: "graphql.org"
      }
    }

    var url: URL {
      switch self {
      case .codeOfConduct: URL(string: "https://graphql.org/conf/2025/resources/#code-of-conduct")!
      case .privacyPolicy: URL(string: "https://lfprojects.org/policies/privacy-policy/")!
      case .healthAndSafety: URL(string: "https://graphql.org/conf/2025/resources/#health--safety")!
      case .inclusionAndDiversity: URL(string: "https://graphql.org/conf/2025/resources/#inclusion--accessibility")!
      case .graphqlOrg: URL(string: "https://graphql.org")!
      }
    }

    var id: String { self.title }
  }

  enum SocialLink: CaseIterable, Identifiable {
    case github
    case discord
    case x
    case linkedin
    case youtube
    case facebook

    var image: ImageResource {
      switch self {
      case .github: .github
      case .discord: .discord
      case .x: .X
      case .linkedin: .linkedin
      case .youtube: .youtube
      case .facebook: .facebook
      }
    }

    var url: URL {
      switch self {
      case .github: URL(string: "https://github.com/graphql")!
      case .discord: URL(string: "https://discord.graphql.org/")!
      case .x: URL(string: "https://twitter.com/graphql")!
      case .linkedin: URL(string: "https://linkedin.com/company/graphql-foundation")!
      case .youtube: URL(string: "https://youtube.com/@GraphQLFoundation")!
      case .facebook: URL(string: "https://facebook.com/groups/graphql.community")!
      }
    }

    var id: SocialLink { self }
  }

  @State private var isLicensesPresented = false

  var body: some View {
    VStack {
      ScrollView {
        VStack(spacing: 16) {
          ForEach(InfoLinks.allCases) { link in
            // Using Link is just the quickest path to delivery right now. I tried a web view presented via a sheet
            // but for some reason the content was always the last enum case initialized. Pushing out to Safari is
            // not the best user experience but it was taking too long to debug the sheet web view.
            Link(destination: link.url) {
              InfoCellView(title: link.title)
            }
          }
          InfoCellView(title: "Licenses", hasIndicator: false)
            .onTapGesture {
              isLicensesPresented.toggle()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.all, 16)
      }
      .scrollDisabled(true)

      Spacer()
      HStack {
        ForEach(SocialLink.allCases) { link in
          Link(destination: link.url) {
            Image(link.image)
              .frame(maxWidth: .infinity)
          }
        }
      }
      .foregroundStyle(Theme.tint)
      .frame(maxWidth: .infinity, alignment: .trailing)
      Spacer(minLength: 16)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    .background(Theme.mainBackground)
    .toolbarBackground(Theme.tabBar, for: .tabBar)
    .toolbarBackground(.visible, for: .tabBar)

    .sheet(isPresented: $isLicensesPresented) {
      NavigationStack {
        LicensesView()
          .navigationTitle("Licenses")
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
  }

}

#Preview {
  InfoTabView()
}
