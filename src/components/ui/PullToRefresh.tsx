import React, { useState, useCallback, forwardRef } from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';
import { Colors } from '../../constants/theme';

interface PullToRefreshProps extends ScrollViewProps {
  /** Function called when user pulls to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Whether the refresh is currently in progress (optional, for external control) */
  refreshing?: boolean;
}

/**
 * Drop-in replacement for ScrollView that adds pull-to-refresh.
 * Wrap any screen's content in <PullToRefresh onRefresh={...}> instead of <ScrollView>.
 */
export const PullToRefresh = forwardRef<ScrollView, PullToRefreshProps>(
  ({ onRefresh, refreshing: externalRefreshing, children, refreshControl: _ignoredRefreshControl, ...scrollViewProps }, ref) => {
    const [internalRefreshing, setInternalRefreshing] = useState(false);

    const isRefreshing = externalRefreshing ?? internalRefreshing;

    const handleRefresh = useCallback(async () => {
      if (!onRefresh) return;
      setInternalRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setInternalRefreshing(false);
      }
    }, [onRefresh]);

    return (
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.PRIMARY_LIGHT}
              colors={[Colors.PRIMARY_LIGHT]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }
);

PullToRefresh.displayName = 'PullToRefresh';
