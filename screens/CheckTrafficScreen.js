
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// Conditional import for geolocation
let Geolocation;
if (Platform.OS !== 'web') {
  Geolocation = require('react-native-geolocation-service').default;
}
// Conditional import for web compatibility
let MapView, Marker, Polyline;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}

const { width, height } = Dimensions.get('window');

const RealTimeTrafficScreen = () => {
  const [trafficData, setTrafficData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [routeSuggestions, setRouteSuggestions] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Default Nairobi region
  const defaultRegion = {
    latitude: -1.2921,
    longitude: 36.8219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show traffic updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err); 
        return false;
      }
    }
    return true;
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (Platform.OS === 'web') {
      // Web geolocation fallback
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newLocation = {
              latitude,
              longitude,
              address: 'Your Current Location'
            };
            setCurrentLocation(newLocation);
            setMapRegion({
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            setIsGettingLocation(false);
            reverseGeocode(latitude, longitude);
          },
          (error) => {
            console.error('Web location error:', error);
            setCurrentLocation({
              latitude: -1.2921,
              longitude: 36.8219,
              address: 'Nairobi, Kenya'
            });
            setMapRegion(defaultRegion);
            setIsGettingLocation(false);
          }
        );
      } else {
        setCurrentLocation({
          latitude: -1.2921,
          longitude: 36.8219,
          address: 'Nairobi, Kenya'
        });
        setMapRegion(defaultRegion);
        setIsGettingLocation(false);
      }
    } else {
      // Mobile geolocation
      requestLocationPermission().then(granted => {
        if (granted) {
          Geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const newLocation = {
                latitude,
                longitude,
                address: 'Your Current Location'
              };
              setCurrentLocation(newLocation);
              setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
              setIsGettingLocation(false);
              reverseGeocode(latitude, longitude);
            },
            (error) => {
              console.error('Location error:', error);
              Alert.alert('❌ Location Error', 'Could not get your location. Using default location.');
              setCurrentLocation({
                latitude: -1.2921,
                longitude: 36.8219,
                address: 'Nairobi, Kenya'
              });
              setMapRegion(defaultRegion);
              setIsGettingLocation(false); 
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          Alert.alert('Permission Denied', 'Location permission is required for traffic updates.');
          setIsGettingLocation(false);
        }
      });
    }
  };

  // Converting coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      
      if (response.data && response.data.display_name) {
        const address = response.data.display_name.split(',').slice(0, 3).join(',');
        setCurrentLocation(prev => ({ ...prev, address }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Converting destination name to coordinates
  const geocodeDestination = async (destinationName) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName + ', Nairobi, Kenya')}`
      );
      
      if (response.data && response.data.length > 0) {
        const firstResult = response.data[0];
        return {
          latitude: parseFloat(firstResult.lat),
          longitude: parseFloat(firstResult.lon),
          address: firstResult.display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Getting route from Google Directions API
  const getGoogleMapsRoute = async (startCoords, endCoords) => {
    const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual key
    
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.latitude},${startCoords.longitude}&destination=${endCoords.latitude},${endCoords.longitude}&key=${API_KEY}`
      );

      if (response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        const distance = route.legs[0].distance.text;
        const duration = route.legs[0].duration.text;
        
        return {
          coordinates: points,
          distance,
          duration
        };
      }
      return null;
    } catch (error) {
      console.error('Google Maps API error:', error);
      return null;
    }
  };

  // Decode Google Maps polyline
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5
      });
    }
    return points;
  };

  // Main function to get traffic data
  const getRealTrafficData = async (destinationName) => {
    if (!currentLocation) {
      Alert.alert('📍 Location Required', 'Please wait for your location to be detected.');
      return;
    }

    if (!destinationName || !destinationName.trim()) {
      Alert.alert('❌ Destination Required', 'Please enter a destination.');
      return;
    }

    setIsLoading(true);
    setRouteSuggestions([]);
    setRouteCoordinates([]);

    try {
      const destinationCoords = await geocodeDestination(destinationName);
      
      if (!destinationCoords) {
        throw new Error('Could not find destination');
      }

      // Get route from Google Maps
      const route = await getGoogleMapsRoute(currentLocation, destinationCoords);
      
      if (!route) {
        throw new Error('Could not calculate route');
      }

      // Calculate congestion based on duration/distance
      const congestion = calculateCongestion(route.duration, route.distance);
      const suggestions = generateRouteSuggestions(congestion, route.duration, route.distance);
      
      setTrafficData({
        congestion,
        distance: route.distance,
        durationInTraffic: route.duration,
        route: `${currentLocation.address} to ${destinationName}`,
        destinationCoords
      });
      
      setRouteCoordinates(route.coordinates);
      setRouteSuggestions(suggestions);
      setDestination(destinationName);
      setShowMap(true);

      // Adjust map to show both locations
      if (currentLocation && destinationCoords) {
        const coordinates = [currentLocation, destinationCoords];
        setMapRegion(fitToCoordinates(coordinates));
      }

    } catch (error) {
      console.error('Traffic data error:', error);
      getSimulatedData(destinationName);
    } finally {
      setIsLoading(false);
    }
  };

  // Fit map to show all coordinates
  const fitToCoordinates = (coordinates) => {
    const latitudes = coordinates.map(coord => coord.latitude);
    const longitudes = coordinates.map(coord => coord.longitude);
    
    const maxLat = Math.max(...latitudes);
    const minLat = Math.min(...latitudes);
    const maxLng = Math.max(...longitudes);
    const minLng = Math.min(...longitudes);
    
    const latitudeDelta = (maxLat - minLat) * 1.5;
    const longitudeDelta = (maxLng - minLng) * 1.5;
    
    return {
      latitude: (maxLat + minLat) / 2,
      longitude: (maxLng + minLng) / 2,
      latitudeDelta: Math.max(latitudeDelta, 0.01),
      longitudeDelta: Math.max(longitudeDelta, 0.01),
    };
  };

  // Calculate congestion (simplified)
  const calculateCongestion = (duration, distance) => {
    // Simple logic - you can enhance this with real traffic data
    const numericDuration = parseInt(duration);
    if (numericDuration > 60) return 'severe';
    if (numericDuration > 40) return 'high';
    if (numericDuration > 20) return 'medium';
    return 'low';
  };

  // Generate route suggestions
  const generateRouteSuggestions = (congestion, duration, distance) => {
    const suggestions = [];
    
    if (congestion === 'severe' || congestion === 'high') {
      suggestions.push({
        title: '🚗 Alternative Route',
        description: 'Take back roads to avoid traffic',
        time: '+10-15 mins',
        advantage: 'Less congestion',
        icon: '🛣️'
      });
    }
    
    suggestions.push({
      title: '🗺️ Live Navigation',
      description: 'Open in Google Maps for real-time updates',
      time: 'Live',
      advantage: 'Best route updates',
      icon: '📱'
    });

    return suggestions;
  };

  // Fallback simulated data
  const getSimulatedData = (destinationName) => {
    const simulatedData = {
      'CBD': { congestion: 'high', duration: '25 mins', distance: '8.2 km' },
      'Westlands': { congestion: 'medium', duration: '18 mins', distance: '6.5 km' },
      'JKIA': { congestion: 'medium', duration: '35 mins', distance: '15.2 km' },
    };

    const data = simulatedData[destinationName] || simulatedData['CBD'];
    const suggestions = generateRouteSuggestions(data.congestion, data.duration, data.distance);
    
    setTrafficData({
      ...data,
      route: `${currentLocation?.address || 'Your Location'} to ${destinationName}`
    });
    
    setRouteSuggestions(suggestions);
    setDestination(destinationName);
    setShowMap(true);
    
    Alert.alert('ℹ️ Demo Mode', 'Using simulated data. Add Google Maps API key for live navigation.');
  };

  // Quick destination search
  const quickSearch = (place) => {
    setSearchText(place);
    getRealTrafficData(place);
  };

  // Open in Google Maps app
  const openInGoogleMaps = () => {
    if (currentLocation && trafficData?.destinationCoords) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${trafficData.destinationCoords.latitude},${trafficData.destinationCoords.longitude}&travelmode=driving`;
      
      // You would use Linking.openURL(url) here
      Alert.alert('🚗 Open in Maps', 'This would open Google Maps with your route');
    }
  };

  // Helper function for traffic color
  const getTrafficColor = (congestion) => {
    switch (congestion) {
      case 'severe': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };



  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Real-Time Traffic</Text>
        <Text style={styles.subtitle}>Live Nairobi traffic with Google Maps</Text>
      </View>

      {/* Current Location */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationTitle}>📍 Your Location</Text>
          <TouchableOpacity 
            style={styles.refreshLocationButton} 
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
          >
            <Text style={styles.refreshLocationText}>
              {isGettingLocation ? '🔄' : '📡'} Update
            </Text>
          </TouchableOpacity>
        </View>
        
        {currentLocation ? (
          <Text style={styles.locationText}>{currentLocation.address}</Text>
        ) : (
          <Text style={styles.locationText}>Getting your location...</Text>
        )}
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>🔍 Where to?</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter destination in Nairobi..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => getRealTrafficData(searchText)}
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={() => getRealTrafficData(searchText)}
            disabled={isLoading || !currentLocation}
          >
            <Text style={styles.searchButtonText}>
              {isLoading ? '...' : 'Search'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Destinations */}
        <Text style={styles.quickTitle}>Popular destinations:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
          {['CBD', 'Westlands', 'JKIA', 'Karen', 'Thika Road'].map((place) => (
            <TouchableOpacity
              key={place}
              style={styles.quickButton}
              onPress={() => quickSearch(place)}
            >
              <Text style={styles.quickText}>{place}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Calculating best route...</Text>
        </View>
      )}

      {/* Google Maps Section */}
      {showMap && mapRegion && (
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>🗺️ Route Map</Text>
          {Platform.OS === 'web' ? (
            // Web fallback
            <View style={styles.webMapPlaceholder}>
              <Text style={styles.webMapText}>📱 Map view available on mobile app</Text>
              <Text style={styles.webMapSubtext}>Use Google Maps button below for navigation</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              region={mapRegion}
              showsUserLocation={true}
              showsTraffic={true}
              showsCompass={true}
            >
              {currentLocation && (
                <Marker
                  coordinate={currentLocation}
                  title="Your Location"
                  description={currentLocation.address}
                  pinColor="#3b82f6"
                />
              )}
              {trafficData?.destinationCoords && (
                <Marker
                  coordinate={trafficData.destinationCoords}
                  title="Destination"
                  description={destination}
                  pinColor="#ef4444"
                />
              )}
              {routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#3b82f6"
                  strokeWidth={4}
                  lineDashPattern={[1]}
                />
              )}
            </MapView>
          )}

          {/* Map Actions */}
          <View style={styles.mapActions}>
            <TouchableOpacity 
              style={styles.navigateButton}
              onPress={openInGoogleMaps}
            >
              <Text style={styles.navigateButtonText}>🧭 Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Traffic Results */}
      {trafficData && !isLoading && (
        <>
          {/* Traffic Status Card */}
          <View style={styles.trafficCard}>
            <Text style={styles.routeName}>{trafficData.route}</Text>
            <View style={styles.trafficDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{trafficData.distance}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{trafficData.durationInTraffic}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Traffic</Text>
                <Text style={[styles.detailValue, {color: getTrafficColor(trafficData.congestion)}]}>
                  {trafficData.congestion}
                </Text>
              </View>
            </View>
          </View>

          {/* Route Suggestions */}
          {routeSuggestions.length > 0 && (
            <View style={styles.suggestionsCard}>
              <Text style={styles.suggestionsTitle}>💡 Route Suggestions</Text>
              {routeSuggestions.map((suggestion, index) => (
                <TouchableOpacity key={index} style={styles.suggestionItem}>
                  <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                    <Text style={styles.suggestionTime}>⏱️ {suggestion.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  refreshLocationButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshLocationText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  locationLoader: {
    marginTop: 8,
  },
  searchSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
    backgroundColor: '#f9fafb',
  },
  searchButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  quickTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  quickScroll: {
    flexDirection: 'row',
  },
  quickButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  trafficCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  trafficStatus: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  trafficDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  suggestionsCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 15,
  },
  suggestionItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  suggestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  suggestionTime: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  suggestionAdvantage: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  reportButton: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  mapContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  map: {
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  webMapPlaceholder: {
    height: 300,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  webMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  mapActions: {
    alignItems: 'center',
  },
  navigateButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navigateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default RealTimeTrafficScreen;
