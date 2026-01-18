import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AppFooter() {
    const currentYear = new Date().getFullYear();
    const beYear = currentYear + 543;

    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-auto">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
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
        </footer>
    );
}
