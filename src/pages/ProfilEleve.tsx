import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

type Paiement = {
  numero: string;
  motif: string;
  montant: number;
  date: string;
};

type Eleve = {
  matricule: string;
  nom: string;
  contact: string;
  formation: string;
  niveau: string;
  dateInscription: string;
  totalDu: number;
  totalPaye: number;
  inscriptionId?: number;
  paiements: Paiement[];
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

export default function ProfilEleve() {
  const { matricule } = useParams<{
    matricule: string;
  }>();

  const [eleve, setEleve] = useState<Eleve | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerEleve() {
      if (!matricule) {
        setErreur("Matricule introuvable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErreur("");

        const response = await api.get(
          `/eleves/${matricule}`
        );

        setEleve(response.data);
      } catch (error: any) {
        console.error(
          "Erreur chargement élève :",
          error
        );

        setErreur(
          error?.response?.data?.message ||
            "Impossible de charger le profil."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerEleve();
  }, [matricule]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          Chargement du profil...
        </div>
      </div>
    );
  }

  if (erreur || !eleve) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          {erreur || "Élève introuvable."}
        </div>

        <Link
          to="/eleves"
          className="btn-secondary"
        >
          ← Retour aux élèves
        </Link>
      </div>
    );
  }

  const reste = Math.max(
    eleve.totalDu - eleve.totalPaye,
    0
  );

  const pourcentage =
    eleve.totalDu > 0
      ? Math.min(
          (eleve.totalPaye / eleve.totalDu) * 100,
          100
        )
      : 0;

  const statut =
    reste <= 0
      ? "À JOUR"
      : eleve.totalPaye === 0
      ? "IMPAYÉ"
      : "PARTIEL";

  return (
    <div className="page-container">
      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="page-header">
        <div>
          <h1>Profil élève</h1>

          <p>
            Fiche détaillée de l'élève
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <Link
            to="/eleves"
            className="btn-secondary"
          >
            ← Élèves
          </Link>

          <Link
            to="/paiements"
            className="btn-primary"
          >
            Nouveau paiement
          </Link>
        </div>
      </div>

      {/* =================================================
          IDENTITE
      ================================================= */}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {eleve.nom
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2>{eleve.nom}</h2>

            <p>
              {eleve.matricule}
            </p>
          </div>

          <div
            className={`status-badge ${
              statut === "À JOUR"
                ? "status-a-jour"
                : statut === "IMPAYÉ"
                ? "status-impaye"
                : "status-partiel"
            }`}
          >
            {statut}
          </div>
        </div>
      </div>

      {/* =================================================
          INFORMATIONS
      ================================================= */}

      <div className="profile-grid">
        <div className="profile-info-card">
          <h3>Informations personnelles</h3>

          <div className="profile-info-row">
            <span>Nom complet</span>
            <strong>{eleve.nom}</strong>
          </div>

          <div className="profile-info-row">
            <span>Matricule</span>
            <strong>
              {eleve.matricule}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>Contact</span>
            <strong>
              {eleve.contact}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>Date d'inscription</span>
            <strong>
              {formatDate(
                eleve.dateInscription
              )}
            </strong>
          </div>
        </div>

        <div className="profile-info-card">
          <h3>Formation</h3>

          <div className="profile-info-row">
            <span>Formation</span>
            <strong>
              {eleve.formation}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>Niveau</span>
            <strong>
              {eleve.niveau}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>Inscription</span>
            <strong>
              #{eleve.inscriptionId ?? "-"}
            </strong>
          </div>
        </div>
      </div>

      {/* =================================================
          FINANCES
      ================================================= */}

      <div className="profile-finance-card">
        <div className="section-title">
          <div>
            <h2>Situation financière</h2>

            <p>
              État des paiements de la formation
            </p>
          </div>
        </div>

        <div className="finance-grid">
          <div className="finance-item">
            <span>Total dû</span>

            <strong>
              {formatMoney(eleve.totalDu)}
            </strong>
          </div>

          <div className="finance-item">
            <span>Total payé</span>

            <strong>
              {formatMoney(eleve.totalPaye)}
            </strong>
          </div>

          <div className="finance-item">
            <span>Reste à payer</span>

            <strong>
              {formatMoney(reste)}
            </strong>
          </div>
        </div>

        {/* PROGRESSION */}

        <div className="payment-progress">
          <div className="progress-header">
            <span>
              Progression des paiements
            </span>

            <strong>
              {Math.round(pourcentage)} %
            </strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${pourcentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* =================================================
          HISTORIQUE
      ================================================= */}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>
              Historique des paiements
            </h2>

            <p>
              {eleve.paiements.length} paiement(s)
            </p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Reçu</th>
                <th>Date</th>
                <th>Motif</th>
                <th>Montant</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {eleve.paiements.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    Aucun paiement enregistré.
                  </td>
                </tr>
              ) : (
                eleve.paiements.map(
                  (paiement) => (
                    <tr key={paiement.numero}>
                      <td>
                        <strong>
                          {paiement.numero}
                        </strong>
                      </td>

                      <td>
                        {paiement.date}
                      </td>

                      <td>
                        {paiement.motif}
                      </td>

                      <td>
                        <strong>
                          {formatMoney(
                            paiement.montant
                          )}
                        </strong>
                      </td>

                      <td>
                        <Link
                          to={`/recus/${paiement.numero}`}
                          className="btn-secondary"
                        >
                          Voir reçu
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