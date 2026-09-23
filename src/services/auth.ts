import api from "./api";

export type User = {
  id: number;
  nom: string;
  email: string;
  role: string;
};

type LoginResponse = {
  message: string;
  accessToken: string;
  user: User;
};

export async function connexion(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    {
      email,
      password,
    }
  );

  localStorage.setItem(
    "tsc_token",
    response.data.accessToken
  );

  localStorage.setItem(
    "tsc_user",
    JSON.stringify(response.data.user)
  );

  return response.data;
}

export function deconnexion() {
  localStorage.removeItem("tsc_token");
  localStorage.removeItem("tsc_user");

  window.location.href = "/login";
}

export function obtenirUtilisateur(): User | null {
  const user = localStorage.getItem("tsc_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function estConnecte(): boolean {
  return Boolean(
    localStorage.getItem("tsc_token")
  );
}
export async function changerMotDePasse(
  ancienMotDePasse: string,
  nouveauMotDePasse: string,
) {
  const response = await api.patch(
    "/profil/mot-de-passe",
    {
      ancienMotDePasse,
      nouveauMotDePasse,
    },
  );

  return response.data;
}