import { View, Text, StatusBar, Platform, SafeAreaView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../Contexts/UserContext';
import auth from '@react-native-firebase/auth';
import { AuthContext } from '../Contexts/AuthContext';

const primarycolor = '#1479FF';
const MyProfile = () => {
    const { userName, userRole } = useContext(UserContext);
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

            <View style={{
                flex: 1, marginTop: hp(10)
            }}>
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

                <View style={styles.primaryBtn}>
                    <Entypo name="spreadsheet" size={60} color="black" />
                    <Text style={styles.text}>No Upcoming Shift: 0</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: hp(5), justifyContent: 'space-around' ,marginTop:'auto'}}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.textbtn,{marginRight:hp(1)}]}>Messages</Text>
                    <Feather name="bell" size={22} color={primarycolor} />
                </View>
                <TouchableOpacity onPress={()=>logoutUser()} style={{ flexDirection: 'row', alignItems: 'center' }}>

                    <Text style={[styles.textbtn,{marginRight:hp(1)}]}>LogOut</Text>
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
        height: hp(20),
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        justifyContent: 'space-evenly'
    }

})

export default MyProfile

