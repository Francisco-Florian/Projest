import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/projectList.scss";
import "../style/dropDown.scss";
import useAuthStore from '../stores/authStore';
import NavMenu from "../components/navMenu";
import HeaderBoard from "../components/headerBoard";

export default function ProjectList() {
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:3000/api/project', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                const sortedProjects = data.projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setProjects(sortedProjects);
            } catch (error) {
                console.error('Error fetching project data:', error);
                setError('Failed to load projects. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

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
                fetchProjects();
            } catch (err) {
                console.error("Error verifying user:", err);
                setToken(null);
                navigate('/login');
            }
        };

        verifyTokenAndUser();
    }, [token, navigate, setToken]);

    return (
        <>
            <HeaderBoard />
            <main id="projectListMain">
                <NavMenu />
                <section id="projectListContent">
                    <h2>All Projects</h2>
                    {(() => {
                        if (isLoading) {
                            return <p>Loading projects...</p>;
                        }
                        if (error) {
                            return <p className="errorMessage">{error}</p>;
                        }
                        return (
                            <div className="projectsGrid">
                                {projects.map((project) => (
                                    <NavLink key={project.id} to={`/project/${project.id}`} className="viewDetails">
                                        <article className="projectCard">
                                            <h3>{project.projectName}</h3>
                                            <p>Due date: {new Date(project.deadline).toLocaleDateString()}</p>
                                        </article>
                                    </NavLink>
                                ))}
                            </div>
                        );
                    })()}
                </section>
            </main>
        </>
    );
}