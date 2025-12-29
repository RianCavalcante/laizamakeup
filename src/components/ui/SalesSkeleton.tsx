export const SalesSkeleton = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="h-7 bg-slate-200 rounded-lg w-32 animate-pulse"></div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-3 bg-slate-200 rounded w-24 animate-pulse"></div>
          <div className="h-3 bg-slate-100 rounded w-14 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-center py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-20 animate-pulse ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
