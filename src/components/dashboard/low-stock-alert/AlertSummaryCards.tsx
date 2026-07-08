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
    <div className="relative z-10 px-3 pb-3 pt-2 sm:px-8 sm:pb-8">
      <div className="mx-auto grid w-full max-w-[900px] grid-cols-3 gap-2 sm:gap-3">
        <div className="group rounded-xl border border-[#5f84d8]/55 bg-gradient-to-br from-[#13378e] via-[#1a45a8] to-[#1e4bb8] p-3 sm:p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_12px_-2px_rgba(2,6,23,0.45)]">
          <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/90 leading-tight">
            Critical<br className="sm:hidden" /> (out of stock)
          </p>
          <p className="mt-1 sm:mt-3 text-[24px] sm:text-[36px] font-bold leading-none text-white">
            {criticalCount}
          </p>
        </div>

        <div className="group rounded-xl border border-[#5f84d8]/55 bg-gradient-to-br from-[#13378e] via-[#1a45a8] to-[#1e4bb8] p-3 sm:p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_12px_-2px_rgba(2,6,23,0.45)]">
          <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/90 leading-tight">
            Very Low
          </p>
          <p className="mt-1 sm:mt-3 text-[24px] sm:text-[36px] font-bold leading-none text-white">
            {veryLowCount}
          </p>
        </div>

        <div className="group rounded-xl border border-[#5f84d8]/55 bg-gradient-to-br from-[#13378e] via-[#1a45a8] to-[#1e4bb8] p-3 sm:p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_12px_-2px_rgba(2,6,23,0.45)]">
          <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/90 leading-tight">
            Value<br className="sm:hidden" /> at Risk
          </p>
          <p className="mt-1 sm:mt-3 text-[14px] sm:text-[32px] font-bold leading-none text-white break-all">
            {totalValueAtRisk}
          </p>
        </div>
      </div>
    </div>
  );
}