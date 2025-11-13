import { gql } from "@apollo/client";

// Additional schema definitions for types/values that will be added to the supergraph later in the turorial.
// Keeping them here so we can already have components referencing them for later inclusion.

// eslint-disable-next-line no-unused-expressions
gql`
  type Place implements Entity {
    id: String!
    name: String!
    displayName: LocalizedText!
    types: [String!]!
    primaryType: String!
    primaryTypeDisplayName: LocalizedText
    formattedAddress: String!
    shortFormattedAddress: String!
    postalAddress: String!
    addressComponents: [AddressComponent!]!
    plusCode: PlusCode!
    location: LatLng!
    viewport: Viewport!
    googleMapsUri: String!
    photos: [Photo!]!
    adrFormatAddress: String!
    businessStatus: String!
    attributions: [Attribution!]!
    googleMapsLinks: GoogleMapsLinks!
  }
  type LocalizedText {
    text: String!
    languageCode: String!
  }
  type AddressComponent {
    longText: String!
    shortText: String!
    types: [String!]!
    languageCode: String!
  }
  type PlusCode {
    globalCode: String!
    compoundCode: String!
  }
  type Viewport {
    low: LatLng!
    high: LatLng!
  }
  type Photo {
    id: String!
    widthPx: Int!
    heightPx: Int!
    authorAttributions: [AuthorAttribution!]!
    flagContentUri: String!
    googleMapsUri: String!
  }
  type Attribution {
    provider: String!
    providerUri: String!
  }
  type AuthorAttribution {
    displayName: String!
    uri: String!
    photoUri: String!
  }
  type GoogleMapsLinks {
    directionsUri: String!
    placeUri: String!
    writeAReviewUri: String!
    reviewsUri: String!
    photosUri: String!
  }
  extend type Query {
    place(id: String!): Place
  }
  extend type Place implements BookmarkEntity {
    isBookmarked: Boolean!
  }
`;
