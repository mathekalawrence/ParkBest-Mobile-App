import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import reportingService from '../services/reportingService';

export default function OfflineReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadReports();
    checkNetworkStatus();
  }, []);

  const loadReports = () => {
    const allReports = reportingService.getReports();
    setReports(allReports.reverse()); // Show newest first
  };

  const checkNetworkStatus = async () => {
    const networkState = await Network.getNetworkStateAsync();
    setIsOnline(networkState.isConnected);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
    checkNetworkStatus();
    setRefreshing(false);
  };

  const syncReports = async () => {
    if (!isOnline) {
      Alert.alert('No Connection', 'Please check your internet connection and try again.');
      return;
    }

    setSyncing(true);
    try {
      const result = await reportingService.syncOfflineReports();
      loadReports(); // Refresh the list
      
      Alert.alert(
        'Sync Complete',
        `${result.synced} of ${result.total} reports synced successfully.`
      );
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync reports. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const clearAllReports = () => {
    Alert.alert(
      'Clear All Reports',
      'Are you sure you want to delete all local reports? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await reportingService.clearReports();
            loadReports();
          }
        }
      ]
    );
  };

  const getStatusColor = (report) => {
    if (report.synced === true) return '#4caf50';
    if (report.synced === false) return '#ff9800';
    return '#9e9e9e';
  };

  const getStatusText = (report) => {
    if (report.synced === true) return 'Synced';
    if (report.synced === false) return 'Pending';
    return 'Local';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'INCIDENT': return 'warning';
      case 'AUTH': return 'person';
      case 'PARKING': return 'car';
      case 'INTEGRATION': return 'link';
      default: return 'document';
    }
  };

  const renderReport = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportType}>
          <Ionicons name={getTypeIcon(item.type)} size={20} color="#1a237e" />
          <Text style={styles.reportTypeText}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) }]}>
          <Text style={styles.statusText}>{getStatusText(item)}</Text>
        </View>
      </View>
      
      <Text style={styles.reportEvent}>{item.event}</Text>
      <Text style={styles.reportTime}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      
      {item.type === 'INCIDENT' && item.data.description && (
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.data.description}
        </Text>
      )}
    </View>
  );

  const unsyncedCount = reports.filter(r => r.synced === false).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Reports</Text>
        <View style={styles.networkStatus}>
          <Ionicons 
            name={isOnline ? "wifi" : "wifi-off"} 
            size={20} 
            color={isOnline ? "#4caf50" : "#f44336"} 
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#ff9800' }]}>{unsyncedCount}</Text>
          <Text style={styles.statLabel}>Pending Sync</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#4caf50' }]}>
            {reports.filter(r => r.synced === true).length}
          </Text>
          <Text style={styles.statLabel}>Synced</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, !isOnline && styles.disabledButton]}
          onPress={syncReports}
          disabled={!isOnline || syncing}
        >
          <Ionicons name="sync" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>
            {syncing ? 'Syncing...' : 'Sync Reports'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.clearButton]}
          onPress={clearAllReports}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  networkStatus: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  actionButton: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    padding: 15,
  },
  reportCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportEvent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  reportTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  reportDescription: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
  },
});