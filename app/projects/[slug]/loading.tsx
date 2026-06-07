export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-24 t-skel">
        <div className="t-skel-skeleton is-pulsing" style={{ position: "relative" }}>
        {/* Back link */}
        <div className="h-5 w-32 bg-muted rounded mb-8" />

        {/* Title and period */}
        <div className="mb-12">
          <div className="h-14 w-80 bg-muted rounded mb-4" />
          <div className="h-6 w-48 bg-muted rounded" />
        </div>

        {/* Hero section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-2xl" />
            <div className="aspect-video bg-muted rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
          <div className="aspect-[4/3] bg-muted rounded-2xl" />
        </div>

        {/* Terminal */}
        <div className="h-64 bg-muted rounded-xl mb-16" />

        {/* Content and sidebar */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          <div className="space-y-8">
            <div>
              <div className="h-8 w-32 bg-muted rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            </div>
            <div>
              <div className="h-8 w-40 bg-muted rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <div className="h-4 w-20 bg-muted rounded mb-4" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
            <div>
              <div className="h-4 w-16 bg-muted rounded mb-4" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-muted rounded-full" />
                <div className="h-6 w-20 bg-muted rounded-full" />
                <div className="h-6 w-14 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
