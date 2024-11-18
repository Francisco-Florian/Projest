const API_URL = 'https://projest-back.vercel.app/api';

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
    const response = await fetch(`${API_URL}/project`, {
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
        const response = await fetch(`${API_URL}/project/create`, {
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