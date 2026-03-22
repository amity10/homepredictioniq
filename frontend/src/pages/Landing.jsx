import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const images = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
];

export default function Home() {

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((i) => (i + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen text-white">

      {/* ⭐ Background Slider */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${images[currentImage]})` }}
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">

        {/* ===== HERO ===== */}
        <section className="min-h-screen flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              AI Powered Property Price Intelligence
            </h1>

            <p className="mt-6 text-lg opacity-90">
              Predict real estate values using machine learning and real Mumbai market data.
            </p>

            <Link to="/predict">
              <button className="mt-8 px-10 py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-gray-200 transition">
                Predict Property Price
              </button>
            </Link>

          </div>
        </section>

        {/* ===== FEATURES GLASS SECTION ===== */}
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">

            {[
              {
                title: "Accurate ML Predictions",
                desc: "Advanced models trained on real transaction data."
              },
              {
                title: "Locality Intelligence",
                desc: "Understand how prices vary across neighborhoods."
              },
              {
                title: "Market Trend Insights",
                desc: "Analyze whether property prices are rising or falling."
              }
            ].map((feature, i) => (

              <div
                key={i}
                className="bg-white/20 backdrop-blur-xl p-8 rounded-3xl shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="opacity-80">
                  {feature.desc}
                </p>
              </div>

            ))}

          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">

            <h2 className="text-4xl font-bold mb-16 text-center">
              How HomePriceAI Works
            </h2>

            <div className="grid md:grid-cols-3 gap-12">

              {[
                {
                  title: "Enter Property Details",
                  desc: "Provide locality, configuration and area."
                },
                {
                  title: "AI Market Analysis",
                  desc: "Model analyzes thousands of real transactions."
                },
                {
                  title: "Instant Price Estimate",
                  desc: "Receive accurate valuation with price range."
                }
              ].map((step, i) => (

                <div
                  key={i}
                  className="bg-white/20 backdrop-blur-xl p-8 rounded-3xl shadow-lg"
                >
                  <h4 className="font-semibold mb-3 text-lg">
                    {step.title}
                  </h4>
                  <p className="opacity-80">
                    {step.desc}
                  </p>
                </div>

              ))}

            </div>

          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-24 text-center">

          <div className="bg-white/20 backdrop-blur-xl p-12 rounded-3xl shadow-lg max-w-4xl mx-auto">

            <h2 className="text-3xl font-bold">
              Ready to Discover Your Property Value?
            </h2>

            <Link to="/predict">
              <button className="mt-8 px-10 py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-gray-200 transition">
                Start AI Prediction
              </button>
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}
