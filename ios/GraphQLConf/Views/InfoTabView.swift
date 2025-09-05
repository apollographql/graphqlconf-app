import SwiftUI

struct InfoTabView: View {

  enum InfoLink {
    case codeOfConduct
    case privacyPolicy
    case healthAndSafety
    case inclusionAndAccessibility
    case eventResources
    case venueMap
    case graphqlOrg

    var title: String {
      switch self {
      case .codeOfConduct: "Code of Conduct"
      case .privacyPolicy: "Privacy Policy"
      case .healthAndSafety: "Health & Safety"
      case .inclusionAndAccessibility: "Inclusion & Accessibility"
      case .eventResources: "Event Resources"
      case .venueMap: "Venue Map"
      case .graphqlOrg: "graphql.org"
      }
    }

    var url: URL {
      switch self {
      case .codeOfConduct: URL(string: "https://graphql.org/conf/2025/resources/#code-of-conduct")!
      case .privacyPolicy: URL(string: "https://lfprojects.org/policies/privacy-policy/")!
      case .healthAndSafety: URL(string: "https://graphql.org/conf/2025/resources/#health--safety")!
      case .inclusionAndAccessibility: URL(string: "https://graphql.org/conf/2025/resources/#inclusion--accessibility")!
      case .eventResources: URL(string: "http://bit.ly/graphqlconf2025")!
      case .venueMap: Bundle.main.venueMapURL
      case .graphqlOrg: URL(string: "https://graphql.org")!
      }
    }
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

  @State private var isCodeOfConductPresented = false
  @State private var isPrivacyPolicyPresented = false
  @State private var isHealthAndSafetyPresented = false
  @State private var isInclusionAndAccessibilityPresented = false
  @State private var isEventResourcesPresented = false
  @State private var isVenueMapPresented = false
  @State private var isGraphqlOrgPresented = false
  @State private var isLicensesPresented = false

  var body: some View {
    VStack {
      ScrollView {
        VStack(spacing: 12) {
          Section {
            // TODO: This should be using ForEach but I haven't figured out a way to use a single WebViewRepresentable
            // with dynamic URL loading. There were bugs I couldn't resolve in time and this had to ship. If there is
            // time I'll come back to this.
            InfoCellView(title: InfoLink.codeOfConduct.title)
              .onTapGesture {
                isCodeOfConductPresented.toggle()
              }
            InfoCellView(title: InfoLink.privacyPolicy.title)
              .onTapGesture {
                isPrivacyPolicyPresented.toggle()
              }
            InfoCellView(title: InfoLink.healthAndSafety.title)
              .onTapGesture {
                isHealthAndSafetyPresented.toggle()
              }
            InfoCellView(title: InfoLink.inclusionAndAccessibility.title)
              .onTapGesture {
                isInclusionAndAccessibilityPresented.toggle()
              }
            InfoCellView(title: InfoLink.eventResources.title)
              .onTapGesture {
                isEventResourcesPresented.toggle()
              }
            InfoCellView(title: InfoLink.venueMap.title)
              .onTapGesture {
                isVenueMapPresented.toggle()
              }
            InfoCellView(title: InfoLink.graphqlOrg.title)
              .onTapGesture {
                isGraphqlOrgPresented.toggle()
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

    // TODO: Ideally we only have a single sheet with a single WebViewRepresentable instance but there were bugs I
    // could not resolve in time and this app had to be released. If there is time I'll come back to this.
    .sheet(isPresented: $isCodeOfConductPresented) {
      NavigationStack {
        WebViewRepresentable(url: InfoLink.codeOfConduct.url)
          .navigationTitle(InfoLink.codeOfConduct.title)
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
    .sheet(isPresented: $isPrivacyPolicyPresented) {
      NavigationStack {
        WebViewRepresentable(url: InfoLink.privacyPolicy.url)
          .navigationTitle(InfoLink.privacyPolicy.title)
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
    .sheet(isPresented: $isHealthAndSafetyPresented) {
      NavigationStack {
        WebViewRepresentable(url: InfoLink.healthAndSafety.url)
          .navigationTitle(InfoLink.healthAndSafety.title)
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
    .sheet(isPresented: $isInclusionAndAccessibilityPresented) {
      NavigationStack {
        WebViewRepresentable(url: InfoLink.inclusionAndAccessibility.url)
          .navigationTitle(InfoLink.inclusionAndAccessibility.title)
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
    .sheet(isPresented: $isEventResourcesPresented) {
      NavigationStack {
        WebViewRepresentable(url: InfoLink.eventResources.url)
          .navigationTitle(InfoLink.eventResources.title)
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
    .sheet(isPresented: $isVenueMapPresented) {
      NavigationStack {
        WebViewRepresentable(url: InfoLink.venueMap.url)
          .navigationTitle(InfoLink.venueMap.title)
          .navigationBarTitleDisplayMode(.inline)
          .presentationDragIndicator(.visible)
      }
    }
    .sheet(isPresented: $isGraphqlOrgPresented) {
      NavigationStack {
        WebViewRepresentable(url: InfoLink.graphqlOrg.url)
          .navigationTitle(InfoLink.graphqlOrg.title)
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
