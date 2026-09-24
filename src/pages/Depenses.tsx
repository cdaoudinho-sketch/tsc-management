import { useEffect, useMemo, useState } from "react";

import {
  ajouterDepense,
  modifierDepense,
  obtenirDepenses,
  obtenirStatistiquesDepenses,
  supprimerDepense,
  type Depense,
  type StatistiquesDepenses,
} from "../services/depenses";

import { signalerModification } from "../services/api";

const CATEGORIES = [
  "Courant",
  "Eau",
  "Électricité",
  "Internet",
  "Transport",
  "Nourriture",
  "Salaires",
  "Loyer",
  "Matériel informatique",
  "Fournitures",
  "Communication",
  "Événement",
  "Formation",
  "Entretien",
  "Autres",
];

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

function datePourInput(date: string) {
  const d = new Date(date);

  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

type FormulaireDepense = {
  libelle: string;
  categorie: string;
  montant: string;
  beneficiaire: string;
  observation: string;
  dateDepense: string;
};

const formulaireInitial: FormulaireDepense = {
  libelle: "",
  categorie: "Courant",
  montant: "",
  beneficiaire: "",
  observation: "",
  dateDepense: new Date().toISOString().split("T")[0],
};

export default function Depenses() {
  const [depenses, setDepenses] = useState<Depense[]>([]);

  const [statistiques, setStatistiques] =
    useState<StatistiquesDepenses | null>(null);

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const [recherche, setRecherche] = useState("");
  const [categorieFiltre, setCategorieFiltre] =
    useState("");

  const [formulaire, setFormulaire] =
    useState<FormulaireDepense>(
      formulaireInitial
    );

  const [editionId, setEditionId] =
    useState<number | null>(null);

  const [afficherFormulaire, setAfficherFormulaire] =
    useState(false);

  const [enregistrement, setEnregistrement] =
    useState(false);

  // =====================================================
  // CHARGEMENT
  // =====================================================

  async function chargerDonnees() {
    try {
      setLoading(true);
      setErreur("");

      const [liste, stats] =
        await Promise.all([
          obtenirDepenses(),
          obtenirStatistiquesDepenses(),
        ]);

      setDepenses(liste);
      setStatistiques(stats);
    } catch (error: any) {
      console.error(
        "Erreur chargement dépenses :",
        error
      );

      setErreur(
        error?.response?.data?.message ||
          "Impossible de charger les dépenses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    chargerDonnees();
  }, []);

  // =====================================================
  // FORMULAIRE
  // =====================================================

  function modifierChamp(
    champ: keyof FormulaireDepense,
    valeur: string
  ) {
    setFormulaire((ancien) => ({
      ...ancien,
      [champ]: valeur,
    }));
  }

  function ouvrirAjout() {
    setEditionId(null);

    setFormulaire({
      ...formulaireInitial,
      dateDepense:
        new Date().toISOString().split("T")[0],
    });

    setAfficherFormulaire(true);
  }

  function ouvrirModification(
    depense: Depense
  ) {
    setEditionId(depense.id);

    setFormulaire({
      libelle: depense.libelle,
      categorie: depense.categorie,
      montant: String(depense.montant),
      beneficiaire:
        depense.beneficiaire || "",
      observation:
        depense.observation || "",
      dateDepense:
        datePourInput(depense.dateDepense),
    });

    setAfficherFormulaire(true);
  }

  function fermerFormulaire() {
    setAfficherFormulaire(false);
    setEditionId(null);
    setFormulaire(formulaireInitial);
  }

  // =====================================================
  // ENREGISTREMENT
  // =====================================================

  async function enregistrerDepense(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setErreur("");

    if (!formulaire.libelle.trim()) {
      setErreur(
        "Veuillez renseigner le libellé."
      );
      return;
    }

    const montant =
      Number(formulaire.montant);

    if (!Number.isFinite(montant) || montant <= 0) {
      setErreur(
        "Veuillez saisir un montant valide."
      );
      return;
    }

    try {
      setEnregistrement(true);

      const data = {
        libelle: formulaire.libelle.trim(),
        categorie: formulaire.categorie,
        montant,
        beneficiaire:
          formulaire.beneficiaire.trim() ||
          undefined,
        observation:
          formulaire.observation.trim() ||
          undefined,
        dateDepense:
          formulaire.dateDepense,
      };

      // =================================================
      // MODIFICATION
      // =================================================

      if (editionId) {
        await modifierDepense(
          editionId,
          data
        );
      }

      // =================================================
      // AJOUT
      // =================================================

      else {
        await ajouterDepense(data);
      }

      // Fermer le formulaire
      fermerFormulaire();

      // Actualiser la page Dépenses
      await chargerDonnees();

      // Actualiser immédiatement le Dashboard
      signalerModification();

    } catch (error: any) {
      console.error(
        "Erreur enregistrement dépense :",
        error
      );

      setErreur(
        error?.response?.data?.message ||
          "Impossible d'enregistrer la dépense."
      );
    } finally {
      setEnregistrement(false);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  async function supprimer(
    depense: Depense
  ) {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer la dépense "${depense.libelle}" de ${formatMoney(
        depense.montant
      )} ?`
    );

    if (!confirmation) {
      return;
    }

    try {
      setErreur("");

      await supprimerDepense(depense.id);

      // Actualiser la page Dépenses
      await chargerDonnees();

      // Actualiser immédiatement le Dashboard
      signalerModification();

    } catch (error: any) {
      console.error(
        "Erreur suppression :",
        error
      );

      setErreur(
        error?.response?.data?.message ||
          "Impossible de supprimer la dépense."
      );
    }
  }

  // =====================================================
  // FILTRAGE
  // =====================================================

  const depensesFiltrees = useMemo(() => {
    const terme =
      recherche.trim().toLowerCase();

    return depenses.filter((depense) => {
      const correspondRecherche =
        !terme ||
        depense.libelle
          .toLowerCase()
          .includes(terme) ||
        depense.categorie
          .toLowerCase()
          .includes(terme) ||
        (
          depense.beneficiaire || ""
        )
          .toLowerCase()
          .includes(terme);

      const correspondCategorie =
        !categorieFiltre ||
        depense.categorie ===
          categorieFiltre;

      return (
        correspondRecherche &&
        correspondCategorie
      );
    });
  }, [
    depenses,
    recherche,
    categorieFiltre,
  ]);

  // =====================================================
  // TOTAL FILTRÉ
  // =====================================================

  const totalFiltre =
    depensesFiltrees.reduce(
      (total, depense) =>
        total + depense.montant,
      0
    );

  // =====================================================
  // AFFICHAGE
  // =====================================================

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          Chargement des dépenses...
        </div>
      </div>
    );
  }

  return (
    <div className="page depenses-page">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="page-header">

        <div>
          <h1>Dépenses</h1>

          <p>
            Gestion des dépenses du centre.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={ouvrirAjout}
        >
          + Nouvelle dépense
        </button>

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

      <div className="depenses-stats">

        <div className="depense-stat-card">

          <div className="depense-stat-icon">
            💸
          </div>

          <div>
            <span>
              Total des dépenses
            </span>

            <strong>
              {formatMoney(
                statistiques?.total || 0
              )}
            </strong>
          </div>

        </div>

        <div className="depense-stat-card">

          <div className="depense-stat-icon">
            📅
          </div>

          <div>
            <span>
              Dépenses du mois
            </span>

            <strong>
              {formatMoney(
                statistiques?.totalMois || 0
              )}
            </strong>
          </div>

        </div>

        <div className="depense-stat-card">

          <div className="depense-stat-icon">
            🧾
          </div>

          <div>
            <span>
              Nombre de dépenses
            </span>

            <strong>
              {statistiques?.nombre || 0}
            </strong>
          </div>

        </div>

        <div className="depense-stat-card">

          <div className="depense-stat-icon">
            🔎
          </div>

          <div>
            <span>
              Total affiché
            </span>

            <strong>
              {formatMoney(totalFiltre)}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          FORMULAIRE
      ================================================= */}

      {afficherFormulaire && (

        <div className="depense-form-card">

          <div className="depense-form-header">

            <div>

              <h2>
                {editionId
                  ? "Modifier la dépense"
                  : "Nouvelle dépense"}
              </h2>

              <p>
                Renseignez les informations
                de la dépense.
              </p>

            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={fermerFormulaire}
            >
              ✕ Fermer
            </button>

          </div>

          <form
            onSubmit={enregistrerDepense}
          >

            <div className="depense-form-grid">

              {/* LIBELLÉ */}

              <div className="form-group">

                <label>
                  Libellé *
                </label>

                <input
                  type="text"
                  value={
                    formulaire.libelle
                  }
                  onChange={(e) =>
                    modifierChamp(
                      "libelle",
                      e.target.value
                    )
                  }
                  placeholder="Ex : Achat fournitures"
                />

              </div>

              {/* CATÉGORIE */}

              <div className="form-group">

                <label>
                  Catégorie *
                </label>

                <select
                  value={
                    formulaire.categorie
                  }
                  onChange={(e) =>
                    modifierChamp(
                      "categorie",
                      e.target.value
                    )
                  }
                >

                  {CATEGORIES.map(
                    (categorie) => (

                      <option
                        key={categorie}
                        value={categorie}
                      >
                        {categorie}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* MONTANT */}

              <div className="form-group">

                <label>
                  Montant (F CFA) *
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    formulaire.montant
                  }
                  onChange={(e) =>
                    modifierChamp(
                      "montant",
                      e.target.value
                    )
                  }
                  placeholder="Ex : 25000"
                />

              </div>

              {/* DATE */}

              <div className="form-group">

                <label>
                  Date *
                </label>

                <input
                  type="date"
                  value={
                    formulaire.dateDepense
                  }
                  onChange={(e) =>
                    modifierChamp(
                      "dateDepense",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* BÉNÉFICIAIRE */}

              <div className="form-group">

                <label>
                  Bénéficiaire
                </label>

                <input
                  type="text"
                  value={
                    formulaire.beneficiaire
                  }
                  onChange={(e) =>
                    modifierChamp(
                      "beneficiaire",
                      e.target.value
                    )
                  }
                  placeholder="Ex : Fournisseur"
                />

              </div>

              {/* OBSERVATION */}

              <div className="form-group form-group-full">

                <label>
                  Observation
                </label>

                <textarea
                  value={
                    formulaire.observation
                  }
                  onChange={(e) =>
                    modifierChamp(
                      "observation",
                      e.target.value
                    )
                  }
                  placeholder="Informations complémentaires..."
                  rows={3}
                />

              </div>

            </div>

            {/* ACTIONS FORMULAIRE */}

            <div className="depense-form-actions">

              <button
                type="button"
                className="btn-secondary"
                onClick={fermerFormulaire}
                disabled={enregistrement}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={enregistrement}
              >
                {enregistrement
                  ? "Enregistrement..."
                  : editionId
                  ? "Enregistrer les modifications"
                  : "Enregistrer la dépense"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* =================================================
          FILTRES
      ================================================= */}

      <div className="depenses-filters">

        {/* RECHERCHE */}

        <div className="depense-search">

          <label>
            Recherche
          </label>

          <input
            type="text"
            value={recherche}
            onChange={(e) =>
              setRecherche(
                e.target.value
              )
            }
            placeholder="Libellé, catégorie, bénéficiaire..."
          />

        </div>

        {/* CATÉGORIE */}

        <div className="depense-category-filter">

          <label>
            Catégorie
          </label>

          <select
            value={categorieFiltre}
            onChange={(e) =>
              setCategorieFiltre(
                e.target.value
              )
            }
          >

            <option value="">
              Toutes les catégories
            </option>

            {CATEGORIES.map(
              (categorie) => (

                <option
                  key={categorie}
                  value={categorie}
                >
                  {categorie}
                </option>

              )
            )}

          </select>

        </div>

        {/* RÉINITIALISER */}

        {(recherche ||
          categorieFiltre) && (

          <button
            type="button"
            className="btn-secondary depense-reset"
            onClick={() => {
              setRecherche("");
              setCategorieFiltre("");
            }}
          >
            Réinitialiser
          </button>

        )}

      </div>

      {/* =================================================
          TABLEAU
      ================================================= */}

      <div className="depenses-table-card">

        <div className="depenses-table-header">

          <div>

            <h2>
              Liste des dépenses
            </h2>

            <span>
              {depensesFiltrees.length} dépense
              {depensesFiltrees.length > 1
                ? "s"
                : ""}
            </span>

          </div>

          <strong>
            {formatMoney(totalFiltre)}
          </strong>

        </div>

        {/* AUCUNE DÉPENSE */}

        {depensesFiltrees.length === 0 ? (

          <div className="depenses-empty">

            <div>
              🧾
            </div>

            <h3>
              Aucune dépense
            </h3>

            <p>
              Aucune dépense ne correspond
              aux critères sélectionnés.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="depenses-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Libellé</th>
                  <th>Catégorie</th>
                  <th>Bénéficiaire</th>
                  <th>Montant</th>
                  <th>Observation</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {depensesFiltrees.map(
                  (depense) => (

                    <tr
                      key={depense.id}
                    >

                      {/* DATE */}

                      <td>
                        {formatDate(
                          depense.dateDepense
                        )}
                      </td>

                      {/* LIBELLÉ */}

                      <td>

                        <strong>
                          {depense.libelle}
                        </strong>

                      </td>

                      {/* CATÉGORIE */}

                      <td>

                        <span className="depense-category-badge">
                          {depense.categorie}
                        </span>

                      </td>

                      {/* BÉNÉFICIAIRE */}

                      <td>
                        {depense.beneficiaire ||
                          "—"}
                      </td>

                      {/* MONTANT */}

                      <td>

                        <strong className="depense-montant">
                          {formatMoney(
                            depense.montant
                          )}
                        </strong>

                      </td>

                      {/* OBSERVATION */}

                      <td>
                        {depense.observation ||
                          "—"}
                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="depense-actions">

                          {/* MODIFIER */}

                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() =>
                              ouvrirModification(
                                depense
                              )
                            }
                            title="Modifier"
                          >
                            ✏️
                          </button>

                          {/* SUPPRIMER */}

                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() =>
                              supprimer(
                                depense
                              )
                            }
                            title="Supprimer"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}