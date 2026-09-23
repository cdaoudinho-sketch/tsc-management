import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

type Paiement = {
  id: number;
  numeroRecu: string;
  montant: number;
  modePaiement: string;
  observation?: string | null;
  datePaiement: string;
  matricule: string;
  nom: string;
  contact: string;
  formation: string;
  niveau: string;
  annee: string;
};

function formatMoney(montant: number) {
  return (
    new Intl.NumberFormat("fr-FR").format(montant) +
    " F CFA"
  );
}

export default function Recus() {
  const [paiements, setPaiements] = useState<Paiement[]>(
    []
  );

  const [recherche, setRecherche] = useState("");
  const [mode, setMode] = useState("TOUS");

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerPaiements() {
      try {
        setLoading(true);
        setErreur("");

        const response = await api.get("/paiements");

        setPaiements(response.data);
      } catch (error: any) {
        console.error(
          "Erreur chargement reçus :",
          error
        );

        setErreur(
          error?.response?.data?.message ||
            "Impossible de charger les reçus."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerPaiements();
  }, []);

  // =====================================================
  // FILTRAGE
  // =====================================================

  const paiementsFiltres = useMemo(() => {
    const terme = recherche
      .trim()
      .toLowerCase();

    return paiements.filter((paiement) => {
      const correspondRecherche =
        !terme ||
        paiement.numeroRecu
          .toLowerCase()
          .includes(terme) ||
        paiement.nom
          .toLowerCase()
          .includes(terme) ||
        paiement.matricule
          .toLowerCase()
          .includes(terme);

      const correspondMode =
        mode === "TOUS" ||
        paiement.modePaiement === mode;

      return (
        correspondRecherche &&
        correspondMode
      );
    });
  }, [paiements, recherche, mode]);

  // =====================================================
  // STATISTIQUES
  // =====================================================

  const totalRecus = paiements.length;

  const montantTotal = paiements.reduce(
    (total, paiement) =>
      total + paiement.montant,
    0
  );

  const montantFiltre = paiementsFiltres.reduce(
    (total, paiement) =>
      total + paiement.montant,
    0
  );

  const modes = Array.from(
    new Set(
      paiements.map(
        (paiement) =>
          paiement.modePaiement
      )
    )
  );

  // =====================================================
  // AFFICHAGE
  // =====================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          Chargement des reçus...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="page-header">
        <div>
          <h1>Reçus</h1>

          <p>
            Consultation et gestion des reçus de paiement
          </p>
        </div>
      </div>

      {/* =================================================
          ERREUR
      ================================================= */}

      {erreur && (
        <div className="alert alert-error">
          {erreur}
        </div>
      )}

      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <span className="stat-label">
              Nombre de reçus
            </span>

            <strong className="stat-value">
              {totalRecus}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span className="stat-label">
              Montant encaissé
            </span>

            <strong className="stat-value">
              {formatMoney(montantTotal)}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span className="stat-label">
              Résultat de la recherche
            </span>

            <strong className="stat-value">
              {paiementsFiltres.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span className="stat-label">
              Montant filtré
            </span>

            <strong className="stat-value">
              {formatMoney(montantFiltre)}
            </strong>
          </div>
        </div>
      </div>

      {/* =================================================
          FILTRES
      ================================================= */}

      <div className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="recherche">
              Rechercher
            </label>

            <input
              id="recherche"
              type="text"
              value={recherche}
              onChange={(event) =>
                setRecherche(
                  event.target.value
                )
              }
              placeholder="Reçu, nom ou matricule..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="mode">
              Mode de paiement
            </label>

            <select
              id="mode"
              value={mode}
              onChange={(event) =>
                setMode(event.target.value)
              }
            >
              <option value="TOUS">
                Tous les modes
              </option>

              {modes.map((modePaiement) => (
                <option
                  key={modePaiement}
                  value={modePaiement}
                >
                  {modePaiement}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =================================================
          TABLEAU
      ================================================= */}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>
              Liste des reçus
            </h2>

            <p>
              {paiementsFiltres.length} reçu(s)
            </p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Reçu</th>
                <th>Date</th>
                <th>Élève</th>
                <th>Formation</th>
                <th>Montant</th>
                <th>Mode</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paiementsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    Aucun reçu trouvé.
                  </td>
                </tr>
              ) : (
                paiementsFiltres.map(
                  (paiement) => (
                    <tr key={paiement.id}>
                      <td>
                        <strong>
                          {paiement.numeroRecu}
                        </strong>
                      </td>

                      <td>
                        {new Date(
                          paiement.datePaiement
                        ).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>

                      <td>
                        <strong>
                          {paiement.nom}
                        </strong>

                        <br />

                        <small>
                          {paiement.matricule}
                        </small>
                      </td>

                      <td>
                        {paiement.formation}{" "}
                        {paiement.niveau}
                      </td>

                      <td>
                        <strong>
                          {formatMoney(
                            paiement.montant
                          )}
                        </strong>
                      </td>

                      <td>
                        {paiement.modePaiement}
                      </td>

                      <td>
                        <Link
                          to={`/recus/${paiement.numeroRecu}`}
                          className="btn-secondary"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}