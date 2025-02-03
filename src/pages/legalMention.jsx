import { Link } from 'react-router-dom';
import UserDropdown from '../components/UserDropdown';
import useAuthStore from '../stores/authStore';
import '../style/legalMention.scss';
import { Helmet } from 'react-helmet';

export default function LegalMention() {
    const token = useAuthStore((state) => state.token);
    const logOut = useAuthStore((state) => state.logout);
    const showElement = !token;

    const handleLogOut = (e) => {
        e.preventDefault();
        logOut();
    };

    return (
        <>
            <Helmet>
                <title>Legal Mention - Projest</title>
                <meta
                    name="description"
                    content="Check out the legal mentions, privacy policy, and terms of use of Projest, compliant with GDPR. Learn more about data collection and management."
                />
            </Helmet>
            <header id="headerLegal">
                <div className="container_1440">
                    <Link to="/">
                        <img src="/Icone.jpeg" alt="icon" />
                        <h1>Projest</h1>
                    </Link>
                    <nav>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/#features">Features</Link></li>
                            <li><Link to="/#contact">Contact</Link></li>
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
                    <i className="fa-solid fa-bars burgerMenu" />
                </div>
            </header>

            <main id="mainLegal">
                <div className="container_1250">
                    <h2>Legal Mentions and Privacy Policy</h2>

                    <section>
                        <h3>1. Legal Mentions</h3>
                        <ul>
                            <li><strong>Website Name:</strong> Projest</li>
                            <li><strong>Site Publisher:</strong> Francisco Florian</li>
                            <li><strong>Publication Manager:</strong> Francisco Florian</li>
                            <li><strong>Hosting Provider:</strong> Vercel</li>
                            <li><strong>Contact:</strong> <a href="mailto:contact@projest.com">contact@projest.com</a></li>
                        </ul>
                    </section>

                    <section>
                        <h3>2. Privacy Policy</h3>
                        <p>This policy informs Projest users about practices regarding the collection, use, and protection of their personal data in compliance with GDPR.</p>

                        <h4>Data Collection</h4>
                        <p>Projest collects the following information during registration and site usage:</p>
                        <ul>
                            <li><strong>Full Name:</strong> Used to personalize the user experience and allow users to identify project members.</li>
                            <li><strong>Email:</strong> Used for account creation, password recovery, and sending important project-related notifications.</li>
                            <li><strong>Password:</strong> Stored in encrypted form to secure account access.</li>
                            <li><strong>Site Usage Data:</strong> Anonymized information about platform usage (e.g., number of projects created, login frequency) to improve service.</li>
                        </ul>

                        <h4>Purpose of Data Collection</h4>
                        <p>Personal data is collected for the following purposes:</p>
                        <ul>
                            <li>Account Management: Ensure secure authentication and manage user access.</li>
                            <li>Improving User Experience: Provide a personalized and optimized experience on the project management platform.</li>
                            <li>Sending Important Notifications: Notify users of security updates or essential project changes.</li>
                        </ul>

                        <h4>Data Retention</h4>
                        <p>Data is retained as long as the user account remains active. If the account is closed, data is deleted within 30 days unless legally required to be kept longer.</p>

                        <h4>User Rights</h4>
                        <p>Under GDPR, Projest users have the following rights:</p>
                        <ul>
                            <li><strong>Right of Access:</strong> Access personal information concerning them.</li>
                            <li><strong>Right of Rectification:</strong> Correct incorrect or incomplete personal information.</li>
                            <li><strong>Right of Deletion:</strong> Delete their account and personal data.</li>
                            <li><strong>Right to Data Portability:</strong> Obtain a copy of personal data provided in a structured and readable format.</li>
                            <li><strong>Right to Object and Restrict Processing:</strong> Object to data processing or request limitation in certain cases, particularly for anonymized analytics data.</li>
                        </ul>
                        <p>Users can exercise these rights by contacting us via email at: <a href="mailto:contact@projest.com">contact@projest.com</a>.</p>

                        <h4>Cookies</h4>
                        <p>Projest uses cookies to analyze platform usage for continuous service improvement. Consent for cookie usage is requested on the first visit.</p>
                    </section>

                    <section>
                        <h3>3. Terms of Service (ToS)</h3>
                        <p>Projest's ToS include the following sections:</p>
                        <ul>
                            <li><strong>Purpose:</strong> States that Projest is a project management platform allowing users to create and manage collaborative projects.</li>
                            <li><strong>Registration:</strong> Details the registration process and necessary data to create an account.</li>
                            <li><strong>User Obligations:</strong> Users must comply with usage rules and refrain from sharing illegal content.</li>
                            <li><strong>User Responsibilities:</strong> Ensures confidentiality of login credentials and secure account usage.</li>
                            <li><strong>Limitation of Liability:</strong> States that Projest is not liable for damages related to service use, within legal limits.</li>
                        </ul>
                    </section>

                    <section>
                        <h3>4. GDPR Consent Form</h3>
                        <p>A text to include in the registration form could be:</p>
                        <blockquote>
                            "By checking this box, you accept our Privacy Policy and consent to the collection and processing of your personal data in compliance with GDPR."
                        </blockquote>
                    </section>
                </div>
            </main>

            <footer id="footerLegal">
                <ul>
                    <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                    <li><Link to="/terms-of-service">Terms of Service</Link></li>
                    <li><Link to="/contact-us">Contact Us</Link></li>
                </ul>
                <p>© 2024 Projest. All rights reserved.</p>
            </footer>
        </>
    );
}
