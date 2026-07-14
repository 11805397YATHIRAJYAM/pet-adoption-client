import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { HiMenuAlt2, HiX } from 'react-icons/hi';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useSocket } from '../hooks/useSocket';

export default function DashboardLayout() {
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useSocket();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 transform transition-transform duration-300 ease-in-out
            lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 overflow-y-auto`}
        >
          <button
            className="absolute top-4 right-4 p-1 rounded-lg text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <HiX className="w-5 h-5" />
          </button>
          <Sidebar role={user?.role} />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)] mt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
