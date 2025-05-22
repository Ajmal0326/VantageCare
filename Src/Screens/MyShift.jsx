import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Platform, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../Contexts/AuthContext';
import auth from '@react-native-firebase/auth';

const primarycolor = '#1479FF';
const MyShift = () => {
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
            <View style={{ paddingHorizontal: wp(5),flex:1,marginTop:hp(5) }}>
                <Text style={styles.title}>My Shift</Text>

                <View style={styles.dateRangeContainer}>
                    <TouchableOpacity>
                        <Icon name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.dateRangeText}>12 May 2025 - 18 May 2025</Text>
                    <TouchableOpacity>
                        <Icon name="chevron-right" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>


                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Date</Text>
                    <Text style={styles.tableHeaderText}>Shift time</Text>
                    <Text style={styles.tableHeaderText}>Role</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={styles.tableRowText}>12 May</Text>
                    <Text style={styles.tableRowText}>7:00 am</Text>
                    <Text style={styles.tableRowText}>Care Staff</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={styles.tableRowText}>14 May</Text>
                    <Text style={styles.tableRowText}>9:30am</Text>
                    <Text style={styles.tableRowText}>Care Staff</Text>
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
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'white',
        flex: 1,
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: hp(2),
        color: '#000',
    }, HeaderCtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: wp(100),
        height: hp(6),
        backgroundColor: '#1479FF'
    },
    textbtn: {
        fontSize: 20,
        fontWeight: '400',
        fontFamily: 'sans-serif',
        color: '#1479FF'
    },
    Heading: {
        fontSize: 26,
        fontWeight: '600',
        marginVertical: hp('2%'),
        fontFamily: 'sans-serif',
        color: 'white'
    },text: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'sans-serif',
    color: 'white'
  },
    dateRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1479FF',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderRadius: 5,
        marginBottom: hp(2),
    },
    dateRangeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1479FF',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    tableHeaderText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        width: wp(22),
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1479FF',
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
        marginBottom: 1,
    },
    tableRowText: {
        color: '#fff',
        fontSize: 14,
        width: wp(22),
    },
    totalHours: {
        marginTop: hp(2),
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
     primaryBtn: {
    width: wp(55),
    backgroundColor: "#1479FF",
    height: hp(5),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: hp(1.5),
  }
});

export default MyShift