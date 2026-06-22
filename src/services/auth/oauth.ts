import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { User } from '../backend/interface';
import { useSettingsStore } from '../../stores/settingsStore';

WebBrowser.maybeCompleteAuthSession();

export type AuthProvider = 'email' | 'google' | 'apple';

export interface OAuthProfile {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

export const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
};

export const googleRedirectUri = AuthSession.makeRedirectUri({
  scheme: 'brainrot',
  path: 'oauth/google',
});

export function getGoogleClientId() {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
  }

  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
  }

  return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
}

export function makeAppUser(profile: OAuthProfile): User {
  const settings = useSettingsStore.getState();
  const now = new Date().toISOString();
  const stableId = profile.providerId.replace(/[^a-zA-Z0-9_-]/g, '_');

  return {
    id: `${profile.provider}_${stableId}`,
    clerkId: `${profile.provider}_${stableId}`,
    name: profile.name.trim() || profile.email.split('@')[0] || 'BrainRot Healer',
    email: profile.email.trim(),
    avatar: profile.avatar,
    brainScore: 0,
    xp: 0,
    level: 'Zombie',
    streakDays: 0,
    roastPersona: settings.roastPersona,
    language: settings.language,
    religionEnabled: settings.religionEnabled,
    subscriptionTier: 'free',
    createdAt: now,
    updatedAt: now,
  };
}

export function makeEmailUser(name: string, email: string): User {
  return makeAppUser({
    provider: 'email',
    providerId: email.toLowerCase(),
    email,
    name: name || email.split('@')[0],
  });
}

export async function getGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const info = await AuthSession.fetchUserInfoAsync({ accessToken }, googleDiscovery);
  const email = typeof info.email === 'string' ? info.email : '';
  const providerId = typeof info.sub === 'string' ? info.sub : email;
  const name = typeof info.name === 'string' ? info.name : email.split('@')[0];
  const avatar = typeof info.picture === 'string' ? info.picture : undefined;

  if (!email || !providerId) {
    throw new Error('Google did not return a usable profile.');
  }

  return { provider: 'google', providerId, email, name, avatar };
}

export async function signInWithApple(): Promise<OAuthProfile> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const formattedName = credential.fullName
    ? AppleAuthentication.formatFullName(credential.fullName, 'default')
    : '';
  const email = credential.email || `${credential.user}@privaterelay.appleid.com`;

  return {
    provider: 'apple',
    providerId: credential.user,
    email,
    name: formattedName || email.split('@')[0] || 'Apple User',
  };
}
