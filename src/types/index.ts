export type Paiement = {
  numero: string;
  motif: string;
  montant: number;
  date: string;
};

export type Eleve = {
  matricule: string;
  nom: string;
  contact: string;
  formation: string;
  niveau: string;
  dateInscription: string;
  totalDu: number;
  totalPaye: number;
   inscriptionId?: number;
  paiements: Paiement[];
};