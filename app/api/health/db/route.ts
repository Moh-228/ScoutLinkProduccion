export async function GET() {
  return Response.json({
    ok: true,
    mode: "prototype-ui",
    db: "disabled",
  });
}