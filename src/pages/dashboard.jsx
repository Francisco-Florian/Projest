import { Link, NavLink, useNavigate } from "react-router-dom";
import "../style/dashboard.scss";
import ProjectCard from "../components/projectCard";
import useAuthStore from '../stores/authStore';
import { useEffect, useState } from "react";

export default function Dashboard() {
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [refreshProjects, setRefreshProjects] = useState(false);  // Nouvel état pour actualiser la liste des projets

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleCreateProjectClick = () => {
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const projectData = { projectName };
            const response = await handleRegister(projectData);

            if (response.error) {
                setErrorMessage(response.message);
            } else {
                setProjectName("");
                setIsModalOpen(false);
                setErrorMessage(null);  // Réinitialiser le message d'erreur en cas de succès
                setRefreshProjects(!refreshProjects);  // Inverser la valeur pour rafraîchir les projets
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("An error occurred while creating the project.");
        }
    };

    const handleRegister = async (projectData) => {
        try {
            const response = await fetch('http://localhost:3000/api/project/create', {
                method: 'POST',
                body: JSON.stringify(projectData),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                return { error: true, message: data.message };
            }

            return await response.json();
        } catch (err) {
            console.log(err);
            return { error: true, message: "Network error" };
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setErrorMessage("");  // Réinitialiser le message d'erreur lors de la fermeture de la modale
    };

    return (
        <div>
            <header id="dashboardHeader">
                <NavLink to="/">
                    <img src="/Icone.jpeg" alt="Logo" />
                    <h1>Projest</h1>
                </NavLink>
                <ul>
                    <li><i className="fa-solid fa-bell notification" /></li>
                    <li><img className="userIcone" src="/user_icone.webp" alt="user icone" /></li>
                </ul>
            </header>
            <main id="dashboardMain">
                <section className="container_250" id="section1">
                    <ul>
                        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                        <li><NavLink to="/project">Projects</NavLink></li>
                        <li><NavLink to="/activities">Activity</NavLink></li>
                        <li><NavLink to="/teams">Teams</NavLink></li>
                    </ul>
                    <ul>
                        <li><NavLink to="/settings">Settings</NavLink></li>
                        <li><Link to="/signout">Sign out</Link></li>
                    </ul>
                </section>
                <aside id="aside1" aria-label="Active Projects">
                    <div className="aside1-header">
                        <h2>Last Active Projects</h2>
                        <button id="createProjectBtn" onClick={handleCreateProjectClick}>Create Project</button>
                    </div>
                    <div className="projectsContainer">
                        <ProjectCard refresh={refreshProjects} />
                    </div>
                </aside>
                <aside id="aside2" aria-label="Recent Activities">
                    <h2>Recent Activities</h2>
                    <div>
                        <article>
                            <img className="userIcone" src="/user_icone.webp" alt="user icone" />
                            <div>
                                <h3>test</h3>
                                <p>test</p>
                            </div>
                        </article>
                    </div>
                </aside>
            </main>

            {/* Modale */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>&times;</button>
                        <h2>Create New Project</h2>
                        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Project Name"
                                required
                            />
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
