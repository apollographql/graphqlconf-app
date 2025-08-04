// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct SessionFragment: ConnectorAPI.SelectionSet, Fragment, Identifiable {
  public static var fragmentDefinition: StaticString {
    #"fragment SessionFragment on SchedSession { __typename id event { __typename start_time_epoch timezone start_date start_time end_time start_weekday start_month start_day type subtype } name description speakers { __typename username name company position years } venue { __typename name } }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.SchedSession }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("id", String.self),
    .field("event", Event?.self),
    .field("name", String?.self),
    .field("description", String?.self),
    .field("speakers", [Speaker]?.self),
    .field("venue", Venue?.self),
  ] }

  public var id: String { __data["id"] }
  public var event: Event? { __data["event"] }
  public var name: String? { __data["name"] }
  public var description: String? { __data["description"] }
  public var speakers: [Speaker]? { __data["speakers"] }
  public var venue: Venue? { __data["venue"] }

  public init(
    id: String,
    event: Event? = nil,
    name: String? = nil,
    description: String? = nil,
    speakers: [Speaker]? = nil,
    venue: Venue? = nil
  ) {
    self.init(_dataDict: DataDict(
      data: [
        "__typename": ConnectorAPI.Objects.SchedSession.typename,
        "id": id,
        "event": event._fieldData,
        "name": name,
        "description": description,
        "speakers": speakers._fieldData,
        "venue": venue._fieldData,
      ],
      fulfilledFragments: [
        ObjectIdentifier(SessionFragment.self)
      ]
    ))
  }

  /// Event
  ///
  /// Parent Type: `SchedEvent`
  public struct Event: ConnectorAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.SchedEvent }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("start_time_epoch", Int?.self),
      .field("timezone", String.self),
      .field("start_date", String?.self),
      .field("start_time", String?.self),
      .field("end_time", String?.self),
      .field("start_weekday", String?.self),
      .field("start_month", String?.self),
      .field("start_day", String?.self),
      .field("type", String?.self),
      .field("subtype", String?.self),
    ] }

    public var start_time_epoch: Int? { __data["start_time_epoch"] }
    public var timezone: String { __data["timezone"] }
    public var start_date: String? { __data["start_date"] }
    public var start_time: String? { __data["start_time"] }
    public var end_time: String? { __data["end_time"] }
    public var start_weekday: String? { __data["start_weekday"] }
    public var start_month: String? { __data["start_month"] }
    public var start_day: String? { __data["start_day"] }
    public var type: String? { __data["type"] }
    public var subtype: String? { __data["subtype"] }

    public init(
      start_time_epoch: Int? = nil,
      timezone: String,
      start_date: String? = nil,
      start_time: String? = nil,
      end_time: String? = nil,
      start_weekday: String? = nil,
      start_month: String? = nil,
      start_day: String? = nil,
      type: String? = nil,
      subtype: String? = nil
    ) {
      self.init(_dataDict: DataDict(
        data: [
          "__typename": ConnectorAPI.Objects.SchedEvent.typename,
          "start_time_epoch": start_time_epoch,
          "timezone": timezone,
          "start_date": start_date,
          "start_time": start_time,
          "end_time": end_time,
          "start_weekday": start_weekday,
          "start_month": start_month,
          "start_day": start_day,
          "type": type,
          "subtype": subtype,
        ],
        fulfilledFragments: [
          ObjectIdentifier(SessionFragment.Event.self)
        ]
      ))
    }
  }

  /// Speaker
  ///
  /// Parent Type: `SchedSpeaker`
  public struct Speaker: ConnectorAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.SchedSpeaker }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("username", String.self),
      .field("name", String?.self),
      .field("company", String?.self),
      .field("position", String?.self),
      .field("years", [Int]?.self),
    ] }

    public var username: String { __data["username"] }
    public var name: String? { __data["name"] }
    public var company: String? { __data["company"] }
    public var position: String? { __data["position"] }
    public var years: [Int]? { __data["years"] }

    public init(
      username: String,
      name: String? = nil,
      company: String? = nil,
      position: String? = nil,
      years: [Int]? = nil
    ) {
      self.init(_dataDict: DataDict(
        data: [
          "__typename": ConnectorAPI.Objects.SchedSpeaker.typename,
          "username": username,
          "name": name,
          "company": company,
          "position": position,
          "years": years,
        ],
        fulfilledFragments: [
          ObjectIdentifier(SessionFragment.Speaker.self)
        ]
      ))
    }
  }

  /// Venue
  ///
  /// Parent Type: `SchedVenue`
  public struct Venue: ConnectorAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.SchedVenue }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("__typename", String.self),
      .field("name", String?.self),
    ] }

    public var name: String? { __data["name"] }

    public init(
      name: String? = nil
    ) {
      self.init(_dataDict: DataDict(
        data: [
          "__typename": ConnectorAPI.Objects.SchedVenue.typename,
          "name": name,
        ],
        fulfilledFragments: [
          ObjectIdentifier(SessionFragment.Venue.self)
        ]
      ))
    }
  }
}
