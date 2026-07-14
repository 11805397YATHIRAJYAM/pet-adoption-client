import { NavLink } from 'react-router-dom';
import {
  HiHome, HiClipboardList, HiCalendar, HiChat, HiBell, HiUsers,
  HiShieldCheck, HiStar, HiHeart, HiCog, HiTrendingUp,
} from 'react-icons/hi';
import { MdPets } from 'react-icons/md';
import { FaDog } from 'react-icons/fa';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
  }`;

const shelterLinks = [
  { to: '/shelter', label: 'Dashboard', icon: HiHome, end: true },
  { to: '/shelter/pets', label: 'My Pets', icon: MdPets },
  { to: '/shelter/pets/create', label: 'Add Pet', icon: FaDog },
  { to: '/shelter/applications', label: 'Applications', icon: HiClipboardList },
  { to: '/shelter/appointments', label: 'Appointments', icon: HiCalendar },
  { to: '/shelter/profile', label: 'Shelter Profile', icon: HiCog },
];

const fosterLinks = [
  { to: '/foster', label: 'Dashboard', icon: HiHome, end: true },
  { to: '/foster/applications', label: 'My Fosters', icon: HiClipboardList },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: HiHome, end: true },
  { to: '/admin/users', label: 'Users', icon: HiUsers },
  { to: '/admin/shelters', label: 'Shelters', icon: HiShieldCheck },
  { to: '/admin/pets', label: 'Pets', icon: MdPets },
  { to: '/admin/reviews', label: 'Reviews', icon: HiStar },
];

const commonLinks = [
  { to: '/messages', label: 'Messages', icon: HiChat },
  { to: '/notifications', label: 'Notifications', icon: HiBell },
];

export default function Sidebar({ role }) {
  const links = role === 'admin' ? adminLinks : role === 'shelter' ? shelterLinks : role === 'foster' ? fosterLinks : [];

  return (
    <nav className="p-4 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-4 mb-3">
        {role === 'admin' ? 'Admin Panel' : role === 'shelter' ? 'Shelter' : role === 'foster' ? 'Foster' : 'My Account'}
      </p>

      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={navLinkClass}>
          <Icon className="w-5 h-5 flex-shrink-0" />
          {label}
        </NavLink>
      ))}

      {commonLinks.length > 0 && (
        <>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-4 mb-3">
              General
            </p>
            {commonLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
