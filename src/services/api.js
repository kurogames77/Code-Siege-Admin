import supabase from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('admin_auth_token');

export const setToken = (token) => {
    if (token) {
        localStorage.setItem('admin_auth_token', token);
    } else {
        localStorage.removeItem('admin_auth_token');
    }
};

const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        error.status = response.status;
        throw error;
    }

    return data;
};

export const authAPI = {
    login: async (email, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, expected_role: 'admin' }),
        });
        if (data.session?.access_token) {
            setToken(data.session.access_token);
        }
        return data;
    },

    getMe: async () => {
        return apiRequest('/auth/me');
    },

    logout: async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } finally {
            setToken(null);
        }
    },
};

export const instructorAPI = {
    getStats: async () => {
        return apiRequest('/instructor/stats');
    },

    getUsers: async (page = 1, limit = 20, search = '') => {
        return apiRequest(`/instructor/users?page=${page}&limit=${limit}&search=${search}`);
    },

    banUser: async (userId, isBanned) => {
        return apiRequest(`/instructor/users/${userId}/ban`, {
            method: 'PATCH',
            body: JSON.stringify({ is_banned: isBanned }),
        });
    },

    changeRole: async (userId, role) => {
        return apiRequest(`/instructor/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        });
    },

    deleteUser: async (userId) => {
        return apiRequest(`/instructor/users/${userId}`, {
            method: 'DELETE',
        });
    },

    updateUser: async (userId, updates) => {
        return apiRequest(`/instructor/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    },

    // Student Codes Management
    getStudentCodes: async (page = 1, limit = 20, search = '') => {
        return apiRequest(`/instructor/student-codes?page=${page}&limit=${limit}&search=${search}`);
    },

    uploadStudentCodes: async (codes) => {
        return apiRequest('/instructor/student-codes/upload', {
            method: 'POST',
            body: JSON.stringify({ codes }),
        });
    },

    deleteStudentCode: async (codeId) => {
        return apiRequest(`/instructor/student-codes/${codeId}`, {
            method: 'DELETE',
        });
    },

    // Application Management
    getApplications: async (status = 'pending') => {
        return apiRequest(`/instructor/applications?status=${status}`);
    },

    approveApplication: async (applicationId) => {
        return apiRequest(`/instructor/applications/${applicationId}/approve`, {
            method: 'POST',
        });
    },

    rejectApplication: async (applicationId, reason = '') => {
        return apiRequest(`/instructor/applications/${applicationId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },

    // Shop management
    addShopItem: async (item) => {
        return apiRequest('/instructor/shop', {
            method: 'POST',
            body: JSON.stringify(item),
        });
    },

    updateShopItem: async (itemId, item) => {
        return apiRequest(`/instructor/shop/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify(item),
        });
    },

    deleteShopItem: async (itemId) => {
        return apiRequest(`/instructor/shop/${itemId}`, {
            method: 'DELETE',
        });
    },

    // Certificates
    getCertificates: async (page = 1, limit = 20) => {
        return apiRequest(`/instructor/certificates?page=${page}&limit=${limit}`);
    },

    revokeCertificate: async (certId) => {
        return apiRequest(`/instructor/certificates/${certId}`, {
            method: 'DELETE',
        });
    },

    // Battles
    getBattles: async (page = 1, limit = 20) => {
        return apiRequest(`/instructor/battles?page=${page}&limit=${limit}`);
    },

    // Courses
    getCourses: async () => {
        return apiRequest('/instructor/courses');
    },

    saveCourse: async (course) => {
        return apiRequest('/instructor/courses', {
            method: 'POST',
            body: JSON.stringify(course),
        });
    },

    deleteCourse: async (courseId) => {
        return apiRequest(`/instructor/courses/${courseId}`, {
            method: 'DELETE',
        });
    },

    saveLevels: async (courseId, levels, mode, difficulty) => {
        return apiRequest(`/instructor/courses/${courseId}/levels`, {
            method: 'POST',
            body: JSON.stringify({ levels, mode, difficulty }),
        });
    },

    updateLevel: async (levelId, updates) => {
        return apiRequest(`/instructor/courses/levels/${levelId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    },

    // Get system logs
    getLogs: async (page = 1, limit = 50, filter = 'ALL') => {
        let query = supabase
            .from('system_logs')
            .select('*', { count: 'exact' });

        if (filter !== 'ALL') {
            query = query.eq('level', filter);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return {
            logs: data,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    },
};

export default {
    instructor: instructorAPI,
};
