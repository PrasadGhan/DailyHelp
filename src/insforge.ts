import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@insforge/sdk';

export const INSFORGE_URL = 'https://ey3g5hn2.us-east.insforge.app';
export const INSFORGE_ANON_KEY = 'anon_60c18917e62a537f75c9ac031e2c82f140782b345ff2bd37991fb660c70dd17a';

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
  isServerMode: true,
  auth: {detectOAuthCallback: false},
});

const ACCESS_TOKEN_KEY = 'insforge_access_token';
const REFRESH_TOKEN_KEY = 'insforge_refresh_token';

export async function saveAuthSession(accessToken: string, refreshToken?: string) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  insforge.getHttpClient().setAuthToken(accessToken);

  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    insforge.getHttpClient().setRefreshToken(refreshToken);
  }
}

export async function restoreAuthSession() {
  const [accessToken, refreshToken] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  ]);

  if (accessToken) {
    insforge.getHttpClient().setAuthToken(accessToken);
  }
  if (refreshToken) {
    insforge.getHttpClient().setRefreshToken(refreshToken);
  }

  if (accessToken) {
    const {data, error} = await insforge.auth.getCurrentUser();
    if (!error && data?.user) {
      return data.user;
    }
  }

  if (refreshToken) {
    const {data, error} = await insforge.auth.refreshSession({refreshToken});
    if (!error && data?.accessToken) {
      await saveAuthSession(data.accessToken, data.refreshToken);
      const current = await insforge.auth.getCurrentUser();
      return current.data?.user ?? null;
    }
  }

  await clearAuthSession();
  return null;
}

export async function clearAuthSession() {
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
  ]);
  insforge.getHttpClient().setAuthToken(null);
  insforge.getHttpClient().setRefreshToken(null);
}
