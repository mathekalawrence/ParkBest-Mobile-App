import React, { useState, useEffect } from 'react';
import { parkbestAPI } from '../services/parkbestAPI';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await parkbestAPI.getUsers();
    if (result.success) {
      setUsers(result.data);
    } else {
      console.error('Failed to load users:', result.message);
    }
    setLoading(false);
  };

  const viewUserDetails = async (userId) => {
    const result = await parkbestAPI.getUserDetails(userId);
    if (result.success) {
      setSelectedUser(result.data);
      setShowUserModal(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newUser.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!newUser.email.trim()) newErrors.email = 'Email is required';
    if (!newUser.phone.trim()) newErrors.phone = 'Phone is required';
    if (!showEditModal && !newUser.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Note: You'll need to add createUser method to parkbestAPI
    alert(`Create user: ${newUser.full_name}`);
    setShowAddModal(false);
    setNewUser({ full_name: '', email: '', phone: '', password: '' });
    setErrors({});
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Note: You'll need to add updateUser method to parkbestAPI
    alert(`Update user: ${newUser.full_name}`);
    setShowEditModal(false);
    setSelectedUser(null);
    setNewUser({ full_name: '', email: '', phone: '', password: '' });
    setErrors({});
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Delete user "${userName}"? This will also delete all their bookings.`)) {
      // Note: You'll need to add deleteUser method to parkbestAPI
      alert(`Delete user: ${userName}`);
    }
  };

  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    filters: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
    input: { padding: '10px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' },
    th: { background: '#f8fafc', padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '15px', borderBottom: '1px solid #f3f4f6' },
    btnPrimary: { background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    btnSuccess: { background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
    btnDanger: { background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto' }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  if (loading) {
    return <div style={styles.container}>Loading users...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{color: '#1f2937', marginBottom: '8px'}}>👥 User Management</h1>
          <p style={{color: '#6b7280'}}>View and manage registered users</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
          + Add New User
        </button>
      </div>

      {/* Search */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search users by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{...styles.input, minWidth: '300px'}}
        />
        <div style={{flex: 1}}></div>
        <div style={{fontSize: '14px', color: '#6b7280'}}>
          {filteredUsers.length} users
        </div>
      </div>

      {/* Users Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Registered</th>
            <th style={styles.th}>Bookings</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td style={styles.td}>
                <div style={{fontWeight: '500', color: '#1f2937'}}>{user.full_name}</div>
              </td>
              <td style={styles.td}>
                <div style={{color: '#6b7280'}}>{user.email}</div>
              </td>
              <td style={styles.td}>
                <div style={{color: '#6b7280'}}>{user.phone}</div>
              </td>
              <td style={styles.td}>
                <div style={{color: '#6b7280'}}>
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </td>
              <td style={styles.td}>
                <div style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {user.total_bookings} bookings
                </div>
              </td>
              <td style={styles.td}>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  <button 
                    style={{...styles.btnPrimary, fontSize: '11px', padding: '6px 12px'}}
                    onClick={() => viewUserDetails(user.id)}
                  >
                    👁️ View
                  </button>
                  <button 
                    style={styles.btnSuccess}
                    onClick={() => handleEditUser(user)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    style={styles.btnDanger}
                    onClick={() => handleDeleteUser(user.id, user.full_name)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h2>User Details: {selectedUser.user.full_name}</h2>
              <button 
                onClick={() => setShowUserModal(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
              >
                ×
              </button>
            </div>
            
            {/* User Info */}
            <div style={{background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
                <div>
                  <strong>Email:</strong>
                  <div style={{color: '#6b7280'}}>{selectedUser.user.email}</div>
                </div>
                <div>
                  <strong>Phone:</strong>
                  <div style={{color: '#6b7280'}}>{selectedUser.user.phone}</div>
                </div>
                <div>
                  <strong>Registered:</strong>
                  <div style={{color: '#6b7280'}}>
                    {new Date(selectedUser.user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <strong>Total Bookings:</strong>
                  <div style={{color: '#3b82f6', fontWeight: 'bold'}}>
                    {selectedUser.bookings.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking History */}
            <h3>Booking History</h3>
            {selectedUser.bookings.length > 0 ? (
              <div style={{maxHeight: '300px', overflow: 'auto'}}>
                <table style={{...styles.table, marginTop: '10px'}}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Zone</th>
                      <th style={styles.th}>Spot</th>
                      <th style={styles.th}>Vehicle</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Cost</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.bookings.map(booking => (
                      <tr key={booking.id}>
                        <td style={styles.td}>{booking.zone_name}</td>
                        <td style={styles.td}>{booking.spot_number}</td>
                        <td style={styles.td}>{booking.vehicle_plate}</td>
                        <td style={styles.td}>
                          {new Date(booking.start_time).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>
                          <span style={{color: '#059669', fontWeight: 'bold'}}>
                            Ksh {booking.total_cost}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            background: booking.status === 'completed' ? '#d1fae5' : '#dbeafe',
                            color: booking.status === 'completed' ? '#065f46' : '#1e40af',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{color: '#6b7280', fontStyle: 'italic'}}>No bookings yet</p>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '500px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h2 style={{margin: 0, color: '#1f2937'}}>➕ Add New User</h2>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280'}}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.full_name ? '#ef4444' : '#d1d5db'}}
                  placeholder="Enter full name"
                />
                {errors.full_name && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.full_name}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.email ? '#ef4444' : '#d1d5db'}}
                  placeholder="Enter email address"
                />
                {errors.email && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.email}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.phone ? '#ef4444' : '#d1d5db'}}
                  placeholder="Enter phone number"
                />
                {errors.phone && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.phone}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.password ? '#ef4444' : '#d1d5db'}}
                  placeholder="Enter password"
                />
                {errors.password && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.password}</div>}
              </div>
              
              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{...styles.btnDanger, background: '#6b7280'}}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '500px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h2 style={{margin: 0, color: '#1f2937'}}>✏️ Edit User</h2>
              <button 
                type="button" 
                onClick={() => setShowEditModal(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280'}}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.full_name ? '#ef4444' : '#d1d5db'}}
                  placeholder="Enter full name"
                />
                {errors.full_name && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.full_name}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.email ? '#ef4444' : '#d1d5db'}}
                  placeholder="Enter email address"
                />
                {errors.email && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.email}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.phone ? '#ef4444' : '#d1d5db'}}
                  placeholder="Enter phone number"
                />
                {errors.phone && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.phone}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  style={{...styles.input, width: '100%'}}
                  placeholder="Enter new password (optional)"
                />
              </div>
              
              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  style={{...styles.btnDanger, background: '#6b7280'}}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;