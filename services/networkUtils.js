import * as Network from 'expo-network';

class NetworkUtils {
  constructor() {
    this.isOnline = true;
    this.listeners = [];
    this.init();
  }

  async init() {
    // Check initial network state
    const networkState = await Network.getNetworkStateAsync();
    this.isOnline = networkState.isConnected;

    // Set up network state listener
    this.networkListener = Network.addNetworkStateListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected;
      
      // Notify listeners of network state change
      this.listeners.forEach(callback => {
        callback(this.isOnline, wasOnline);
      });
    });
  }

  // Add a listener for network state changes
  addListener(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Get current network status
  getNetworkStatus() {
    return this.isOnline;
  }

  // Check if device is online
  async checkConnection() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.isOnline = networkState.isConnected;
      return this.isOnline;
    } catch (error) {
      console.log('Network check failed:', error);
      return false;
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
    this.listeners = [];
  }
}

export default new NetworkUtils();