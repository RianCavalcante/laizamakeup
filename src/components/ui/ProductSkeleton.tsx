export const ProductSkeleton = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="h-7 bg-slate-200 rounded-lg w-40 animate-pulse"></div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-3 bg-slate-200 rounded w-28 animate-pulse"></div>
          <div className="h-3 bg-slate-100 rounded w-16 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
                  <div className="h-2 bg-slate-100 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-3 bg-slate-200 rounded w-16 animate-pulse ml-auto"></div>
                <div className="h-3 bg-slate-100 rounded w-14 animate-pulse ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
