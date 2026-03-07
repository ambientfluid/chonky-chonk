import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Verify the requesting user is an admin.
 * Returns the user ID if admin, or a NextResponse error otherwise.
 */
async function verifyAdmin(): Promise<
  { userId: string } | { error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { userId: user.id };
}

/**
 * GET /api/admin/users
 * List all user profiles. Uses the service-role client to bypass RLS.
 */
export async function GET() {
  const auth = await verifyAdmin();
  if ("error" in auth) return auth.error;

  const adminClient = createAdminClient();
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profiles });
}

/**
 * PATCH /api/admin/users
 * Update a user's admin status.
 * Body: { userId: string, is_admin: boolean }
 */
export async function PATCH(request: Request) {
  const auth = await verifyAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { userId, is_admin } = body as {
    userId?: string;
    is_admin?: boolean;
  };

  if (!userId || typeof is_admin !== "boolean") {
    return NextResponse.json(
      { error: "userId (string) and is_admin (boolean) are required" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();
  const { data: profile, error } = await adminClient
    .from("profiles")
    .update({ is_admin })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}
