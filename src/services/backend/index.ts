/**
 * Backend Factory
 * Reads EXPO_PUBLIC_BACKEND env var and exports the correct service instance.
 * Switching backends = changing one env var only.
 */

import { IBackendService } from './interface';
import { MongoBackendService } from './mongo.service';
import { SupabaseBackendService } from './supabase.service';

const BACKEND = process.env.EXPO_PUBLIC_BACKEND || 'mongo';

function createBackendService(): IBackendService {
  switch (BACKEND) {
    case 'supabase':
      return new SupabaseBackendService();
    case 'mongo':
    default:
      return new MongoBackendService();
  }
}

export const backendService: IBackendService = createBackendService();

export function setBackendAuthToken(token: string | null) {
  backendService.setAuthToken(token);
}

export type { IBackendService } from './interface';
export * from './interface';
