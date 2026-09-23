import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  ajouterUtilisateur,
  modifierUtilisateur,
  obtenirUtilisateurs,
  supprimerUtilisateur,
  type RoleUtilisateur,
  type Utilisateur,
} from "../services/utilisateurs";

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] =
    useState<Utilisateur[]>([]);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<RoleUtilisateur>("AGENT");

  const [editionId, setEditionId] =
    useState<number | null>(null);

  const [recherche, setRecherche] = useState("");

  const [chargement, setChargement] =
    useState(true);

  const [enregistrement, setEnregistrement] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [erreur, setErreur] =
    useState("");

  async function chargerUtilisateurs() {
    try {
      setChargement(true);

      const data =
        await obtenirUtilisateurs();

      setUtilisateurs(data);
    } catch (error: any) {
      setErreur(
        error?.response?.data?.message ||
          "Impossible de charger les utilisateurs.",
      );
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  function reinitialiser() {
    setNom("");
    setEmail("");
    setPassword("");
    setRole("AGENT");
    setEditionId(null);
  }

  function modifier(user: Utilisateur) {
    setEditionId(user.id);
    setNom(user.nom);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function enregistrer(
    event: FormEvent,
  ) {
    event.preventDefault();

    setMessage("");
    setErreur("");

    if (!nom.trim()) {
      setErreur("Le nom est obligatoire.");
      return;
    }

    if (!email.trim()) {
      setErreur("L'email est obligatoire.");
      return;
    }

    if (
      !editionId &&
      password.length < 6
    ) {
      setErreur(
        "Le mot de passe doit contenir au moins 6 caractères.",
      );
      return;
    }

    try {
      setEnregistrement(true);

      if (editionId) {
        const data: any = {
          nom: nom.trim(),
          email: email.trim(),
          role,
        };

        if (password.trim()) {
          data.password = password;
        }

        await modifierUtilisateur(
          editionId,
          data,
        );

        setMessage(
          "Utilisateur modifié avec succès.",
        );
      } else {
        await ajouterUtilisateur({
          nom: nom.trim(),
          email: email.trim(),
          password,
          role,
        });

        setMessage(
          "Utilisateur créé avec succès.",
        );
      }

      reinitialiser();

      await chargerUtilisateurs();
    } catch (error: any) {
      setErreur(
        error?.response?.data?.message ||
          "Une erreur est survenue.",
      );
    } finally {
      setEnregistrement(false);
    }
  }

  async function changerStatut(
    user: Utilisateur,
  ) {
    try {
      setErreur("");
      setMessage("");

      await modifierUtilisateur(
        user.id,
        {
          actif: !user.actif,
        },
      );

      setMessage(
        user.actif
          ? "Utilisateur désactivé."
          : "Utilisateur activé.",
      );

      await chargerUtilisateurs();
    } catch (error: any) {
      setErreur(
        error?.response?.data?.message ||
          "Impossible de modifier le statut.",
      );
    }
  }

  async function supprimer(
    user: Utilisateur,
  ) {
    const confirmation =
      window.confirm(
        `Voulez-vous supprimer ${user.nom} ?`,
      );

    if (!confirmation) {
      return;
    }

    try {
      setErreur("");
      setMessage("");

      await supprimerUtilisateur(
        user.id,
      );

      setMessage(
        "Utilisateur supprimé.",
      );

      if (editionId === user.id) {
        reinitialiser();
      }

      await chargerUtilisateurs();
    } catch (error: any) {
      setErreur(
        error?.response?.data?.message ||
          "Impossible de supprimer l'utilisateur.",
      );
    }
  }

  const utilisateursFiltres =
    utilisateurs.filter((user) => {
      const terme =
        recherche.toLowerCase().trim();

      if (!terme) {
        return true;
      }

      return (
        user.nom
          .toLowerCase()
          .includes(terme) ||
        user.email
          .toLowerCase()
          .includes(terme)
      );
    });

  const admins =
    utilisateurs.filter(
      (u) => u.role === "ADMIN",
    ).length;

  const agents =
    utilisateurs.filter(
      (u) => u.role === "AGENT",
    ).length;

  const actifs =
    utilisateurs.filter(
      (u) => u.actif,
    ).length;

  return (
    <div className="utilisateurs-page">
      <div className="page-header">
        <div>
          <h1>Utilisateurs</h1>

          <p>
            Gestion des comptes et des
            droits d'accès à TSC Management.
          </p>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <span>Total utilisateurs</span>
          <strong>
            {utilisateurs.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Administrateurs</span>
          <strong>
            {admins}
          </strong>
        </div>

        <div className="stat-card">
          <span>Agents</span>
          <strong>
            {agents}
          </strong>
        </div>

        <div className="stat-card">
          <span>Comptes actifs</span>
          <strong>
            {actifs}
          </strong>
        </div>

      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {erreur && (
        <div className="alert alert-error">
          {erreur}
        </div>
      )}

      <div className="content-grid">

        <section className="card">

          <div className="card-header">
            <h2>
              {editionId
                ? "Modifier l'utilisateur"
                : "Nouvel utilisateur"}
            </h2>
          </div>

          <form
            className="form-grid"
            onSubmit={enregistrer}
          >

            <div className="form-group">
              <label>
                Nom complet
              </label>

              <input
                type="text"
                value={nom}
                onChange={(e) =>
                  setNom(e.target.value)
                }
                placeholder="Ex : Agent TSC"
              />
            </div>

            <div className="form-group">
              <label>
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="agent@tsc-management.ci"
              />
            </div>

            <div className="form-group">
              <label>
                Mot de passe
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder={
                  editionId
                    ? "Laisser vide pour conserver"
                    : "Minimum 6 caractères"
                }
              />
            </div>

            <div className="form-group">
              <label>
                Rôle
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value as RoleUtilisateur,
                  )
                }
              >
                <option value="AGENT">
                  AGENT
                </option>

                <option value="ADMIN">
                  ADMIN
                </option>
              </select>
            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="btn-primary"
                disabled={enregistrement}
              >
                {enregistrement
                  ? "Enregistrement..."
                  : editionId
                    ? "Enregistrer"
                    : "Créer l'utilisateur"}
              </button>

              {editionId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={reinitialiser}
                >
                  Annuler
                </button>
              )}

            </div>

          </form>
        </section>

        <section className="card">

          <div className="card-header">

            <div>
              <h2>
                Liste des utilisateurs
              </h2>

              <p>
                {utilisateursFiltres.length} compte(s)
              </p>
            </div>

          </div>

          <div className="filters-bar">

            <input
              type="text"
              value={recherche}
              onChange={(e) =>
                setRecherche(e.target.value)
              }
              placeholder="Rechercher..."
            />

          </div>

          {chargement ? (
            <div className="empty-state">
              Chargement...
            </div>
          ) : (
            <div className="table-container">

              <table className="data-table">

                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {utilisateursFiltres.map(
                    (user) => (
                      <tr key={user.id}>

                        <td>
                          <strong>
                            {user.nom}
                          </strong>

                          <br />

                          <small>
                            {user.email}
                          </small>
                        </td>

                        <td>
                          <span className="status-badge">
                            {user.role}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              user.actif
                                ? "status-badge status-active"
                                : "status-badge status-inactive"
                            }
                          >
                            {user.actif
                              ? "Actif"
                              : "Inactif"}
                          </span>
                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              type="button"
                              className="btn-small"
                              onClick={() =>
                                modifier(user)
                              }
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              className="btn-small"
                              onClick={() =>
                                changerStatut(user)
                              }
                            >
                              {user.actif
                                ? "Désactiver"
                                : "Activer"}
                            </button>

                            <button
                              type="button"
                              className="btn-small btn-danger"
                              onClick={() =>
                                supprimer(user)
                              }
                            >
                              Supprimer
                            </button>

                          </div>

                        </td>

                      </tr>
                    ),
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}