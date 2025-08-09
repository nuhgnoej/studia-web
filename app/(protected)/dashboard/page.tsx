// app/(protected)/dashboard/page.tsx
import PageHeader from "@/components/PageHeader";

export default function Dashboard() {
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <PageHeader title="Dashboard" />
      <p>내용</p>
    </main>
  );
}
