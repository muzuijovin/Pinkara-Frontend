// layout dashboard admin (belum ada desain Figma), URL diawali /admin
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1">{children}</main>;
}
