import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/dashboard.scss";
import "../style/dropDown.scss";
import ProjectCard from "../components/projectCard";
import useAuthStore from '../stores/authStore';
import NavMenu from "../components/navMenu";
import HeaderBoard from "../components/headerBoard";
import { verifyToken, createProject } from "../api/api";
import { Helmet } from "react-helmet";

export default function Dashboard() {
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [refreshProjects, setRefreshProjects] = useState(false);

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

    const handleCreateProjectClick = () => {
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const projectData = { projectName };
            const response = await createProject(token, projectData);

            if (response.error) {
                setErrorMessage(response.message);
            } else {
                setProjectName("");
                setIsModalOpen(false);
                setErrorMessage(null);
                setRefreshProjects(!refreshProjects);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("An error occurred while creating the project.");
        } 
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setErrorMessage("");
    };

    return (
        <>
            <Helmet>
                <title>Dashboard - Projest</title>
                <meta
                    name="description"
                    content="Accédez à votre tableau de bord Projest. Gérez vos projets, consultez les activités récentes, et créez de nouveaux projets pour une collaboration efficace."
                />
            </Helmet>
            <HeaderBoard />
            <main id="dashboardMain">
                <NavMenu />
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
        </>
    );
}