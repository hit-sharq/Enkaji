import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryLoading() {
  return (
    <main>
        {/* Breadcrumb Skeleton */}
        <section className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-12" />
              <span className="text-gray-400">/</span>
              <Skeleton className="h-4 w-20" />
              <span className="text-gray-400">/</span>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </section>

        {/* Category Header Skeleton */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </section>

        {/* Filters Skeleton */}
        <section className="py-6 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <Skeleton className="h-10 w-full max-w-md" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-20" />
                <div className="flex space-x-2">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid Skeleton */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
  )
}
