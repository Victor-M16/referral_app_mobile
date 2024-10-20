// app/instructions.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const InstructionsScreen: React.FC = () => {




  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usage Instructions</Text>
      <Text style={styles.textStyling}>1. Login to access the app.</Text>
      <Text style={styles.textStyling}>2. After logging in, you can view hospitals, patient, referrals and related info.</Text>
      <Text style={styles.textStyling}>3. Click on a patient to view more details.</Text>
      <Text style={styles.textStyling}>4. Use the logout button to exit.</Text>

      {/* <Link style={styles.buttonLink} href="/register">Register</Link> */}
      <Link style={styles.buttonLink} href="/login">Login</Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#15242c', // Dark bluish-black color
    
  },
  textStyling: {
    color: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFF'
  },
  buttonLink: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 10, // Add vertical padding for height
    paddingHorizontal: 20, // Add horizontal padding for width
    backgroundColor: '#c0c000', // Gold color
    color: '#FFFFFF', // Text color
    borderRadius: 5, // Rounded corners
    textAlign: 'center', // Center text
    elevation: 2, // For Android shadow effect
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.1, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow blur radius for iOS
},

});

export default InstructionsScreen;
