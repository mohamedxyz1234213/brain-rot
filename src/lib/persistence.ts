import AsyncStorage from '@react-native-async-storage/async-storage';

const isClient = typeof window !== 'undefined';

const DEFAULT_USER_SUFFIX = 'anon';

let activeUserStorageSuffix = DEFAULT_USER_SUFFIX;
const suffixListeners = new Set<(suffix: string) => void>();

export function setActiveUserStorageSuffix(userId: string | null | undefined) {
  const nextSuffix = userId || DEFAULT_USER_SUFFIX;
  if (activeUserStorageSuffix === nextSuffix) return;
  activeUserStorageSuffix = nextSuffix;
  suffixListeners.forEach((listener) => listener(nextSuffix));
}

export function getActiveUserStorageSuffix() {
  return activeUserStorageSuffix;
}

export function persist<S extends object>(
  config: {
    name: string;
    version?: number;
    partialize?: (state: any) => any;
    onHydrate?: (set: (partial: any) => void, get: () => any) => void;
    /** Minimum ms between AsyncStorage writes (default 300). 0 = no debounce. */
    debounceMs?: number;
    getStorageKeySuffix?: () => string | null | undefined;
  },
  stateCreator: (set: any, get: any, store: any) => S
): (set: any, get: any, store: any) => S {
  return (set, get, store) => {
    const initialState = stateCreator(set, get, store);

    if (isClient) {
      const getKey = () => {
        const suffix = config.getStorageKeySuffix?.();
        return `brainrot_${config.name}${suffix ? `_${suffix}` : ''}`;
      };
      const debounceMs = config.debounceMs ?? 300;
      let writeTimer: ReturnType<typeof setTimeout> | null = null;
      let hydratedKey: string | null = null;

      const hydrateFromKey = (key: string, shouldNotify = false) => {
        hydratedKey = key;
        AsyncStorage.getItem(key).then((value) => {
          if (hydratedKey !== key) return;
          const data = value ? parsePersistedValue(value) : null;
          const state = data?.version === (config.version || 1)
            ? data.data
            : initialState;
          const toMerge = config.partialize
            ? config.partialize(state)
            : state;
          set(toMerge);
        }).finally(() => {
          if (shouldNotify && hydratedKey === key) config.onHydrate?.(set, get);
        });
      };

      const parsePersistedValue = (value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          // ignore corrupted data
          return null;
        }
      };

      hydrateFromKey(getKey(), true);

      store.subscribe(() => {
        if (writeTimer) clearTimeout(writeTimer);
        if (debounceMs === 0) {
          flush();
          return;
        }
        writeTimer = setTimeout(flush, debounceMs);
      });

      function flush() {
        try {
          const currentState = get();
          const toStore = config.partialize
            ? config.partialize(currentState)
            : currentState;
          AsyncStorage.setItem(
            getKey(),
            JSON.stringify({ version: config.version || 1, data: toStore })
          );
        } catch {
          // serialization can throw for circular refs etc.
        }
      }

      if (config.getStorageKeySuffix) {
        suffixListeners.add(() => {
          const key = getKey();
          if (hydratedKey !== key) hydrateFromKey(key);
        });
      }
    } else {
      config.onHydrate?.(set, get);
    }

    return initialState;
  };
}
