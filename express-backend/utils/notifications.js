const axios = require('axios');

class NotificationService {
  // Send SMS notification via Africa's Talking or similar service
  static async sendSMS(phone, message) {
    try {
      // Example using Africa's Talking API
      if (!process.env.AFRICASTALKING_API_KEY) {
        console.log('SMS notification (demo):', { phone, message });
        return { success: true, demo: true };
      }

      const response = await axios.post('https://api.africastalking.com/version1/messaging', {
        username: process.env.AFRICASTALKING_USERNAME,
        to: phone,
        message: message
      }, {
        headers: {
          'apiKey': process.env.AFRICASTALKING_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking confirmation
  static async sendBookingConfirmation(phone, bookingDetails) {
    const message = `ParkBest: Booking confirmed! Spot: ${bookingDetails.spot_number}, Zone: ${bookingDetails.zone_name}, Time: ${bookingDetails.start_time} - ${bookingDetails.end_time}. Total: KSH ${bookingDetails.total_cost}`;
    return await this.sendSMS(phone, message);
  }

  // Send payment confirmation
  static async sendPaymentConfirmation(phone, paymentDetails) {
    const message = `ParkBest: Payment of KSH ${paymentDetails.amount} received. Receipt: ${paymentDetails.mpesa_receipt}. Your parking is now active.`;
    return await this.sendSMS(phone, message);
  }

  // Send booking expiry warning
  static async sendExpiryWarning(phone, bookingDetails) {
    const message = `ParkBest: Your parking expires in 15 minutes. Spot: ${bookingDetails.spot_number}. Extend via app or checkout to avoid penalties.`;
    return await this.sendSMS(phone, message);
  }

  // Send booking expired notification
  static async sendBookingExpired(phone, bookingDetails) {
    const message = `ParkBest: Your parking has expired. Spot: ${bookingDetails.spot_number}. Please move your vehicle to avoid penalties.`;
    return await this.sendSMS(phone, message);
  }
}

module.exports = NotificationService;