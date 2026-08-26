export async function GET() {
  return new Response('self.addEventListener("fetch",()=>{});', {
    headers: { 'Content-Type': 'application/javascript' },
  });
}
