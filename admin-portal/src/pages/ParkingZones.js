import React, { useState, useEffect } from 'react';
import { parkbestAPI } from '../services/parkbestAPI';

const ParkingZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSpotsModal, setShowSpotsModal] = useState(false);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [showEditSpotModal, setShowEditSpotModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [spots, setSpots] = useState([]);
  const [newSpot, setNewSpot] = useState({
    spot_number: '',
    spot_name: '',
    spot_type: 'standard'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [newZone, setNewZone] = useState({
    name: '',
    location: '',
    hourly_rate: '',
    total_spots: '',
    description: '',
    features: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setLoading(true);
    const result = await parkbestAPI.getZones();
    if (result.success) {
      setZones(result.data);
    } else {
      console.error('Failed to load zones:', result.message);
    }
    setLoading(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newZone.name.trim()) newErrors.name = 'Zone name is required';
    if (!newZone.location.trim()) newErrors.location = 'Location is required';
    if (!newZone.hourly_rate || newZone.hourly_rate <= 0) newErrors.hourly_rate = 'Valid hourly rate is required';
    if (!newZone.total_spots || newZone.total_spots <= 0) newErrors.total_spots = 'Valid number of spots is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const result = await parkbestAPI.createZone({
      ...newZone,
      hourly_rate: parseFloat(newZone.hourly_rate),
      total_spots: parseInt(newZone.total_spots)
    });
    
    if (result.success) {
      setNewZone({ name: '', location: '', hourly_rate: '', total_spots: '', description: '', features: [] });
      setErrors({});
      setShowAddModal(false);
      loadZones();
      alert('Zone created successfully!');
    } else {
      alert('Failed to create zone: ' + result.message);
    }
  };

  const toggleFeature = (feature) => {
    setNewZone(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleZoneStatus = async (zoneId, currentStatus) => {
    const result = await parkbestAPI.updateZone(zoneId, { is_active: !currentStatus });
    if (result.success) {
      loadZones();
    }
  };

  const handleEditZone = (zone) => {
    setSelectedZone(zone);
    setNewZone({
      name: zone.name,
      location: zone.location,
      hourly_rate: zone.hourly_rate.toString(),
      total_spots: zone.total_spots.toString(),
      description: zone.description || '',
      features: zone.features || []
    });
    setShowEditModal(true);
  };

  const handleUpdateZone = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const result = await parkbestAPI.updateZone(selectedZone.id, {
      ...newZone,
      hourly_rate: parseFloat(newZone.hourly_rate),
      total_spots: parseInt(newZone.total_spots)
    });
    
    if (result.success) {
      setShowEditModal(false);
      setSelectedZone(null);
      setNewZone({ name: '', location: '', hourly_rate: '', total_spots: '', description: '', features: [] });
      setErrors({});
      loadZones();
      alert('Zone updated successfully!');
    } else {
      alert('Failed to update zone: ' + result.message);
    }
  };

  const handleDeleteZone = async (zoneId, zoneName) => {
    if (window.confirm(`Are you sure you want to delete "${zoneName}"? This action cannot be undone.`)) {
      // Note: You'll need to add deleteZone method to parkbestAPI
      alert('Delete functionality will be implemented in backend');
    }
  };

  const loadZoneSpots = async (zoneId, zoneName) => {
    const result = await parkbestAPI.getZoneSpots(zoneId);
    if (result.success) {
      setSpots(result.data);
      setSelectedZone({id: zoneId, name: zoneName});
      setShowSpotsModal(true);
    } else {
      alert('Failed to load spots: ' + result.message);
    }
  };

  const handleAddSpot = async (e) => {
    e.preventDefault();
    // Note: You'll need to add createSpot method to parkbestAPI
    alert(`Add spot functionality: ${newSpot.spot_name || newSpot.spot_number} in ${selectedZone.name}`);
    setShowAddSpotModal(false);
    setNewSpot({spot_number: '', spot_name: '', spot_type: 'standard'});
  };

  const handleEditSpot = (spot) => {
    setSelectedSpot(spot);
    setNewSpot({
      spot_number: spot.spot_number,
      spot_name: spot.spot_name || '',
      spot_type: spot.spot_type || 'standard'
    });
    setShowEditSpotModal(true);
  };

  const handleUpdateSpot = async (e) => {
    e.preventDefault();
    // Note: You'll need to add updateSpot method to parkbestAPI
    alert(`Update spot functionality: ${newSpot.spot_name || newSpot.spot_number}`);
    setShowEditSpotModal(false);
    setSelectedSpot(null);
    setNewSpot({spot_number: '', spot_name: '', spot_type: 'standard'});
  };

  const handleDeleteSpot = async (spotId, spotNumber) => {
    if (window.confirm(`Delete spot ${spotNumber}? This action cannot be undone.`)) {
      // Note: You'll need to add deleteSpot method to parkbestAPI
      alert(`Delete spot functionality: ${spotNumber}`);
    }
  };

  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    filters: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
    input: { padding: '10px 15px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    card: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', marginBottom: '20px' },
    statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', display: 'inline-block' },
    statusActive: { background: '#d1fae5', color: '#065f46' },
    statusInactive: { background: '#fee2e2', color: '#991b1b' },
    btnPrimary: { background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    btnSuccess: { background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    btnDanger: { background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    btnSecondary: { background: '#6b7280', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={styles.container}>Loading zones...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{color: '#1f2937', marginBottom: '8px'}}>🅿️ Parking Zones Management</h1>
          <p style={{color: '#6b7280'}}>Manage parking zones and spots</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
          + Add New Zone
        </button>
      </div>

      {/* Search */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search zones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{...styles.input, minWidth: '250px'}}
        />
        <div style={{flex: 1}}></div>
        <div style={{fontSize: '14px', color: '#6b7280'}}>
          {filteredZones.length} zones
        </div>
      </div>

      {/* Zones Grid */}
      <div>
        {filteredZones.map(zone => (
          <div key={zone.id} style={styles.card}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div style={{flex: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                  <h3 style={{margin: 0, color: '#1f2937', fontSize: '18px'}}>{zone.name}</h3>
                  <div style={{
                    ...styles.statusBadge,
                    ...(zone.is_active ? styles.statusActive : styles.statusInactive)
                  }}>
                    {zone.is_active ? '🟢 Active' : '🔴 Inactive'}
                  </div>
                </div>
                
                <p style={{margin: '8px 0', color: '#6b7280'}}>📍 {zone.location}</p>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px'}}>
                  <div>
                    <strong style={{color: '#1f2937'}}>Rate:</strong>
                    <span style={{marginLeft: '8px', color: '#ef4444', fontWeight: 'bold'}}>Ksh {zone.hourly_rate}/hour</span>
                  </div>
                  <div>
                    <strong style={{color: '#1f2937'}}>Spots:</strong>
                    <span style={{marginLeft: '8px'}}>{zone.available_spots}/{zone.total_spots}</span>
                  </div>
                  <div>
                    <strong style={{color: '#1f2937'}}>Bookings:</strong>
                    <span style={{marginLeft: '8px'}}>{zone.total_bookings || 0}</span>
                  </div>
                  <div>
                    <strong style={{color: '#1f2937'}}>Revenue:</strong>
                    <span style={{marginLeft: '8px', color: '#059669', fontWeight: 'bold'}}>Ksh {zone.total_revenue || 0}</span>
                  </div>
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '8px', marginLeft: '20px', flexWrap: 'wrap'}}>
                <button 
                  style={{...styles.btnSuccess, fontSize: '11px', padding: '6px 12px'}}
                  onClick={() => loadZoneSpots(zone.id, zone.name)}
                >
                  👁️ View Spots
                </button>
                <button 
                  style={{...styles.btnPrimary, fontSize: '11px', padding: '6px 12px'}}
                  onClick={() => handleEditZone(zone)}
                >
                  ✏️ Edit
                </button>
                <button 
                  style={zone.is_active ? {...styles.btnDanger, fontSize: '11px', padding: '6px 12px'} : {...styles.btnSuccess, fontSize: '11px', padding: '6px 12px'}}
                  onClick={() => toggleZoneStatus(zone.id, zone.is_active)}
                >
                  {zone.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                </button>
                <button 
                  style={{...styles.btnDanger, fontSize: '11px', padding: '6px 12px'}}
                  onClick={() => handleDeleteZone(zone.id, zone.name)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h2 style={{margin: 0, color: '#1f2937'}}>🅿️ Add New Parking Zone</h2>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280'}}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateZone}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Zone Name *</label>
                  <input
                    type="text"
                    value={newZone.name}
                    onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                    style={{...styles.input, width: '100%', borderColor: errors.name ? '#ef4444' : '#d1d5db'}}
                    placeholder="e.g., CBD Zone A"
                  />
                  {errors.name && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.name}</div>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Spots *</label>
                  <input
                    type="number"
                    min="1"
                    value={newZone.total_spots}
                    onChange={(e) => setNewZone({...newZone, total_spots: e.target.value})}
                    style={{...styles.input, width: '100%', borderColor: errors.total_spots ? '#ef4444' : '#d1d5db'}}
                    placeholder="50"
                  />
                  {errors.total_spots && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.total_spots}</div>}
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Location *</label>
                <input
                  type="text"
                  value={newZone.location}
                  onChange={(e) => setNewZone({...newZone, location: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.location ? '#ef4444' : '#d1d5db'}}
                  placeholder="e.g., Kenyatta Avenue, Nairobi"
                />
                {errors.location && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.location}</div>}
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Hourly Rate (Ksh) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newZone.hourly_rate}
                    onChange={(e) => setNewZone({...newZone, hourly_rate: e.target.value})}
                    style={{...styles.input, width: '100%', borderColor: errors.hourly_rate ? '#ef4444' : '#d1d5db'}}
                    placeholder="100.00"
                  />
                  {errors.hourly_rate && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.hourly_rate}</div>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Zone Type</label>
                  <select
                    value={newZone.zone_type || 'standard'}
                    onChange={(e) => setNewZone({...newZone, zone_type: e.target.value})}
                    style={{...styles.input, width: '100%'}}
                  >
                    <option value="standard">Standard Parking</option>
                    <option value="premium">Premium Parking</option>
                    <option value="ev_charging">EV Charging</option>
                    <option value="disabled">Disabled Access</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={newZone.description}
                  onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                  style={{...styles.input, width: '100%', minHeight: '80px', resize: 'vertical'}}
                  placeholder="Brief description of the parking zone..."
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Features</label>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '8px'}}>
                  {['CCTV Security', '24/7 Access', 'Covered Parking', 'EV Charging', 'Disabled Access', 'Valet Service'].map(feature => (
                    <label key={feature} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                      <input
                        type="checkbox"
                        checked={newZone.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        style={{margin: 0}}
                      />
                      <span style={{fontSize: '14px'}}>{feature}</span>
                    </label>
                  ))}
                </div>
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
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h2 style={{margin: 0, color: '#1f2937'}}>✏️ Edit Parking Zone</h2>
              <button 
                type="button" 
                onClick={() => setShowEditModal(false)}
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280'}}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateZone}>
              {/* Same form fields as Add Zone */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Zone Name *</label>
                  <input
                    type="text"
                    value={newZone.name}
                    onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                    style={{...styles.input, width: '100%', borderColor: errors.name ? '#ef4444' : '#d1d5db'}}
                    placeholder="e.g., CBD Zone A"
                  />
                  {errors.name && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.name}</div>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Spots *</label>
                  <input
                    type="number"
                    min="1"
                    value={newZone.total_spots}
                    onChange={(e) => setNewZone({...newZone, total_spots: e.target.value})}
                    style={{...styles.input, width: '100%', borderColor: errors.total_spots ? '#ef4444' : '#d1d5db'}}
                    placeholder="50"
                  />
                  {errors.total_spots && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.total_spots}</div>}
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Location *</label>
                <input
                  type="text"
                  value={newZone.location}
                  onChange={(e) => setNewZone({...newZone, location: e.target.value})}
                  style={{...styles.input, width: '100%', borderColor: errors.location ? '#ef4444' : '#d1d5db'}}
                  placeholder="e.g., Kenyatta Avenue, Nairobi"
                />
                {errors.location && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.location}</div>}
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Hourly Rate (Ksh) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newZone.hourly_rate}
                    onChange={(e) => setNewZone({...newZone, hourly_rate: e.target.value})}
                    style={{...styles.input, width: '100%', borderColor: errors.hourly_rate ? '#ef4444' : '#d1d5db'}}
                    placeholder="100.00"
                  />
                  {errors.hourly_rate && <div style={{color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{errors.hourly_rate}</div>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Zone Type</label>
                  <select
                    value={newZone.zone_type || 'standard'}
                    onChange={(e) => setNewZone({...newZone, zone_type: e.target.value})}
                    style={{...styles.input, width: '100%'}}
                  >
                    <option value="standard">Standard Parking</option>
                    <option value="premium">Premium Parking</option>
                    <option value="ev_charging">EV Charging</option>
                    <option value="disabled">Disabled Access</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={newZone.description}
                  onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                  style={{...styles.input, width: '100%', minHeight: '80px', resize: 'vertical'}}
                  placeholder="Brief description of the parking zone..."
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
                  Update Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Spots Modal */}
      {showSpotsModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '800px', maxHeight: '90vh', overflow: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <div>
                <h2 style={{margin: 0, color: '#1f2937'}}>👁️ Parking Spots</h2>
                <p style={{margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px'}}>{selectedZone?.name}</p>
              </div>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <button 
                  onClick={() => setShowAddSpotModal(true)}
                  style={{...styles.btnPrimary, fontSize: '12px', padding: '8px 12px'}}
                >
                  + Add Spot
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowSpotsModal(false)}
                  style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280'}}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <div style={{fontSize: '14px', color: '#6b7280', marginBottom: '15px'}}>
                Total: {spots.length} spots
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px'}}>
                {spots.map(spot => (
                  <div 
                    key={spot.id} 
                    style={{
                      padding: '12px 8px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '500',
                      border: '2px solid',
                      position: 'relative',
                      ...(spot.is_occupied 
                        ? {background: '#fee2e2', borderColor: '#ef4444', color: '#991b1b'}
                        : spot.is_reserved 
                        ? {background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e'}
                        : {background: '#d1fae5', borderColor: '#10b981', color: '#065f46'}
                      )
                    }}
                  >
                    <div style={{fontSize: '16px', marginBottom: '5px'}}>
                      {spot.is_occupied ? '🚗' : spot.is_reserved ? '⏰' : '🅿️'}
                    </div>
                    <div style={{fontWeight: 'bold'}}>{spot.spot_name || `Spot ${spot.spot_number}`}</div>
                    <div style={{fontSize: '9px', color: '#6b7280'}}>#{spot.spot_number}</div>
                    <div style={{fontSize: '9px', marginTop: '3px'}}>
                      {spot.is_occupied ? 'Occupied' : spot.is_reserved ? 'Reserved' : 'Available'}
                    </div>
                    {spot.booking_id && (
                      <div style={{fontSize: '9px', marginTop: '2px'}}>
                        {spot.user_name}
                      </div>
                    )}
                    
                    {!spot.is_occupied && !spot.is_reserved && (
                      <div style={{position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '2px'}}>
                        <button 
                          onClick={() => handleEditSpot(spot)}
                          style={{background: '#3b82f6', color: 'white', border: 'none', borderRadius: '3px', padding: '2px 4px', fontSize: '8px', cursor: 'pointer'}}
                          title="Edit Spot"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteSpot(spot.id, spot.spot_number)}
                          style={{background: '#ef4444', color: 'white', border: 'none', borderRadius: '3px', padding: '2px 4px', fontSize: '8px', cursor: 'pointer'}}
                          title="Delete Spot"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setShowSpotsModal(false)}
                style={styles.btnPrimary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Spot Modal */}
      {showAddSpotModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '400px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h3 style={{margin: 0, color: '#1f2937'}}>➕ Add New Spot</h3>
              <button 
                type="button" 
                onClick={() => setShowAddSpotModal(false)}
                style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280'}}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddSpot}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Spot Number *</label>
                <input
                  type="text"
                  value={newSpot.spot_number}
                  onChange={(e) => setNewSpot({...newSpot, spot_number: e.target.value})}
                  style={{...styles.input, width: '100%'}}
                  placeholder="e.g., A01, B15"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Spot Name</label>
                <input
                  type="text"
                  value={newSpot.spot_name}
                  onChange={(e) => setNewSpot({...newSpot, spot_name: e.target.value})}
                  style={{...styles.input, width: '100%'}}
                  placeholder="e.g., VIP Spot, Near Entrance"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Spot Type</label>
                <select
                  value={newSpot.spot_type}
                  onChange={(e) => setNewSpot({...newSpot, spot_type: e.target.value})}
                  style={{...styles.input, width: '100%'}}
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="disabled">Disabled Access</option>
                  <option value="ev_charging">EV Charging</option>
                  <option value="compact">Compact Car</option>
                </select>
              </div>
              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button 
                  type="button" 
                  onClick={() => setShowAddSpotModal(false)}
                  style={{...styles.btnDanger, background: '#6b7280'}}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Add Spot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Spot Modal */}
      {showEditSpotModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '400px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px'}}>
              <h3 style={{margin: 0, color: '#1f2937'}}>✏️ Edit Spot</h3>
              <button 
                type="button" 
                onClick={() => setShowEditSpotModal(false)}
                style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280'}}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateSpot}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Spot Number *</label>
                <input
                  type="text"
                  value={newSpot.spot_number}
                  onChange={(e) => setNewSpot({...newSpot, spot_number: e.target.value})}
                  style={{...styles.input, width: '100%'}}
                  placeholder="e.g., A01, B15"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Spot Name</label>
                <input
                  type="text"
                  value={newSpot.spot_name}
                  onChange={(e) => setNewSpot({...newSpot, spot_name: e.target.value})}
                  style={{...styles.input, width: '100%'}}
                  placeholder="e.g., VIP Spot, Near Entrance"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Spot Type</label>
                <select
                  value={newSpot.spot_type}
                  onChange={(e) => setNewSpot({...newSpot, spot_type: e.target.value})}
                  style={{...styles.input, width: '100%'}}
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="disabled">Disabled Access</option>
                  <option value="ev_charging">EV Charging</option>
                  <option value="compact">Compact Car</option>
                </select>
              </div>
              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button 
                  type="button" 
                  onClick={() => setShowEditSpotModal(false)}
                  style={{...styles.btnDanger, background: '#6b7280'}}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Update Spot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingZones;