export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only the page background lives here. The padded, centered frame is applied by
  // each page through AuthPageFrame (app/(auth)/_components/AuthShell.tsx), so the
  // split login/register layout can span the full viewport.
  return <div className="min-h-screen bg-brand-background">{children}</div>;
}
