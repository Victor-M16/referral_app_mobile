// app/login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, StyleSheet} from 'react-native';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://referralapp-production.up.railway.app/api/token/', {
        username,
        password,
      });

      const { access } = response.data;
      await AsyncStorage.setItem('token', access);

      router.push('/home'); // Navigate to Home screen after login
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#FFFFFF" 
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#FFFFFF" 
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.buttonLink} onPress={handleLogin}>
                <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#15242c', // Dark bluish-black color
      },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 10,
    color: '#fff'
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  buttonLink: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#c0c000', // Gold color
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    },
    buttonText: {
        color: '#FFFFFF', // White text color for contrast
        textAlign: 'center', // Center the text
        fontWeight: 'bold'
    },
});

export default LoginScreen;
