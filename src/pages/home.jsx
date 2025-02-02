import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/style.scss';
import '../style/dropDown.scss';
import useAuthStore from '../stores/authStore';
import UserDropdown from '../components/UserDropdown';
import { Helmet } from "react-helmet";
import { verifyToken } from '../api/api';
import PropTypes from 'prop-types';

const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
};

const BurgerMenuLoggedOut = ({ toggleBurgerMenu }) => {
    return (
        <div className="burgerMenuContent">
            <i className="fa-solid fa-times closeIcon" onClick={toggleBurgerMenu}></i>
            <ul>
                <li><Link to="/" onClick={(e) => { scrollToSection(e, 'section1'); toggleBurgerMenu(); }}>Home</Link></li>
                <li><Link to="/" onClick={(e) => { scrollToSection(e, 'section2'); toggleBurgerMenu(); }}>Features</Link></li>
                <li><Link to="/" onClick={(e) => { scrollToSection(e, 'section4'); toggleBurgerMenu(); }}>Pricing</Link></li>
                <li><Link to="/" onClick={(e) => { scrollToSection(e, 'footer'); toggleBurgerMenu(); }}>Contact</Link></li>
                <li><Link to="/login" onClick={toggleBurgerMenu}>Log in</Link></li>
                <li><Link to="/register" onClick={toggleBurgerMenu}>Sign up</Link></li>
            </ul>
        </div>
    );
};

BurgerMenuLoggedOut.propTypes = {
    toggleBurgerMenu: PropTypes.func.isRequired,
};

const BurgerMenuLoggedIn = ({ onLogout, toggleBurgerMenu }) => {
    return (
        <div className="burgerMenuContent">
            <i className="fa-solid fa-times closeIcon" onClick={toggleBurgerMenu}></i>
            <ul>
                <li><Link to="/" onClick={(e) => { scrollToSection(e, 'section1'); toggleBurgerMenu(); }}>Home</Link></li>
                <li><Link to="/" onClick={(e) => { scrollToSection(e, 'section2'); toggleBurgerMenu(); }}>Features</Link></li>
                <li><Link to="/" onClick={(e) => { scrollToSection(e, 'section4'); toggleBurgerMenu(); }}>Pricing</Link></li>
                <li><Link to="/" onClick={(e) => { scrollToSection(e, 'footer'); toggleBurgerMenu(); }}>Contact</Link></li>
                <li><Link to="/dashboard" onClick={toggleBurgerMenu}>Dashboard</Link></li>
                <li><a href="#" onClick={(e) => { onLogout(e); toggleBurgerMenu(); }}>Log out</a></li>
            </ul>
        </div>
    );
};

BurgerMenuLoggedIn.propTypes = {
    onLogout: PropTypes.func.isRequired,
    toggleBurgerMenu: PropTypes.func.isRequired,
};

const Home = () => {
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const logOut = useAuthStore((state) => state.logout);
    const showElement = !token;

    const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);

    const toggleBurgerMenu = () => {
        setIsBurgerMenuOpen(!isBurgerMenuOpen);
    };

    useEffect(() => {
        const verifyTokenAndUser = async () => {
            try {
                await verifyToken(token);
            } catch (err) {
                console.error("Erreur lors de la vérification de l'utilisateur:", err);
                setToken(null);
            }
        };

        verifyTokenAndUser();
    }, [token, setToken]);

    const handleLogOut = (e) => {
        e.preventDefault();
        logOut();
    };

    useEffect(() => {
        if (document.body.classList.contains("loginRegister")) {
            document.body.classList.remove("loginRegister");
        }
        return () => {
            if (!document.body.classList.contains("loginRegister")) {
                document.body.classList.remove("loginRegister");
            }
        }
    }, []);

    return (
        <>
            <Helmet>
                <title>Projest - Plateforme de gestion de projet</title>
                <meta
                    name="description"
                    content="Découvrez Projest : une plateforme intuitive de gestion de projet. Suivez vos tâches, améliorez la collaboration en équipe, et analysez vos projets avec des outils puissants. Lancez-vous dès aujourd'hui !"
                />
            </Helmet>
            <header id="headerHome">
                <div className="container_1440">
                    <Link to="/">
                        <img src="/Icone.jpeg" alt="icone" />
                        <h1>Projest</h1>
                    </Link>
                    <nav>
                        <ul>
                            <li><Link to="/" onClick={(e) => scrollToSection(e, 'section1')}>Home</Link></li>
                            <li><Link to="/" onClick={(e) => scrollToSection(e, 'section2')}>Features</Link></li>
                            <li><Link to="/" onClick={(e) => scrollToSection(e, 'section4')}>Pricing</Link></li>
                            <li><Link to="/" onClick={(e) => scrollToSection(e, 'footer')}>Contact</Link></li>
                        </ul>
                    </nav>
                    {showElement ? (
                        <ul>
                            <li><Link to="/login" id="logIn">Log in</Link></li>
                            <li><Link to="/register" id="signUp">Sign up</Link></li>
                        </ul>
                    ) : (
                        <ul id='logged'>
                            <li><i className="fa-solid fa-bell notification" /></li>
                            <li><UserDropdown onLogout={handleLogOut} /></li>
                        </ul>
                    )}
                    <i className="fa-solid fa-bars burgerMenu" onClick={toggleBurgerMenu} />
                </div>
            </header>

            {isBurgerMenuOpen && (
                showElement ? (
                    <BurgerMenuLoggedOut toggleBurgerMenu={toggleBurgerMenu} />
                ) : (
                    <BurgerMenuLoggedIn onLogout={handleLogOut} toggleBurgerMenu={toggleBurgerMenu} />
                )
            )}

            <main id="mainHome">
                <section id="section1">
                    <h2>Collaborate Effortlessly with Projest</h2>
                    <p>Manage your projects with ease and improve team collaboration with real-time updates, task tracking, and comprehensive project analytics.</p>
                    <Link to="/get-started">Get Started</Link>
                </section>

                <section id="section2">
                    <h2>Features</h2>
                    <div className="container_1250">
                        <article className="section2Card">
                            <i className="fa-solid fa-list-check taskListIcone violet" />
                            <h3>Task Tracking</h3>
                            <p>Keep track of all your tasks and ensure timely completion with our intuitive task tracking system.</p>
                        </article>
                        <article className="section2Card">
                            <i className="fa-solid fa-users usersIcone violet" />
                            <h3>Team Collaboration</h3>
                            <p>Enhance team collaboration with real-time updates and seamless communication tools.</p>
                        </article>
                        <article className="section2Card">
                            <i className="fa-solid fa-chart-line analyzeIcone violet" />
                            <h3>Project Analytics</h3>
                            <p>Get detailed insights into your project&apos;s progress with comprehensive analytics and reporting tools.</p>
                        </article>
                    </div>
                </section>
            </main>

            <footer id="footerHome">
                <ul>
                    <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                    <li><Link to="/terms-of-service">Terms of Service</Link></li>
                    <li><Link to="/contact-us">Contact Us</Link></li>
                </ul>
                <p>© 2024 Projest. All rights reserved.</p>
            </footer>
        </>
    );
};

export default Home;