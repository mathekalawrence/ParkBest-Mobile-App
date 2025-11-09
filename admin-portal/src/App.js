import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ParkingZones from './pages/ParkingZones';
import Users from './pages/Users';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('login');

  // Checking if user is logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
    setIsLoading(false);
  }, []);

  // Handling login
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  // Handling signup
  const handleSignup = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  // Handling logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    setCurrentPage('login');
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#1f2937',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ffffff',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2>🅿️ ParkBest Admin</h2>
        <p>Loading...</p>
      </div>
    );
  }

  // Rendering appropriate page based on authentication
  if (!currentUser) {
    if (currentPage === 'signup') {
      return <Signup onSignup={handleSignup} onSwitchToLogin={() => setCurrentPage('login')} />;
    }
    return <Login onLogin={handleLogin} onSwitchToSignup={() => setCurrentPage('signup')} />;
  }

  // Main app layout for authenticated users
  return (
    <Layout 
      currentUser={currentUser} 
      onLogout={handleLogout}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {currentPage === 'dashboard' && <Dashboard currentUser={currentUser} onPageChange={setCurrentPage} />}
      {currentPage === 'parking' && <ParkingZones />}
      {currentPage === 'users' && <Users />}
      {currentPage === 'bookings' && <Bookings />}
      {currentPage === 'payments' && <Payments />}
      {currentPage === 'reports' && <Reports />}
    </Layout>
  );
}

export default App;