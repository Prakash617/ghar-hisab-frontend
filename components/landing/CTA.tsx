
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="container text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
        <p className="mx-auto mt-4 max-w-[600px] text-gray-600 md:text-xl">
          Sign up today and experience the future of room management. No credit card required.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
