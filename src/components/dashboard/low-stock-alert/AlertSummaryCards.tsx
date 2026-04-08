"use client";

interface AlertSummaryCardsProps {
  criticalCount: number;
  veryLowCount: number;
  totalValueAtRisk: string;
}

export default function AlertSummaryCards({
  criticalCount,
  veryLowCount,
  totalValueAtRisk,
}: AlertSummaryCardsProps) {
  return (
    <div className="relative z-10 px-4 pb-4 pt-2 sm:px-8 sm:pb-8">
      <div className="mx-auto grid w-full max-w-[900px] gap-3 sm:grid-cols-3">
        <div className="group rounded-xl border border-[#5f84d8]/55 bg-gradient-to-br from-[#13378e] via-[#1a45a8] to-[#1e4bb8] p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_12px_-2px_rgba(2,6,23,0.45)] transition-all duration-200 hover:from-[#1843a2] hover:via-[#1f4fb9] hover:to-[#2459cb]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
            Critical (out of stock)
          </p>
          <p className="mt-2 text-[30px] font-bold leading-none text-white sm:mt-3 sm:text-[36px]">
            {criticalCount}
          </p>
        </div>

        <div className="group rounded-xl border border-[#5f84d8]/55 bg-gradient-to-br from-[#13378e] via-[#1a45a8] to-[#1e4bb8] p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_12px_-2px_rgba(2,6,23,0.45)] transition-all duration-200 hover:from-[#1843a2] hover:via-[#1f4fb9] hover:to-[#2459cb]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
            Very Low
          </p>
          <p className="mt-2 text-[30px] font-bold leading-none text-white sm:mt-3 sm:text-[36px]">
            {veryLowCount}
          </p>
        </div>

        <div className="group rounded-xl border border-[#5f84d8]/55 bg-gradient-to-br from-[#13378e] via-[#1a45a8] to-[#1e4bb8] p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_12px_-2px_rgba(2,6,23,0.45)] transition-all duration-200 hover:from-[#1843a2] hover:via-[#1f4fb9] hover:to-[#2459cb]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
            Total Value at Risk
          </p>
          <p className="mt-2 text-[24px] font-bold leading-none text-white sm:mt-3 sm:text-[32px]">
            {totalValueAtRisk}
          </p>
        </div>
      </div>
    </div>
  );
}
