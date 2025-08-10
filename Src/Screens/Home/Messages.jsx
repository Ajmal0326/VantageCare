import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator,SafeAreaView, StatusBar } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { UserContext } from '../../Contexts/UserContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';

const Messages = () => {
  const { userID } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
 const insets = useSafeAreaInsets();
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const doc = await firestore()
          .collection('UsersDetail')
          .doc(userID)
          .get();

        if (doc.exists) {
          const data = doc.data();
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          } else {
            setMessages([]);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userID]);



  if (messages.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noMsg}>No messages yet</Text>
      </View>
    );
  }

  return (
     <SafeAreaView style={[styles.mainContainer, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#6a51ae" />
          <View style={styles.HeaderCtn}>
            <AntDesign name="home" size={24} color="white" />
            <Text style={[styles.Heading, { marginVertical: 0, marginLeft: wp(10) }]}>VantageCare</Text>
          </View>

     {loading ?  <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View> 
      : <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageCard}>
            <Text style={styles.from}>From: {item.from}</Text>
            <Text style={styles.text}>{item.text}</Text>
            <Text style={styles.time}>
              {new Date(item.sentAt).toLocaleString()}
            </Text>
          </View>
        )}
      />}
    </SafeAreaView>
  );
};

export default Messages;

const styles = StyleSheet.create({
   mainContainer: {
    backgroundColor: 'white',
    flex: 1,
    
  },
  HeaderCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(100),
    height: hp(6),
    backgroundColor: '#1479FF'
  },
  container: {
    flex: 1,
    padding: wp('4%'),
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMsg: {
    fontSize: wp('4%'),
    color: '#666',
  },
  Heading: {
    fontSize: 26,
    fontWeight: '600',
    marginVertical: hp('2%'),
    fontFamily: 'sans-serif',
    color: 'white'
  },
  TextHeading: {
    fontSize: 26,
    fontWeight: '600',
    marginVertical: hp('2%'),
    fontFamily: 'sans-serif',
    color: 'black'
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    borderRadius: wp('3%'),
    elevation: 2,
  },
  from: {
    fontWeight: 'bold',
    fontSize: wp('4.5%'),
  },
  text: {
    marginVertical: hp('0.5%'),
    fontSize: wp('4%'),
  },
  time: {
    fontSize: wp('3%'),
    color: '#888',
    marginTop: hp('0.5%'),
  },
});
