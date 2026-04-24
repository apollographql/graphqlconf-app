// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct AllSpeakersQuery: GraphQLQuery {
  public static let operationName: String = "AllSpeakers"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query AllSpeakers { speakers { __typename ...SpeakerFragment } }"#,
      fragments: [SpeakerFragment.self]
    ))

  public init() {}

  nonisolated public struct Data: ConnectorAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("speakers", [Speaker].self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      AllSpeakersQuery.Data.self
    ] }

    public var speakers: [Speaker] { __data["speakers"] }

    public init(
      speakers: [Speaker]
    ) {
      self.init(unsafelyWithData: [
        "__typename": ConnectorAPI.Objects.Query.typename,
        "speakers": speakers._fieldData,
      ])
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
        AllSpeakersQuery.Data.Speaker.self,
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
}
