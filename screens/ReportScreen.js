
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ReportScreen({ navigation }) {

  {/*
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

  */}

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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Find Your Perfect Parking Spot</Text>
          <Text style={styles.heroSubtitle}>Quick, easy, and hassle-free parking reservations</Text>
        </View>

        {/* Main Booking Action */}
        <TouchableOpacity 
          style={styles.mainBookingButton}
          onPress={() => navigation.navigate('BookParking')}
        >
          <View style={styles.bookingButtonContent}>
            <Ionicons name="car" size={32} color="#fff" />
            <View style={styles.bookingButtonText}>
              <Text style={styles.bookingButtonTitle}>Book Parking Now</Text>
              <Text style={styles.bookingButtonSubtitle}>Reserve your spot instantly</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Parking Zones</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>99%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Help & Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <Text style={styles.sectionSubtitle}>Get assistance when you need it</Text>
          
          {/* Customer Helpline */}
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => handleEmergencyCall('Customer Helpline', '+254-700-123456')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="headset" size={24} color="#2196F3" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Customer Helpline</Text>
              <Text style={styles.contactNumber}>+254-700-123456</Text>
            </View>
            <Ionicons name="call-outline" size={24} color="#1a237e" />
          </TouchableOpacity>

<<<<<<< HEAD
          {/* Ambulance Contact */}

          {/*

=======
          {/* Technical Support */}
>>>>>>> a3f9763c8e19fd136d65e0cc4472b038d37daf6c
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => handleEmergencyCall('Technical Support', '+254-700-123457')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="construct" size={24} color="#4CAF50" />
            </View>
            <View style={styles.contactInfo}>
<<<<<<< HEAD
              <Text style={styles.contactTitle}>Ambulance / First Aid</Text>
              <Text style={styles.contactNumber}>{emergencyContacts.ambulance}</Text>
            </View>
            <Ionicons name="call-outline" size={24} color="#1a237e" />
          </TouchableOpacity>

          */}

          {/* Road Assistance Contact */}

          {/*


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
=======
              <Text style={styles.contactTitle}>Technical Support</Text>
              <Text style={styles.contactNumber}>+254-700-123457</Text>
>>>>>>> a3f9763c8e19fd136d65e0cc4472b038d37daf6c
            </View>
            <Ionicons name="call-outline" size={24} color="#1a237e" />
          </TouchableOpacity>


           */}
        </View>

<<<<<<< HEAD
       

        {/* Quick Actions Section */}
       <View style={styles.section}>

          {/*
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          /*}
          
          //Report Incident' Button 
        {/*
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={handleReportIncident}
          >
            <Ionicons name="warning" size={24} color="#fff" />
            <Text style={styles.reportButtonText}>Report an Incident</Text>
          </TouchableOpacity>
          
          */}


          

          {/* Book Parking Button */}
          <TouchableOpacity
           style={styles.bookParkingButton}
           onPress={()=> navigation.navigate('BookParking')}
        
          >

            <Ionicons name="" size={24} color="#fff" />
            <Text style={styles.bookParkingButtonText}>Book Parking</Text>
          </TouchableOpacity>

         {/*
          <TouchableOpacity
           style={styles.bookParkingButton}
           onPress={()=> navigation.navigate('CheckTraffic')}
        
          >
            <Ionicons name="" size={24} color="#fff" />
            <Text style={styles.bookParkingButtonText}>Check Traffic</Text>
          </TouchableOpacity>

          */}

          {/* Additional Quick Actions */}
=======
        {/* My Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          
>>>>>>> a3f9763c8e19fd136d65e0cc4472b038d37daf6c
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('BookingHistory')}
            >
              <Ionicons name="time" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>Booking History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('PaymentHistory')}
            >
              <Ionicons name="card" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>Payment History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="settings" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>Profile Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Services</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('CheckTraffic')}
            >
              <Ionicons name="car-sport" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>Traffic Info</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleReportIncident}
            >
              <Ionicons name="warning" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>Report Issue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('OfflineReports')}
            >
              <Ionicons name="document-text" size={24} color="#1a237e" />
              <Text style={styles.quickActionText}>My Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Parking Tips</Text>
          <Text style={styles.infoText}>
<<<<<<< HEAD
            • Ensure your own safety first{'\n'}
            • Follow instructions from emergency services{'\n'}
            • Please do the necessary with care.
=======
            • Book in advance for guaranteed spots{'\n'}
            • Check traffic conditions before leaving{'\n'}
            • Arrive 5 minutes before your booking time{'\n'}
            • Keep your booking confirmation handy{'\n'}
            • Report any issues immediately{'\n'}
            • Enjoy stress-free parking with ParkBest!
>>>>>>> a3f9763c8e19fd136d65e0cc4472b038d37daf6c
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  mainBookingButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  bookingButtonText: {
    flex: 1,
    marginLeft: 16,
  },
  bookingButtonTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingButtonSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },

  // My Account Section
  accountSection: {
    marginBottom: 32,
  },
  accountGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  accountDescription: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  
  // Enhanced Services
  servicesSection: {
    marginBottom: 32,
  },
  servicesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  
  // Professional Tips Section
  tipsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
  },
});