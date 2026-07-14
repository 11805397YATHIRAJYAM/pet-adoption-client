import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { petAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newImages, setNewImages] = useState([]);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    petAPI.getById(id).then(({ data }) => {
      setPet(data.pet);
      reset({
        name: data.pet.name,
        species: data.pet.species,
        breed: data.pet.breed || '',
        gender: data.pet.gender,
        description: data.pet.description,
        status: data.pet.status,
        adoptionFeeAmount: data.pet.adoptionFee?.amount || 0,
        vaccinated: data.pet.medicalHistory?.vaccinated || false,
        neutered: data.pet.medicalHistory?.neutered || false,
      });
    }).catch(() => navigate('/shelter/pets')).finally(() => setLoading(false));
  }, [id, navigate, reset]);

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (k === 'vaccinated' || k === 'neutered') return;
        if (v !== undefined && v !== '') formData.append(k, v);
      });
      formData.append('medicalHistory', JSON.stringify({
        vaccinated: values.vaccinated,
        neutered: values.neutered,
        ...pet.medicalHistory,
      }));
      if (values.adoptionFeeAmount !== undefined) {
        formData.append('adoptionFee', JSON.stringify({ amount: values.adoptionFeeAmount }));
      }
      newImages.forEach((img) => formData.append('images', img));

      await petAPI.update(id, formData);
      toast.success('Pet updated!');
      navigate('/shelter/pets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <h1 className="page-title mb-8">Edit Pet — {pet?.name}</h1>
      <div className="card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input {...register('name')} className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="adopted">Adopted</option>
                <option value="fostered">Fostered</option>
                <option value="hold">On Hold</option>
              </select>
            </div>
            <div>
              <label className="label">Species</label>
              <select {...register('species')} className="input">
                {['dog','cat','bird','rabbit','hamster','guinea_pig','reptile','fish','other'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gender</label>
              <select {...register('gender')} className="input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="label">Breed</label>
              <input {...register('breed')} className="input" />
            </div>
            <div>
              <label className="label">Adoption Fee ($)</label>
              <input {...register('adoptionFeeAmount')} type="number" min="0" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={4} className="input resize-none" />
          </div>

          <div className="flex gap-5">
            {[['vaccinated','Vaccinated'],['neutered','Neutered/Spayed']].map(([k,l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register(k)} className="w-4 h-4" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{l}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="label">Add More Photos</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setNewImages(Array.from(e.target.files))} className="text-sm text-gray-500" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
