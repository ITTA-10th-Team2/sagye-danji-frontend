import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="w-full min-h-screen flex justify-center bg-gray-100">
      <main className="w-full max-w-[430px] min-h-screen bg-white flex flex-col pt-safe-top pb-safe-bottom shadow-md">
        {children}
      </main>
    </div>
  );
}
