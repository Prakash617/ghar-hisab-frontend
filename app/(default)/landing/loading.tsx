import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Loading State */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-20">
          <div className="space-y-8">
            <Skeleton className="h-8 w-24 bg-gray-700" />
            <Skeleton className="h-16 w-3/4 sm:w-2/3 bg-gray-700" />
            <Skeleton className="h-12 w-full sm:w-1/2 bg-gray-700" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32 bg-gray-700" />
              <Skeleton className="h-12 w-32 bg-gray-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Loading State */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-24 mx-auto mb-4" />
            <Skeleton className="h-12 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-8 w-1/2 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-lg shadow">
                <Skeleton className="h-10 w-10 mb-4" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
