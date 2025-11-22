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
import apiClient from '../services/api';

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
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('🔄 Initiating M-Pesa payment...');
      console.log('📱 Phone:', formattedPhone);
      console.log('💰 Amount:', booking.total_amount);
      console.log('📋 Booking ID:', booking.id);

      const response = await apiClient.post('/payments/mpesa/initiate', {
        booking_id: booking.id,
        phone_number: formattedPhone
      });

      console.log('✅ Payment response:', response.data);

      if (response.data.checkout_request_id) {
        Alert.alert(
          'Payment Initiated',
          'Check your phone for M-Pesa prompt and enter your PIN to complete payment.',
          [
            {
              text: 'OK',
              onPress: () => checkPaymentStatus(response.data.checkout_request_id)
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Payment failed';
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (checkoutRequestId) => {
    try {
      console.log('🔍 Checking payment status for:', checkoutRequestId);
      
      const response = await apiClient.get(`/payments/status/${checkoutRequestId}`);
      console.log('📊 Payment status:', response.data);

      if (response.data.status === 'completed') {
        Alert.alert(
          'Payment Successful',
          'Your parking has been confirmed!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else if (response.data.status === 'failed') {
        Alert.alert('Payment Failed', 'Please try again or use a different payment method.');
      } else {
        // Still pending, check again after 5 seconds
        console.log('⏳ Payment still pending, checking again in 5s...');
        setTimeout(() => checkPaymentStatus(checkoutRequestId), 5000);
      }
    } catch (error) {
      console.error('❌ Status check error:', error);
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