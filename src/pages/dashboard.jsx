import { Link, NavLink } from "react-router-dom";
import "../style/dashboard.scss";
import ProjectCard from "../components/projectCard";
import useAuthStore from '../stores/authStore';


export default function Dashboard() {

    const token = useAuthStore((state) => state.token);
    console.log(token);

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
                        <button id="createProjectBtn">Create Project</button>
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
        </div>
    );
}