import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { petAPI } from '../../services/api';

export const fetchPets = createAsyncThunk(
  'pets/fetchPets',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await petAPI.getAll(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pets');
    }
  }
);

const petSlice = createSlice({
  name: 'pets',
  initialState: {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    filters: {
      species: '',
      gender: '',
      size: '',
      breed: '',
      vaccinated: '',
      sort: 'newest',
      page: 1,
      limit: 12,
    },
    selectedPet: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    resetFilters: (state) => {
      state.filters = { species: '', gender: '', size: '', breed: '', vaccinated: '', sort: 'newest', page: 1, limit: 12 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    setSelectedPet: (state, action) => {
      state.selectedPet = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, setPage, setSelectedPet } = petSlice.actions;
export default petSlice.reducer;
