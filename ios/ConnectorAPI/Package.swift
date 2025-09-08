// swift-tools-version:6.1

import PackageDescription

let package = Package(
  name: "ConnectorAPI",
  platforms: [
    .iOS(.v17),
  ],
  products: [
    .library(name: "ConnectorAPI", targets: ["ConnectorAPI"]),
  ],
  dependencies: [
    .package(url: "https://github.com/apollographql/apollo-ios", exact: "2.0.0-alpha-2"),
  ],
  targets: [
    .target(
      name: "ConnectorAPI",
      dependencies: [
        .product(name: "ApolloAPI", package: "apollo-ios"),
      ],
      path: "./Sources"
    ),
  ],
  swiftLanguageModes: [.v6, .v5]
)
