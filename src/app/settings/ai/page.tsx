'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAIConfigStore } from '@/stores/ai-config-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { GEMINI_MODELS, testAIConnection } from '@/lib/google/ai-api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES, canManageUsers } from '@/lib/auth/role-helper';
import { ShieldCheck, Cpu, Key, Save } from 'lucide-react';

export default function AISettingsPage() {
    const { user } = useAuthStore();
    const { apiKey, selectedModel, setApiKey, setSelectedModel, loadConfig, saveConfig } = useAIConfigStore();

    const [localApiKey, setLocalApiKey] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'invalid'>('idle');

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    useEffect(() => {
        // Sync store model to local state if needed (store handles it)
    }, [selectedModel]);

    const handleTestConnection = async () => {
        const keyToTest = localApiKey || apiKey;
        if (!keyToTest) {
            toast.error('กรุณาระบุ API Key');
            return;
        }

        setIsTesting(true);
        setConnectionStatus('idle');

        try {
            const success = await testAIConnection(keyToTest, selectedModel);
            if (success) {
                setConnectionStatus('success');
                toast.success('เชื่อมต่อกับ Google AI สำเร็จ');
            } else {
                setConnectionStatus('invalid');
                toast.error('ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบ API Key');
            }
        } catch (error) {
            console.error(error);
            setConnectionStatus('invalid');
            toast.error('เกิดข้อผิดพลาดในการทดสอบ');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        if (localApiKey) setApiKey(localApiKey);

        setIsSaving(true);
        try {
            await saveConfig();
            toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
            // Clear local API key field for security UI (store has it in memory but don't show it fully?)
            // Actually we might want to keep it in store state but UI shows masked.
        } catch (error) {
            toast.error('บันทึกไม่สำเร็จ');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN]}>
            <div className="container mx-auto py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6 text-slate-800">ตั้งค่าระบบ AI (Google Gemini)</h1>

                <div className="grid gap-6">
                    <Card className="border-indigo-100 shadow-sm">
                        <CardHeader className="bg-indigo-50/50 pb-4">
                            <div className="flex items-center gap-2 text-indigo-700">
                                <Cpu className="h-5 w-5" />
                                <CardTitle>เลือกโมเดล (Model Selection)</CardTitle>
                            </div>
                            <CardDescription>เลือกโมเดล AI ที่เหมาะสมกับงาน (แนะนำ Gemini 1.5 Pro สำหรับการวิเคราะห์ SAR)</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="w-full h-12 text-lg">
                                    <SelectValue placeholder="เลือกโมเดล..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {GEMINI_MODELS.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            <div className="flex flex-col py-1">
                                                <span className="font-medium">{model.name}</span>
                                                <span className="text-xs text-muted-foreground">{model.description} ({model.cost})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card className="border-indigo-100 shadow-sm">
                        <CardHeader className="bg-indigo-50/50 pb-4">
                            <div className="flex items-center gap-2 text-indigo-700">
                                <Key className="h-5 w-5" />
                                <CardTitle>API Key Configuration</CardTitle>
                            </div>
                            <CardDescription>ระบุ Google AI API Key ของคุณ (ข้อมูลจะถูกเข้ารหัสและเก็บไว้อย่างปลอดภัย)</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        type="password"
                                        placeholder={apiKey ? "•••••••••••••••• (มีการระบุแล้ว)" : "ระบุ Google AI API Key (AI Studio)"}
                                        value={localApiKey}
                                        onChange={(e) => setLocalApiKey(e.target.value)}
                                        className="h-12 font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                            รับ API Key ได้ที่ Google AI Studio
                                        </a>
                                    </p>
                                </div>
                                <Button
                                    variant={connectionStatus === 'success' ? 'default' : 'outline'}
                                    className={`h-12 w-32 ${connectionStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                >
                                    {isTesting ? 'Testing...' : connectionStatus === 'success' ? 'Connected' : 'Test API'}
                                </Button>
                            </div>
                            {connectionStatus === 'success' && (
                                <div className="flex items-center text-sm text-green-600 gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                                    <ShieldCheck className="h-4 w-4" /> เชื่อมต่อระบบ AI สำเร็จและพร้อมใช้งาน
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end pt-4 border-t bg-slate-50/50">
                            <Button onClick={handleSave} disabled={isSaving} className="min-w-[150px] gap-2">
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving...' : 'บันทึกการตั้งค่า'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
