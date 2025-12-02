
import { User, Project, Application, Student, Professor } from '../types';

// Agora usamos a URL do Render como padrão se não houver variável de ambiente
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://icarus-api.onrender.com/api';

// Helper to handle headers
const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
    };
};

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<User> => {
        console.log(`Tentando login em: ${API_BASE}/login/`);
        const response = await fetch(`${API_BASE}/login/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Login failed');
        return await response.json();
    },

    signup: async (userData: any): Promise<User> => {
        console.log(`Tentando cadastro em: ${API_BASE}/users/`, userData);
        const response = await fetch(`${API_BASE}/users/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            try {
                const errorData = await response.json();
                // Django DRF validation errors usually come as { field: [errors] }
                // We flatten them to a string to show to the user
                const errorMessage = errorData.detail || Object.values(errorData).flat().join(', ') || 'Signup failed';
                throw new Error(errorMessage);
            } catch (e: any) {
                throw new Error(e.message || 'Signup failed');
            }
        }
        return await response.json();
    },

    updateProfile: async (userId: string, data: any): Promise<User> => {
        const response = await fetch(`${API_BASE}/users/${userId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Update failed');
        return await response.json();
    },

    getUser: async (userId: string): Promise<User> => {
        const response = await fetch(`${API_BASE}/users/${userId}/`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Fetch user failed');
        return await response.json();
    },
    
    getAllUsers: async (): Promise<User[]> => {
        const response = await fetch(`${API_BASE}/users/`, {
            headers: getHeaders(),
        });
        if (!response.ok) return [];
        return await response.json();
    },

    // Projects
    getProjects: async (): Promise<Project[]> => {
        const response = await fetch(`${API_BASE}/projects/`, {
            headers: getHeaders(),
        });
        if (!response.ok) return [];
        return await response.json();
    },

    createProject: async (projectData: any): Promise<Project> => {
        const response = await fetch(`${API_BASE}/projects/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Create project failed');
        return await response.json();
    },

    updateProject: async (projectId: string, projectData: any): Promise<Project> => {
        const response = await fetch(`${API_BASE}/projects/${projectId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Update project failed');
        return await response.json();
    },

    // Applications
    getApplications: async (): Promise<Application[]> => {
        const response = await fetch(`${API_BASE}/applications/`, {
            headers: getHeaders(),
        });
        if (!response.ok) return [];
        return await response.json();
    },

    createApplication: async (appData: any): Promise<Application> => {
        const response = await fetch(`${API_BASE}/applications/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(appData),
        });
        if (!response.ok) throw new Error('Application failed');
        return await response.json();
    },

    updateApplication: async (appId: string, data: any): Promise<Application> => {
        const response = await fetch(`${API_BASE}/applications/${appId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Update application failed');
        return await response.json();
    },

    deleteApplication: async (appId: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/applications/${appId}/`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Delete failed');
    }
};
