import { useEffect, useState } from "react";
import api from "../services/api";

type Inscription = {
  id: number;
  eleveId: number;
  matricule: string;
  nom: string;
  contact: string;
  formation: string;
  niveau: string;
  annee: string;
  montant: number;
  totalPaye: number;
  solde: number;
  statut: string;
};

type Paiement = {
  id: number;
  numeroRecu: string;
  inscriptionId: number;
  montant: number;
  modePaiement: string;
  observation?: string | null;
  datePaiement: string;
  matricule: string;
  nom: string;
  formation: string;
};

function formatMoney(montant: number) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " F CFA";
}

export default function Paiements() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);

  const [inscriptionId, setInscriptionId] = useState("");
  const [montant, setMontant] = useState("");
  const [modePaiement, setModePaiement] = useState("ESPECES");
  const [observation, setObservation] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const [dernierPaiement, setDernierPaiement] =
    useState<Paiement | null>(null);

  async function chargerDonnees() {
    try {
      setLoading(true);
      setErreur("");

      const [inscriptionsResponse, paiementsResponse] =
        await Promise.all([
          api.get("/inscriptions"),
          api.get("/paiements"),
        ]);

      setInscriptions(inscriptionsResponse.data);
      setPaiements(paiementsResponse.data);
    } catch (error: any) {
      console.error("Erreur chargement paiements :", error);

      setErreur(
        error?.response?.data?.message ||
          "Impossible de charger la page des paiements."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    chargerDonnees();
  }, []);

  const inscriptionSelectionnee = inscriptions.find(
    (inscription) =>
      inscription.id === Number(inscriptionId)
  );

  const montantSaisi = Number(montant) || 0;

  const nouveauSolde = inscriptionSelectionnee
    ? Math.max(
        inscriptionSelectionnee.solde - montantSaisi,
        0
      )
    : 0;

  async function enregistrerPaiement(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErreur("");
    setDernierPaiement(null);

    if (!inscriptionId) {
      setErreur("Veuillez sélectionner un élève.");
      return;
    }

    if (montantSaisi <= 0) {
      setErreur(
        "Veuillez saisir un montant supérieur à 0."
      );
      return;
    }

    if (
      inscriptionSelectionnee &&
      montantSaisi > inscriptionSelectionnee.solde
    ) {
      setErreur(
        `Le montant maximum autorisé est de ${formatMoney(
          inscriptionSelectionnee.solde
        )}.`
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.post(
        "/paiements",
        {
          inscriptionId: Number(inscriptionId),
          montant: montantSaisi,
          modePaiement,
          observation:
            observation.trim() || undefined,
        }
      );

      setMessage(
        `Paiement enregistré. Reçu : ${response.data.numeroRecu}`
      );

      setDernierPaiement({
        ...response.data.paiement,
        numeroRecu: response.data.numeroRecu,
        inscriptionId: Number(inscriptionId),
        montant: montantSaisi,
        modePaiement,
        observation:
          observation.trim() || null,
        matricule:
          inscriptionSelectionnee?.matricule || "",
        nom:
          inscriptionSelectionnee?.nom || "",
        formation:
          inscriptionSelectionnee?.formation || "",
      });

      setMontant("");
      setObservation("");

      await chargerDonnees();
    } catch (error: any) {
      console.error(
        "Erreur enregistrement paiement :",
        error
      );

      const messageErreur =
        error?.response?.data?.message;

      if (Array.isArray(messageErreur)) {
        setErreur(messageErreur.join(" "));
      } else {
        setErreur(
          messageErreur ||
            "Impossible d'enregistrer le paiement."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          Chargement des paiements...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Paiements</h1>
          <p>
            Enregistrer et suivre les paiements des élèves
          </p>
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

      {dernierPaiement && (
        <div className="success-card">
          <h2>Paiement enregistré</h2>

          <div className="success-info">
            <div>
              <span>Reçu</span>
              <strong>
                {dernierPaiement.numeroRecu}
              </strong>
            </div>

            <div>
              <span>Élève</span>
              <strong>
                {dernierPaiement.nom}
              </strong>
            </div>

            <div>
              <span>Montant</span>
              <strong>
                {formatMoney(
                  dernierPaiement.montant
                )}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={enregistrerPaiement}>
          <div className="form-section">
            <h2>Nouveau paiement</h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="inscription">
                  Élève
                </label>

                <select
                  id="inscription"
                  value={inscriptionId}
                  onChange={(event) => {
                    setInscriptionId(
                      event.target.value
                    );
                    setMontant("");
                    setMessage("");
                    setErreur("");
                  }}
                  disabled={saving}
                >
                  <option value="">
                    Sélectionner un élève
                  </option>

                  {inscriptions
                    .filter(
                      (inscription) =>
                        inscription.solde > 0
                    )
                    .map((inscription) => (
                      <option
                        key={inscription.id}
                        value={inscription.id}
                      >
                        {inscription.matricule} —{" "}
                        {inscription.nom} —{" "}
                        {inscription.formation}{" "}
                        {inscription.niveau}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="montant">
                  Montant
                </label>

                <input
                  id="montant"
                  type="number"
                  min="1"
                  value={montant}
                  onChange={(event) =>
                    setMontant(event.target.value)
                  }
                  placeholder="Ex : 20000"
                  disabled={
                    saving ||
                    !inscriptionSelectionnee
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="mode">
                  Mode de paiement
                </label>

                <select
                  id="mode"
                  value={modePaiement}
                  onChange={(event) =>
                    setModePaiement(
                      event.target.value
                    )
                  }
                  disabled={saving}
                >
                  <option value="ESPECES">
                    Espèces
                  </option>
                  <option value="WAVE">
                    Wave
                  </option>
                  <option value="ORANGE_MONEY">
                    Orange Money
                  </option>
                  <option value="MTN_MONEY">
                    MTN Money
                  </option>
                  <option value="MOOV_MONEY">
                    Moov Money
                  </option>
                  <option value="CHEQUE">
                    Chèque
                  </option>
                  <option value="VIREMENT">
                    Virement
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="observation">
                  Observation
                </label>

                <input
                  id="observation"
                  type="text"
                  value={observation}
                  onChange={(event) =>
                    setObservation(
                      event.target.value
                    )
                  }
                  placeholder="Ex : Solde formation"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {inscriptionSelectionnee && (
            <div className="formation-resume">
              <h3>Situation financière</h3>

              <div className="resume-grid">
                <div>
                  <span>Élève</span>
                  <strong>
                    {inscriptionSelectionnee.nom}
                  </strong>
                </div>

                <div>
                  <span>Formation</span>
                  <strong>
                    {inscriptionSelectionnee.formation}{" "}
                    {inscriptionSelectionnee.niveau}
                  </strong>
                </div>

                <div>
                  <span>Total dû</span>
                  <strong>
                    {formatMoney(
                      inscriptionSelectionnee.montant
                    )}
                  </strong>
                </div>

                <div>
                  <span>Total payé</span>
                  <strong>
                    {formatMoney(
                      inscriptionSelectionnee.totalPaye
                    )}
                  </strong>
                </div>

                <div>
                  <span>Reste actuel</span>
                  <strong>
                    {formatMoney(
                      inscriptionSelectionnee.solde
                    )}
                  </strong>
                </div>

                <div>
                  <span>Nouveau solde</span>
                  <strong>
                    {formatMoney(nouveauSolde)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={
                saving ||
                !inscriptionSelectionnee
              }
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer le paiement"}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Derniers paiements</h2>
            <p>
              Historique des paiements enregistrés
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
              </tr>
            </thead>

            <tbody>
              {paiements.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    Aucun paiement enregistré.
                  </td>
                </tr>
              ) : (
                paiements
                  .slice(0, 10)
                  .map((paiement) => (
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
                        {paiement.formation}
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