import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { fetchProjects } from "../api/api";
import useAuthStore from '../stores/authStore';

export default function ProjectCard({ refresh }) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const token = useAuthStore((state) => state.token);

    ProjectCard.propTypes = {
        refresh: PropTypes.any.isRequired,
    };

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!token) return;
            try {
                setIsLoading(true);
                const data = await fetchProjects(token);
                const sortedProjects = data.projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setProjects(sortedProjects);
            } catch (error) {
                console.error('Error fetching project data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjectData();
    }, [refresh, token]);

    return (
        <>
            {isLoading && <p>Loading projects...</p>}
            {!isLoading && projects.length > 0 && projects.slice(0, 6).map((project) => (
                <article key={project.id}>
                    <NavLink to={`/project/${project.id}`} className="viewDetails">
                        <h3>{project.projectName}</h3>
                    </NavLink>
                </article>
            ))}
            {!isLoading && projects.length === 0 && <p>No projects available</p>}
        </>
    );
}