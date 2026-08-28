import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SplashScreen() {
  const router = useRouter();
  const radiusAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animate loading circle
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(radiusAnim, {
          toValue: 16,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(radiusAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();

    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2500);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, []);

  return (
    <LinearGradient
      colors={['rgba(31,110,236,0.95)', 'rgba(19,176,150,0.95)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo area */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>F</Text>
          </View>
        </View>

        {/* Brand Title */}
        <Text style={styles.brandTitle}>FUTURA HARDWARE</Text>
        <Text style={styles.brandSubtitle}>Complete Shop Management System</Text>

        {/* Animated Loading Circle */}
        <View style={styles.loaderSection}>
          <Svg height={56} width={56} viewBox="0 0 40 40">
            {/* Background circle */}
            <Circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            {/* Animated filling circle */}
            <AnimatedCircle
              cx="20"
              cy="20"
              r={radiusAnim}
              fill="white"
            />
          </Svg>

          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.poweredText}>Powered by Futura Solutions</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 480,
  },
  logoWrapper: {
    marginBottom: 8,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -2,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 16,
  },
  brandSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  loaderSection: {
    marginTop: 80,
    alignItems: 'center',
    gap: 10,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
  },
  poweredText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
