"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { Camera } from "lucide-react";
import type { Profile } from "@/types/database";
import { MAX_BIO_LENGTH, MAX_SCREEN_NAME_LENGTH } from "@/lib/utils/constants";
import { useProfile } from "@/lib/hooks/useProfile";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";

interface ProfileFormProps {
  initialProfile: Profile;
}

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp";

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const { updateProfile, uploadAvatar, error: hookError } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [screenName, setScreenName] = useState(initialProfile.screen_name);
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Avatar upload
  // ---------------------------------------------------------------------------
  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setFeedback(null);

      // Optimistic preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      await uploadAvatar(file);

      // Clean up the object URL after upload succeeds
      URL.revokeObjectURL(previewUrl);

      // Re-read the profile avatar from the hook is unnecessary because
      // uploadAvatar already updates the profile, but we can't read it here
      // directly. We just trust the upload succeeded.
      setFeedback({ type: "success", message: "Avatar updated!" });
    } catch {
      setFeedback({ type: "error", message: "Failed to upload avatar." });
    } finally {
      setUploading(false);
      // Reset file input so re-uploading the same file triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Form submission
  // ---------------------------------------------------------------------------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedName = screenName.trim();

    if (!trimmedName) {
      setFeedback({ type: "error", message: "Screen name cannot be empty." });
      return;
    }

    if (trimmedName.length > MAX_SCREEN_NAME_LENGTH) {
      setFeedback({
        type: "error",
        message: `Screen name must be ${MAX_SCREEN_NAME_LENGTH} characters or fewer.`,
      });
      return;
    }

    if (bio.length > MAX_BIO_LENGTH) {
      setFeedback({
        type: "error",
        message: `Bio must be ${MAX_BIO_LENGTH} characters or fewer.`,
      });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      await updateProfile({
        screen_name: trimmedName,
        bio,
      });

      if (hookError) {
        setFeedback({ type: "error", message: hookError });
      } else {
        setFeedback({ type: "success", message: "Profile saved successfully!" });
      }
    } catch {
      setFeedback({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const bioRemaining = MAX_BIO_LENGTH - bio.length;

  return (
    <Card variant="game" className="mx-auto max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ------------------------------------------------------------------ */}
        {/* Avatar Section                                                     */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploading}
            className={cn(
              "group relative rounded-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bubblegum-400 focus-visible:ring-offset-4",
              "transition-transform duration-200 hover:scale-105 active:scale-95",
              uploading && "pointer-events-none opacity-60",
            )}
            aria-label="Change avatar"
          >
            <Avatar
              src={avatarUrl}
              name={screenName || "?"}
              size="xl"
              className="h-28 w-28 text-2xl [&>*]:h-28 [&>*]:w-28"
            />

            {/* Overlay */}
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full",
                "bg-black/40 opacity-0 transition-opacity duration-200",
                "group-hover:opacity-100",
              )}
            >
              <Camera className="h-6 w-6 text-white" />
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-xs text-grape-400">
            {uploading ? "Uploading..." : "Click avatar to upload a new photo"}
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Screen Name                                                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="space-y-2">
          <label
            htmlFor="screen-name"
            className="block text-sm font-semibold text-grape-700"
          >
            Screen Name
          </label>
          <Input
            id="screen-name"
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            maxLength={MAX_SCREEN_NAME_LENGTH}
            placeholder="Enter your screen name"
            disabled={saving}
          />
          <p className="text-right text-xs text-grape-300">
            {screenName.length}/{MAX_SCREEN_NAME_LENGTH}
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Bio                                                                */}
        {/* ------------------------------------------------------------------ */}
        <div className="space-y-2">
          <label
            htmlFor="bio"
            className="block text-sm font-semibold text-grape-700"
          >
            Bio
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={MAX_BIO_LENGTH}
            placeholder="Tell everyone a bit about yourself..."
            rows={4}
            disabled={saving}
          />
          <p
            className={cn(
              "text-right text-xs",
              bioRemaining <= 20 ? "text-bubblegum-500" : "text-grape-300",
            )}
          >
            {bioRemaining} characters remaining
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Feedback Message                                                   */}
        {/* ------------------------------------------------------------------ */}
        {feedback && (
          <div
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-medium",
              feedback.type === "success"
                ? "bg-lime-100 text-lime-700"
                : "bg-bubblegum-100 text-bubblegum-600",
            )}
            role="alert"
          >
            {feedback.message}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Submit                                                             */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={saving || uploading}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
