import { Link } from 'react-router-dom';
import { MdPets } from 'react-icons/md';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
              <MdPets className="w-7 h-7" />
              PetAdopt
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Connecting loving families with pets in need. Every pet deserves a forever home.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><FaFacebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><FaInstagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><FaTwitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Adopt</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/browse" className="hover:text-primary-600 transition-colors">Browse Pets</Link></li>
              <li><Link to="/browse?species=dog" className="hover:text-primary-600 transition-colors">Dogs</Link></li>
              <li><Link to="/browse?species=cat" className="hover:text-primary-600 transition-colors">Cats</Link></li>
              <li><Link to="/browse?species=other" className="hover:text-primary-600 transition-colors">Other Animals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/register" className="hover:text-primary-600 transition-colors">Become a Foster</Link></li>
              <li><Link to="/register" className="hover:text-primary-600 transition-colors">Register Shelter</Link></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Volunteer</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Donate</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-10 pt-6 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} PetAdopt. All rights reserved. Made with ❤️ for pets.</p>
        </div>
      </div>
    </footer>
  );
}
