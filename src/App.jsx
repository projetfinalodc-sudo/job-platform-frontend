import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivationCompte from './pages/ActivationCompte';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Navigate to="/offres" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activation" element={<ActivationCompte />} />

          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
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
            </>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
