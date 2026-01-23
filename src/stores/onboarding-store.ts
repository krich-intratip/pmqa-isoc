import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
    hasSeenTour: boolean;
    setHasSeenTour: (seen: boolean) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    isTourOpen: boolean;
    setTourOpen: (open: boolean) => void;
    resetTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            hasSeenTour: false,
            setHasSeenTour: (seen) => set({ hasSeenTour: seen }),
            currentStep: 0,
            setCurrentStep: (step) => set({ currentStep: step }),
            isTourOpen: false,
            setTourOpen: (open) => set({ isTourOpen: open }),
            resetTour: () => set({ hasSeenTour: false, currentStep: 0, isTourOpen: true }),
        }),
        {
            name: 'onboarding-storage',
            partialize: (state) => ({ hasSeenTour: state.hasSeenTour }), // Only persist completion status
        }
    )
);
