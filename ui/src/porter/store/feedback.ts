import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Severity = "nit" | "issue" | "blocker" | "idea";

export type Comment = {
  id: string;
  route: string;
  screen: string;
  author: string;
  severity: Severity;
  body: string;
  createdAt: number;
  resolved: boolean;
};

type FeedbackState = {
  author: string;
  comments: Comment[];
  visitedRoutes: string[];
  panelOpen: boolean;
  setAuthor: (a: string) => void;
  togglePanel: (open?: boolean) => void;
  addComment: (c: Omit<Comment, "id" | "createdAt" | "resolved">) => void;
  removeComment: (id: string) => void;
  toggleResolved: (id: string) => void;
  markVisited: (route: string) => void;
  importComments: (list: Comment[], replace?: boolean) => void;
  clear: () => void;
};

export const useFeedback = create<FeedbackState>()(
  persist(
    (set, get) => ({
      author: "",
      comments: [],
      visitedRoutes: [],
      panelOpen: false,
      setAuthor: (a) => set({ author: a }),
      togglePanel: (open) => set({ panelOpen: open ?? !get().panelOpen }),
      addComment: (c) =>
        set({
          comments: [
            ...get().comments,
            { ...c, id: crypto.randomUUID(), createdAt: Date.now(), resolved: false },
          ],
        }),
      removeComment: (id) =>
        set({ comments: get().comments.filter((x) => x.id !== id) }),
      toggleResolved: (id) =>
        set({
          comments: get().comments.map((x) =>
            x.id === id ? { ...x, resolved: !x.resolved } : x,
          ),
        }),
      markVisited: (route) => {
        const v = get().visitedRoutes;
        if (!v.includes(route)) set({ visitedRoutes: [...v, route] });
      },
      importComments: (list, replace) =>
        set({
          comments: replace ? list : [...get().comments, ...list],
        }),
      clear: () => set({ comments: [], visitedRoutes: [] }),
    }),
    { name: "porter-feedback-v1" },
  ),
);

export function exportFeedback() {
  const { comments, author } = useFeedback.getState();
  const payload = {
    app: "porter-clone-prototype",
    exportedAt: new Date().toISOString(),
    author,
    total: comments.length,
    comments,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `porter-feedback-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFeedbackFile(file: File, replace = false) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const list: Comment[] = parsed.comments ?? parsed;
  useFeedback.getState().importComments(list, replace);
}
