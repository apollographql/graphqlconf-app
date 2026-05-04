// @generated
// This file was automatically generated and should not be edited.

@_spi(Internal) @_spi(Unsafe) import ApolloAPI

nonisolated public struct FeedbackInput: InputObject {
  @_spi(Unsafe) public private(set) var __data: InputDict

  @_spi(Unsafe) public init(_ data: InputDict) {
    __data = data
  }

  public init(
    userId: String,
    sessionId: String,
    rating: GraphQLEnum<Rating>,
    comment: String
  ) {
    __data = InputDict([
      "userId": userId,
      "sessionId": sessionId,
      "rating": rating,
      "comment": comment
    ])
  }

  public var userId: String {
    get { __data["userId"] }
    set { __data["userId"] = newValue }
  }

  public var sessionId: String {
    get { __data["sessionId"] }
    set { __data["sessionId"] = newValue }
  }

  public var rating: GraphQLEnum<Rating> {
    get { __data["rating"] }
    set { __data["rating"] = newValue }
  }

  public var comment: String {
    get { __data["comment"] }
    set { __data["comment"] = newValue }
  }
}
