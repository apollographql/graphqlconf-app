import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mutex } from "async-mutex";

const BOOKMARKS_KEY = "@graphqlconf:bookmarks";
const bookmarksMutex = new Mutex();

export interface BookmarkItem {
  id: string;
  typename: string;
}

type BookmarksMap = Record<string, true>;

/**
 * Create a key for the bookmarks map
 */
function createKey(typename: string, id: string): string {
  return `${typename}:${id}`;
}

/**
 * Get the raw bookmarks map from AsyncStorage
 */
async function getBookmarksMap(): Promise<BookmarksMap> {
  try {
    const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error reading bookmarks from storage:", error);
    return {};
  }
}

/**
 * Save bookmarks map to AsyncStorage
 */
async function saveBookmarksMap(bookmarks: BookmarksMap): Promise<void> {
  try {
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error("Error saving bookmarks to storage:", error);
  }
}

/**
 * Get all bookmarks as an array
 */
export async function getBookmarks(): Promise<BookmarkItem[]> {
  const bookmarksMap = await getBookmarksMap();
  return Object.keys(bookmarksMap).map((key) => {
    const [typename, id] = key.split(":");
    return {
      id,
      typename,
    };
  });
}

/**
 * Check if an item is bookmarked
 */
export async function isBookmarked(parent: {
  id: string;
  __typename: string;
}): Promise<boolean> {
  const bookmarksMap = await getBookmarksMap();
  const key = createKey(parent.__typename, parent.id);
  return key in bookmarksMap;
}

/**
 * Toggle bookmark status
 * @param id - The entity id
 * @param __typename - The entity typename
 * @param shouldBeBookmarked - Optional: if specified, set to this value; if omitted, toggle current state
 * @returns The new bookmark state (true if bookmarked, false if not)
 */
export async function toggleBookmark(
  id: string,
  __typename: string,
  shouldBeBookmarked?: boolean
): Promise<boolean> {
  return await bookmarksMutex.runExclusive(async () => {
    const bookmarksMap = await getBookmarksMap();
    const key = createKey(__typename, id);
    if (shouldBeBookmarked === undefined) {
      // Toggle the current state
      if (bookmarksMap[key]) {
        delete bookmarksMap[key];
      } else {
        bookmarksMap[key] = true;
      }
    } else if (shouldBeBookmarked) {
      // Explicitly set to bookmarked
      bookmarksMap[key] = true;
    } else {
      // Explicitly remove from bookmarks
      delete bookmarksMap[key];
    }

    await saveBookmarksMap(bookmarksMap);
    return !!bookmarksMap[key];
  });
}
