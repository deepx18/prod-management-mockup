import { redirect } from "next/navigation";

/**
 * Racine : l'utilisateur est envoyé vers /login ; le shell redirige ensuite
 * vers le tableau de bord ou l'espace agent selon le rôle une fois connecté.
 */
export default function Home() {
  redirect("/login");
}
