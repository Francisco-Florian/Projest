import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
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
    updateTask,
    // --- NOUVEL IMPORT pour renommer les colonnes ---
    updateColumn,
} from '../api/api';
import '../style/project.scss';
import NavMenu from '../components/navMenu';
import HeaderBoard from '../components/headerBoard';
import { Helmet } from 'react-helmet';

import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    rectIntersection,
    DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    horizontalListSortingStrategy
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

const PLACEHOLDER_TASK_ID = 'task-placeholder';
const PLACEHOLDER_COLUMN_ID = 'column-placeholder';

function isTaskPlaceholder(item) {
    return item && item.id === PLACEHOLDER_TASK_ID;
}

function isColumnPlaceholder(item) {
    return item && item.id === PLACEHOLDER_COLUMN_ID;
}

// Affichage d'une tâche ou d'un placeholder de tâche
function TaskView({ task, isPlaceholder, onEditTask, onDeleteTask }) {
    const style = isPlaceholder ? { 
        border: '2px dashed #ccc', 
        background: '#fff', 
        padding: '10px', 
        borderRadius: '5px', 
        marginBottom: '10px', 
        opacity: 0.6,
        maxWidth:'200px'
    } : {
        marginBottom: '10px',
        background: '#fff',
        borderRadius: '5px',
        boxShadow:'0 2px 4px rgba(0,0,0,0.1)',
        padding: '10px',
        display:'flex',
        justifyContent:'space-between',
    };

    const buttonsContainerStyle = {
        display: 'flex',
        gap: '10px',
        marginTop: '5px'
    };

    const editButtonStyle = {
        border:'none',
        background:'transparent',
        cursor:'pointer',
        color:'#a21bca'
    };

    const deleteButtonStyle = {
        border:'none',
        background:'transparent',
        cursor:'pointer',
        color:'#e74c3c'
    };

    return (
        <div className="task-card" style={style}>
            {!isPlaceholder && task?.taskName && (
                <>
                    {task.taskName}
                    <div className='task-buttons' style={buttonsContainerStyle}>
                        <button
                            className="edit-task-button"
                            aria-label="Edit task"
                            onClick={() => onEditTask(task)}
                            style={editButtonStyle}
                        >
                            <i className="fa-solid fa-pen" />
                        </button>
                        <button
                            className="delete-task-button"
                            aria-label="Delete task"
                            onClick={() => onDeleteTask(task)}
                            style={deleteButtonStyle}
                        >
                            <i className="fas fa-trash" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

TaskView.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.any,
        taskName: PropTypes.string
    }),
    isPlaceholder: PropTypes.bool,
    onEditTask: PropTypes.func,
    onDeleteTask: PropTypes.func
};

TaskView.defaultProps = {
    task: { id: null, taskName: '' },
    isPlaceholder: false,
    onEditTask: () => {},
    onDeleteTask: () => {}
};

// Tâches déplaçables
function SortableTask({ task, activeId, onEditTask, onDeleteTask }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskView 
                task={task}
                isPlaceholder={false}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
            />
        </div>
    );
}

SortableTask.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.any.isRequired,
        taskName: PropTypes.string
    }).isRequired,
    activeId: PropTypes.any,
    onEditTask: PropTypes.func,
    onDeleteTask: PropTypes.func
};

SortableTask.defaultProps = {
    activeId: null,
    onEditTask: () => {},
    onDeleteTask: () => {}
};

// Affichage d'une colonne ou d'un placeholder de colonne
function ColumnView({ column, isPlaceholder, children }) {
    const style = isPlaceholder ? {
        border: '2px dashed #ccc',
        background: '#f0f0f0',
        borderRadius:'10px',
        padding:'15px',
        opacity:0.6,
        minWidth:'250px'
    } : {
        background: '#f0f0f0',
        borderRadius: '10px',
        padding:'15px',
        minWidth:'250px'
    };

    return (
        <div className="kanban-column" style={style}>
            <div className="column-header">
                {!isPlaceholder && column?.taskColumnName && <h3>{column.taskColumnName}</h3>}
                {children}
            </div>
        </div>
    );
}

ColumnView.propTypes = {
    column: PropTypes.shape({
        id: PropTypes.any,
        taskColumnName: PropTypes.string,
        tasks: PropTypes.arrayOf(PropTypes.object)
    }).isRequired,
    isPlaceholder: PropTypes.bool,
    children: PropTypes.node
};

ColumnView.defaultProps = {
    isPlaceholder: false,
    children: null
};

// Colonnes déplaçables si ce n'est pas un placeholder
function SortableColumn({ column, isPlaceholder, children }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        display:'flex',flexDirection:'column'
    };

    return (
       <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          <ColumnView column={column} isPlaceholder={isPlaceholder}>
             {children}
          </ColumnView>
       </div>
    );
}

SortableColumn.propTypes = {
    column: PropTypes.shape({
        id: PropTypes.any.isRequired,
        taskColumnName: PropTypes.string,
        tasks: PropTypes.arrayOf(PropTypes.object)
    }).isRequired,
    isPlaceholder: PropTypes.bool,
    children: PropTypes.node
};

SortableColumn.defaultProps = {
    isPlaceholder: false,
    children: null
};

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
    const [taskDescription, setTaskDescription] = useState('');
    const [taskDeadline, setTaskDeadline] = useState('');
    const [modalError, setModalError] = useState('');
    const [pageError, setPageError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [activeId, setActiveId] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);

    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // ÉTAT ET FONCTION POUR LE BURGER MENU
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        const verifyTokenAndUser = async () => {
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                await verifyToken(token);
            } catch (err) {
                console.error('Erreur vérification token:', err);
                setToken(null);
                navigate('/login');
            }
        };

        verifyTokenAndUser();
    }, [token, navigate, setToken]);

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

                const columnsWithTasks = await Promise.all(
                    columnsData.columns.map(async (column) => {
                        const tasksData = await fetchTasks(projectId, column.id, token);
                        return { ...column, tasks: tasksData.tasks || [] };
                    })
                );

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

    // --- NOUVELLE FONCTION POUR METTRE À JOUR UNE COLONNE (rename) ---
    const handleUpdateColumn = async () => {
        try {
            if (!activeColumn) {
                throw new Error('No column selected');
            }

            const columnData = {
                taskColumnName: newItem.trim(),
            };

            await updateColumn(projectId, token, activeColumn, columnData);

            const updatedColumns = await fetchProjectColumns(projectId, token);
            const columnsWithTasks = await Promise.all(
                updatedColumns.columns.map(async (col) => {
                    const tasksData = await fetchTasks(projectId, col.id, token);
                    return { ...col, tasks: tasksData.tasks || [] };
                })
            );

            setColumns(columnsWithTasks);
            closeModal();
        } catch (error) {
            console.error('Error updating column:', error);
            setModalError(error.message);
        }
    };

    const handleCreateTask = async () => {
        const taskData = {
            taskName: newItem.trim(),
            columnId: activeColumn,
            projectId,
        };

        if (!taskData.taskName || !taskData.columnId) {
            setModalError('Task name and column ID are required.');
            return;
        }

        try {
            await createTask(projectId, activeColumn, token, taskData);
            const updatedTasks = await fetchTasks(projectId, activeColumn, token);
            setColumns((prevColumns) =>
                prevColumns.map((column) =>
                    column.id === activeColumn
                        ? { ...column, tasks: updatedTasks.tasks || [] }
                        : column
                )
            );
            setNewItem('');
            closeModal();
        } catch (error) {
            console.error('Error creating task:', error);
            setModalError(error.message);
        }
    };

    const handleCreateColumn = async () => {
        const columnData = { taskColumnName: newItem.trim() };

        try {
            await createColumn(projectId, token, columnData);
            const updatedColumns = await fetchProjectColumns(projectId, token);

            const columnsWithTasks = await Promise.all(
                updatedColumns.columns.map(async (column) => {
                    const tasksData = await fetchTasks(projectId, column.id, token);
                    return { ...column, tasks: tasksData.tasks || [] };
                })
            );

            setColumns(columnsWithTasks);
            closeModal();
        } catch (error) {
            console.error('Error creating column:', error);
            setModalError(error.message);
        }
    };

    const handleNewItemSubmit = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        if (modalType === 'task') {
            await handleCreateTask();
        } else if (modalType === 'column') {
            await handleCreateColumn();
        }
        // Si d’autres cas (à voir), on peut les gérer ici
    };

    const handleDeleteColumn = async () => {
        try {
            if (modalType === 'column') {
                await deleteColumn(projectId, token, activeColumn);
                const updatedColumns = await fetchProjectColumns(projectId, token);

                const columnsWithTasks = await Promise.all(
                    updatedColumns.columns.map(async (column) => {
                        const tasksData = await fetchTasks(projectId, column.id, token);
                        return { ...column, tasks: tasksData.tasks || [] };
                    })
                );

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
            await deleteTask(projectId, activeColumn, activeTask, token);
            const updatedColumns = columns.map((column) => {
                if (column.id !== activeColumn) {
                    return column;
                }
                const updatedTasks = column.tasks.filter((task) => task.id !== activeTask);
                return { ...column, tasks: updatedTasks };
            });
            setColumns(updatedColumns);
            closeModal();
        } catch (error) {
            console.error('Error deleting task:', error);
            setModalError('Failed to delete task. Please try again.');
        }
    };

    const handleUpdateTask = async () => {
        try {
            if (!activeColumn) {
                throw new Error('No column selected');
            }
            if (!activeTask) {
                throw new Error('No task selected');
            }

            const currentColumn = columns.find((column) =>
                column.tasks.some((task) => task.id === activeTask)
            );

            if (!currentColumn) {
                console.error('Column not found for task:', activeTask);
                setModalError('Column not found for task');
                return;
            }

            const currentTask = currentColumn.tasks.find((task) => task.id === activeTask);

            if (!currentTask) {
                console.error('Task not found:', activeTask);
                setModalError('Task not found');
                return;
            }

            const newTaskOrder =
                activeColumn !== currentColumn.id
                    ? columns.find((col) => col.id === activeColumn)?.tasks.length + 1
                    : currentTask.taskOrder;

            const taskData = {
                ...currentTask,
                taskName: newItem.trim() || currentTask.taskName,
                description: taskDescription || currentTask.description,
                taskDeadline: taskDeadline || currentTask.taskDeadline,
                columnId: activeColumn,
                taskOrder: newTaskOrder,
            };

            await updateTask(projectId, currentColumn.id, activeTask, token, taskData);

            const updatedColumns = updateColumnsAfterTaskUpdate(columns, currentColumn.id, taskData);
            setColumns(updatedColumns);

            resetTaskForm();
        } catch (error) {
            console.error('Error updating task:', error);
            setModalError(error.message);
        }
    };

    const updateColumnsAfterTaskUpdate = (columns, originalColumnId, updatedTaskData) => {
        return columns.map((column) => {
            if (column.id === originalColumnId) {
                if (updatedTaskData.columnId === originalColumnId) {
                    return {
                        ...column,
                        tasks: column.tasks.map((task) =>
                            task.id === updatedTaskData.id ? { ...task, ...updatedTaskData } : task
                        ),
                    };
                }
                return {
                    ...column,
                    tasks: column.tasks.filter((task) => task.id !== updatedTaskData.id),
                };
            }

            if (column.id === updatedTaskData.columnId) {
                return {
                    ...column,
                    tasks: [...column.tasks, updatedTaskData],
                };
            }

            return column;
        });
    };

    const resetTaskForm = () => {
        setNewItem('');
        setTaskDescription('');
        setTaskDeadline('');
        setActiveColumn('');
        setActiveTask('');
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setNewItem('');
        setModalError('');
    };

    function getDraggedItem(id) {
        if (id === PLACEHOLDER_TASK_ID || id === PLACEHOLDER_COLUMN_ID) return null;
        const col = columns.find((c) => c.id === id);
        if (col) return {...col};
        const task = columns.flatMap((col) => col.tasks).find(t => t.id === id);
        return task ? {...task} : null;
    }

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        const item = getDraggedItem(active.id);
        setDraggedItem(item);

        if (item?.taskName) {
            // Tâche
            const newColumns = [...columns];
            for (const c of newColumns) {
                const idx = c.tasks.findIndex(t => t.id === active.id);
                if (idx !== -1) {
                    c.tasks.splice(idx, 1, {id:PLACEHOLDER_TASK_ID});
                    break;
                }
            }
            setColumns(newColumns);
        }
    };

    const handleDragOver = (event) => {
        // Laisse vide si tu n'as pas de logique spéciale
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!draggedItem) return;

        const item = draggedItem;
        const newColumns = [...columns];

        // Retirer le placeholder
        for (let c of newColumns) {
            c.tasks = c.tasks.filter(t => t.id !== PLACEHOLDER_TASK_ID);
        }

        if (!over) {
            // Pas de destination : on remet la tâche dans la première colonne
            if (item.taskName) {
                newColumns[0].tasks.push(item);
            }
            setDraggedItem(null);
            setColumns(newColumns);
            return;
        }

        const overId = over.id;
        const columnIds = columns.map(c => c.id);
        const taskIds = columns.flatMap(c => c.tasks.map(t=>t.id));

        if (item.taskName) {
            // Tâche
            if (taskIds.includes(overId)) {
                // Dépose sur une autre tâche
                const toColIndex = newColumns.findIndex(col=>col.tasks.some(t=>t.id===overId));
                const toTaskIndex = newColumns[toColIndex].tasks.findIndex(t=>t.id===overId);
                newColumns[toColIndex].tasks.splice(toTaskIndex,0,item);
            } else if (columnIds.includes(overId)) {
                // Dépose sur une colonne vide
                const toColIndex = newColumns.findIndex(col=>col.id===overId);
                newColumns[toColIndex].tasks.push(item);
            } else {
                // Rien de précis, on remet la tâche dans la première colonne
                newColumns[0].tasks.push(item);
            }
        }

        setDraggedItem(null);
        setColumns(newColumns);
    };

    const renderDragOverlay = () => {
        if (!activeId || !draggedItem) return null;
        const item = draggedItem;
        if (item.taskColumnName) {
            // Colonne: pas d'overlay pour l'instant
            return null;
        } else if (item.taskName) {
            // Tâche: même apparence que TaskView
            return (
                <div className="drag-overlay">
                    <TaskView
                        task={item}
                        isPlaceholder={false}
                        onEditTask={()=>{}}
                        onDeleteTask={()=>{}}
                    />
                </div>
            );
        }
        return null;
    };

    if (isLoading) return <div className="loading">Loading...</div>;
    if (pageError) return <div className="error-message">{pageError}</div>;
    if (!project) return <div className="not-found">Project not found</div>;

    return (
        <div className="project-page">
            <Helmet>
                <title>Projest - {project?.projectName}</title>
                <meta
                    name="description"
                    content={`Organisez les tâches du projet "${project?.name}" avec Projest, une solution collaborative.`}
                />
            </Helmet>
            <HeaderBoard />
            <main id="projectMain">
                <button 
                    className="burger-menu"
                    onClick={toggleMenu}
                    aria-label="Menu mobile"
                >
                    <i className="fas fa-bars" />
                </button>

                <div className={`project-nav ${menuOpen ? 'open' : ''}`}>
                    <NavMenu />
                </div>

                <section className="project-content">
                    <h2>{project?.name}</h2>
                    <p>{project?.description}</p>
                    <button
                        onClick={() => {
                            setModalType('column');
                            setIsModalOpen(true);
                        }}
                        className="add-column-button"
                    >
                        Add a column
                    </button>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onDragCancel={() => {setActiveId(null); setDraggedItem(null);}}
                    >
                        <SortableContext
                            items={columns.map((col) => col.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            <div className="kanban-board">
                                {columns?.map((column) => {
                                    const isPlaceholder = isColumnPlaceholder(column);

                                    if (isPlaceholder) {
                                        return (
                                            <ColumnView column={column} isPlaceholder={true} key={column.id}>
                                                <div></div>
                                                <SortableContext
                                                    items={column.tasks.map((task) => task.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="kanban-tasks">
                                                        {column.tasks?.map((task) => {
                                                            if (isTaskPlaceholder(task)) {
                                                                return <TaskView key={task.id} task={{taskName:''}} isPlaceholder={true} onEditTask={()=>{}} onDeleteTask={()=>{}} />;
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </SortableContext>
                                            </ColumnView>
                                        );
                                    } else {
                                        return (
                                            <SortableColumn column={column} isPlaceholder={false} key={column.id}>
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
                                                    
                                                    {/* --- NOUVEAU BOUTON POUR RENOMMER LA COLONNE --- */}
                                                    <button
                                                        className="rename-column-button"
                                                        onClick={() => {
                                                            setModalType('columnEdit');
                                                            setActiveColumn(column.id);
                                                            setNewItem(column.taskColumnName);
                                                            setIsModalOpen(true);
                                                        }}
                                                        aria-label={`Rename ${column.taskColumnName}`}
                                                        style={{ position: 'absolute', top: '10px', right: '70px' }}
                                                    >
                                                        <i className="fa-regular fa-pen-to-square" />
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

                                                <SortableContext
                                                    items={column.tasks.map((task) => task.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="kanban-tasks">
                                                        {column.tasks?.map((task) => {
                                                            if (isTaskPlaceholder(task)) {
                                                                return <TaskView key={task.id} task={{taskName:''}} isPlaceholder={true} onEditTask={()=>{}} onDeleteTask={()=>{}} />;
                                                            }
                                                            return (
                                                                <SortableTask
                                                                    key={task.id}
                                                                    task={task}
                                                                    activeId={activeId}
                                                                    onEditTask={(taskToEdit) => {
                                                                        setIsModalOpen(true);
                                                                        setModalType('taskEdit');
                                                                        setActiveColumn(column.id);
                                                                        setActiveTask(taskToEdit.id);
                                                                        setNewItem(taskToEdit.taskName);
                                                                        setTaskDescription(taskToEdit.description);
                                                                        setTaskDeadline(taskToEdit.taskDeadline);
                                                                    }}
                                                                    onDeleteTask={(taskToDelete) => {
                                                                        setIsDeleteModalOpen(true);
                                                                        setModalType('task');
                                                                        setActiveColumn(column.id);
                                                                        setActiveTask(taskToDelete.id);
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </SortableContext>
                                            </SortableColumn>
                                        );
                                    }
                                })}
                            </div>
                        </SortableContext>
                        <DragOverlay>
                            {renderDragOverlay()}
                        </DragOverlay>
                    </DndContext>
                </section>
            </main>

            {/* --- MODALES EXISTANTES --- */}
            {isModalOpen && modalType !== 'taskEdit' && modalType !== 'columnEdit' && (
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
                                        handleDeleteTask();
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

            {/* --- NOUVELLE MODALE POUR RENOMMER LA COLONNE --- */}
            {isModalOpen && modalType === 'columnEdit' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Rename Column</h3>
                        {modalError && <div className="modal-error">{modalError}</div>}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateColumn();
                            }}
                            className="new-item-form"
                        >
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Enter the new column name"
                                className="new-item-input"
                            />
                            <button type="submit" className="new-item-button">
                                Update Column
                            </button>
                        </form>
                        <button onClick={closeModal} className="close-modal-button">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* --- MODALE POUR ÉDITER UNE TÂCHE --- */}
            {isModalOpen && modalType === 'taskEdit' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Task</h3>
                        {modalError && <div className="modal-error">{modalError}</div>}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateTask();
                            }}
                            className="new-item-form"
                        >
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Enter the updated task name"
                                className="new-item-input"
                            />
                            <textarea
                                rows={10}
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="Enter the updated description"
                                className="new-item-input"
                            />
                            <input
                                type="date"
                                value={taskDeadline}
                                onChange={(e) => setTaskDeadline(e.target.value)}
                                className="new-item-input"
                            />
                            <select
                                value={activeColumn}
                                onChange={(e) => setActiveColumn(parseInt(e.target.value, 10))}
                                className="column-select"
                            >
                                {columns.map((column) => (
                                    <option key={column.id} value={column.id}>
                                        {column.taskColumnName}
                                    </option>
                                ))}
                            </select>

                            <button type="submit" className="new-item-button">
                                Update Task
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
