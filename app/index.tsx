import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const Index: React.FC = () => {
  const router = useRouter();

  // This function checks if the user is authenticated by looking for a token in AsyncStorage
  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const token = await AsyncStorage.getItem('token');
      console.log('Token found:', token);

      if (token) {
        router.replace('/home');  // Redirect to HomeScreen if authenticated
      } else {
        router.replace('/instructions');  // Redirect to LoginScreen if not authenticated
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };

  // useEffect to call the checkAuth function once when the component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Checking Authentication...</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default Index;
