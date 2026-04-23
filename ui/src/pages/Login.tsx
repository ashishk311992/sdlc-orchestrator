import { useState } from "react";
import { setToken } from "../lib/api";

export default function Login({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex h-full items-center justify-center">
      <form
        className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-panel p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            setToken(value.trim());
            onDone();
          }
        }}
      >
        <div>
          <h1 className="text-xl font-semibold">Autonomous SDLC</h1>
          <p className="text-sm text-muted">Enter your platform access token.</p>
        </div>
        <input
          type="password"
          placeholder="PLATFORM_CALLBACK_TOKEN"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 outline-none focus:border-accent"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button className="w-full rounded-md bg-accent px-3 py-2 font-medium text-white hover:bg-blue-500">
          Continue
        </button>
      </form>
    </div>
  );
}
