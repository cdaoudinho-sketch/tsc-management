import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import logoTsc from "../assets/logo-tsc.png";

type PaiementDetail = {
  id: number;
  numeroRecu: string;
  montant: number;
  modePaiement: string;
  observation?: string | null;
  datePaiement: string;

  eleve: {
    id: number;
    matricule: string;
    nom: string;
    contact: string;
  };

  formation: {
    id: number;
    nom: string;
    niveau: string;
    prix: number;
  };

  inscription: {
    id: number;
    annee: string;
    montant: number;
    totalPaye: number;
    solde: number;
    statut: string;
  };
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

export default function DetailRecu() {
  const { numero } = useParams<{ numero: string }>();

  const [paiement, setPaiement] =
    useState<PaiementDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerRecu() {
      if (!numero) {
        setErreur("Numéro de reçu introuvable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErreur("");

        const response = await api.get(
          `/paiements/${numero}`
        );

        setPaiement(response.data);
      } catch (error: any) {
        console.error(
          "Erreur chargement reçu :",
          error
        );

        setErreur(
          error?.response?.data?.message ||
            "Impossible de charger le reçu."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerRecu();
  }, [numero]);

  // =====================================================
  // IMPRESSION
  // =====================================================

  function imprimer() {
    window.print();
  }

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (loading) {
    return (
      <div className="page-container no-print">
        <div className="loading">
          Chargement du reçu...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERREUR
  // =====================================================

  if (erreur || !paiement) {
    return (
      <div className="page-container no-print">
        <div className="alert alert-error">
          {erreur || "Reçu introuvable."}
        </div>

        <Link
          to="/recus"
          className="btn-secondary"
        >
          Retour aux reçus
        </Link>
      </div>
    );
  }

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="receipt-container">

      {/* =================================================
          BARRE D'ACTIONS
      ================================================= */}

      <div className="receipt-actions no-print">
        <Link
          to="/recus"
          className="btn-secondary"
        >
          ← Retour
        </Link>

        <button
          type="button"
          className="btn-primary"
          onClick={imprimer}
        >
          🖨 Imprimer le reçu
        </button>
      </div>

      {/* =================================================
          REÇU A5
      ================================================= */}

      <div className="receipt-page">

        {/* =================================================
            EN-TÊTE
        ================================================= */}

        <div className="receipt-header">

          <img
            src={logoTsc}
            alt="Logo Temple du Savoir Club"
            className="receipt-logo-image"
          />

          <div className="receipt-title-block">
            <h1>
              TEMPLE DU SAVOIR CLUB
            </h1>

            <p>
              Formation • Excellence • Éducation
            </p>
          </div>

        </div>

        <div className="receipt-separator" />

        {/* =================================================
            TITRE
        ================================================= */}

        <div className="receipt-heading">
          <h2>REÇU DE PAIEMENT</h2>

          <div className="receipt-number">
            {paiement.numeroRecu}
          </div>
        </div>

        {/* =================================================
            INFORMATIONS ÉLÈVE
        ================================================= */}

        <div className="receipt-section">

          <div className="receipt-row">
            <span>Élève</span>

            <strong>
              {paiement.eleve.nom}
            </strong>
          </div>

          <div className="receipt-row">
            <span>Matricule</span>

            <strong>
              {paiement.eleve.matricule}
            </strong>
          </div>

          <div className="receipt-row">
            <span>Contact</span>

            <strong>
              {paiement.eleve.contact}
            </strong>
          </div>

          <div className="receipt-row">
            <span>Formation</span>

            <strong>
              {paiement.formation.nom}{" "}
              {paiement.formation.niveau}
            </strong>
          </div>

          <div className="receipt-row">
            <span>Année</span>

            <strong>
              {paiement.inscription.annee}
            </strong>
          </div>

        </div>

        <div className="receipt-separator" />

        {/* =================================================
            INFORMATIONS PAIEMENT
        ================================================= */}

        <div className="receipt-section">

          <div className="receipt-row">
            <span>Date</span>

            <strong>
              {formatDate(
                paiement.datePaiement
              )}
            </strong>
          </div>

          <div className="receipt-row">
            <span>Mode</span>

            <strong>
              {paiement.modePaiement}
            </strong>
          </div>

          {paiement.observation && (
            <div className="receipt-row">
              <span>Observation</span>

              <strong>
                {paiement.observation}
              </strong>
            </div>
          )}

        </div>

        {/* =================================================
            MONTANT PRINCIPAL
        ================================================= */}

        <div className="receipt-amount-box">

          <span>
            MONTANT PAYÉ
          </span>

          <strong>
            {formatMoney(
              paiement.montant
            )}
          </strong>

        </div>

        {/* =================================================
            SITUATION FINANCIÈRE
        ================================================= */}

        <div className="receipt-finance">

          <div className="receipt-finance-row">
            <span>
              Total formation
            </span>

            <strong>
              {formatMoney(
                paiement.inscription.montant
              )}
            </strong>
          </div>

          <div className="receipt-finance-row">
            <span>
              Total payé
            </span>

            <strong>
              {formatMoney(
                paiement.inscription.totalPaye
              )}
            </strong>
          </div>

          <div className="receipt-finance-row receipt-solde">
            <span>
              Solde restant
            </span>

            <strong>
              {formatMoney(
                paiement.inscription.solde
              )}
            </strong>
          </div>

        </div>

        {/* =================================================
            STATUT
        ================================================= */}

        <div
          className={`receipt-status ${
            paiement.inscription.statut ===
            "À JOUR"
              ? "receipt-status-ok"
              : "receipt-status-partiel"
          }`}
        >
          {paiement.inscription.statut}
        </div>

        {/* =================================================
            PIED DE PAGE
        ================================================= */}

        <div className="receipt-footer">

          <p>
            Merci pour votre confiance.
          </p>

          <div className="receipt-signature">

            <span>
              Signature / Cachet
            </span>

            <div />

          </div>

          <small>
            Document généré automatiquement par
            TSC Management
          </small>

        </div>

      </div>
    </div>
  );
}