// const API_URL = 'https://projest-back.vercel.app/api';
const API_URL = 'http://localhost:3000/api';

// verification du token

export const verifyToken = async (token) => {
    const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },

    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'appel API');
    }
    return response.json();
};

// Connexion

export const login = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        throw new Error(error.message || 'An error occurred during login');
    }
};

// Inscription

export const register = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });

    const data = await response.json();
    if (response.ok) {
        return { success: true, data };
    } else {
        return { success: false, message: data.message };
    }
};


// Appel des projets a la base de données

export const fetchProjects = async (token) => {
    const response = await fetch(`${API_URL}/projects`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération des projets');
    }
    return response.json();
};


// Création de projet

export const createProject = async (token, projectData) => {
    try {
        const response = await fetch(`${API_URL}/projects/create`, {
            method: 'POST',
            body: JSON.stringify(projectData),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const data = await response.json();
            return { error: true, message: data.message || "Error creating project" };
        }

        return await response.json();
    } catch (err) {
        console.error("API error:", err);
        return { error: true, message: "Network error" };
    }
};

// fetch des données du projet

export const fetchProjectData = async (projectId, token) => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const fetchProjectColumns = async (projectId, token) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/columns`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Création de tâche

export const createTask = async (projectId, token, taskData) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/task`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });

    if (!response.ok) {
        throw new Error('Failed to create new task');
    }

    return response.json();
};

// Création de colonne

export const createColumn = async (projectId, token, columnData) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/columns`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(columnData),
    });
    console.log(JSON.stringify(columnData));

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create new column');
    }

    return response.json();
};

// suppression de colonne

export const deleteColumn = async (projectId, token, columnId) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/columns/${columnId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete column');
    }

    return response.json();
};
