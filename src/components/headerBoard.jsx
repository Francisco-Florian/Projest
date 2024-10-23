import { NavLink, useNavigate } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import useAuthStore from '../stores/authStore';
import '../style/headerBoard.scss';

export default function HeaderBoard() {
    const logOut = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogOut = (e) => {
        e.preventDefault();
        logOut();
        navigate('/login');
    };

    return (
        <header id="headerBoard">
            <NavLink to="/">
                <img src="/Icone.jpeg" alt="Logo" />
                <h1>Projest</h1>
            </NavLink>
            <ul id="logged">
                <li><i className="fa-solid fa-bell notification" /></li>
                <li><UserDropdown onLogout={handleLogOut} /></li>
            </ul>
        </header>
    )
}
