import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { fetchProjectData, createTask, createColumn, verifyToken } from '../api/api';
import '../style/project.scss';
import NavMenu from '../components/navMenu';
import HeaderBoard from '../components/headerBoard';
import { Helmet } from 'react-helmet';

export default function ProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [columns, setColumns] = useState({});
    const [newItem, setNewItem] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [activeColumn, setActiveColumn] = useState('');
    const [modalError, setModalError] = useState('');
    const [pageError, setPageError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    // Vérification du token utilisateur
    useEffect(() => {
        const verifyTokenAndUser = async () => {
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                await verifyToken(token);
            } catch (err) {
                console.error("Erreur lors de la vérification de l'utilisateur:", err);
                setToken(null);
                navigate('/login');
            }
        };

        verifyTokenAndUser();
    }, [token, navigate, setToken]);

    // Chargement des données du projet
    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) {
                setPageError('Project ID is missing');
                setIsLoading(false);
                return;
            }

            try {
                const data = await fetchProjectData(projectId, token);
                setProject(data.project);
                setColumns(data.columns);
            } catch (error) {
                console.error('Error loading project data:', error);
                setPageError('Failed to load project data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProject();
    }, [projectId, token]);

    const handleCreateTask = async () => {
        const taskData = {
            content: newItem.trim(),
            columnId: activeColumn,
        };
        await createTask(projectId, token, taskData);
    };

    const handleCreateColumn = async () => {
        const columnData = {
            title: newItem.trim(),
        };
        await createColumn(projectId, token, columnData);
    };

    // Gestion de la soumission des nouveaux éléments
    const handleNewItemSubmit = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        try {
            if (modalType === 'task') {
                await handleCreateTask();
            } else if (modalType === 'column') {
                await handleCreateColumn();
            }

            const data = await fetchProjectData(projectId, token);
            setProject(data.project);
            setColumns(data.columns);
            closeModal();
        } catch (error) {
            console.error('Error creating new item:', error);
            setModalError(error.message);
        }
    };

    // Gestion de la fermeture de la modale
    const closeModal = () => {
        setIsModalOpen(false);
        setNewItem('');
        setModalError('');
    };


    // Affichage des erreurs ou des états
    if (isLoading) return <div className="loading">Loading...</div>;
    if (pageError) return <div className="error-message">{pageError}</div>;
    if (!project) return <div className="not-found">Project not found</div>;

    return (
        <div className="project-page">
            <Helmet>
                <title>Projest - {project.projectName}</title>
                <meta
                    name="description"
                    content={`Organisez les tâches du projet "${project.name}" avec Projest, une solution collaborative pour une gestion efficace.`}
                />
            </Helmet>
            <HeaderBoard />
            <main id="projectMain">
                <NavMenu />
                <section className="project-content">
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                    <button
                        onClick={() => {
                            setModalType('column');
                            setIsModalOpen(true);
                        }}
                        className="add-column-button"
                    >
                        Add a column
                    </button>
                    <div className="kanban-board">
                        {Object.entries(columns).map(([columnId, column]) => (
                            <div className="kanban-column" key={columnId}>
                                <h3>{column.title}</h3>
                                <button
                                    onClick={() => {
                                        setModalType('task');
                                        setActiveColumn(columnId);
                                        setIsModalOpen(true);
                                    }}
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {modalType === 'task' ? 'Add a new task' : 'Add a new column'}
                        </h3>
                        {modalError && <div className="modal-error">{modalError}</div>}
                        <form onSubmit={handleNewItemSubmit} className="new-item-form">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder={
                                    modalType === 'task'
                                        ? 'Enter a new task'
                                        : 'Enter the column name'
                                }
                                className="new-item-input"
                            />
                            <button type="submit" className="new-item-button">
                                Add
                            </button>
                        </form>
                        <button onClick={closeModal} className="close-modal-button">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
