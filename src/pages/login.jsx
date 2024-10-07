import { useEffect } from "react";
import LoginRegisterForm from "../components/login register form";
import "../style/register-login.scss";
import { useNavigate } from "react-router-dom";
import useAuthStore from '../stores/authStore';


export default function Login() {

    const navigate = useNavigate()
    const setToken = useAuthStore((state) => state.setToken);

    if (setToken) {
        navigate('/dashboard');
    }

    addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
        };
        handleLogin(userData);
    });

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
            console.log('User logged in:', data);

            // Si la requête a été un succès, redirige l'utilisateur vers la page de connexion
            if (response.ok) {
                setToken(data.token);
                navigate('/dashboard');
            } else {
                console.error('Error during login:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    }

    useEffect(() => {
        if (!document.body.classList.contains("loginRegister")) {
            document.body.classList.add("loginRegister");
        }
        return () => {
            document.body.classList.remove("loginRegister");
        }
    }, []);

    return (
        <main id="loginRegister">
            <section id="logReg">
                <LoginRegisterForm
                    buttonValue="Log in"
                    linkValue="register"
                    link="/register"
                    forgotPass="Forgot password ?"
                />
            </section>
        </main>
    )
}
