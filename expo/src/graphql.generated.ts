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

export type File = {
  __typename?: 'File';
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  events: Array<SchedSession>;
  speakers?: Maybe<Array<SchedSpeaker>>;
  venues: Array<SchedVenue>;
};


export type QueryEventsArgs = {
  descriptionLike?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  nameLike?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  venueId?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySpeakersArgs = {
  company?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  nameLike?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVenuesArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  nameLike?: InputMaybe<Scalars['String']['input']>;
};

export type SchedSession = {
  __typename?: 'SchedSession';
  active: Yn;
  audience?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  end_date: Scalars['String']['output'];
  end_time: Scalars['String']['output'];
  event_key: Scalars['String']['output'];
  files: Array<File>;
  goers?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  invite_only: Yn;
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

export type SchedSpeaker = {
  __typename?: 'SchedSpeaker';
  about: Scalars['String']['output'];
  avatar: Scalars['String']['output'];
  company: Scalars['String']['output'];
  id: Scalars['String']['output'];
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

export enum Yn {
  N = 'N',
  Y = 'Y'
}
