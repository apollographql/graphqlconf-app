// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct SessionFragment: ConnectorAPI.SelectionSet, Fragment, Identifiable {
  public static var fragmentDefinition: StaticString {
    #"fragment SessionFragment on Session { __typename id title description start end event_type venue speakers { __typename username name company position avatar } }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Session }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", String.self),
    .field("title", String.self),
    .field("description", String.self),
    .field("start", ConnectorAPI.LocalDateTime.self),
    .field("end", ConnectorAPI.LocalDateTime.self),
    .field("event_type", String.self),
    .field("venue", String?.self),
    .field("speakers", [Speaker].self),
  ] }

  public var id: String { __data["id"] }
  public var title: String { __data["title"] }
  public var description: String { __data["description"] }
  public var start: ConnectorAPI.LocalDateTime { __data["start"] }
  public var end: ConnectorAPI.LocalDateTime { __data["end"] }
  public var event_type: String { __data["event_type"] }
  public var venue: String? { __data["venue"] }
  public var speakers: [Speaker] { __data["speakers"] }

  public init(
    id: String,
    title: String,
    description: String,
    start: ConnectorAPI.LocalDateTime,
    end: ConnectorAPI.LocalDateTime,
    event_type: String,
    venue: String? = nil,
    speakers: [Speaker]
  ) {
    self.init(_dataDict: DataDict(
      data: [
        "__typename": ConnectorAPI.Objects.Session.typename,
        "id": id,
        "title": title,
        "description": description,
        "start": start,
        "end": end,
        "event_type": event_type,
        "venue": venue,
        "speakers": speakers._fieldData,
      ],
      fulfilledFragments: [
        ObjectIdentifier(SessionFragment.self)
      ]
    ))
  }

  /// Speaker
  ///
  /// Parent Type: `Speaker`
  public struct Speaker: ConnectorAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Speaker }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("username", String.self),
      .field("name", String.self),
      .field("company", String.self),
      .field("position", String.self),
      .field("avatar", String.self),
    ] }

    public var username: String { __data["username"] }
    public var name: String { __data["name"] }
    public var company: String { __data["company"] }
    public var position: String { __data["position"] }
    public var avatar: String { __data["avatar"] }

    public init(
      username: String,
      name: String,
      company: String,
      position: String,
      avatar: String
    ) {
      self.init(_dataDict: DataDict(
        data: [
          "__typename": ConnectorAPI.Objects.Speaker.typename,
          "username": username,
          "name": name,
          "company": company,
          "position": position,
          "avatar": avatar,
        ],
        fulfilledFragments: [
          ObjectIdentifier(SessionFragment.Speaker.self)
        ]
      ))
    }
  }
}
