import { useEffect, useState } from 'react';
import LoginRegisterForm from "../components/login register form";
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { verifyToken, register } from '../api/api';

export default function Register() {
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);
    const setToken = useAuthStore((state) => state.setToken);
    const [errorMessage, setErrorMessage] = useState(null);

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
