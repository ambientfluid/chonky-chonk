"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

interface SentInvite {
  email: string;
  timestamp: Date;
  status: "sent" | "pending";
}

export function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to send invite");
        return;
      }

      setSuccessMessage(`Invite sent to ${email.trim()}`);
      setSentInvites((prev) => [
        { email: email.trim(), timestamp: new Date(), status: "sent" },
        ...prev,
      ]);
      setEmail("");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Decorative gradient strip */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bubblegum-400 via-grape-400 to-lime-400" />

      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bubblegum-100">
          <Mail className="h-4 w-4 text-bubblegum-500" />
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-800">
          Invite User
        </h2>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        Send an email invite to bring new players into the game!
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            type="email"
            placeholder="player@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading || !email.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Invite
            </>
          )}
        </Button>
      </form>

      {/* Success message */}
      {successMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-lime-50 px-4 py-3 text-sm text-lime-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recent invites history */}
      {sentInvites.length > 0 && (
        <div className="mt-6 border-t border-grape-100 pt-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Clock className="h-3.5 w-3.5" />
            Recent Invites
          </h3>
          <ul className="space-y-2">
            {sentInvites.map((invite, i) => (
              <li
                key={`${invite.email}-${i}`}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm",
                  i % 2 === 0 ? "bg-bubblegum-50/50" : "bg-white",
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-grape-400" />
                  <span className="truncate text-gray-700">{invite.email}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-gray-400">
                    {invite.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Badge variant={invite.status === "sent" ? "green" : "gray"}>
                    {invite.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
