import React, { useState, useEffect } from 'react';
import { parkbestAPI } from '../services/parkbestAPI';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadReports();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadReports();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const result = await parkbestAPI.getReports();
    if (result.success) {
      setReports(result.data.reports);
    } else {
      console.error('Failed to load reports:', result.message);
      setReports([]);
    }
    setLoading(false);
  };

  const generateReport = async (type) => {
    const result = await parkbestAPI.generateReport(type);
    if (result.success) {
      alert(`${type} report generated successfully!`);
      loadReports();
    } else {
      alert('Failed to generate report: ' + result.message);
    }
  };

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const downloadReport = (reportId, fileName) => {
    alert(`Download report: ${fileName}`);
  };

  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    filters: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
    select: { padding: '10px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    quickActions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' },
    actionCard: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' },
    th: { background: '#f8fafc', padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '13px' },
    statusBadge: { padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', display: 'inline-block' },
    statusReady: { background: '#d1fae5', color: '#065f46' },
    statusProcessing: { background: '#fef3c7', color: '#92400e' },
    btnPrimary: { background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
    btnSuccess: { background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'ready': return {...styles.statusBadge, ...styles.statusReady};
      case 'processing': return {...styles.statusBadge, ...styles.statusProcessing};
      default: return styles.statusBadge;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(report.created_at).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(report.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
    return matchesDate && matchesType;
  });

  if (loading) {
    return <div style={styles.container}>Loading reports...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{color: '#1f2937', marginBottom: '8px'}}>📊 Reports & Analytics</h1>
          <p style={{color: '#6b7280'}}>Generate and manage system reports</p>
        </div>
      </div>

      {/* Quick Report Generation */}
      <div style={styles.quickActions}>
        {[
          { type: 'revenue', title: 'Revenue Report', icon: '💰', desc: 'Daily/Monthly revenue analysis' },
          { type: 'usage', title: 'Usage Report', icon: '📈', desc: 'Parking zone utilization stats' },
          { type: 'users', title: 'User Report', icon: '👥', desc: 'User registration and activity' },
          { type: 'payments', title: 'Payment Report', icon: '💳', desc: 'Transaction and payment analysis' }
        ].map(report => (
          <div 
            key={report.type}
            style={styles.actionCard}
            onClick={() => generateReport(report.type)}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{fontSize: '24px', marginBottom: '10px'}}>{report.icon}</div>
            <div style={{fontWeight: '500', marginBottom: '5px'}}>{report.title}</div>
            <div style={{fontSize: '12px', color: '#6b7280'}}>{report.desc}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Types</option>
          <option value="revenue">Revenue</option>
          <option value="usage">Usage</option>
          <option value="users">Users</option>
          <option value="payments">Payments</option>
        </select>
        <div style={{flex: 1}}></div>
        <div style={{fontSize: '14px', color: '#6b7280'}}>
          {filteredReports.length} reports
        </div>
      </div>

      {/* Reports Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Report Name</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Generated</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Size</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map(report => (
            <tr key={report.id}>
              <td style={styles.td}>
                <div style={{fontWeight: '500', color: '#1f2937'}}>{report.report_name}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>{report.description}</div>
              </td>
              <td style={styles.td}>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <span>
                    {report.report_type === 'revenue' && '💰'}
                    {report.report_type === 'usage' && '📈'}
                    {report.report_type === 'users' && '👥'}
                    {report.report_type === 'payments' && '💳'}
                  </span>
                  <span style={{textTransform: 'capitalize'}}>{report.report_type}</span>
                </div>
              </td>
              <td style={styles.td}>
                <div>{new Date(report.created_at).toLocaleDateString()}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>
                  {new Date(report.created_at).toLocaleTimeString()}
                </div>
              </td>
              <td style={styles.td}>
                <span style={getStatusStyle(report.status)}>{report.status}</span>
              </td>
              <td style={styles.td}>
                <span style={{color: '#6b7280'}}>{report.file_size || 'N/A'}</span>
              </td>
              <td style={styles.td}>
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                  <button 
                    style={styles.btnPrimary}
                    onClick={() => viewReportDetails(report)}
                  >
                    👁️ View
                  </button>
                  {report.status === 'ready' && (
                    <button 
                      style={styles.btnSuccess}
                      onClick={() => downloadReport(report.id, report.file_name)}
                    >
                      📥 Download
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h2 style={{margin: 0}}>📊 Report Details</h2>
              <button 
                onClick={() => setShowReportModal(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
              >
                ×
              </button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>📋 Report Information</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  <div><strong>Name:</strong> {selectedReport.report_name}</div>
                  <div><strong>Type:</strong> {selectedReport.report_type}</div>
                  <div><strong>Status:</strong> <span style={getStatusStyle(selectedReport.status)}>{selectedReport.status}</span></div>
                  <div><strong>Description:</strong> {selectedReport.description}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>📁 File Information</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  <div><strong>File Name:</strong> {selectedReport.file_name}</div>
                  <div><strong>Size:</strong> {selectedReport.file_size || 'N/A'}</div>
                  <div><strong>Generated:</strong> {new Date(selectedReport.created_at).toLocaleString()}</div>
                  <div><strong>Format:</strong> {selectedReport.file_format || 'PDF'}</div>
                </div>
              </div>
            </div>
            
            {selectedReport.summary && (
              <div style={{marginTop: '20px'}}>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>📈 Report Summary</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  {selectedReport.summary}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;