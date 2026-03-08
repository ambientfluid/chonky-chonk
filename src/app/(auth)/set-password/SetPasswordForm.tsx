"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function verifyInvite() {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (!tokenHash || type !== "invite") {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setVerified(true);
        } else {
          setError(
            "Invalid or missing invite link. Please check your email for the correct link."
          );
        }
        setVerifying(false);
        return;
      }

      const supabase = createClient();

      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "invite",
      });

      if (verifyError) {
        setError(verifyError.message);
        setVerifying(false);
        return;
      }

      setVerified(true);
      setVerifying(false);
    }

    verifyInvite();
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // Set the password and mark onboarding as complete
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { onboarding_completed: true },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Redirect to profile page to set username and upload avatar
    router.push("/profile?welcome=true");
    router.refresh();
  }

  if (verifying) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-bubblegum-300 border-t-bubblegum-600" />
        <p className="text-grape-500 font-medium">Verifying your invite...</p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="text-center space-y-4 py-8">
        <h1 className="text-xl font-bold font-[family-name:var(--font-display)] text-grape-800">
          Oops!
        </h1>
        {error && (
          <div className="rounded-xl bg-bubblegum-50 border border-bubblegum-200 p-3 text-sm text-bubblegum-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-grape-800">
          Create Your Account
        </h1>
        <p className="text-sm text-grape-500">
          Set a password to secure your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-grape-700"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-grape-700"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Type it again to be sure"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-bubblegum-50 border border-bubblegum-200 p-3 text-sm text-bubblegum-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
