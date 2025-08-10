import { View, Text, StatusBar, Platform, SafeAreaView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../Contexts/UserContext';
import auth from '@react-native-firebase/auth';
import { AuthContext } from '../Contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const primarycolor = '#1479FF';

const MyProfile = () => {
    const insets = useSafeAreaInsets();
  const { userName, userRole, userID } = useContext(UserContext); 
  const { setIsLoggedIn } = useContext(AuthContext);
  const [upcomingShift, setUpcomingShift] = useState(null);
  const [loading, setLoading] = useState(true); // Loader state

  async function logoutUser() {
    try {
      await auth().signOut();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const docRef = firestore().collection("UsersDetail").doc(userID);
        const docSnap = await docRef.get();
         
        if (docSnap.exists) {
          const data = docSnap.data();
          const shifts = data.shifts || [];

          const sortedShifts = shifts.sort(
            (a, b) => new Date(a.shiftDate) - new Date(b.shiftDate)
          );

          const today = new Date();
          const upcoming = sortedShifts.filter(
            s => new Date(s.shiftDate) >= new Date(today.setHours(0, 0, 0, 0))
          );

          setUpcomingShift(upcoming.length > 0 ? upcoming[0] : null);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
      } finally {
        setLoading(false); // Hide loader when done
      }
    };

    fetchShifts();
  }, [userID]);

  const formatShiftDate = (dateString) => {
    const dateObj = new Date(dateString);
    const today = new Date();
    if (dateObj.toDateString() === today.toDateString()) {
      return "Today";
    }
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <SafeAreaView style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#6a51ae" />
      <View style={styles.HeaderCtn}>
        <AntDesign name="home" size={24} color="white" />
        <Text style={[styles.Heading, { marginVertical: 0, marginLeft: wp(10) }]}>VantageCare</Text>
      </View>

      <View style={{ flex: 1, marginTop: hp(10) }}>
        <View style={{ alignItems: 'center', justifyContent: "center", alignSelf: 'center', marginBottom: hp(10) }}>
          <View style={styles.subctn}>
            <Feather name="users" size={24} color="black" />
            <Text style={[styles.TextHeading, { marginLeft: wp(3) }]}>Welcome</Text>
            <Text style={[styles.TextHeading, { marginLeft: wp(4) }]}>{userName}</Text>
          </View>
          <View style={[styles.subctn, { marginLeft: wp(15) }]}>
            <Text style={styles.TextHeading}>Role:</Text>
            <Text style={[styles.TextHeading, { marginLeft: wp(4) }]}>{userRole}</Text>
          </View>
        </View>

        <View style={[styles.primaryBtn, { height: upcomingShift ? hp(30) : hp(20) }]}>
          <Entypo name="spreadsheet" size={60} color="black" />

          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : upcomingShift ? (
            <>
              <Text style={styles.text}>Upcoming shift:</Text>
              <Text style={styles.text}>Date: {formatShiftDate(upcomingShift.shiftDate)}</Text>
              <Text style={styles.text}>Time: {upcomingShift.shiftStartTime}</Text>
              <Text style={styles.text}>Role: {upcomingShift.shiftRole}</Text>
            </>
          ) : (
            <Text style={styles.text}>No upcoming shift</Text>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: hp(5), justifyContent: 'space-around', marginTop: 'auto' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.textbtn, { marginRight: hp(1) }]}>Messages</Text>
          <Feather name="bell" size={22} color={primarycolor} />
        </View>
        <TouchableOpacity onPress={logoutUser} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.textbtn, { marginRight: hp(1) }]}>LogOut</Text>
          <MaterialIcons name="logout" size={22} color={primarycolor} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    
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
  TextHeading: {
    fontSize: 26,
    fontWeight: '600',
    marginVertical: hp('2%'),
    fontFamily: 'sans-serif',
    color: 'black'
  },
  subctn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(90),
    paddingHorizontal: wp(5),
  },
  primaryBtn: {
    width: wp(60),
    backgroundColor: "#1479FF",
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  }
});

export default MyProfile;
