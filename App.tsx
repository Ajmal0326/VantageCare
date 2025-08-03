import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Login from './Src/Screens/Login';
import {NavigationContainer} from '@react-navigation/native';
import AuthNavigation from './Src/Navigations/AuthNavigation';
import {useContext} from 'react';
import {AuthProvider, AuthContext} from './Src/Contexts/AuthContext';
import {UserProvider} from './Src/Contexts/UserContext';
import BottomTab from './Src/Navigations/BottomTab';
import {Home, MainNavigation, MyProfile} from './Src/Screens/ScreenLists';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

function App(): React.JSX.Element {
  

  const notificationListener = () => {
    // App opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background:',
        remoteMessage.notification,
      );
    });

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'App opened from quit state:',
            remoteMessage.notification,
          );
        }
      });
  };

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground FCM:', remoteMessage);

      if (remoteMessage.notification) {
        const {title, body} = remoteMessage.notification;

        await notifee.displayNotification({
          title: title,
          body: body,
          android: {
            channelId: 'default',
            pressAction: {
              id: 'default',
            },
          },
        });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
   
    notificationListener();
  }, []);

  const AppNavigator = () => {
    const {isLoggedIn} = useContext(AuthContext);
    return isLoggedIn ? <MainNavigation /> : <AuthNavigation />;
  };

  return (
    <AuthProvider>
      <UserProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </UserProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
