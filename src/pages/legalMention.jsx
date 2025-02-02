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
                <title>Legal mention - Projest</title>
                <meta
                    name="description"
                    content="Consultez les mentions légales, la politique de confidentialité et les conditions générales d'utilisation de Projest, conforme au RGPD. Apprenez-en plus sur la collecte et la gestion de vos données personnelles."
                />
            </Helmet>
            <header id="headerLegal">
                <div className="container_1440">
                    <Link to="/">
                        <img src="/Icone.jpeg" alt="icone" />
                        <h1>Projest</h1>
                    </Link>
                    <nav>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/#features">Features</Link></li>
                            <li><Link to="/#pricing">Pricing</Link></li>
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
                    <h2>Mentions Légales et Politique de Confidentialité</h2>

                    <section>
                        <h3>1. Mentions légales</h3>
                        <ul>
                            <li><strong>Nom du site :</strong> Projest</li>
                            <li><strong>Éditeur du site :</strong> Francisco Florian</li>
                            <li><strong>Responsable de la publication :</strong> Francisco Florian</li>
                            <li><strong>Hébergeur :</strong> Vercel</li>
                            <li><strong>Contact :</strong> <a href="mailto:contact@projest.com">contact@projest.com</a></li>
                        </ul>
                    </section>

                    <section>
                        <h3>2. Politique de confidentialité</h3>
                        <p>Cette politique informe les utilisateurs de Projest des pratiques concernant la collecte, l&apos;utilisation et la protection de leurs données personnelles, conformément au RGPD.</p>

                        <h4>Collecte des données</h4>
                        <p>Projest collecte les informations suivantes lors de l&apos;inscription et de l&apos;utilisation du site :</p>
                        <ul>
                            <li><strong>Nom et prénom :</strong> Utilisés pour personnaliser l&apos;expérience utilisateur et permettre aux utilisateurs d&apos;identifier les membres d&apos;un projet.</li>
                            <li><strong>Email :</strong> Utilisé pour la création du compte, la récupération du mot de passe et l&apos;envoi de notifications importantes liées aux projets.</li>
                            <li><strong>Mot de passe :</strong> Stocké sous forme cryptée pour sécuriser l&apos;accès au compte.</li>
                            <li><strong>Données d&apos;utilisation du site :</strong> Informations anonymisées sur l&apos;utilisation de la plateforme (par exemple, nombre de projets créés, fréquence de connexion) afin d&apos;améliorer le service.</li>
                        </ul>

                        <h4>Finalités de la collecte</h4>
                        <p>Les données personnelles sont collectées pour les finalités suivantes :</p>
                        <ul>
                            <li>Gestion des comptes : Assurer une authentification sécurisée et gérer l&apos;accès des utilisateurs.</li>
                            <li>Amélioration de l&apos;expérience utilisateur : Offrir une expérience personnalisée et optimisée sur la plateforme de gestion de projet.</li>
                            <li>Envoi de notifications importantes : Notifier les utilisateurs en cas de mise à jour de sécurité ou de modifications essentielles pour les projets.</li>
                        </ul>

                        <h4>Conservation des données</h4>
                        <p>Les données sont conservées aussi longtemps que le compte de l&apos;utilisateur reste actif. Si le compte est fermé, les données sont supprimées dans un délai de 30 jours, sauf en cas d&apos;obligation légale de les conserver plus longtemps.</p>

                        <h4>Droits des utilisateurs</h4>
                        <p>Conformément au RGPD, les utilisateurs de Projest bénéficient des droits suivants :</p>
                        <ul>
                            <li><strong>Droit d&apos;accès :</strong> Accéder aux informations personnelles les concernant.</li>
                            <li><strong>Droit de rectification :</strong> Corriger des informations personnelles incorrectes ou incomplètes.</li>
                            <li><strong>Droit de suppression :</strong> Supprimer leur compte et leurs données personnelles.</li>
                            <li><strong>Droit à la portabilité :</strong> Obtenir une copie des données personnelles fournies dans un format structuré et lisible.</li>
                            <li><strong>Droit d&apos;opposition et de limitation :</strong> S&apos;opposer au traitement de leurs données ou en demander la limitation dans certains cas, en particulier pour les données d&apos;analyse anonymisées.</li>
                        </ul>
                        <p>Les utilisateurs peuvent exercer ces droits en nous contactant par email à : <a href="mailto:contact@projest.com">contact@projest.com</a>.</p>

                        <h4>Cookies</h4>
                        <p>Projest utilise des cookies pour analyser l&apos;utilisation de la plateforme pour une amélioration continue du service. Un consentement pour l&apos;utilisation des cookies est demandé lors de la première visite.</p>
                    </section>

                    <section>
                        <h3>3. Conditions Générales d&apos;Utilisation (CGU)</h3>
                        <p>Les CGU de Projest comprennent les sections suivantes :</p>
                        <ul>
                            <li><strong>Objet :</strong> Précise que Projest est une plateforme de gestion de projets permettant aux utilisateurs de créer et gérer des projets collaboratifs.</li>
                            <li><strong>Inscription :</strong> Expose le processus d&apos;inscription et les données nécessaires pour créer un compte.</li>
                            <li><strong>Obligations des utilisateurs :</strong> Les utilisateurs doivent respecter les règles d&apos;utilisation et s&apos;abstenir de diffuser des contenus illicites.</li>
                            <li><strong>Responsabilités de l&apos;utilisateur :</strong> Assure la confidentialité des identifiants et l&apos;utilisation sécurisée du compte.</li>
                            <li><strong>Limitation de responsabilité :</strong> Indique que Projest n&apos;est pas responsable des dommages liés à l&apos;utilisation du service, dans les limites prévues par la loi.</li>
                        </ul>
                    </section>

                    <section>
                        <h3>4. Formulaire de consentement RGPD</h3>
                        <p>Un texte à inclure dans le formulaire d&apos;inscription pourrait être le suivant :</p>
                        <blockquote>
                            &quot;En cochant cette case, vous acceptez notre Politique de confidentialité et consentez à la collecte et au traitement de vos données personnelles conformément au RGPD.&quot;
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