"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Building2, Users } from "lucide-react";
import { api } from "@/lib/portal/client";
export function LocalAccess() {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function enter(identity: string) {
    setBusy(true);
    setError("");
    try {
      await api("/api/session", {
        method: "POST",
        body: JSON.stringify({ identity }),
      });
      router.push(identity === "team" ? "/equipa" : "/cliente");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <div className="p-access-options">
      {[
        {
          id: "client-a",
          name: "Restaurante Maré",
          description: "Inês · cliente de teste A",
        },
        {
          id: "client-b",
          name: "Estúdio Forma",
          description: "Miguel · cliente de teste B",
        },
        {
          id: "team",
          name: "Equipa de projeto",
          description: "Consultar as fichas e notificações locais",
        },
      ].map((p) => (
        <button
          key={p.id}
          className="p-access-option"
          disabled={busy}
          onClick={() => enter(p.id)}
        >
          {p.id === "team" ? <Users /> : <Building2 />}
          <span>
            <strong>{p.name}</strong>
            <small>{p.description}</small>
          </span>
          <ArrowUpRight />
        </button>
      ))}
      {busy && <p role="status">A abrir a sessão…</p>}
      {error && (
        <p className="p-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
