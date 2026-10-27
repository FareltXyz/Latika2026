import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { error: finishError } = await admin
    .from("quizzes")
    .update({ status: "finished" })
    .eq("status", "live")
    .lte("ends_at", now);

  if (finishError) {
    console.error("Overdue live quiz update failed", {
      code: finishError.code,
      message: finishError.message,
    });
    return Response.json(
      { error: "Status kuis kedaluwarsa gagal diperbarui." },
      { status: 500 },
    );
  }

  const { data, error } = await admin
    .from("quizzes")
    .delete()
    .neq("status", "live")
    .lte("expires_at", now)
    .select("id");

  if (error) {
    console.error("Expired quiz cleanup failed", {
      code: error.code,
      message: error.message,
    });
    return Response.json(
      { error: "Pembersihan kuis kedaluwarsa gagal." },
      { status: 500 },
    );
  }

  return Response.json({ deleted: data?.length ?? 0 });
}
