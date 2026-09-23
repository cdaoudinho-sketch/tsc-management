import api from "./api";
import type { Eleve } from "../types";

export async function obtenirEleves(): Promise<Eleve[]> {
  const response = await api.get("/eleves");

  return response.data;
}

export async function obtenirEleve(
  matricule: string
): Promise<Eleve> {
  const response = await api.get(
    `/eleves/${matricule}`
  );

  return response.data;
}