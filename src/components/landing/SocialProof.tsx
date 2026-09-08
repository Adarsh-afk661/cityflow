import React from 'react';

export const SocialProof: React.FC = () => {
  const brands = [
    'Metroflow Logistics',
    'Harrow Freight',
    'Ashford Cold Chain',
    'Deacon Distribution',
    'Northline Carriers'
  ];

  return (
    <section className="py-12 border-t border-b border-slate-200/70 bg-slate-50/50 px-6">
      <div className="max-w-5xl mx-auto text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 font-mono">
          TRUSTED BY DISPATCH TEAMS AT
        </p>

        <div className="flex flex-wrap items-center justify-between gap-6 md:gap-8">
          {brands.map((brand, idx) => (
            <span
              key={idx}
              className="text-base sm:text-lg font-bold text-slate-400/90 hover:text-slate-700 transition font-sans cursor-default tracking-tight"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
