import Link from "next/link";

// Saywright logosu: bir konuşma balonu — "sen söyle, biz kuralım"
export default function Logo({ acik = false }: { acik?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-lg font-bold tracking-tight ${acik ? "text-white" : "text-gece"}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#131B2B" />
        <path d="M9 11.5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-4.5L12 22.5v-3a3 3 0 0 1-3-3v-5Z" fill="#CFEAE0" />
        <circle cx="13" cy="14" r="1.2" fill="#2F4A63" />
        <circle cx="16" cy="14" r="1.2" fill="#2F4A63" />
        <circle cx="19" cy="14" r="1.2" fill="#5B91A3" />
      </svg>
      Saywright
    </Link>
  );
}
