import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Read `?s=` from URL and provide setter that updates URL without full navigation. */
export function useSubscreen(defaultId: string): [string, (id: string) => void] {
  const { search, pathname } = useLocation();
  const nav = useNavigate();
  const current = new URLSearchParams(search).get("s") || defaultId;
  const set = useCallback(
    (id: string) => {
      const p = new URLSearchParams(search);
      p.set("s", id);
      nav({ pathname, search: `?${p.toString()}` }, { replace: false });
    },
    [nav, pathname, search],
  );
  return [current, set];
}
