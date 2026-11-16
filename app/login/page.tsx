import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginFormFromParams({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="h-40 animate-pulse rounded-lg bg-zinc-100" />
      }
    >
      <LoginFormLoader searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginFormLoader({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/people";

  return <LoginForm nextPath={nextPath} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,_#ecfdf5_0%,_#f4f4f5_45%,_#e4e4e7_100%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Foreman
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Lead CRM
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Sign in to work leads and log calls.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <LoginFormFromParams searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
