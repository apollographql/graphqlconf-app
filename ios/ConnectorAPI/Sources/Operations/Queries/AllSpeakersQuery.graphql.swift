// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct AllSpeakersQuery: GraphQLQuery {
  public static let operationName: String = "AllSpeakers"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"query AllSpeakers { speakers { __typename ...SpeakerFragment } }"#,
      fragments: [SpeakerFragment.self]
    ))

  public init() {}

  public struct Data: ConnectorAPI.SelectionSet {
    public let __data: DataDict
    public init(_dataDict: DataDict) { __data = _dataDict }

    public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Query }
    public static var __selections: [ApolloAPI.Selection] { [
      .field("speakers", [Speaker]?.self),
    ] }

    public var speakers: [Speaker]? { __data["speakers"] }

    public init(
      speakers: [Speaker]? = nil
    ) {
      self.init(_dataDict: DataDict(
        data: [
          "__typename": ConnectorAPI.Objects.Query.typename,
          "speakers": speakers._fieldData,
        ],
        fulfilledFragments: [
          ObjectIdentifier(AllSpeakersQuery.Data.self)
        ]
      ))
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
        .fragment(SpeakerFragment.self),
      ] }

      public var username: String { __data["username"] }
      public var name: String? { __data["name"] }
      public var about: String? { __data["about"] }
      public var company: String? { __data["company"] }
      public var position: String? { __data["position"] }
      public var avatar: String? { __data["avatar"] }
      public var years: [Int]? { __data["years"] }

      public struct Fragments: FragmentContainer {
        public let __data: DataDict
        public init(_dataDict: DataDict) { __data = _dataDict }

        public var speakerFragment: SpeakerFragment { _toFragment() }
      }

      public init(
        username: String,
        name: String? = nil,
        about: String? = nil,
        company: String? = nil,
        position: String? = nil,
        avatar: String? = nil,
        years: [Int]? = nil
      ) {
        self.init(_dataDict: DataDict(
          data: [
            "__typename": ConnectorAPI.Objects.SchedSpeaker.typename,
            "username": username,
            "name": name,
            "about": about,
            "company": company,
            "position": position,
            "avatar": avatar,
            "years": years,
          ],
          fulfilledFragments: [
            ObjectIdentifier(AllSpeakersQuery.Data.Speaker.self),
            ObjectIdentifier(SpeakerFragment.self)
          ]
        ))
      }
    }
  }
}
