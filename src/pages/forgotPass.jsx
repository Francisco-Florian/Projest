import { useEffect } from "react";


export default function ForgotPass() {

    useEffect(() => {
        if (!document.body.classList.contains("loginRegister")) {
            document.body.classList.add("loginRegister");
        }
        return () => {
            document.body.classList.remove("loginRegister");
        }
    }, []); 

    return (
        <main id="forgotPass">
            <section id="logReg">
                <h1>Projest</h1>
                <form action="#" method="post">
                    <label htmlFor="mail">Email</label>
                    <input type="email" id="mail" name="mail" placeholder="Enter your email" required />
                    <input className="button" type="submit" value="Send" />
                </form>
            </section>
        </main>
    )
}
