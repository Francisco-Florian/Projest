import { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import UserDropdown from '../components/UserDropdown';
import useAuthStore from '../stores/authStore';
import '../style/project.scss';

export default function ProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [columns, setColumns] = useState({});
    const [newItem, setNewItem] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [activeColumn, setActiveColumn] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const logOut = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const fetchProjectData = useCallback(async () => {
        if (!token || !projectId) {
            console.log("Token ou ProjectId manquant:", { token, projectId });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/project/${projectId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                setToken(null);
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data || !data.project) {
                throw new Error('Project data is missing');
            }

            setProject(data.project);
            setColumns(data.columns || {
                'todo': { title: 'To Do', items: [] },
                'doing': { title: 'Doing', items: [] },
                'done': { title: 'Done', items: [] }
            });
        } catch (error) {
            console.error('Error fetching project data:', error);
            setErrorMessage('Failed to load project data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [token, projectId, navigate, setToken]);

    const verifyTokenAndUser = useCallback(async () => {
        if (!token) {
            console.log("No token found, redirecting to login");
            navigate('/login');
            return;
        }

        if (!projectId) {
            setErrorMessage('Project ID is missing');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Verification failed');
            }

            await response.json();
            await fetchProjectData();
        } catch (err) {
            console.error("Error verifying user:", err);
            setToken(null);
            navigate('/login');
        }
    }, [token, navigate, setToken, fetchProjectData, projectId]);

    useEffect(() => {
        if (!projectId) {
            setErrorMessage('Project ID is missing');
            setIsLoading(false);
            return;
        }
        verifyTokenAndUser();
    }, [verifyTokenAndUser, projectId]);

    const handleNewItemSubmit = async (e) => {
        e.preventDefault();
        if (newItem.trim() === '') return;

        try {
            const endpoint = modalType === 'task' 
                ? `http://localhost:3000/api/project/${projectId}/task`
                : `http://localhost:3000/api/project/${projectId}/column`;

            const body = modalType === 'task'
                ? { content: newItem.trim(), columnId: activeColumn }
                : { title: newItem.trim() };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.status === 401) {
                setToken(null);
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to create new item');
            }

            await fetchProjectData();
            setNewItem('');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating new item:', error);
            setErrorMessage('Failed to create new item. Please try again.');
        }
    };

    const handleNewItemChange = (e) => {
        setNewItem(e.target.value);
    };

    const openModal = (type, columnId = '') => {
        setModalType(type);
        setActiveColumn(columnId);
        setIsModalOpen(true);
        setErrorMessage(''); // Reset error message when opening modal
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewItem(''); // Reset input when closing modal
        setErrorMessage('');
    };

    const handleLogOut = (e) => {
        e.preventDefault();
        logOut();
        navigate('/login');
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (errorMessage) {
        return <div className="error-message">{errorMessage}</div>;
    }

    if (!project) {
        return <div className="not-found">Project not found</div>;
    }

    return (
        <div className="project-page">
            <header id="projectHeader">
                <NavLink to="/">
                    <img src="/Icone.jpeg" alt="Logo" />
                    <h1>Projest</h1>
                </NavLink>
                <ul id="logged">
                    <li>
                        <button aria-label="Notifications">
                            <i className="fa-solid fa-bell notification" />
                        </button>
                    </li>
                    <li><UserDropdown onLogout={handleLogOut} /></li>
                </ul>
            </header>
            <main id="projectMain">
                <nav className="project-nav">
                    <ul>
                        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                        <li><NavLink to="/projectList" className="active">Projects</NavLink></li>
                        <li><NavLink to="/activities">Activity</NavLink></li>
                        <li><NavLink to="/teams">Teams</NavLink></li>
                    </ul>
                    <ul>
                        <li><NavLink to="/settings">Settings</NavLink></li>
                    </ul>
                </nav>
                <section className="project-content">
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                    <button onClick={() => openModal('column')} className="add-column-button">
                        Ajouter une colonne
                    </button>
                    <div className="kanban-board">
                        {Object.entries(columns).map(([columnId, column]) => (
                            <div className="kanban-column" key={columnId}>
                                <h3>{column.title}</h3>
                                <button 
                                    onClick={() => openModal('task', columnId)} 
                                    className="add-task-button"
                                    aria-label={`Add task to ${column.title}`}
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                                <div className="kanban-tasks">
                                    {column.items.map((item) => (
                                        <div key={item.id} className="task-card">
                                            {item.content}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>
                            {modalType === 'task' 
                                ? 'Ajouter une nouvelle tâche' 
                                : 'Ajouter une nouvelle colonne'
                            }
                        </h3>
                        <form onSubmit={handleNewItemSubmit} className="new-item-form">
                            <input
                                type="text"
                                value={newItem}
                                onChange={handleNewItemChange}
                                placeholder={modalType === 'task' 
                                    ? 'Entrez une nouvelle tâche' 
                                    : 'Entrez le nom de la colonne'
                                }
                                className="new-item-input"
                            />
                            <button type="submit" className="new-item-button">
                                Ajouter
                            </button>
                        </form>
                        <button onClick={closeModal} className="close-modal-button">
                            Fermer
                        </button>
                        {errorMessage && <div className="modal-error">{errorMessage}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}