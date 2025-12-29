export const SkeletonLoader = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <header className="flex flex-col gap-2 text-left">
        <div className="h-7 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
        <div className="inline-flex items-center gap-2 bg-slate-100 w-fit px-3 py-1.5 rounded-full">
          <div className="w-2.5 h-2.5 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-2 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
      </header>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1 - Vendas Totais */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 min-h-[110px] shadow-sm">
          <div className="w-8 h-8 bg-slate-100 rounded-full mb-3 animate-pulse"></div>
          <div className="h-2.5 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded w-28 animate-pulse"></div>
        </div>

        {/* Card 2 - Esgotados */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 min-h-[110px] shadow-sm">
          <div className="w-8 h-8 bg-slate-100 rounded-full mb-3 animate-pulse"></div>
          <div className="h-2.5 bg-slate-200 rounded w-20 mb-2 animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded w-20 animate-pulse"></div>
        </div>

        {/* Card 3 - Lucro Liquido */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 min-h-[110px] shadow-sm">
          <div className="w-8 h-8 bg-slate-100 rounded-full mb-3 animate-pulse"></div>
          <div className="h-2.5 bg-slate-200 rounded w-28 mb-2 animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded w-28 animate-pulse"></div>
        </div>

        {/* Card 4 - Total em Stock */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 min-h-[110px] shadow-sm">
          <div className="w-8 h-8 bg-slate-100 rounded-full mb-3 animate-pulse"></div>
          <div className="h-2.5 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Ranking Card Skeleton */}
      <div className="bg-[#BC2A1A] rounded-3xl shadow-lg border-none overflow-hidden">
        {/* Header do Ranking */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="h-3 bg-white/25 rounded w-36 animate-pulse"></div>
          <div className="w-3 h-3 bg-white/25 rounded animate-pulse"></div>
        </div>

        {/* Lista de Vendedores */}
        <div className="p-4 space-y-3">
          {/* Vendedor 1 */}
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/25 rounded-full animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-3 bg-white/25 rounded w-20 animate-pulse"></div>
                <div className="h-2 bg-white/20 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="h-4 bg-white/25 rounded w-24 animate-pulse"></div>
          </div>

          {/* Vendedor 2 */}
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/25 rounded-full animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-3 bg-white/25 rounded w-20 animate-pulse"></div>
                <div className="h-2 bg-white/20 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="h-4 bg-white/25 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
