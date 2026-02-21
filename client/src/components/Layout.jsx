import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Toast from './Toast';
import { useState } from 'react';

export default function Layout() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-dark-900 overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Outlet context={{ showToast }} />
      </main>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
