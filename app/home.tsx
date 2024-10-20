import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import jwt_decode from 'jwt-decode';


interface Hospital {
  id: number;
  name: string;
  type: string;
  address: string;
  contact_info: string;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  contact_info: string;
}

interface MedicalHistory {
    id: number;
    patient: number; // Assuming it's just an ID in the API response. If the patient object is included, adjust this.
    condition: string;
    treatment: string;
    start_date: string;
    end_date: string | null; // Nullable for ongoing treatments
    notes: string | null;
  }
  
  interface Diagnostic {
    id: number;
    patient: number; // Similar to MedicalHistory, assuming patient is an ID here.
    diagnostic_type: string;
    result: string;
    date_taken: string;
    notes: string | null;
  }
  
  interface Equipment {
    id: number;
    hospital: number; // Assuming the hospital is returned as an ID
    equipment_name: string;
    description: string | null;
    available: boolean;
  }
  
  interface Referral {
    id: number;
    patient: number; // ID reference to patient
    referred_from: number; // ID reference to the hospital
    referred_to: number; // ID reference to the hospital
    referral_reason: string;
    referral_date: string;
    status: string;
  }


  interface User {
    id: number;
    hospital: number; // ID reference to patient
    role: string; // ID reference to the hospital
  }



const HomeScreen: React.FC = () => {
    const [userHospital, setUserHospital] = useState<User[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);


    const [equipmentQuery, setEquipmentQuery] = useState('');
    const [filteredEquipment, setFilteredEquipment] = useState<{ hospital: string, equipment_name: string }[]>([]);


  const [error, setError] = useState<string>('');
  const router = useRouter();

  const searchHospitals = async () => {
    if (equipmentQuery.trim() === '') return;
  
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `https://referralapp-production.up.railway.app/api/equipment?equipment_name=${equipmentQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Group equipment by hospital name
      const groupedEquipment = response.data.reduce((acc: any, item: any) => {
        // Handle case where hospital is a foreign key reference
        const hospitalName = item.hospital?.name || `Hospital ID: ${item.hospital}`; // Fallback if no name in response
        
        if (!acc[hospitalName]) {
          acc[hospitalName] = [];  // Initialize as array
        }
  
        // Push equipment name into the array (ensure it's not empty or null)
        if (item.equipment_name) {
          acc[hospitalName].push(item.equipment_name);
        }
        
        return acc;
      }, {});
  
      // Transform the object into an array for display
      const displayData = Object.keys(groupedEquipment).map(hospital => ({
        hospital,
        equipment_name: groupedEquipment[hospital] // This is now an array
      }));
  
      setFilteredEquipment(displayData);  // Update state with the grouped data
    } catch (err) {
      setError('Error searching for equipment');
      console.error(err);
    }
  };
  
  
  
  const renderEquipmentItem = ({ item }: { item: { hospital: string, equipment_name: string[] } }) => (
    <View style={styles.hospitalContainer}>
      <Text style={styles.hospitalName}>{item.hospital}</Text>
      {item.equipment_name.map((equipment, index) => (
        <Text key={index} style={styles.equipmentItem}>{equipment}</Text>
      ))}
    </View>
  );


useEffect(() => {
  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const apiBase = 'https://referralapp-production.up.railway.app/api';

      const fetchUserData = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            const decodedToken = jwt_decode(token);
            const username = decodedToken.username; // Adjust based on your token structure
      
            const response = await axios.get(`${apiBase}/users/?username=${username}`, {
              headers: { Authorization: `Bearer ${token}` },
            });


            setUserHospital(response.data.hospital)
            console.log(response.data); // Handle your response as needed
          }
        } catch (error) {
          console.error('Failed to fetch user data', error);
        }
      };
    
      

      // Fetch all data
      const [hospitalsResponse, patientsResponse, medicalHistoryResponse, diagnosticsResponse, equipmentResponse, referralsResponse] = await axios.all([
        
        axios.get(`${apiBase}/hospitals`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBase}/patients`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBase}/medical-history`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBase}/diagnostics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBase}/equipment`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBase}/referrals`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Set the fetched data
      
      setHospitals(hospitalsResponse.data);
      setPatients(patientsResponse.data);
      setMedicalHistory(medicalHistoryResponse.data);
      setDiagnostics(diagnosticsResponse.data);
      setEquipment(equipmentResponse.data);
      setReferrals(referralsResponse.data);
    } catch (err) {
      setError('Failed to fetch data from one or more endpoints');
      console.error(err);
    }
  };

  fetchData();
}, []);


    // need this to also sen
  const handleItemPress = (patient: Patient) => {
    router.push({
      pathname: '/details',
      params: { id: patient.id, first_name: patient.first_name, last_name: patient.last_name, dob: patient.dob, gender: patient.gender, contact_info: patient.contact_info },
    });
  };



  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={styles.item}>
        <Text style={styles.title}>{`${item.first_name} ${item.last_name}`}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReferralItem = ({ item }: { item: Referral }) => (
    <TouchableOpacity onPress={() => console.log(item)}>
      <View style={styles.item}>
        <Text style={styles.title}>{`Referral for Patient ID ${item.patient}, Status: ${item.status}`}</Text>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
{/* If I could have a search bar to allow me to search for equipment, so that on submit, the page returns a list of hospitals that have that equipment*/}
<TextInput
        style={styles.searchInput}
        placeholder="Search for Equipment..."
        placeholderTextColor="#888"
        value={equipmentQuery}
        onChangeText={setEquipmentQuery}
      />
      <TouchableOpacity
        style={styles.buttonLink}
        onPress={() => searchHospitals()}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>


      {/* Patients Section */}
      <Text style={styles.buttonText}>Patients</Text>
      {patients.length > 0 ? (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPatientItem}
        />
      ) : (
        <Text style={styles.buttonText}>{error ? error : 'Loading patients...'}</Text>
      )}

{/* I will also need a make new referrals button that should take me to a referral form*/}
    {/* Referrals Section */}
  <Text style={styles.buttonText}>Referrals</Text>
  {referrals.length > 0 ? (
    <FlatList
      data={referrals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderReferralItem}
    />
  ) : (
    <Text style={styles.buttonText}>{error ? error : 'Loading referrals...'}</Text>
  )}

<TouchableOpacity
  style={styles.buttonLink}
  onPress={() => router.push('/referral-form')}>
  <Text style={styles.buttonText}>Make New Referral</Text>
</TouchableOpacity>

      <TouchableOpacity style={styles.buttonLink} onPress={() => AsyncStorage.removeItem('token').then(() => router.push('/'))}>
        <Text style={styles.buttonText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#15242c',
  },
  item: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  searchInput: {
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#fff',
  },
  buttonLink: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#c0c000',
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
  hospitalContainer: {
    marginBottom: 15,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  equipmentItem: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
  },
});

export default HomeScreen;


