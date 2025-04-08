import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const Login = () => {
    const [Username, onChangeUserName] = React.useState('');
    const [password, onChangepassword] = React.useState('');
  return (
    <SafeAreaView style={styles.mainContainer}>
        <StatusBar
         barStyle="dark-content"
        backgroundColor="#6a51ae" 
      />
     <View style={styles.subCtn}>
     <Text style={styles.headingTxt}>Vantage Care</Text>
     
     <View style={{height:hp('40%'),justifyContent:'center'}}>

     <TextInput
          style={styles.input}
          onChangeText={onChangeUserName}
          value={Username}
          placeholder="Username"
        />
         <TextInput
          style={styles.input}
          onChangeText={onChangepassword}
          value={password}
          placeholder="Password"
        />
         <TouchableOpacity style={styles.forgetbutton} >
      <Text style={styles.forgettext}>Forgot Password?</Text>
    </TouchableOpacity>
     </View>
    
     <TouchableOpacity style={styles.button} >
      <Text style={styles.text}>Sign In</Text>
    </TouchableOpacity>

     </View>
    </SafeAreaView>
  )
}

export default Login

const styles = StyleSheet.create({
    mainContainer:{
        backgroundColor:'white',
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    subCtn:{
       height:hp('80%'),
       width:wp('90%'),
        alignItems:'center',
        backgroundColor:'#E9EAEC',
        borderRadius:25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headingTxt:{
        fontSize:26,
        fontWeight:'800',
        marginVertical:hp('10%'),
    },
    input: {
        height: hp('6%'),
        width:wp('80%'),
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius:25,
      },
      button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: wp('20%'),
        borderRadius: 10,
        elevation: 3,
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
        marginLeft:'auto'
      },
      forgettext: {
        color: '#007bff', 
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline', 
      },
})