import api from "./api";

export type RapportFinancier = {
  totalRecettes: number;
  totalDepenses: number;
  solde: number;

  nombrePaiements: number;
  nombreDepenses: number;

  nombreEleves: number;
  nombreInscriptions: number;

  montantFormations: number;
  montantPaye: number;
  resteARecouvrer: number;
};

export type RapportMensuel = {
  mois: number;
  recettes: number;
  depenses: number;
  solde: number;
};

export type RapportDepenseCategorie = {
  categorie: string;
  montant: number;
};

export async function obtenirRapportFinancier(): Promise<RapportFinancier> {
  const response = await api.get(
    "/rapports/financier",
  );

  return response.data;
}

export async function obtenirRapportMensuel(
  annee?: number,
): Promise<{
  annee: number;
  mois: RapportMensuel[];
}> {
  const response = await api.get(
    "/rapports/mensuel",
    {
      params: annee
        ? { annee }
        : undefined,
    },
  );

  return response.data;
}

export async function obtenirDepensesParCategorie(): Promise<
  RapportDepenseCategorie[]
> {
  const response = await api.get(
    "/rapports/depenses-categories",
  );

  return response.data;
}