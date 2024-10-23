import { NavLink } from "react-router-dom";
import '../style/navMenu.scss';


export default function NavMenu() {

    return(
        <section className="container_150" id="navMenu">
            <ul>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                <li><NavLink to="/projectList">Projects</NavLink></li>
                <li><NavLink to="/activities">Activity</NavLink></li>
                <li><NavLink to="/teams">Teams</NavLink></li>
            </ul>
            <ul>
                <li><NavLink to="/settings">Settings</NavLink></li>
            </ul>
        </section>
    )
}