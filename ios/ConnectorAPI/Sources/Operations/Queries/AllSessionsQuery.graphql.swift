// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct AllSessionsQuery: GraphQLQuery {
  public static let operationName: String = "AllSessions"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query AllSessions { sessions { __typename ...SessionFragment } }"#,
      fragments: [SessionFragment.self]
    ))

  public init() {}

  public struct Data: ConnectorAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("sessions", [Session].self),
    ] }

    public var sessions: [Session] { __data["sessions"] }

    public init(
      sessions: [Session]
    ) {
      self.init(_dataDict: DataDict(
        data: [
          "__typename": ConnectorAPI.Objects.Query.typename,
          "sessions": sessions._fieldData,
        ],
        fulfilledFragments: [
          ObjectIdentifier(AllSessionsQuery.Data.self)
        ]
      ))
    }

    /// Session
    ///
    /// Parent Type: `Session`
    public struct Session: ConnectorAPI.SelectionSet, Identifiable {
      public let __data: DataDict
      public init(_dataDict: DataDict) { __data = _dataDict }

      public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Session }
      public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .fragment(SessionFragment.self),
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

      public struct Fragments: FragmentContainer {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public var sessionFragment: SessionFragment { _toFragment() }
      }

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
            ObjectIdentifier(AllSessionsQuery.Data.Session.self),
            ObjectIdentifier(SessionFragment.self)
          ]
        ))
      }

      public typealias Speaker = SessionFragment.Speaker
    }
  }
}
