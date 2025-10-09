/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddressComponent = {
  __typename?: 'AddressComponent';
  languageCode: Scalars['String']['output'];
  longText: Scalars['String']['output'];
  shortText: Scalars['String']['output'];
  types: Array<Scalars['String']['output']>;
};

export type Attribution = {
  __typename?: 'Attribution';
  provider: Scalars['String']['output'];
  providerUri: Scalars['String']['output'];
};

export type AuthorAttribution = {
  __typename?: 'AuthorAttribution';
  displayName: Scalars['String']['output'];
  photoUri: Scalars['String']['output'];
  uri: Scalars['String']['output'];
};

export type Favorite = {
  __typename?: 'Favorite';
  id: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  typename: Scalars['String']['output'];
};

export type FavoriteEntity = {
  id: Scalars['String']['output'];
  isFavorite: Scalars['Boolean']['output'];
};

export type File = {
  __typename?: 'File';
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
};

export type GoogleMapsLinks = {
  __typename?: 'GoogleMapsLinks';
  directionsUri: Scalars['String']['output'];
  photosUri: Scalars['String']['output'];
  placeUri: Scalars['String']['output'];
  reviewsUri: Scalars['String']['output'];
  writeAReviewUri: Scalars['String']['output'];
};

export type LatLng = {
  __typename?: 'LatLng';
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
};

export type LocalizedText = {
  __typename?: 'LocalizedText';
  languageCode: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type LocationRestrictionInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  radiusInMeters: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addFavorite: FavoriteEntity;
  removeFavorite: FavoriteEntity;
  toggleFavorite: FavoriteEntity;
};


export type MutationAddFavoriteArgs = {
  id: Scalars['String']['input'];
  typename: Scalars['String']['input'];
};


export type MutationRemoveFavoriteArgs = {
  id: Scalars['String']['input'];
  typename: Scalars['String']['input'];
};


export type MutationToggleFavoriteArgs = {
  id: Scalars['String']['input'];
  typename: Scalars['String']['input'];
};

export enum NearbyPlaceType {
  AcaiShop = 'acai_shop',
  AfghaniRestaurant = 'afghani_restaurant',
  AfricanRestaurant = 'african_restaurant',
  AmericanRestaurant = 'american_restaurant',
  AsianRestaurant = 'asian_restaurant',
  BagelShop = 'bagel_shop',
  Bakery = 'bakery',
  Bar = 'bar',
  BarAndGrill = 'bar_and_grill',
  BarbecueRestaurant = 'barbecue_restaurant',
  BrazilianRestaurant = 'brazilian_restaurant',
  BreakfastRestaurant = 'breakfast_restaurant',
  BrunchRestaurant = 'brunch_restaurant',
  BuffetRestaurant = 'buffet_restaurant',
  Cafe = 'cafe',
  Cafeteria = 'cafeteria',
  CandyStore = 'candy_store',
  CatCafe = 'cat_cafe',
  ChineseRestaurant = 'chinese_restaurant',
  ChocolateFactory = 'chocolate_factory',
  ChocolateShop = 'chocolate_shop',
  CoffeeShop = 'coffee_shop',
  Confectionery = 'confectionery',
  Deli = 'deli',
  DessertRestaurant = 'dessert_restaurant',
  DessertShop = 'dessert_shop',
  Diner = 'diner',
  DogCafe = 'dog_cafe',
  DonutShop = 'donut_shop',
  FastFoodRestaurant = 'fast_food_restaurant',
  FineDiningRestaurant = 'fine_dining_restaurant',
  FoodCourt = 'food_court',
  FrenchRestaurant = 'french_restaurant',
  GreekRestaurant = 'greek_restaurant',
  HamburgerRestaurant = 'hamburger_restaurant',
  IceCreamShop = 'ice_cream_shop',
  IndianRestaurant = 'indian_restaurant',
  IndonesianRestaurant = 'indonesian_restaurant',
  ItalianRestaurant = 'italian_restaurant',
  JapaneseRestaurant = 'japanese_restaurant',
  JuiceShop = 'juice_shop',
  KoreanRestaurant = 'korean_restaurant',
  LebaneseRestaurant = 'lebanese_restaurant',
  MealDelivery = 'meal_delivery',
  MealTakeaway = 'meal_takeaway',
  MediterraneanRestaurant = 'mediterranean_restaurant',
  MexicanRestaurant = 'mexican_restaurant',
  MiddleEasternRestaurant = 'middle_eastern_restaurant',
  PizzaRestaurant = 'pizza_restaurant',
  Pub = 'pub',
  RamenRestaurant = 'ramen_restaurant',
  Restaurant = 'restaurant',
  SandwichShop = 'sandwich_shop',
  SeafoodRestaurant = 'seafood_restaurant',
  SpanishRestaurant = 'spanish_restaurant',
  SteakHouse = 'steak_house',
  SushiRestaurant = 'sushi_restaurant',
  TeaHouse = 'tea_house',
  ThaiRestaurant = 'thai_restaurant',
  TurkishRestaurant = 'turkish_restaurant',
  VeganRestaurant = 'vegan_restaurant',
  VegetarianRestaurant = 'vegetarian_restaurant',
  VietnameseRestaurant = 'vietnamese_restaurant',
  WineBar = 'wine_bar'
}

export type Photo = {
  __typename?: 'Photo';
  authorAttributions: Array<AuthorAttribution>;
  flagContentUri: Scalars['String']['output'];
  googleMapsUri: Scalars['String']['output'];
  heightPx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  widthPx: Scalars['Int']['output'];
};

export type Place = FavoriteEntity & {
  __typename?: 'Place';
  addressComponents: Array<AddressComponent>;
  adrFormatAddress: Scalars['String']['output'];
  attributions: Array<Attribution>;
  businessStatus: Scalars['String']['output'];
  displayName: LocalizedText;
  formattedAddress: Scalars['String']['output'];
  googleMapsLinks: GoogleMapsLinks;
  googleMapsUri: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isFavorite: Scalars['Boolean']['output'];
  location: LatLng;
  name: Scalars['String']['output'];
  photos: Array<Photo>;
  plusCode: PlusCode;
  postalAddress: Scalars['String']['output'];
  primaryType: Scalars['String']['output'];
  primaryTypeDisplayName?: Maybe<LocalizedText>;
  shortFormattedAddress: Scalars['String']['output'];
  types: Array<Scalars['String']['output']>;
  viewport: Viewport;
};

export type PlusCode = {
  __typename?: 'PlusCode';
  compoundCode: Scalars['String']['output'];
  globalCode: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  event?: Maybe<SchedEvent>;
  events: Array<SchedEvent>;
  favorites: Array<Favorite>;
  nearbyPlaces: Array<Place>;
  place?: Maybe<Place>;
  session?: Maybe<SchedSession>;
  speaker?: Maybe<SchedSpeaker>;
  speakers?: Maybe<Array<SchedSpeaker>>;
  venue?: Maybe<SchedVenue>;
  venues: Array<SchedVenue>;
};


export type QueryEventArgs = {
  id: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  year?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFavoritesArgs = {
  typename?: InputMaybe<Scalars['String']['input']>;
};


export type QueryNearbyPlacesArgs = {
  includedTypes: Array<NearbyPlaceType>;
  locationRestriction: LocationRestrictionInput;
  maxResultCount?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPlaceArgs = {
  id: Scalars['String']['input'];
};


export type QuerySessionArgs = {
  id: Scalars['String']['input'];
};


export type QuerySpeakerArgs = {
  id: Scalars['String']['input'];
};


export type QuerySpeakersArgs = {
  company?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  nameLike?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVenueArgs = {
  id: Scalars['String']['input'];
};


export type QueryVenuesArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  nameLike?: InputMaybe<Scalars['String']['input']>;
};

export type SchedEvent = {
  __typename?: 'SchedEvent';
  city: Scalars['String']['output'];
  end_date: Scalars['String']['output'];
  id: Scalars['String']['output'];
  location: LatLng;
  name: Scalars['String']['output'];
  sessions: Array<SchedSession>;
  start_date: Scalars['String']['output'];
  year: Scalars['String']['output'];
};


export type SchedEventSessionsArgs = {
  descriptionLike?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  nameLike?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  venueId?: InputMaybe<Scalars['String']['input']>;
};

export type SchedSession = FavoriteEntity & {
  __typename?: 'SchedSession';
  active: Yn;
  audience?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  end_date: Scalars['String']['output'];
  end_time: Scalars['String']['output'];
  event?: Maybe<SchedEvent>;
  event_id: Scalars['String']['output'];
  event_key: Scalars['String']['output'];
  files: Array<File>;
  goers?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  invite_only: Yn;
  isFavorite: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  pinned: Yn;
  seats?: Maybe<Scalars['Int']['output']>;
  speakers: Array<SchedSpeaker>;
  start_date: Scalars['String']['output'];
  start_time: Scalars['String']['output'];
  start_time_ts?: Maybe<Scalars['Int']['output']>;
  subtype?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  venue?: Maybe<SchedVenue>;
  video_stream?: Maybe<Scalars['String']['output']>;
  year: Scalars['String']['output'];
};

export type SchedSpeaker = FavoriteEntity & {
  __typename?: 'SchedSpeaker';
  about: Scalars['String']['output'];
  avatar: Scalars['String']['output'];
  company: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isFavorite: Scalars['Boolean']['output'];
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
  position: Scalars['String']['output'];
  socialurls: Array<SocialUrl>;
  url: Scalars['String']['output'];
  username: Scalars['String']['output'];
  years?: Maybe<Array<Scalars['Int']['output']>>;
};

export type SchedVenue = {
  __typename?: 'SchedVenue';
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type SocialUrl = {
  __typename?: 'SocialUrl';
  service: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Viewport = {
  __typename?: 'Viewport';
  high: LatLng;
  low: LatLng;
};

export enum Yn {
  N = 'N',
  Y = 'Y'
}
