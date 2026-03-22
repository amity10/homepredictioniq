export default function Footer() {
  return (
    <footer className="relative z-20">
      <div className="bg-black/60 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-center text-white text-sm">

          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold">HomePriceIQ</span>.  
            All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
