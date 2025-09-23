"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

export default function ChatbotWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // portal target stable (ma kaybdlch)
  const portalTarget = useMemo(() => (typeof document !== "undefined" ? document.body : null), []);

  useEffect(() => setMounted(true), []);

  // auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // keep focus ila tḥell l-widget
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      // auto-resize first paint
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
      }
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  // auto-resize on value change
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;

    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: q }),
      });

      const ct = res.headers.get("content-type") || "";
      const data: any = ct.includes("application/json") ? await res.json() : { answer: await res.text() };
      if (!res.ok) throw new Error(data?.message || `Erreur HTTP ${res.status}`);

      const assistantResponse = String(
        data?.answer ?? data?.response ?? data?.result ?? data?.message ?? data?.content ?? data?.text ?? ""
      ).trim();
      if (!assistantResponse) throw new Error("Réponse vide du serveur");

      setMessages((m) => [...m, { role: "assistant", content: assistantResponse, error: !!data?.error }]);
    } catch (err: any) {
      const msg =
        err?.name === "TypeError" && String(err?.message || "").includes("fetch")
          ? "Problème de connexion réseau. Vérifiez votre connexion internet."
          : err?.message?.includes("404")
          ? "L'API chatbot n'est pas accessible. Vérifiez l'URL de l'API."
          : err?.message?.includes("500")
          ? "Erreur serveur interne. Réessayez dans quelques instants."
          : err?.message || "Désolé, une erreur s'est produite.";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            msg +
            "\n\n💡 Que faire ?\n• Réessayez dans quelques instants\n• Vérifiez votre connexion\n• Contactez l'équipe IT si le problème persiste",
          error: true,
        },
      ]);
      setError(err?.message || "Erreur de connexion");
    } finally {
      setBusy(false);
      // refocus après envoi
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value); // ma-kantrimich ḥtta l-send
    // auto-resize instant
    e.currentTarget.style.height = "auto";
    e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 120) + "px";
  };

  // === UI ===
  const ui = (
    <>
      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-[2147483647]">
        <button
          onClick={() => setOpen((o) => !o)}
          className="group relative h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl transition-all duration-300 hover:shadow-orange-500/50 hover:from-orange-400 hover:to-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-300/50 transform hover:scale-110 active:scale-95"
          title={open ? "Fermer le chatbot" : "Ouvrir le chatbot"}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-center transition-transform duration-300">
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
          </div>
          {!open && !error && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          )}
          {error && (
            <div className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[2147483647]">
          <div className="w-[400px] max-w-[calc(100vw-48px)] transform animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-300">
            <div className="overflow-hidden rounded-3xl border border-orange-200/30 bg-white/95 backdrop-blur-2xl shadow-2xl ring-1 ring-orange-100/50">
              {/* Header */}
              <div className="relative overflow-hidden border-b border-orange-100/50 bg-gradient-to-r from-orange-50/80 to-amber-50/60 px-6 py-5">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548-.547z" />
                        </svg>
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white ${
                          error ? "bg-red-500 animate-pulse" : busy ? "bg-yellow-500" : "bg-green-500 animate-pulse"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-base">Assistant TechOasis</div>
                      <div className={`text-xs font-medium ${error ? "text-red-600/80" : busy ? "text-yellow-600/80" : "text-orange-600/80"}`}>
                        {error ? "Problème de connexion" : busy ? "Traitement en cours..." : "En ligne • Prêt à vous aider"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {error && (
                      <button
                        onClick={() => setError(null)}
                        className="text-xs text-green-600/70 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-100/60 transition-all duration-200 font-medium"
                        title="Réessayer"
                      >
                        ↻
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMessages([]);
                        setError(null);
                        inputRef.current?.focus();
                      }}
                      className="text-xs text-orange-600/70 hover:text-orange-700 px-3 py-2 rounded-xl hover:bg-orange-100/60 transition-all duration-200 font-medium"
                      title="Effacer la conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[420px] overflow-y-auto bg-slate-50/30 backdrop-blur-sm">
                <div className="space-y-4 p-5">
                  {messages.length === 0 && (
                    <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                      <div className="mb-6 relative">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-xl ring-4 ring-orange-50">
                          <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center shadow-lg animate-bounce">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-slate-800 mb-2">Bonjour ! 👋</div>
                      <div className="text-sm text-slate-600 font-medium mb-1">Je suis votre assistant TechOasis</div>
                      <div className="text-xs text-slate-500 max-w-xs">Posez-moi vos questions sur les tickets, le matériel, les procédures...</div>
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`relative max-w-[85%] group ${m.role === "user" ? "" : "flex items-start gap-3"}`}>
                        {m.role === "assistant" && (
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-md ${
                              m.error ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-orange-500 to-orange-600"
                            }`}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                  m.error
                                    ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    : "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548-.547z"
                                }
                              />
                            </svg>
                          </div>
                        )}
                        <div
                          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 ${
                            m.role === "user"
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30"
                              : m.error
                              ? "bg-red-50 text-red-800 shadow-red-200/60 border border-red-200 flex-1"
                              : "bg-white text-slate-800 shadow-slate-200/60 border border-slate-100 flex-1"
                          }`}
                        >
                          <div className="text-sm leading-relaxed">{m.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {busy && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="bg-white text-slate-800 shadow-lg border border-slate-100 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex space-x-1">
                              <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" />
                              <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                              <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                            </div>
                            <span className="text-sm text-slate-600 font-medium">Je réfléchis...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="border-t border-orange-100/50 bg-white/90 backdrop-blur-sm p-5">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      className="w-full resize-none rounded-2xl border border-orange-200/50 bg-slate-50/50 px-4 py-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 placeholder:text-slate-500"
                      placeholder="Tapez votre question ici..."
                      value={input}
                      onChange={onChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!busy && input.trim()) send();
                        }
                      }}
                      rows={1}
                      style={{ minHeight: "48px", maxHeight: "120px" }}
                      disabled={busy}
                    />
                  </div>
                  <button
                    onClick={send}
                    disabled={busy || !input.trim()}
                    className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-white font-medium shadow-lg hover:shadow-orange-500/40 hover:from-orange-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    {busy ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="hidden sm:inline text-sm">Envoi...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span className="hidden sm:inline text-sm">Envoyer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (!mounted || !portalTarget) return null;
  return createPortal(ui, portalTarget);
}
