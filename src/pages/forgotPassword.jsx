import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../style/register-login.scss";
import { sendForgotPasswordEmail } from "../api/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
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

        try {
            setErrorMessage(""); // Clear previous errors
            setSuccessMessage(""); // Clear previous success messages
            
            await sendForgotPasswordEmail(email);
            setSuccessMessage("Password reset email has been sent. Please check your inbox.");
        } catch (error) {
            console.error("Error sending password reset email:", error);
            setErrorMessage("Failed to send password reset email. Please try again.");
        }
    };

    return (
        <>
            <Helmet>
                <title>Forgot Password - Projest</title>
                <meta
                    name="description"
                    content="Forgot your password? Reset it here on Projest."
                />
            </Helmet>
            <main id="loginRegister">
                <section id="logReg">
                    {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                    {successMessage && <p className="successMessage">{successMessage}</p>}
                    <form onSubmit={handleSubmit}>
                    <h2>Forgot Password</h2>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                        <button className="button" type="submit">
                            Send
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
