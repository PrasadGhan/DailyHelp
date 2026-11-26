import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Newspapers from './NewsPapers/newspapers';
import Laundry from './laundryservices/laundry';

const SERVICES = [
  {id: '1', name: 'News paper', icon: 'N'},
  {id: '2', name: 'Laundry services', icon: 'L'},
  {id: '3', name: 'Milk services', icon: 'M'},
  {id: '4', name: 'Vegatable services', icon: 'V'},
  {id: '5', name: 'Medical services', icon: 'M'},
  {id: '6', name: 'Electric charger services', icon: 'E'},
];

interface HomePageProps {
  userName: string;
  onSignOut: () => void;
}

export default function HomePage({userName, onSignOut}: HomePageProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  if (selectedService) {
    if (selectedService === 'News paper') {
      return (
        <Newspapers onBack={() => setSelectedService(null)} />
      );
    } else if (selectedService === 'Laundry services') {
      return (
        <Laundry onBack={() => setSelectedService(null)} />
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedService(null)}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.screenContent}>
          <Text style={styles.screenTitle}>{selectedService}</Text>
          <Text style={styles.screenMessage}>You are in the {selectedService} screen.</Text>
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>
              {selectedService.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Daily Services</Text>
        <Text style={styles.subtitle}>Choose a service</Text>

        <View style={styles.grid}>
          {SERVICES.map(service => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              activeOpacity={0.75}
              onPress={() => setSelectedService(service.name)}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>{service.icon}</Text>
              </View>
              <Text style={styles.serviceName}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F7F4FF'},
  container: {paddingHorizontal: 20, paddingVertical: 24},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28},
  greeting: {color: '#777287', fontSize: 14},
  userName: {color: '#17151F', fontSize: 20, fontWeight: '800', maxWidth: 220},
  signOutButton: {borderRadius: 12, borderWidth: 1, borderColor: '#6558D9', paddingHorizontal: 14, paddingVertical: 9},
  signOutText: {color: '#6558D9', fontSize: 13, fontWeight: '700'},
  title: {color: '#17151F', fontSize: 32, fontWeight: '800', marginBottom: 4},
  subtitle: {color: '#777287', fontSize: 16, marginBottom: 22},
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12},
  serviceCard: {width: '31%', aspectRatio: 1, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, elevation: 3, shadowColor: '#514779', shadowOpacity: 0.08, shadowRadius: 10},
  iconCircle: {width: 44, height: 44, borderRadius: 22, backgroundColor: '#8175E8', alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  iconText: {color: '#FFFFFF', fontSize: 18, fontWeight: '800'},
  serviceName: {color: '#263238', fontSize: 12, lineHeight: 16, fontWeight: '700', textAlign: 'center'},
  screenHeader: {paddingHorizontal: 18, paddingTop: 12},
  backButton: {alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 4},
  backButtonText: {color: '#6558D9', fontSize: 18, fontWeight: '700'},
  screenContent: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  screenTitle: {color: '#17151F', fontSize: 34, fontWeight: '800', textAlign: 'center', marginBottom: 10},
  screenMessage: {color: '#777287', fontSize: 16, textAlign: 'center'},
  serviceBadge: {width: 70, height: 70, borderRadius: 35, backgroundColor: '#6558D9', alignItems: 'center', justifyContent: 'center', marginTop: 24},
  serviceBadgeText: {color: '#FFFFFF', fontSize: 28, fontWeight: '800'},
});
