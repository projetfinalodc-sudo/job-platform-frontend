import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app, on restaure la session depuis le localStorage
  // pour éviter de déconnecter l'utilisateur à chaque rafraîchissement de page.
  useEffect(() => {
    const token = localStorage.getItem('jpg_token');
    const savedUser = localStorage.getItem('jpg_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('jpg_token');
        localStorage.removeItem('jpg_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, motDePasse) => {
    const data = await authService.login(email, motDePasse);
    const utilisateur = {
      id: data.id,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('jpg_token', data.token);
    localStorage.setItem('jpg_user', JSON.stringify(utilisateur));
    setUser(utilisateur);
    return utilisateur;
  };

  const logout = () => {
    localStorage.removeItem('jpg_token');
    localStorage.removeItem('jpg_user');
    setUser(null);
  };

  // Permet de mettre à jour les infos affichées (ex: après modification du profil)
  const updateUser = (champs) => {
    setUser((prev) => {
      const next = { ...prev, ...champs };
      localStorage.setItem('jpg_user', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>');
  }
  return context;
}
