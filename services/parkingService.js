import apiClient from './api';

class ParkingService {
  // Get all parking zones
  async getParkingZones() {
    try {
      const response = await apiClient.get('/parking/zones');
      return {
        success: true,
        data: response.data.zones
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch parking zones'
      };
    }
  }

  // Get available spots in a zone
  async getAvailableSpots(zoneId) {
    try {
      const response = await apiClient.get(`/parking/zones/${zoneId}/spots`);
      return {
        success: true,
        data: response.data.spots
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch available spots'
      };
    }
  }

  // Create a booking
  async createBooking(bookingData) {
    try {
      const response = await apiClient.post('/parking/book', {
        parking_spot_id: bookingData.spotId,
        vehicle_plate: bookingData.vehiclePlate,
        duration_hours: bookingData.duration,
      });
      
      return {
        success: true,
        data: response.data.booking
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create booking'
      };
    }
  }

  // Get user's booking history
  async getUserBookings() {
    try {
      const response = await apiClient.get('/parking/bookings');
      return {
        success: true,
        data: response.data.bookings
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch bookings'
      };
    }
  }

  // Check in to parking spot
  async checkIn(bookingId) {
    try {
      const response = await apiClient.post('/realtime/checkin', {
        booking_id: bookingId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Check-in failed'
      };
    }
  }

  // Check out from parking spot
  async checkOut(bookingId) {
    try {
      const response = await apiClient.post('/realtime/checkout', {
        booking_id: bookingId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Check-out failed'
      };
    }
  }
}

export default new ParkingService();