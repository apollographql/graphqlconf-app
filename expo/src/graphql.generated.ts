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
  join__DirectiveArguments: { input: any; output: any; }
  join__FieldSet: { input: any; output: any; }
  join__FieldValue: { input: any; output: any; }
  link__Import: { input: any; output: any; }
};

export type Query = {
  __typename?: 'Query';
  schedule_2025?: Maybe<Array<SchedSession>>;
  speakers?: Maybe<Array<SchedSpeaker>>;
};

export type SchedEvent = {
  __typename?: 'SchedEvent';
  end?: Maybe<Scalars['String']['output']>;
  end_date?: Maybe<Scalars['String']['output']>;
  end_day?: Maybe<Scalars['String']['output']>;
  end_month?: Maybe<Scalars['String']['output']>;
  end_month_short?: Maybe<Scalars['String']['output']>;
  end_time?: Maybe<Scalars['String']['output']>;
  end_weekday?: Maybe<Scalars['String']['output']>;
  end_weekday_short?: Maybe<Scalars['String']['output']>;
  end_year?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  start?: Maybe<Scalars['String']['output']>;
  start_date?: Maybe<Scalars['String']['output']>;
  start_day?: Maybe<Scalars['String']['output']>;
  start_month?: Maybe<Scalars['String']['output']>;
  start_month_short?: Maybe<Scalars['String']['output']>;
  start_time?: Maybe<Scalars['String']['output']>;
  start_time_epoch?: Maybe<Scalars['Int']['output']>;
  start_weekday?: Maybe<Scalars['String']['output']>;
  start_weekday_short?: Maybe<Scalars['String']['output']>;
  start_year?: Maybe<Scalars['String']['output']>;
  subtype?: Maybe<Scalars['String']['output']>;
  timezone: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type SchedSession = {
  __typename?: 'SchedSession';
  active?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  event?: Maybe<SchedEvent>;
  goers?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  invite_only?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pinned?: Maybe<Scalars['String']['output']>;
  seats?: Maybe<Scalars['String']['output']>;
  speakers?: Maybe<Array<SchedSpeaker>>;
  venue?: Maybe<SchedVenue>;
};

export type SchedSpeaker = {
  __typename?: 'SchedSpeaker';
  about?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Scalars['String']['output']>;
  custom_order?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
  years?: Maybe<Array<Scalars['Int']['output']>>;
};

export type SchedVenue = {
  __typename?: 'SchedVenue';
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type Join__ContextArgument = {
  context: Scalars['String']['input'];
  name: Scalars['String']['input'];
  selection: Scalars['join__FieldValue']['input'];
  type: Scalars['String']['input'];
};

export enum Join__Graph {
  Github = 'GITHUB'
}

export enum Link__Purpose {
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  Execution = 'EXECUTION',
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  Security = 'SECURITY'
}
