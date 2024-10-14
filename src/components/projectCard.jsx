import PropTypes from 'prop-types';
import { useEffect, useState } from "react";

export default function ProjectCard({ refresh }) {
    const [projects, setProjects] = useState([]);

    ProjectCard.propTypes = {
        refresh: PropTypes.any.isRequired
    };

    useEffect(() => {
        fetchProjectData();
    }, [refresh]);

    const fetchProjectData = async () => {
        try {
            const storedData = localStorage.getItem('auth-storage');
            if (!storedData) {
                throw new Error('No authentication data found');
            }
            const parsedData = JSON.parse(storedData);
            const token = parsedData.state.token;

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

            if (!data.projects) {
                throw new Error('Projects data is not available');
            }

            const transformedData = data.projects.map((item) => ({
                id: item.id,
                title: item.projectName,
                dueDate: item.deadline,
            }));
            setProjects(transformedData);
        } catch (error) {
            console.error('Error fetching project data:', error);
        }
    };

    return (
        <>
            {projects.length > 0 ? (
                projects
                    .slice(-6)
                    .reverse()
                    .map((project) => (
                        <article key={project.id}>
                            <h3>{project.title}</h3>
                            <p>Due date: {new Date(project.dueDate).toLocaleDateString()}</p>
                        </article>
                    ))
            ) : (
                <p>No projects available</p>
            )}
        </>
    );
}
