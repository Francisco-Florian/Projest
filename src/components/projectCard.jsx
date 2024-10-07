import { useEffect, useState } from "react";

export default function ProjectCard() {
    const [projects, setProjects] = useState([]);

    // Call the API to get the project data
    useEffect(() => {
        fetchProjectData();
    }, []);

    const fetchProjectData = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/project');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            const transformedData = data.project.map((item) => ({
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
                projects.slice(-6).map((project) => (
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
