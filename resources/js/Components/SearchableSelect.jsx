import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Layers } from 'lucide-react';

export default function SearchableSelect({
    value = '',
    onChange = () => {},
    options = [],
    placeholder = '-- Ketik atau Cari Jenis Kaca Dasar --',
    invalid = false,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Sync search term with value when value changes externally
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm(value || '');
        }
    }, [value, isOpen]);

    // Filter options based on search term
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                // Reset search term back to current selected value on blur if not selected
                setSearchTerm(value || '');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const handleSelectOption = (opt) => {
        onChange(opt);
        setSearchTerm(opt);
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        const text = e.target.value;
        setSearchTerm(text);
        if (!isOpen) setIsOpen(true);
        // Allow free typing if user types a custom value
        onChange(text);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
        if (inputRef.current) inputRef.current.focus();
        setIsOpen(true);
    };

    const isFieldInvalid = invalid && (!value || value.trim().length === 0);

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* INPUT FIELD */}
            <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5 text-[#1b68b0]" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchTerm : (value || searchTerm)}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsOpen(true);
                        setSearchTerm(value || '');
                    }}
                    placeholder={placeholder}
                    className={`w-full bg-white border rounded-xl pl-9 pr-14 py-2 text-slate-800 font-bold text-xs shadow-xs transition focus:outline-none focus:ring-2 ${
                        isFieldInvalid
                            ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/30 text-rose-900 animate-shake form-invalid-input'
                            : isOpen
                                ? 'border-[#1b68b0] ring-2 ring-[#1b68b0]/15'
                                : 'border-slate-300 hover:border-slate-400 focus:border-[#1b68b0]'
                    }`}
                />

                <div className="absolute right-2.5 flex items-center gap-1 text-slate-400">
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            title="Hapus Pilihan"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(!isOpen);
                            if (!isOpen && inputRef.current) inputRef.current.focus();
                        }}
                        className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1b68b0]' : ''}`} />
                    </button>
                </div>
            </div>

            {/* DROPDOWN POPUP MENU */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 bg-slate-50 text-[10px] text-slate-500 font-bold flex justify-between items-center border-b border-slate-100">
                        <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#1b68b0]" /> Pilih atau Ketik Jenis Kaca:
                        </span>
                        <span className="bg-blue-50 text-[#1b68b0] px-1.5 py-0.5 rounded font-mono font-bold">
                            {filteredOptions.length} Opsi
                        </span>
                    </div>

                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, idx) => {
                            const isSelected = opt === value;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectOption(opt)}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                        isSelected
                                            ? 'bg-blue-50 text-[#1b68b0] font-extrabold border-l-4 border-l-[#1b68b0]'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#1b68b0]'
                                    }`}
                                >
                                    <span>{opt}</span>
                                    {isSelected && <Check className="w-4 h-4 text-[#1b68b0]" />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-3 text-center text-xs text-slate-400 space-y-1">
                            <p>Tidak ada jenis kaca yang cocok dengan "{searchTerm}".</p>
                            <p className="text-[10px] text-slate-500 font-semibold">
                                *Anda tetap dapat menggunakan kata kunci ini sebagai nama jenis kaca baru.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
