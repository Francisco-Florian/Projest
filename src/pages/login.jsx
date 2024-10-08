import { useEffect, useState } from "react";
import LoginRegisterForm from "../components/login register form";
import "../style/register-login.scss";
import { useNavigate } from "react-router-dom";
import useAuthStore from '../stores/authStore';

export default function Login() {
    const navigate = useNavigate();
    const setToken = useAuthStore((state) => state.setToken);
    const token = useAuthStore((state) => state.token);
    const [errorMessage, setErrorMessage] = useState(null);

    // Redirection si l'utilisateur est déjà connecté
    useEffect(() => {
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

    const handleLogin = async (userData) => {
        try {
            // Envoi des données de connexion à l'API
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Si la requête est un succès, enregistrer le token et rediriger
                setToken(data.token);
            } else {
                console.error('Error during login:', data.message || 'Unknown error');
                setErrorMessage('Username or password incorrect.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
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
        <main id="loginRegister">
            <section id="logReg">
                {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                <LoginRegisterForm
                    buttonValue="Log in"
                    linkValue="register"
                    link="/register"
                    forgotPass="Forgot password ?"
                    onSubmit={handleSubmit} 
                />
            </section>
        </main>
    );
}
