import { Button } from "@/components/ui/button";
import Link from "next/link";

function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
      </svg>
      <span className="text-lg font-semibold">SmartSpace</span>
    </div>
  )
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/90">
      <div className="space-y-4 text-center">
        <AppLogo />
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404 - Page Not Found</h1>
        <p className="max-w-[600px] text-gray-600 md:text-xl">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button>Go back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
