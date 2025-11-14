import * as BaseSchemaTypes from '@/graphql.generated';
import { LocalState } from '@apollo/client/local-state'
import { DeepPartial } from '@apollo/client/utilities';
import { DefaultContext } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Bookmark = {
  __typename: 'Bookmark';
  id: Scalars['String']['output'];
  typename: Scalars['String']['output'];
};

export type BookmarkEntity = {
  id: Scalars['String']['output'];
  isBookmarked: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename: 'Mutation';
  chooseAiFramework: Scalars['String']['output'];
  toggleBookmark: BookmarkEntity;
};


export type MutationChooseAiFrameworkArgs = {
  framework: Scalars['String']['input'];
};


export type MutationToggleBookmarkArgs = {
  id: Scalars['String']['input'];
  isBookmarked?: InputMaybe<Scalars['Boolean']['input']>;
  typename: Scalars['String']['input'];
};

export type Place = BookmarkEntity & {
  __typename: 'Place';
  isBookmarked: Scalars['Boolean']['output'];
};

export type Query = {
  __typename: 'Query';
  aiFramework: Scalars['String']['output'];
  bookmarks: Array<Bookmark>;
};


export type QueryBookmarksArgs = {
  typename?: InputMaybe<Scalars['String']['input']>;
};

export type SchedSession = BookmarkEntity & {
  __typename: 'SchedSession';
  isBookmarked: Scalars['Boolean']['output'];
};

export type SchedSpeaker = BookmarkEntity & {
  __typename: 'SchedSpeaker';
  isBookmarked: Scalars['Boolean']['output'];
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Bookmark: Bookmark;
  BookmarkEntity: ResolversInterfaceTypes<ResolversTypes>['BookmarkEntity'];
  Boolean: Scalars['Boolean']['output'];
  Mutation: Record<PropertyKey, never>;
  Place: Place;
  Query: Record<PropertyKey, never>;
  SchedSession: SchedSession;
  SchedSpeaker: SchedSpeaker;
  String: Scalars['String']['output'];
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Bookmark: Bookmark;
  BookmarkEntity: ResolversInterfaceTypes<ResolversParentTypes>['BookmarkEntity'];
  Boolean: Scalars['Boolean']['output'];
  Mutation: {};
  Place: Omit<DeepPartial<BaseSchemaTypes.Place>, 'isBookmarked'>;
  Query: Omit<DeepPartial<BaseSchemaTypes.Query>, 'bookmarks' | 'aiFramework'>;
  SchedSession: Omit<DeepPartial<BaseSchemaTypes.SchedSession>, 'isBookmarked'>;
  SchedSpeaker: Omit<DeepPartial<BaseSchemaTypes.SchedSpeaker>, 'isBookmarked'>;
  String: Scalars['String']['output'];
};

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  BookmarkEntity:
    | ( Place )
    | ( SchedSession )
    | ( SchedSpeaker )
  ;
};





export type BookmarkResolvers = {
  id?: LocalState.Resolver<ResolversTypes['String'], ResolversParentTypes['Bookmark'], DefaultContext>;
  typename?: LocalState.Resolver<ResolversTypes['String'], ResolversParentTypes['Bookmark'], DefaultContext>;
};


export type MutationResolvers = {
  chooseAiFramework?: LocalState.Resolver<ResolversTypes['String'], ResolversParentTypes['Mutation'], DefaultContext, RequireFields<MutationChooseAiFrameworkArgs, 'framework'>>;
  toggleBookmark?: LocalState.Resolver<ResolversTypes['BookmarkEntity'], ResolversParentTypes['Mutation'], DefaultContext, RequireFields<MutationToggleBookmarkArgs, 'id' | 'typename'>>;
};

export type PlaceResolvers = {
  isBookmarked?: LocalState.Resolver<ResolversTypes['Boolean'], ResolversParentTypes['Place'], DefaultContext>;
};

export type QueryResolvers = {
  aiFramework?: LocalState.Resolver<ResolversTypes['String'], ResolversParentTypes['Query'], DefaultContext>;
  bookmarks?: LocalState.Resolver<Array<ResolversTypes['Bookmark']>, ResolversParentTypes['Query'], DefaultContext, Partial<QueryBookmarksArgs>>;
};

export type SchedSessionResolvers = {
  isBookmarked?: LocalState.Resolver<ResolversTypes['Boolean'], ResolversParentTypes['SchedSession'], DefaultContext>;
};

export type SchedSpeakerResolvers = {
  isBookmarked?: LocalState.Resolver<ResolversTypes['Boolean'], ResolversParentTypes['SchedSpeaker'], DefaultContext>;
};

export type Resolvers = {
  Bookmark?: BookmarkResolvers;
  Mutation?: MutationResolvers;
  Place?: PlaceResolvers;
  Query?: QueryResolvers;
  SchedSession?: SchedSessionResolvers;
  SchedSpeaker?: SchedSpeakerResolvers;
};
