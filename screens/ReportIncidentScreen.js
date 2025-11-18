

/*
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export default function ReportIncidentScreen({ navigation, route }) {
  // State management
  const [incidentType, setIncidentType] = useState('Choose the Accident Type'); // Default to common accident type
  const [description, setDescription] = useState('');
  const [vehicles, setVehicles] = useState({
    car: '',
    truck: '',
    motorcycle: '',
    bicycle: '',
    pedestrian: '',
    other: ''
  });

  const [injuries, setInjuries] = useState({
    minor: '',
    serious: '',
    fatal: ''
  });
  const [evidence, setEvidence] = useState([]);
  const [location, setLocation] = useState(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

 // Accident-specific incident types
  const accidentTypes = [
    'Choose the Accident Type',
    'Vehicle Collision',
    'Slip Off Road', 
    'Rollover Accident',
    'Head-On Collision',
    'Rear-End Collision',
    'Side-Impact Collision',
    'Hit and Run',
    'Pedestrian Accident',
    'Cyclist Accident',
    'Multiple Vehicle Pileup',
    'Vehicle Fire',
    'Other Accident'
  ];

 // Severity levels for accidents
  const severityLevels = [
    'Minor - No injuries',
    'Moderate - Minor injuries',
    'Serious - Major injuries', 
    'Critical - Life-threatening',
    'Fatal - Deaths involved'
  ];

   // Initializing location and permissions
  useEffect(() => {
    (async () => {
      // Requesting location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed for accident reporting');
        return;
      }
 
   // Getting current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();

    // Requesting media permissions
    (async () => {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

           if (cameraPermission.status !== 'granted' || libraryPermission.status !== 'granted') {
        Alert.alert('Permission required', 'Camera and gallery access needed for evidence');
      }
    })();
  }, []);

    // Handling emergency call/ Distress Call
  const handleEmergencyCall = () => {
    const emergencyNumber = '0710689178';
    Alert.alert(
      'Emergency Call',
      `Do you want to call emergency services at ${emergencyNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${emergencyNumber}`),
          style: 'destructive'
        }
      ]
    );
  };

   // Handling evidence capture
  const takePhoto = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setEvidence(prev => [...prev, { type: 'photo', uri: result.assets[0].uri }]);

         }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

   const takeVideo = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30,
      });

      if (!result.canceled) {
        setEvidence(prev => [...prev, { type: 'video', uri: result.assets[0].uri }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video');
    }
};

const pickFromGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const type = result.assets[0].type === 'video' ? 'video' : 'photo';
        setEvidence(prev => [...prev, { type, uri: result.assets[0].uri }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media from gallery');
    }
};
// Remove evidence item
  const removeEvidence = (index) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  // Handle vehicle count change
  const updateVehicleCount = (vehicleType, value) => {
    setVehicles(prev => ({
      ...prev,
      [vehicleType]: value.replace(/[^0-9]/g, '') // Only allow numbers
    }));
  };

  // Handling injuries count change
  const updateInjuriesCount = (injuryType, value) => {
    setInjuries(prev => ({
      ...prev,
      [injuryType]: value.replace(/[^0-9]/g, '')
    }));
  };

 // Handling form submission
  const handleSubmit = async () => {
    // Validation
    if (!incidentType) {
      Alert.alert('Validation Error', 'Please select an accident type');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please provide accident description');
      return;
    }

     if (!location) {
      Alert.alert('Validation Error', 'Location is required for accident reporting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));

       Alert.alert(
        'Accident Report Submitted',
        'Your accident report has been submitted successfully. Emergency services have been notified and are on their way.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Report')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Submission Error', 'Failed to submit accident report. Please try again.');
         } finally {
      setIsSubmitting(false);
    }
  };

   // Handling cancel
  const handleCancel = () => {
    if (description || incidentType || evidence.length > 0) {
      Alert.alert(
        'Cancel Accident Report',
        'Are you sure you want to cancel? All entered data will be lost.',
        [
          { text: 'Continue Editing', style: 'cancel' },
          { 
            text: 'Cancel Report', 
            style: 'destructive',
            onPress: () => navigation.navigate('Report')
          }
        ]
      );
     } else {
      navigation.navigate('Report');
    }
  };

  */

  {/*

   return (
    <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
      <SafeAreaView style={styles.container}>
      */}

        {/* Header */}

        {/*

        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>   

          */}


            {/*<Ionicons name="arrow-back" size={20} color="#fff" /> */} 

            {/*

          </TouchableOpacity>

          <Text style={styles.headerTitle}>Report Accident</Text>
          <View style={styles.headerRight} />
        </View>

        */}

        {/*
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

        */}

          {/* Emergency Call Button */}

          {/*
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
            <Ionicons name="alert-circle" size={24} color="#6e0202ff" />
            <Text style={styles.emergencyButtonText}>Emergency Call: 0710689178</Text>
          </TouchableOpacity>

          */}

          {/* Accident Information Banner */}

          {/*
          <View style={styles.accidentBanner}>
            <Ionicons name="warning" size={20} color="#b71c1c" />
            <Text style={styles.accidentBannerText}>You are reporting a road accident</Text>
          </View>

          */}

          {/* Accident Type Dropdown */}

          {/*
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accident Type </Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setDropdownVisible(!isDropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {incidentType}
              </Text>
              <Ionicons name={isDropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </TouchableOpacity>

            <Modal
              visible={isDropdownVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setDropdownVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.dropdownList}>
                    <Text style={styles.dropdownTitle}>Select Accident Type</Text>
                    {accidentTypes.map((type, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setIncidentType(type);
                          setDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{type}</Text>
                        {type === incidentType && (
                          <Ionicons name="checkmark" size={20} color="#1a237e" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>

          */}

          {/* Accident Description */}

          {/*
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accident Description </Text>
            <Text style={styles.sectionSubtitle}>Please describe what happened in detail</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Include details like: vehicles involved, direction of travel, weather conditions, road conditions, sequence of events, and any immediate dangers..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={12}
              textAlignVertical="top"
            />
          </View>

          */}

          {/* Vehicles Involved 
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicles & People Involved</Text>
            <Text style={styles.sectionSubtitle}>Enter number of vehicles and people involved</Text>
            
            <Text style={styles.subsectionTitle}>Vehicles:</Text>
            {['car', 'truck', 'motorcycle', 'bicycle'].map((vehicleType) => (
              <View key={vehicleType} style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>
                  {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}s:
                </Text>
                <TextInput
                  style={styles.vehicleInput}
                  placeholder="Enter Value Here.. "
                  placeholderTextColor="#999"
                  value={vehicles[vehicleType]}
                  onChangeText={(value) => updateVehicleCount(vehicleType, value)}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            ))}
            
            <Text style={styles.subsectionTitle}>People:</Text>
            {['pedestrian', 'other'].map((personType) => (
              <View key={personType} style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>
                  {personType === 'pedestrian' ? 'Pedestrians' : 'Others'}:
                </Text>
                <TextInput
                  style={styles.vehicleInput}
                  placeholder="Please Enter the Value"
                  placeholderTextColor="#999"
                  value={vehicles[personType]}
                  onChangeText={(value) => updateVehicleCount(personType, value)}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            ))}
          </View>

          * Injuries Section 
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Injuries</Text>
            <Text style={styles.sectionSubtitle}>Report any injuries sustained</Text>
            
            {[
              { key: 'minor', label: 'Minor Injuries' },
              { key: 'serious', label: 'Serious Injuries' },
              { key: 'fatal', label: 'Fatalities' }
            ].map((injury) => (
              <View key={injury.key} style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>{injury.label}:</Text>
                <TextInput
                  style={styles.vehicleInput}
                  placeholder="Enter the Value"
                  placeholderTextColor="#999"
                  value={injuries[injury.key]}
                  onChangeText={(value) => updateInjuriesCount(injury.key, value)}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            ))}
          </View>

        * Evidence Section
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence</Text>
            <Text style={styles.sectionSubtitle}>Add photos or videos of the accident scene</Text>
            
            <View style={styles.evidenceButtons}>
              <TouchableOpacity style={styles.evidenceButton} onPress={takePhoto}>
                <Ionicons name="camera" size={40} color="#1a237e" />
                <Text style={styles.evidenceButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.evidenceButton} onPress={takeVideo}>
                <Ionicons name="videocam" size={40} color="#1a237e" />
                <Text style={styles.evidenceButtonText}>Record Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.evidenceButton} onPress={pickFromGallery}>
                <Ionicons name="images" size={40} color="#1a237e" />
                <Text style={styles.evidenceButtonText}>From Gallery</Text>
              </TouchableOpacity>
            </View>

            * Evidence Preview 
            {evidence.length > 0 && (
              <View style={styles.evidencePreview}>
                <Text style={styles.evidenceTitle}>Accident Evidence ({evidence.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {evidence.map((item, index) => (
                    <View key={index} style={styles.evidenceItem}>
                      <Image source={{ uri: item.uri }} style={styles.evidenceImage} />
                      <TouchableOpacity 
                        style={styles.removeEvidence}
                        onPress={() => removeEvidence(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#ff4444" />
                      </TouchableOpacity>
                      <Text style={styles.evidenceType}>
                        {item.type === 'photo' ? 'Photo' : 'Video'}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          * Location Section 
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accident Location</Text>
            {location ? (
              <View style={styles.locationBox}>
                <Ionicons name="location" size={30} color="#1a237e" />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>
                    Latitude: {location.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.locationText}>
                    Longitude: {location.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.locationAccuracy}>
                    Accuracy: ±{location.accuracy ? location.accuracy.toFixed(1) : 'N/A'} meters
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.locationLoading}>
                <Text style={styles.locationLoadingText}>Getting accident location...</Text>
              </View>
            )}
            
            {/* Map Placeholder 
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={100} color="#ccc" />
              <Text style={styles.mapPlaceholderText}>Accident Location Map</Text>
              <Text style={styles.mapNote}>
                {location ? 'The accident location is shown on the map' : 'Locating accident scene...'}
              </Text>
            </View>
          </View>

          {/* Action Buttons 
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Reporting Accident...</Text>
              ) : (
                <>
                  <Ionicons name="warning" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Accident Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Safety Notice 
          <View style={styles.safetyNotice}>
            <Ionicons name="medkit" size={16} color="#d32f2f" />
            <Text style={styles.safetyNoticeText}>
              Please ensure everyones safety first. Provide first aid if trained and wait for emergency services.
            </Text>
          </View>

          {/* Required Fields Note 
          <Text style={styles.requiredNote}>* Required fields</Text>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#b5dda5ff',
    alignItems: 'center',
    marginBottom: 20,
    padding: 2,
  },

  content: {
    flex: 1,
    padding: 32,
    backgroundColor: '#aeddd7ff',
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginTop: 0,
    
  },
  
  accidentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 10,
    borderLeftColor: '#d32f2f',
  },
  accidentBannerText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',

  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    padding: 10

  },

  dropdownTitleText: {
    fontWeight: 'bold',

  },

  dropdownText: {
    fontWeight: 'bold',
    fontSize: 17,

  },

  subsectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fbe9e7',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff5722',
    marginBottom: 20,
  },
  safetyNoticeText: {
    color: '#d84315',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },

  /*  submitButton: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  }, 

  submitButton: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  
  },
  submitButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },

  emergencyButton:{
    backgroundColor: 'red',
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    
  },
  emergencyButtonText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'green',

  },

  header: {
    backgroundColor: 'white',
    marginBottom: 0,
    marginTop: 0,
    width: '100%'
    
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 15,
    textAlign: 'center' 
     
  },

  sectionSubtitle: {
    fontStyle: 'italic',
    fontWeight: 'bold',

  },

  modalOverlay: {
    backgroundColor: 'yellow',
    width: 300,
    borderRadius: 20,
    paddingTop: 40,
    paddingLeft: 30,
    marginTop: 53,
    marginLeft: 30.5,
    
    //flexDirection: 'column',
    //alignItems: 'center',
    //backgroundColor: '#fff',
    //padding: 15,
    //borderRadius: 10,
    //marginBottom: 10,
   // borderWidth: 1,
    //borderColor: '#e0e0e0',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.1,
    //shadowRadius: 3,
     //elevation: 2, 
  },

  dropdownList: {
    fontWeight: 'bold',
  },

  dropdownItem: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    padding: 5,
    fontSize: 13,
  },

  headerRight: {
    width: '100%'
  },

  locationBox: {
    
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,  

  },

  section: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  dropdowm: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  sectiond: {

  flexDirection: 'column',   
  backgroundColor: '#fff',
  padding: 30,               
  borderRadius: 12,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 4,             
  minHeight: 200,            

  },

  evidenceButtons: {
  
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
    minHeight: '100px'

  },

  cancelButton: {
    backgroundColor: '#1rgba(220, 222, 236, 1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',

  },

  cancelButtonText: {
    color: '#da571bff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },


 
});

*/}