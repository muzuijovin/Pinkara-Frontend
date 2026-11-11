// layout panel admin (role ADMIN dicek di server/middleware), sidebar menyusul (PRD §12)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1">{children}</main>;
}
