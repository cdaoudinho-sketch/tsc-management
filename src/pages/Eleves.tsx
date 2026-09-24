import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { Eleve } from "../types";
import { obtenirEleves } from "../services/eleves";

function formatMoney(montant: number) {
  return `${montant.toLocaleString("fr-FR")} F`;
}

function Eleves() {
  const navigate = useNavigate();

  const [recherche, setRecherche] = useState("");
  const [formation, setFormation] = useState("Toutes");
  const [statut, setStatut] = useState("Tous");

  const [eleves, setEleves] = useState<Eleve[]>([]);

  const [chargement, setChargement] =
    useState(true);

  const [erreur, setErreur] =
    useState("");

  // ==============================
  // CHARGEMENT DES ÉLÈVES
  // ==============================

  async function chargerEleves() {
    try {
      setChargement(true);
      setErreur("");

      const donnees =
        await obtenirEleves();

      setEleves(donnees);
    } catch (error) {
      console.error(error);

      setErreur(
        "Impossible de charger les élèves."
      );
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    // Chargement initial
    chargerEleves();

    // ==========================================
    // ACTUALISATION AUTOMATIQUE
    // ==========================================

    const actualiserEleves = () => {
      chargerEleves();
    };

    window.addEventListener(
      "tsc:data-changed",
      actualiserEleves
    );

    // ==========================================
    // ACTUALISATION DE SÉCURITÉ
    // Toutes les 10 secondes
    // ==========================================

    const intervalle =
      window.setInterval(() => {
        chargerEleves();
      }, 10000);

    // ==========================================
    // NETTOYAGE
    // ==========================================

    return () => {
      window.removeEventListener(
        "tsc:data-changed",
        actualiserEleves
      );

      window.clearInterval(intervalle);
    };
  }, []);

  // ==============================
  // STATUT
  // ==============================

  function obtenirStatut(eleve: Eleve) {
    const reste =
      eleve.totalDu -
      eleve.totalPaye;

    if (reste <= 0) {
      return "À jour";
    }

    if (eleve.totalPaye === 0) {
      return "Impayé";
    }

    return "Partiel";
  }

  // ==============================
  // FILTRAGE
  // ==============================

  const elevesFiltres = useMemo(() => {
    return eleves.filter((eleve) => {
      const rechercheNormalisee =
        recherche
          .toLowerCase()
          .trim();

      const correspondRecherche =
        eleve.nom
          .toLowerCase()
          .includes(
            rechercheNormalisee
          ) ||
        eleve.matricule
          .toLowerCase()
          .includes(
            rechercheNormalisee
          ) ||
        eleve.contact.includes(
          recherche
        );

      const correspondFormation =
        formation === "Toutes" ||
        eleve.formation === formation;

      const correspondStatut =
        statut === "Tous" ||
        obtenirStatut(eleve) ===
          statut;

      return (
        correspondRecherche &&
        correspondFormation &&
        correspondStatut
      );
    });
  }, [
    eleves,
    recherche,
    formation,
    statut,
  ]);

  // ==============================
  // STATISTIQUES
  // ==============================

  const totalEleves =
    eleves.length;

  const totalAffiches =
    elevesFiltres.length;

  const totalImpayes =
    eleves.filter(
      (eleve) =>
        obtenirStatut(eleve) ===
        "Impayé"
    ).length;

  const totalPartiels =
    eleves.filter(
      (eleve) =>
        obtenirStatut(eleve) ===
        "Partiel"
    ).length;

  // ==============================
  // INTERFACE
  // ==============================

  return (
    <div className="page">

      {/* ==============================
          EN-TÊTE
          ============================== */}

      <div className="eleves-header">

        <div>

          <h1>
            Élèves
          </h1>

          <p>
            Gestion des apprenants du TSC
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/inscriptions")
          }
        >
          + Nouvel élève
        </button>

      </div>

      {/* ==============================
          PETITES STATISTIQUES
          ============================== */}

      <div className="stats">

        <div className="card">

          <div className="card-icon">
            👨‍🎓
          </div>

          <div>

            <span>
              Total élèves
            </span>

            <h2>
              {totalEleves}
            </h2>

          </div>

        </div>

        <div className="card">

          <div className="card-icon">
            ⚠️
          </div>

          <div>

            <span>
              Impayés
            </span>

            <h2>
              {totalImpayes}
            </h2>

          </div>

        </div>

        <div className="card">

          <div className="card-icon">
            💰
          </div>

          <div>

            <span>
              Paiements partiels
            </span>

            <h2>
              {totalPartiels}
            </h2>

          </div>

        </div>

      </div>

      {/* ==============================
          FILTRES
          ============================== */}

      <div className="filters">

        <div className="search-box">

          <span>
            🔎
          </span>

          <input
            type="text"
            placeholder="Rechercher par matricule, nom ou contact..."
            value={recherche}
            onChange={(e) =>
              setRecherche(
                e.target.value
              )
            }
          />

        </div>

        <select
          value={formation}
          onChange={(e) =>
            setFormation(
              e.target.value
            )
          }
        >

          <option value="Toutes">
            Toutes les formations
          </option>

          <option value="Informatique">
            Informatique
          </option>

          <option value="Anglais">
            Anglais
          </option>

          <option value="Informatique + Anglais">
            Informatique + Anglais
          </option>

        </select>

        <select
          value={statut}
          onChange={(e) =>
            setStatut(
              e.target.value
            )
          }
        >

          <option value="Tous">
            Tous les statuts
          </option>

          <option value="À jour">
            À jour
          </option>

          <option value="Partiel">
            Partiel
          </option>

          <option value="Impayé">
            Impayé
          </option>

        </select>

      </div>

      {/* ==============================
          TABLEAU
          ============================== */}

      <div className="table-container">

        {chargement && (
          <div className="empty">
            Chargement des élèves...
          </div>
        )}

        {erreur && (
          <div className="empty">
            {erreur}
          </div>
        )}

        {!chargement &&
          !erreur && (

            <table>

              <thead>

                <tr>

                  <th>
                    Matricule
                  </th>

                  <th>
                    Élève
                  </th>

                  <th>
                    Formation
                  </th>

                  <th>
                    Niveau
                  </th>

                  <th>
                    Total dû
                  </th>

                  <th>
                    Payé
                  </th>

                  <th>
                    Reste
                  </th>

                  <th>
                    Statut
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {elevesFiltres.map(
                  (eleve) => {

                    const reste =
                      Math.max(
                        0,
                        eleve.totalDu -
                          eleve.totalPaye
                      );

                    const statutEleve =
                      obtenirStatut(
                        eleve
                      );

                    return (

                      <tr
                        key={
                          eleve.matricule
                        }
                      >

                        {/* MATRICULE */}

                        <td>

                          <strong className="matricule">

                            {
                              eleve.matricule
                            }

                          </strong>

                        </td>

                        {/* ELEVE */}

                        <td>

                          <strong>
                            {eleve.nom}
                          </strong>

                          <small className="contact">
                            {eleve.contact}
                          </small>

                        </td>

                        {/* FORMATION */}

                        <td>
                          {eleve.formation}
                        </td>

                        {/* NIVEAU */}

                        <td>
                          {eleve.niveau}
                        </td>

                        {/* TOTAL DU */}

                        <td>

                          {formatMoney(
                            eleve.totalDu
                          )}

                        </td>

                        {/* PAYE */}

                        <td>

                          {formatMoney(
                            eleve.totalPaye
                          )}

                        </td>

                        {/* RESTE */}

                        <td>

                          <strong>

                            {formatMoney(
                              reste
                            )}

                          </strong>

                        </td>

                        {/* STATUT */}

                        <td>

                          <span
                            className={`status ${statutEleve
                              .toLowerCase()
                              .replace(
                                " ",
                                "-"
                              )}`}
                          >

                            {statutEleve}

                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="actions">

                            {/* VOIR PROFIL */}

                            <Link
                              to={`/eleves/${eleve.matricule}`}
                              className="action-button"
                              title="Voir le profil"
                            >
                              👁
                            </Link>

                            {/* PAIEMENT */}

                            <Link
                              to={`/paiements?matricule=${eleve.matricule}`}
                              className="action-button"
                              title="Effectuer un paiement"
                            >
                              💰
                            </Link>

                            {/* RECUS */}

                            <Link
                              to={`/recus?matricule=${eleve.matricule}`}
                              className="action-button"
                              title="Voir les reçus"
                            >
                              🧾
                            </Link>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          )}

        {!chargement &&
          !erreur &&
          elevesFiltres.length ===
            0 && (

            <div className="empty">

              Aucun élève trouvé.

            </div>

          )}

      </div>

      {/* ==============================
          PIED DU TABLEAU
          ============================== */}

      <div className="table-footer">

        {totalAffiches} élève
        {totalAffiches > 1
          ? "s"
          : ""}{" "}
        affiché
        {totalAffiches > 1
          ? "s"
          : ""}

      </div>

    </div>
  );
}

export default Eleves;