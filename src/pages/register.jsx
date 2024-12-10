import { useEffect, useState } from 'react';
import LoginRegisterForm from "../components/login register form";
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { verifyToken, register } from '../api/api';
import { Helmet } from 'react-helmet';

export default function Register() {
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);

    const [errorMessage, setErrorMessage] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

    useEffect(() => {
        const verifyTokenAndRedirect = async () => {
            if (token) {
                try {
                    await verifyToken(token);
                    navigate('/dashboard');
                } catch (err) {
                    console.error("Token invalide ou expiré :", err);
                    setToken(null);
                }
            }
        };

        verifyTokenAndRedirect();
    }, [token, navigate, setToken]);

    const handleRegister = async (userData) => {
        try {
            const data = await register(userData);
            if (data.success) {
                navigate('/login');
            } else {
                const { message, field } = data;
                if (field) {
                    setFieldErrors((prevErrors) => ({
                        ...prevErrors,
                        [field]: message,
                    }));
                } else {
                    setErrorMessage(message || 'An unexpected error occurred. Please try again later.');
                }
            }
        } catch (error) {
            console.error('Error registering user:', error);
            setErrorMessage('An unexpected error occurred. Please try again later.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(null);
        setFieldErrors({ email: "", password: "" });

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
        <>
            <Helmet>
                <title>Register - Projest</title>
                <meta
                    name="description"
                    content="Connectez-vous à Projest pour accéder à vos projets, gérer vos tâches et collaborer efficacement avec votre équipe." />
            </Helmet>
            <main id="loginRegister">
                <section id="logReg">
                    {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                    <LoginRegisterForm
                        buttonValue="Register"
                        linkValue="Log in"
                        link="/login"
                        forgotPass="Forgot password ?"
                        onSubmit={handleSubmit}
                        fieldErrors={fieldErrors}
                    />
                </section>
            </main>
        </>
    );
}
