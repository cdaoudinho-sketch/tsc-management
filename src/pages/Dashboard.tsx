import { useEffect, useState } from "react";
import api from "../services/api";

type DashboardData = {
  totalEleves: number;
  totalInscriptions: number;
  totalEncaisse: number;
  totalImpayes: number;
};

type FormationStat = {
  formation: string;
  niveau: string;
  nombreEleves: number;
  totalDu: number;
  totalPaye: number;
};

type EvolutionMensuelle = {
  mois: number;
  nomMois: string;
  montant: number;
};

type Impaye = {
  matricule: string;
  nom: string;
  formation: string;
  niveau: string;
  totalDu: number;
  totalPaye: number;
  reste: number;
};

type DernierPaiement = {
  id: number;
  numeroRecu: string;
  montant: number;
  modePaiement: string;
  datePaiement: string;
  nom: string;
  matricule: string;
  formation: string;
  niveau: string;
};

function formatMoney(montant: number) {
  return (
    new Intl.NumberFormat("fr-FR").format(montant) +
    " F CFA"
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [stats, setStats] =
    useState<DashboardData | null>(null);

  const [formations, setFormations] =
    useState<FormationStat[]>([]);

  const [evolution, setEvolution] =
    useState<EvolutionMensuelle[]>([]);

  const [impayes, setImpayes] =
    useState<Impaye[]>([]);

  const [paiements, setPaiements] =
    useState<DernierPaiement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [erreur, setErreur] =
    useState("");

  useEffect(() => {
    async function chargerDashboard() {
      try {
        setLoading(true);
        setErreur("");

        const [
          dashboardResponse,
          formationsResponse,
          evolutionResponse,
          impayesResponse,
          paiementsResponse,
        ] = await Promise.all([
          api.get("/dashboard"),
          api.get("/dashboard/formations"),
          api.get(
            "/dashboard/evolution-mensuelle"
          ),
          api.get("/dashboard/impayes"),
          api.get("/paiements"),
        ]);

        setStats(
          dashboardResponse.data
        );

        setFormations(
          formationsResponse.data
        );

        setEvolution(
          evolutionResponse.data
        );

        setImpayes(
          impayesResponse.data
        );

        setPaiements(
          paiementsResponse.data
        );
      } catch (error: any) {
        console.error(
          "Erreur Dashboard :",
          error
        );

        setErreur(
          error?.response?.data?.message ||
            "Impossible de charger le tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          Chargement du tableau de bord...
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          {erreur}
        </div>
      </div>
    );
  }

  const maximumEvolution =
    Math.max(
      ...evolution.map(
        (item) => item.montant
      ),
      1
    );

  return (
    <div className="page-container">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="page-header">
        <div>
          <h1>
            Tableau de bord
          </h1>

          <p>
            Vue générale de TSC Management
          </p>
        </div>
      </div>

      {/* =================================================
          STATISTIQUES PRINCIPALES
      ================================================= */}

      <div className="dashboard-stats">

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">
            Élèves
          </span>

          <strong>
            {stats?.totalEleves ?? 0}
          </strong>

          <small>
            Élèves enregistrés
          </small>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">
            Inscriptions
          </span>

          <strong>
            {stats?.totalInscriptions ?? 0}
          </strong>

          <small>
            Inscriptions actives
          </small>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">
            Encaissements
          </span>

          <strong>
            {formatMoney(
              stats?.totalEncaisse ?? 0
            )}
          </strong>

          <small>
            Total des paiements
          </small>
        </div>

        <div className="dashboard-stat-card dashboard-stat-danger">
          <span className="dashboard-stat-label">
            Impayés
          </span>

          <strong>
            {formatMoney(
              stats?.totalImpayes ?? 0
            )}
          </strong>

          <small>
            Reste à recouvrer
          </small>
        </div>

      </div>

      {/* =================================================
          ÉVOLUTION
      ================================================= */}

      <div className="dashboard-card">

        <div className="dashboard-card-header">
          <div>
            <h2>
              Évolution des encaissements
            </h2>

            <p>
              Montants encaissés par mois
            </p>
          </div>
        </div>

        <div className="dashboard-chart">

          {evolution.length === 0 ? (
            <div className="dashboard-empty">
              Aucune donnée disponible.
            </div>
          ) : (
            evolution.map((item) => {

              const hauteur =
                (item.montant /
                  maximumEvolution) *
                100;

              return (
                <div
                  className="dashboard-bar-wrapper"
                  key={item.mois}
                >
                  <div className="dashboard-bar-value">
                    {item.montant > 0
                      ? new Intl.NumberFormat(
                          "fr-FR"
                        ).format(
                          item.montant
                        )
                      : ""}
                  </div>

                  <div className="dashboard-bar-container">
                    <div
                      className="dashboard-bar"
                      style={{
                        height: `${Math.max(
                          hauteur,
                          item.montant > 0
                            ? 5
                            : 0
                        )}%`,
                      }}
                    />
                  </div>

                  <span>
                    {item.nomMois}
                  </span>
                </div>
              );
            })
          )}

        </div>

      </div>

      {/* =================================================
          FORMATIONS + PAIEMENTS
      ================================================= */}

      <div className="dashboard-two-columns">

        {/* FORMATIONS */}

        <div className="dashboard-card">

          <div className="dashboard-card-header">
            <div>
              <h2>
                Formations
              </h2>

              <p>
                Répartition des élèves
              </p>
            </div>
          </div>

          {formations.length === 0 ? (
            <div className="dashboard-empty">
              Aucune formation.
            </div>
          ) : (
            <div className="formation-list">

              {formations.map(
                (formation) => (
                  <div
                    className="formation-item"
                    key={`${formation.formation}-${formation.niveau}`}
                  >
                    <div>
                      <strong>
                        {formation.formation}
                      </strong>

                      <span>
                        {formation.niveau}
                      </span>
                    </div>

                    <div className="formation-number">
                      {formation.nombreEleves}
                    </div>
                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* DERNIERS PAIEMENTS */}

        <div className="dashboard-card">

          <div className="dashboard-card-header">
            <div>
              <h2>
                Derniers paiements
              </h2>

              <p>
                Les derniers encaissements
              </p>
            </div>
          </div>

          {paiements.length === 0 ? (
            <div className="dashboard-empty">
              Aucun paiement.
            </div>
          ) : (
            <div className="payment-list">

              {paiements
                .slice(0, 5)
                .map((paiement) => (
                  <div
                    className="payment-item"
                    key={paiement.id}
                  >
                    <div>
                      <strong>
                        {paiement.numeroRecu}
                      </strong>

                      <span>
                        {paiement.nom}
                      </span>

                      <small>
                        {formatDate(
                          paiement.datePaiement
                        )}
                      </small>
                    </div>

                    <strong className="payment-amount">
                      {formatMoney(
                        paiement.montant
                      )}
                    </strong>
                  </div>
                ))}

            </div>
          )}

        </div>

      </div>

      {/* =================================================
          IMPAYÉS
      ================================================= */}

      <div className="dashboard-card">

        <div className="dashboard-card-header">
          <div>
            <h2>
              Élèves avec impayés
            </h2>

            <p>
              Élèves ayant un solde restant
            </p>
          </div>

          <strong>
            {impayes.length}
          </strong>
        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Matricule</th>
                <th>Élève</th>
                <th>Formation</th>
                <th>Total dû</th>
                <th>Total payé</th>
                <th>Reste</th>
              </tr>
            </thead>

            <tbody>

              {impayes.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    Aucun impayé. Tous les élèves
                    sont à jour.
                  </td>
                </tr>
              ) : (
                impayes.map((eleve) => (
                  <tr
                    key={eleve.matricule}
                  >
                    <td>
                      <strong>
                        {eleve.matricule}
                      </strong>
                    </td>

                    <td>
                      {eleve.nom}
                    </td>

                    <td>
                      {eleve.formation}{" "}
                      {eleve.niveau}
                    </td>

                    <td>
                      {formatMoney(
                        eleve.totalDu
                      )}
                    </td>

                    <td>
                      {formatMoney(
                        eleve.totalPaye
                      )}
                    </td>

                    <td>
                      <strong className="dashboard-reste">
                        {formatMoney(
                          eleve.reste
                        )}
                      </strong>
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}