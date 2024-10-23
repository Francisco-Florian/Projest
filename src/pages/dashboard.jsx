import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/dashboard.scss";
import "../style/dropDown.scss";
import ProjectCard from "../components/projectCard";
import useAuthStore from '../stores/authStore';
import UserDropdown from '../components/UserDropdown';
import NavMenu from "../components/navMenu";

export default function Dashboard() {
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const logOut = useAuthStore((state) => state.logout);
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

    const handleLogOut = (e) => {
        e.preventDefault();
        logOut();
        navigate('/login');
    };

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
                setErrorMessage(null);
                setRefreshProjects(!refreshProjects);
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
                    'Authorization': `Bearer ${token}`,
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
        setErrorMessage("");
    };

    return (
        <>
            <header id="dashboardHeader">
                <NavLink to="/">
                    <img src="/Icone.jpeg" alt="Logo" />
                    <h1>Projest</h1>
                </NavLink>
                <ul id="logged">
                    <li><i className="fa-solid fa-bell notification" /></li>
                    <li><UserDropdown onLogout={handleLogOut} /></li>
                </ul>
            </header>
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