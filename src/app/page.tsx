import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/cr/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8 p-8 bg-white shadow-xl rounded-2xl">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            ClassFella<span className="text-blue-600">Pro</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            The ultimate attendance management system designed specifically for Class Representatives.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/sign-in"
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
          >
            Sign In as CR
          </Link>
          <p className="text-sm text-gray-500">
            Only authorized Class Representatives can access this system.
          </p>
        </div>
      </div>
    </div>
  );
}
