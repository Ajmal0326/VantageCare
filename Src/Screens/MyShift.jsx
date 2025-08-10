import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Platform, Alert, ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../Contexts/AuthContext';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { UserContext } from '../Contexts/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const primarycolor = '#1479FF';

const MyShift = () => {
    const insets = useSafeAreaInsets();
  const { setIsLoggedIn } = useContext(AuthContext);
  const {userID} = useContext(UserContext);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  console.log("user id is >>>>>>>>>>>>>>>>>>>>>>",userID)

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const docRef = firestore().collection("UsersDetail").doc(userID);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const data = docSnap.data();
          const fetchedShifts = data.shifts || [];

          const sortedShifts = fetchedShifts.sort(
            (a, b) => new Date(a.shiftDate) - new Date(b.shiftDate)
          );

          setShifts(sortedShifts);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [userID]);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#6a51ae" />
      <View style={styles.HeaderCtn}>
        <AntDesign name="home" size={24} color="white" />
        <Text style={[styles.Heading, { marginVertical: 0, marginLeft: wp(10) }]}>
          VantageCare
        </Text>
      </View>

      <View style={{ paddingHorizontal: wp(5), flex: 1, marginTop: hp(5) }}>
        <Text style={styles.title}>My Shift</Text>

        {loading ? (
          <ActivityIndicator size="large" color={primarycolor} style={{ marginTop: hp(10) }} />
        ) : shifts.length > 0 ? (
          <>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity>
                <Icon name="chevron-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.dateRangeText}>
                {formatDate(shifts[0].shiftDate)} - {formatDate(shifts[shifts.length - 1].shiftDate)}
              </Text>
              <TouchableOpacity>
                <Icon name="chevron-right" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Date</Text>
              <Text style={styles.tableHeaderText}>Shift time</Text>
              <Text style={styles.tableHeaderText}>Role</Text>
            </View>

            <ScrollView>
              {shifts.map((shift, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableRowText}>
                    {new Date(shift.shiftDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </Text>
                  <Text style={styles.tableRowText}>{shift.shiftStartTime}</Text>
                  <Text style={styles.tableRowText}>{shift.shiftRole}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <Text style={{ textAlign: "center", marginTop: hp(5), fontSize: 16 }}>
            No shifts available
          </Text>
        )}
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: hp(2),
    color: '#000',
  },
  HeaderCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(100),
    height: hp(6),
    backgroundColor: '#1479FF',
  },
  textbtn: {
    fontSize: 20,
    fontWeight: '400',
    fontFamily: 'sans-serif',
    color: '#1479FF',
  },
  Heading: {
    fontSize: 26,
    fontWeight: '600',
    marginVertical: hp('2%'),
    fontFamily: 'sans-serif',
    color: 'white',
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
});

export default MyShift;
