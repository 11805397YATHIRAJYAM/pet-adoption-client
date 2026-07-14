import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiUpload, HiX } from 'react-icons/hi';
import { petAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  species: z.string().min(1, 'Species required'),
  breed: z.string().optional(),
  gender: z.string().min(1, 'Gender required'),
  ageValue: z.coerce.number().min(0),
  ageUnit: z.string(),
  size: z.string().optional(),
  description: z.string().min(20, 'Please write at least 20 characters'),
  adoptionFeeAmount: z.coerce.number().min(0).default(0),
  vaccinated: z.boolean().default(false),
  neutered: z.boolean().default(false),
  microchipped: z.boolean().default(false),
  specialNeeds: z.boolean().default(false),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
});

export default function CreatePet() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ageUnit: 'years', adoptionFeeAmount: 0 },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 10));
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('species', values.species);
      if (values.breed) formData.append('breed', values.breed);
      formData.append('gender', values.gender);
      formData.append('age', JSON.stringify({ value: values.ageValue, unit: values.ageUnit }));
      if (values.size) formData.append('size', values.size);
      formData.append('description', values.description);
      formData.append('adoptionFee', JSON.stringify({ amount: values.adoptionFeeAmount }));
      formData.append('medicalHistory', JSON.stringify({
        vaccinated: values.vaccinated,
        neutered: values.neutered,
        microchipped: values.microchipped,
        specialNeeds: values.specialNeeds,
      }));
      if (values.locationCity || values.locationState) {
        formData.append('location', JSON.stringify({ city: values.locationCity, state: values.locationState }));
      }
      images.forEach((img) => formData.append('images', img));

      await petAPI.create(formData);
      toast.success('Pet added successfully!');
      navigate('/shelter/pets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create pet');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, error, children, required }) => (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      {children}
      {error && <p className="error-text">{error.message}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="page-title mb-8">Add New Pet</h1>
      <div className="card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images */}
          <div>
            <label className="label">Photos (up to 10)</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <HiX className="w-3 h-3" />
                  </button>
                  {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">Primary</span>}
                </div>
              ))}
              {images.length < 10 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                  <HiUpload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Add</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Pet Name" error={errors.name} required>
              <input {...register('name')} className="input" placeholder="Buddy" />
            </Field>
            <Field label="Species" error={errors.species} required>
              <select {...register('species')} className="input">
                <option value="">Select species...</option>
                {['dog','cat','bird','rabbit','hamster','guinea_pig','reptile','fish','other'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                ))}
              </select>
            </Field>
            <Field label="Breed">
              <input {...register('breed')} className="input" placeholder="Golden Retriever" />
            </Field>
            <Field label="Gender" error={errors.gender} required>
              <select {...register('gender')} className="input">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>
            <div className="flex gap-2">
              <Field label="Age" error={errors.ageValue} required>
                <input {...register('ageValue')} type="number" min="0" step="0.5" className="input" />
              </Field>
              <div className="w-28 self-end">
                <select {...register('ageUnit')} className="input">
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
            <Field label="Size">
              <select {...register('size')} className="input">
                <option value="">Select...</option>
                {['tiny','small','medium','large','extra_large'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                ))}
              </select>
            </Field>
            <Field label="Adoption Fee ($)">
              <input {...register('adoptionFeeAmount')} type="number" min="0" className="input" />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" error={errors.description} required>
            <textarea {...register('description')} rows={4} className="input resize-none" placeholder="Tell us about this pet's personality, habits, and what makes them special..." />
          </Field>

          {/* Medical */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Medical Information</h3>
            <div className="flex flex-wrap gap-5">
              {[['vaccinated','Vaccinated'],['neutered','Neutered/Spayed'],['microchipped','Microchipped'],['specialNeeds','Special Needs']].map(([k,l]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register(k)} className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{l}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <input {...register('locationCity')} className="input" />
            </Field>
            <Field label="State">
              <input {...register('locationState')} className="input" />
            </Field>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <><LoadingSpinner size="sm" /> Creating...</> : 'Create Pet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
