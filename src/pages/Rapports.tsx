import { useEffect, useState } from "react";

import {
  obtenirDepensesParCategorie,
  obtenirRapportFinancier,
  obtenirRapportMensuel,
  type RapportDepenseCategorie,
  type RapportFinancier,
  type RapportMensuel,
} from "../services/rapports";

function formatMoney(montant: number) {
  return (
    new Intl.NumberFormat("fr-FR").format(
      montant,
    ) + " F CFA"
  );
}

const nomsMois = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function Rapports() {
  const [financier, setFinancier] =
    useState<RapportFinancier | null>(null);

  const [mensuel, setMensuel] =
    useState<RapportMensuel[]>([]);

  const [categories, setCategories] =
    useState<
      RapportDepenseCategorie[]
    >([]);

  const [annee, setAnnee] =
    useState(new Date().getFullYear());

  const [loading, setLoading] =
    useState(true);

  const [erreur, setErreur] =
    useState("");

  async function chargerRapports() {
    try {
      setLoading(true);
      setErreur("");

      const [
        rapportFinancier,
        rapportMensuel,
        rapportCategories,
      ] = await Promise.all([
        obtenirRapportFinancier(),
        obtenirRapportMensuel(annee),
        obtenirDepensesParCategorie(),
      ]);

      setFinancier(
        rapportFinancier,
      );

      setMensuel(
        rapportMensuel.mois,
      );

      setCategories(
        rapportCategories,
      );
    } catch (error: any) {
      console.error(
        "Erreur chargement rapports :",
        error,
      );

      setErreur(
        error?.response?.data?.message ||
          "Impossible de charger les rapports.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    chargerRapports();
  }, [annee]);

  function imprimer() {
    window.print();
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          Chargement des rapports...
        </div>
      </div>
    );
  }

  return (
    <div className="page rapports-page">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="page-header no-print">

        <div>
          <h1>Rapports</h1>

          <p>
            Analyse financière et
            administrative du TSC.
          </p>
        </div>

        <div className="rapport-actions">

          <select
            value={annee}
            onChange={(e) =>
              setAnnee(
                Number(e.target.value),
              )
            }
          >
            {[2024, 2025, 2026, 2027].map(
              (anneeOption) => (
                <option
                  key={anneeOption}
                  value={anneeOption}
                >
                  {anneeOption}
                </option>
              ),
            )}
          </select>

          <button
            type="button"
            className="btn-primary"
            onClick={imprimer}
          >
            🖨 Imprimer
          </button>

        </div>

      </div>

      {erreur && (
        <div className="alert alert-error no-print">
          {erreur}
        </div>
      )}

      {/* =================================================
          SYNTHÈSE FINANCIÈRE
      ================================================= */}

      {financier && (
        <>
          <div className="rapport-stats">

            <div className="rapport-card">
              <span>Recettes</span>

              <strong>
                {formatMoney(
                  financier.totalRecettes,
                )}
              </strong>

              <small>
                {financier.nombrePaiements} paiement
                {financier.nombrePaiements > 1
                  ? "s"
                  : ""}
              </small>
            </div>

            <div className="rapport-card">
              <span>Dépenses</span>

              <strong>
                {formatMoney(
                  financier.totalDepenses,
                )}
              </strong>

              <small>
                {financier.nombreDepenses} dépense
                {financier.nombreDepenses > 1
                  ? "s"
                  : ""}
              </small>
            </div>

            <div className="rapport-card">
              <span>Solde</span>

              <strong>
                {formatMoney(
                  financier.solde,
                )}
              </strong>

              <small>
                Recettes - dépenses
              </small>
            </div>

            <div className="rapport-card">
              <span>Impayés</span>

              <strong>
                {formatMoney(
                  financier.resteARecouvrer,
                )}
              </strong>

              <small>
                Reste à recouvrer
              </small>
            </div>

          </div>

          {/* =================================================
              INDICATEURS
          ================================================= */}

          <div className="rapport-indicators">

            <div>
              <span>Élèves</span>
              <strong>
                {financier.nombreEleves}
              </strong>
            </div>

            <div>
              <span>Inscriptions</span>
              <strong>
                {financier.nombreInscriptions}
              </strong>
            </div>

            <div>
              <span>Montant formations</span>
              <strong>
                {formatMoney(
                  financier.montantFormations,
                )}
              </strong>
            </div>

            <div>
              <span>Total payé</span>
              <strong>
                {formatMoney(
                  financier.montantPaye,
                )}
              </strong>
            </div>

          </div>
        </>
      )}

      {/* =================================================
          RAPPORT MENSUEL
      ================================================= */}

      <div className="rapport-section">

        <div className="rapport-section-header">
          <div>
            <h2>
              Évolution mensuelle
            </h2>

            <p>
              Recettes, dépenses et solde -
              {annee}
            </p>
          </div>
        </div>

        <div className="rapport-table-wrapper">

          <table className="rapport-table">

            <thead>
              <tr>
                <th>Mois</th>
                <th>Recettes</th>
                <th>Dépenses</th>
                <th>Solde</th>
              </tr>
            </thead>

            <tbody>

              {mensuel.map(
                (ligne) => (
                  <tr key={ligne.mois}>

                    <td>
                      <strong>
                        {
                          nomsMois[
                            ligne.mois - 1
                          ]
                        }
                      </strong>
                    </td>

                    <td>
                      {formatMoney(
                        ligne.recettes,
                      )}
                    </td>

                    <td>
                      {formatMoney(
                        ligne.depenses,
                      )}
                    </td>

                    <td>
                      <strong>
                        {formatMoney(
                          ligne.solde,
                        )}
                      </strong>
                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          DÉPENSES PAR CATÉGORIE
      ================================================= */}

      <div className="rapport-section">

        <div className="rapport-section-header">

          <div>
            <h2>
              Dépenses par catégorie
            </h2>

            <p>
              Répartition des dépenses
              enregistrées.
            </p>
          </div>

        </div>

        {categories.length === 0 ? (
          <div className="rapport-empty">
            Aucune dépense enregistrée.
          </div>
        ) : (
          <div className="rapport-categories">

            {categories.map(
              (categorie) => (
                <div
                  className="rapport-category"
                  key={
                    categorie.categorie
                  }
                >

                  <div className="rapport-category-header">

                    <strong>
                      {categorie.categorie}
                    </strong>

                    <span>
                      {formatMoney(
                        categorie.montant,
                      )}
                    </span>

                  </div>

                  <div className="rapport-progress">

                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          financier &&
                            financier.totalDepenses > 0
                            ? (categorie.montant /
                                financier.totalDepenses) *
                                100
                            : 0,
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              ),
            )}

          </div>
        )}

      </div>

      {/* =================================================
          PIED DE RAPPORT
      ================================================= */}

      <div className="rapport-footer">

        <strong>
          TSC — Temple du Savoir Club
        </strong>

        <span>
          Rapport généré automatiquement par
          TSC Management
        </span>

      </div>

    </div>
  );
}