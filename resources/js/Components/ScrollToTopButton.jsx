import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton({ targetRef, threshold = 250 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            const containerScroll = targetRef?.current ? targetRef.current.scrollTop : 0;
            const windowScroll = window.scrollY || document.documentElement.scrollTop || 0;

            if (containerScroll > threshold || windowScroll > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        const targetEl = targetRef?.current;
        if (targetEl) {
            targetEl.addEventListener('scroll', checkScroll, { passive: true });
        }
        window.addEventListener('scroll', checkScroll, { passive: true });

        // Initial check
        checkScroll();

        return () => {
            if (targetEl) {
                targetEl.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('scroll', checkScroll);
        };
    }, [targetRef, threshold]);

    const scrollToTop = () => {
        if (targetRef?.current) {
            targetRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            title="Kembali ke atas halaman"
            className={`fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-[#1b68b0] hover:bg-[#15528c] text-white shadow-xl hover:shadow-2xl border border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer group ${
                isVisible
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
            }`}
        >
            <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-1" />
            <span className="sr-only">Kembali ke atas</span>
        </button>
    );
}
