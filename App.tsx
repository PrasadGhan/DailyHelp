/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import HomePage from './src/HomePage';
import {
  clearAuthSession,
  insforge,
  restoreAuthSession,
  saveAuthSession,
} from './src/insforge';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

type AuthUser = {
  email: string;
  profile?: {name?: string} | null;
};

let pendingOAuthPkceVerifier: string | undefined;
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

function App() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    restoreAuthSession()
      .then(restoredUser => setUser(restoredUser as AuthUser | null))
      .finally(() => setLoading(false));

    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID.startsWith('YOUR_') ? undefined : GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });

    const handleAuthLink = async ({url}: {url: string}) => {
      const code = new URL(url).searchParams.get('insforge_code');
      if (!code) {
        return;
      }

      const pkceVerifier = pendingOAuthPkceVerifier;
      setSubmitting(true);
      const {data, error} = await insforge.auth.exchangeOAuthCode(code, pkceVerifier);
      setSubmitting(false);

      if (error) {
        Alert.alert('Social sign-in failed', error.message);
        return;
      }
      if (data) {
        await saveAuthSession(data.accessToken, data.refreshToken);
        setUser(data.user as AuthUser);
      }
    };

    const subscription = Linking.addEventListener('url', handleAuthLink);
    Linking.getInitialURL().then(url => {
      if (url) {
        void handleAuthLink({url});
      }
    });

    return () => subscription.remove();
  }, []);

  const verifyEmail = async () => {
    if (!pendingVerificationEmail || verificationOtp.length !== 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    try {
      const {data, error} = await insforge.auth.verifyEmail({
        email: pendingVerificationEmail,
        otp: verificationOtp,
      });
      if (error) {
        Alert.alert('Verification failed', error.message);
        return;
      }

      if (data?.accessToken && data.user) {
        await saveAuthSession(data.accessToken, data.refreshToken);
        setUser(data.user as AuthUser);
      } else {
        setPendingVerificationEmail(null);
        setVerificationOtp('');
        setAuthMode('signIn');
        Alert.alert('Email verified', 'You can now sign in.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitAuth = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Invalid password', 'Password must be at least 6 characters.');
      return;
    }
    if (authMode === 'signUp' && name.trim().length < 2) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }

    setSubmitting(true);
    try {
      if (authMode === 'signUp') {
        const {data, error} = await insforge.auth.signUp({
          email: normalizedEmail,
          password,
          name: name.trim(),
        });
        if (error) {
          Alert.alert('Sign up failed', error.message);
          return;
        }
        if (data?.requireEmailVerification) {
          setPendingVerificationEmail(normalizedEmail);
          setVerificationOtp('');
          Alert.alert('Verify your email', 'Enter the 6-digit code sent to your inbox.');
          return;
        }
        if (data?.accessToken && data.user) {
          await saveAuthSession(data.accessToken, data.refreshToken);
          setUser(data.user as AuthUser);
        }
      } else {
        const {data, error} = await insforge.auth.signInWithPassword({
          email: normalizedEmail,
          password,
          method: 'password',
        });
        if (error) {
          Alert.alert('Sign in failed', error.message);
          return;
        }
        if (data) {
          await saveAuthSession(data.accessToken, data.refreshToken);
          setUser(data.user as AuthUser);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    await insforge.auth.signOut();
    await clearAuthSession();
    setUser(null);
    setPassword('');
  };

  const signInWithGoogle = async () => {
    if (GOOGLE_WEB_CLIENT_ID.startsWith('YOUR_')) {
      Alert.alert(
        'Google sign-in setup required',
        'Add the Google OAuth Web Client ID to GOOGLE_WEB_CLIENT_ID in App.tsx and enable Google in the InsForge dashboard.',
      );
      return;
    }
    setSubmitting(true);
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const response = await GoogleSignin.signIn();
      if (response.type !== 'success' || !response.data.idToken) {
        if (response.type !== 'cancelled') {
          Alert.alert('Google sign-in unavailable', 'Google did not return an ID token.');
        }
        return;
      }

      const {data, error} = await insforge.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken,
      });
      if (error) {
        Alert.alert('Google sign-in failed', error.message);
        return;
      }
      if (data) {
        await saveAuthSession(data.accessToken, data.refreshToken);
        setUser(data.user as AuthUser);
      }
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      Alert.alert('Google sign-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const signInWithGitHub = async () => {
    setSubmitting(true);
    try {
      const {data, error} = await insforge.auth.signInWithOAuth('github', {
        redirectTo: 'dailyhelp://auth/callback',
        skipBrowserRedirect: true,
      });
      if (error) {
        Alert.alert('GitHub sign-in failed', error.message);
        return;
      }
      if (data?.codeVerifier) {
        pendingOAuthPkceVerifier = data.codeVerifier;
      }
      if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (error) {
      Alert.alert('GitHub sign-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#6558D9" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {user ? (
        <HomePage
          userName={user.profile?.name || user.email.split('@')[0]}
          onSignOut={signOut}
        />
      ) : (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.brandMark}>
              <View style={styles.brandInner}><Text style={styles.brandText}>D</Text></View>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>DailyHelp</Text>
              <Text style={styles.subtitle}>Your everyday help, just a tap away.</Text>

              {authMode === 'signUp' && (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  autoCapitalize="words"
                  maxLength={50}
                  style={styles.input}
                />
              )}
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                maxLength={100}
                style={styles.input}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                style={styles.input}
              />
              {pendingVerificationEmail && (
                <TextInput
                  value={verificationOtp}
                  onChangeText={setVerificationOtp}
                  placeholder="Verification code"
                  keyboardType="numeric"
                  maxLength={6}
                  style={styles.input}
                />
              )}
              <TouchableOpacity style={styles.mobileButton} onPress={pendingVerificationEmail ? verifyEmail : submitAuth} activeOpacity={0.8} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.mobileButtonText}>{pendingVerificationEmail ? 'Verify Code' : authMode === 'signUp' ? 'Sign Up' : 'Sign In'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleAuthMode}
                onPress={() => {
                  setAuthMode(prevMode => (prevMode === 'signUp' ? 'signIn' : 'signUp'));
                  setName('');
                  setEmail('');
                  setPassword('');
                }}>
                <Text style={styles.toggleAuthModeText}>
                  {authMode === 'signUp' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={[styles.socialButton, submitting && styles.buttonDisabled]}
                onPress={signInWithGoogle}
                activeOpacity={0.8}
                disabled={submitting}>
                <Text style={styles.googleIconText}>G</Text>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, submitting && styles.buttonDisabled]}
                onPress={signInWithGitHub}
                activeOpacity={0.8}
                disabled={submitting}>
                <Text style={styles.githubIconText}>GH</Text>
                <Text style={styles.socialButtonText}>Continue with GitHub</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F7F4FF'},
  container: {flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingVertical: 36},
  brandMark: {width: 72, height: 72, borderRadius: 36, backgroundColor: '#6558D9', alignItems: 'center', justifyContent: 'center', shadowColor: '#6558D9', shadowOpacity: 0.25, shadowRadius: 16, elevation: 8},
  brandInner: {width: 58, height: 58, borderRadius: 29, backgroundColor: '#8175E8', alignItems: 'center', justifyContent: 'center'},
  brandText: {color: '#FFFFFF', fontSize: 34, fontWeight: '800'},
  content: {width: '100%', alignItems: 'center', marginBottom: 50},
  title: {color: '#17151F', fontSize: 38, fontWeight: '800', letterSpacing: -1, marginBottom: 8, textAlign: 'center'},
  name: {color: '#6558D9', fontSize: 28, fontWeight: '800', marginBottom: 10, textAlign: 'center'},
  subtitle: {color: '#777287', fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 34},
  googleButton: {width: '100%', height: 58, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#514779', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3},
  githubButton: {width: '100%', height: 58, borderRadius: 16, backgroundColor: '#24292E', alignItems: 'center', justifyContent: 'center', marginTop: 12},
  buttonDisabled: {opacity: 0.65},
  googleIcon: {width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  googleIconText: {color: '#4285F4', fontSize: 17, fontWeight: '800'},
  googleButtonText: {color: '#263238', fontSize: 16, fontWeight: '700'},
  githubButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  terms: {color: '#AAA6B6', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 22},
  signOutButton: {height: 52, width: '100%', borderRadius: 14, backgroundColor: '#6558D9', alignItems: 'center', justifyContent: 'center', marginTop: 20},
  signOutText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  input: {width: '100%', height: 56, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F1', paddingHorizontal: 16, fontSize: 16, color: '#263238', marginBottom: 16},
  mobileButton: {width: '100%', height: 56, borderRadius: 14, backgroundColor: '#6558D9', alignItems: 'center', justifyContent: 'center', marginBottom: 16},
  mobileButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  mobileLabel: {color: '#777287', fontSize: 14, lineHeight: 20, marginBottom: 8},
  changeNumberButton: {alignSelf: 'flex-start', marginTop: 8},
  changeNumberText: {color: '#6558D9', fontSize: 14, fontWeight: '700'},
  dividerRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 16},
  divider: {flex: 1, height: 1, backgroundColor: '#E7E3F1'},
  dividerText: {width: 40, textAlign: 'center', color: '#777287', fontSize: 14, fontWeight: '500'},
  loadingContainer: {justifyContent: 'center'},
  toggleAuthMode: {marginTop: 16},
  toggleAuthModeText: {color: '#6558D9', fontSize: 14, fontWeight: '700'},
  socialSignInContainer: {width: '100%', alignItems: 'center', marginTop: 24},
  socialSignInText: {color: '#777287', fontSize: 14, lineHeight: 20, marginBottom: 12},
  socialButtons: {width: '100%'},
  socialButton: {width: '100%', height: 56, borderRadius: 14, borderWidth: 1, borderColor: '#E7E3F1', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12},
  githubIconText: {color: '#FFFFFF', fontSize: 17, fontWeight: '800'},
  socialButtonText: {color: '#263238', fontSize: 16, fontWeight: '700'},
});

export default App;
