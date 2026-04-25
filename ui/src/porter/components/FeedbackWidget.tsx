import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare, X, Download, Upload, Trash2, Check } from "lucide-react";
import { useFeedback, exportFeedback, importFeedbackFile, type Severity } from "../store/feedback";
import { findScreen } from "../data/screens";

const severityLabels: Record<Severity, string> = {
  nit: "Nit",
  issue: "Issue",
  blocker: "Blocker",
  idea: "Idea",
};
const severityTone: Record<Severity, string> = {
  nit: "bg-porter-cloud text-porter-mute",
  issue: "bg-porter-warn/10 text-porter-warn",
  blocker: "bg-porter-bad/10 text-porter-bad",
  idea: "bg-porter-yellow/20 text-porter-ink",
};

/** Floating feedback bubble + panel. Mount once globally. */
export default function FeedbackWidget() {
  const { pathname, search } = useLocation();
  const route = pathname + (search || "");
  const screen = findScreen(route) ?? findScreen(pathname);

  const {
    comments,
    panelOpen,
    togglePanel,
    addComment,
    removeComment,
    toggleResolved,
    author,
    setAuthor,
    clear,
  } = useFeedback();

  const onRoute = comments.filter((c) => c.route === route || c.route === pathname);
  const total = comments.length;

  const [body, setBody] = useState("");
  const [sev, setSev] = useState<Severity>("issue");
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-close on route change
  useEffect(() => {
    if (panelOpen) togglePanel(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  const submit = () => {
    if (!body.trim()) return;
    addComment({
      route,
      screen: screen?.label ?? route,
      author: author || "Guest reviewer",
      severity: sev,
      body: body.trim(),
    });
    setBody("");
  };

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => togglePanel(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-porter-ink px-4 py-3 text-sm font-bold text-porter-yellow shadow-xl hover:bg-black"
        aria-label="Give feedback"
      >
        <MessageSquare size={16} />
        Feedback
        {onRoute.length > 0 && (
          <span className="rounded-full bg-porter-yellow px-1.5 py-0.5 text-[10px] font-black text-porter-ink">
            {onRoute.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-porter-ink/40 backdrop-blur-sm"
          onClick={() => togglePanel(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-porter-line px-5 py-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-porter-yellowDark">
                  Feedback on
                </div>
                <div className="text-lg font-extrabold leading-tight">
                  {screen?.label ?? "This screen"}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-porter-mute">{route}</div>
              </div>
              <button onClick={() => togglePanel(false)} className="text-porter-mute hover:text-porter-ink">
                <X size={18} />
              </button>
            </header>

            {/* Add comment */}
            <div className="border-b border-porter-line p-5">
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name (saved locally)"
                className="mb-2 w-full rounded-lg border border-porter-line bg-porter-cloud px-3 py-2 text-xs outline-none focus:border-porter-ink"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's off? What would you change? Leave it vague or precise."
                rows={3}
                className="w-full rounded-lg border border-porter-line bg-white px-3 py-2 text-sm outline-none focus:border-porter-ink"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  {(Object.keys(severityLabels) as Severity[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSev(s)}
                      className={[
                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                        sev === s ? severityTone[s] : "bg-porter-cloud text-porter-mute",
                      ].join(" ")}
                    >
                      {severityLabels[s]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={submit}
                  disabled={!body.trim()}
                  className="rounded-lg bg-porter-yellow px-3 py-1.5 text-sm font-bold text-porter-ink disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-porter-mute">
                This screen · {onRoute.length} · global {total}
              </div>
              {onRoute.length === 0 ? (
                <div className="rounded-xl border border-dashed border-porter-line p-6 text-center text-sm text-porter-mute">
                  No comments here yet. Be the first.
                </div>
              ) : (
                <ul className="space-y-2">
                  {onRoute.map((c) => (
                    <li
                      key={c.id}
                      className={[
                        "rounded-xl border border-porter-line p-3",
                        c.resolved ? "opacity-50" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 font-bold ${severityTone[c.severity]}`}>
                            {severityLabels[c.severity]}
                          </span>
                          <span className="font-semibold">{c.author}</span>
                          <span className="text-porter-mute">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 text-porter-mute">
                          <button onClick={() => toggleResolved(c.id)} title="Resolve">
                            <Check size={14} />
                          </button>
                          <button onClick={() => removeComment(c.id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className={`mt-1 text-sm ${c.resolved ? "line-through" : ""}`}>{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer actions */}
            <footer className="flex items-center gap-2 border-t border-porter-line p-4">
              <button
                onClick={exportFeedback}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-porter-ink px-3 py-2 text-xs font-bold text-porter-yellow"
              >
                <Download size={13} /> Export JSON
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-porter-line px-3 py-2 text-xs font-bold"
              >
                <Upload size={13} /> Import
              </button>
              <button
                onClick={() => {
                  if (confirm("Clear all feedback?")) clear();
                }}
                className="flex items-center justify-center rounded-lg border border-porter-line px-3 py-2 text-xs font-bold text-porter-bad"
                title="Clear all"
              >
                <Trash2 size={13} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const replace = confirm("Replace existing comments? Cancel = merge.");
                  await importFeedbackFile(f, replace);
                  e.target.value = "";
                }}
              />
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
