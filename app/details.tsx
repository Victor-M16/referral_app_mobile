import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MedicalHistory {
  condition: string;
  treatment: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
}

interface Referral {
  id: number;
  status: string;
  referred_from: number;
  referred_to: number;
  referral_reason: string;
  referral_date: string;
}

interface Diagnostic {
  diagnostic_type: string;
  result: string;
  date_taken: string;
  notes: string | null;
}



interface Hospital {
    id: number;
    name: string;
  }
  
  const DetailsScreen: React.FC = () => {
    const { id, first_name, last_name, dob, gender, contact_info } = useLocalSearchParams();
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
    const [hospitals, setHospitals] = useState<{ [key: number]: string }>({});
    const [error, setError] = useState<string>('');
  
    useEffect(() => {
      const fetchPatientData = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const apiBase = 'https://referralapp-production.up.railway.app/api';
  
          const [medicalHistoryResponse, referralsResponse, diagnosticsResponse] = await axios.all([
            axios.get(`${apiBase}/medical-history?patient=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${apiBase}/referrals?patient=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${apiBase}/diagnostics?patient=${id}`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
  
          setMedicalHistory(medicalHistoryResponse.data);
          setReferrals(referralsResponse.data);
          setDiagnostics(diagnosticsResponse.data);
  
          // Fetch hospital names for referrals
          const hospitalIds = [
            ...new Set([
              ...referralsResponse.data.map((referral: Referral) => referral.referred_from),
              ...referralsResponse.data.map((referral: Referral) => referral.referred_to),
            ])
          ];
  
          const hospitalPromises = hospitalIds.map(id =>
            axios.get(`${apiBase}/hospitals/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          );
          const hospitalResponses = await Promise.all(hospitalPromises);
  
          // Store hospital names by ID
          const hospitalMap: { [key: number]: string } = {};
          hospitalResponses.forEach((response) => {
            const hospital: Hospital = response.data;
            hospitalMap[hospital.id] = hospital.name;
          });
          setHospitals(hospitalMap);
  
        } catch (err) {
          setError('Failed to fetch patient details');
          console.error(err);
        }
      };
  
      fetchPatientData();
    }, [id]);

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Patient Details</Text>
        <View style={styles.listItem}>
            <Text style={styles.label}>First Name: {first_name}</Text>
            <Text style={styles.label}>Last Name: {last_name}</Text>
            <Text style={styles.label}>Date Of Birth: {dob}</Text>
            <Text style={styles.label}>Gender: {gender}</Text>
            <Text style={styles.label}>Contact Info: {contact_info}</Text>
        </View>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.header}>Medical History</Text>
            {medicalHistory.map((history, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.label}>
                  {history.condition} - {history.treatment} ({history.start_date} - {history.end_date ?? 'Ongoing'})
                </Text>
                {history.notes && <Text style={styles.label}>Notes: {history.notes}</Text>}
              </View>
            ))}
  
            <Text style={styles.header}>Diagnostics</Text>
            {diagnostics.map((diagnostic, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.label}>
                  {diagnostic.diagnostic_type} on {diagnostic.date_taken}
                </Text>
                <Text style={styles.label}>Result: {diagnostic.result}</Text>
                {diagnostic.notes && <Text style={styles.label}>Notes: {diagnostic.notes}</Text>}
              </View>
            ))}
  
            <Text style={styles.header}>Referrals</Text>
            {referrals.map((referral, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.label}>
                  Status: {referral.status}
                </Text>
                <Text style={styles.label}>
                  Referred from: {hospitals[referral.referred_from] || 'Loading...'}
                </Text>
                <Text style={styles.label}>
                  Referred to: {hospitals[referral.referred_to] || 'Loading...'}
                </Text>
                <Text style={styles.label}>
                Reason: {referral.referral_reason}
                </Text>
                <Text style={styles.label}>
                    Date: {referral.referral_date}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    );
  };
  



// const DetailsScreen: React.FC = () => {
//   const { id, first_name, last_name, dob, gender, contact_info } = useLocalSearchParams();
//   const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
//   const [referrals, setReferrals] = useState<Referral[]>([]);
//   const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     const fetchPatientData = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         const apiBase = 'https://referralapp-production.up.railway.app/api';

//         const [medicalHistoryResponse, referralsResponse, diagnosticsResponse] = await axios.all([
//           axios.get(`${apiBase}/medical-history?patient=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get(`${apiBase}/referrals?patient=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get(`${apiBase}/diagnostics?patient=${id}`, { headers: { Authorization: `Bearer ${token}` } })
//         ]);

//         setMedicalHistory(medicalHistoryResponse.data);
//         setReferrals(referralsResponse.data);
//         setDiagnostics(diagnosticsResponse.data);
//       } catch (err) {
//         setError('Failed to fetch patient details');
//         console.error(err);
//       }
//     };

//     fetchPatientData();
//   }, [id]);

//   return (
//     <ScrollView style={styles.container}>
//         <Text style={styles.header}>Patient Details</Text>
//         <View style={styles.listItem}>
//             <Text style={styles.label}>First Name: {first_name}</Text>
//             <Text style={styles.label}>Last Name: {last_name}</Text>
//             <Text style={styles.label}>Date Of Birth: {dob}</Text>
//             <Text style={styles.label}>Gender: {gender}</Text>
//             <Text style={styles.label}>Contact Info: {contact_info}</Text>
//         </View>

//       {error ? (
//         <Text style={styles.error}>{error}</Text>
//       ) : (
//         <>
//           <Text style={styles.header}>Medical History</Text>
//           {medicalHistory.map((history, index) => (
//             <View key={index} style={styles.listItem}>
//               <Text style={styles.label}>
//                 {history.condition} - {history.treatment} ({history.start_date} - {history.end_date ?? 'Ongoing'})
//               </Text>
//               {history.notes && <Text style={styles.label}>Notes: {history.notes}</Text>}
//             </View>
//           ))}

//           <Text style={styles.header}>Diagnostics</Text>
//           {diagnostics.map((diagnostic, index) => (
//             <View key={index} style={styles.listItem}>
//               <Text style={styles.label}>
//                 {diagnostic.diagnostic_type} on {diagnostic.date_taken}
//               </Text>
//               <Text style={styles.label}>Result: {diagnostic.result}</Text>
//               {diagnostic.notes && <Text style={styles.label}>Notes: {diagnostic.notes}</Text>}
//             </View>
//           ))}

//           <Text style={styles.header}>Referrals</Text>
//           {referrals.map((referral, index) => (
//             <View key={index} style={styles.listItem}>
//               <Text style={styles.label}>
//                 Referral {referral.id}: {referral.status}
//               </Text>
//               <Text style={styles.label}>
//                 Referred From: {referral.referred_from}, Referred to: {referral.referred_to}
//               </Text>

//             </View>
//           ))}
//         </>
//       )}
//     </ScrollView>
//   );
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#15242c', // Dark bluish-black color
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#fff',
  },
  listItem: {
    backgroundColor: '#1e2a35',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  error: {
    fontSize: 18,
    color: 'red',
  },
});

export default DetailsScreen;
