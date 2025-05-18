import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Certificates, Home, Messages } from '../Screens/ScreenLists';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();


const BottomTab = () => {
  return (
   <Tab.Navigator
    screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
      let iconName;

      if (route.name === 'DashBoard') {
        iconName = 'home';
      } else if (route.name === 'Certificates') {
        iconName = 'user';
      } else if (route.name === 'Messages') {
        iconName = 'message1';
      }

      return <AntDesign name={iconName} size={size} color={color} />;
    },
        tabBarStyle: {
          height: hp(10),
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#ffffff',
          position: 'absolute',
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray', 
     })}
    >
     <Tab.Screen name="DashBoard" component={Home}  />
    <Tab.Screen name="Certificates" component={Certificates}/>
    <Tab.Screen name="Messages" component={Messages} />
    

    
      </Tab.Navigator>
  )
}

export default BottomTab