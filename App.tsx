import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Login from './Src/Screens/Login';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigation from './Src/Navigations/AuthNavigation';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './Src/Contexts/AuthContext';
import {UserProvider} from './Src/Contexts/UserContext';
import BottomTab from './Src/Navigations/BottomTab';
import { Home, MainNavigation, MyProfile } from './Src/Screens/ScreenLists';




function App(): React.JSX.Element {

const AppNavigator = () => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? <MainNavigation/> : <AuthNavigation />;
};

  return (
     <AuthProvider>
       <UserProvider>
    <NavigationContainer>
      <AppNavigator/>
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
