import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@graphqlconf:favorites";

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
 * Add a favorite
 */
export async function addFavorite(id: string, typename: string): Promise<void> {
  const favoritesMap = await getFavoritesMap();
  const key = createKey(typename, id);
  favoritesMap[key] = true;
  await saveFavoritesMap(favoritesMap);
}

/**
 * Remove a favorite
 */
export async function removeFavorite(
  id: string,
  typename: string
): Promise<void> {
  const favoritesMap = await getFavoritesMap();
  const key = createKey(typename, id);
  delete favoritesMap[key];
  await saveFavoritesMap(favoritesMap);
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  id: string,
  __typename: string
): Promise<boolean> {
  if (await isFavorite({ id, __typename })) {
    await removeFavorite(id, __typename);
    return false;
  } else {
    await addFavorite(id, __typename);
    return true;
  }
}
