"use client";

import { useEffect, useState } from "react";

type RoleState = {
  role: string;
  loading: boolean;
};

let globalRoleState: RoleState = { role: "Default User", loading: true };
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getRoles(): RoleState {
  return globalRoleState;
}

export function useRoles() {
  const [state, setState] = useState<RoleState>(globalRoleState);

  useEffect(() => {
    function handleStoreChange() {
      setState(globalRoleState);
    }
    listeners.push(handleStoreChange);
    return () => {
      listeners = listeners.filter((l) => l !== handleStoreChange);
    };
  }, []);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const role = data?.user?.["https://insurance-hub/roles"]?.[0] ?? "Default User";
          globalRoleState = { role, loading: false };
          emitChange();
        } else {
          globalRoleState = { role: "Default User", loading: false };
          emitChange();
        }
      } catch {
        globalRoleState = { role: "Default User", loading: false };
        emitChange();
      }
    }
    fetchRole();
  }, []);

  return state;
}
