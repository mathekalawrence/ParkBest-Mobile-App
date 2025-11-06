import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

class ReportingService {
  constructor() {
    this.reports = [];
    this.loadReports();
  }

  // Load reports from local storage
  async loadReports() {
    try {
      const storedReports = await AsyncStorage.getItem('parkingReports');
      this.reports = storedReports ? JSON.parse(storedReports) : [];
    } catch (error) {
      console.error('Error loading reports:', error);
      this.reports = [];
    }
  }

  // Save reports to local storage
  async saveReports() {
    try {
      await AsyncStorage.setItem('parkingReports', JSON.stringify(this.reports));
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  }

  // Log user authentication events
  async logAuthEvent(eventType, data) {
    const report = {
      id: Date.now().toString(),
      type: 'AUTH',
      event: eventType,
      timestamp: new Date().toISOString(),
      data: {
        email: data.email,
        success: data.success,
        message: data.message
      }
    };

    this.reports.push(report);
    await this.saveReports();
    
    // Send to backend if connected
    try {
      await apiClient.post('/reports/auth', report);
    } catch (error) {
      console.log('Offline mode - report saved locally');
    }

    return report;
  }

  // Log parking activities
  async logParkingEvent(eventType, data) {
    const report = {
      id: Date.now().toString(),
      type: 'PARKING',
      event: eventType,
      timestamp: new Date().toISOString(),
      data
    };

    this.reports.push(report);
    await this.saveReports();

    try {
      await apiClient.post('/reports/parking', report);
    } catch (error) {
      console.log('Offline mode - report saved locally');
    }

    return report;
  }

  // Log system integration events
  async logIntegrationEvent(service, status, details) {
    const report = {
      id: Date.now().toString(),
      type: 'INTEGRATION',
      event: 'API_CALL',
      timestamp: new Date().toISOString(),
      data: {
        service,
        status,
        details
      }
    };

    this.reports.push(report);
    await this.saveReports();

    return report;
  }

  // Get all reports
  getReports() {
    return this.reports;
  }

  // Get reports by type
  getReportsByType(type) {
    return this.reports.filter(report => report.type === type);
  }

  // Generate summary report
  generateSummary() {
    const authEvents = this.getReportsByType('AUTH');
    const parkingEvents = this.getReportsByType('PARKING');
    const integrationEvents = this.getReportsByType('INTEGRATION');

    return {
      totalEvents: this.reports.length,
      authEvents: {
        total: authEvents.length,
        successful: authEvents.filter(e => e.data.success).length,
        failed: authEvents.filter(e => !e.data.success).length
      },
      parkingEvents: {
        total: parkingEvents.length,
        bookings: parkingEvents.filter(e => e.event === 'BOOKING_CREATED').length,
        cancellations: parkingEvents.filter(e => e.event === 'BOOKING_CANCELLED').length
      },
      integrationEvents: {
        total: integrationEvents.length,
        successful: integrationEvents.filter(e => e.data.status === 'success').length,
        failed: integrationEvents.filter(e => e.data.status === 'error').length
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // Clear all reports
  async clearReports() {
    this.reports = [];
    await AsyncStorage.removeItem('parkingReports');
  }
}

export default new ReportingService();