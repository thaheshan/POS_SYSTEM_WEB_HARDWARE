import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Users,
} from 'lucide-react-native';

function TabBarBackground() {
  return (
    <LinearGradient
      colors={['#1E429F', '#1A56DB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1E429F',
        },
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 17,
          color: '#ffffff',
          letterSpacing: 0.3,
        },
        headerTintColor: '#ffffff',
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#1E429F',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size - 1} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: 'Point of Sale',
          tabBarLabel: 'POS',
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size - 1} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Boxes size={size - 1} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarLabel: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <Users size={size - 1} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
