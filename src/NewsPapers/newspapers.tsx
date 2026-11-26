import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {WebView} from 'react-native-webview';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';

const LANGUAGES = ['Marathi', 'English', 'Hindi', 'Tamil', 'Kannada', 'Telgu'];

const MARATHI_PAPERS = [
  {name: 'Lokmat', image: require('./images/Lokmat.jpg'), url: 'https://epaper.lokmat.com/'},
  {name: 'Sakal', image: require('./images/sakal.jpg'), url: 'https://epaper.esakal.com/'},
  {name: 'Loksatta', image: require('./images/loksatta.jpg'), url: 'https://epaper.loksatta.com/'},
  {name: 'Divya Marathi', image: require('./images/DivyaMarathi.jpg'), url: 'https://divyamarathi.bhaskar.com/'},
];

interface NewspapersProps {
  onBack: () => void;
}

export default function Newspapers({onBack}: NewspapersProps) {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Marathi');
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [selectedPaper, setSelectedPaper] = useState<(typeof MARATHI_PAPERS)[number] | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<Date | null>(null);

  const today = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const selectLanguage = (language: string) => {
    setSelectedLanguage(language);
    setLanguageMenuOpen(false);
  };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSubscriptionStartDate(date);
    }
  };

  const closeSelectedPaper = () => {
    setSelectedPaper(null);
    setSubscriptionStartDate(null);
    setShowDatePicker(false);
  };

  if (selectedPaper) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.onlineHeader}>
          <TouchableOpacity
            style={styles.onlineBackButton}
            onPress={closeSelectedPaper}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <View style={styles.onlineTitleWrap}>
            <Text style={styles.onlineTitle}>{selectedPaper.name}</Text>
            <Text style={styles.onlineDate}>Today's e-paper · {today}</Text>
          </View>
        </View>

        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionTextWrap}>
            <Text style={styles.subscriptionTitle}>Set paper subscription</Text>
            <Text style={styles.subscriptionDate}>
              {subscriptionStartDate
                ? `Starts from ${subscriptionStartDate.toLocaleDateString('en-IN')}`
                : 'Choose your subscription start date'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.selectDateButton}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.selectDateText}>Select date</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={subscriptionStartDate ?? new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        <WebView
          source={{uri: selectedPaper.url}}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webLoader}>
              <ActivityIndicator size="large" color="#6558D9" />
              <Text style={styles.loaderText}>Loading today's edition...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Newspapers</Text>

        <Text style={styles.label}>Select language</Text>
        <TouchableOpacity
          style={styles.dropdown}
          activeOpacity={0.8}
          onPress={() => setLanguageMenuOpen(open => !open)}>
          <Text style={styles.dropdownText}>{selectedLanguage}</Text>
          <Text style={styles.dropdownArrow}>{languageMenuOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {languageMenuOpen && (
          <View style={styles.menu}>
            {LANGUAGES.map(language => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.menuItem,
                  selectedLanguage === language && styles.menuItemSelected,
                ]}
                onPress={() => selectLanguage(language)}>
                <Text
                  style={[
                    styles.menuItemText,
                    selectedLanguage === language && styles.menuItemTextSelected,
                  ]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedLanguage === 'Marathi' ? (
          <View style={styles.grid}>
            {MARATHI_PAPERS.map(paper => (
              <TouchableOpacity
                key={paper.name}
                style={styles.paperCard}
                activeOpacity={0.75}
                onPress={() => setSelectedPaper(paper)}>
                <View style={styles.imageFrame}>
                  {!loadedImages[paper.name] && (
                    <View style={styles.imageLoader}>
                      <ActivityIndicator size="small" color="#6558D9" />
                    </View>
                  )}
                  <Image
                    source={paper.image}
                    style={styles.paperImage}
                    resizeMode="contain"
                    onLoad={() =>
                      setLoadedImages(current => ({...current, [paper.name]: true}))
                    }
                  />
                </View>
                <Text style={styles.paperName}>{paper.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No newspapers available</Text>
            <Text style={styles.emptyText}>{selectedLanguage} newspapers will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F7F4FF'},
  container: {paddingHorizontal: 20, paddingVertical: 24},
  title: {fontSize: 32, fontWeight: '800', color: '#17151F', marginBottom: 24},
  label: {fontSize: 14, fontWeight: '700', color: '#777287', marginBottom: 8},
  dropdown: {height: 56, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16},
  dropdownText: {fontSize: 16, color: '#263238', fontWeight: '600'},
  dropdownArrow: {fontSize: 13, color: '#6558D9'},
  menu: {marginTop: 6, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', overflow: 'hidden', elevation: 4},
  menuItem: {height: 46, justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1EEF7'},
  menuItemSelected: {backgroundColor: '#EEEAFE'},
  menuItemText: {fontSize: 15, color: '#263238'},
  menuItemTextSelected: {color: '#6558D9', fontWeight: '700'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24, rowGap: 16},
  paperCard: {width: '48%', alignItems: 'center'},
  imageFrame: {width: '100%', aspectRatio: 1, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', overflow: 'hidden', elevation: 3},
  paperImage: {width: '100%', height: '100%'},
  paperName: {fontSize: 15, fontWeight: '700', color: '#263238', marginTop: 8, textAlign: 'center'},
  emptyState: {alignItems: 'center', marginTop: 40, padding: 24},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: '#263238', marginBottom: 6},
  emptyText: {fontSize: 14, color: '#777287', textAlign: 'center'},
  backButton: {marginBottom: 16},
  backButtonText: {fontSize: 16, color: '#6558D9'},
  imageLoader: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 18},
  webView: {flex: 1},
  onlineHeader: {padding: 16, borderBottomWidth: 1, borderBottomColor: '#E7E3F1', backgroundColor: '#FFFFFF'},
  onlineBackButton: {padding: 8},
  onlineTitleWrap: {marginTop: 4},
  onlineTitle: {fontSize: 18, fontWeight: '700', color: '#263238'},
  onlineDate: {fontSize: 14, color: '#777287', marginTop: 2},
  webLoader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loaderText: {marginTop: 8, fontSize: 16, color: '#6558D9'},
  subscriptionSection: {marginTop: 24, padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', elevation: 3},
  subscriptionCard: {marginTop: 16, padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', elevation: 3},
  subscriptionTextWrap: {marginBottom: 12},
  subscriptionTitle: {fontSize: 18, fontWeight: '700', color: '#263238'},
  subscriptionDate: {fontSize: 14, color: '#777287'},
  selectDateButton: {height: 48, borderRadius: 14, backgroundColor: '#F1F0FF', justifyContent: 'center', alignItems: 'center'},
  selectDateText: {fontSize: 16, color: '#6558D9'},
  datePickerButton: {height: 48, borderRadius: 14, backgroundColor: '#F1F0FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8},
  datePickerText: {fontSize: 16, color: '#6558D9'},
  datePicker: {width: '100%', backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden'},
});
