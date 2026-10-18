import { type NextRequest, NextResponse } from "next/server";
import { authenticate, fail } from "@/lib/portal/http";
import { getStore, PortalError } from "@/lib/portal/store";
import { exportMarkdown, makeSnapshot } from "@/lib/portal/questionnaire";
export const runtime = "nodejs";
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const who = await authenticate(req),
      { id } = await ctx.params,
      store = await getStore(),
      s = await store.submission(id, who);
    if (s) {
      return new NextResponse(exportMarkdown(s.snapshot, s.reference), {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${s.reference}.md"`,
          "Cache-Control": "no-store",
        },
      });
    }
    if (who.role === "team" && who.isAdmin) {
      const intake = await store.get(id, who);
      const ref = `RASCUNHO-${id.slice(0, 8).toUpperCase()}`;
      return new NextResponse(
        exportMarkdown(makeSnapshot(intake.answers), ref),
        {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${ref}.md"`,
            "Cache-Control": "no-store",
          },
        },
      );
    }
    throw new PortalError(409, "Submete a ficha antes de exportar.");
  } catch (e) {
    return fail(e);
  }
}

