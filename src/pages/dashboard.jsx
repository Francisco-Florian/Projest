import { Link, NavLink, useNavigate } from "react-router-dom";
import "../style/dashboard.scss";
import ProjectCard from "../components/projectCard";
import useAuthStore from '../stores/authStore';
import { useEffect, useState } from "react";

export default function Dashboard() {
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();
    
    // État pour afficher ou non la modale
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleCreateProjectClick = () => {
        setIsModalOpen(true); // Ouvre la modale
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Project Name: ", projectName); // Remplace par la logique de création du projet
        setProjectName(""); // Réinitialise le champ après soumission
        setIsModalOpen(false); // Ferme la modale après soumission
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // Ferme la modale si l'utilisateur clique sur le fond
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
                    <div>
                        <ProjectCard />
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
