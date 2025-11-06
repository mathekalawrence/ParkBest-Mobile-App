
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ReportScreen({ navigation }) {
  // Emergency contact numbers
  const emergencyContacts = {
    police: '999',
    ambulance: '112',
    roadAssistance: '0710689178',
  };

  // Function to handle emergency calls
  const handleEmergencyCall = (service, number) => {
    Alert.alert(
      `Call ${service}`,
      `Do you want to call ${service} at ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${number}`),
          style: 'default'
        }
      ]
    );
  };

  // Function to handle report incident
  const handleReportIncident = () => {
    Alert.alert(
      'Report Incident',
      'What type of incident would you like to report?',
      [
        {
          text: 'Accident',
          onPress: () => navigation.navigate('ReportIncident') // Navigates to detailed accident report
        },
        {
          text: 'Road Hazard',
          onPress: () => navigation.navigate('HazardReport') // I will create the screen later
        },
        {
          text: 'Traffic Issue',
          onPress: () => navigation.navigate('TrafficReport') // I will create this later
        },


        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  //Function to handle book parking
  const handleBookParking = () => {

  }


  // Function to handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          }),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="car-sport" size={30} color="#fff" />
          <Text style={styles.headerTitle}> ParkBest App</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionSubtitle}>Press any contact to call immediately</Text>
          
          {/* Police Contact */}
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => handleEmergencyCall('Police', emergencyContacts.police)}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#d32f2f" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Police</Text>
              <Text style={styles.contactNumber}>{emergencyContacts.police}</Text>
            </View>
            <Ionicons name="call-outline" size={24} color="#1a237e" />
          </TouchableOpacity>

          {/* Ambulance Contact */}
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => handleEmergencyCall('Ambulance', emergencyContacts.ambulance)}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="medkit" size={24} color="#388e3c" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Ambulance / First Aid</Text>
              <Text style={styles.contactNumber}>{emergencyContacts.ambulance}</Text>
            </View>
            <Ionicons name="call-outline" size={24} color="#1a237e" />
          </TouchableOpacity>

          {/* Road Assistance Contact */}
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => handleEmergencyCall('Road Assistance', emergencyContacts.roadAssistance)}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="build" size={24} color="#f57c00" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Road Assistance</Text>
              <Text style={styles.contactNumber}>{emergencyContacts.roadAssistance}</Text>
            </View>
            <Ionicons name="call-outline" size={24} color="#1a237e" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {/* 'Report Incident' Button */}
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={handleReportIncident}
          >
            <Ionicons name="warning" size={24} color="#fff" />
            <Text style={styles.reportButtonText}>Report an Incident</Text>
          </TouchableOpacity>

          {/* Book Parking Button */}
          <TouchableOpacity
           style={styles.bookParkingButton}
           onPress={()=> navigation.navigate('SimpleBookParking')}
        
          >

            <Ionicons name="" size={24} color="#fff" />
            <Text style={styles.bookParkingButtonText}>Book Parking</Text>
          </TouchableOpacity>

          <TouchableOpacity
           style={styles.bookParkingButton}
           onPress={()=> navigation.navigate('CheckTraffic')}
        
          >
            <Ionicons name="" size={24} color="#fff" />
            <Text style={styles.bookParkingButtonText}>Check Traffic</Text>
          </TouchableOpacity>

          {/* Additional Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('IntegrationReport')}
            >
              <Ionicons name="analytics" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>Integration Report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="document-text" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>Past Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="settings" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Safety Tips</Text>
          <Text style={styles.infoText}>
            • Stay calm and assess the situation before acting{'\n'}
            • Ensure your own safety first{'\n'}
            • Provide clear location details when reporting{'\n'}
            • Follow instructions from emergency services{'\n'}
            • Keep emergency numbers handy{'\n'}
            • Please do the necessary with care.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: '100%',
    textAlign: 'center'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  contactCard: {
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
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reportButton: {
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

   reportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  bookParkingButton: {
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

   bookParkingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '30%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1a237e',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#e8eaf6',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1a237e',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});