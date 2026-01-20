'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { APP_VERSION } from '@/config/version';

export default function Home() {
  const { user, loading, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (!loading && user) {
      if (user.status === 'approved' || user.role === 'super_admin') {
        router.push('/dashboard');
      } else if (user.status === 'pending') {
        router.push('/auth/register');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-indigo-100 rounded"></div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-2xl text-indigo-700">
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm">QA</div>
          PMQA 4.0
        </div>
        <div>
          <Link href="/auth/login">
            <Button>เข้าสู่ระบบ (Login)</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            Secure & AI-Powered Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
            ยกระดับการประเมินผล <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              กอ.รมน. ยุค 4.0
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            ระบบบริหารจัดการจริยธรรมและการประเมินผลการปฏิบัติงาน ผ่านระบบดิจิทัลและ AI
            ช่วยลดภาระงาน เพิ่มความแม่นยำ และวิเคราะห์ผลได้แบบ Real-time
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/auth/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all">
                เริ่มต้นใช้งาน <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© 2026 Internal Security Operations Command. All rights reserved.</p>
        <p className="mt-1 text-xs">Version {APP_VERSION.version} | อัปเดตล่าสุด: {APP_VERSION.releaseDate}</p>
      </footer>
    </div>
  );
}
