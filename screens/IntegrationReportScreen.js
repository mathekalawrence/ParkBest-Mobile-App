import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import reportingService from '../services/reportingService';
import apiClient from '../services/api';

export default function IntegrationReportScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState({
    backend: 'checking',
    database: 'checking',
    auth: 'checking'
  });
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadReports();
    checkIntegrationStatus();
  }, []);

  const loadReports = async () => {
    try {
      const localReports = reportingService.getReports();
      const summaryData = reportingService.generateSummary();
      
      setReports(localReports.slice(0, 10)); // Show last 10 reports
      setSummary(summaryData);
      
      // Try to sync with backend
      try {
        const response = await apiClient.get('/reports/user');
        await reportingService.logIntegrationEvent('BACKEND_SYNC', 'success', 'Reports synced successfully');
      } catch (error) {
        await reportingService.logIntegrationEvent('BACKEND_SYNC', 'error', error.message);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIntegrationStatus = async () => {
    // Check backend connection
    try {
      await apiClient.get('/');
      setIntegrationStatus(prev => ({ ...prev, backend: 'connected' }));
      
      // If backend is connected, check database
      try {
        await apiClient.get('/reports/summary');
        setIntegrationStatus(prev => ({ ...prev, database: 'connected' }));
      } catch (error) {
        setIntegrationStatus(prev => ({ ...prev, database: 'error' }));
      }
    } catch (error) {
      setIntegrationStatus(prev => ({ ...prev, backend: 'offline' }));
    }
    
    // Check auth status
    setIntegrationStatus(prev => ({ 
      ...prev, 
      auth: user ? 'authenticated' : 'not_authenticated' 
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    await checkIntegrationStatus();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
        return '#4caf50';
      case 'offline':
      case 'error':
      case 'not_authenticated':
        return '#f44336';
      case 'checking':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      connected: 'Connected',
      offline: 'Offline',
      error: 'Error',
      checking: 'Checking...',
      authenticated: 'Logged In',
      not_authenticated: 'Not Logged In'
    };
    return statusMap[status] || status;
  };

  const handleReportPress = (report) => {
    Alert.alert(
      `${report.type} Event`,
      `Event: ${report.event}\n\nTime: ${new Date(report.timestamp).toLocaleString()}\n\nData: ${JSON.stringify(report.data, null, 2)}`,
      [{ text: 'OK' }]
    );
  };

  const testIntegration = async () => {
    await reportingService.logIntegrationEvent('TEST', 'success', 'Manual integration test');
    Alert.alert('Success', 'Integration test logged successfully!');
    loadReports();
  };

  const clearReports = async () => {
    Alert.alert(
      'Clear Reports',
      'Are you sure you want to clear all local reports?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await reportingService.clearReports();
            loadReports();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading integration report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Integration Report</Text>
        <TouchableOpacity onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Integration Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <Ionicons name="server-outline" size={20} color={getStatusColor(integrationStatus.backend)} />
              <Text style={styles.statusLabel}>Backend</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(integrationStatus.backend) }]}>
                {getStatusText(integrationStatus.backend)}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Ionicons name="database-outline" size={20} color={getStatusColor(integrationStatus.database)} />
              <Text style={styles.statusLabel}>Database</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(integrationStatus.database) }]}>
                {getStatusText(integrationStatus.database)}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Ionicons name="person-outline" size={20} color={getStatusColor(integrationStatus.auth)} />
              <Text style={styles.statusLabel}>Authentication</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(integrationStatus.auth) }]}>
                {getStatusText(integrationStatus.auth)}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Statistics */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{summary.totalEvents}</Text>
                <Text style={styles.summaryLabel}>Total Events</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{summary.authEvents.successful}</Text>
                <Text style={styles.summaryLabel}>Successful Logins</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{summary.integrationEvents.total}</Text>
                <Text style={styles.summaryLabel}>API Calls</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reportCard}
                onPress={() => handleReportPress(report)}
              >
                <View style={styles.reportHeader}>
                  <Text style={styles.reportType}>{report.type}</Text>
                  <Text style={styles.reportTime}>
                    {new Date(report.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.reportEvent}>{report.event}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noReports}>No activity recorded yet</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={testIntegration}>
            <Ionicons name="flash-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Test Integration</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={clearReports}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Clear Reports</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '30%',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reportType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  reportTime: {
    fontSize: 12,
    color: '#666',
  },
  reportEvent: {
    fontSize: 14,
    color: '#333',
  },
  noReports: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});