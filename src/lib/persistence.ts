import AsyncStorage from '@react-native-async-storage/async-storage';

const isClient = typeof window !== 'undefined';

export function persist<S extends object>(
  config: {
    name: string;
    version?: number;
    partialize?: (state: any) => any;
    onHydrate?: (set: (partial: any) => void) => void;
    /** Minimum ms between AsyncStorage writes (default 300). 0 = no debounce. */
    debounceMs?: number;
  },
  stateCreator: (set: any, get: any, store: any) => S
): (set: any, get: any, store: any) => S {
  return (set, get, store) => {
    const initialState = stateCreator(set, get, store);

    if (isClient) {
      const key = `brainrot_${config.name}`;
      const debounceMs = config.debounceMs ?? 300;
      let writeTimer: ReturnType<typeof setTimeout> | null = null;

      AsyncStorage.getItem(key)
        .then((value) => {
          if (value) {
            try {
              const parsed = JSON.parse(value);
              if (parsed.version === (config.version || 1)) {
                const toMerge = config.partialize
                  ? config.partialize(parsed.data)
                  : parsed.data;
                set(toMerge);
              }
            } catch {
              // ignore corrupted data
            }
          }
        })
        .finally(() => {
          config.onHydrate?.(set);
        });

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
            key,
            JSON.stringify({ version: config.version || 1, data: toStore })
          );
        } catch {
          // serialization can throw for circular refs etc.
        }
      }
    } else {
      config.onHydrate?.(set);
    }

    return initialState;
  };
}
