import React, { useState, useEffect } from 'react';
import { parkbestAPI } from '../services/parkbestAPI';

const Dashboard = ({ currentUser, onPageChange }) => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeBookings: 0,
    availableSpots: 0,
    activeAttendants: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [parkingHotspots, setParkingHotspots] = useState([]);

  // Load dashboard data with real-time refresh
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const result = await parkbestAPI.getAnalytics();
      
      if (result.success) {
        const data = result.data;
        
        setStats({
          totalRevenue: data.stats.totalRevenue || 0,
          activeBookings: data.stats.activeBookings || 0,
          availableSpots: data.stats.totalSpots - data.stats.activeBookings || 0,
          activeAttendants: data.stats.totalUsers || 0
        });
        
        // Transform recent bookings for display
        const transformedBookings = data.recentBookings.map(booking => ({
          id: booking.id,
          customer: booking.full_name,
          spot: `${booking.zone_name} - Spot ${booking.spot_number}`,
          status: booking.status,
          duration: '2 hours', // You can calculate this from start/end time
          time: new Date(booking.created_at).toLocaleTimeString(),
          amount: booking.total_cost
        }));
        
        setRecentBookings(transformedBookings);
        
        // Demo data for charts (you can enhance this later)
        setRevenueData([
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: 48000 },
          { month: 'Apr', revenue: 61000 },
          { month: 'May', revenue: 55000 },
          { month: 'Jun', revenue: data.stats.totalRevenue }
        ]);
        
        // Get real parking zones data
        const zonesResult = await parkbestAPI.getZones();
        if (zonesResult.success) {
          const hotspots = zonesResult.data.map(zone => ({
            location: zone.name,
            available: zone.available_spots || 0,
            total: zone.total_spots || 0,
            utilization: zone.total_spots > 0 ? Math.round(((zone.total_spots - (zone.available_spots || 0)) / zone.total_spots) * 100) : 0
          }));
          setParkingHotspots(hotspots);
        } else {
          setParkingHotspots([
            { location: 'CBD Zone A', available: 15, total: 20, utilization: 75 },
            { location: 'CBD Zone B', available: 8, total: 15, utilization: 53 },
            { location: 'Westlands Mall', available: 22, total: 30, utilization: 73 }
          ]);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to demo data if API fails
      setStats({
        totalRevenue: 15750,
        activeBookings: 12,
        availableSpots: 53,
        activeAttendants: 150
      });
      
      setRecentBookings([
        {
          id: 1,
          customer: 'John Doe',
          spot: 'CBD Zone A - Spot 001',
          status: 'active',
          duration: '2 hours',
          time: '2:30 PM',
          amount: 200
        }
      ]);
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  };

  const styles = {
    // Layout
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    
    // Stats Grid
    statsGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    },
    statCard: { 
      background: 'white', 
      padding: '25px', 
      borderRadius: '12px', 
      border: '1px solid #e5e7eb', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    statCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)'
    },
    
    // Charts Section
    chartsSection: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    },
    chartCard: { 
      background: 'white', 
      padding: '25px', 
      borderRadius: '12px', 
      border: '1px solid #e5e7eb', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' 
    },
    
    // Tables
    tableCard: { 
      background: 'white', 
      padding: '25px', 
      borderRadius: '12px', 
      border: '1px solid #e5e7eb', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginBottom: '20px'
    },
    
    // Status badges
    statusBadge: { 
      padding: '4px 12px', 
      borderRadius: '20px', 
      fontSize: '12px', 
      fontWeight: '500', 
      display: 'inline-block' 
    },
    statusActive: { background: '#d1fae5', color: '#065f46' },
    statusCompleted: { background: '#dbeafe', color: '#1e40af' },
    
    // Progress bars
    progressBar: {
      height: '8px',
      background: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px'
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    }
  };

  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch(action) {
      case 'addZone':
        onPageChange('parking');
        break;
      case 'manageUsers':
        onPageChange('users');
        break;
      case 'generateReport':
        alert('📊 Report generation feature coming soon!');
        break;
      case 'refreshData':
        loadDashboardData();
        alert('🔄 Dashboard data refreshed!');
        break;
      default:
        break;
    }
  };

  // Bar chart component
  const RevenueChart = () => {
    const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
    
    return (
      <div>
        <h3 style={{marginBottom: '20px', color: '#1f2937'}}>Monthly Revenue Trend</h3>
        <div style={{display: 'flex', alignItems: 'end', gap: '15px', height: '200px'}}>
          {revenueData.map((data, index) => {
            const height = (data.revenue / maxRevenue) * 150;
            return (
              <div key={index} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '5px'}}>
                  Ksh {(data.revenue / 1000).toFixed(0)}K
                </div>
                <div
                  style={{
                    width: '30px',
                    height: `${height}px`,
                    background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease'
                  }}
                ></div>
                <div style={{fontSize: '12px', color: '#374151', marginTop: '8px'}}>
                  {data.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Utilization chart component
  const UtilizationChart = () => {
    return (
      <div>
        <h3 style={{marginBottom: '20px', color: '#1f2937'}}>Parking Spot Utilization</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          {parkingHotspots.map((spot, index) => (
            <div key={index}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                <span style={{fontSize: '14px', fontWeight: '500'}}>{spot.location}</span>
                <span style={{fontSize: '14px', color: '#6b7280'}}>
                  {spot.available}/{spot.total} spots
                </span>
              </div>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${spot.utilization}%`,
                    background: spot.utilization > 85 ? '#ef4444' : spot.utilization > 70 ? '#f59e0b' : '#10b981'
                  }}
                ></div>
              </div>
              <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
                {spot.utilization}% utilized
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Welcome Header */}
      <div style={{marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 style={{color: '#1f2937', marginBottom: '8px'}}>
            📊 Dashboard Overview
          </h1>
          <p style={{color: '#6b7280', fontSize: '16px'}}>
            Welcome back, {currentUser.name}! Here's what's happening with your parking hub today.
          </p>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div style={{fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px'}}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isLoading ? '#f59e0b' : '#10b981'
            }}></div>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            style={{
              background: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {isLoading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {[
          {
            title: 'Total Revenue',
            value: `Ksh ${stats.totalRevenue.toLocaleString()}`,
            change: '+12.5%',
            changeColor: '#10b981',
            icon: '💰',
            color: '#10b981',
            description: 'Revenue this month'
          },
          {
            title: 'Active Bookings',
            value: stats.activeBookings.toString(),
            change: '+8.2%',
            changeColor: '#3b82f6',
            icon: '🚗',
            color: '#3b82f6',
            description: 'Currently active'
          },
          {
            title: 'Available Spots',
            value: stats.availableSpots.toString(),
            change: '-3.1%',
            changeColor: '#ef4444',
            icon: '🅿️',
            color: '#8b5cf6',
            description: 'Across all locations'
          },
          {
            title: 'Active Attendants',
            value: stats.activeAttendants.toString(),
            change: '+5.7%',
            changeColor: '#10b981',
            icon: '👥',
            color: '#f59e0b',
            description: 'On duty now'
          }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              ...styles.statCard,
              ...(hoveredCard === index ? styles.statCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: `${stat.color}20`,
                color: stat.color,
                fontSize: '20px',
                marginRight: '15px'
              }}>
                {stat.icon}
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: '14px', color: '#6b7280', marginBottom: '5px'}}>
                  {stat.title}
                </div>
                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#1f2937'}}>
                  {stat.value}
                </div>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '12px', color: '#6b7280'}}>
                {stat.description}
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: stat.changeColor
              }}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={styles.chartsSection}>
        <div style={styles.chartCard}>
          <RevenueChart />
        </div>
        <div style={styles.chartCard}>
          <UtilizationChart />
        </div>
      </div>

      {/* Recent Bookings & Hotspots */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px'}}>
        {/* Recent Bookings */}
        <div style={styles.tableCard}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{color: '#1f2937', margin: 0}}>Recent Bookings</h3>
            <button style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              View All
            </button>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {recentBookings.map(booking => (
              <div key={booking.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'background 0.2s'
              }}>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px'}}>
                    <strong style={{color: '#1f2937'}}>{booking.customer}</strong>
                    <span style={{
                      ...styles.statusBadge,
                      ...(booking.status === 'active' ? styles.statusActive : styles.statusCompleted)
                    }}>
                      {booking.status}
                    </span>
                  </div>
                  <div style={{fontSize: '14px', color: '#6b7280', marginBottom: '4px'}}>
                    {booking.spot}
                  </div>
                  <div style={{fontSize: '12px', color: '#9ca3af'}}>
                    {booking.duration} • {booking.time}
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '16px', fontWeight: 'bold', color: '#059669'}}>
                    Ksh {booking.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parking Hotspots */}
        <div style={styles.tableCard}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{color: '#1f2937', margin: 0}}>Parking Hotspots</h3>
            <span style={{fontSize: '12px', color: '#6b7280'}}>Live Updates</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {parkingHotspots.map((hotspot, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <div style={{fontWeight: '500', color: '#1f2937', marginBottom: '4px'}}>
                    {hotspot.location}
                  </div>
                  <div style={{fontSize: '12px', color: '#6b7280'}}>
                    {hotspot.available} spots available
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: hotspot.utilization > 85 ? '#ef4444' : hotspot.utilization > 70 ? '#f59e0b' : '#10b981'
                  }}>
                    {hotspot.utilization}%
                  </div>
                  <div style={{fontSize: '12px', color: '#9ca3af'}}>
                    Utilization
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.tableCard}>
        <h3 style={{color: '#1f2937', marginBottom: '20px'}}>Quick Actions</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px'}}>
          {[
            { icon: '➕', label: 'Add Parking Zone', color: '#3b82f6', action: 'addZone' },
            { icon: '👥', label: 'Manage Users', color: '#10b981', action: 'manageUsers' },
            { icon: '📊', label: 'Generate Report', color: '#8b5cf6', action: 'generateReport' },
            { icon: '🔄', label: 'Refresh Data', color: '#f59e0b', action: 'refreshData' }
          ].map((actionItem, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(actionItem.action)}
              style={{
                background: 'white',
                border: `2px solid ${actionItem.color}20`,
                padding: '20px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${actionItem.color}10`;
                e.target.style.borderColor = actionItem.color;
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = `${actionItem.color}20`;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span style={{fontSize: '24px'}}>{actionItem.icon}</span>
              <span style={{fontSize: '14px', fontWeight: '500', color: '#1f2937'}}>
                {actionItem.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;