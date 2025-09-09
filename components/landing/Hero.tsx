
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="py-12 text-center sm:py-24 md:py-32 lg:py-48">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          The Future of Room Management is Here
        </h1>
        <p className="mx-auto mt-4 max-w-[700px] text-gray-600 md:text-xl">
          Streamline your room booking process, eliminate conflicts, and gain valuable insights with SmartSpace. The all-in-one solution for modern office management.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started for Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#how-it-works">Learn More</Link>
          </Button>
        </div>
        <div className="mt-12">
          <Image
            src="/placeholder.svg"
            alt="SmartSpace Dashboard"
            width={1200}
            height={600}
            className="mx-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
