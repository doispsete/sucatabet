"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/hooks";

export function PresenceHeartbeat() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const ping = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/ping`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
      } catch (e) {
        // Silently fail heartbeats
      }
    };

    // Ping imediato ao carregar
    ping();

    // Ping a cada 2 minutos (AuditLog dura 15min, então 2min é seguro)
    const interval = setInterval(ping, 120000);
    return () => clearInterval(interval);
  }, [user]);

  return null;
}
