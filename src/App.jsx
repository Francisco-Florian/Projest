import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPass from './pages/forgotPass';
import Dashboard from './pages/dashboard';
import ProjectList from './pages/projectList';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-pass" element={<ForgotPass />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projectList" element={<ProjectList />} />
            </Routes>
        </Router>
    );
}