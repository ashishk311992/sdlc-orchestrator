import { ReactNode } from "react";

/** Phone frame wrapper to render mobile screens on desktop. */
export default function PhoneFrame({
  children,
  height = 760,
  label,
}: {
  children: ReactNode;
  height?: number;
  label?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[390px]">
      {label && (
        <div className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-porter-mute">
          {label}
        </div>
      )}
      <div className="relative rounded-[2.5rem] border-[10px] border-porter-ink bg-porter-ink shadow-2xl">
        <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-porter-ink" />
        <div
          className="relative overflow-hidden rounded-[2rem] bg-white"
          style={{ height }}
        >
          <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-porter-ink">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span>●●●●</span>
              <span>LTE</span>
              <span>100%</span>
            </span>
          </div>
          <div className="h-[calc(100%-1.75rem)] overflow-y-auto">{children}</div>
          <div className="pointer-events-none absolute bottom-1 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-porter-ink/30" />
        </div>
      </div>
    </div>
  );
}
