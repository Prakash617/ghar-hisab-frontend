
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, Check } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold md:mb-12 md:text-4xl">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold">1. Find a Room</h3>
              <p className="mt-2 text-gray-600">
                Search for available rooms by date, time, and capacity. Filter by amenities to find the perfect space for your needs.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold">2. Book Instantly</h3>
              <p className="mt-2 text-gray-600">
                Select a time slot and book your room in seconds. No more waiting for approvals or dealing with complicated forms.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold">3. You're All Set</h3>
              <p className="mt-2 text-gray-600">
                Receive a confirmation and a calendar invite. Your room is reserved and ready for your meeting.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
