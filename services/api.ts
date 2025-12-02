
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

// --- Helpers de Conversão (CamelCase <-> SnakeCase) ---

// Converte chaves de um objeto para snake_case (para enviar ao Django)
const toSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc: any, key) => {
            // Convert camelCase to snake_case
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            acc[snakeKey] = toSnakeCase(obj[key]);
            
            // SPECIAL CASE: The Django ViewSets (ProjectViewSet, ApplicationViewSet) 
            // manually look for 'professorId', 'studentId', etc. in request.data using .get('professorId').
            // So we MUST preserve the camelCase version for these specific ID fields.
            if (key.endsWith('Id')) {
                acc[key] = obj[key];
            }
            return acc;
        }, {});
    }
    return obj;
};

// Converte chaves de um objeto para camelCase (para usar no React)
const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc: any, key) => {
            // Convert snake_case to camelCase
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
};

export const api = {
    // Health Check
    checkHealth: async (): Promise<boolean> => {
        try {
            // Tenta buscar a lista de usuários apenas para ver se o servidor responde
            const response = await fetch(`${API_BASE}/users/`, { method: 'GET', headers: getHeaders() });
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
            const data = await response.json();
            return toCamelCase(data);
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
            const payload = toSnakeCase(userData);
            const response = await fetch(url, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    const errorMessage = errorData.detail || Object.entries(errorData).map(([key, val]) => `${key}: ${val}`).join(', ') || 'Signup failed';
                    throw new Error(errorMessage);
                } catch (e: any) {
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
            }
            const data = await response.json();
            return toCamelCase(data);
        } catch (error: any) {
             console.error('[API Error]', error);
             if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('Sem conexão com o servidor. Verifique se o backend está online.');
            }
            throw error;
        }
    },

    updateProfile: async (userId: string, data: any): Promise<User> => {
        const payload = toSnakeCase(data);
        const response = await fetch(`${API_BASE}/users/${userId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Update failed');
        const dataRes = await response.json();
        return toCamelCase(dataRes);
    },

    getUser: async (userId: string): Promise<User> => {
        const response = await fetch(`${API_BASE}/users/${userId}/`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Fetch user failed');
        const data = await response.json();
        return toCamelCase(data);
    },
    
    getAllUsers: async (): Promise<User[]> => {
        try {
            const response = await fetch(`${API_BASE}/users/`, {
                headers: getHeaders(),
            });
            if (!response.ok) return [];
            const data = await response.json();
            return toCamelCase(data);
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
            const data = await response.json();
            return toCamelCase(data);
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    createProject: async (projectData: any): Promise<Project> => {
        const payload = toSnakeCase(projectData);
        // Explicitly ensure camelCase IDs are present if toSnakeCase modified them or if structure needs it
        // (toSnakeCase logic above preserves keys ending in Id, so this is just safety)
        if (projectData.professorId) payload.professorId = projectData.professorId;

        const response = await fetch(`${API_BASE}/projects/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Create project failed');
        const data = await response.json();
        return toCamelCase(data);
    },

    updateProject: async (projectId: string, projectData: any): Promise<Project> => {
        const payload = toSnakeCase(projectData);
        const response = await fetch(`${API_BASE}/projects/${projectId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Update project failed');
        const data = await response.json();
        return toCamelCase(data);
    },

    // Applications
    getApplications: async (): Promise<Application[]> => {
        try {
            const response = await fetch(`${API_BASE}/applications/`, {
                headers: getHeaders(),
            });
            if (!response.ok) return [];
            const data = await response.json();
            return toCamelCase(data);
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    createApplication: async (appData: any): Promise<Application> => {
        const payload = toSnakeCase(appData);
        // Preserve IDs for ViewSet logic
        if (appData.studentId) payload.studentId = appData.studentId;
        if (appData.projectId) payload.projectId = appData.projectId;
        if (appData.professorId) payload.professorId = appData.professorId;

        const response = await fetch(`${API_BASE}/applications/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Application failed');
        const data = await response.json();
        return toCamelCase(data);
    },

    updateApplication: async (appId: string, data: any): Promise<Application> => {
        const payload = toSnakeCase(data);
        const response = await fetch(`${API_BASE}/applications/${appId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Update application failed');
        const dataRes = await response.json();
        return toCamelCase(dataRes);
    },

    deleteApplication: async (appId: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/applications/${appId}/`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Delete failed');
    }
};
