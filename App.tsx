import React, {useEffect, useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider, AuthContext} from './Src/Contexts/AuthContext';
import {UserProvider} from './Src/Contexts/UserContext';
import {AuthNavigation, MainNavigation} from './Src/Screens/ScreenLists';
import {getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification, isDeviceRegisteredForRemoteMessages, registerDeviceForRemoteMessages} from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

function App() {
  // Create Android channel once (before displaying notifications)
  useEffect(() => {
    (async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: 3, // Importance.HIGH
      });
    })();
  }, []);

  // Foreground FCM
  useEffect(() => {
    const msg = getMessaging();

    // Ensure device is registered (mainly iOS or if you disabled auto-register)
    (async () => {
      const registered = await isDeviceRegisteredForRemoteMessages(msg);
      if (!registered) {
        await registerDeviceForRemoteMessages(msg);
      }
    })();

    const unsubscribe = onMessage(msg, async remoteMessage => {
      const {title, body} = remoteMessage.notification ?? {};
      if (title || body) {
        await notifee.displayNotification({
          title: title ?? 'Notification',
          body: body ?? '',
          android: { channelId: 'default', pressAction: { id: 'default' } },
        });
      }
    });

    return unsubscribe;
  }, []);

  // Background-opened / quit-opened handlers
  useEffect(() => {
    const msg = getMessaging();

    const unsubOpen = onNotificationOpenedApp(msg, remoteMessage => {
      console.log('Notification opened app from background:', remoteMessage?.notification);
    });

    (async () => {
      const rm = await getInitialNotification(msg);
      if (rm) {
        console.log('App opened from quit state:', rm.notification);
      }
    })();

    return unsubOpen;
  }, []);

  const AppNavigator = () => {
    const {isLoggedIn} = useContext(AuthContext);
    return isLoggedIn ? <MainNavigation /> : <AuthNavigation/>;
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

export default App;
