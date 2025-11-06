import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';
import { useParking } from '../context/ParkingContext';
import paymentService from '../services/paymentService';

const UpdatedBookParkingScreen = () => {
  const { user } = useAuth();
  const { 
    zones, 
    selectedZone, 
    availableSpots, 
    selectedSpot, 
    loading,
    loadZones,
    selectZone,
    loadAvailableSpots,
    selectSpot,
    createBooking
  } = useParking();

  const [duration, setDuration] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      loadAvailableSpots(selectedZone.id);
    }
  }, [selectedZone]);

  useEffect(() => {
    calculateTotalCost();
  }, [duration, selectedSpot]);

  const calculateTotalCost = () => {
    if (selectedSpot && selectedZone) {
      setTotalCost(selectedZone.hourly_rate * duration);
    } else {
      setTotalCost(0);
    }
  };

  const handleZoneSelect = (zone) => {
    selectZone(zone);
  };

  const handleSpotSelect = (spot) => {
    selectSpot(spot);
    setShowMap(false);
  };

  const handleBookParking = () => {
    if (!selectedSpot) {
      Alert.alert('Error', 'Please select a parking spot');
      return;
    }
    if (!vehiclePlate) {
      Alert.alert('Error', 'Please enter your vehicle plate number');
      return;
    }
    if (duration < 1) {
      Alert.alert('Error', 'Please select a valid duration');
      return;
    }
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create booking first
      const bookingResult = await createBooking({
        spotId: selectedSpot.id,
        vehiclePlate: vehiclePlate,
        duration: duration,
      });

      if (!bookingResult.success) {
        Alert.alert('Booking Failed', bookingResult.message);
        setIsProcessing(false);
        return;
      }

      setCurrentBooking(bookingResult.data);

      // 2. Initiate payment
      const paymentResult = await paymentService.initiatePayment({
        bookingId: bookingResult.data.id,
        phone: phoneNumber,
        amount: totalCost,
      });

      if (paymentResult.success) {
        Alert.alert(
          'Payment Initiated',
          'Please check your phone for M-Pesa prompt and enter your PIN to complete the payment.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPaymentModal(false);
                // Start checking payment status
                checkPaymentStatus(paymentResult.data.checkout_request_id);
              }
            }
          ]
        );
      } else {
        Alert.alert('Payment Failed', paymentResult.message);
      }

    } catch (error) {
      console.error('Booking/Payment error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (checkoutRequestId) => {
    let attempts = 0;
    const maxAttempts = 30; // Check for 5 minutes (30 * 10 seconds)

    const checkStatus = async () => {
      try {
        const result = await paymentService.checkPaymentStatus(checkoutRequestId);
        
        if (result.success) {
          const payment = result.data.payment;
          
          if (payment.status === 'completed') {
            Alert.alert(
              '🎉 Payment Successful!',
              `Your parking has been booked successfully!\n\n` +
              `Booking ID: ${currentBooking.id}\n` +
              `Location: ${selectedZone.name}\n` +
              `Spot: ${selectedSpot.spot_number}\n` +
              `Duration: ${duration} hour(s)\n` +
              `Total: Ksh ${totalCost}\n` +
              `M-Pesa Receipt: ${payment.mpesa_receipt}\n\n` +
              `You will receive an SMS confirmation shortly.`,
              [
                {
                  text: 'OK',
                  onPress: resetForm
                }
              ]
            );
            return;
          } else if (payment.status === 'failed') {
            Alert.alert('Payment Failed', 'Your payment was not successful. Please try again.');
            return;
          }
        }

        // Continue checking if payment is still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check again in 10 seconds
        } else {
          Alert.alert(
            'Payment Timeout', 
            'Payment verification is taking longer than expected. Please check your M-Pesa messages or contact support.'
          );
        }

      } catch (error) {
        console.error('Payment status check error:', error);
        Alert.alert('Error', 'Failed to check payment status. Please contact support.');
      }
    };

    checkStatus();
  };

  const resetForm = () => {
    selectZone(null);
    selectSpot(null);
    setVehiclePlate('');
    setDuration(1);
    setPaymentMethod('');
    setPhoneNumber('');
    setCurrentBooking(null);
  };

  const renderZone = (zone) => (
    <TouchableOpacity
      key={zone.id}
      style={[
        styles.zoneCard,
        selectedZone?.id === zone.id && styles.selectedZone,
      ]}
      onPress={() => handleZoneSelect(zone)}
    >
      <View style={styles.zoneHeader}>
        <Text style={styles.zoneName}>{zone.name}</Text>
        <View style={styles.availabilityBadge}>
          <Text style={styles.availabilityText}>
            {zone.available_spots || 0} spots
          </Text>
        </View>
      </View>
      <Text style={styles.zoneLocation}>{zone.location}</Text>
      <View style={styles.zoneFooter}>
        <Text style={styles.zoneRate}>Ksh {zone.hourly_rate}/hour</Text>
        <Text style={styles.zoneCapacity}>Total: {zone.total_spots}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSpot = (spot) => (
    <TouchableOpacity
      key={spot.id}
      style={[
        styles.spotCard,
        selectedSpot?.id === spot.id && styles.selectedSpot,
      ]}
      onPress={() => handleSpotSelect(spot)}
    >
      <View style={styles.spotHeader}>
        <Text style={styles.spotNumber}>Spot {spot.spot_number}</Text>
        <View style={[
          styles.statusBadge,
          spot.is_occupied ? styles.occupiedBadge : styles.availableBadge
        ]}>
          <Text style={styles.statusText}>
            {spot.is_occupied ? 'Occupied' : 'Available'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Book Parking</Text>
        <Text style={styles.subtitle}>Find and reserve parking spots in real-time</Text>
      </View>

      <View style={styles.formContainer}>
        {/* User Info */}
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {user.full_name}!</Text>
          </View>
        )}

        {/* Vehicle Details */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Plate Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., KCA 123A"
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            autoCapitalize="characters"
          />
        </View>

        {/* Date and Time Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {selectedDate.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="datetime"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}
        </View>

        {/* Duration Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (Hours)</Text>
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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Parking Zone</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#3498db" />
          ) : (
            zones.map(renderZone)
          )}
        </View>

        {/* Available Spots */}
        {selectedZone && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available Spots in {selectedZone.name}</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setShowMap(true)}
            >
              <Text style={styles.mapButtonText}>📍 View on Map</Text>
            </TouchableOpacity>
            
            {loading ? (
              <ActivityIndicator size="large" color="#3498db" />
            ) : (
              <View style={styles.spotsGrid}>
                {availableSpots.filter(spot => !spot.is_occupied).map(renderSpot)}
              </View>
            )}
          </View>
        )}

        {/* Cost Summary */}
        {selectedSpot && selectedZone && (
          <View style={styles.costSummary}>
            <Text style={styles.costLabel}>Total Cost:</Text>
            <Text style={styles.costAmount}>Ksh {totalCost}</Text>
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedSpot || !vehiclePlate || isProcessing) && styles.disabledButton,
          ]}
          onPress={handleBookParking}
          disabled={!selectedSpot || !vehiclePlate || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.bookButtonText}>
              Book Parking - Ksh {totalCost}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Select Parking Spot</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMap(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: -1.2921,
              longitude: 36.8219,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {availableSpots.map((spot) => (
              <Marker
                key={spot.id}
                coordinate={{
                  latitude: -1.2921 + (Math.random() - 0.5) * 0.01,
                  longitude: 36.8219 + (Math.random() - 0.5) * 0.01,
                }}
                title={`Spot ${spot.spot_number}`}
                description={spot.is_occupied ? 'Occupied' : 'Available'}
                pinColor={spot.is_occupied ? 'red' : 'green'}
                onPress={() => !spot.is_occupied && handleSpotSelect(spot)}
              />
            ))}
          </MapView>
          
          <View style={styles.mapSpotsList}>
            <ScrollView>
              {availableSpots.filter(spot => !spot.is_occupied).map(renderSpot)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Payment</Text>
            
            <View style={styles.paymentSummary}>
              <Text style={styles.summaryText}>
                Zone: {selectedZone?.name}
              </Text>
              <Text style={styles.summaryText}>
                Spot: {selectedSpot?.spot_number}
              </Text>
              <Text style={styles.summaryText}>
                Vehicle: {vehiclePlate}
              </Text>
              <Text style={styles.summaryText}>
                Duration: {duration} hour(s) × Ksh {selectedZone?.hourly_rate}
              </Text>
              <Text style={styles.totalText}>Total: Ksh {totalCost}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethod,
                    paymentMethod === 'mpesa' && styles.selectedPayment,
                  ]}
                  onPress={() => setPaymentMethod('mpesa')}
                >
                  <Text style={styles.paymentText}>M-Pesa</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="254712345678"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!paymentMethod || !phoneNumber) && styles.disabledButton,
                ]}
                onPress={processPayment}
                disabled={!paymentMethod || !phoneNumber || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Pay Ksh {totalCost}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: 'white',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'white',
  },
  durationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  zoneCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
  },
  selectedZone: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  availabilityBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  zoneLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  zoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoneRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  zoneCapacity: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  mapButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spotCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '48%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSpot: {
    borderColor: '#2ecc71',
    backgroundColor: '#e8f5e8',
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availableBadge: {
    backgroundColor: '#2ecc71',
  },
  occupiedBadge: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  costSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  costLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  costAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  bookButton: {
    backgroundColor: '#2ecc71',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Map Styles
  mapContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3498db',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
  },
  mapSpotsList: {
    flex: 1,
    padding: 10,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 5,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paymentMethod: {
    flex: 1,
    padding: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedPayment: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdatedBookParkingScreen;