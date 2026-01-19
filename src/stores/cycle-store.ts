import { create } from 'zustand';
import { AssessmentCycle } from '@/types/database';

interface CycleStore {
    activeCycle: AssessmentCycle | null;
    cycles: AssessmentCycle[];
    loading: boolean;
    setActiveCycle: (cycle: AssessmentCycle | null) => void;
    setCycles: (cycles: AssessmentCycle[]) => void;
    setLoading: (loading: boolean) => void;
}

export const useCycleStore = create<CycleStore>((set) => ({
    activeCycle: null,
    cycles: [],
    loading: false,
    setActiveCycle: (cycle) => set({ activeCycle: cycle }),
    setCycles: (cycles) => set({ cycles }),
    setLoading: (loading) => set({ loading }),
}));
