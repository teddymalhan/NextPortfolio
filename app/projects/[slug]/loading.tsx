export default function Loading() {
  return (
    <div className="min-h-screen bg-background t-skel" aria-busy="true" aria-label="Loading project">
      <div className="t-skel-skeleton is-pulsing" style={{ position: "relative" }}>
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
          <div className="h-5 w-20 bg-muted rounded" />
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-12 lg:pb-24">
          <div className="mb-12 space-y-4">
            <div className="h-14 w-80 max-w-full bg-muted rounded" />
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-7 w-full max-w-2xl bg-muted rounded" />
          </div>
          <div className="relative -mx-6 lg:-mx-16 xl:-mx-24 mb-16">
            <div className="aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/8] mx-4 lg:mx-8 bg-muted rounded-2xl" />
          </div>
          <div className="h-11 bg-muted rounded-lg mb-8 lg:hidden" />
          <div className="grid lg:grid-cols-[240px_1fr_280px] gap-8 lg:gap-12">
            <div className="hidden lg:block space-y-4">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
            <div className="space-y-12">
              {[0, 1].map((section) => (
                <div key={section}>
                  <div className="h-8 w-40 bg-muted rounded mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-6 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-6 w-16 bg-muted rounded" />
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
