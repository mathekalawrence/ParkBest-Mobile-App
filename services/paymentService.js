import apiClient from './api';

class PaymentService {
  // Initiate M-Pesa payment
  async initiatePayment(paymentData) {
    try {
      const response = await apiClient.post('/payments/mpesa/stkpush', {
        booking_id: paymentData.bookingId,
        phone: paymentData.phone,
        amount: paymentData.amount,
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Payment initiation failed'
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(checkoutRequestId) {
    try {
      const response = await apiClient.get(`/payments/status/${checkoutRequestId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to check payment status'
      };
    }
  }
}

export default new PaymentService();