import { Skeleton } from '@/components/ui/skeleton';

interface FormPageSkeletonProps {
  showMapPanel?: boolean;
  sections?: number;
}

const FieldSkeleton = () => (
  <div className="grid gap-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-11 w-full rounded-xl" />
  </div>
);

export const FormPageSkeleton = ({ showMapPanel = false, sections = 2 }: FormPageSkeletonProps) => {
  if (showMapPanel) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <Skeleton className="mb-6 h-5 w-40" />
            <div className="grid gap-5">
              <FieldSkeleton />
              <FieldSkeleton />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <Skeleton className="mb-6 h-5 w-32" />
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {Array.from({ length: sections }).map((_, sectionIndex) => (
          <section
            key={sectionIndex}
            className="space-y-5 border-b border-border p-6 last:border-b-0 sm:p-8"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
