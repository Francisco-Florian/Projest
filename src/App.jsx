import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgotPassword';
import Dashboard from './pages/dashboard';
import ProjectList from './pages/projectList';
import ProjectPage from './pages/project';
import LegalMention from './pages/legalMention';
import ResetPassword from './pages/resetPassword';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-pass" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projectList" element={<ProjectList />} />
                <Route path="/project/:projectId" element={<ProjectPage />} />
                <Route path="/legal-mention" element={<LegalMention />} />
            </Routes>
        </Router>
    );
}