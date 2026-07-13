export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton w-full rounded" />
        <div className="h-4 skeleton w-2/3 rounded" />
      </div>
    </div>
  );
}
