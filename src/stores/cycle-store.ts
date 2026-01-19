import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentCycle } from '@/types/database';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface CycleStore {
    activeCycle: AssessmentCycle | null;
    selectedCycle: AssessmentCycle | null;
    cycles: AssessmentCycle[];
    loading: boolean;
    setActiveCycle: (cycle: AssessmentCycle | null) => void;
    setSelectedCycle: (cycle: AssessmentCycle | null) => void;
    setCycles: (cycles: AssessmentCycle[]) => void;
    setLoading: (loading: boolean) => void;
    fetchCycles: () => Promise<void>;
}

export const useCycleStore = create<CycleStore>()(
    persist(
        (set, get) => ({
            activeCycle: null,
            selectedCycle: null,
            cycles: [],
            loading: false,
            setActiveCycle: (cycle) => set({ activeCycle: cycle }),
            setSelectedCycle: (cycle) => set({ selectedCycle: cycle }),
            setCycles: (cycles) => set({ cycles }),
            setLoading: (loading) => set({ loading }),
            fetchCycles: async () => {
                set({ loading: true });
                try {
                    const q = query(collection(db, 'assessmentCycles'), orderBy('year', 'desc'));
                    const snapshot = await getDocs(q);
                    const cyclesData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as AssessmentCycle[];

                    set({ cycles: cyclesData });

                    // Auto-select active cycle if not already selected
                    const state = get();
                    if (!state.selectedCycle && cyclesData.length > 0) {
                        const active = cyclesData.find(c => c.isActive);
                        set({
                            selectedCycle: active || cyclesData[0],
                            activeCycle: active || null
                        });
                    }
                } catch (error) {
                    console.error('Error fetching cycles:', error);
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'cycle-storage',
            partialize: (state) => ({
                selectedCycle: state.selectedCycle,
            }),
        }
    )
);
