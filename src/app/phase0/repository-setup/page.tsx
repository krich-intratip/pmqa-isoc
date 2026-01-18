'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FolderPlus, CheckCircle2, Loader2, FolderTree, Link2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ROLES } from '@/lib/auth/role-helper';

const FOLDER_STRUCTURE = [
    { id: 'root', name: 'PMQA_[ปี]_[หน่วยงาน]', children: ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7', 'reports'] },
    { id: 'cat1', name: 'หมวด 1 - การนำองค์การ', parent: 'root' },
    { id: 'cat2', name: 'หมวด 2 - การวางแผนเชิงยุทธศาสตร์', parent: 'root' },
    { id: 'cat3', name: 'หมวด 3 - การให้ความสำคัญกับผู้รับบริการ', parent: 'root' },
    { id: 'cat4', name: 'หมวด 4 - การวัด วิเคราะห์ และจัดการความรู้', parent: 'root' },
    { id: 'cat5', name: 'หมวด 5 - การมุ่งเน้นบุคลากร', parent: 'root' },
    { id: 'cat6', name: 'หมวด 6 - การมุ่งเน้นระบบปฏิบัติการ', parent: 'root' },
    { id: 'cat7', name: 'หมวด 7 - ผลลัพธ์การดำเนินการ', parent: 'root' },
    { id: 'reports', name: 'รายงาน SAR', parent: 'root' },
];

export default function RepositorySetupPage() {
    const { user } = useAuthStore();
    const [unitName, setUnitName] = useState('');
    const [year, setYear] = useState(new Date().getFullYear() + 543);
    const [driveLink, setDriveLink] = useState('');
    const [setupComplete, setSetupComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFolders, setSelectedFolders] = useState<string[]>(FOLDER_STRUCTURE.map(f => f.id));

    const generateFolderNames = () => {
        const rootName = `PMQA_${year}_${unitName || 'หน่วยงาน'}`;
        return FOLDER_STRUCTURE.map(f => ({
            ...f,
            displayName: f.id === 'root' ? rootName : f.name,
        }));
    };

    const handleSetup = async () => {
        if (!unitName) {
            toast.error('กรุณาระบุชื่อหน่วยงาน');
            return;
        }

        setLoading(true);

        // Simulate setup process (in real app, would call Google Drive API)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate a mock Drive link
        const mockFolderId = Math.random().toString(36).substring(7);
        setDriveLink(`https://drive.google.com/drive/folders/${mockFolderId}`);
        setSetupComplete(true);
        setLoading(false);

        toast.success('สร้าง Repository สำเร็จ!');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(driveLink);
        toast.success('คัดลอกลิงก์แล้ว');
    };

    const folders = generateFolderNames();

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN, ROLES.REGIONAL, ROLES.PROVINCIAL]}>
            <div className="container mx-auto py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-slate-800">
                    <FolderPlus className="h-8 w-8 text-teal-600" />
                    Repository Setup Wizard
                </h1>
                <p className="text-muted-foreground mb-6">ตั้งค่าโครงสร้างโฟลเดอร์สำหรับเก็บหลักฐาน PMQA (App 0.3)</p>

                {!setupComplete ? (
                    <div className="grid gap-6">
                        {/* Configuration Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>ขั้นตอนที่ 1: ระบุข้อมูลหน่วยงาน</CardTitle>
                                <CardDescription>กรอกข้อมูลเพื่อสร้างโครงสร้างโฟลเดอร์</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>ชื่อหน่วยงาน (ย่อ)</Label>
                                        <Input
                                            value={unitName}
                                            onChange={(e) => setUnitName(e.target.value)}
                                            placeholder="เช่น กอ.รมน.กทม."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ปี พ.ศ.</Label>
                                        <Input
                                            type="number"
                                            value={year}
                                            onChange={(e) => setYear(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Folder Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderTree className="h-5 w-5" />
                                    ขั้นตอนที่ 2: ตรวจสอบโครงสร้างโฟลเดอร์
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-1">
                                    {folders.map((folder, idx) => (
                                        <div key={folder.id} className={`flex items-center gap-2 ${folder.parent ? 'ml-6' : ''}`}>
                                            <Checkbox
                                                checked={selectedFolders.includes(folder.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedFolders([...selectedFolders, folder.id]);
                                                    } else {
                                                        setSelectedFolders(selectedFolders.filter(id => id !== folder.id));
                                                    }
                                                }}
                                            />
                                            <span className={folder.id === 'root' ? 'font-bold text-teal-700' : ''}>
                                                {folder.parent ? '└── ' : '📁 '}
                                                {folder.displayName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Button */}
                        <Button
                            size="lg"
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={handleSetup}
                            disabled={loading || !unitName}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    กำลังสร้าง Repository...
                                </>
                            ) : (
                                <>
                                    <FolderPlus className="h-5 w-5 mr-2" />
                                    สร้าง Repository บน Google Drive
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    /* Success State */
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-8 text-center">
                            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-green-800 mb-2">สร้าง Repository สำเร็จ!</h2>
                            <p className="text-green-700 mb-6">โครงสร้างโฟลเดอร์พร้อมใช้งาน</p>

                            <div className="bg-white p-4 rounded-lg border border-green-200 flex items-center justify-between max-w-lg mx-auto">
                                <div className="flex items-center gap-2 text-left truncate">
                                    <Link2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <a href={driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                        {driveLink}
                                    </a>
                                </div>
                                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mt-6">
                                <Button variant="outline" onClick={() => setSetupComplete(false)}>
                                    สร้าง Repository ใหม่
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
