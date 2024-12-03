import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import {
    fetchProjectData,
    createTask,
    createColumn,
    verifyToken,
    fetchProjectColumns,
    deleteColumn,
    fetchTasks,
    deleteTask,
} from '../api/api';
import '../style/project.scss';
import NavMenu from '../components/navMenu';
import HeaderBoard from '../components/headerBoard';
import { Helmet } from 'react-helmet';

export default function ProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [columns, setColumns] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [activeColumn, setActiveColumn] = useState('');
    const [activeTask, setActiveTask] = useState('');
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
                console.error('Erreur lors de la vérification de l’utilisateur:', err);
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
                let columnsData = await fetchProjectColumns(projectId, token);

                // Logique de `fetchTasksForColumns`
                const columnsWithTasks = await Promise.all(columnsData.columns.map(async (column) => {
                    const tasksData = await fetchTasks(projectId, column.id, token);
                    return { ...column, tasks: tasksData.tasks || [] };
                }));

                setColumns(columnsWithTasks);
            } catch (error) {
                console.error('Error loading project data:', error);
                setPageError('Failed to load project data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProject();
    }, [projectId, token]);


    // Création d'une tâche
    const handleCreateTask = async () => {
        const taskData = {
            taskName: newItem.trim(),
            columnId: activeColumn,
            projectId,
        };

        // Vérifier les données avant d'envoyer la requête
        if (!taskData.taskName || !taskData.columnId) {
            setModalError('Task name and column ID are required.');
            return;
        }

        try {
            // Créer la tâche
            await createTask(projectId, activeColumn, token, taskData);

            // Mettre à jour les tâches de la colonne active
            const updatedTasks = await fetchTasks(projectId, activeColumn, token);
            setColumns((prevColumns) =>
                prevColumns.map((column) =>
                    column.id === activeColumn
                        ? { ...column, tasks: updatedTasks.tasks || [] }
                        : column
                )
            );

            // Réinitialiser l'état et fermer la modale
            setNewItem('');
            closeModal();
        } catch (error) {
            console.error('Error creating task:', error);
            setModalError(error.message);
        }
    };



    // Création d'une colonne
    const handleCreateColumn = async () => {
        const columnData = {
            taskColumnName: newItem.trim(),
        };

        try {
            await createColumn(projectId, token, columnData);
            const updatedColumns = await fetchProjectColumns(projectId, token);
            setColumns(updatedColumns.columns || []);

            const columnsWithTasks = await Promise.all(updatedColumns.columns.map(async (column) => {
                const tasksData = await fetchTasks(projectId, column.id, token);
                return { ...column, tasks: tasksData.tasks || [] };
            }));

            setColumns(columnsWithTasks);
            closeModal();
        } catch (error) {
            console.error('Error creating column:', error);
            setModalError(error.message);
        }
    };

    // Gestion de la soumission des nouveaux éléments
    const handleNewItemSubmit = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        if (modalType === 'task') {
            await handleCreateTask();
        } else if (modalType === 'column') {
            await handleCreateColumn();
        }
    };

    // Gestion de la suppression d'une colonne
    const handleDeleteColumn = async () => {
        try {
            if (modalType === 'column') {
                await deleteColumn(projectId, token, activeColumn);
                const updatedColumns = await fetchProjectColumns(projectId, token);
                setColumns(updatedColumns.columns || []);

                const columnsWithTasks = await Promise.all(updatedColumns.columns.map(async (column) => {
                    const tasksData = await fetchTasks(projectId, column.id, token);
                    return { ...column, tasks: tasksData.tasks || [] };
                }));

                setColumns(columnsWithTasks);
                closeModal();
            }
        } catch (error) {
            if (modalType === 'column') {
                console.error('Error deleting column:', error);
                setModalError('Failed to delete column. Please try again.');
            }
        }
    };

    const handleDeleteTask = async () => {
        try {
            // Utilisez `activeTask` pour supprimer la tâche
            await deleteTask(projectId, activeColumn, activeTask, token);
    
            // Mise à jour des colonnes après suppression de la tâche
            const updatedColumns = columns.map((column) => {
                if (column.id !== activeColumn) {
                    return column;
                }
    
                const updatedTasks = column.tasks.filter((task) => task.id !== activeTask);
                return {
                    ...column,
                    tasks: updatedTasks,
                };
            });
            setColumns(updatedColumns);
            closeModal();
        } catch (error) {
            console.error('Error deleting task:', error);
            setModalError('Failed to delete task. Please try again.');
        }
    };
    

    // Gestion de la fermeture de la modale
    const closeModal = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
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
                        {columns?.map((column) => (
                            <div className="kanban-column" key={column.id}>
                                <div className="column-header">
                                    <h3>{column.taskColumnName}</h3>
                                    <div>
                                        <button
                                            onClick={() => {
                                                setModalType('task');
                                                setActiveColumn(column.id);
                                                setIsModalOpen(true);
                                            }}
                                            className="add-task-button"
                                            aria-label={`Add task to ${column.taskColumnName}`}
                                        >
                                            <i className="fas fa-plus" />
                                        </button>
                                        <button
                                            className="delete-column-button"
                                            aria-label={`Delete ${column.taskColumnName}`}
                                            onClick={() => {
                                                setIsDeleteModalOpen(true);
                                                setModalType('column');
                                                setActiveColumn(column.id);
                                            }}
                                        >
                                            <i className="fas fa-trash" />
                                        </button>
                                    </div>
                                </div>

                                <div className="kanban-tasks">
                                    {column.tasks?.map((task) => (
                                        <div key={task.id} className="task-card">
                                            {task.taskName}
                                            <div className='task-buttons'>
                                                <button
                                                    className="edit-task-button"
                                                    aria-label={`Edit task`}
                                                >
                                                    <i className="fa-solid fa-pen" />
                                                </button>
                                                <button
                                                    className="delete-task-button"
                                                    aria-label={`Delete task`}
                                                    onClick={() => {
                                                        setIsDeleteModalOpen(true);
                                                        setModalType('task');
                                                        setActiveColumn(column.id); // Définit la colonne dans laquelle la tâche se trouve
                                                        setActiveTask(task.id); // Définit la tâche qui doit être supprimée
                                                    }}
                                                >
                                                    <i className="fas fa-trash" />
                                                </button>
                                            </div>

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
            {isDeleteModalOpen && (
                <div className='confirmDeleteModal'>
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Confirm deletion</h3>
                            <p>Are you sure you want to delete this {modalType === 'task' ? 'task' : 'column'}?</p>
                            <button
                                className="delete-modal-button"
                                onClick={() => {
                                    if (modalType === 'column') {
                                        handleDeleteColumn();
                                    } else if (modalType === 'task') {
                                        handleDeleteTask(); // Pas besoin de passer d'arguments ici
                                    }
                                }}
                            >
                                Delete
                            </button>
                            <button className="close-modal-button" onClick={closeModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
