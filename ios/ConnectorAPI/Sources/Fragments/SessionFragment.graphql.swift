// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct SessionFragment: ConnectorAPI.SelectionSet, Fragment, Identifiable {
  public static var fragmentDefinition: StaticString {
    #"fragment SessionFragment on Session { __typename id title description start end event_type venue speakers { __typename ...SpeakerFragment } }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Session }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", ConnectorAPI.ID.self),
    .field("title", String.self),
    .field("description", String.self),
    .field("start", ConnectorAPI.LocalDateTime.self),
    .field("end", ConnectorAPI.LocalDateTime.self),
    .field("event_type", String.self),
    .field("venue", String?.self),
    .field("speakers", [Speaker].self),
  ] }

  public var id: ConnectorAPI.ID { __data["id"] }
  public var title: String { __data["title"] }
  public var description: String { __data["description"] }
  public var start: ConnectorAPI.LocalDateTime { __data["start"] }
  public var end: ConnectorAPI.LocalDateTime { __data["end"] }
  public var event_type: String { __data["event_type"] }
  @available(*, deprecated, message: "Use room instead")
  public var venue: String? { __data["venue"] }
  public var speakers: [Speaker] { __data["speakers"] }

  public init(
    id: ConnectorAPI.ID,
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
  public struct Speaker: ConnectorAPI.SelectionSet, Identifiable {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Speaker }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .fragment(SpeakerFragment.self),
    ] }

    public var id: ConnectorAPI.ID { __data["id"] }
    public var name: String { __data["name"] }
    public var about: String { __data["about"] }
    public var company: String { __data["company"] }
    public var position: String { __data["position"] }
    public var avatar: String { __data["avatar"] }
    public var years: [Int] { __data["years"] }

    public struct Fragments: FragmentContainer {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public var speakerFragment: SpeakerFragment { _toFragment() }
    }

    public init(
      id: ConnectorAPI.ID,
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
          "id": id,
          "name": name,
          "about": about,
          "company": company,
          "position": position,
          "avatar": avatar,
          "years": years,
        ],
        fulfilledFragments: [
          ObjectIdentifier(SessionFragment.Speaker.self),
          ObjectIdentifier(SpeakerFragment.self)
        ]
      ))
    }
  }
}
