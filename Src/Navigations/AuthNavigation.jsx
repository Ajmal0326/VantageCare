import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Screens/Login';

const Auth = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
   <Auth.Navigator>
      <Auth.Screen name="Login" component={Login}  options={{ headerShown: false }}/>
    </Auth.Navigator>
  )
}

export default AuthNavigation