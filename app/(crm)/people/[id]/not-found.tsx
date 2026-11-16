import Link from "next/link";

export default function PersonNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">Lead not found</h1>
      <p className="text-sm text-zinc-500">
        This person may have been removed or the link is invalid.
      </p>
      <Link
        href="/people"
        className="text-sm font-medium text-emerald-800 hover:underline"
      >
        Back to people
      </Link>
    </div>
  );
}
