import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/api";
import { Helmet } from "react-helmet";
import "../style/register-login.scss";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        document.body.classList.add("loginRegister");
        return () => {
            document.body.classList.remove("loginRegister");
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setErrorMessage("Email is required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            const response = await resetPassword(token, email, newPassword);
            setSuccessMessage(response.message);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <>
            <Helmet>
                <title>Reset Password - Projest</title>
                <meta
                    name="description"
                    content="Réinitialisez votre mot de passe Projest et retrouvez l'accès à vos projets en toute sécurité." />
            </Helmet>
            <main id="loginRegister">
                <section id="logReg">
                    <form onSubmit={handleSubmit}>
                        <h2>Reset Password</h2>
                        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                        {successMessage && <p className="successMessage">{successMessage}</p>}
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="button">Reset Password</button>
                    </form>
                </section>
            </main>
        </>
    );
}
