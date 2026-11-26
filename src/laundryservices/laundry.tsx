import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {insforge} from '../insforge';

interface LaundryProps {
  onBack: () => void;
}

interface LaundryService {
  id: number;
  name: string;
  display_order: number;
}

export default function Laundry({onBack}: LaundryProps) {
  const [services, setServices] = useState<LaundryService[]>([]);
  const [selectedService, setSelectedService] = useState<LaundryService | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadServices = async () => {
      setLoading(true);
      setLoadError(null);

      const {data, error} = await insforge.database
        .from('laundry')
        .select('id,name,display_order')
        .order('display_order', {ascending: true});

      if (!active) {
        return;
      }

      if (error) {
        setLoadError(error.message);
      } else {
        setServices((data ?? []) as LaundryService[]);
      }
      setLoading(false);
    };

    void loadServices();
    return () => {
      active = false;
    };
  }, []);

  const selectService = (service: LaundryService) => {
    setSelectedService(service);
    setDropdownOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Laundry Services</Text>
          <Text style={styles.subtitle}>Choose a laundry service</Text>
        </View>

        <Text style={styles.label}>Select Service</Text>
        <View style={styles.dropdownWrap}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownOpen(open => !open)}
            activeOpacity={0.8}
            disabled={loading || !!loadError}>
            {loading ? (
              <ActivityIndicator size="small" color="#6558D9" />
            ) : (
              <>
                <Text style={[styles.dropdownText, !selectedService && styles.placeholder]}>
                  {selectedService?.name ?? 'Select Service'}
                </Text>
                <Text style={styles.dropdownChevron}>{dropdownOpen ? '▲' : '▼'}</Text>
              </>
            )}
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.menu}>
              {services.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.menuItem,
                    selectedService?.id === service.id && styles.menuItemSelected,
                  ]}
                  onPress={() => selectService(service)}>
                  <Text
                    style={[
                      styles.menuItemText,
                      selectedService?.id === service.id && styles.menuItemTextSelected,
                    ]}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {loadError && <Text style={styles.errorText}>Unable to load services: {loadError}</Text>}

        {selectedService && !loadError && (
          <View style={styles.selectionCard}>
            <View style={styles.selectionIcon}>
              <Text style={styles.selectionIconText}>{selectedService.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.selectionLabel}>Selected service</Text>
              <Text style={styles.selectionName}>{selectedService.name}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F7F4FF'},
  container: {paddingHorizontal: 20, paddingVertical: 24},
  backButton: {alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 4, marginBottom: 12},
  backButtonText: {color: '#6558D9', fontSize: 18, fontWeight: '700'},
  header: {marginBottom: 28},
  title: {color: '#17151F', fontSize: 32, fontWeight: '800', marginBottom: 6},
  subtitle: {color: '#777287', fontSize: 16},
  label: {color: '#263238', fontSize: 14, fontWeight: '700', marginBottom: 8},
  dropdownWrap: {zIndex: 10},
  dropdownButton: {height: 58, borderRadius: 16, borderWidth: 1, borderColor: '#E7E3F1', backgroundColor: '#FFFFFF', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  dropdownText: {color: '#263238', fontSize: 16, fontWeight: '700'},
  placeholder: {color: '#AAA6B6', fontWeight: '500'},
  dropdownChevron: {color: '#6558D9', fontSize: 12},
  menu: {marginTop: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E7E3F1', backgroundColor: '#FFFFFF', overflow: 'hidden', elevation: 4},
  menuItem: {paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0EDF5'},
  menuItemSelected: {backgroundColor: '#F1EFFF'},
  menuItemText: {color: '#263238', fontSize: 16},
  menuItemTextSelected: {color: '#6558D9', fontWeight: '700'},
  errorText: {color: '#B42318', marginTop: 12, fontSize: 14},
  selectionCard: {marginTop: 24, minHeight: 90, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', padding: 16, flexDirection: 'row', alignItems: 'center'},
  selectionIcon: {width: 54, height: 54, borderRadius: 27, backgroundColor: '#6558D9', alignItems: 'center', justifyContent: 'center', marginRight: 14},
  selectionIconText: {color: '#FFFFFF', fontSize: 22, fontWeight: '800'},
  selectionLabel: {color: '#777287', fontSize: 13, marginBottom: 4},
  selectionName: {color: '#17151F', fontSize: 20, fontWeight: '800'},
});
