import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Unable to retrieve user session.");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setError(profileError.message);
          return;
        }

        setProfile(data as Profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      try {
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Unable to retrieve user session.");
          return;
        }

        const { data, error: updateError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id)
          .select()
          .single();

        if (updateError) {
          setError(updateError.message);
          return;
        }

        setProfile(data as Profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update profile.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      try {
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Unable to retrieve user session.");
          return;
        }

        const timestamp = Date.now();
        const filePath = `${user.id}/${timestamp}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        const { data, error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", user.id)
          .select()
          .single();

        if (updateError) {
          setError(updateError.message);
          return;
        }

        setProfile(data as Profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload avatar.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { profile, loading, error, updateProfile, uploadAvatar };
}
