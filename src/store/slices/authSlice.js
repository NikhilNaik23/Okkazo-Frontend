import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8080';

// Async thunk for fetching vendor service categories
export const fetchServiceCategories = createAsyncThunk(
    'auth/fetchServiceCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/vendor/service-categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch service categories');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for refreshing access token
export const refreshAccessToken = createAsyncThunk(
    'auth/refreshAccessToken',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                return rejectWithValue('No refresh token found');
            }

            const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Clear tokens if refresh fails
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return rejectWithValue(data.message || 'Token refresh failed');
            }

            // Store new tokens
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            return data;
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Login failed');
            }

            // Store tokens and role in localStorage
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            if (data.role) {
                localStorage.setItem('userRole', data.role);
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userData.username,
                    email: userData.email,
                    password: userData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for vendor registration
export const registerVendor = createAsyncThunk(
    'auth/registerVendor',
    async (formData, { rejectWithValue }) => {
        try {
            const url = `${API_BASE_URL}/auth/vendor/register`;
            console.log('Submitting vendor registration to:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData, // FormData object with files
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Registration failed:', data);
                // Handle file size error specifically
                if (data.details?.includes('Maximum upload size exceeded') || data.details?.includes('upload size')) {
                    return rejectWithValue('File size too large! Please ensure each file is under 5MB. 📁');
                }
                // Handle routing error
                if (data.details?.includes('No static resource')) {
                    return rejectWithValue('API endpoint not found. Please ensure the backend server is running correctly.');
                }
                return rejectWithValue(data.message || data.details || 'Vendor registration failed');
            }

            return data;
        } catch (error) {
            console.error('Network error during vendor registration:', error);
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for uploading a vendor document
export const uploadVendorDocument = createAsyncThunk(
    'auth/uploadVendorDocument',
    async ({ applicationId, documentType, file, description }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return rejectWithValue('No access token found');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            if (description) formData.append('description', description);

            const response = await fetch(`${API_BASE_URL}/api/vendor/registration/${applicationId}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to upload document');

            // Refresh application data
            dispatch(fetchVendorApplication());
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for fetching vendor application
export const fetchVendorApplication = createAsyncThunk(
    'auth/fetchVendorApplication',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                return rejectWithValue('No access token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/vendor/me/application`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch vendor application');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for fetching current user profile
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                return rejectWithValue('No access token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch user');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                return rejectWithValue('No access token found. Please login.');
            }

            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
                return rejectWithValue(data.message || 'Failed to update profile');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to send reset email');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for reset password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to reset password');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for email verification
export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async ({ token }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Email verification failed');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunk for resend verification email
export const resendVerification = createAsyncThunk(
    'auth/resendVerification',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to resend verification email');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Initial state
const initialState = {
    user: null,
    role: localStorage.getItem('userRole') || null,
    vendorApplication: null,
    vendorApplicationLoading: false,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,
    registerSuccess: false,
    registerMessage: null,
    updateSuccess: false,
    vendorRegisterSuccess: false,
    vendorRegisterMessage: null,
    vendorRegisterData: null,
    serviceCategories: [],
    serviceCategoriesLoading: false,
    serviceCategoriesError: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userRole');
            state.user = null;
            state.role = null;
            state.vendorApplication = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearRegisterSuccess: (state) => {
            state.registerSuccess = false;
            state.registerMessage = null;
        },
        clearVendorRegisterSuccess: (state) => {
            state.vendorRegisterSuccess = false;
            state.vendorRegisterMessage = null;
            state.vendorRegisterData = null;
        },
        clearUpdateSuccess: (state) => {
            state.updateSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Service Categories
            .addCase(fetchServiceCategories.pending, (state) => {
                state.serviceCategoriesLoading = true;
                state.serviceCategoriesError = null;
            })
            .addCase(fetchServiceCategories.fulfilled, (state, action) => {
                state.serviceCategoriesLoading = false;
                state.serviceCategories = action.payload;
                state.serviceCategoriesError = null;
            })
            .addCase(fetchServiceCategories.rejected, (state, action) => {
                state.serviceCategoriesLoading = false;
                state.serviceCategoriesError = action.payload;
            })
            // Refresh Access Token
            .addCase(refreshAccessToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.accessToken = null;
                state.refreshToken = null;
                state.user = null;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.role = action.payload.role;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.registerSuccess = false;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.registerSuccess = true;
                state.registerMessage = action.payload.message;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.registerSuccess = false;
            })
            // Vendor Register
            .addCase(registerVendor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.vendorRegisterSuccess = false;
            })
            .addCase(registerVendor.fulfilled, (state, action) => {
                state.isLoading = false;
                state.vendorRegisterSuccess = true;
                state.vendorRegisterMessage = action.payload.message;
                state.vendorRegisterData = action.payload.data || action.payload;
                state.error = null;
            })
            .addCase(registerVendor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.vendorRegisterSuccess = false;
            })
            // Fetch Current User
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.data;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.user = null;
                // Don't clear authentication - let the user stay logged in
                // Only clear auth if it's a 401 unauthorized error (handled in thunk)
            })
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.updateSuccess = false;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.data || action.payload;
                state.updateSuccess = true;
                state.error = null;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.updateSuccess = false;
            })
            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Verify Email
            .addCase(verifyEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Resend Verification
            .addCase(resendVerification.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resendVerification.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(resendVerification.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Vendor Application
            .addCase(fetchVendorApplication.pending, (state) => {
                state.vendorApplicationLoading = true;
                state.error = null;
            })
            .addCase(fetchVendorApplication.fulfilled, (state, action) => {
                state.vendorApplicationLoading = false;
                state.vendorApplication = action.payload.data || action.payload;
                state.error = null;
            })
            .addCase(fetchVendorApplication.rejected, (state, action) => {
                state.vendorApplicationLoading = false;
                state.error = action.payload;
            })
            // Upload Vendor Document
            .addCase(uploadVendorDocument.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(uploadVendorDocument.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(uploadVendorDocument.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError, clearRegisterSuccess, clearVendorRegisterSuccess, clearUpdateSuccess } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role || state.auth.user?.role || null;
export const selectVendorApplication = (state) => state.auth.vendorApplication;
export const selectVendorApplicationLoading = (state) => state.auth.vendorApplicationLoading;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectRegisterSuccess = (state) => state.auth.registerSuccess;
export const selectRegisterMessage = (state) => state.auth.registerMessage;
export const selectUpdateSuccess = (state) => state.auth.updateSuccess;
export const selectVendorRegisterSuccess = (state) => state.auth.vendorRegisterSuccess;
export const selectVendorRegisterMessage = (state) => state.auth.vendorRegisterMessage;
export const selectVendorRegisterData = (state) => state.auth.vendorRegisterData;
export const selectServiceCategories = (state) => state.auth.serviceCategories;
export const selectServiceCategoriesLoading = (state) => state.auth.serviceCategoriesLoading;
export const selectServiceCategoriesError = (state) => state.auth.serviceCategoriesError;

export default authSlice.reducer;
