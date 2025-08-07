"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (document.cookie.includes('token=')) {
      router.push('/app');
    }
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
          <Link href="/login" legacyBehavior>
            <a className="inline-block bg-primary text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300">
              Login
            </a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className="inline-block bg-secondary text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-secondary/90 transition-colors duration-300">
              Register
            </a>
          </Link>
        </div>
      </div>
    </main>
  );
}
