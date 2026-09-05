import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivationCompte from './pages/ActivationCompte';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Accueil from './pages/Accueil';
import DashboardCandidat from './pages/DashboardCandidat';
import DashboardRecruteur from './pages/DashboardRecruteur';
import Offres from './pages/Offres';
import OffreDetail from './pages/OffreDetail';
import Postuler from './pages/Postuler';
import MesCandidatures from './pages/MesCandidatures';
import MesOffres from './pages/MesOffres';
import CreerOffre from './pages/CreerOffre';
import AdminUtilisateurs from './pages/AdminUtilisateurs';
import MonProfil from './pages/MonProfil';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Route racine : redirige vers le tableau de bord adapté au rôle si connecté,
// ou affiche la page d'accueil publique pour un visiteur.
function AccueilRoute() {
  const { user } = useAuth();
  if (!user) return <Accueil />;
  if (user.role === 'CANDIDAT') return <Navigate to="/dashboard/candidat" replace />;
  if (user.role === 'RECRUTEUR') return <Navigate to="/dashboard/recruteur" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/utilisateurs" replace />;
  return <Accueil />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activation" element={<ActivationCompte />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<AccueilRoute />} />

                <Route path="/dashboard/candidat" element={
                  <PrivateRoute role="CANDIDAT"><DashboardCandidat /></PrivateRoute>
                } />
                <Route path="/dashboard/recruteur" element={
                  <PrivateRoute role="RECRUTEUR"><DashboardRecruteur /></PrivateRoute>
                } />

                <Route path="/offres" element={<Offres />} />
                <Route path="/offres/:id" element={<OffreDetail />} />
                <Route path="/offres/:id/postuler" element={
                  <PrivateRoute role="CANDIDAT"><Postuler /></PrivateRoute>
                } />

                <Route path="/mes-candidatures" element={
                  <PrivateRoute role="CANDIDAT"><MesCandidatures /></PrivateRoute>
                } />

                <Route path="/mes-offres" element={
                  <PrivateRoute role="RECRUTEUR"><MesOffres /></PrivateRoute>
                } />
                <Route path="/creer-offre" element={
                  <PrivateRoute role="RECRUTEUR"><CreerOffre /></PrivateRoute>
                } />
                <Route path="/mes-offres/:id/modifier" element={
                  <PrivateRoute role="RECRUTEUR"><CreerOffre /></PrivateRoute>
                } />

                <Route path="/admin/utilisateurs" element={
                  <PrivateRoute role="ADMIN"><AdminUtilisateurs /></PrivateRoute>
                } />

                <Route path="/profil" element={
                  <PrivateRoute><MonProfil /></PrivateRoute>
                } />

                <Route path="/403" element={<Forbidden />} />
                <Route path="/500" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
