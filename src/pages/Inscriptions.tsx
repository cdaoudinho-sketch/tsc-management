import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api, {
  signalerModification,
} from "../services/api";

type Formation = {
  id: number;
  nom: string;
  niveau: string;
  prix: number;
};

type InscriptionResponse = {
  message: string;
  matricule: string;

  eleve: {
    id: number;
    matricule: string;
    nom: string;
    contact: string;
    formation: string;
    niveau: string;
    totalDu: number;
    totalPaye: number;
  };

  inscription: {
    id: number;
    eleveId: number;
    formationId: number;
    annee: string;
    montant: number;
    statut: string;
  };
};

function formatMoney(montant: number) {
  return (
    new Intl.NumberFormat("fr-FR").format(montant) +
    " F CFA"
  );
}

function getAnneeScolaire() {
  const annee = new Date().getFullYear();

  return `${annee}-${annee + 1}`;
}

export default function Inscriptions() {
  const navigate = useNavigate();

  // =====================================================
  // ETATS
  // =====================================================

  const [formations, setFormations] =
    useState<Formation[]>([]);

  const [nom, setNom] = useState("");
  const [contact, setContact] = useState("");
  const [formationId, setFormationId] =
    useState("");
  const [annee, setAnnee] =
    useState(getAnneeScolaire());

  const [loading, setLoading] =
    useState(false);

  const [
    chargementFormations,
    setChargementFormations,
  ] = useState(true);

  const [message, setMessage] =
    useState("");

  const [erreur, setErreur] =
    useState("");

  const [resultat, setResultat] =
    useState<InscriptionResponse | null>(null);

  // =====================================================
  // CHARGEMENT DES FORMATIONS
  // =====================================================

  useEffect(() => {
    async function chargerFormations() {
      try {
        setChargementFormations(true);

        const response = await api.get(
          "/inscriptions/formations"
        );

        setFormations(response.data);
      } catch (error) {
        console.error(
          "Erreur chargement formations :",
          error
        );

        setErreur(
          "Impossible de charger les formations."
        );
      } finally {
        setChargementFormations(false);
      }
    }

    chargerFormations();
  }, []);

  // =====================================================
  // FORMATION SELECTIONNEE
  // =====================================================

  const formationSelectionnee =
    formations.find(
      (formation) =>
        formation.id === Number(formationId)
    );

  // =====================================================
  // SOUMISSION
  // =====================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErreur("");
    setResultat(null);

    // ---------------------------------------------------
    // Vérifications frontend
    // ---------------------------------------------------

    if (!nom.trim()) {
      setErreur(
        "Veuillez saisir le nom de l'élève."
      );
      return;
    }

    if (!contact.trim()) {
      setErreur(
        "Veuillez saisir le contact de l'élève."
      );
      return;
    }

    if (!formationId) {
      setErreur(
        "Veuillez sélectionner une formation."
      );
      return;
    }

    if (!annee.trim()) {
      setErreur(
        "Veuillez saisir l'année scolaire."
      );
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // DONNEES ENVOYEES AU BACKEND
      // -------------------------------------------------

      const donnees = {
        nom: nom.trim(),
        contact: contact.trim(),
        formationId: Number(formationId),
        annee: annee.trim(),
      };

      // -------------------------------------------------
      // UNE SEULE REQUETE
      //
      // Le backend crée :
      // - l'élève
      // - le matricule
      // - l'inscription
      // -------------------------------------------------

      const response =
        await api.post<InscriptionResponse>(
          "/inscriptions",
          donnees
        );

      // -------------------------------------------------
      // RESULTAT
      // -------------------------------------------------

      setResultat(response.data);

      setMessage(
        "Élève inscrit avec succès !"
      );

      // -------------------------------------------------
      // ACTUALISATION DU DASHBOARD
      // -------------------------------------------------
      // Informe le Dashboard qu'une donnée
      // vient d'être modifiée.
      // Le Dashboard recharge alors ses statistiques.

      signalerModification();
      console.log("📢 ÉVÉNEMENT TSC ENVOYÉ");
signalerModification();

      // -------------------------------------------------
      // NETTOYAGE DU FORMULAIRE
      // -------------------------------------------------

      setNom("");
      setContact("");
      setFormationId("");

    } catch (error: any) {
      console.error(
        "Erreur inscription :",
        error
      );

      const messageErreur =
        error?.response?.data?.message;

      if (Array.isArray(messageErreur)) {
        setErreur(
          messageErreur.join(" ")
        );
      } else if (messageErreur) {
        setErreur(messageErreur);
      } else {
        setErreur(
          "Une erreur est survenue lors de l'inscription."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="page-container">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="page-header">

        <div>

          <h1>
            Nouvelle inscription
          </h1>

          <p>
            Inscrire un nouvel élève à une formation
          </p>

        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            navigate("/eleves")
          }
        >
          Retour aux élèves
        </button>

      </div>

      {/* =================================================
          MESSAGE DE SUCCES
      ================================================= */}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* =================================================
          MESSAGE D'ERREUR
      ================================================= */}

      {erreur && (
        <div className="alert alert-error">
          {erreur}
        </div>
      )}

      {/* =================================================
          RESULTAT DE L'INSCRIPTION
      ================================================= */}

      {resultat && (

        <div className="success-card">

          <h2>
            Inscription enregistrée
          </h2>

          <div className="success-info">

            <div>

              <span>
                Matricule
              </span>

              <strong>
                {resultat.matricule}
              </strong>

            </div>

            <div>

              <span>
                Élève
              </span>

              <strong>
                {resultat.eleve.nom}
              </strong>

            </div>

            <div>

              <span>
                Formation
              </span>

              <strong>
                {resultat.eleve.formation}{" "}
                {resultat.eleve.niveau}
              </strong>

            </div>

            <div>

              <span>
                Montant total
              </span>

              <strong>
                {formatMoney(
                  resultat.inscription.montant
                )}
              </strong>

            </div>

          </div>

          <div className="success-actions">

            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                navigate(
                  `/eleves/${resultat.matricule}`
                )
              }
            >
              Voir le profil
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setResultat(null);
                setMessage("");
              }}
            >
              Nouvelle inscription
            </button>

          </div>

        </div>

      )}

      {/* =================================================
          FORMULAIRE
      ================================================= */}

      {!resultat && (

        <form
          onSubmit={handleSubmit}
          className="form-card"
        >

          {/* =================================================
              INFORMATIONS DE L'ÉLÈVE
          ================================================= */}

          <div className="form-section">

            <h2>
              Informations de l'élève
            </h2>

            <div className="form-grid">

              {/* NOM */}

              <div className="form-group">

                <label htmlFor="nom">
                  Nom et prénoms
                </label>

                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(event) =>
                    setNom(
                      event.target.value
                    )
                  }
                  placeholder="Ex : COULIBALY Daouda"
                  disabled={loading}
                />

              </div>

              {/* CONTACT */}

              <div className="form-group">

                <label htmlFor="contact">
                  Contact
                </label>

                <input
                  id="contact"
                  type="text"
                  value={contact}
                  onChange={(event) =>
                    setContact(
                      event.target.value
                    )
                  }
                  placeholder="Ex : 0700000001"
                  disabled={loading}
                />

              </div>

            </div>

          </div>

          {/* =================================================
              FORMATION
          ================================================= */}

          <div className="form-section">

            <h2>
              Formation
            </h2>

            <div className="form-grid">

              {/* FORMATION */}

              <div className="form-group">

                <label htmlFor="formation">
                  Formation
                </label>

                <select
                  id="formation"
                  value={formationId}
                  onChange={(event) =>
                    setFormationId(
                      event.target.value
                    )
                  }
                  disabled={
                    loading ||
                    chargementFormations
                  }
                >

                  <option value="">
                    {chargementFormations
                      ? "Chargement..."
                      : "Sélectionner une formation"}
                  </option>

                  {formations.map(
                    (formation) => (

                      <option
                        key={formation.id}
                        value={formation.id}
                      >
                        {formation.nom}{" "}
                        {formation.niveau} —{" "}
                        {formatMoney(
                          formation.prix
                        )}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* ANNEE */}

              <div className="form-group">

                <label htmlFor="annee">
                  Année scolaire
                </label>

                <input
                  id="annee"
                  type="text"
                  value={annee}
                  onChange={(event) =>
                    setAnnee(
                      event.target.value
                    )
                  }
                  placeholder="Ex : 2026-2027"
                  disabled={loading}
                />

              </div>

            </div>

          </div>

          {/* =================================================
              RESUME FORMATION
          ================================================= */}

          {formationSelectionnee && (

            <div className="formation-resume">

              <h3>
                Résumé de la formation
              </h3>

              <div className="resume-grid">

                <div>

                  <span>
                    Formation
                  </span>

                  <strong>
                    {formationSelectionnee.nom}
                  </strong>

                </div>

                <div>

                  <span>
                    Niveau
                  </span>

                  <strong>
                    {formationSelectionnee.niveau}
                  </strong>

                </div>

                <div>

                  <span>
                    Prix total
                  </span>

                  <strong>
                    {formatMoney(
                      formationSelectionnee.prix
                    )}
                  </strong>

                </div>

              </div>

              {/* =================================================
                  ECHEANCIER INDICATIF
              ================================================= */}

              <div className="tranches">

                <h4>
                  Échéancier de paiement
                </h4>

                <div className="tranches-grid">

                  <div className="tranche">

                    <span>
                      1ère tranche
                    </span>

                    <strong>
                      {formatMoney(
                        Math.ceil(
                          formationSelectionnee.prix /
                            2
                        )
                      )}
                    </strong>

                  </div>

                  <div className="tranche">

                    <span>
                      2ème tranche
                    </span>

                    <strong>
                      {formatMoney(
                        Math.floor(
                          formationSelectionnee.prix /
                            2
                        )
                      )}
                    </strong>

                  </div>

                </div>

                <p>
                  Le montant de la formation
                  comprend les frais d'inscription.
                  Aucun frais d'inscription
                  supplémentaire n'est ajouté.
                </p>

              </div>

            </div>

          )}

          {/* =================================================
              BOUTONS
          ================================================= */}

          <div className="form-actions">

            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                navigate("/eleves")
              }
              disabled={loading}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={
                loading ||
                chargementFormations
              }
            >
              {loading
                ? "Enregistrement..."
                : "Enregistrer l'inscription"}
            </button>

          </div>

        </form>

      )}

    </div>
  );
}