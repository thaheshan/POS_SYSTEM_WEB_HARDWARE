'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { SubscriptionSelection } from './SubscriptionSelection';
import { RequestPending } from './RequestPending';
import { RequestApproved } from './RequestApproved';

export type ScreenType = 'selection' | 'pending' | 'approved';

interface SubscriptionFlowState {
  currentScreen: ScreenType;
  selectedPlan: string | null;
}

export const SubscriptionFlow: React.FC = () => {
  const [state, setState] = useState<SubscriptionFlowState>({
    currentScreen: 'selection',
    selectedPlan: null,
  });

  const handleSelectPlan = (planName: string) => {
    console.log('[v0] Plan selected:', planName);
    setState({
      currentScreen: 'pending',
      selectedPlan: planName,
    });
  };

  const handleApproved = () => {
    console.log('[v0] Request approved, navigating to approved screen');
    setState((prev) => ({
      ...prev,
      currentScreen: 'approved',
    }));
  };

  const handleBackClick = () => {
    if (state.currentScreen === 'pending') {
      setState({
        currentScreen: 'selection',
        selectedPlan: null,
      });
    } else if (state.currentScreen === 'approved') {
      setState({
        currentScreen: 'selection',
        selectedPlan: null,
      });
    }
  };

  // Map screen type to step number
  const getStepNumber = (): number => {
    const stepMap: Record<ScreenType, number> = {
      selection: 3,
      pending: 3,
      approved: 3,
    };
    return stepMap[state.currentScreen];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Only show header on pending and approved screens */}
      {(state.currentScreen === 'pending' || state.currentScreen === 'approved') && (
        <Header step={getStepNumber()} onBack={handleBackClick} showInfo={true} />
      )}

      {/* Screen Content */}
      {state.currentScreen === 'selection' && <SubscriptionSelection onSelectPlan={handleSelectPlan} />}

      {state.currentScreen === 'pending' && state.selectedPlan && (
        <RequestPending
          selectedPlan={state.selectedPlan}
          onApproved={handleApproved}
          autoNavigateDelay={300000} // 5 minutes default (can be overridden)
        />
      )}

      {state.currentScreen === 'approved' && state.selectedPlan && (
        <RequestApproved selectedPlan={state.selectedPlan} />
      )}
    </div>
  );
};
