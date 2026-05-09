import SwiftUI

struct InfoTabView: View {

  enum InfoLink: Identifiable {
    case codeOfConduct
    case privacyPolicy
    case healthAndSafety
    case inclusionAndAccessibility
//    case eventResources
//    case venueMap
    case graphqlOrg

    var id: Self { self }

    var title: String {
      switch self {
      case .codeOfConduct: "Code of Conduct"
      case .privacyPolicy: "Privacy Policy"
      case .healthAndSafety: "Health & Safety"
      case .inclusionAndAccessibility: "Inclusion & Accessibility"
//      case .eventResources: "Event Resources"
//      case .venueMap: "Venue Map"
      case .graphqlOrg: "graphql.org"
      }
    }

    var url: URL {
      switch self {
      case .codeOfConduct: URL(string: "https://graphql.org/conf/2026/resources/#code-of-conduct")!
      case .privacyPolicy: URL(string: "https://lfprojects.org/policies/privacy-policy/")!
      case .healthAndSafety: URL(string: "https://graphql.org/conf/2026/resources/#health--safety")!
      case .inclusionAndAccessibility: URL(string: "https://graphql.org/conf/2026/resources/#inclusion--accessibility")!
//      case .eventResources: URL(string: "http://bit.ly/graphqlconf2026")!
//      case .venueMap: Bundle.main.venueMapURL
      case .graphqlOrg: URL(string: "https://graphql.org")!
      }
    }

    static let allLinks: [InfoLink] = [
      .codeOfConduct, .privacyPolicy, .healthAndSafety, .inclusionAndAccessibility, /*.eventResources, .venueMap,*/ .graphqlOrg
    ]
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

  private let licenseTitle: String = "License Attribution"

  @State private var presentedInfoLink: InfoLink?
  @State private var isLicensesPresented = false

  var body: some View {
    VStack {
      ScrollView {
        VStack(spacing: 12) {
          Section {
            ForEach(InfoLink.allLinks) { link in
              InfoCellView(title: link.title)
                .onTapGesture {
                  presentedInfoLink = link
                }
            }
          }

          Section {
            InfoCellView(title: licenseTitle)
              .onTapGesture {
                isLicensesPresented.toggle()
              }
          } header: {
            Text(" ")
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

    .sheet(item: $presentedInfoLink) { link in
      NavigationStack {
        WebViewRepresentable(url: link.url)
          .navigationTitle(link.title)
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
    .sheet(isPresented: $isLicensesPresented) {
      NavigationStack {
        LicensesView()
          .navigationTitle(licenseTitle)
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
  }

}

#Preview {
  InfoTabView()
}
