import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useSocket } from '../hooks/useSocket';
import { useSelector } from 'react-redux';

export default function MainLayout() {
  const { user } = useSelector((s) => s.auth);
  useSocket();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
