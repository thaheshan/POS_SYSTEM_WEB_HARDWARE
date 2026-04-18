'use client';

import React, { createContext, useContext, useState } from 'react';

export interface ShopData {
  shopName: string;
  businessRegistration: string;
  shopAddress: string;
  city: string;
  postalCode: string;
  district: string;
  province: string;
  tin: string;
  vat: string;
  vatDate: string;
}

export interface OwnerData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

export interface PricingData {
  plan: 'starter' | 'professional' | 'enterprise';
}

export interface RegistrationData {
  shop: ShopData;
  owner: OwnerData;
  pricing: PricingData;
}

interface RegistrationContextType {
  currentStep: number;
  data: Partial<RegistrationData>;
  setCurrentStep: (step: number) => void;
  updateShopData: (data: Partial<ShopData>) => void;
  updateOwnerData: (data: Partial<OwnerData>) => void;
  updatePricingData: (data: Partial<PricingData>) => void;
  resetData: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<RegistrationData>>({
    shop: {
      shopName: '',
      businessRegistration: '',
      shopAddress: '',
      city: '',
      postalCode: '',
      district: '',
      province: '',
      tin: '',
      vat: '',
      vatDate: ''
    },
    owner: {
      fullName: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: ''
    },
    pricing: {
      plan: 'starter'
    },
  });

  const updateShopData = (shopData: Partial<ShopData>) => {
    setData((prev) => ({
      ...prev,
      shop: { ...prev.shop, ...shopData } as ShopData,
    }));
  };

  const updateOwnerData = (ownerData: Partial<OwnerData>) => {
    setData((prev) => ({
      ...prev,
      owner: { ...prev.owner, ...ownerData } as OwnerData,
    }));
  };

  const updatePricingData = (pricingData: Partial<PricingData>) => {
    setData((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, ...pricingData } as PricingData,
    }));
  };

  const resetData = () => {
    setCurrentStep(1);
    setData({
      shop: {
        shopName: '',
        businessRegistration: '',
        shopAddress: '',
        city: '',
        postalCode: '',
        district: '',
        province: '',
        tin: '',
        vat: '',
        vatDate: ''
      },
      owner: {
        fullName: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: ''
      },
      pricing: {
        plan: 'starter'
      },
    });
  };

  return (
    <RegistrationContext.Provider
      value={{
        currentStep,
        data,
        setCurrentStep,
        updateShopData,
        updateOwnerData,
        updatePricingData,
        resetData,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
}
