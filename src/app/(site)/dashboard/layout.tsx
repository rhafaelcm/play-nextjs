// Layout sem uso de client components, pois a verificação de sessão
// agora é feita na própria página do dashboard

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}