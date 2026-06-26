import { ClerkProvider, ClerkProviderProps } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { ReactNode } from 'react';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY not set - using local auth mode');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={undefined}
    >
      {children}
    </ClerkProvider>
  );
}