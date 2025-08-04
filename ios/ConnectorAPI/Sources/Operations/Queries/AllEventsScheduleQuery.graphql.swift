// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct AllEventsScheduleQuery: GraphQLQuery {
  public static let operationName: String = "AllEventsSchedule"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query AllEventsSchedule { schedule_2025 { __typename ...SessionFragment } }"#,
      fragments: [SessionFragment.self]
    ))

  public init() {}

  public struct Data: ConnectorAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("schedule_2025", [Schedule_2025]?.self),
    ] }

    public var schedule_2025: [Schedule_2025]? { __data["schedule_2025"] }

    public init(
      schedule_2025: [Schedule_2025]? = nil
    ) {
      self.init(_dataDict: DataDict(
        data: [
          "__typename": ConnectorAPI.Objects.Query.typename,
          "schedule_2025": schedule_2025._fieldData,
        ],
        fulfilledFragments: [
          ObjectIdentifier(AllEventsScheduleQuery.Data.self)
        ]
      ))
    }

    /// Schedule_2025
    ///
    /// Parent Type: `SchedSession`
    public struct Schedule_2025: ConnectorAPI.SelectionSet, Identifiable {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.SchedSession }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .fragment(SessionFragment.self),
      ] }

      public var id: String { __data["id"] }
      public var event: Event? { __data["event"] }
      public var name: String? { __data["name"] }
      public var description: String? { __data["description"] }
      public var speakers: [Speaker]? { __data["speakers"] }
      public var venue: Venue? { __data["venue"] }

      public struct Fragments: FragmentContainer {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public var sessionFragment: SessionFragment { _toFragment() }
      }

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
            ObjectIdentifier(AllEventsScheduleQuery.Data.Schedule_2025.self),
            ObjectIdentifier(SessionFragment.self)
          ]
        ))
      }

      public typealias Event = SessionFragment.Event

      public typealias Speaker = SessionFragment.Speaker

      public typealias Venue = SessionFragment.Venue
    }
  }
}
