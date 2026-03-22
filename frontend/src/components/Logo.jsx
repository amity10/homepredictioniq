export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-xl tracking-wide">

      {/* Roof Icon */}
      <div className="relative w-6 h-6">
        <div className="absolute w-full h-full border-t-2 border-l-2 border-white rotate-45 top-1 left-0"></div>
      </div>

      {/* Text Logo */}
      <span className="text-white">
        HomePrice<span className="text-indigo-400">IQ</span>
      </span>

    </div>
  );
}
