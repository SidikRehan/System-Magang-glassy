import React from 'react';
import { Sparkles } from 'lucide-react';

const parseDim = (v) => parseFloat(String(v ?? '').replace(',', '.')) || 0;

const getSides = (v) => {
    const n = parseInt(v);
    return Number.isNaN(n) ? 2 : Math.min(2, Math.max(0, n));
};

/**
 * Pilihan sisi yang digosok mesin (GM).
 * gm_sides_length = jumlah sisi panjang yang digosok (0-2)
 * gm_sides_width  = jumlah sisi lebar yang digosok (0-2)
 */
export default function GmSidesSelector({ item, idx, handleItemChange, prefix = 'gm', title = 'Sisi yang Digosok Mesin (GM)', rateLabel = 'tarif GM', children }) {
    const l = parseDim(item.length_cm);
    const w = parseDim(item.width_cm);
    const sL = getSides(item[`${prefix}_sides_length`]);
    const sW = getSides(item[`${prefix}_sides_width`]);
    const gmLengthCm = sL * l + sW * w;

    const renderGroup = (label, dim, field, current) => (
        <div className="space-y-1">
            <span className="text-[11px] text-slate-700 font-semibold block">
                {label} <span className="font-mono text-slate-500">({dim || 0} cm)</span>
            </span>
            <div className="flex gap-1.5">
                {[0, 1, 2].map(n => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => handleItemChange(idx, field, n)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                            current === n
                                ? 'bg-[#1b68b0] border-[#1b68b0] text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {n} sisi
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-[#242222] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#1b68b0]" />
                <span>{title}</span>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
                {children}
                {renderGroup('Sisi Panjang', l, `${prefix}_sides_length`, sL)}
                {renderGroup('Sisi Lebar', w, `${prefix}_sides_width`, sW)}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
                Panjang proses: ({sL} × {l || 0}) + ({sW} × {w || 0}) = <strong className="text-slate-800">{gmLengthCm} cm</strong> ({(gmLengthCm / 100).toLocaleString('id-ID')} m) × {rateLabel}
            </p>
        </div>
    );
}
