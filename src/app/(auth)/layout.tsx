import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main id="main" className="flex flex-1 flex-col items-center px-4 py-10">
      <Logo className="mb-8" />
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-card sm:p-8">{children}</div>
    </main>
  );
}
