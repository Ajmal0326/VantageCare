import PushNotification from 'react-native-push-notification';

export const configurePushNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log("LOCAL NOTIFICATION ==>", notification);
    },
    popInitialNotification: true,
    requestPermissions: true,
  });

  PushNotification.createChannel(
    {
      channelId: "default-channel-id", // Must match with FCM
      channelName: "Default Channel",
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );
};
