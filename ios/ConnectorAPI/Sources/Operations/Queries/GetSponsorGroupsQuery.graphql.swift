// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct GetSponsorGroupsQuery: GraphQLQuery {
  public static let operationName: String = "GetSponsorGroups"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query GetSponsorGroups { sponsorGroups { __typename name sponsors { __typename name url logoLight logoDark } } }"#
    ))

  public init() {}

  nonisolated public struct Data: ConnectorAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Query }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("sponsorGroups", [SponsorGroup].self),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      GetSponsorGroupsQuery.Data.self
    ] }

    public var sponsorGroups: [SponsorGroup] { __data["sponsorGroups"] }

    public init(
      sponsorGroups: [SponsorGroup]
    ) {
      self.init(unsafelyWithData: [
        "__typename": ConnectorAPI.Objects.Query.typename,
        "sponsorGroups": sponsorGroups._fieldData,
      ])
    }

    /// SponsorGroup
    ///
    /// Parent Type: `SponsorGroup`
    nonisolated public struct SponsorGroup: ConnectorAPI.SelectionSet {
      @_spi(Unsafe) public let __data: DataDict
      @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

      @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.SponsorGroup }
      @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
        .field("__typename", String.self),
        .field("name", String.self),
        .field("sponsors", [Sponsor].self),
      ] }
      @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
        GetSponsorGroupsQuery.Data.SponsorGroup.self
      ] }

      public var name: String { __data["name"] }
      public var sponsors: [Sponsor] { __data["sponsors"] }

      public init(
        name: String,
        sponsors: [Sponsor]
      ) {
        self.init(unsafelyWithData: [
          "__typename": ConnectorAPI.Objects.SponsorGroup.typename,
          "name": name,
          "sponsors": sponsors._fieldData,
        ])
      }

      /// SponsorGroup.Sponsor
      ///
      /// Parent Type: `Sponsor`
      nonisolated public struct Sponsor: ConnectorAPI.SelectionSet {
        @_spi(Unsafe) public let __data: DataDict
        @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

        @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Sponsor }
        @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
          .field("__typename", String.self),
          .field("name", String.self),
          .field("url", String.self),
          .field("logoLight", String.self),
          .field("logoDark", String.self),
        ] }
        @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
          GetSponsorGroupsQuery.Data.SponsorGroup.Sponsor.self
        ] }

        public var name: String { __data["name"] }
        public var url: String { __data["url"] }
        public var logoLight: String { __data["logoLight"] }
        public var logoDark: String { __data["logoDark"] }

        public init(
          name: String,
          url: String,
          logoLight: String,
          logoDark: String
        ) {
          self.init(unsafelyWithData: [
            "__typename": ConnectorAPI.Objects.Sponsor.typename,
            "name": name,
            "url": url,
            "logoLight": logoLight,
            "logoDark": logoDark,
          ])
        }
      }
    }
  }
}
