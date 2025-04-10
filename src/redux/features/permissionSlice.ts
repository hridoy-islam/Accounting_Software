import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

interface Permission {
  _id: string;
  name: string;
  description?: string;
}

interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: PermissionState = {
  permissions: [],
  loading: false,
  error: null,
};

export const fetchPermissions = createAsyncThunk(
    'permissions/fetchPermissions',
    async (companyId: string, thunkAPI) => {
      try {
        const response = await axiosInstance.get(`/permissions/${companyId}`);
      
        const permissions = response.data.data.result[0].permissions;
        return permissions;
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || 'Failed to fetch permissions'
        );
      }
    }
  );
  

// Permission slice
const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload; 
        state.error = null;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.permissions = [];
        state.error = action.payload as string;
      });
  },
});

export default permissionSlice.reducer;
