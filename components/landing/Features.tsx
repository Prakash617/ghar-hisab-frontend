
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BarChart, Users } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="bg-white py-12 sm:py-16 md:py-20">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold md:mb-12 md:text-4xl">Why SmartSpace?</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <CheckCircle className="h-8 w-8 text-primary" />
              <CardTitle>Effortless Room Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Instantly book rooms, check availability, and manage reservations with our intuitive interface. Say goodbye to double bookings and scheduling headaches.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <BarChart className="h-8 w-8 text-primary" />
              <CardTitle>Powerful Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gain valuable insights into room usage, peak hours, and popular amenities. Optimize your office space and make data-driven decisions.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>Seamless Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Invite team members, manage permissions, and collaborate on bookings. SmartSpace is designed for teams of all sizes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
