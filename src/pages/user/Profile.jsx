import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HiCamera, HiShieldCheck } from 'react-icons/hi';
import { userAPI, authAPI } from '../../services/api';
import { setUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAvatarUrl } from '../../utils/helpers';

const profileSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      address: user?.address || {},
    },
  });

  const { register: pwReg, handleSubmit: pwSubmit, formState: { errors: pwErrors }, reset: pwReset } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onProfileSubmit = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.phone) formData.append('phone', values.phone);
      if (values.bio) formData.append('bio', values.bio);
      if (values.address) formData.append('address', JSON.stringify(values.address));
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await userAPI.updateProfile(formData);
      dispatch(setUser(data.user));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onPasswordSubmit = async (values) => {
    try {
      setSubmitting(true);
      await authAPI.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success('Password changed!');
      pwReset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
      <h1 className="page-title mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={avatarPreview || getAvatarUrl(user)}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900"
              />
              <label className="absolute bottom-0 right-0 p-1.5 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                <HiCamera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              {user?.isEmailVerified && (
                <span className="flex items-center gap-1 text-green-600 text-sm mt-1">
                  <HiShieldCheck className="w-4 h-4" /> Email verified
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Full Name</label>
                <input {...register('name')} className="input" />
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...register('phone')} className="input" placeholder="(555) 000-0000" />
              </div>
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea {...register('bio')} rows={3} className="input resize-none" placeholder="Tell us about yourself..." />
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white pt-2">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="label">Street</label>
                <input {...register('address.street')} className="input" />
              </div>
              <div>
                <label className="label">City</label>
                <input {...register('address.city')} className="input" />
              </div>
              <div>
                <label className="label">State</label>
                <input {...register('address.state')} className="input" />
              </div>
              <div>
                <label className="label">Zip Code</label>
                <input {...register('address.zipCode')} className="input" />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'password' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8">
          <h2 className="section-title mb-6">Change Password</h2>
          <form onSubmit={pwSubmit(onPasswordSubmit)} className="space-y-5">
            <div>
              <label className="label">Current Password</label>
              <input {...pwReg('currentPassword')} type="password" className="input" />
              {pwErrors.currentPassword && <p className="error-text">{pwErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input {...pwReg('newPassword')} type="password" className="input" />
              {pwErrors.newPassword && <p className="error-text">{pwErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input {...pwReg('confirmPassword')} type="password" className="input" />
              {pwErrors.confirmPassword && <p className="error-text">{pwErrors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <><LoadingSpinner size="sm" /> Changing...</> : 'Change Password'}
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8">
          <h2 className="section-title mb-6">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Verification</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              {user?.isEmailVerified ? (
                <span className="badge badge-green">Verified</span>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await authAPI.resendVerification();
                      toast.success('Verification email sent!');
                    } catch {}
                  }}
                  className="btn-primary text-sm py-1.5"
                >
                  Verify Email
                </button>
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Account Role</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
