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
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import reportingService from '../services/reportingService';

const { width } = Dimensions.get('window');

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
        selectedZone?.id === zone.id && styles.selectedZoneCard
      ]}
      onPress={() => setSelectedZone(zone)}
      activeOpacity={0.8}
    >
      <View style={styles.zoneCardContent}>
        <View style={styles.zoneHeader}>
          <View style={styles.zoneIconContainer}>
            <Ionicons name="location" size={24} color="#4A90E2" />
          </View>
          <View style={styles.zoneInfo}>
            <Text style={styles.zoneName}>{zone.name}</Text>
            <Text style={styles.zoneLocation}>
              <Ionicons name="pin" size={12} color="#666" /> {zone.location}
            </Text>
          </View>
          <View style={styles.availabilityBadge}>
            <Text style={styles.availableSpots}>{zone.available_spots}</Text>
            <Text style={styles.availableLabel}>available</Text>
          </View>
        </View>
        
        <View style={styles.zoneFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Rate</Text>
            <Text style={styles.zoneRate}>Ksh {zone.hourly_rate}/hr</Text>
          </View>
          {selectedZone?.id === zone.id && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSpot = (spot) => {
    const isAvailable = !spot.is_occupied && !spot.is_reserved;
    const isSelected = selectedSpot?.id === spot.id;
    
    return (
      <TouchableOpacity
        key={spot.id}
        style={[
          styles.spotCard,
          isSelected && styles.selectedSpotCard,
          !isAvailable && styles.unavailableSpotCard
        ]}
        onPress={() => {
          if (isAvailable) {
            setSelectedSpot(spot);
          }
        }}
        disabled={!isAvailable}
        activeOpacity={0.8}
      >
        <View style={styles.spotCardContent}>
          <View style={styles.spotHeader}>
            <Ionicons 
              name={isAvailable ? "car-outline" : "close-circle"} 
              size={20} 
              color={isAvailable ? (isSelected ? "#4CAF50" : "#4A90E2") : "#F44336"} 
            />
            <Text style={[
              styles.spotNumber,
              isSelected && styles.selectedSpotText,
              !isAvailable && styles.unavailableSpotText
            ]}>
              {spot.spot_number}
            </Text>
          </View>
          
          <View style={[
            styles.spotStatusBadge,
            isAvailable ? styles.availableBadge : styles.unavailableBadge,
            isSelected && styles.selectedBadge
          ]}>
            <Text style={[
              styles.spotStatus,
              isAvailable ? styles.availableText : styles.unavailableText,
              isSelected && styles.selectedStatusText
            ]}>
              {spot.is_occupied ? 'Occupied' : spot.is_reserved ? 'Reserved' : 'Available'}
            </Text>
          </View>
          
          {isSelected && (
            <View style={styles.selectedSpotIndicator}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      <ScrollView style={styles.content}>
        {/* Centered Header Section */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Book Your Parking</Text>
          <Text style={styles.pageSubtitle}>Find and reserve the perfect spot in seconds</Text>
        </View>
        
        {/* Enhanced User Info */}
        {user && (
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoContent}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={24} color="#4A90E2" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>Welcome back!</Text>
                <Text style={styles.userName}>{user.full_name}</Text>
              </View>
              <View style={styles.userBadge}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.userLevel}>Premium</Text>
              </View>
            </View>
          </View>
        )}

        {/* Enhanced Vehicle Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="keypad" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.enhancedInput}
              placeholder="Enter plate number (e.g., KCA 123A)"
              placeholderTextColor="#999"
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              autoCapitalize="characters"
            />
            {vehiclePlate.length > 0 && (
              <TouchableOpacity onPress={() => setVehiclePlate('')}>
                <Ionicons name="close-circle" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Enhanced Duration Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Parking Duration</Text>
          </View>
          <View style={styles.durationCard}>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setDuration(Math.max(1, duration - 1))}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={20} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.durationDisplay}>
              <Text style={styles.durationNumber}>{duration}</Text>
              <Text style={styles.durationLabel}>hour{duration > 1 ? 's' : ''}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setDuration(duration + 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Quick Duration Options */}
          <View style={styles.quickDurationContainer}>
            {[1, 2, 4, 8].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.quickDurationButton,
                  duration === hours && styles.selectedQuickDuration
                ]}
                onPress={() => setDuration(hours)}
              >
                <Text style={[
                  styles.quickDurationText,
                  duration === hours && styles.selectedQuickDurationText
                ]}>
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
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

        {/* Enhanced Cost Summary */}
        {selectedZone && selectedSpot && (
          <View style={styles.costSummaryCard}>
            <View style={styles.costSummaryHeader}>
              <Ionicons name="receipt" size={20} color="#4A90E2" />
              <Text style={styles.costSummaryTitle}>Booking Summary</Text>
            </View>
            
            <View style={styles.costBreakdown}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Zone:</Text>
                <Text style={styles.costValue}>{selectedZone.name}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Spot:</Text>
                <Text style={styles.costValue}>#{selectedSpot.spot_number}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Duration:</Text>
                <Text style={styles.costValue}>{duration} hour{duration > 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Rate:</Text>
                <Text style={styles.costValue}>Ksh {selectedZone.hourly_rate}/hr</Text>
              </View>
              
              <View style={styles.costDivider} />
              
              <View style={styles.totalCostRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>
                  Ksh {selectedZone.hourly_rate * duration}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Enhanced Book Button */}
        <LinearGradient
          colors={(!selectedSpot || !vehiclePlate.trim() || loading) 
            ? ['#ccc', '#999'] 
            : ['#4CAF50', '#45A049']
          }
          style={styles.bookButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBooking}
            disabled={!selectedSpot || !vehiclePlate.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.bookButtonContent}>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <View style={styles.bookButtonTextContainer}>
                  <Text style={styles.bookButtonText}>Confirm Booking</Text>
                  <Text style={styles.bookButtonSubtext}>
                    Pay Ksh {selectedZone ? selectedZone.hourly_rate * duration : 0}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Content Styles
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Page Header Styles
  pageHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // User Info Card
  userInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 4,
  },
  
  // Section Styles
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  
  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  enhancedInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 16,
  },
  
  // Duration Styles
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  durationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  durationDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  durationNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickDurationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickDurationButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  selectedQuickDuration: {
    backgroundColor: '#4A90E2',
  },
  quickDurationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedQuickDurationText: {
    color: '#fff',
  },
  
  // Zone Card Styles
  zoneCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedZoneCard: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F7FF',
  },
  zoneCardContent: {
    padding: 20,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  zoneIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  zoneLocation: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  availableSpots: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  availableLabel: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  zoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  zoneRate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E74C3C',
  },
  selectedIndicator: {
    marginLeft: 16,
  },
  
  // Spot Card Styles
  spotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    width: (width - 60) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSpotCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  unavailableSpotCard: {
    backgroundColor: '#FAFAFA',
    opacity: 0.7,
  },
  spotCardContent: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spotNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  selectedSpotText: {
    color: '#4CAF50',
  },
  unavailableSpotText: {
    color: '#999',
  },
  spotStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availableBadge: {
    backgroundColor: '#E8F5E8',
  },
  unavailableBadge: {
    backgroundColor: '#FFEBEE',
  },
  selectedBadge: {
    backgroundColor: '#4CAF50',
  },
  spotStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableText: {
    color: '#4CAF50',
  },
  unavailableText: {
    color: '#F44336',
  },
  selectedStatusText: {
    color: '#fff',
  },
  selectedSpotIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Cost Summary Styles
  costSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  costSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  costSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  costBreakdown: {
    gap: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  costDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E74C3C',
  },
  
  // Book Button Styles
  bookButtonGradient: {
    borderRadius: 16,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bookButton: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButtonTextContainer: {
    marginLeft: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  bookButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  
  // Utility Styles
  bottomSpacing: {
    height: 20,
  },
});