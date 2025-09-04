// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct SpeakerFragment: ConnectorAPI.SelectionSet, Fragment, Identifiable {
  public static var fragmentDefinition: StaticString {
    #"fragment SpeakerFragment on Speaker { __typename id name about company position avatar socialUrls { __typename service url } }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Speaker }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", ConnectorAPI.ID.self),
    .field("name", String.self),
    .field("about", String.self),
    .field("company", String.self),
    .field("position", String.self),
    .field("avatar", String.self),
    .field("socialUrls", [SocialUrl].self),
  ] }

  public var id: ConnectorAPI.ID { __data["id"] }
  public var name: String { __data["name"] }
  public var about: String { __data["about"] }
  public var company: String { __data["company"] }
  public var position: String { __data["position"] }
  public var avatar: String { __data["avatar"] }
  public var socialUrls: [SocialUrl] { __data["socialUrls"] }

  public init(
    id: ConnectorAPI.ID,
    name: String,
    about: String,
    company: String,
    position: String,
    avatar: String,
    socialUrls: [SocialUrl]
  ) {
    self.init(_dataDict: DataDict(
      data: [
        "__typename": ConnectorAPI.Objects.Speaker.typename,
        "id": id,
        "name": name,
        "about": about,
        "company": company,
        "position": position,
        "avatar": avatar,
        "socialUrls": socialUrls._fieldData,
      ],
      fulfilledFragments: [
        ObjectIdentifier(SpeakerFragment.self)
      ]
    ))
  }

  /// SocialUrl
  ///
  /// Parent Type: `SocialUrl`
  public struct SocialUrl: ConnectorAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.SocialUrl }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("service", GraphQLEnum<ConnectorAPI.SocialService>.self),
      .field("url", String.self),
    ] }

    public var service: GraphQLEnum<ConnectorAPI.SocialService> { __data["service"] }
    public var url: String { __data["url"] }

    public init(
      service: GraphQLEnum<ConnectorAPI.SocialService>,
      url: String
    ) {
      self.init(_dataDict: DataDict(
        data: [
          "__typename": ConnectorAPI.Objects.SocialUrl.typename,
          "service": service,
          "url": url,
        ],
        fulfilledFragments: [
          ObjectIdentifier(SpeakerFragment.SocialUrl.self)
        ]
      ))
    }
  }
}
