import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, StatusBar, Alert, Modal, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


const Login = () => {
  const [UserId, onChangeUserId] = React.useState('');
  const [password, onChangepassword] = React.useState('');
  const [isLoading,setIsLoading] = useState(false);
  
  async function loginWithUserID(userID, password) {
    try {
      setIsLoading(true);
      const doc = await firestore().collection('UsersDetail').doc(userID).get();
      console.log("doc is :", doc);
      if (!doc.exists) {
        Alert.alert("User ID not found");
        return;
      }

      const email = doc.data().email;
      const role = doc.data().role;

      await auth().signInWithEmailAndPassword(email, password);
      setIsLoading(false);
      Alert.alert("Logged in Successfully...",
        `Your role is: ${role}`,);
        
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'The email address is badly formatted.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('User Not Found', 'No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Wrong Password', 'The password is incorrect.');
      }
      else if (error.code === 'auth/invalid-credential') {
        Alert.alert('Wrong Password', 'The password is incorrect.');
      }
    }
  }

const handleForgotPassword = async (userID) => {

  try {
    setIsLoading(true);
      const doc = await firestore().collection('UsersDetail').doc(userID).get();
      if (!doc.exists) {
        Alert.alert("User ID not found Enter Correct User Id to Reset Password.");
        return;
      }

      const email = doc.data().email;
    await auth().sendPasswordResetEmail(email);
    setIsLoading(false);
    Alert.alert(
      'Email Sent',
      'Password reset link has been sent to your email.'
    );
  } catch (error) {
    setIsLoading(false);
    if (error.code === 'auth/invalid-email') {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    } else if (error.code === 'auth/user-not-found') {
      Alert.alert('User Not Found', 'No account exists with this email.');
    } else {
      Alert.alert('Error', error.message);
    }
  }
};


  
const Loader = ({ visible }) => {
  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackground}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      </View>
    </Modal>
  );
};

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#6a51ae"
      />
      {/* <View style={styles.subCtn}> */}
      <Text style={styles.headingTxt}>Vantage Care</Text>

      <View style={{ height: hp('40%'), justifyContent: 'center' }}>

        <TextInput
          style={styles.input}
          onChangeText={onChangeUserId}
          value={UserId}
          placeholder="UserID"
          placeholderTextColor={"black"}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangepassword}
          value={password}
          placeholder="Password"
          placeholderTextColor={"black"}
        />
        <TouchableOpacity 
        onPress={()=>{
          if(UserId)
          {handleForgotPassword(UserId)}
        else{
          Alert.alert("Enter your UserID to reset Password")
        }
        }}
        style={styles.forgetbutton} >
          <Text style={styles.forgettext}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => loginWithUserID(UserId, password)}
        style={styles.button} >
        <Text style={styles.text}>Sign In</Text>
      </TouchableOpacity>

      {/* </View> */}
       <Loader visible={isLoading}/>
    </SafeAreaView>
  )
}

export default Login

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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgetbutton: {
    marginTop: 15,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 'auto'
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
})