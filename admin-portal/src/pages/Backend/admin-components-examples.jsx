// Sample React Components for Admin Portal
// Copy these to your React admin project and customize as needed

import React, { useState, useEffect } from 'react';
import AdminService from './admin-api-service';

// 1. Admin Login Component
export const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await AdminService.login(username, password);
    
    if (result.success) {
      onLogin(result.data);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>Default credentials: admin / admin123</p>
    </div>
  );
};

// 2. Dashboard Component
export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const result = await AdminService.getAnalytics();
    if (result.success) {
      setAnalytics(result.data);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      
      {analytics && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{analytics.stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Active Zones</h3>
              <p>{analytics.stats.totalZones}</p>
            </div>
            <div className="stat-card">
              <h3>Total Spots</h3>
              <p>{analytics.stats.totalSpots}</p>
            </div>
            <div className="stat-card">
              <h3>Active Bookings</h3>
              <p>{analytics.stats.activeBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p>Ksh {analytics.stats.totalRevenue}</p>
            </div>
          </div>

          <div className="recent-bookings">
            <h3>Recent Bookings</h3>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Zone</th>
                  <th>Spot</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.full_name}</td>
                    <td>{booking.zone_name}</td>
                    <td>{booking.spot_number}</td>
                    <td>{booking.vehicle_plate}</td>
                    <td>{booking.status}</td>
                    <td>Ksh {booking.total_cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// 3. Users Management Component
export const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await AdminService.getUsers();
    if (result.success) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  const viewUserDetails = async (userId) => {
    const result = await AdminService.getUserDetails(userId);
    if (result.success) {
      setSelectedUser(result.data);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="users-management">
      <h2>User Registrations</h2>
      
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Registered</th>
              <th>Total Bookings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>{user.total_bookings}</td>
                <td>
                  <button onClick={() => viewUserDetails(user.id)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="user-details-modal">
          <div className="modal-content">
            <h3>User Details: {selectedUser.user.full_name}</h3>
            <p>Email: {selectedUser.user.email}</p>
            <p>Phone: {selectedUser.user.phone}</p>
            
            <h4>Booking History</h4>
            <table>
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Spot</th>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedUser.bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.zone_name}</td>
                    <td>{booking.spot_number}</td>
                    <td>{booking.vehicle_plate}</td>
                    <td>{new Date(booking.start_time).toLocaleDateString()}</td>
                    <td>Ksh {booking.total_cost}</td>
                    <td>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Zone Management Component
export const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    location: '',
    hourly_rate: '',
    total_spots: ''
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    const result = await AdminService.getZones();
    if (result.success) {
      setZones(result.data);
    }
    setLoading(false);
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    const result = await AdminService.createZone({
      ...newZone,
      hourly_rate: parseFloat(newZone.hourly_rate),
      total_spots: parseInt(newZone.total_spots)
    });
    
    if (result.success) {
      setNewZone({ name: '', location: '', hourly_rate: '', total_spots: '' });
      setShowCreateForm(false);
      loadZones();
      alert('Zone created successfully!');
    } else {
      alert('Failed to create zone: ' + result.message);
    }
  };

  const toggleZoneStatus = async (zoneId, currentStatus) => {
    const result = await AdminService.updateZone(zoneId, { is_active: !currentStatus });
    if (result.success) {
      loadZones();
    }
  };

  if (loading) return <div>Loading zones...</div>;

  return (
    <div className="zone-management">
      <h2>Parking Zone Management</h2>
      
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Add New Zone'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreateZone} className="create-zone-form">
          <h3>Create New Parking Zone</h3>
          <div>
            <label>Zone Name:</label>
            <input
              type="text"
              value={newZone.name}
              onChange={(e) => setNewZone({...newZone, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label>Location:</label>
            <input
              type="text"
              value={newZone.location}
              onChange={(e) => setNewZone({...newZone, location: e.target.value})}
              required
            />
          </div>
          <div>
            <label>Hourly Rate (Ksh):</label>
            <input
              type="number"
              step="0.01"
              value={newZone.hourly_rate}
              onChange={(e) => setNewZone({...newZone, hourly_rate: e.target.value})}
              required
            />
          </div>
          <div>
            <label>Total Spots:</label>
            <input
              type="number"
              value={newZone.total_spots}
              onChange={(e) => setNewZone({...newZone, total_spots: e.target.value})}
              required
            />
          </div>
          <button type="submit">Create Zone</button>
        </form>
      )}

      <div className="zones-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Rate/Hour</th>
              <th>Total Spots</th>
              <th>Available</th>
              <th>Total Bookings</th>
              <th>Revenue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(zone => (
              <tr key={zone.id}>
                <td>{zone.name}</td>
                <td>{zone.location}</td>
                <td>Ksh {zone.hourly_rate}</td>
                <td>{zone.total_spots}</td>
                <td>{zone.available_spots}</td>
                <td>{zone.total_bookings}</td>
                <td>Ksh {zone.total_revenue}</td>
                <td>{zone.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  <button 
                    onClick={() => toggleZoneStatus(zone.id, zone.is_active)}
                  >
                    {zone.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. Main Admin App Component
export const AdminApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (AdminService.isLoggedIn()) {
      setIsLoggedIn(true);
      setAdmin(AdminService.getCurrentAdmin());
    }
  }, []);

  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setAdmin(data.admin);
  };

  const handleLogout = async () => {
    await AdminService.logout();
    setIsLoggedIn(false);
    setAdmin(null);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-app">
      <nav className="admin-nav">
        <h1>ParkBest Admin</h1>
        <div className="nav-links">
          <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
          <button onClick={() => setCurrentView('users')}>Users</button>
          <button onClick={() => setCurrentView('zones')}>Zones</button>
        </div>
        <div className="admin-info">
          <span>Welcome, {admin?.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="admin-content">
        {currentView === 'dashboard' && <AdminDashboard />}
        {currentView === 'users' && <UsersManagement />}
        {currentView === 'zones' && <ZoneManagement />}
      </main>
    </div>
  );
};

// Basic CSS (add to your stylesheet)
const adminStyles = `
.admin-app {
  font-family: Arial, sans-serif;
}

.admin-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #1a237e;
  color: white;
}

.nav-links button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: white;
  border: 1px solid white;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.stat-card {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  padding: 0.5rem;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f5f5f5;
}

.create-zone-form {
  background: #f9f9f9;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}

.create-zone-form div {
  margin: 0.5rem 0;
}

.create-zone-form label {
  display: inline-block;
  width: 150px;
}

.create-zone-form input {
  padding: 0.5rem;
  width: 200px;
}
`;

export default AdminApp;