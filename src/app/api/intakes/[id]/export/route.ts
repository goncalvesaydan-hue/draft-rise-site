import { type NextRequest, NextResponse } from "next/server";
import { authenticate, fail } from "@/lib/portal/http";
import { getStore, PortalError } from "@/lib/portal/store";
import { exportMarkdown } from "@/lib/portal/questionnaire";
export const runtime = "nodejs";
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const who = await authenticate(req),
      { id } = await ctx.params,
      s = await (await getStore()).submission(id, who);
    if (!s) throw new PortalError(409, "Submete a ficha antes de exportar.");
    return new NextResponse(exportMarkdown(s.snapshot, s.reference), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${s.reference}.md"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return fail(e);
  }
}
