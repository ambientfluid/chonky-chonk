"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  ArrowUpDown,
  Shield,
  ShieldOff,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import type { Profile } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";

type SortField = "screen_name" | "created_at";
type SortDirection = "asc" | "desc";

interface UserTableProps {
  initialUsers: Profile[];
}

export function UserTable({ initialUsers }: UserTableProps) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    user: Profile | null;
    newAdminState: boolean;
  }>({ open: false, user: null, newAdminState: false });
  const [toggling, setToggling] = useState(false);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((user) =>
        user.screen_name.toLowerCase().includes(term),
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "screen_name") {
        comparison = a.screen_name.localeCompare(b.screen_name);
      } else {
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [users, searchTerm, sortField, sortDirection]);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField],
  );

  function openConfirmModal(user: Profile) {
    setConfirmModal({
      open: true,
      user,
      newAdminState: !user.is_admin,
    });
  }

  async function handleToggleAdmin() {
    if (!confirmModal.user) return;

    setToggling(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: confirmModal.user.id,
          is_admin: confirmModal.newAdminState,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }

      const { profile: updatedProfile } = await res.json();

      setUsers((prev) =>
        prev.map((u) =>
          u.id === updatedProfile.id ? { ...u, ...updatedProfile } : u,
        ),
      );

      setConfirmModal({ open: false, user: null, newAdminState: false });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update admin status",
      );
    } finally {
      setToggling(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const SortIcon = ({
    field,
  }: {
    field: SortField;
  }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-bubblegum-500" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-bubblegum-500" />
    );
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-grape-100">
              <Users className="h-4 w-4 text-grape-500" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-800">
                All Users
              </h2>
              <p className="text-xs text-gray-400">
                {filteredUsers.length} of {users.length} user
                {users.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grape-300" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-grape-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-grape-400">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-grape-400">
                  Bio
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-grape-400">
                  <button
                    onClick={() => toggleSort("screen_name")}
                    className="inline-flex items-center gap-1 transition-colors hover:text-grape-600"
                  >
                    Name
                    <SortIcon field="screen_name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-grape-400">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-grape-400">
                  <button
                    onClick={() => toggleSort("created_at")}
                    className="inline-flex items-center gap-1 transition-colors hover:text-grape-600"
                  >
                    Joined
                    <SortIcon field="created_at" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={cn(
                    "border-b border-grape-50 transition-colors hover:bg-bubblegum-50/30",
                    index % 2 === 0 ? "bg-bubblegum-50/20" : "bg-white",
                  )}
                >
                  <td className="px-4 py-3">
                    <Avatar
                      src={user.avatar_url}
                      name={user.screen_name}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">
                      {user.screen_name}
                    </span>
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <span className="line-clamp-1 text-sm text-gray-500">
                      {user.bio || "--"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openConfirmModal(user)}
                      className="group"
                      title={
                        user.is_admin
                          ? "Click to remove admin"
                          : "Click to make admin"
                      }
                    >
                      {user.is_admin ? (
                        <Badge variant="purple" className="cursor-pointer group-hover:opacity-80">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="gray" className="cursor-pointer group-hover:opacity-80">
                          User
                        </Badge>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    {searchTerm
                      ? "No users match your search"
                      : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className={cn(
                "rounded-xl p-4 transition-colors",
                index % 2 === 0 ? "bg-bubblegum-50/30" : "bg-grape-50/20",
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar
                  src={user.avatar_url}
                  name={user.screen_name}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-gray-800">
                      {user.screen_name}
                    </span>
                    <button onClick={() => openConfirmModal(user)}>
                      {user.is_admin ? (
                        <Badge variant="purple">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="gray">User</Badge>
                      )}
                    </button>
                  </div>
                  {user.bio && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {user.bio}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Joined {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              {searchTerm
                ? "No users match your search"
                : "No users found"}
            </div>
          )}
        </div>

        {/* Sort controls for mobile */}
        <div className="mt-4 flex gap-2 border-t border-grape-100 pt-4 md:hidden">
          <Button
            variant={sortField === "screen_name" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => toggleSort("screen_name")}
          >
            Name
            <SortIcon field="screen_name" />
          </Button>
          <Button
            variant={sortField === "created_at" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => toggleSort("created_at")}
          >
            Joined
            <SortIcon field="created_at" />
          </Button>
        </div>
      </Card>

      {/* Confirm admin toggle modal */}
      <Modal
        open={confirmModal.open}
        onClose={() =>
          setConfirmModal({ open: false, user: null, newAdminState: false })
        }
        title="Confirm Admin Change"
      >
        {confirmModal.user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-grape-50 p-4">
              <Avatar
                src={confirmModal.user.avatar_url}
                name={confirmModal.user.screen_name}
                size="md"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {confirmModal.user.screen_name}
                </p>
                <p className="text-sm text-gray-500">
                  {confirmModal.newAdminState
                    ? "Will be granted admin privileges"
                    : "Will have admin privileges removed"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {confirmModal.newAdminState ? (
                <Shield className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <ShieldOff className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>
                {confirmModal.newAdminState
                  ? "This user will be able to manage other users and access admin tools."
                  : "This user will no longer have access to admin tools."}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    user: null,
                    newAdminState: false,
                  })
                }
                disabled={toggling}
              >
                Cancel
              </Button>
              <Button
                variant={confirmModal.newAdminState ? "secondary" : "primary"}
                size="md"
                className="flex-1"
                onClick={handleToggleAdmin}
                disabled={toggling}
              >
                {toggling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : confirmModal.newAdminState ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Grant Admin
                  </>
                ) : (
                  <>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Remove Admin
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
