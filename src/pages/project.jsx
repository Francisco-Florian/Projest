import { useState, useEffect, useRef } from 'react';
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
  updateTask,
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
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PLACEHOLDER_TASK_ID = 'task-placeholder';
const PLACEHOLDER_COLUMN_ID = 'column-placeholder';

// Helpers pour identifier les placeholders
function isTaskPlaceholder(item) {
  return item && item.id === PLACEHOLDER_TASK_ID;
}
function isColumnPlaceholder(item) {
  return item && item.id === PLACEHOLDER_COLUMN_ID;
}

// -------------------- TaskView --------------------
function TaskView({
  task = { id: null, taskName: '' },
  isPlaceholder = false,
  onEditTask = () => {},
  onDeleteTask = () => {},
}) {
  const taskCardClass = `task-card ${isPlaceholder ? 'placeholder' : 'normal'}`;
  return (
    <div className={taskCardClass}>
      {!isPlaceholder && task?.taskName && (
        <>
          {task.taskName}
          <div className="task-buttons">
            <button
              className="edit-task-button"
              aria-label="Edit task"
              onClick={() => onEditTask(task)}
            >
              <i className="fa-solid fa-pen" />
            </button>
            <button
              className="delete-task-button"
              aria-label="Delete task"
              onClick={() => onDeleteTask(task)}
            >
              <i className="fas fa-trash" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// -------------------- SortableTask --------------------
function SortableTask({
  task,
  activeId = null,
  onEditTask = () => {},
  onDeleteTask = () => {},
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });
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

// -------------------- ColumnView --------------------
function ColumnView({
  column = { id: null, taskColumnName: '', tasks: [] },
  isPlaceholder = false,
  children = null,
}) {
  const columnClass = `kanban-column ${isPlaceholder ? 'placeholder' : ''}`;
  return (
    <div className={columnClass}>
      <div className="column-header">
        {!isPlaceholder && column?.taskColumnName && <h3>{column.taskColumnName}</h3>}
        {children}
      </div>
    </div>
  );
}

// -------------------- SortableColumn --------------------
function SortableColumn({ column, isPlaceholder = false, children = null }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    display: 'flex',
    flexDirection: 'column',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ColumnView column={column} isPlaceholder={isPlaceholder}>
        {children}
      </ColumnView>
    </div>
  );
}

// -------------------- ProjectPage --------------------
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

  // Pour stocker l'indice original lors du drag d'une colonne
  const draggedIndexRef = useRef(null);

  // --- BURGER MENU ---
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // --- SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 15 } })
  );

  // Vérification du token
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

  // Chargement du projet et de ses colonnes
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
        const columnsData = await fetchProjectColumns(projectId, token);
        const columnsWithTasks = await Promise.all(
          columnsData.columns.map(async (col) => {
            const tasksData = await fetchTasks(projectId, col.id, token);
            return { ...col, tasks: tasksData.tasks || [] };
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

  // ----------------- CRUD FUNCTIONS -----------------

  const handleUpdateColumn = async () => {
    try {
      if (!activeColumn) throw new Error('No column selected');
      const columnData = { taskColumnName: newItem.trim() };
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
      setColumns((prev) =>
        prev.map((col) =>
          col.id === activeColumn
            ? { ...col, tasks: updatedTasks.tasks || [] }
            : col
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
        updatedColumns.columns.map(async (col) => {
          const tasksData = await fetchTasks(projectId, col.id, token);
          return { ...col, tasks: tasksData.tasks || [] };
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
  };

  const handleDeleteColumn = async () => {
    try {
      if (modalType === 'column') {
        await deleteColumn(projectId, token, activeColumn);
        const updatedColumns = await fetchProjectColumns(projectId, token);
        const columnsWithTasks = await Promise.all(
          updatedColumns.columns.map(async (col) => {
            const tasksData = await fetchTasks(projectId, col.id, token);
            return { ...col, tasks: tasksData.tasks || [] };
          })
        );
        setColumns(columnsWithTasks);
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting column:', error);
      setModalError('Failed to delete column. Please try again.');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(projectId, activeColumn, activeTask, token);
      const updatedColumns = columns.map((col) => {
        if (col.id !== activeColumn) return col;
        return { ...col, tasks: col.tasks.filter((task) => task.id !== activeTask) };
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
      if (!activeColumn) throw new Error('No column selected');
      if (!activeTask) throw new Error('No task selected');
      const currentColumn = columns.find((c) => c.tasks.some((t) => t.id === activeTask));
      if (!currentColumn) {
        setModalError('Column not found for task');
        return;
      }
      const currentTask = currentColumn.tasks.find((t) => t.id === activeTask);
      if (!currentTask) {
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
        return { ...column, tasks: column.tasks.filter((task) => task.id !== updatedTaskData.id) };
      }
      if (column.id === updatedTaskData.columnId) {
        return { ...column, tasks: [...column.tasks, updatedTaskData] };
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

  // -------------------- DRAG & DROP --------------------
  function getDraggedItem(id) {
    if (id === PLACEHOLDER_TASK_ID || id === PLACEHOLDER_COLUMN_ID) return null;
    const col = columns.find((c) => c.id === id);
    if (col) return { ...col };
    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === id);
    return task ? { ...task } : null;
  }

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    const item = getDraggedItem(active.id);
    setDraggedItem(item);
    // Si c'est une tâche, insérer un placeholder dans la colonne
    if (item?.taskName) {
      const newCols = [...columns];
      for (const c of newCols) {
        const idx = c.tasks.findIndex((t) => t.id === active.id);
        if (idx !== -1) {
          c.tasks.splice(idx, 1, { id: PLACEHOLDER_TASK_ID });
          break;
        }
      }
      setColumns(newCols);
    }
    // Si c'est une colonne, stocker l'indice d'origine et insérer un placeholder (avec tasks: [])
    else if (item?.taskColumnName) {
        const newCols = [...columns];
        const fromIndex = newCols.findIndex((c) => c.id === active.id);
        if (fromIndex !== -1) {
          // Stocker l'indice d'origine
          draggedIndexRef.current = fromIndex;
          newCols.splice(fromIndex, 1, { id: PLACEHOLDER_COLUMN_ID, tasks: [] });
        }
        setColumns(newCols);
      }
    };
  
    const handleDragOver = (event) => {
      // Optionnel, pas de logique spéciale ici
    };
  
    const handleDragEnd = async (event) => {
      const { active, over } = event;
      setActiveId(null);
      if (!draggedItem) return;
      const item = draggedItem;
      const newCols = [...columns];
      // Retirer les placeholders dans les tâches
      newCols.forEach((c) => {
        c.tasks = c.tasks.filter((t) => t.id !== PLACEHOLDER_TASK_ID);
      });
      // Retirer le placeholder de colonne s'il existe
      const placeholderIndex = newCols.findIndex((c) => c.id === PLACEHOLDER_COLUMN_ID);
      if (placeholderIndex !== -1) {
        newCols.splice(placeholderIndex, 1);
      }
      if (!over) {
        // Si aucune cible n'est trouvée, pour une tâche on la remet dans la première colonne
        if (item.taskName) {
          newCols[0].tasks.push(item);
        }
        // Pour une colonne, on réinsère à l'indice d'origine
        else if (item.taskColumnName) {
          if (draggedIndexRef.current !== null) {
            newCols.splice(draggedIndexRef.current, 0, item);
          } else {
            newCols.push(item);
          }
        }
        setDraggedItem(null);
        setColumns(newCols);
        draggedIndexRef.current = null;
        return;
      }
      const overId = over.id;
      // Si on drop sur soi-même, annuler
      if (overId === item.id) {
        setDraggedItem(null);
        setColumns(newCols);
        draggedIndexRef.current = null;
        return;
      }
      const columnIds = newCols.map((c) => c.id);
      const taskIds = newCols.flatMap((c) => c.tasks.map((t) => t.id));
      // CAS 1 : On déplace une COLONNE
      if (item.taskColumnName) {
        // On utilise la cible obtenue via overId
        const toIndex = newCols.findIndex((c) => c.id === overId);
        let newIndex = toIndex === -1 ? newCols.length : toIndex;
        // Insérer la colonne draggée à la nouvelle position
        newCols.splice(newIndex, 0, item);
        // Réassigner les positions (1, 2, 3, ...)
        newCols.forEach((col, i) => {
          col.taskColumnPosition = i + 1;
        });
        setDraggedItem(null);
        setColumns(newCols);
        // Persister la nouvelle position de chaque colonne en base
        for (const col of newCols) {
          try {
            await updateColumn(projectId, token, col.id, {
              taskColumnName: col.taskColumnName,
              taskColumnPosition: col.taskColumnPosition,
            });
          } catch (err) {
            console.error('Error updating column position:', err);
          }
        }
        draggedIndexRef.current = null;
      }
      // CAS 2 : On déplace une TÂCHE
      else if (item.taskName) {
        if (taskIds.includes(overId)) {
          const toColIndex = newCols.findIndex((c) =>
            c.tasks.some((t) => t.id === overId)
          );
          const toTaskIndex = newCols[toColIndex].tasks.findIndex(
            (t) => t.id === overId
          );
          newCols[toColIndex].tasks.splice(toTaskIndex, 0, item);
        } else if (columnIds.includes(overId)) {
          const toColIndex = newCols.findIndex((c) => c.id === overId);
          newCols[toColIndex].tasks.push(item);
        } else {
          newCols[0].tasks.push(item);
        }
  
        // Mettre à jour taskOrder et columnId de la tâche déplacée
        const updatedTaskData = {
          ...item,
          columnId: newCols.find((c) => c.tasks.some((t) => t.id === item.id))?.id,
          taskOrder: newCols.find((c) => c.tasks.some((t) => t.id === item.id))?.tasks.findIndex((t) => t.id === item.id) + 1,
        };
  
        try {
          await updateTask(projectId, item.columnId, item.id, token, updatedTaskData);
        } catch (error) {
          console.error('Error updating task:', error);
        }
  
        setDraggedItem(null);
        setColumns(newCols);
      }
    };
  
    const renderDragOverlay = () => {
      if (!activeId || !draggedItem) return null;
      const item = draggedItem;
      if (item.taskColumnName) {
        return null; // Pas d'overlay pour une colonne
      } else if (item.taskName) {
        return (
          <div className="drag-overlay">
            <TaskView task={item} isPlaceholder={false} />
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
          <button className="burger-menu" onClick={toggleMenu} aria-label="Menu mobile">
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
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={() => {
                setActiveId(null);
                setDraggedItem(null);
              }}
            >
              <SortableContext
                items={columns.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="kanban-board">
                  {columns.map((column) => {
                    const isPlaceHolderCol = isColumnPlaceholder(column);
                    if (isPlaceHolderCol) {
                      return (
                        <ColumnView key={column.id} column={column} isPlaceholder>
                          <SortableContext
                            items={column.tasks.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="kanban-tasks">
                              {column.tasks.map((t) => {
                                if (isTaskPlaceholder(t)) {
                                  return <TaskView key={t.id} task={{}} isPlaceholder />;
                                }
                                return null;
                              })}
                            </div>
                          </SortableContext>
                        </ColumnView>
                      );
                    } else {
                      return (
                        <SortableColumn key={column.id} column={column} isPlaceholder={false}>
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
                              className="rename-column-button"
                              onClick={() => {
                                setModalType('columnEdit');
                                setActiveColumn(column.id);
                                setNewItem(column.taskColumnName);
                                setIsModalOpen(true);
                              }}
                              aria-label={`Rename ${column.taskColumnName}`}
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
                            items={column.tasks.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="kanban-tasks">
                              {column.tasks.map((task) => {
                                if (isTaskPlaceholder(task)) {
                                  return <TaskView key={task.id} task={{}} isPlaceholder />;
                                }
                                return <SortableTask key={task.id} task={task} />;
                              })}
                            </div>
                          </SortableContext>
                        </SortableColumn>
                      );
                    }
                  })}
                </div>
              </SortableContext>
              <DragOverlay>{renderDragOverlay()}</DragOverlay>
            </DndContext>
          </section>
        </main>
        {/* Modales : Add/rename/delete (inchangées) */}
        {isModalOpen && modalType !== 'taskEdit' && modalType !== 'columnEdit' && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{modalType === 'task' ? 'Add a new task' : 'Add a new column'}</h3>
              {modalError && <div className="modal-error">{modalError}</div>}
              <form onSubmit={handleNewItemSubmit} className="new-item-form">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder={modalType === 'task' ? 'Enter a new task' : 'Enter the column name'}
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
          <div className="confirmDeleteModal">
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Confirm deletion</h3>
                <p>
                  Are you sure you want to delete this {modalType === 'task' ? 'task' : 'column'}?
                </p>
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