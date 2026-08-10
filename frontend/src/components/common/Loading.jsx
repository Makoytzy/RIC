export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        {label}
      </div>
    </div>
  );
}
