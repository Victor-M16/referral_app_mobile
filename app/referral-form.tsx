// app/referral-form.tsx  I am using expo
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';


interface Patient {
    id: number;
    first_name: string;
    last_name: string;
  }

interface Hospital {
  id: number;
  name: string;
}

const CreateReferralScreen: React.FC = () => {
  const [patient, setPatient] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [referredFrom, setReferredFrom] = useState<string>('');
  const [referredTo, setReferredTo] = useState<string>('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [referralReason, setReferralReason] = useState<string>('');
  const [referralDate, setReferralDate] = useState<string>(new Date().toISOString().slice(0, 10)); // Today's date
  const [status, setStatus] = useState<string>('Pending');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Fetch patients and hospitals on component load
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const patientResponse = await axios.get('https://referralapp-production.up.railway.app/api/patients/', config);
        setPatients(patientResponse.data);

        const hospitalResponse = await axios.get('https://referralapp-production.up.railway.app/api/hospitals/', config);
        setHospitals(hospitalResponse.data);
      } catch (err) {
        setError('Failed to fetch data.');
      }
    };

    fetchData();
  }, []);

  const handleReferral = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(
        'https://referralapp-production.up.railway.app/api/referrals/',
        {
          patient,
          referred_from: referredFrom,
          referred_to: referredTo,
          referral_reason: referralReason,
          referral_date: referralDate,
          status
        },
        config
      );

      router.push('/home'); // Navigate to Home screen after referral creation
    } catch (err) {
      setError('Referral creation failed.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Patient Dropdown */}
      <Text style={styles.label}>Patient</Text>
      <Picker selectedValue={patient} onValueChange={setPatient} style={styles.picker}>
        {patients.map((p) => (
        <Picker.Item key={p.id} label={`${p.first_name} ${p.last_name}`} value={p.id.toString()} />
        ))}
      </Picker>



      {/* Referred From (Hospital) Dropdown */}
      <Text style={styles.label}>Referred From</Text>
      <Picker selectedValue={referredFrom} onValueChange={setReferredFrom} style={styles.picker}>
        {hospitals.map((h) => (
          <Picker.Item key={h.id} label={h.name} value={h.id.toString()} />
        ))}
      </Picker>

      {/* Referred To (Hospital) Dropdown */}
      <Text style={styles.label}>Referred To</Text>
      <Picker selectedValue={referredTo} onValueChange={setReferredTo} style={styles.picker}>
        {hospitals.map((h) => (
          <Picker.Item key={h.id} label={h.name} value={h.id.toString()} />
        ))}
      </Picker>

      {/* Referral Reason */}
      <TextInput
        placeholder="Referral Reason"
        placeholderTextColor="#FFFFFF"
        value={referralReason}
        onChangeText={setReferralReason}
        style={styles.input}
      />

      {/* Referral Date */}
      <TextInput
        placeholder="Referral Date"
        placeholderTextColor="#FFFFFF"
        value={referralDate}
        onChangeText={setReferralDate}
        style={styles.input}
      />

      {/* Status Dropdown */}
      <Text style={styles.label}>Status</Text>
      <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker}>
        <Picker.Item label="Pending" value="Pending" />
        <Picker.Item label="Accepted" value="Accepted" />
        <Picker.Item label="Rejected" value="Rejected" />
      </Picker>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.buttonLink} onPress={handleReferral}>
        <Text style={styles.buttonText}>Submit Referral</Text>
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
  label: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 10,
    color: '#fff',
  },
  picker: {
    height: 50,
    color: '#fff',
    backgroundColor: '#1c2b36',
    marginBottom: 12,
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
    fontWeight: 'bold',
  },
});

export default CreateReferralScreen;
