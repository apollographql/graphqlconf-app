// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct SessionFragment: ConnectorAPI.SelectionSet, Fragment, Identifiable {
  public static var fragmentDefinition: StaticString {
    #"fragment SessionFragment on Session { __typename id title description start end event_type room { __typename name floor } speakers { __typename ...SpeakerFragment } }"#
  }

  @_spi(Unsafe) public let __data: DataDict
  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Session }
  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", ConnectorAPI.ID.self),
    .field("title", String.self),
    .field("description", String.self),
    .field("start", ConnectorAPI.LocalDateTime.self),
    .field("end", ConnectorAPI.LocalDateTime.self),
    .field("event_type", String.self),
    .field("room", Room?.self),
    .field("speakers", [Speaker].self),
  ] }
  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
    SessionFragment.self
  ] }

  public var id: ConnectorAPI.ID { __data["id"] }
  public var title: String { __data["title"] }
  public var description: String { __data["description"] }
  public var start: ConnectorAPI.LocalDateTime { __data["start"] }
  public var end: ConnectorAPI.LocalDateTime { __data["end"] }
  public var event_type: String { __data["event_type"] }
  public var room: Room? { __data["room"] }
  public var speakers: [Speaker] { __data["speakers"] }

  public init(
    id: ConnectorAPI.ID,
    title: String,
    description: String,
    start: ConnectorAPI.LocalDateTime,
    end: ConnectorAPI.LocalDateTime,
    event_type: String,
    room: Room? = nil,
    speakers: [Speaker]
  ) {
    self.init(unsafelyWithData: [
      "__typename": ConnectorAPI.Objects.Session.typename,
      "id": id,
      "title": title,
      "description": description,
      "start": start,
      "end": end,
      "event_type": event_type,
      "room": room._fieldData,
      "speakers": speakers._fieldData,
    ])
  }

  /// Room
  ///
  /// Parent Type: `Room`
  nonisolated public struct Room: ConnectorAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Room }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("name", String.self),
      .field("floor", Int.self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      SessionFragment.Room.self
    ] }

    public var name: String { __data["name"] }
    public var floor: Int { __data["floor"] }

    public init(
      name: String,
      floor: Int
    ) {
      self.init(unsafelyWithData: [
        "__typename": ConnectorAPI.Objects.Room.typename,
        "name": name,
        "floor": floor,
      ])
    }
  }

  /// Speaker
  ///
  /// Parent Type: `Speaker`
  nonisolated public struct Speaker: ConnectorAPI.SelectionSet, Identifiable {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Speaker }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .fragment(SpeakerFragment.self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      SessionFragment.Speaker.self,
      SpeakerFragment.self
    ] }

    public var id: ConnectorAPI.ID { __data["id"] }
    public var name: String { __data["name"] }
    public var about: String { __data["about"] }
    public var company: String { __data["company"] }
    public var position: String { __data["position"] }
    public var avatar: String { __data["avatar"] }
    public var socialUrls: [SocialUrl] { __data["socialUrls"] }

    public struct Fragments: FragmentContainer {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      public var speakerFragment: SpeakerFragment { _toFragment() }
    }

    public init(
      id: ConnectorAPI.ID,
      name: String,
      about: String,
      company: String,
      position: String,
      avatar: String,
      socialUrls: [SocialUrl]
    ) {
      self.init(unsafelyWithData: [
        "__typename": ConnectorAPI.Objects.Speaker.typename,
        "id": id,
        "name": name,
        "about": about,
        "company": company,
        "position": position,
        "avatar": avatar,
        "socialUrls": socialUrls._fieldData,
      ])
    }

    public typealias SocialUrl = SpeakerFragment.SocialUrl
  }
}
