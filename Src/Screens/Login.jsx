import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../Contexts/AuthContext';
import {UserContext} from '../Contexts/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Modular RNFirebase
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import {
  getMessaging,
  requestPermission,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  getToken,
} from '@react-native-firebase/messaging';

const auth = getAuth();
const db = getFirestore();
const msg = getMessaging();

const Login = () => {
  const navigation = useNavigation();
  const [UserId, onChangeUserId] = useState('');
  const [password, onChangepassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {setIsLoggedIn} = useContext(AuthContext);
  const {setUserName, setUserRole, setUserID} = useContext(UserContext);

  const [fcmtoken, setfcmtoken] = useState(null);

  const [hidePass, setHidePass] = useState(true);
  const toggleHide = useCallback(() => setHidePass(p => !p), []);

  // Notifications permission + FCM token
  const requestUserPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied');
        }
      }

      await requestPermission(msg);

      const registered = await isDeviceRegisteredForRemoteMessages(msg);
      if (!registered) await registerDeviceForRemoteMessages(msg);

      const token = await getToken(msg);
      if (token) {
        setfcmtoken(token);
        console.log('FCM Token:', token);
      }
    } catch (e) {
      console.log('Notification setup error:', e);
    }
  };

  async function loginWithUserID(userID, pwd) {
    try {
      setIsLoading(true);

      const userRef = doc(db, 'UsersDetail', userID);
      const snap = await getDoc(userRef);
      if (!snap.exists) {
        Alert.alert('User ID not found');
        return;
      }

      const data = snap.data() || {};
      const email = data.email;
      const role = data.role;
      const name = data.name;

      if (!email) {
        Alert.alert('User record has no email configured.');
        return;
      }

      await signInWithEmailAndPassword(auth, email, pwd);

      // Only update fcmToken if we actually have one (avoid undefined)
      if (fcmtoken) {
        await updateDoc(userRef, {
          fcmToken: fcmtoken,
          lastLoginAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
      }

      setUserName(name || '');
      setUserRole(role || '');
      setUserID(userID);

      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
      const code = error && error.code;
      if (code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'The email address is badly formatted.');
      } else if (code === 'auth/user-not-found') {
        Alert.alert('User Not Found', 'No user found with this email.');
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        Alert.alert('Wrong Password', 'The password is incorrect.');
      } else {
        Alert.alert('Login error', (error && error.message) || 'Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleForgotPassword = async userID => {
    try {
      setIsLoading(true);
      const userRef = doc(db, 'UsersDetail', userID);
      const snap = await getDoc(userRef);
      if (!snap.exists) {
        Alert.alert('User ID not found. Enter correct User ID to reset password.');
        return;
      }
      const data = snap.data() || {};
      const email = data.email;
      if (!email) {
        Alert.alert('No email found for this User ID.');
        return;
      }
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Email Sent', 'Password reset link has been sent to your email.');
    } catch (error) {
      const code = error && error.code;
      if (code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (code === 'auth/user-not-found') {
        Alert.alert('User Not Found', 'No account exists with this email.');
      } else {
        Alert.alert('Error', (error && error.message) || 'Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestUserPermission();
  }, []);

  const Loader = ({visible}) => (
    <Modal transparent animationType="none" visible={visible} onRequestClose={() => {}}>
      <View style={styles.modalBackground}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#6a51ae" />
      <Text style={styles.headingTxt}>Vantage Care</Text>

      <View style={{height: hp('40%'), justifyContent: 'center'}}>
        <TextInput
          style={styles.input}
          onChangeText={onChangeUserId}
          value={UserId}
          placeholder="Username"
          placeholderTextColor="black"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        {/* Password with eye/eye-off toggle */}
        <View style={{position: 'relative', justifyContent: 'center'}}>
          <TextInput
            style={[styles.input, {paddingRight: 44}]}
            onChangeText={onChangepassword}
            value={password}
            placeholder="Password"
            placeholderTextColor="black"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={hidePass}
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={() => {
              if (UserId && password) loginWithUserID(UserId, password);
            }}
          />
          <TouchableOpacity
            onPress={toggleHide}
            accessibilityLabel={hidePass ? 'Show password' : 'Hide password'}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            style={{position: 'absolute', right: 25, height: '100%', justifyContent: 'center'}}
          >
            <Icon name={hidePass ? 'eye-off' : 'eye'} size={22} color="#333" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (UserId) handleForgotPassword(UserId);
            else Alert.alert('Enter your UserID to reset Password');
          }}
          style={styles.forgetbutton}>
          <Text style={styles.forgettext}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => {
          if (UserId && password) {
            loginWithUserID(UserId, password);
          } else {
            Alert.alert('User ID and Password both are required to login.');
          }
        }}
        style={styles.button}>
        <Text style={styles.text}>Sign In</Text>
      </TouchableOpacity>

      <Loader visible={isLoading} />
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subCtn: {
    height: hp('80%'),
    width: wp('90%'),
    alignItems: 'center',
    backgroundColor: '#E9EAEC',
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headingTxt: {
    fontSize: 26,
    fontWeight: '800',
    marginVertical: hp('10%'),
    fontFamily: 'sans-serif',
  },
  input: {
    height: hp('5%'),
    width: wp('70%'),
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    backgroundColor: '#A9A9A9',
    paddingVertical: 12,
    paddingHorizontal: wp('20%'),
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
  forgetbutton: {
    marginTop: 15,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  forgettext: {
    color: '#0000FF',
    fontSize: 16,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 10,
  },
});
