import { createSlice, createAsyncThunk, buildCreateSlice } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

export const loginUser = createAsyncThunk(
    '/auth/login', 
    async ({ username, password }, { rejectWithValue }) => {
        try {
            await axiosInstance.post('/auth/login', { username, password }, { withCredentials: true });
            const response = await axiosInstance.get('/users/me', { withCredentials: true });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка входа');
        }
    }
);

export const registerUser = createAsyncThunk('/auth/register', async (formData, { rejectWithValue }) => {
    try {
        await axiosInstance.post('/auth/register', formData, { withCredentials: true });
        const response = await axiosInstance.get('/users/me', { withCredentials: true });
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Ошибка регистрации');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null
    },
    redusers: {},
    estraReducers: (builder) => {
        builder 
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerUser.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
              state.loading = false;
              state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            });
    }
});

export default authSlice.reducer;