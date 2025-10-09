import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mutex } from "async-mutex";

const FAVORITES_KEY = "@graphqlconf:favorites";
const favoritesMutex = new Mutex();

export interface FavoriteItem {
  id: string;
  typename: string;
  timestamp: string;
}

type FavoritesMap = Record<string, true>;

/**
 * Create a key for the favorites map
 */
function createKey(typename: string, id: string): string {
  return `${typename}:${id}`;
}

/**
 * Get the raw favorites map from AsyncStorage
 */
async function getFavoritesMap(): Promise<FavoritesMap> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error reading favorites from storage:", error);
    return {};
  }
}

/**
 * Save favorites map to AsyncStorage
 */
async function saveFavoritesMap(favorites: FavoritesMap): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Error saving favorites to storage:", error);
  }
}

/**
 * Get all favorites as an array
 */
export async function getFavorites(): Promise<FavoriteItem[]> {
  const favoritesMap = await getFavoritesMap();
  return Object.keys(favoritesMap).map((key) => {
    const [typename, id] = key.split(":");
    return {
      id,
      typename,
      timestamp: new Date().toISOString(),
    };
  });
}

/**
 * Check if an item is favorite
 */
export async function isFavorite(parent: {
  id: string;
  __typename: string;
}): Promise<boolean> {
  const favoritesMap = await getFavoritesMap();
  const key = createKey(parent.__typename, parent.id);
  return key in favoritesMap;
}

/**
 * Toggle favorite status
 * @param id - The entity id
 * @param __typename - The entity typename
 * @param shouldBeFavorite - Optional: if specified, set to this value; if omitted, toggle current state
 * @returns The new favorite state (true if favorited, false if not)
 */
export async function toggleFavorite(
  id: string,
  __typename: string,
  shouldBeFavorite?: boolean
): Promise<boolean> {
  return await favoritesMutex.runExclusive(async () => {
    const favoritesMap = await getFavoritesMap();
    const key = createKey(__typename, id);
    if (shouldBeFavorite === undefined) {
      // Toggle the current state
      if (favoritesMap[key]) {
        delete favoritesMap[key];
      } else {
        favoritesMap[key] = true;
      }
    } else if (shouldBeFavorite) {
      // Explicitly set to favorite
      favoritesMap[key] = true;
    } else {
      // Explicitly remove from favorites
      delete favoritesMap[key];
    }

    await saveFavoritesMap(favoritesMap);
    return !!favoritesMap[key];
  });
}
