import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../Constants';
import { Certificates, Home, Messages, MyProfile, MyShift, TimeSheet } from '../Screens/ScreenLists';

const HomeStack = createNativeStackNavigator();

const MainNavigation = () => {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name={ROUTES.Home} component={Home} options={{ headerShown: false }} />
            <HomeStack.Screen name={ROUTES.MYPROFILE} component={MyProfile} options={{ headerShown: false }} />
            <HomeStack.Screen name={ROUTES.TIMESHEET} component={TimeSheet} options={{ headerShown: false }} />
                        <HomeStack.Screen name={ROUTES.MESSAGES} component={Messages} options={{ headerShown: false }} />

            <HomeStack.Screen name={ROUTES.MYSHIFT} component={MyShift} options={{ headerShown: false }} />
            <HomeStack.Screen name={ROUTES.CERTIFICATES} component={Certificates} options={{ headerShown: false }} />
        </HomeStack.Navigator>
    )
}

export default MainNavigation