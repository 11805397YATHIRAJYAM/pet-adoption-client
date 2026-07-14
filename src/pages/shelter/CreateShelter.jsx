import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HiOfficeBuilding } from 'react-icons/hi';
import { shelterAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Shelter name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone required'),
  description: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street required'),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    zipCode: z.string().min(1, 'Zip required'),
  }),
  website: z.string().url().optional().or(z.literal('')),
  licenseNumber: z.string().optional(),
});

export default function CreateShelter() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (typeof v === 'object') formData.append(k, JSON.stringify(v));
        else if (v) formData.append(k, v);
      });
      if (logoFile) formData.append('logo', logoFile);

      await shelterAPI.create(formData);
      toast.success('Shelter created! Pending admin approval.');
      navigate('/shelter');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shelter');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
          <HiOfficeBuilding className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="page-title">Create Shelter</h1>
          <p className="text-gray-500 dark:text-gray-400">Register your shelter on PetAdopt</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo */}
          <div>
            <label className="label">Shelter Logo (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="block text-sm text-gray-500" />
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label">Shelter Name *</label>
              <input {...register('name')} className="input" placeholder="Happy Paws Shelter" />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input {...register('email')} type="email" className="input" />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone *</label>
              <input {...register('phone')} className="input" placeholder="(555) 000-0000" />
              {errors.phone && <p className="error-text">{errors.phone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea {...register('description')} rows={3} className="input resize-none" placeholder="About your shelter..." />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Street *</label>
                <input {...register('address.street')} className="input" />
                {errors.address?.street && <p className="error-text">{errors.address.street.message}</p>}
              </div>
              <div>
                <label className="label">City *</label>
                <input {...register('address.city')} className="input" />
                {errors.address?.city && <p className="error-text">{errors.address.city.message}</p>}
              </div>
              <div>
                <label className="label">State *</label>
                <input {...register('address.state')} className="input" />
                {errors.address?.state && <p className="error-text">{errors.address.state.message}</p>}
              </div>
              <div>
                <label className="label">Zip Code *</label>
                <input {...register('address.zipCode')} className="input" />
                {errors.address?.zipCode && <p className="error-text">{errors.address.zipCode.message}</p>}
              </div>
            </div>
          </div>

          {/* Other */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Website</label>
              <input {...register('website')} type="url" className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="label">License Number</label>
              <input {...register('licenseNumber')} className="input" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 p-4 rounded-xl text-sm">
            Your shelter will require admin approval before you can add pets.
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {submitting ? <><LoadingSpinner size="sm" /> Creating...</> : 'Create Shelter'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
