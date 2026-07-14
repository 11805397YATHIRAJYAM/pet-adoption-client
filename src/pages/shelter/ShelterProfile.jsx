import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { shelterAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ShelterProfile() {
  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    shelterAPI.getMy().then(({ data }) => {
      setShelter(data.shelter);
      reset({
        name: data.shelter.name,
        email: data.shelter.email,
        phone: data.shelter.phone,
        description: data.shelter.description || '',
        website: data.shelter.website || '',
        'address.street': data.shelter.address?.street || '',
        'address.city': data.shelter.address?.city || '',
        'address.state': data.shelter.address?.state || '',
        'address.zipCode': data.shelter.address?.zipCode || '',
      });
    }).catch(() => toast.error('Failed to load shelter')).finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (logoFile) formData.append('logo', logoFile);
      const { data } = await shelterAPI.update(shelter._id, formData);
      setShelter(data.shelter);
      toast.success('Shelter updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <h1 className="page-title mb-8">Shelter Profile</h1>
      {shelter?.logo?.url && (
        <div className="mb-6 flex items-center gap-4">
          <img src={shelter.logo.url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{shelter.name}</p>
            <span className={`badge ${shelter.isApproved ? 'badge-green' : 'badge-orange'}`}>
              {shelter.isApproved ? 'Approved' : 'Pending Approval'}
            </span>
          </div>
        </div>
      )}

      <div className="card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Update Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="text-sm text-gray-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Shelter Name</label>
              <input {...register('name')} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea {...register('description')} rows={3} className="input resize-none" />
            </div>
            <div className="col-span-2">
              <label className="label">Website</label>
              <input {...register('website')} type="url" className="input" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Street</label><input {...register('address.street')} className="input" /></div>
            <div><label className="label">City</label><input {...register('address.city')} className="input" /></div>
            <div><label className="label">State</label><input {...register('address.state')} className="input" /></div>
            <div><label className="label">Zip</label><input {...register('address.zipCode')} className="input" /></div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
