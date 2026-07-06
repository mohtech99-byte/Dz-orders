export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24 text-center">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Page not found</h1>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}
