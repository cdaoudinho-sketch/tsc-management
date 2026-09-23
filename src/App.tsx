import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

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

/* =====================================================
   APPLICATION
===================================================== */

function AppContent() {
  const location = useLocation();

  const user = obtenirUtilisateur();

  const isLoginPage =
    location.pathname === "/login";

  /* ===================================================
     PAGE DE CONNEXION
  =================================================== */

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

  /* ===================================================
     APPLICATION PROTÉGÉE
  =================================================== */

  return (
    <ProtectedRoute>
      <div className="app">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="sidebar">

          {/* LOGO */}

          <div className="sidebar-logo">
            <LogoTsc />
          </div>

          {/* UTILISATEUR CONNECTÉ */}

          <div
            style={{
              padding: "12px 16px",
              marginBottom: "10px",
              borderBottom:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {user?.nom || "Utilisateur"}
            </div>

            <div
              style={{
                fontSize: "12px",
                opacity: 0.7,
                marginTop: "3px",
              }}
            >
              {user?.role || ""}
            </div>
          </div>

          {/* MENU */}

          <nav>

            <Link to="/">
              🏠 <span>Dashboard</span>
            </Link>

            <Link to="/eleves">
              👨‍🎓 <span>Élèves</span>
            </Link>

            <Link to="/inscriptions">
              📝 <span>Inscriptions</span>
            </Link>

            <Link to="/paiements">
              💰 <span>Paiements</span>
            </Link>

            <Link to="/recus">
              🧾 <span>Reçus</span>
            </Link>

            {user?.role === "ADMIN" && (
  <Link to="/depenses">
    💸 <span>Dépenses</span>
  </Link>
)}

            <Link to="/rapports">
              📊 <span>Rapports</span>
            </Link>

            {/* ==========================================
                UTILISATEURS → ADMIN UNIQUEMENT
            ========================================== */}

            {user?.role === "ADMIN" && (
              <Link to="/utilisateurs">
                👥 <span>Utilisateurs</span>
              </Link>
            )}

          </nav>

          {/* BAS DU MENU */}

          <div className="sidebar-bottom">
{user?.role === "ADMIN" && (
  <Link to="/parametres">
    ⚙️ Paramètres
  </Link>
)}

            <button
              type="button"
              className="sidebar-logout"
              onClick={deconnexion}
            >
              🚪 Déconnexion
            </button>

          </div>

        </aside>

        {/* =================================================
            CONTENU PRINCIPAL
        ================================================= */}

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

            <Route
              path="/recus/:numero"
              element={<DetailRecu />}
            />

            {/* DÉPENSES */}

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

            {/* PARAMÈTRES */}

            <Route
  path="/parametres"
  element={
    <RoleRoute role="ADMIN">
      <Parametres />
    </RoleRoute>
  }
/>

            {/* =================================================
                UTILISATEURS
                ADMIN UNIQUEMENT
            ================================================= */}

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

/* =====================================================
   ROOT APP
===================================================== */

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;