import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { applicationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const schema = z.object({
  reason: z.string().min(50, 'Please write at least 50 characters explaining why you want to adopt'),
  personalInfo: z.object({
    fullName: z.string().min(2, 'Full name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(10, 'Valid phone required'),
    address: z.object({
      street: z.string().min(1, 'Street required'),
      city: z.string().min(1, 'City required'),
      state: z.string().min(1, 'State required'),
      zipCode: z.string().min(1, 'Zip required'),
    }),
  }),
  housingInfo: z.object({
    type: z.string().min(1, 'Housing type required'),
    ownership: z.string().min(1, 'Required'),
    hasYard: z.boolean(),
    allowsPets: z.boolean(),
    numberOfResidents: z.coerce.number().min(1),
  }),
  petExperience: z.object({
    experienceLevel: z.string().min(1, 'Required'),
    hasPetsCurrently: z.boolean(),
    currentPets: z.string().optional(),
  }),
  agreedToTerms: z.boolean().refine((v) => v === true, 'You must agree to the terms'),
});

export default function ApplicationForm({ pet, onSuccess, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register, handleSubmit, formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      housingInfo: { hasYard: false, allowsPets: true, numberOfResidents: 1 },
      petExperience: { hasPetsCurrently: false },
      agreedToTerms: false,
    },
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('pet', pet._id);
      formData.append('reason', values.reason);
      formData.append('personalInfo', JSON.stringify(values.personalInfo));
      formData.append('housingInfo', JSON.stringify(values.housingInfo));
      formData.append('petExperience', JSON.stringify(values.petExperience));
      formData.append('agreedToTerms', values.agreedToTerms);

      const { data } = await applicationAPI.create(formData);
      onSuccess(data.application);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="error-text">{error.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal info */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.personalInfo?.fullName}>
            <input {...register('personalInfo.fullName')} className="input" placeholder="John Smith" />
          </Field>
          <Field label="Email" error={errors.personalInfo?.email}>
            <input {...register('personalInfo.email')} type="email" className="input" />
          </Field>
          <Field label="Phone" error={errors.personalInfo?.phone}>
            <input {...register('personalInfo.phone')} className="input" placeholder="(555) 000-0000" />
          </Field>
          <Field label="Street Address" error={errors.personalInfo?.address?.street}>
            <input {...register('personalInfo.address.street')} className="input" />
          </Field>
          <Field label="City" error={errors.personalInfo?.address?.city}>
            <input {...register('personalInfo.address.city')} className="input" />
          </Field>
          <Field label="State" error={errors.personalInfo?.address?.state}>
            <input {...register('personalInfo.address.state')} className="input" />
          </Field>
          <Field label="Zip Code" error={errors.personalInfo?.address?.zipCode}>
            <input {...register('personalInfo.address.zipCode')} className="input" />
          </Field>
        </div>
      </div>

      {/* Housing */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Housing Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Housing Type" error={errors.housingInfo?.type}>
            <select {...register('housingInfo.type')} className="input">
              <option value="">Select type...</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Ownership" error={errors.housingInfo?.ownership}>
            <select {...register('housingInfo.ownership')} className="input">
              <option value="">Select...</option>
              <option value="own">Own</option>
              <option value="rent">Rent</option>
            </select>
          </Field>
          <Field label="Number of Residents" error={errors.housingInfo?.numberOfResidents}>
            <input {...register('housingInfo.numberOfResidents')} type="number" min="1" className="input" />
          </Field>
        </div>
        <div className="flex gap-6 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('housingInfo.hasYard')} className="w-4 h-4" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Has a yard</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('housingInfo.allowsPets')} className="w-4 h-4" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Pets allowed</span>
          </label>
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pet Experience</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Experience Level" error={errors.petExperience?.experienceLevel}>
            <select {...register('petExperience.experienceLevel')} className="input">
              <option value="">Select...</option>
              <option value="none">None</option>
              <option value="some">Some</option>
              <option value="experienced">Experienced</option>
              <option value="expert">Expert</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input type="checkbox" {...register('petExperience.hasPetsCurrently')} className="w-4 h-4" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Currently have pets</span>
        </label>
      </div>

      {/* Reason */}
      <div>
        <label className="label">Why do you want to adopt {pet.name}? *</label>
        <textarea
          {...register('reason')}
          rows={4}
          className="input resize-none"
          placeholder="Tell us about yourself and why you'd be a great match for this pet..."
        />
        {errors.reason && <p className="error-text">{errors.reason.message}</p>}
      </div>

      {/* Terms */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" {...register('agreedToTerms')} className="w-4 h-4 mt-0.5" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            I agree to the adoption terms and confirm all information provided is accurate.
          </span>
        </label>
        {errors.agreedToTerms && <p className="error-text">{errors.agreedToTerms.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {submitting ? <><LoadingSpinner size="sm" /> Submitting...</> : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}
