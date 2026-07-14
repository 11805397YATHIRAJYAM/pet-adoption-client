import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSearch, HiHeart, HiShieldCheck, HiArrowRight } from 'react-icons/hi';
import { MdPets } from 'react-icons/md';
import { FaDog, FaCat, FaFeather } from 'react-icons/fa';
import { petAPI } from '../services/api';
import PetCard from '../components/pet/PetCard';
import { PetCardSkeleton } from '../components/common/LoadingSpinner';

const features = [
  { icon: MdPets, title: 'Thousands of Pets', desc: 'Browse hundreds of adoptable pets from verified shelters near you.' },
  { icon: HiHeart, title: 'Easy Adoption', desc: 'Simple online applications with real-time status tracking.' },
  { icon: HiShieldCheck, title: 'Verified Shelters', desc: 'All partner shelters are verified and approved by our team.' },
];

const species = [
  { label: 'Dogs', icon: FaDog, value: 'dog', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600', emoji: '🐕' },
  { label: 'Cats', icon: FaCat, value: 'cat', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600', emoji: '🐈' },
  { label: 'Birds', icon: FaFeather, value: 'bird', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', emoji: '🦜' },
  { label: 'Others', icon: MdPets, value: 'other', color: 'bg-green-50 dark:bg-green-900/20 text-green-600', emoji: '🐾' },
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await petAPI.getAll({ limit: 8, sort: 'most_favorited' });
        setFeaturedPets(data.data || []);
      } catch {
        setFeaturedPets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    else navigate('/browse');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-28 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                🐾 Find Your Perfect Companion
              </span>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                Give a Pet a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-orange-400">
                  Forever Home
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                Browse thousands of lovable pets from trusted shelters. Your new best friend is waiting for you.
              </p>
            </motion.div>

            {/* Search */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSearch}
              className="flex gap-2 max-w-xl mx-auto mb-8"
            >
              <div className="relative flex-1">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by breed, name..."
                  className="input pl-12 py-3.5 text-base rounded-2xl shadow-md"
                />
              </div>
              <button type="submit" className="btn-primary py-3.5 px-6 rounded-2xl text-base">
                Search
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
            >
              <span className="flex items-center gap-1"><span className="text-green-500 font-bold">10k+</span> Pets adopted</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-1"><span className="text-primary-500 font-bold">500+</span> Partner shelters</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-1"><span className="text-orange-500 font-bold">50k+</span> Happy families</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Species categories */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Browse by Species</h2>
            <p className="text-gray-500 dark:text-gray-400">Find your ideal companion</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {species.map(({ label, value, color, emoji }, i) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/browse?species=${value}`}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${color} hover:scale-105 transition-transform duration-200 cursor-pointer`}
                >
                  <span className="text-4xl">{emoji}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured pets */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Featured Pets</h2>
              <p className="text-gray-500 dark:text-gray-400">Popular pets looking for homes</p>
            </div>
            <Link
              to="/browse"
              className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all"
            >
              View all <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <PetCardSkeleton key={i} />)
              : featuredPets.map((pet) => <PetCard key={pet._id} pet={pet} />)
            }
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Why Choose PetAdopt?</h2>
            <p className="text-gray-500 dark:text-gray-400">The most trusted pet adoption platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl bg-gray-50 dark:bg-gray-800"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-5">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-orange-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Find Your Match?</h2>
          <p className="text-orange-100 mb-8 text-lg">Thousands of pets are waiting for a loving home like yours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/browse"
              className="bg-white text-primary-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors"
            >
              Browse All Pets
            </Link>
            <Link
              to="/register"
              className="bg-white/20 text-white font-bold px-8 py-4 rounded-2xl border-2 border-white/40 hover:bg-white/30 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
