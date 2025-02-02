import { useEffect, useState } from "react";
import LoginRegisterForm from "../components/login register form";
import "../style/register-login.scss";
import { useNavigate } from "react-router-dom";
import useAuthStore from '../stores/authStore';
import { verifyToken, login } from "../api/api";
import { Helmet } from "react-helmet";

export default function Login() {
    const navigate = useNavigate();
    const setToken = useAuthStore((state) => state.setToken);
    const token = useAuthStore((state) => state.token);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const verifyTokenAndUser = async () => {
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                await verifyToken(token);
                navigate('/dashboard');
            } catch (err) {
                console.error("Erreur lors de la vérification de l'utilisateur:", err);
                setToken(null);
                navigate('/login');
            }
        };

        verifyTokenAndUser();
    }, [token, navigate, setToken]);

    const handleLogin = async (userData) => {
        try {
            const data = await login(userData);
            setToken(data.token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error during login:', error);
            setErrorMessage('An unexpected error occurred. Please try again later.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(null);

        const formData = new FormData(e.target);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
        };

        handleLogin(userData);
    };

    useEffect(() => {
        document.body.classList.add("loginRegister");
        return () => {
            document.body.classList.remove("loginRegister");
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>Connection - Projest</title>
                <meta
                    name="description"
                    content="Connectez-vous à Projest pour accéder à vos projets, gérer vos tâches et collaborer efficacement avec votre équipe." />
            </Helmet><main id="loginRegister">
                <section id="logReg">
                    {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                    <LoginRegisterForm
                        buttonValue="Log in"
                        linkValue="register"
                        link="/register"
                        forgotPass="Forgot password ?"
                        onSubmit={handleSubmit} />
                </section>
            </main>
        </>
    );
}
