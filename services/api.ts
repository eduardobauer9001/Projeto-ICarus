import { User, Project, Application, Student, Professor } from '../types';

// Detect URL from environment or default to Render
let rawUrl = (import.meta as any).env?.VITE_API_URL || 'https://icarus-api.onrender.com/api';

// 1. Remove trailing slash if present (e.g., ".../api/" -> ".../api")
if (rawUrl.endsWith('/')) {
    rawUrl = rawUrl.slice(0, -1);
}

// 2. Ensure it ends with /api (e.g., "...onrender.com" -> "...onrender.com/api")
// This prevents 404 errors if the user forgot to add /api in Vercel env vars or config
if (!rawUrl.endsWith('/api')) {
    rawUrl += '/api';
}

const API_BASE = rawUrl;

// Helper to handle headers
const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ...' // If we implement JWT later
    };
};

export const api = {
    // Health Check
    checkHealth: async (): Promise<boolean> => {
        try {
            // Tenta buscar a lista de usuários apenas para ver se o servidor responde
            // Um HEAD request é mais leve, mas nem todos backends suportam bem em rotas DRF, 
            // então usamos GET com limit ou apenas tratamos o erro.
            const response = await fetch(`${API_BASE}/users/`, { method: 'GET', headers: getHeaders() });
            
            // Se der 200 (OK), 401 (Não autorizado), 403 (Proibido) -> O servidor existe e respondeu.
            // Se der "Failed to fetch" (Network Error) -> O servidor está morto.
            return response.status >= 200 && response.status < 500;
        } catch (e) {
            return false;
        }
    },

    // Auth
    login: async (email: string, password: string): Promise<User> => {
        const url = `${API_BASE}/login/`;
        console.log(`[API] Login request to: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                if (response.status === 400 || response.status === 401) throw new Error('Credenciais inválidas');
                throw new Error(`Erro do servidor: ${response.status}`);
            }
            return await response.json();
        } catch (error: any) {
            console.error('[API Error]', error);
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('Sem conexão com o servidor. O backend no Render pode estar desligado.');
            }
            throw error;
        }
    },

    signup: async (userData: any): Promise<User> => {
        const url = `${API_BASE}/users/`;
        console.log(`[API] Signup request to: ${url}`, userData);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(userData),
            });
            
            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    // Django DRF validation errors usually come as { field: [errors] }
                    // We flatten them to a string to show to the user
                    const errorMessage = errorData.detail || Object.entries(errorData).map(([key, val]) => `${key}: ${val}`).join(', ') || 'Signup failed';
                    throw new Error(errorMessage);
                } catch (e: any) {
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
            }
            return await response.json();
        } catch (error: any) {
             console.error('[API Error]', error);
             if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('Sem conexão com o servidor. Verifique se o backend está online.');
            }
            throw error;
        }
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
        try {
            const response = await fetch(`${API_BASE}/users/`, {
                headers: getHeaders(),
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    // Projects
    getProjects: async (): Promise<Project[]> => {
        try {
            const response = await fetch(`${API_BASE}/projects/`, {
                headers: getHeaders(),
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (e) {
            console.error(e);
            return [];
        }
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
        try {
            const response = await fetch(`${API_BASE}/applications/`, {
                headers: getHeaders(),
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (e) {
            console.error(e);
            return [];
        }
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