import { DateRange } from 'react-day-picker';

export const getMockSalesData = (range?: DateRange) => {
   const days = range?.from && range?.to
      ? Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      : 1;

   return {
      catA: { core: 145650 * days, txns: 42 * days, vat: 22290 * days, avg: 3468, items: 158 * days },
      catB: { core: 68450 * days, txns: 18 * days, overflow: 45250 * days, baseNonTax: 23200 * days, avg: 3803, items: 62 * days },
      catC: { core: 35800 * days, entries: 14 * days, labour: 22500 * days, install: 8500 * days, misc: 4800 * days }
   };
};
