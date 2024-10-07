import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

export default function LoginRegisterForm({ buttonValue, linkValue, link, forgotPass }) {

    return (

        <form action="#" method="post">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />
            <input className="button" type="submit" value={buttonValue} />
            <p>Or</p>
            <Link className="button" to={link}>{linkValue}</Link>
            <Link id="forgotPass" to="/forgot-pass">{forgotPass}</Link>
        </form>

    )
}

LoginRegisterForm.propTypes = {
    buttonValue: PropTypes.string.isRequired,
    linkValue: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    forgotPass: PropTypes.string,
};