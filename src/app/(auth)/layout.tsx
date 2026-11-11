// layout halaman auth (belum ada desain Figma)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1">{children}</main>;
}
