'use client';

import { useState, useRef } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { User } from '@/types/database';

interface ImportRow {
    email: string;
    displayName: string;
    role: User['role'];
    unitId?: string;
    position?: string;
    department?: string;
    phone?: string;
    status: 'valid' | 'invalid' | 'duplicate' | 'imported';
    error?: string;
}

interface BulkImportUsersProps {
    existingEmails: string[];
    onImportComplete: () => void;
}

const VALID_ROLES: User['role'][] = [
    'super_admin',
    'central_admin',
    'regional_coordinator',
    'provincial_staff',
    'data_owner',
    'reviewer',
    'read_only'
];

const ROLE_MAP: Record<string, User['role']> = {
    'super_admin': 'super_admin',
    'central_admin': 'central_admin',
    'regional_coordinator': 'regional_coordinator',
    'provincial_staff': 'provincial_staff',
    'data_owner': 'data_owner',
    'reviewer': 'reviewer',
    'read_only': 'read_only',
    // Thai alternatives
    'ผู้ดูแลระบบ': 'super_admin',
    'ผู้ดูแลส่วนกลาง': 'central_admin',
    'ผู้ประสานงานภาค': 'regional_coordinator',
    'เจ้าหน้าที่จังหวัด': 'provincial_staff',
    'เจ้าของข้อมูล': 'data_owner',
    'ผู้ตรวจสอบ': 'reviewer',
    'ผู้ใช้ทั่วไป': 'read_only',
};

export default function BulkImportUsers({ existingEmails, onImportComplete }: BulkImportUsersProps) {
    const [open, setOpen] = useState(false);
    const [importData, setImportData] = useState<ImportRow[]>([]);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateRole = (role: string): User['role'] | null => {
        const normalizedRole = role.toLowerCase().trim();
        if (ROLE_MAP[normalizedRole]) {
            return ROLE_MAP[normalizedRole];
        }
        if (ROLE_MAP[role]) {
            return ROLE_MAP[role];
        }
        if (VALID_ROLES.includes(role as User['role'])) {
            return role as User['role'];
        }
        return null;
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

                const parsedData: ImportRow[] = jsonData.map((row) => {
                    const email = (row['email'] || row['Email'] || row['อีเมล'] || '').trim();
                    const displayName = (row['displayName'] || row['name'] || row['Name'] || row['ชื่อ'] || row['ชื่อ-นามสกุล'] || '').trim();
                    const roleInput = (row['role'] || row['Role'] || row['บทบาท'] || 'read_only').trim();
                    const unitId = (row['unitId'] || row['unit'] || row['หน่วยงาน'] || '').trim();
                    const position = (row['position'] || row['ตำแหน่ง'] || '').trim();
                    const department = (row['department'] || row['แผนก'] || '').trim();
                    const phone = (row['phone'] || row['โทรศัพท์'] || '').trim();

                    // Validate
                    const errors: string[] = [];

                    if (!email) {
                        errors.push('ไม่มีอีเมล');
                    } else if (!validateEmail(email)) {
                        errors.push('รูปแบบอีเมลไม่ถูกต้อง');
                    }

                    if (!displayName) {
                        errors.push('ไม่มีชื่อ');
                    }

                    const validatedRole = validateRole(roleInput);
                    if (!validatedRole) {
                        errors.push(`บทบาท "${roleInput}" ไม่ถูกต้อง`);
                    }

                    // Check for duplicates
                    const isDuplicate = existingEmails.includes(email.toLowerCase());
                    if (isDuplicate) {
                        errors.push('อีเมลนี้มีอยู่ในระบบแล้ว');
                    }

                    return {
                        email,
                        displayName,
                        role: validatedRole || 'read_only',
                        unitId: unitId || undefined,
                        position: position || undefined,
                        department: department || undefined,
                        phone: phone || undefined,
                        status: isDuplicate ? 'duplicate' : (errors.length > 0 ? 'invalid' : 'valid'),
                        error: errors.length > 0 ? errors.join(', ') : undefined,
                    };
                });

                setImportData(parsedData);
                toast.success(`อ่านข้อมูล ${parsedData.length} รายการ`);
            } catch (error) {
                console.error('Error parsing file:', error);
                toast.error('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        const validRows = importData.filter(row => row.status === 'valid');

        if (validRows.length === 0) {
            toast.error('ไม่มีข้อมูลที่สามารถนำเข้าได้');
            return;
        }

        setImporting(true);
        setProgress(0);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < validRows.length; i++) {
            const row = validRows[i];

            try {
                // Generate a unique ID for the user (will be replaced when they sign in)
                const tempUid = `pending_${Date.now()}_${i}`;

                const userData: Partial<User> = {
                    uid: tempUid,
                    email: row.email.toLowerCase(),
                    displayName: row.displayName,
                    role: row.role,
                    unitId: row.unitId,
                    status: 'pending', // Pre-registered users still need to sign in
                    permissions: [],
                    isActive: false,
                    createdAt: serverTimestamp() as Timestamp,
                    updatedAt: serverTimestamp() as Timestamp,
                    metadata: {
                        position: row.position,
                        department: row.department,
                        phone: row.phone,
                    },
                };

                // Store with email as document ID for easy lookup
                await setDoc(doc(db, 'preregistered_users', row.email.toLowerCase()), userData);

                // Update status in UI
                setImportData(prev => prev.map(r =>
                    r.email === row.email ? { ...r, status: 'imported' } : r
                ));

                successCount++;
            } catch (error) {
                console.error(`Error importing ${row.email}:`, error);
                setImportData(prev => prev.map(r =>
                    r.email === row.email ? { ...r, status: 'invalid', error: 'เกิดข้อผิดพลาดในการบันทึก' } : r
                ));
                errorCount++;
            }

            setProgress(((i + 1) / validRows.length) * 100);
        }

        setImporting(false);

        if (successCount > 0) {
            toast.success(`นำเข้าสำเร็จ ${successCount} รายการ`);
            onImportComplete();
        }
        if (errorCount > 0) {
            toast.error(`นำเข้าล้มเหลว ${errorCount} รายการ`);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                'email': 'example@email.com',
                'displayName': 'ชื่อ นามสกุล',
                'role': 'provincial_staff',
                'unitId': 'unit-id-123',
                'position': 'นักวิเคราะห์นโยบาย',
                'department': 'ฝ่ายนโยบาย',
                'phone': '081-234-5678'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');

        // Add column widths
        ws['!cols'] = [
            { wch: 25 }, // email
            { wch: 20 }, // displayName
            { wch: 20 }, // role
            { wch: 15 }, // unitId
            { wch: 20 }, // position
            { wch: 15 }, // department
            { wch: 15 }, // phone
        ];

        XLSX.writeFile(wb, 'user_import_template.xlsx');
        toast.success('ดาวน์โหลดแม่แบบเรียบร้อยแล้ว');
    };

    const validCount = importData.filter(r => r.status === 'valid').length;
    const invalidCount = importData.filter(r => r.status === 'invalid').length;
    const duplicateCount = importData.filter(r => r.status === 'duplicate').length;
    const importedCount = importData.filter(r => r.status === 'imported').length;

    const getStatusBadge = (status: ImportRow['status']) => {
        switch (status) {
            case 'valid':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />พร้อมนำเข้า</Badge>;
            case 'invalid':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />ข้อมูลไม่ถูกต้อง</Badge>;
            case 'duplicate':
                return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />ซ้ำ</Badge>;
            case 'imported':
                return <Badge className="bg-blue-100 text-blue-800"><CheckCircle2 className="w-3 h-3 mr-1" />นำเข้าแล้ว</Badge>;
        }
    };

    const getRoleDisplay = (role: User['role']): string => {
        const roleMap: Record<User['role'], string> = {
            'super_admin': 'ผู้ดูแลระบบสูงสุด',
            'system_admin': 'ผู้ดูแลระบบ',
            'central_admin': 'ผู้ดูแลส่วนกลาง',
            'regional_coordinator': 'ผู้ประสานงานภาค',
            'provincial_staff': 'เจ้าหน้าที่จังหวัด',
            'data_owner': 'เจ้าของข้อมูล',
            'reviewer': 'ผู้ตรวจสอบ',
            'read_only': 'ผู้ใช้ทั่วไป',
        };
        return roleMap[role] || role;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    นำเข้าผู้ใช้จาก Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                        นำเข้าผู้ใช้จากไฟล์ Excel/CSV
                    </DialogTitle>
                    <DialogDescription>
                        อัปโหลดไฟล์ Excel หรือ CSV ที่มีข้อมูลผู้ใช้งาน ระบบจะตรวจสอบข้อมูลก่อนนำเข้า
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Upload Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">อัปโหลดไฟล์</CardTitle>
                            <CardDescription>
                                รองรับไฟล์ .xlsx, .xls, .csv | คอลัมน์ที่ต้องมี: email, displayName, role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={importing}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    เลือกไฟล์
                                </Button>
                                <Button variant="ghost" onClick={downloadTemplate}>
                                    <Download className="h-4 w-4 mr-2" />
                                    ดาวน์โหลดแม่แบบ
                                </Button>
                            </div>

                            {/* Role Reference */}
                            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                                <strong>บทบาทที่รองรับ:</strong> super_admin, central_admin, regional_coordinator, provincial_staff, data_owner, reviewer, read_only
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Section */}
                    {importData.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">ตัวอย่างข้อมูล ({importData.length} รายการ)</CardTitle>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="outline" className="bg-green-50">พร้อมนำเข้า: {validCount}</Badge>
                                    <Badge variant="outline" className="bg-red-50">ข้อมูลไม่ถูกต้อง: {invalidCount}</Badge>
                                    <Badge variant="outline" className="bg-yellow-50">ซ้ำ: {duplicateCount}</Badge>
                                    <Badge variant="outline" className="bg-blue-50">นำเข้าแล้ว: {importedCount}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-64 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>อีเมล</TableHead>
                                                <TableHead>ชื่อ</TableHead>
                                                <TableHead>บทบาท</TableHead>
                                                <TableHead>สถานะ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {importData.slice(0, 50).map((row, index) => (
                                                <TableRow key={index} className={row.status === 'invalid' ? 'bg-red-50' : ''}>
                                                    <TableCell className="font-mono text-xs">{row.email}</TableCell>
                                                    <TableCell>{row.displayName}</TableCell>
                                                    <TableCell>{getRoleDisplay(row.role)}</TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {getStatusBadge(row.status)}
                                                            {row.error && (
                                                                <p className="text-xs text-red-600">{row.error}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {importData.length > 50 && (
                                        <p className="text-center text-sm text-muted-foreground py-2">
                                            แสดง 50 จาก {importData.length} รายการ
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Progress */}
                    {importing && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-sm text-center text-muted-foreground">
                                กำลังนำเข้า... {Math.round(progress)}%
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={validCount === 0 || importing}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        นำเข้า {validCount} รายการ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
