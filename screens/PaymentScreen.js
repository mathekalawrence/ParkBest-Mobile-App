import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (phone) => {
    // Convert to 254 format
    if (phone.startsWith('0')) {
      return '254' + phone.substring(1);
    }
    if (phone.startsWith('+254')) {
      return phone.substring(1);
    }
    if (phone.startsWith('254')) {
      return phone;
    }
    return '254' + phone;
  };

  const initiatePayment = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your M-Pesa phone number');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const response = await fetch('http://192.168.100.5:8080/api/payments/mpesa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: booking.id,
          phone_number: formattedPhone
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Payment Initiated',
          'Check your phone for M-Pesa prompt and enter your PIN to complete payment.',
          [
            {
              text: 'OK',
              onPress: () => checkPaymentStatus(data.checkout_request_id)
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Payment initiation failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (checkoutRequestId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`http://192.168.100.5:8080/api/payments/status/${checkoutRequestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'completed') {
        Alert.alert(
          'Payment Successful',
          'Your parking has been confirmed!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('BookingHistory')
            }
          ]
        );
      } else if (data.status === 'failed') {
        Alert.alert('Payment Failed', 'Please try again or use a different payment method.');
      } else {
        // Still pending, check again after 5 seconds
        setTimeout(() => checkPaymentStatus(checkoutRequestId), 5000);
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Payment</Text>
      
      <View style={styles.bookingInfo}>
        <Text style={styles.infoTitle}>Booking Details</Text>
        <Text style={styles.infoText}>Zone: {booking.zone_name}</Text>
        <Text style={styles.infoText}>Spot: {booking.spot_number}</Text>
        <Text style={styles.infoText}>Duration: {booking.duration_hours} hours</Text>
        <Text style={styles.totalAmount}>Total: KSh {booking.total_amount}</Text>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>M-Pesa Payment</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter M-Pesa number (e.g., 0712345678)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          maxLength={13}
        />
        
        <TouchableOpacity 
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={initiatePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay KSh {booking.total_amount}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333'
  },
  bookingInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    elevation: 2
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666'
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 10
  },
  paymentSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9'
  },
  payButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  payButtonDisabled: {
    backgroundColor: '#ccc'
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default PaymentScreen;