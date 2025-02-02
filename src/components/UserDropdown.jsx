import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const UserDropdown = ({ onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = (e) => {
        e.preventDefault();
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="dropdown" ref={dropdownRef}>
            <img 
                className="userIcone" 
                src="/user_icone.webp" 
                alt="icône utilisateur" 
                onClick={toggleDropdown}
            />
            {dropdownOpen && (
                <ul className="dropdown-menu">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/projectList">Projects</Link></li>
                    <li><Link to="/activity">Activities</Link></li>
                    <li><Link to="/teams">Teams</Link></li>
                    <li><Link to="/settings">Settings</Link></li>
                    <li><Link to="/" onClick={onLogout}>Log Out</Link></li>
                </ul>
            )}
        </div>
    );
};
UserDropdown.propTypes = {
    onLogout: PropTypes.func,
};

export default UserDropdown;