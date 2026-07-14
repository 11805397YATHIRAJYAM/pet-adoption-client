import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiBan, HiCheck, HiChevronDown } from 'react-icons/hi';
import { adminAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ROLES = ['user', 'foster', 'shelter', 'admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleDropdown, setRoleDropdown] = useState(null);

  const load = async (p = 1, q = '') => {
    try {
      setLoading(true);
      const params = { page: p, limit: 20 };
      if (q) params.search = q;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleSuspend = async (id, suspended) => {
    try {
      await adminAPI.suspendUser(id, { suspend: !suspended });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isSuspended: !suspended } : u));
      toast.success(!suspended ? 'User suspended' : 'User reactivated');
    } catch { toast.error('Action failed'); }
  };

  const changeRole = async (id, role) => {
    try {
      await adminAPI.changeRole(id, { role });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
      setRoleDropdown(null);
      toast.success('Role updated');
    } catch { toast.error('Failed to change role'); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(1, search);
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Manage Users</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((u) => (
                    <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={getAvatarUrl(u)} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setRoleDropdown(roleDropdown === u._id ? null : u._id)}
                            className="flex items-center gap-1 text-sm capitalize text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors"
                          >
                            {u.role} <HiChevronDown className="w-4 h-4" />
                          </button>
                          {roleDropdown === u._id && (
                            <div className="absolute z-10 top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden min-w-[120px]">
                              {ROLES.map((r) => (
                                <button
                                  key={r}
                                  onClick={() => changeRole(u._id, r)}
                                  className={`block w-full px-4 py-2 text-sm text-left capitalize hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${r === u.role ? 'font-bold text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`badge text-xs ${u.isSuspended ? 'badge-red' : 'badge-green'}`}>
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleSuspend(u._id, u.isSuspended)}
                          className={`flex items-center gap-1 ml-auto text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            u.isSuspended
                              ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {u.isSuspended ? <><HiCheck className="w-4 h-4" /> Reactivate</> : <><HiBan className="w-4 h-4" /> Suspend</>}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => { setPage(p); load(p, search); }} />
        </>
      )}
    </div>
  );
}
