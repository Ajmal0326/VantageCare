import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../../Contexts/AuthContext';
import auth from '@react-native-firebase/auth';

const primarycolor = '#1479FF';
const Certificates = () => {

   const { setIsLoggedIn } = useContext(AuthContext);

  async function logoutUser() {
  try {
    await auth().signOut();
    setIsLoggedIn(false); 
     Alert.alert("Logout Successful", "You have been signed out.");
  } catch (error) {
    console.error("Logout error:", error);
    Alert.alert("Logout Failed", "An error occurred during logout.");
  }
}
  return (
   <SafeAreaView style={styles.mainContainer}>
         <StatusBar
           barStyle="dark-content"
           backgroundColor="#6a51ae"
         />
         <View style={styles.HeaderCtn}>
           <AntDesign name="home" size={24} color="white" />
           <Text style={[styles.Heading, { marginVertical: 0, marginLeft: wp(10) }]}>VantageCare</Text>

         </View>
     <View style={{paddingHorizontal:wp(5),marginTop:hp(5)}}>
      <Text style={styles.heading}>Upload your certifications</Text>
      <Text style={styles.subHeading}>Accepted format: PDF, JPEG, PNG, Max size: 5MB</Text>

      
      <View style={styles.uploadBox}>
        <Icon name="cloud-upload-outline" size={40} color="#000" style={styles.uploadIcon} />
        <Text style={styles.uploadText}>Drop files here or click to upload</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Certificate</Text>
        </TouchableOpacity>
      </View>

    
      <View style={styles.infoBanner}>
        <Icon name="notifications-outline" size={20} color="#fff" />
        <Text style={styles.infoText}>Ensure certifications are up to date before your next shift.</Text>
      </View>

    
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Certificate Name</Text>
        <Text style={styles.tableHeaderText}>Status</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableRowText}>First Aid Certificate</Text>
        <Text style={styles.tableRowText}>Pending</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableRowText}>Police Check</Text>
        <Text style={styles.tableRowText}>Active</Text>
      </View>
      </View>

       <View style={{ flexDirection: 'row', marginBottom: hp(5), justifyContent: 'space-around', marginTop: 'auto' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.textbtn, { marginRight: hp(1) }]}>Messages</Text>
                <Feather name="bell" size={22} color={primarycolor} />
              </View>
              <TouchableOpacity onPress={()=> logoutUser()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.textbtn, { marginRight: hp(1) }]}>LogOut</Text>
                <MaterialIcons name="logout" size={22} color={primarycolor} />
              </TouchableOpacity>
            </View>

    </SafeAreaView>
  );
};

export default Certificates;

const styles = StyleSheet.create({
 
  mainContainer: {
          backgroundColor: 'white',
          flex: 1,
          marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
      },
      textbtn: {
    fontSize: 20,
    fontWeight: '400',
    fontFamily: 'sans-serif',
    color: '#1479FF'
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },

   Heading: {
      fontSize: 26,
      fontWeight: '600',
      marginVertical: hp('2%'),
      fontFamily: 'sans-serif',
      color: 'white'
    },
  subHeading: {
    fontSize: 14,
    marginBottom: 16,
    color: '#333',
  },
  uploadBox: {
    backgroundColor: '#1479FF',
    padding: 20,
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 20,
  },
  uploadIcon: {
    marginBottom: 10,
  },
  uploadText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#2D8BFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  infoBanner: {
    backgroundColor: '#1479FF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
  },
  infoText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    paddingHorizontal:wp(2)
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1479FF',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    width: '50%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1479FF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ffffff20',
  },
  tableRowText: {
    color: '#fff',
    fontSize: 14,
    width: '50%',
  },
     HeaderCtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: wp(100),
        height: hp(6),
        backgroundColor: '#1479FF'
    },
});
