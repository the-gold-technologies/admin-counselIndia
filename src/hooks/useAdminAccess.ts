"use client";

import { createContext, createElement, useContext, useEffect, useState } from "react";
import { canAccessPath, type Access } from "@/lib/permissions";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  staffRole?: { id: string; name: string } | null;
}

/**
 * Access of the logged-in admin, provided by the root layout (read on the server from the
 * session cookie) so the menu renders already filtered — no flash of links the user can't open.
 */
const AccessContext = createContext<Access | null>(null);

export function AdminAccessProvider({
  access,
  children,
}: {
  access: Access | null;
  children: React.ReactNode;
}) {
  return createElement(AccessContext.Provider, { value: access }, children);
}

/**
 * Logged-in admin + what they may open. `access` is "*" for Super Admin, otherwise section keys.
 * The server enforces access on every page/API — this is only used to hide links in the UI.
 */
export function useAdminAccess() {
  const serverAccess = useContext(AccessContext);
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [fetchedAccess, setFetchedAccess] = useState<Access | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !data?.authenticated) return;
        setUser(data.user);
        setFetchedAccess(data.access ?? []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const access = fetchedAccess ?? serverAccess;

  return {
    user,
    access,
    /** Until access is known, restricted links stay hidden (never shown-then-removed). */
    canOpen: (href: string) => (access === null ? false : canAccessPath(access, href)),
  };
}
