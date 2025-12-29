export const SidebarSkeleton = () => {
  return (
    <aside className="w-80 hidden lg:flex flex-col fixed inset-y-6 left-6 z-50">
      <div className="flex-1 glass-panel rounded-[40px] flex flex-col p-6 shadow-2xl animate-pulse">
        <div className="px-6 py-6 mb-4">
          <div className="h-7 bg-slate-200 rounded-lg w-40"></div>
        </div>

        <nav className="flex-1 space-y-3">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="w-full flex items-center justify-between px-6 py-5 rounded-[24px] bg-slate-100/70"
            >
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 bg-slate-200 rounded"></div>
                <div className="h-2.5 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="w-4 h-2 bg-slate-200 rounded"></div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#FFDCD8]/50 flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-white rounded-2xl border border-[#FFDCD8]"></div>
          <div className="space-y-1">
            <div className="h-2.5 bg-slate-200 rounded w-24"></div>
            <div className="h-2 bg-slate-200 rounded w-14"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
