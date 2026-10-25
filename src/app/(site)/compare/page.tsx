import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CompareView } from "@/components/compare/compare-view";

export const metadata: Metadata = { title: "Compare cars" };

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader title="Compare" description="See up to four cars side by side." />
      <CompareView />
    </div>
  );
}
