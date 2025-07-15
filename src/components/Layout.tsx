import React from 'react';
import NetworkStatus from './NetworkStatus';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Road Condition Reporter
        </h1>
        <NetworkStatus />
      </header>
      <main className="flex-grow p-4">{children}</main>
      
    </div>
  );
};

export default Layout; 