import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import '../style/project.scss';
import NavMenu from '../components/navMenu';
import HeaderBoard from '../components/headerBoard';

export default function ProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [columns, setColumns] = useState({});
    const [newItem, setNewItem] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [activeColumn, setActiveColumn] = useState('');
    const [modalError, setModalError] = useState('');  // Nouvel état pour les erreurs de modale
    const [pageError, setPageError] = useState('');    // Nouvel état pour les erreurs de page
    const [isLoading, setIsLoading] = useState(true);
    
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    // Authentication verification hook
    useEffect(() => {
        const verifyTokenAndUser = async () => {
            if (!token) {
                navigate('/login');
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
            } catch (err) {
                console.error("Error verifying user:", err);
                setToken(null);
                navigate('/login');
            }
        };
        verifyTokenAndUser();
    }, [token, navigate, setToken]);

    // Project data loading hook
    useEffect(() => {
        if (!projectId) {
            setPageError('Project ID is missing');
            setIsLoading(false);
            return;
        }

        const fetchProjectData = async () => {
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
                if (!data?.project) {
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
                setPageError('Failed to load project data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId, token, navigate, setToken]);

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

            // Refresh project data after successful creation
            const fetchData = async () => {
                try {
                    const projectResponse = await fetch(`http://localhost:3000/api/project/${projectId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!projectResponse.ok) {
                        throw new Error(`HTTP error! status: ${projectResponse.status}`);
                    }

                    const data = await projectResponse.json();
                    if (!data?.project) {
                        throw new Error('Project data is missing');
                    }

                    setProject(data.project);
                    setColumns(data.columns || {
                        'todo': { title: 'To Do', items: [] },
                        'doing': { title: 'Doing', items: [] },
                        'done': { title: 'Done', items: [] }
                    });
                } catch (error) {
                    console.error('Error refreshing project data:', error);
                    setModalError('Failed to refresh project data. Please try again.');
                    return;  // Retourner pour éviter de fermer la modale en cas d'erreur
                }
            };

            await fetchData();
            setNewItem('');
            setModalError('');  // Effacer les erreurs de modale
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating new item:', error);
            setModalError('Failed to create new item. Please try again.');  // Afficher l'erreur dans la modale
        }
    };

    const handleNewItemChange = (e) => {
        setNewItem(e.target.value);
    };

    const openModal = (type, columnId = '') => {
        setModalType(type);
        setActiveColumn(columnId);
        setIsModalOpen(true);
        setModalError('');  // Réinitialiser l'erreur de modale à l'ouverture
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewItem('');
        setModalError('');  // Réinitialiser l'erreur de modale à la fermeture
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (pageError) {  // Utiliser pageError au lieu de errorMessage pour les erreurs de page
        return <div className="error-message">{pageError}</div>;
    }

    if (!project) {
        return <div className="not-found">Project not found</div>;
    }

    return (
        <div className="project-page">
            <HeaderBoard />
            <main id="projectMain">
                <NavMenu />
                <section className="project-content">
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                    <button onClick={() => openModal('column')} className="add-column-button">
                        Add a column
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
                                    <i className="fas fa-plus" />
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
                                ? 'Add a new task' 
                                : 'Add a new column'
                            }
                        </h3>
                        {modalError && (  // Afficher l'erreur de modale au-dessus du formulaire
                            <div className="modal-error">
                                {modalError}
                            </div>
                        )}
                        <form onSubmit={handleNewItemSubmit} className="new-item-form">
                            <input
                                type="text"
                                value={newItem}
                                onChange={handleNewItemChange}
                                placeholder={modalType === 'task' 
                                    ? 'Enter a new task' 
                                    : 'Enter the column name'
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
                    </div>
                </div>
            )}
        </div>
    );
}