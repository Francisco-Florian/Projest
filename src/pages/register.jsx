import { useEffect, useState } from 'react';
import LoginRegisterForm from "../components/login register form";
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function Register() {
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);
    const [errorMessage, setErrorMessage] = useState(null);

    // Redirection si l'utilisateur est déjà connecté
    useEffect(() => {
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

    const handleRegister = async (userData) => {
        try {
            // Envoi des données d'inscription à l'API
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Si la requête est un succès, redirige l'utilisateur vers la page de connexion
                navigate('/login');
            } else {
                // Gestion des erreurs en fonction du message reçu
                const errorMsg = data.message?.includes('Email already exists') ? 'This email is already registered.' : 'An error occurred during registration. Please try again.';
                setErrorMessage(errorMsg);
            }
        } catch (error) {
            console.error('Error registering user:', error);
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

        handleRegister(userData);
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
                    buttonValue="Register" 
                    linkValue="Log in" 
                    link="/login" 
                    forgotPass="Forgot password ?" 
                    onSubmit={handleSubmit} // Passe la fonction de soumission comme prop
                />
            </section>
        </main>
    );
}
