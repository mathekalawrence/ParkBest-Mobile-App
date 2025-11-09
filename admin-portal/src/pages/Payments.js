import React, { useState, useEffect } from 'react';
import { parkbestAPI } from '../services/parkbestAPI';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadPayments();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadPayments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const result = await parkbestAPI.getPayments();
    if (result.success) {
      setPayments(result.data.payments);
    } else {
      console.error('Failed to load payments:', result.message);
      setPayments([]);
    }
    setLoading(false);
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const refundPayment = async (paymentId, amount) => {
    if (window.confirm(`Refund Ksh ${amount} for this payment?`)) {
      alert(`Refund payment ${paymentId} - Ksh ${amount}`);
    }
  };

  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    filters: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
    input: { padding: '10px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    select: { padding: '10px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' },
    th: { background: '#f8fafc', padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '13px' },
    statusBadge: { padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', display: 'inline-block' },
    statusCompleted: { background: '#d1fae5', color: '#065f46' },
    statusPending: { background: '#fef3c7', color: '#92400e' },
    statusFailed: { background: '#fee2e2', color: '#991b1b' },
    btnPrimary: { background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
    btnDanger: { background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed': return {...styles.statusBadge, ...styles.statusCompleted};
      case 'pending': return {...styles.statusBadge, ...styles.statusPending};
      case 'failed': return {...styles.statusBadge, ...styles.statusFailed};
      default: return styles.statusBadge;
    }
  };

  const calculateStats = () => {
    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const completedCount = payments.filter(p => p.status === 'completed').length;
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    
    return { totalRevenue, pendingAmount, completedCount, pendingCount };
  };

  const stats = calculateStats();

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.mpesa_receipt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div style={styles.container}>Loading payments...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{color: '#1f2937', marginBottom: '8px'}}>💳 Payment Management</h1>
          <p style={{color: '#6b7280'}}>View and manage payment transactions</p>
        </div>
      </div>

      {/* Payment Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
            <div style={{padding: '8px', borderRadius: '8px', background: '#d1fae5', color: '#065f46', marginRight: '10px'}}>💰</div>
            <div>
              <div style={{fontSize: '12px', color: '#6b7280'}}>Total Revenue</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#059669'}}>Ksh {stats.totalRevenue.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
            <div style={{padding: '8px', borderRadius: '8px', background: '#fef3c7', color: '#92400e', marginRight: '10px'}}>⏳</div>
            <div>
              <div style={{fontSize: '12px', color: '#6b7280'}}>Pending Amount</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#f59e0b'}}>Ksh {stats.pendingAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
            <div style={{padding: '8px', borderRadius: '8px', background: '#dbeafe', color: '#1e40af', marginRight: '10px'}}>✅</div>
            <div>
              <div style={{fontSize: '12px', color: '#6b7280'}}>Completed</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#3b82f6'}}>{stats.completedCount}</div>
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
            <div style={{padding: '8px', borderRadius: '8px', background: '#fef3c7', color: '#92400e', marginRight: '10px'}}>⏰</div>
            <div>
              <div style={{fontSize: '12px', color: '#6b7280'}}>Pending</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#f59e0b'}}>{stats.pendingCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by user, receipt, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{...styles.input, minWidth: '250px'}}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <div style={{flex: 1}}></div>
        <div style={{fontSize: '14px', color: '#6b7280'}}>
          {filteredPayments.length} payments
        </div>
      </div>

      {/* Payments Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Customer</th>
            <th style={styles.th}>Booking</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Method</th>
            <th style={styles.th}>Receipt</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map(payment => (
            <tr key={payment.id}>
              <td style={styles.td}>
                <div style={{fontWeight: '500', color: '#1f2937'}}>{payment.user_name}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>{payment.phone}</div>
              </td>
              <td style={styles.td}>
                <div style={{fontWeight: '500'}}>{payment.booking_id}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>{payment.zone_name} - {payment.spot_number}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>{payment.vehicle_plate}</div>
              </td>
              <td style={styles.td}>
                <span style={{color: '#059669', fontWeight: 'bold', fontSize: '14px'}}>Ksh {payment.amount}</span>
              </td>
              <td style={styles.td}>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <span>📱</span>
                  <span>{payment.payment_method}</span>
                </div>
              </td>
              <td style={styles.td}>
                {payment.mpesa_receipt ? (
                  <div style={{fontFamily: 'monospace', fontSize: '11px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px'}}>
                    {payment.mpesa_receipt}
                  </div>
                ) : (
                  <span style={{color: '#9ca3af', fontSize: '11px'}}>Pending</span>
                )}
              </td>
              <td style={styles.td}>
                <span style={getStatusStyle(payment.status)}>{payment.status}</span>
              </td>
              <td style={styles.td}>
                <div>{new Date(payment.created_at).toLocaleDateString()}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>
                  {new Date(payment.created_at).toLocaleTimeString()}
                </div>
              </td>
              <td style={styles.td}>
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                  <button 
                    style={styles.btnPrimary}
                    onClick={() => viewPaymentDetails(payment)}
                  >
                    👁️ View
                  </button>
                  {payment.status === 'completed' && (
                    <button 
                      style={styles.btnDanger}
                      onClick={() => refundPayment(payment.id, payment.amount)}
                    >
                      💸 Refund
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h2 style={{margin: 0}}>💳 Payment Details</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
              >
                ×
              </button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
              <div>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>👤 Customer Information</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  <div><strong>Name:</strong> {selectedPayment.user_name}</div>
                  <div><strong>Email:</strong> {selectedPayment.user_email}</div>
                  <div><strong>Phone:</strong> {selectedPayment.phone}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>🅿️ Booking Information</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  <div><strong>Booking ID:</strong> {selectedPayment.booking_id}</div>
                  <div><strong>Zone:</strong> {selectedPayment.zone_name}</div>
                  <div><strong>Spot:</strong> {selectedPayment.spot_number}</div>
                  <div><strong>Vehicle:</strong> {selectedPayment.vehicle_plate}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 style={{color: '#1f2937', marginBottom: '10px'}}>💰 Payment Information</h4>
              <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                  <div><strong>Amount:</strong> <span style={{color: '#059669', fontWeight: 'bold'}}>Ksh {selectedPayment.amount}</span></div>
                  <div><strong>Method:</strong> {selectedPayment.payment_method}</div>
                  <div><strong>Status:</strong> <span style={getStatusStyle(selectedPayment.status)}>{selectedPayment.status}</span></div>
                  <div><strong>Request ID:</strong> <span style={{fontFamily: 'monospace', fontSize: '12px'}}>{selectedPayment.checkout_request_id}</span></div>
                  {selectedPayment.mpesa_receipt && (
                    <div><strong>M-Pesa Receipt:</strong> <span style={{fontFamily: 'monospace', fontSize: '12px', background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px'}}>{selectedPayment.mpesa_receipt}</span></div>
                  )}
                  <div><strong>Created:</strong> {new Date(selectedPayment.created_at).toLocaleString()}</div>
                  {selectedPayment.completed_at && (
                    <div><strong>Completed:</strong> {new Date(selectedPayment.completed_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;