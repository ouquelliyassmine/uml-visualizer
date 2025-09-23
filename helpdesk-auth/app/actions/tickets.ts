
//app/actions/tickets.ts
"use server";
import { cookies } from "next/headers";

export interface Ticket {
  id: string;
  titre: string;
  description: string;
  statut: string;
  priorite?: string;
  commentaire?: string;
dateCreation: string;
 dateCloture: string;
}

interface TicketsResponse {
  success: boolean;
  message: string;
  tickets?: Ticket[];
}

export async function getUserTickets(): Promise<TicketsResponse> {
  try {
    console.log('🚀 Fetching tickets from internal API...');
    
    // Get the base URL for internal API calls
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/tickets`;
    
    console.log(`📍 Calling internal API: ${apiUrl}`);
    
    // Get cookies to forward to internal API
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    
    console.log("=== INTERNAL API CALL DEBUG ===");
    console.log("🍪 Cookie header:", cookieHeader);
    console.log("🍪 Cookie count:", cookieStore.size);
    console.log("===============================");
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
    });

    console.log(`📊 Internal API Response Status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ Failed to fetch tickets - Status: ${response.status}`);
      const errorText = await response.text();
      console.error(`📄 Error response: ${errorText}`);
      
      return {
        success: false,
        message: `Erreur lors du chargement des tickets (Status: ${response.status})`,
      };
    }

    const tickets: Ticket[] = await response.json();
    console.log(`✅ Fetched ${tickets.length} tickets successfully`);

    return {
      success: true,
      message: `${tickets.length} ticket(s) chargé(s) avec succès`,
      tickets,
    };

  } catch (error) {
    console.error("❌ Error in getUserTickets:", error);
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
}