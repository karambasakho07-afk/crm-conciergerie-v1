// app/components/Nav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/tickets", label: "Tickets" },
  { href: "/reviews", label: "Avis" },
  { href: "/planning", label: "Planning" },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-4">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`hover:underline ${
            pathname === href ? "text-blue-400 font-semibold" : ""
          }`}
        >
          {label}
        </Link>
      ))}
      <button
        onClick={() => alert("Déconnexion")}
        className="ml-4 text-red-400 hover:underline"
      >
        Logout
      </button>
    </nav>
  )
}