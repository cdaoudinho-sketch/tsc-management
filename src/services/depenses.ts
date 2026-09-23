import api from "./api";

export type Depense = {
  id: number;
  libelle: string;
  categorie: string;
  montant: number;
  beneficiaire?: string | null;
  observation?: string | null;
  dateDepense: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateDepenseData = {
  libelle: string;
  categorie: string;
  montant: number;
  beneficiaire?: string;
  observation?: string;
  dateDepense?: string;
};

export type UpdateDepenseData =
  Partial<CreateDepenseData>;

export type StatistiquesDepenses = {
  total: number;
  totalMois: number;
  nombre: number;
  categories: Record<string, number>;
};

// =====================================================
// LISTE DES DÉPENSES
// =====================================================

export async function obtenirDepenses(): Promise<
  Depense[]
> {
  const response = await api.get("/depenses");

  return response.data;
}

// =====================================================
// UNE DÉPENSE
// =====================================================

export async function obtenirDepense(
  id: number
): Promise<Depense> {
  const response = await api.get(
    `/depenses/${id}`
  );

  return response.data;
}

// =====================================================
// AJOUTER
// =====================================================

export async function ajouterDepense(
  data: CreateDepenseData
): Promise<Depense> {
  const response = await api.post(
    "/depenses",
    data
  );

  return response.data;
}

// =====================================================
// MODIFIER
// =====================================================

export async function modifierDepense(
  id: number,
  data: UpdateDepenseData
): Promise<Depense> {
  const response = await api.patch(
    `/depenses/${id}`,
    data
  );

  return response.data;
}

// =====================================================
// SUPPRIMER
// =====================================================

export async function supprimerDepense(
  id: number
) {
  const response = await api.delete(
    `/depenses/${id}`
  );

  return response.data;
}

// =====================================================
// STATISTIQUES
// =====================================================

export async function obtenirStatistiquesDepenses(): Promise<StatistiquesDepenses> {
  const response = await api.get(
    "/depenses/statistiques"
  );

  return response.data;
}