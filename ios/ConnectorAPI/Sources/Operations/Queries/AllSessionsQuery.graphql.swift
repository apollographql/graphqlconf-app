// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct AllSessionsQuery: GraphQLQuery {
  public static let operationName: String = "AllSessions"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query AllSessions { sessions { __typename ...SessionFragment } }"#,
      fragments: [SessionFragment.self, SpeakerFragment.self]
    ))

  public init() {}

  nonisolated public struct Data: ConnectorAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("sessions", [Session].self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      AllSessionsQuery.Data.self
    ] }

    public var sessions: [Session] { __data["sessions"] }

    public init(
      sessions: [Session]
    ) {
      self.init(unsafelyWithData: [
        "__typename": ConnectorAPI.Objects.Query.typename,
        "sessions": sessions._fieldData,
      ])
    }

    /// Session
    ///
    /// Parent Type: `Session`
    nonisolated public struct Session: ConnectorAPI.SelectionSet, Identifiable {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Session }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .fragment(SessionFragment.self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        AllSessionsQuery.Data.Session.self,
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
      public var resources: [Resource] { __data["resources"] }

      public struct Fragments: FragmentContainer {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        public var sessionFragment: SessionFragment { _toFragment() }
      }

      public init(
        id: ConnectorAPI.ID,
        title: String,
        description: String,
        start: ConnectorAPI.LocalDateTime,
        end: ConnectorAPI.LocalDateTime,
        event_type: String,
        room: Room? = nil,
        speakers: [Speaker],
        resources: [Resource]
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
          "resources": resources._fieldData,
        ])
      }

      public typealias Room = SessionFragment.Room

      public typealias Speaker = SessionFragment.Speaker

      public typealias Resource = SessionFragment.Resource
    }
  }
}
