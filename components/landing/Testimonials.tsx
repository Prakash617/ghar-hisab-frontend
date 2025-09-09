
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-12 sm:py-16 md:py-20">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold md:mb-12 md:text-4xl">Loved by Teams Everywhere</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Sarah, Office Manager</p>
                  <p className="text-xs text-gray-500">Acme Inc.</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                “SmartSpace has revolutionized how we manage our meeting rooms. It's simple, powerful, and has saved us countless hours.”
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/lee.png" alt="@lee" />
                  <AvatarFallback>LR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Lee Robinson</p>
                  <p className="text-xs text-gray-500">Vercel</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                “The analytics feature is a game-changer. We've optimized our space usage and saved costs. Highly recommended!”
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/jane.png" alt="@jane" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Jane Doe</p>
                  <p className="text-xs text-gray-500">Stripe</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                “I love the clean interface and mobile app. Booking a room takes seconds, whether I'm at my desk or on the go.”
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
