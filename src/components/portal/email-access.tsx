"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/portal/client";
export function EmailAccess() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const code = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (sent) code.current?.focus();
  }, [sent]);
  async function requestCode() {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
      setToken("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ destination: string }>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email, token }),
      });
      router.push(result.destination);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <form
      className="p-email-access"
      onSubmit={(e) => {
        e.preventDefault();
        void (sent ? verify() : requestCode());
      }}
    >
      <label htmlFor="access-email">O seu email</label>
      <input
        id="access-email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        value={email}
        disabled={busy || sent}
        onChange={(e) => setEmail(e.target.value)}
      />
      {sent && (
        <>
          <p role="status">
            Enviámos um código de acesso. Consulte também a pasta de spam.
          </p>
          <label htmlFor="access-code">Código de acesso</label>
          <input
            ref={code}
            id="access-code"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]{6,10}"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </>
      )}
      {error && (
        <p role="alert" className="p-error">
          {error}
        </p>
      )}
      <button className="p-button p-primary" disabled={busy}>
        {busy
          ? "A aguardar…"
          : sent
            ? "Confirmar e continuar"
            : "Receber código por email"}
      </button>
      {sent && (
        <button
          className="p-button p-secondary"
          type="button"
          disabled={busy}
          onClick={() => {
            setSent(false);
            setToken("");
            setError("");
          }}
        >
          Alterar email ou pedir novo código
        </button>
      )}
      <p className="p-quiet">
        Não precisa de criar uma palavra-passe. Use o mesmo email para retomar o
        questionário.
      </p>
    </form>
  );
}
