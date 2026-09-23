import api from "./api";
import type { Paiement } from "../types";

export async function obtenirPaiements(): Promise<Paiement[]> {
  const response = await api.get("/paiements");

  return response.data.map((paiement: any) => ({
    numero: paiement.numeroRecu,
    motif: paiement.observation ?? "Versement",
    montant: paiement.montant,
    date: new Date(
      paiement.datePaiement
    ).toLocaleDateString("fr-FR"),
  }));
}

export async function obtenirPaiement(
  numero: string
) {
  const response = await api.get(
    `/paiements/${numero}`
  );

  return response.data;
  };