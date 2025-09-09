
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function Footer() {
  return (
    <footer id="contact" className="border-t bg-white">
      <div className="container grid gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="flex flex-col gap-4">
          <AppLogo />
          <p className="text-sm text-gray-600">
            The all-in-one solution for modern room booking and office management.
          </p>
        </div>
        <div className="grid gap-4">
          <h3 className="font-semibold">Company</h3>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            About Us
          </Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Careers
          </Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Blog
          </Link>
        </div>
        <div className="grid gap-4">
          <h3 className="font-semibold">Support</h3>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Help Center
          </Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Contact Us
          </Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Privacy Policy
          </Link>
        </div>
        <div className="grid gap-4">
          <h3 className="font-semibold">Stay Connected</h3>
          <form className="flex gap-2">
            <Input type="email" placeholder="Enter your email" />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </div>
      <div className="border-t py-4">
        <div className="container flex items-center justify-between text-sm text-gray-600">
          <p>© 2025 SmartSpace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-900">
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
                    className="h-5 w-5"
                >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 2.8 3.2 3 5.2-1.4 1.2-3 2-5 2h-7a4 4 0 0 1-4-4v-2" />
                    <path d="M9 9a3 3 0 0 0-3-3v0a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3v0a3 3 0 0 0 3-3v0Z" />
                    <path d="M12 12a3 3 0 0 0 3-3v0a3 3 0 0 0 3-3v0a3 3 0 0 0-3-3v0a3 3 0 0 0-3 3v0Z" />
                </svg>
            </Link>
            <Link href="#" className="hover:text-gray-900">
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
                    className="h-5 w-5"
                >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
            </Link>
            <Link href="#" className="hover:text-gray-900">
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
                    className="h-5 w-5"
                >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
