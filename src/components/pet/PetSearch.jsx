import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiSearch, HiFilter, HiX, HiRefresh } from 'react-icons/hi';
import { setFilters, resetFilters } from '../../redux/slices/petSlice';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect } from 'react';

const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea_pig', 'reptile', 'fish', 'other'];
const SIZES = ['tiny', 'small', 'medium', 'large', 'extra_large'];
const GENDERS = ['male', 'female'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_favorited', label: 'Most Favorited' },
  { value: 'fee_low', label: 'Fee: Low to High' },
  { value: 'fee_high', label: 'Fee: High to Low' },
];

export default function PetSearch({ showFilters, onToggleFilters }) {
  const dispatch = useDispatch();
  const { filters } = useSelector((s) => s.pets);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  const handleFilter = (key, val) => {
    dispatch(setFilters({ [key]: filters[key] === val ? '' : val }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setSearchInput('');
  };

  const activeFilterCount = [
    filters.species, filters.gender, filters.size, filters.vaccinated,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, breed..."
            className="input pl-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          <HiFilter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={filters.sort}
          onChange={(e) => dispatch(setFilters({ sort: e.target.value }))}
          className="input w-auto cursor-pointer"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button onClick={handleReset} className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
              <HiRefresh className="w-3 h-3" /> Reset all
            </button>
          </div>

          {/* Species */}
          <div>
            <p className="label mb-2">Species</p>
            <div className="flex flex-wrap gap-2">
              {SPECIES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleFilter('species', s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    filters.species === s
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <p className="label mb-2">Gender</p>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  onClick={() => handleFilter('gender', g)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    filters.gender === g
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="label mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleFilter('size', s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    filters.size === s
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Vaccinated */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.vaccinated === 'true'}
                onChange={(e) => dispatch(setFilters({ vaccinated: e.target.checked ? 'true' : '' }))}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Vaccinated only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
