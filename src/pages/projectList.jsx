import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/projectList.scss";
import "../style/dropDown.scss";
import useAuthStore from '../stores/authStore';
import NavMenu from "../components/navMenu";
import HeaderBoard from "../components/headerBoard";
import { verifyToken, fetchProjects } from "../api/api";

export default function ProjectList() {
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


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