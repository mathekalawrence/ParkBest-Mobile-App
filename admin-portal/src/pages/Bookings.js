import React, { useState, useEffect } from 'react';
import { parkbestAPI } from '../services/parkbestAPI';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadBookings();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadBookings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const result = await parkbestAPI.getBookings();
    if (result.success) {
      setBookings(result.data.bookings);
    } else {
      console.error('Failed to load bookings:', result.message);
      setBookings([]);
    }
    setLoading(false);
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    if (window.confirm(`Change booking status to ${newStatus}?`)) {
      alert(`Update booking ${bookingId} to ${newStatus}`);
      loadBookings();
    }
  };

  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    filters: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
    input: { padding: '10px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    select: { padding: '10px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' },
    th: { background: '#f8fafc', padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '12px' },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '13px' },
    statusBadge: { padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', display: 'inline-block' },
    statusActive: { background: '#d1fae5', color: '#065f46' },
    statusCompleted: { background: '#dbeafe', color: '#1e40af' },
    statusCancelled: { background: '#fee2e2', color: '#991b1b' },
    btnPrimary: { background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
    btnSuccess: { background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
    btnDanger: { background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'active': return {...styles.statusBadge, ...styles.statusActive};
      case 'completed': return {...styles.statusBadge, ...styles.statusCompleted};
      case 'cancelled': return {...styles.statusBadge, ...styles.statusCancelled};
      default: return styles.statusBadge;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.zone_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div style={styles.container}>Loading bookings...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{color: '#1f2937', marginBottom: '8px'}}>📋 Booking Management</h1>
          <p style={{color: '#6b7280'}}>View and manage parking bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by user, vehicle, or zone..."
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
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div style={{flex: 1}}></div>
        <div style={{fontSize: '14px', color: '#6b7280'}}>
          {filteredBookings.length} bookings
        </div>
      </div>

      {/* Bookings Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Customer</th>
            <th style={styles.th}>Vehicle</th>
            <th style={styles.th}>Zone & Spot</th>
            <th style={styles.th}>Duration</th>
            <th style={styles.th}>Cost</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Payment</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map(booking => (
            <tr key={booking.id}>
              <td style={styles.td}>
                <div style={{fontWeight: '500', color: '#1f2937'}}>{booking.user_name}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>{booking.user_email}</div>
              </td>
              <td style={styles.td}>
                <div style={{fontWeight: '500'}}>{booking.vehicle_plate}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>{booking.vehicle_make} {booking.vehicle_model}</div>
              </td>
              <td style={styles.td}>
                <div>{booking.zone_name}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>Spot {booking.spot_number}</div>
              </td>
              <td style={styles.td}>
                <div>{new Date(booking.start_time).toLocaleDateString()}</div>
                <div style={{color: '#6b7280', fontSize: '11px'}}>
                  {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                </div>
              </td>
              <td style={styles.td}>
                <span style={{color: '#059669', fontWeight: 'bold'}}>Ksh {booking.total_cost}</span>
              </td>
              <td style={styles.td}>
                <span style={getStatusStyle(booking.status)}>{booking.status}</span>
              </td>
              <td style={styles.td}>
                <span style={{
                  ...styles.statusBadge,
                  background: booking.payment_status === 'paid' ? '#d1fae5' : '#fef3c7',
                  color: booking.payment_status === 'paid' ? '#065f46' : '#92400e'
                }}>
                  {booking.payment_status}
                </span>
              </td>
              <td style={styles.td}>
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                  <button 
                    style={styles.btnPrimary}
                    onClick={() => viewBookingDetails(booking)}
                  >
                    👁️ View
                  </button>
                  {booking.status === 'active' && (
                    <button 
                      style={styles.btnSuccess}
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                    >
                      ✅ Complete
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button 
                      style={styles.btnDanger}
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h2 style={{margin: 0}}>📋 Booking Details</h2>
              <button 
                onClick={() => setShowBookingModal(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
              >
                ×
              </button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
              <div>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>👤 Customer Information</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  <div><strong>Name:</strong> {selectedBooking.user_name}</div>
                  <div><strong>Email:</strong> {selectedBooking.user_email}</div>
                  <div><strong>Phone:</strong> {selectedBooking.user_phone}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>🚗 Vehicle Information</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  <div><strong>Plate:</strong> {selectedBooking.vehicle_plate}</div>
                  <div><strong>Make:</strong> {selectedBooking.vehicle_make}</div>
                  <div><strong>Model:</strong> {selectedBooking.vehicle_model}</div>
                </div>
              </div>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>🅿️ Parking Information</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  <div><strong>Zone:</strong> {selectedBooking.zone_name}</div>
                  <div><strong>Spot:</strong> {selectedBooking.spot_number}</div>
                  <div><strong>Start:</strong> {new Date(selectedBooking.start_time).toLocaleString()}</div>
                  <div><strong>End:</strong> {new Date(selectedBooking.end_time).toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{color: '#1f2937', marginBottom: '10px'}}>💰 Payment Information</h4>
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px'}}>
                  <div><strong>Total Cost:</strong> <span style={{color: '#059669', fontWeight: 'bold'}}>Ksh {selectedBooking.total_cost}</span></div>
                  <div><strong>Status:</strong> <span style={getStatusStyle(selectedBooking.status)}>{selectedBooking.status}</span></div>
                  <div><strong>Payment:</strong> <span style={{
                    ...styles.statusBadge,
                    background: selectedBooking.payment_status === 'paid' ? '#d1fae5' : '#fef3c7',
                    color: selectedBooking.payment_status === 'paid' ? '#065f46' : '#92400e'
                  }}>{selectedBooking.payment_status}</span></div>
                  <div><strong>Booked:</strong> {new Date(selectedBooking.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;