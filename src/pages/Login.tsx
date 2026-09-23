import { useState } from "react";
import { useNavigate } from "react-router-dom";

import LogoTsc from "../components/LogoTsc";
import { connexion } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  const [voirMotDePasse, setVoirMotDePasse] =
    useState(false);

  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setErreur("");

    if (
      !email.trim() ||
      !motDePasse.trim()
    ) {
      setErreur(
        "Veuillez renseigner votre identifiant et votre mot de passe."
      );

      return;
    }

    try {
      setChargement(true);

      await connexion(
        email.trim(),
        motDePasse
      );

      navigate("/", {
        replace: true,
      });
    } catch (error: any) {
      console.error(
        "Erreur connexion :",
        error
      );

      setErreur(
        error?.response?.data?.message ||
          "Identifiant ou mot de passe incorrect."
      );
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* LOGO */}

        <div className="login-brand">

          <LogoTsc />

          <h1>
            TSC Management
          </h1>

          <p>
            Temple du Savoir Club
          </p>

        </div>

        {/* TITRE */}

        <div className="login-title">

          <h2>
            Bienvenue
          </h2>

          <p>
            Connectez-vous à votre espace de gestion.
          </p>

        </div>

        {/* ERREUR */}

        {erreur && (
          <div className="login-error">
            {erreur}
          </div>
        )}

        {/* FORMULAIRE */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="login-field">

            <label htmlFor="email">
              Identifiant / Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@tsc-management.ci"
              autoComplete="username"
              disabled={chargement}
            />

          </div>

          {/* MOT DE PASSE */}

          <div className="login-field">

            <label htmlFor="password">
              Mot de passe
            </label>

            <div className="password-wrapper">

              <input
                id="password"
                type={
                  voirMotDePasse
                    ? "text"
                    : "password"
                }
                value={motDePasse}
                onChange={(e) =>
                  setMotDePasse(
                    e.target.value
                  )
                }
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                disabled={chargement}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setVoirMotDePasse(
                    !voirMotDePasse
                  )
                }
                disabled={chargement}
              >
                {voirMotDePasse
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>

          {/* BOUTON */}

          <button
            type="submit"
            className="login-button"
            disabled={chargement}
          >
            {chargement
              ? "Connexion..."
              : "Se connecter"}
          </button>

        </form>

        {/* FOOTER */}

        <div className="login-footer">

          <span>
            © 2026 TSC Management
          </span>

          <span>
            Version 1.0
          </span>

        </div>

      </div>

    </div>
  );
}