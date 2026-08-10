// Generic scaffold used by every not-yet-built module page.
// Once a module's real UI/API is ready, replace the page that imports
// this with real content — routing, nav, and role access are already wired.
export default function PlaceholderPage({ title, description, tag, actions = [] }) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {tag && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {tag}
          </span>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <span className="text-lg font-semibold text-brand-600">{title.charAt(0)}</span>
        </div>
        <p className="mt-4 text-sm font-medium text-ink">This module isn't built yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          The route, navigation entry, and role access for &ldquo;{title}&rdquo; are already wired up.
          It's ready for the backend endpoint and real UI to be added.
        </p>
        {actions.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {actions.map((action) => (
              <span
                key={action}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500"
              >
                {action}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
