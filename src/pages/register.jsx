import { useEffect } from 'react';
import LoginRegisterForm from "../components/login register form";
import { useNavigate } from 'react-router-dom';


export default function Register() {

    const navigate = useNavigate()

    addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
        };
        handleRegister(userData);
    });

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
            console.log('User registered:', data);

            // Si la requête a été un succès, redirige l'utilisateur vers la page de connexion
            if (response.ok) {
                navigate('/login');
            } else {
                console.error('Error during registration:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error registering user:', error);
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
                <LoginRegisterForm buttonValue="Register" linkValue="Log in" link="/login" forgotPass="Forgot password ?" onRegister={handleRegister} />
            </section>
        </main>
    )
}
