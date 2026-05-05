// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct SubmitFeedbackMutation: GraphQLMutation {
  public static let operationName: String = "SubmitFeedback"
  public static let operationDocument: ApolloAPI.OperationDocument = .init(
    definition: .init(
      #"mutation SubmitFeedback($input: FeedbackInput!) { submitFeedback(feedbackInput: $input) }"#
    ))

  public var input: FeedbackInput

  public init(input: FeedbackInput) {
    self.input = input
  }

  @_spi(Unsafe) public var __variables: Variables? { ["input": input] }

  nonisolated public struct Data: ConnectorAPI.SelectionSet {
    @_spi(Unsafe) public let __data: DataDict
    @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

    @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { ConnectorAPI.Objects.Mutation }
    @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
      .field("submitFeedback", Bool.self, arguments: ["feedbackInput": .variable("input")]),
    ] }
    @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
      SubmitFeedbackMutation.Data.self
    ] }

    public var submitFeedback: Bool { __data["submitFeedback"] }

    public init(
      submitFeedback: Bool
    ) {
      self.init(unsafelyWithData: [
        "__typename": ConnectorAPI.Objects.Mutation.typename,
        "submitFeedback": submitFeedback,
      ])
    }
  }
}
