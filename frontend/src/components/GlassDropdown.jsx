import { useState, useRef, useEffect } from "react";

export default function GlassDropdown({
    label,
    name,
    value,
    options = [],
    onChange,
    placeholder = "Select..."
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (selectedValue) => {
        // Create a synthetic event to match standard input onChange behavior
        if (onChange) {
            onChange({
                target: {
                    name: name,
                    value: selectedValue
                }
            });
        }
        setIsOpen(false);
    };

    // Find label for currently selected value
    const getSelectedLabel = () => {
        if (value === "" || value === null || value === undefined) return placeholder;
        const selected = options.find(opt =>
            (typeof opt === "object" ? String(opt.value) : String(opt)) === String(value)
        );
        if (!selected) return placeholder;
        return typeof selected === "object" ? selected.label : selected;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && <label className="block text-sm capitalize mb-1 text-white">{label}</label>}

            {/* Main Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left border border-white/30 bg-white/20 backdrop-blur-md p-3 rounded-lg text-white flex justify-between items-center transition-all hover:bg-white/30 focus:ring-2 focus:ring-indigo-400 focus:outline-none ${isOpen ? 'ring-2 ring-indigo-400 bg-white/30' : ''}`}
            >
                <span className="truncate pr-2">{getSelectedLabel()}</span>

                {/* Arrow Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fadeIn">
                    {options.length > 0 ? (
                        options.map((item, index) => {
                            const itemValue = typeof item === "object" ? item.value : item;
                            const itemLabel = typeof item === "object" ? item.label : item;
                            const isSelected = String(itemValue) === String(value);

                            return (
                                <div
                                    key={itemValue || index}
                                    onClick={() => handleSelect(itemValue)}
                                    className={`p-3 cursor-pointer transition-colors text-sm ${isSelected
                                        ? "bg-indigo-600/60 text-white font-semibold"
                                        : "text-white/80 hover:bg-white/20 hover:text-white"
                                        }`}
                                >
                                    {itemLabel}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-3 text-white/50 text-sm italic">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
}
