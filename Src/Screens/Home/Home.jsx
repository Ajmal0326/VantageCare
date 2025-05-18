import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';



import { AuthContext } from '../../Contexts/AuthContext';


const Home = () => {

      const { setIsLoggedIn } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#6a51ae"
      />
      <View style={{flex:1}}>
      <View style={styles.HeaderCtn}>
        <AntDesign name="home" size={24} color="black" />
        <Text style={styles.Heading}>VantageCare</Text>
        <TouchableOpacity onPress={()=> setIsLoggedIn(false)}>
          <Text style={styles.logoutTxt}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View>
        <View style={styles.subctn}>
         <Text style={styles.Heading}>Welcome</Text>
          <Text style={[styles.Heading,{marginLeft:wp(4)}]}>Alex</Text>
        </View>
         <View style={styles.subctn}>
         <Text style={styles.Heading}>Role:</Text>
          <Text style={[styles.Heading,{marginLeft:wp(4)}]}>Care Staff</Text>
        </View>
      </View>

       <View style={{alignSelf:'center',marginTop:hp(10)}}>
        <View style={styles.subctn}>
        <FontAwesome6 name="sheet-plastic" size={24} color="black" />
          <Text style={[styles.Heading,{marginLeft:wp(4),fontSize: 24, fontWeight: '700',}]}>TimeSheet</Text>
        </View>
         <View style={styles.subctn}>
          <MaterialIcons name="filter-tilt-shift" size={24} color="black" />
          <Text style={[styles.Heading,{marginLeft:wp(4),fontSize: 24, fontWeight: '700',}]}>My Shift</Text>
        </View>
      </View>
      </View>

      
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#A278FF',
    flex: 1,
  },
  HeaderCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-evenly',
    width:wp(100),
  },
  Heading: {
    fontSize: 26,
    fontWeight: '800',
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
  subctn:{
    flexDirection:'row',
    alignItems:'center',
    width:wp(90),
    paddingHorizontal:wp(5)
  }
})