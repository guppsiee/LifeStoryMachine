"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/session');
        if (response.ok) {
          router.push('/app');
        }
      } catch (error) {
        console.error('Failed to check session:', error);
      }
    };
    checkSession();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-neutral-100">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-neutral-900 mb-4">
          Welcome to the Life Story Machine
        </h1>
        <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
          Record your memories, and we'll craft them into a beautiful life story that you can cherish forever. It's simple, personal, and all yours.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="inline-block bg-neutral-900 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-800 transition-colors duration-300">
              Login
            </Link>
            <Link href="/register" className="inline-block bg-neutral-900 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-800 transition-colors duration-300">
              Register
            </Link>
        </div>
      </div>
    </main>
  );
}
