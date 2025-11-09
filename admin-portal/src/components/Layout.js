import React from 'react';

const Layout = ({ currentUser, onLogout, currentPage, onPageChange, children }) => {
  const styles = {
    app: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    },
    sidebar: {
      width: '250px',
      background: '#1f2937',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    },
    mainContent: {
      flex: 1,
      background: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: 'white',
      padding: '20px 30px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    content: {
      padding: '30px',
      flex: 1
    },
    navButton: {
      display: 'block',
      width: '100%',
      padding: '12px 15px',
      marginBottom: '8px',
      background: 'transparent',
      border: 'none',
      color: '#d1d5db',
      textAlign: 'left',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s'
    },
    navButtonActive: {
      background: '#3b82f6',
      color: 'white'
    },
    logoutButton: {
      display: 'block',
      width: '100%',
      padding: '12px 15px',
      background: 'transparent',
      border: 'none',
      color: '#ef4444',
      textAlign: 'left',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      marginTop: 'auto',
      transition: 'background 0.3s'
    },
    userInfo: {
      background: '#374151',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.app}>
      {/* Sidebar Navigation */}
      <div style={styles.sidebar}>
        <div style={{marginBottom: '30px'}}>
          <h2 style={{margin: 0, color: '#3b82f6'}}>🏢 ParkBest Admin</h2>
          <small style={{color: '#9ca3af'}}>ParkBest Parking Management System</small>
        </div>

        {/* User Info */}
        <div style={styles.userInfo}>
          <div style={{fontWeight: '500'}}>{currentUser.name}</div>
          <small style={{color: '#9ca3af'}}>{currentUser.email}</small>
          <div style={{fontSize: '12px', color: '#10b981', marginTop: '5px'}}>
            {currentUser.role} • {currentUser.company || 'ParkBest'}
          </div>
        </div>
        
        {/* Navigation */}
        <button 
          style={{
            ...styles.navButton,
            ...(currentPage === 'dashboard' ? styles.navButtonActive : {})
          }}
          onClick={() => onPageChange('dashboard')}
        >
          📊 Dashboard
        </button>
        
        <button 
          style={{
            ...styles.navButton,
            ...(currentPage === 'parking' ? styles.navButtonActive : {})
          }}
          onClick={() => onPageChange('parking')}
        >
          🅿️ Parking Zones
        </button>
        
        <button 
          style={{
            ...styles.navButton,
            ...(currentPage === 'users' ? styles.navButtonActive : {})
          }}
          onClick={() => onPageChange('users')}
        >
          👥 Users
        </button>
        
        <button 
          style={{
            ...styles.navButton,
            ...(currentPage === 'bookings' ? styles.navButtonActive : {})
          }}
          onClick={() => onPageChange('bookings')}
        >
          📋 Bookings
        </button>
        
        <button 
          style={{
            ...styles.navButton,
            ...(currentPage === 'payments' ? styles.navButtonActive : {})
          }}
          onClick={() => onPageChange('payments')}
        >
          💳 Payments
        </button>
        
        <button 
          style={{
            ...styles.navButton,
            ...(currentPage === 'reports' ? styles.navButtonActive : {})
          }}
          onClick={() => onPageChange('reports')}
        >
          📊 Reports
        </button>

        {/* Logout Button */}
        <button 
          style={styles.logoutButton}
          onClick={onLogout}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <h1 style={{margin: 0, color: '#1f2937'}}>
              {currentPage === 'dashboard' && 'Dashboard Overview'}
              {currentPage === 'parking' && 'Parking Zones Management'}
              {currentPage === 'users' && 'Users Management'}
              {currentPage === 'bookings' && 'Bookings Management'}
              {currentPage === 'payments' && 'Payments Management'}
              {currentPage === 'reports' && 'Reports & Analytics'}
            </h1>
            <small style={{color: '#6b7280'}}>
              Welcome back! Last login: {currentUser.lastLogin || 'Today'}
            </small>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: '500', color: '#1f2937'}}>Hello, {currentUser.name}! 👋</div>
            <small style={{color: '#6b7280'}}>Management and efficiency at your parking</small>
          </div>
        </header>
        
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;