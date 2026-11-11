// layout halaman customer yang wajib login (navbar + footer menyusul)
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1">{children}</main>;
}
