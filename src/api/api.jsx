const API_URL = 'https://projest-back.vercel.app/api';
// const API_URL = 'http://localhost:3000/api';

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
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Retourner le message et le champ concerné
            const error = new Error(data.message);
            error.field = data.field;
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message, field: error.field };
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

// Suppression de projet

export const deleteProject = async (projectId, token) => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
    }

    return response.json();
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

// fetch des tasks

export const fetchTasks = async (projectId, idColumn, token) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/columns/${idColumn}/tasks`, {
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

export const createTask = async (projectId, idColumn, token, taskData) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/columns/${idColumn}/tasks`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create new column');
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


// Mise à jour d'une colonne
export const updateColumn = async (projectId, token, columnId, columnData) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/columns/${columnId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(columnData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update column');
    }

    return response.json();
};


// suppression de tâche

export const deleteTask = async (projectId, columnId, taskId, token) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/columns/${columnId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
    }

    return response.json();
};


// Met à jour une tâche spécifique
export const updateTask = async (projectId, columnId, taskId, token, taskData) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/columns/${columnId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
    }

    return response.json();
};



// envoi d'email de réinitialisation de mot de passe
export const sendForgotPasswordEmail = async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send password reset email');
    }

    return response.json();
};

// réinitialisation du mot de passe
export const resetPassword = async (token, email, newPassword) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, newPassword }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
    }

    return response.json();
};


