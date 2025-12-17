import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { listClients, Client } from '@/services/video-parser-api';

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const clientList = await listClients();
      setClients(clientList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Show date
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (lastSeenAt: number | null): string => {
    if (!lastSeenAt) return '#ef4444'; // red - never seen
    const diff = Date.now() - lastSeenAt;
    if (diff < 30000) return '#22c55e'; // green - active (< 30s)
    if (diff < 300000) return '#eab308'; // yellow - recent (< 5min)
    return '#ef4444'; // red - inactive
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Connected Clients</ThemedText>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchClients}
          disabled={loading}
        >
          <ThemedText style={styles.refreshButtonText}>
            {loading ? '↻' : '⟳'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {loading && clients.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading clients...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchClients}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : clients.length === 0 ? (
        <View style={styles.centerContent}>
          <ThemedText style={styles.emptyText}>No connected clients</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Start streaming pose data from a client to see it here
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {clients.map((client) => (
            <View key={client.clientId} style={styles.clientCard}>
              <View style={styles.clientHeader}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(client.lastSeenAt) },
                  ]}
                />
                <ThemedText type="defaultSemiBold" style={styles.clientId}>
                  Client
                </ThemedText>
              </View>

              <View style={styles.clientDetails}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>ID:</ThemedText>
                  <ThemedText style={styles.detailValue} numberOfLines={1}>
                    {client.clientId}
                  </ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Last Seen:</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {formatTimestamp(client.lastSeenAt)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.clientFooter}>
                <ThemedText style={styles.footerHint}>
                  Video ID will be this client’s ID
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.infoBox}>
        <ThemedText style={styles.infoText}>
          💡 Each connected WebSocket client automatically records a video. Use the client ID as
          the video ID for comparison.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  loadingText: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    opacity: 0.6,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  clientCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    gap: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  clientId: {
    fontSize: 16,
  },
  clientDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    minWidth: 70,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    flex: 1,
  },
  clientFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
    paddingTop: 8,
  },
  footerHint: {
    fontSize: 11,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  infoBox: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 18,
  },
});
