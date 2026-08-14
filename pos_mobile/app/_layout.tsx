import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from '../src/store';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials, setLoading } from '../src/store/slices/authSlice';
import { TOKEN_KEY } from '../src/api/axiosInstance';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

function NavigationStack() {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    async function loadAuth() {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const userStr = await AsyncStorage.getItem('pos_user');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch(setCredentials({ token, user }));
        }
      } catch (e) {
        console.error('Failed to restore auth:', e);
      } finally {
        dispatch(setLoading(false));
      }
    }
    loadAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationStack />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
