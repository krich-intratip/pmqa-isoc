import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { AIConfig } from '@/types/database';
import { GEMINI_MODELS } from '@/lib/google/ai-api';

interface AIConfigState {
    apiKey: string;
    selectedModel: string;
    setApiKey: (key: string) => void;
    setSelectedModel: (modelId: string) => void;
    loadConfig: () => Promise<void>;
    saveConfig: (userId?: string) => Promise<void>;
}

export const useAIConfigStore = create<AIConfigState>()(
    persist(
        (set, get) => ({
            apiKey: '',
            selectedModel: GEMINI_MODELS[0].id, // Default to first model
            setApiKey: (key) => set({ apiKey: key }),
            setSelectedModel: (modelId) => set({ selectedModel: modelId }),
            loadConfig: async () => {
                try {
                    // Load from Firestore (Admin only should access this in strict mode, but for MVP we load broadly)
                    const docRef = doc(db, 'ai_config', 'default');
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data() as AIConfig;
                        set({ apiKey: data.apiKey, selectedModel: data.selectedModel });
                    }
                } catch (error) {
                    console.error("Failed to load AI config", error);
                }
            },
            saveConfig: async (userId?: string) => {
                const { apiKey, selectedModel } = get();
                // Get current user ID from Firebase Auth if not provided
                const currentUserId = userId || auth.currentUser?.uid || 'unknown';
                try {
                    await setDoc(doc(db, 'ai_config', 'default'), {
                        id: 'default',
                        apiKey,
                        selectedModel,
                        updatedAt: serverTimestamp(),
                        updatedBy: currentUserId
                    });
                } catch (error) {
                    console.error("Failed to save AI config", error);
                    throw error;
                }
            }
        }),
        {
            name: 'pmqa-ai-config',
            partialize: (state) => ({ selectedModel: state.selectedModel }), // Don't persist API key in local storage for security
        }
    )
);
