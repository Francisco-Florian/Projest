import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../style/style.scss';
import useAuthStore from '../stores/authStore';

const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
};

const Home = () => {
    const token = useAuthStore((state) => state.token);
    const logOut = useAuthStore((state) => state.logout);
    const showElement = !token;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // handle the log out on th click of the log out button
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
        <>
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
                            <li className="dropdown" ref={dropdownRef}>
                                <img 
                                    className="userIcone" 
                                    src="/user_icone.webp" 
                                    alt="icône utilisateur" 
                                    onClick={toggleDropdown}
                                />
                                {dropdownOpen && (
                                    <ul className="dropdown-menu">
                                        <li><Link to="/dashboard">Dashboard</Link></li>
                                        <li><Link to="/projects">Projects</Link></li>
                                        <li><Link to="/activity">Activities</Link></li>
                                        <li><Link to="/teams">Teams</Link></li>
                                        <li><Link to="/settings">Settings</Link></li>
                                        <li><Link to="/" onClick={handleLogOut}>Log Out</Link></li>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    )}
                    <i className="fa-solid fa-bars burgerMenu" />
                </div>
            </header>

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

                <section id="section3">
                    <h2>What Our Users Say</h2>
                    <div className="container_1250">
                        <article className="section3Card">
                            <img src="/sarah johnson.png" alt="sarah johnson" />
                            <div>
                                <p>&quot;Projest has revolutionized the way our team works. It&apos;s intuitive and incredibly effective.&quot;</p>
                                <h3>Sarah Johnson</h3>
                                <p className="job">Project Manager</p>
                            </div>
                        </article>
                        <article className="section3Card">
                            <img src="/michael lee.png" alt="michael lee" />
                            <div>
                                <p>&quot;The real-time updates and collaboration features have made managing projects a breeze.&quot;</p>
                                <h3>Michael Lee</h3>
                                <p className="job">Software Engineer</p>
                            </div>
                        </article>
                        <article className="section3Card">
                            <img src="/emily davis.png" alt="emily davis" />
                            <div>
                                <p>&quot;The analytics tools have provided invaluable insights into our projects progress.&quot;</p>
                                <h3>Emily Davis</h3>
                                <p className="job">Marketing Specialist</p>
                            </div>
                        </article>
                    </div>
                </section>

                <section id="section4">
                    <h2>Pricing Plans</h2>
                    <div className="container_1250">
                        <article className="pricingCard">
                            <h3>Basic</h3>
                            <p className="price">$9.99<span>/month</span></p>
                            <ul>
                                <li><i className="fa-solid fa-check" /> Up to 5 projects</li>
                                <li><i className="fa-solid fa-check" /> Basic task tracking</li>
                                <li><i className="fa-solid fa-check" /> Team collaboration</li>
                                <li><i className="fa-solid fa-xmark" /> Advanced analytics</li>
                                <li><i className="fa-solid fa-xmark" /> Priority support</li>
                            </ul>
                            <Link to="/choose-plan" className="pricingBtn">Choose Plan</Link>
                        </article>
                        <article className="pricingCard featured">
                            <h3>Pro</h3>
                            <p className="price">$19.99<span>/month</span></p>
                            <ul>
                                <li><i className="fa-solid fa-check" /> Unlimited projects</li>
                                <li><i className="fa-solid fa-check" /> Advanced task tracking</li>
                                <li><i className="fa-solid fa-check" /> Team collaboration</li>
                                <li><i className="fa-solid fa-check" /> Advanced analytics</li>
                                <li><i className="fa-solid fa-check" /> Priority support</li>
                            </ul>
                            <Link to="/choose-plan" className="pricingBtn">Choose Plan</Link>
                        </article>
                        <article className="pricingCard">
                            <h3>Enterprise</h3>
                            <p className="price">Custom</p>
                            <ul>
                                <li><i className="fa-solid fa-check" /> Unlimited projects</li>
                                <li><i className="fa-solid fa-check" /> Advanced task tracking</li>
                                <li><i className="fa-solid fa-check" /> Team collaboration</li>
                                <li><i className="fa-solid fa-check" /> Advanced analytics</li>
                                <li><i className="fa-solid fa-check" /> 24/7 Premium support</li>
                            </ul>
                            <Link to="/contact-us" className="pricingBtn">Contact Us</Link>
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