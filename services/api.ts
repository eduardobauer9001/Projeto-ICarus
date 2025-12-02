
import { User, Project, Application, Student, Professor } from '../types';

const API_URL = 'http://localhost:8000/api';

// Helper to handle headers (including auth token if we implement token-based auth later)
const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
    };
};

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<User> => {
        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Login failed');
        return await response.json();
    },

    signup: async (userData: any): Promise<User> => {
        const response = await fetch(`${API_URL}/users/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Signup failed');
        }
        return await response.json();
    },

    updateProfile: async (userId: string, data: any): Promise<User> => {
        const response = await fetch(`${API_URL}/users/${userId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Update failed');
        return await response.json();
    },

    getUser: async (userId: string): Promise<User> => {
        const response = await fetch(`${API_URL}/users/${userId}/`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Fetch user failed');
        return await response.json();
    },
    
    getAllUsers: async (): Promise<User[]> => {
        const response = await fetch(`${API_URL}/users/`, {
            headers: getHeaders(),
        });
        if (!response.ok) return [];
        return await response.json();
    },

    // Projects
    getProjects: async (): Promise<Project[]> => {
        const response = await fetch(`${API_URL}/projects/`, {
            headers: getHeaders(),
        });
        if (!response.ok) return [];
        return await response.json();
    },

    createProject: async (projectData: any): Promise<Project> => {
        const response = await fetch(`${API_URL}/projects/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Create project failed');
        return await response.json();
    },

    updateProject: async (projectId: string, projectData: any): Promise<Project> => {
        const response = await fetch(`${API_URL}/projects/${projectId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Update project failed');
        return await response.json();
    },

    // Applications
    getApplications: async (): Promise<Application[]> => {
        const response = await fetch(`${API_URL}/applications/`, {
            headers: getHeaders(),
        });
        if (!response.ok) return [];
        return await response.json();
    },

    createApplication: async (appData: any): Promise<Application> => {
        const response = await fetch(`${API_URL}/applications/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(appData),
        });
        if (!response.ok) throw new Error('Application failed');
        return await response.json();
    },

    updateApplication: async (appId: string, data: any): Promise<Application> => {
        const response = await fetch(`${API_URL}/applications/${appId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Update application failed');
        return await response.json();
    },

    deleteApplication: async (appId: string): Promise<void> => {
        const response = await fetch(`${API_URL}/applications/${appId}/`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Delete failed');
    }
};
