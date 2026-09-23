import { useState } from "react";
import type { FormEvent } from "react";

import {
  obtenirUtilisateur,
  changerMotDePasse,
} from "../services/auth";

export default function Parametres() {
  const user = obtenirUtilisateur();

  // =====================================================
  // CHANGEMENT DE MOT DE PASSE
  // =====================================================

  const [ancienMotDePasse, setAncienMotDePasse] =
    useState("");

  const [nouveauMotDePasse, setNouveauMotDePasse] =
    useState("");

  const [confirmationMotDePasse, setConfirmationMotDePasse] =
    useState("");

  const [afficherMotDePasse, setAfficherMotDePasse] =
    useState(false);

  const [chargementMotDePasse, setChargementMotDePasse] =
    useState(false);

  const [erreurMotDePasse, setErreurMotDePasse] =
    useState("");

  const [messageMotDePasse, setMessageMotDePasse] =
    useState("");

  // =====================================================
  // PARAMÈTRES TSC
  // =====================================================

  const [nomTsc, setNomTsc] = useState(
    "Temple du Savoir Club",
  );

  const [emailTsc, setEmailTsc] = useState(
    "contact@tsc-management.ci",
  );

  const [telephoneTsc, setTelephoneTsc] =
    useState("07 00 00 00 00");

  const [adresseTsc, setAdresseTsc] = useState(
    "Attécoubé, Abidjan, Côte d'Ivoire",
  );

  const [devise, setDevise] = useState("FCFA");

  const [message, setMessage] = useState("");

  // =====================================================
  // ENREGISTREMENT DES PARAMÈTRES
  // =====================================================

  function enregistrerParametres(
    event: FormEvent,
  ) {
    event.preventDefault();

    setMessage(
      "Les paramètres ont été enregistrés avec succès.",
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  // =====================================================
  // MODIFICATION DU MOT DE PASSE
  // =====================================================

  async function modifierMotDePasse(
    event: FormEvent,
  ) {
    event.preventDefault();

    setErreurMotDePasse("");
    setMessageMotDePasse("");

    if (!ancienMotDePasse) {
      setErreurMotDePasse(
        "Veuillez saisir votre ancien mot de passe.",
      );
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setErreurMotDePasse(
        "Le nouveau mot de passe doit contenir au moins 6 caractères.",
      );
      return;
    }

    if (
      nouveauMotDePasse !==
      confirmationMotDePasse
    ) {
      setErreurMotDePasse(
        "Les deux nouveaux mots de passe ne correspondent pas.",
      );
      return;
    }

    if (
      ancienMotDePasse ===
      nouveauMotDePasse
    ) {
      setErreurMotDePasse(
        "Le nouveau mot de passe doit être différent de l'ancien.",
      );
      return;
    }

    try {
      setChargementMotDePasse(true);

      await changerMotDePasse(
        ancienMotDePasse,
        nouveauMotDePasse,
      );

      setAncienMotDePasse("");
      setNouveauMotDePasse("");
      setConfirmationMotDePasse("");

      setMessageMotDePasse(
        "Mot de passe modifié avec succès.",
      );
    } catch (error: any) {
      setErreurMotDePasse(
        error?.response?.data?.message ||
          "Impossible de modifier le mot de passe.",
      );
    } finally {
      setChargementMotDePasse(false);
    }
  }

  return (
    <div className="page parametres-page">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="page-header">
        <div>
          <h1>Paramètres</h1>

          <p>
            Configuration générale de TSC Management.
          </p>
        </div>
      </div>

      {/* =================================================
          MESSAGE PARAMÈTRES
      ================================================= */}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* =================================================
          GRILLE PRINCIPALE
      ================================================= */}

      <div className="content-grid">

        {/* =================================================
            INFORMATIONS TSC
        ================================================= */}

        <section className="card">

          <div className="card-header">
            <h2>
              🏫 Informations du TSC
            </h2>

            <p>
              Informations utilisées dans
              l'application et les documents.
            </p>
          </div>

          <form
            className="form-grid"
            onSubmit={enregistrerParametres}
          >

            <div className="form-group">
              <label>
                Nom de la structure
              </label>

              <input
                type="text"
                value={nomTsc}
                onChange={(e) =>
                  setNomTsc(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>
                E-mail
              </label>

              <input
                type="email"
                value={emailTsc}
                onChange={(e) =>
                  setEmailTsc(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>
                Téléphone
              </label>

              <input
                type="text"
                value={telephoneTsc}
                onChange={(e) =>
                  setTelephoneTsc(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>
                Adresse
              </label>

              <input
                type="text"
                value={adresseTsc}
                onChange={(e) =>
                  setAdresseTsc(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>
                Devise
              </label>

              <select
                value={devise}
                onChange={(e) =>
                  setDevise(e.target.value)
                }
              >
                <option value="FCFA">
                  FCFA
                </option>

                <option value="EUR">
                  EUR
                </option>

                <option value="USD">
                  USD
                </option>
              </select>
            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="btn-primary"
              >
                Enregistrer les paramètres
              </button>

            </div>

          </form>

        </section>

        {/* =================================================
            MON COMPTE
        ================================================= */}

        <section className="card">

          <div className="card-header">
            <h2>
              👤 Mon compte
            </h2>

            <p>
              Informations du compte actuellement
              connecté.
            </p>
          </div>

          <div className="settings-info">

            <div>
              <span>
                Nom
              </span>

              <strong>
                {user?.nom || "Utilisateur"}
              </strong>
            </div>

            <div>
              <span>
                E-mail
              </span>

              <strong>
                {user?.email || "-"}
              </strong>
            </div>

            <div>
              <span>
                Rôle
              </span>

              <strong>
                {user?.role || "-"}
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            SÉCURITÉ
        ================================================= */}

        <section className="card">

          <div className="card-header">

            <h2>
              🔐 Sécurité
            </h2>

            <p>
              Modifiez le mot de passe de votre compte.
            </p>

          </div>

          {messageMotDePasse && (
            <div className="alert alert-success">
              {messageMotDePasse}
            </div>
          )}

          {erreurMotDePasse && (
            <div className="alert alert-error">
              {erreurMotDePasse}
            </div>
          )}

          <form
            className="form-grid"
            onSubmit={modifierMotDePasse}
          >

            <div className="form-group">

              <label>
                Ancien mot de passe
              </label>

              <input
                type={
                  afficherMotDePasse
                    ? "text"
                    : "password"
                }
                value={ancienMotDePasse}
                onChange={(e) =>
                  setAncienMotDePasse(
                    e.target.value,
                  )
                }
                placeholder="Votre mot de passe actuel"
              />

            </div>

            <div className="form-group">

              <label>
                Nouveau mot de passe
              </label>

              <input
                type={
                  afficherMotDePasse
                    ? "text"
                    : "password"
                }
                value={nouveauMotDePasse}
                onChange={(e) =>
                  setNouveauMotDePasse(
                    e.target.value,
                  )
                }
                placeholder="Minimum 6 caractères"
              />

            </div>

            <div className="form-group">

              <label>
                Confirmer le nouveau mot de passe
              </label>

              <input
                type={
                  afficherMotDePasse
                    ? "text"
                    : "password"
                }
                value={confirmationMotDePasse}
                onChange={(e) =>
                  setConfirmationMotDePasse(
                    e.target.value,
                  )
                }
                placeholder="Répétez le nouveau mot de passe"
              />

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="btn-primary"
                disabled={chargementMotDePasse}
              >
                {chargementMotDePasse
                  ? "Modification..."
                  : "Modifier le mot de passe"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setAfficherMotDePasse(
                    !afficherMotDePasse,
                  )
                }
              >
                {afficherMotDePasse
                  ? "Masquer"
                  : "Afficher"}
              </button>

            </div>

          </form>

        </section>

        {/* =================================================
            APPLICATION
        ================================================= */}

        <section className="card">

          <div className="card-header">

            <h2>
              ⚙️ Application
            </h2>

            <p>
              Informations générales du système.
            </p>

          </div>

          <div className="settings-info">

            <div>
              <span>
                Application
              </span>

              <strong>
                TSC Management
              </strong>
            </div>

            <div>
              <span>
                Version
              </span>

              <strong>
                1.0.0
              </strong>
            </div>

            <div>
              <span>
                Année
              </span>

              <strong>
                2026
              </strong>
            </div>

            <div>
              <span>
                Structure
              </span>

              <strong>
                Temple du Savoir Club
              </strong>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}