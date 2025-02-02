import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

export default function LoginRegisterForm({ buttonValue, linkValue, link, forgotPass, onSubmit, fieldErrors }) {
    return (
        <form action="#" method="post" onSubmit={onSubmit}>
            {fieldErrors?.email && <p className="fieldError">{fieldErrors.email}</p>}
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
            
            {fieldErrors?.password && <p className="fieldError">{fieldErrors.password}</p>}
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />

            <input className="button" type="submit" value={buttonValue} />
            <p>Or</p>
            <Link className="button" to={link}>{linkValue}</Link>
            <Link id="forgotPass" to="/forgot-pass">{forgotPass}</Link>
        </form>
    );
}

LoginRegisterForm.propTypes = {
    buttonValue: PropTypes.string.isRequired,
    linkValue: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    forgotPass: PropTypes.string,
    onSubmit: PropTypes.func,
    fieldErrors: PropTypes.object,
};