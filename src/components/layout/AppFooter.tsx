import Link from 'next/link';
import { Shield } from 'lucide-react';
import { APP_VERSION } from '@/config/version';

export default function AppFooter() {
    const currentYear = new Date().getFullYear();
    const beYear = currentYear + 543;

    // แปลงวันที่จาก YYYY-MM-DD เป็นรูปแบบภาษาไทย
    const formatThaiDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-');
        const thaiMonths = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];

        const monthIndex = parseInt(month) - 1;
        const buddhistYear = parseInt(year) + 543;

        return `${parseInt(day)} ${thaiMonths[monthIndex]} ${buddhistYear}`;
    };

    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-6 mt-auto">
            <div className="container mx-auto px-6 space-y-4">
                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-indigo-400" />
                        <span>© {beYear} PMQA 4.0 - ISOC. All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/guide" className="hover:text-indigo-600 transition-colors">คู่มือการใช้งาน</Link>
                        <Link href="/about" className="hover:text-indigo-600 transition-colors">เกี่ยวกับ</Link>
                    </div>

                    <div className="text-right">
                        Developed by{' '}
                        <a
                            href="https://portfolio-two-sepia-33.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 font-medium hover:underline"
                        >
                            พล.ท.ดร.กริช อินทราทิพย์
                        </a>
                    </div>
                </div>

                {/* Version Info */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 border-t border-slate-200 text-xs text-slate-400">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        Version {APP_VERSION.version}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                        อัปเดตล่าสุด: {formatThaiDate(APP_VERSION.lastUpdate)}
                    </span>
                </div>
            </div>
        </footer>
    );
}
