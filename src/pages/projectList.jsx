import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/projectList.scss";
import "../style/dropDown.scss";
import useAuthStore from '../stores/authStore';
import NavMenu from "../components/navMenu";
import HeaderBoard from "../components/headerBoard";
import { verifyToken, fetchProjects, deleteProject } from "../api/api";
import { Helmet } from "react-helmet";

export default function ProjectList() {
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activeProject, setActiveProject] = useState(null);

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

    useEffect(() => {
        const initializeData = async () => {
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                await verifyToken(token);
            } catch (err) {
                console.error('Erreur lors de la vérification du token:', err);
                setToken(null);
                navigate('/login');
                return;
            }

            setIsLoading(true);
            try {
                const data = await fetchProjects(token);
                const sortedProjects = data.projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setProjects(sortedProjects);
            } catch (error) {
                console.error('Erreur lors de la récupération des projets:', error);
                setError('Failed to load projects. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        initializeData();
    }, [token, navigate, setToken]);

    const openDeleteModal = (projectId) => {
        setActiveProject(projectId);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsDeleteModalOpen(false);
        setActiveProject(null);
        setError(null);
    };

    const handleDeleteProject = async () => {
        try {
            await deleteProject(activeProject, token);
            setProjects((prevProjects) => prevProjects.filter((project) => project.id !== activeProject));
            closeModal();
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
            setError('Failed to delete project. Please try again later.');
        }
    };

    return (
        <>
            <Helmet>
                <title>Projects list - Projest</title>
                <meta
                    name="description"
                    content="Découvrez tous vos projets sur Projest. Consultez les détails, suivez les dates limites et organisez efficacement vos tâches."
                />
            </Helmet>
            <HeaderBoard />
            <main id="projectListMain">
                <NavMenu />
                <section id="projectListContent">
                    <h2>All Projects</h2>
                    {(() => {
                        if (isLoading) {
                            return <p>Loading projects...</p>;
                        }
                        if (error && !isDeleteModalOpen) {
                            return <p className="errorMessage">{error}</p>;
                        }
                        return (
                            <div className="projectsGrid">
                                {projects.map((project) => (
                                    <article className="projectCard" key={project.id}>
                                        <div className="card-header">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteModal(project.id);
                                                }}
                                                className="delete-project-button"
                                                aria-label={`Delete project ${project.projectName}`}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                        <NavLink to={`/project/${project.id}`} className="viewDetails">
                                            <h3>{project.projectName}</h3>
                                            <p>Due date: {new Date(project.deadline).toLocaleDateString()}</p>
                                        </NavLink>
                                    </article>
                                ))}
                            </div>
                        );
                    })()}
                </section>
            </main>
            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm deletion</h3>
                        <p>Are you sure you want to delete this project?</p>
                        {error && <p className="modal-error">{error}</p>}
                        <button className="delete-modal-button" onClick={handleDeleteProject}>
                            Delete
                        </button>
                        <button className="close-modal-button" onClick={closeModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
