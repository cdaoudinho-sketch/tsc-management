import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Eleves from "./pages/Eleves";
import Inscriptions from "./pages/Inscriptions";
import Paiements from "./pages/Paiements";
import Recus from "./pages/Recus";
import Depenses from "./pages/Depenses";
import Rapports from "./pages/Rapports";
import Parametres from "./pages/Parametres";
import ProfilEleve from "./pages/ProfilEleve";
import DetailRecu from "./pages/DetailRecu";
import Login from "./pages/Login";
import Utilisateurs from "./pages/Utilisateurs";

import LogoTsc from "./components/LogoTsc";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import {
  deconnexion,
  obtenirUtilisateur,
} from "./services/auth";

import "./App.css";

function AppContent() {
  const location = useLocation();
  const user = obtenirUtilisateur();

  const [menuOuvert, setMenuOuvert] =
    useState(false);

  const isLoginPage =
    location.pathname === "/login";

  const fermerMenu = () => {
    setMenuOuvert(false);
  };

  if (isLoginPage) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app">

        {/* =========================
            HEADER MOBILE
        ========================= */}
        <header className="mobile-header">

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMenuOuvert(!menuOuvert)
            }
            aria-label={
              menuOuvert
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
          >
            {menuOuvert ? "✕" : "☰"}
          </button>

          <div className="mobile-brand">
            <LogoTsc />
          </div>

          <div className="mobile-user">
            {user?.nom
              ? user.nom
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

        </header>

        {/* =========================
            OVERLAY MOBILE
        ========================= */}
        {menuOuvert && (
          <div
            className="mobile-overlay"
            onClick={fermerMenu}
          />
        )}

        {/* =========================
            SIDEBAR
        ========================= */}
        <aside
          className={`sidebar ${
            menuOuvert
              ? "sidebar-mobile-open"
              : ""
          }`}
        >

          {/* LOGO */}
          <div className="sidebar-logo">
            <LogoTsc />
          </div>

          {/* UTILISATEUR */}
          <div className="sidebar-user">

            <div className="sidebar-user-name">
              {user?.nom ||
                "Utilisateur"}
            </div>

            <div className="sidebar-user-role">
              {user?.role || ""}
            </div>

          </div>

          {/* MENU PRINCIPAL */}
          <nav>

            <Link
              to="/"
              onClick={fermerMenu}
            >
              🏠 <span>Dashboard</span>
            </Link>

            <Link
              to="/eleves"
              onClick={fermerMenu}
            >
              👨‍🎓 <span>Élèves</span>
            </Link>

            <Link
              to="/inscriptions"
              onClick={fermerMenu}
            >
              📝 <span>Inscriptions</span>
            </Link>

            <Link
              to="/paiements"
              onClick={fermerMenu}
            >
              💰 <span>Paiements</span>
            </Link>

            <Link
              to="/recus"
              onClick={fermerMenu}
            >
              🧾 <span>Reçus</span>
            </Link>

            {/* ADMIN UNIQUEMENT */}
            {user?.role === "ADMIN" && (
              <Link
                to="/depenses"
                onClick={fermerMenu}
              >
                💸 <span>Dépenses</span>
              </Link>
            )}

            <Link
              to="/rapports"
              onClick={fermerMenu}
            >
              📊 <span>Rapports</span>
            </Link>

            {/* ADMIN UNIQUEMENT */}
            {user?.role === "ADMIN" && (
              <Link
                to="/utilisateurs"
                onClick={fermerMenu}
              >
                👥 <span>Utilisateurs</span>
              </Link>
            )}

          </nav>

          {/* =========================
              BAS DE SIDEBAR
          ========================= */}
          <div className="sidebar-bottom">

            {/* ADMIN UNIQUEMENT */}
            {user?.role === "ADMIN" && (
              <Link
                to="/parametres"
                onClick={fermerMenu}
              >
                ⚙️ <span>Paramètres</span>
              </Link>
            )}

            <button
              type="button"
              className="sidebar-logout"
              onClick={() => {
                fermerMenu();
                deconnexion();
              }}
            >
              🚪 <span>Déconnexion</span>
            </button>

          </div>

        </aside>

        {/* =========================
            CONTENU PRINCIPAL
        ========================= */}
        <main className="main">

          <Routes>

            {/* DASHBOARD */}
            <Route
              path="/"
              element={<Dashboard />}
            />

            {/* ÉLÈVES */}
            <Route
              path="/eleves"
              element={<Eleves />}
            />

            {/* PROFIL ÉLÈVE */}
            <Route
              path="/eleves/:matricule"
              element={<ProfilEleve />}
            />

            {/* INSCRIPTIONS */}
            <Route
              path="/inscriptions"
              element={<Inscriptions />}
            />

            {/* PAIEMENTS */}
            <Route
              path="/paiements"
              element={<Paiements />}
            />

            {/* REÇUS */}
            <Route
              path="/recus"
              element={<Recus />}
            />

            {/* DÉTAIL REÇU */}
            <Route
              path="/recus/:numero"
              element={<DetailRecu />}
            />

            {/* DÉPENSES — ADMIN */}
            <Route
              path="/depenses"
              element={
                <RoleRoute role="ADMIN">
                  <Depenses />
                </RoleRoute>
              }
            />

            {/* RAPPORTS */}
            <Route
              path="/rapports"
              element={<Rapports />}
            />

            {/* PARAMÈTRES — ADMIN */}
            <Route
              path="/parametres"
              element={
                <RoleRoute role="ADMIN">
                  <Parametres />
                </RoleRoute>
              }
            />

            {/* UTILISATEURS — ADMIN */}
            <Route
              path="/utilisateurs"
              element={
                <RoleRoute role="ADMIN">
                  <Utilisateurs />
                </RoleRoute>
              }
            />

          </Routes>

          {/* FOOTER */}
          <footer>
            © 2026 TSC — Temple du Savoir Club
          </footer>

        </main>

      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;