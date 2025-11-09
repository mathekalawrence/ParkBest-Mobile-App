import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import reportingService from '../services/reportingService';

export default function SimpleBookParkingScreen({ navigation }) {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      loadSpots(selectedZone.id);
    }
  }, [selectedZone]);

  const loadZones = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading parking zones from:', apiClient.defaults.baseURL + '/parking/zones');
      const response = await apiClient.get('/parking/zones');
      console.log('✅ Raw response:', response);
      console.log('✅ Response data:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setZones(response.data);
        console.log('✅ Zones set:', response.data.length, 'zones');
      } else if (response.data && response.data.zones) {
        setZones(response.data.zones);
        console.log('✅ Zones set:', response.data.zones.length, 'zones');
      } else {
        console.log('❌ No zones in response');
        setZones([]);
      }
      
      await reportingService.logParkingEvent('ZONES_LOADED', {
        count: Array.isArray(response.data) ? response.data.length : (response.data.zones?.length || 0)
      });
    } catch (error) {
      console.error('❌ Error loading zones:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      Alert.alert('Error', `Failed to load parking zones: ${error.message}`);
      await reportingService.logParkingEvent('ZONES_LOAD_FAILED', {
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSpots = async (zoneId) => {
    try {
      setLoading(true);
      console.log('🔄 Loading spots for zone:', zoneId);
      const response = await apiClient.get(`/parking/zones/${zoneId}/spots`);
      console.log('✅ Spots response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setSpots(response.data);
        console.log('✅ Spots set:', response.data.length, 'spots');
      } else if (response.data && response.data.spots) {
        setSpots(response.data.spots);
        console.log('✅ Spots set:', response.data.spots.length, 'spots');
      } else {
        console.log('❌ No spots in response');
        setSpots([]);
      }
    } catch (error) {
      console.error('❌ Error loading spots:', error.message);
      Alert.alert('Error', 'Failed to load parking spots');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSpot) {
      Alert.alert('Error', 'Please select a parking spot');
      return;
    }
    if (!vehiclePlate.trim()) {
      Alert.alert('Error', 'Please enter your vehicle plate number');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Creating booking...');
      
      const bookingData = {
        parking_spot_id: selectedSpot.id,
        vehicle_plate: vehiclePlate.trim().toUpperCase(),
        duration_hours: duration
      };

      const response = await apiClient.post('/parking/book', bookingData);
      console.log('✅ Booking created:', response.data);

      await reportingService.logParkingEvent('BOOKING_CREATED', {
        spotId: selectedSpot.id,
        zoneName: selectedZone.name,
        vehiclePlate: vehiclePlate,
        duration: duration,
        cost: selectedZone.hourly_rate * duration
      });

      // Navigate to payment screen
      const bookingWithDetails = {
        ...response.data.booking,
        zone_name: selectedZone.name,
        spot_number: selectedSpot.spot_number,
        duration_hours: duration,
        total_amount: selectedZone.hourly_rate * duration
      };

      navigation.navigate('Payment', { booking: bookingWithDetails });

    } catch (error) {
      console.error('❌ Booking error:', error.message);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create booking';
      Alert.alert('Booking Failed', errorMessage);
      
      await reportingService.logParkingEvent('BOOKING_FAILED', {
        error: error.message,
        errorResponse: error.response?.data,
        spotId: selectedSpot.id
      });
    } finally {
      setLoading(false);
    }
  };

  const renderZone = (zone) => (
    <TouchableOpacity
      key={zone.id}
      style={[
        styles.zoneCard,
        selectedZone?.id === zone.id && styles.selectedCard
      ]}
      onPress={() => setSelectedZone(zone)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.zoneName}>{zone.name}</Text>
        <Text style={styles.availableSpots}>{zone.available_spots} available</Text>
      </View>
      <Text style={styles.zoneLocation}>{zone.location}</Text>
      <Text style={styles.zoneRate}>Ksh {zone.hourly_rate}/hour</Text>
    </TouchableOpacity>
  );

  const renderSpot = (spot) => (
    <TouchableOpacity
      key={spot.id}
      style={[
        styles.spotCard,
        selectedSpot?.id === spot.id && styles.selectedCard,
        (spot.is_occupied || spot.is_reserved) && styles.unavailableCard
      ]}
      onPress={() => {
        if (!spot.is_occupied && !spot.is_reserved) {
          setSelectedSpot(spot);
        }
      }}
      disabled={spot.is_occupied || spot.is_reserved}
    >
      <Text style={styles.spotNumber}>Spot {spot.spot_number}</Text>
      <Text style={[
        styles.spotStatus,
        (spot.is_occupied || spot.is_reserved) ? styles.unavailableText : styles.availableText
      ]}>
        {spot.is_occupied ? 'Occupied' : spot.is_reserved ? 'Reserved' : 'Available'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Parking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* User Info */}
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {user.full_name}!</Text>
          </View>
        )}

        {/* Vehicle Plate Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter vehicle plate number (e.g., KCA 123A)"
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            autoCapitalize="characters"
          />
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationContainer}>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setDuration(Math.max(1, duration - 1))}
            >
              <Text style={styles.durationButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.durationText}>{duration} hour(s)</Text>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setDuration(duration + 1)}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Parking Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Parking Zone</Text>
          {loading && zones.length === 0 ? (
            <ActivityIndicator size="large" color="#1a237e" />
          ) : (
            zones.map(renderZone)
          )}
        </View>

        {/* Parking Spots */}
        {selectedZone && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Available Spots in {selectedZone.name}
            </Text>
            {loading ? (
              <ActivityIndicator size="large" color="#1a237e" />
            ) : (
              <View style={styles.spotsGrid}>
                {spots.map(renderSpot)}
              </View>
            )}
          </View>
        )}

        {/* Cost Summary */}
        {selectedZone && selectedSpot && (
          <View style={styles.costSummary}>
            <Text style={styles.costLabel}>Total Cost:</Text>
            <Text style={styles.costAmount}>
              Ksh {selectedZone.hourly_rate * duration}
            </Text>
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedSpot || !vehiclePlate.trim() || loading) && styles.disabledButton
          ]}
          onPress={handleBooking}
          disabled={!selectedSpot || !vehiclePlate.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>
              Book Parking - Ksh {selectedZone ? selectedZone.hourly_rate * duration : 0}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  durationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  zoneCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#1a237e',
    backgroundColor: '#e8eaf6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  availableSpots: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  zoneLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  zoneRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  spotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spotCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '48%',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  unavailableCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  spotNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  spotStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  availableText: {
    color: '#4caf50',
  },
  unavailableText: {
    color: '#f44336',
  },
  costSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  costLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  costAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  bookButton: {
    backgroundColor: '#4caf50',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});