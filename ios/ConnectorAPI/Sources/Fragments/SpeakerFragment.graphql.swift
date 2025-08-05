// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct SpeakerFragment: ConnectorAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment SpeakerFragment on Speaker { __typename username name about company position avatar years }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Speaker }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("username", String.self),
    .field("name", String.self),
    .field("about", String.self),
    .field("company", String.self),
    .field("position", String.self),
    .field("avatar", String.self),
    .field("years", [Int].self),
  ] }

  public var username: String { __data["username"] }
  public var name: String { __data["name"] }
  public var about: String { __data["about"] }
  public var company: String { __data["company"] }
  public var position: String { __data["position"] }
  public var avatar: String { __data["avatar"] }
  public var years: [Int] { __data["years"] }

  public init(
    username: String,
    name: String,
    about: String,
    company: String,
    position: String,
    avatar: String,
    years: [Int]
  ) {
    self.init(_dataDict: DataDict(
      data: [
        "__typename": ConnectorAPI.Objects.Speaker.typename,
        "username": username,
        "name": name,
        "about": about,
        "company": company,
        "position": position,
        "avatar": avatar,
        "years": years,
      ],
      fulfilledFragments: [
        ObjectIdentifier(SpeakerFragment.self)
      ]
    ))
  }
}
