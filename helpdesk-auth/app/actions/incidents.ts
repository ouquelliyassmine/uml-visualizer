//app/actions/incidents.ts
"use server"

import { cookies } from "next/headers";
import { getAuthenticatedUserId } from "@/lib/auth";

type ActionState = {
  success: boolean;
  message: string;
} | null;

export async function createIncident(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Method 1: Try to get user ID from auth function
    const userId = await getAuthenticatedUserId();
    
    if (!userId) {
      return {
        success: false,
        message: "Vous devez être connecté pour déclarer un incident."
      };
    }
    
    const titre = formData.get("titre") as string;
    const description = formData.get("description") as string;
    const statut = formData.get("statut") as string;
    const priorite = formData.get("priorite") as string;
    const commentaire = formData.get("commentaire") as string;
    
    // Validate required fields
    if (!titre || !description || !statut || !priorite) {
      return {
        success: false,
        message: "Tous les champs obligatoires doivent être remplis."
      };
    }
    
    console.log("Creating incident for user:", userId, {
      titre,
      description,
      statut,
      priorite,
      commentaire,
    });
    
    // Method 2: Get cookies manually and include them
    const cookieStore = cookies();
    const allCookies = cookieStore.toString();
    
    console.log("=== SERVER ACTION DEBUG ===");
    console.log("🍪 Available cookies:", allCookies);
    console.log("👤 User ID:", userId);
    console.log("==========================");
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": allCookies, // Manually include cookies
      },
      body: JSON.stringify({
        titre,
        description,
        statut,
        priorite,
        commentaire,
        userId,
      }),
    });
    
    const responseText = await response.text();
    
    console.log("=== API RESPONSE DEBUG ===");
    console.log("📊 Response status:", response.status);
    console.log("📄 Response body:", responseText);
    console.log("==========================");
    
    if (response.ok) {
      let message = "Votre incident a été déclaré avec succès !";
      try {
        const data = JSON.parse(responseText);
        message = data.message || message;
      } catch {
        // Ignore JSON parse errors
      }
      
      return { success: true, message };
    } else {
      console.error("❌ Backend error response:", responseText);
      
      let message = "Échec de la déclaration de l'incident.";
      if (response.status === 403) {
        message = "Erreur d'authentification. Veuillez vous reconnecter.";
      } else if (response.status === 401) {
        message = "Session expirée. Veuillez vous reconnecter.";
      } else {
        try {
          const errorData = JSON.parse(responseText);
          message = errorData.message || errorData.error || message;
        } catch {
          // Use default message if response isn't JSON
        }
      }
      
      return { success: false, message };
    }
  } catch (error) {
    console.error("❌ Error creating incident:", error);
    return {
      success: false,
      message: "Une erreur est survenue. Veuillez réessayer."
    };
  }
}