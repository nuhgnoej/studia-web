// app/(protected)/dashboard/page.tsx
"use client";
import JsonEditor from "@/components/JsonEditore";
import PageHeader from "@/components/PageHeader";

export default function Dashboard() {
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <PageHeader title="Dashboard" />
      <JsonEditor />
    </main>
  );
}
