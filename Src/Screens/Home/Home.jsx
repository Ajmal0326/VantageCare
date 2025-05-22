import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Platform } from 'react-native'
import React, { useContext } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from '../../Contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../Constants';
import auth from '@react-native-firebase/auth';

const primarycolor = '#1479FF';
const Home = () => {
  const navigation = useNavigation();
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
        {/* <TouchableOpacity onPress={() => setIsLoggedIn(false)}>
            <Text style={styles.logoutTxt}>Logout</Text>
          </TouchableOpacity> */}
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>

        {/* <View>
          <View style={styles.subctn}>
            <Text style={styles.Heading}>Welcome</Text>
            <Text style={[styles.Heading, { marginLeft: wp(4) }]}>Alex</Text>
          </View>
          <View style={styles.subctn}>
            <Text style={styles.Heading}>Role:</Text>
            <Text style={[styles.Heading, { marginLeft: wp(4) }]}>Care Staff</Text>
          </View>
        </View> */}

        {/* <View style={{ alignSelf: 'center', marginTop: hp(10) }}>
          <View style={styles.subctn}>
            <FontAwesome6 name="sheet-plastic" size={24} color="black" />
            <Text style={[styles.Heading, { marginLeft: wp(4), fontSize: 24, fontWeight: '700', }]}>TimeSheet</Text>
          </View>
          <View style={styles.subctn}>
            <MaterialIcons name="filter-tilt-shift" size={24} color="black" />
            <Text style={[styles.Heading, { marginLeft: wp(4), fontSize: 24, fontWeight: '700', }]}>My Shift</Text>
          </View>
        </View> */}

        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MYPROFILE)} style={styles.primaryBtn}>
          <AntDesign name="user" size={24} color="white" />
          <Text style={styles.text}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MYSHIFT)}  style={styles.primaryBtn}>
          <AntDesign name="filetext1" size={24} color="white" />
          <Text style={styles.text}>My Shift</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.TIMESHEET)} style={styles.primaryBtn}>
          <AntDesign name="profile" size={24} color="white" />
          <Text style={styles.text}>Timesheet</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.CERTIFICATES)} style={styles.primaryBtn}>
          <AntDesign name="user" size={24} color="white" />
          <Text style={styles.text}>Certificates</Text>
        </TouchableOpacity>




      </View>

      <View style={{ flexDirection: 'row', marginBottom: hp(5), justifyContent: 'space-around', marginTop: 'auto' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.textbtn, { marginRight: hp(1) }]}>Messages</Text>
          <Feather name="bell" size={22} color={primarycolor} />
        </View>
        <TouchableOpacity onPress={()=>logoutUser()} style={{ flexDirection: 'row', alignItems: 'center' }}>

          <Text style={[styles.textbtn, { marginRight: hp(1) }]}>LogOut</Text>
          <MaterialIcons name="logout" size={22} color={primarycolor} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  HeaderCtn: {
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
  text: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'sans-serif',
    color: 'white'
  },
  Heading: {
    fontSize: 26,
    fontWeight: '600',
    marginVertical: hp('2%'),
    fontFamily: 'sans-serif',
    color: 'white'
  },
  logoutTxt: {
    fontSize: 18,
    fontWeight: '400',
    marginVertical: hp('10%'),
    fontFamily: 'sans-serif',
    color: 'blue'
  },
  subctn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(90),
    paddingHorizontal: wp(5)
  },
  primaryBtn: {
    width: wp(80),
    backgroundColor: "#1479FF",
    height: hp(6),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: wp(20),
    marginVertical: hp(1.5),
  }
})