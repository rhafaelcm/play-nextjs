"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-block rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-blue-dark"
    >
      Sign Out
    </button>
  );
}