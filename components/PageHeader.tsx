// components/PageHeader.tsx
"use client";

import LogoutButton from "./Logout";

type PageHeaderProps = {
  title: string;
};

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <LogoutButton />
    </header>
  );
}
