"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, UserCheck } from "lucide-react";
import { api } from "@/lib/portal/client";

export function EmailAccess() {
  const [tab, setTab] = useState<"client" | "team">("client");

  // Client state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [hasCode, setHasCode] = useState(false);

  // Team state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const emailParam = params.get("email");
    const modeParam = params.get("mode");
    if (tabParam === "team") {
      setTab("team");
    } else if (emailParam) {
      setEmail(emailParam);
      if (modeParam === "code") {
        setHasCode(true);
      }
    }
  }, []);

  useEffect(() => {
    if (hasCode) codeRef.current?.focus();
  }, [hasCode]);

  async function requestCode() {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/request", {
        method: "POST",
        body: JSON.stringify({ name, company, email }),
      });
      setHasCode(true);
      setToken("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyClient() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ destination: string }>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ mode: "client", email, token }),
      });
      router.push(result.destination);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function loginTeam() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ destination: string }>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ mode: "team", username, password }),
      });
      router.push(result.destination);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="p-access-shell">
      <div className="p-access-tabs" role="tablist" aria-label="Tipo de acesso">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "client"}
          className={`p-access-tab ${tab === "client" ? "p-active is-active" : ""}`}
          onClick={() => {
            setTab("client");
            setError("");
          }}
        >
          <UserCheck size={17} /> Sou Cliente
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "team"}
          className={`p-access-tab ${tab === "team" ? "p-active is-active" : ""}`}
          onClick={() => {
            setTab("team");
            setError("");
          }}
        >
          <ShieldCheck size={17} /> Equipa Draft &amp; Rise
        </button>
      </div>

      {tab === "client" ? (
        <form
          className="p-email-access"
          onSubmit={(e) => {
            e.preventDefault();
            void (hasCode ? verifyClient() : requestCode());
          }}
        >
          {!hasCode ? (
            <>
              <div>
                <label htmlFor="access-name">O seu nome</label>
                <input
                  id="access-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ex.: João Silva"
                  required
                  maxLength={120}
                  value={name}
                  disabled={busy}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="access-company">Nome da empresa</label>
                <input
                  id="access-company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Ex.: Clínica Sorriso"
                  required
                  maxLength={160}
                  value={company}
                  disabled={busy}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="access-email">O seu email</label>
                <input
                  id="access-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Ex.: joao@empresa.pt"
                  required
                  maxLength={254}
                  value={email}
                  disabled={busy}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-notice" role="status">
                <KeyRound size={18} />
                <span>
                  Pedido registado com sucesso. Introduza abaixo o código de 6
                  dígitos fornecido pela equipa Draft &amp; Rise para aceder ou
                  retomar a sua ficha.
                </span>
              </div>

              <div>
                <label htmlFor="access-email-confirm">O seu email</label>
                <input
                  id="access-email-confirm"
                  type="email"
                  autoComplete="email"
                  placeholder="Ex.: joao@empresa.pt"
                  required
                  maxLength={254}
                  value={email}
                  disabled={busy}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="access-code">Código de acesso (6 dígitos)</label>
                <input
                  ref={codeRef}
                  id="access-code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]{6,10}"
                  placeholder="Ex.: 482910"
                  required
                  value={token}
                  disabled={busy}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
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
              : hasCode
                ? "Entrar no questionário"
                : "Pedir código de acesso"}
          </button>

          <button
            className="p-button p-secondary"
            type="button"
            disabled={busy}
            onClick={() => {
              setHasCode((v) => !v);
              setError("");
            }}
          >
            {hasCode
              ? "Pedir novo código de acesso"
              : "Já tenho um código de 6 dígitos"}
          </button>

          <p className="p-quiet">
            Pode guardar o seu progresso a qualquer momento e voltar mais tarde
            com o mesmo email e código.
          </p>
        </form>
      ) : (
        <form
          className="p-email-access"
          onSubmit={(e) => {
            e.preventDefault();
            void loginTeam();
          }}
        >
          <div>
            <label htmlFor="team-username">Utilizador da equipa</label>
            <input
              id="team-username"
              type="text"
              autoComplete="username"
              placeholder="user1 a user6"
              required
              maxLength={60}
              value={username}
              disabled={busy}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="team-password">Palavra-passe</label>
            <input
              id="team-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              required
              maxLength={120}
              value={password}
              disabled={busy}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="p-error">
              {error}
            </p>
          )}

          <button className="p-button p-primary" disabled={busy}>
            {busy ? "A entrar…" : "Entrar no painel da equipa"}
          </button>

          <p className="p-quiet">
            Acesso reservado aos 6 utilizadores autorizados da equipa Draft
            &amp; Rise.
          </p>
        </form>
      )}
    </div>
  );
}

