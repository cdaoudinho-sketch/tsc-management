import api from "./api";

export type RoleUtilisateur = "ADMIN" | "AGENT";

export type Utilisateur = {
  id: number;
  nom: string;
  email: string;
  role: RoleUtilisateur;
  actif: boolean;
  createdAt: string;
  updatedAt?: string;
};

export async function obtenirUtilisateurs(): Promise<Utilisateur[]> {
  const response = await api.get("/utilisateurs");
  return response.data;
}

export async function ajouterUtilisateur(data: {
  nom: string;
  email: string;
  password: string;
  role: RoleUtilisateur;
}) {
  const response = await api.post("/utilisateurs", data);
  return response.data;
}

export async function modifierUtilisateur(
  id: number,
  data: Partial<{
    nom: string;
    email: string;
    password: string;
    role: RoleUtilisateur;
    actif: boolean;
  }>,
) {
  const response = await api.patch(`/utilisateurs/${id}`, data);
  return response.data;
}

export async function supprimerUtilisateur(id: number) {
  const response = await api.delete(`/utilisateurs/${id}`);
  return response.data;
}