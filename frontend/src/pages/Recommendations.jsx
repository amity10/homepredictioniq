import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Recommendations() {
  const { getToken } = useAuth();
  const { user } = useUser();

  // 1. Consolidated State Declarations (Fix: Hoisting/Scope issues)
  const [loading, setLoading] = useState(true);
  const [lastPrediction, setLastPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [marketCheck, setMarketCheck] = useState("");
  const [regionAvg, setRegionAvg] = useState(0);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const token = await getToken();

        // 1. Get Recommendations & Insights
        const res = await fetch("http://localhost:8000/api/recommendations/", {
          headers: { Authorization: `Bearer ${token}`, "X-Clerk-User-ID": user.id }
        });

        if (res.ok) {
          const data = await res.json();
          // Fix: Safe access with fallback
          setRecommendations(data.alternatives || []);
          setMarketCheck(data.market_check || "Fair Market Price");
          setRegionAvg(data.region_avg_price || 0);
        } else {
          console.error("Failed to fetch recommendations:", res.status);
        }

        // 2. Get Last Prediction for context
        const res2 = await fetch("http://localhost:8000/api/saved_predictions/", {
          headers: { Authorization: `Bearer ${token}`, "X-Clerk-User-ID": user.id }
        });

        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.length > 0) {
            setLastPrediction(data2[0]);
          } else {
            setLastPrediction(null);
          }
        } else {
          console.error("Failed to fetch predictions:", res2.status);
        }

      } catch (err) {
        console.error("Error loading recommendation data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, getToken]);


  /* ---------------- UI HELPERS ---------------- */
  // Safe calculation helpers (only run if data exists)
  const buyPrice = lastPrediction?.predicted_price || 0;

  let tagColor = "text-yellow-300";
  // Fix: Safe optional chaining
  if (marketCheck?.includes("Great Value")) tagColor = "text-green-400";
  else if (marketCheck?.includes("Premium")) tagColor = "text-red-400";

  // Growth Projection (Simple 5% YoY for visualization)
  const growthYears = ["Now", "1 Year", "3 Years", "5 Years"];
  const growthPrices = [
    buyPrice,
    Math.round(buyPrice * 1.05),
    Math.round(buyPrice * 1.15),
    Math.round(buyPrice * 1.27)
  ];

  // Rental Yield Estimate (Approx 2.5% of property value annually)
  const annualRentLakhs = (buyPrice * 0.025);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#fff" } }
    },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: { ticks: { color: "#fff" } }
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="relative min-h-screen px-6 py-12 text-white">

      {/* Background - ALWAYS VISIBLE (Fix: Prevents blank white screen) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c)"
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10">

        {loading ? (
          // Loading State (Centered)
          <div className="min-h-[60vh] flex items-center justify-center">
            <p className="text-xl font-semibold animate-pulse">Loading insights...</p>
          </div>
        ) : !lastPrediction ? (
          // No Data State (Centered)
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <p className="text-2xl font-bold">No prediction history found</p>
            <p className="opacity-80">Predict a price first to unlock investment insights.</p>
            <a href="/predict" className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
              Go to Predict
            </a>
          </div>
        ) : (
          // Main Content
          <>
            <h1 className="text-4xl font-bold mb-10">
              Property Recommendations & Price Insight
            </h1>

            {/* PRICE INSIGHT */}
            <div className="grid md:grid-cols-3 gap-6 mb-14">
              <div className="bg-white/20 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-sm opacity-80">Your Predicted Price</p>
                <p className="text-2xl font-bold">₹ {buyPrice} Lakhs</p>
              </div>

              <div className="bg-white/20 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-sm opacity-80">City Average ({lastPrediction.bhk} BHK)</p>
                <p className="text-2xl font-bold">
                  ₹ {regionAvg} Lakhs
                </p>
                <p className="text-xs opacity-60">Based on historical sales</p>
              </div>

              <div className="bg-white/20 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-sm opacity-80">Market Verdict</p>
                <p className={`text-2xl font-bold ${tagColor}`}>
                  {marketCheck}
                </p>
              </div>
            </div>

            {/* RECOMMENDATIONS */}
            <div className="grid md:grid-cols-3 gap-6 mb-14">
              {recommendations.map((r, i) => (
                <div key={i} className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 transition-transform hover:scale-105">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-500/30 px-2 py-1 rounded text-xs border border-blue-400/30">{r.label}</span>
                  </div>
                  <p className="text-lg font-semibold">{r.desc}</p>
                  <p className="text-2xl font-bold text-green-300 mt-2">
                    ₹ {r.price} Lakhs
                  </p>
                </div>
              ))}
            </div>

            {/* CHARTS */}
            <div className="grid md:grid-cols-2 gap-10">

              {/* Growth */}
              <div className="bg-white/20 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <h2 className="mb-4 font-semibold">
                  Estimated Price Growth (Long-Term)
                </h2>
                <Line
                  data={{
                    labels: growthYears,
                    datasets: [
                      {
                        label: "Estimated Value (Lakhs)",
                        data: growthPrices,
                        borderColor: "#4ade80",
                        tension: 0.4
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              </div>

              {/* Buy vs Rent */}
              <div className="bg-white/20 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <h2 className="mb-4 font-semibold">
                  Buy vs Rent (Annual Comparison)
                </h2>
                <Bar
                  data={{
                    labels: ["Buy Price", "Annual Rent (Est.)"],
                    datasets: [
                      {
                        label: "Amount (Lakhs)",
                        data: [
                          buyPrice,
                          Math.round(annualRentLakhs)
                        ],
                        backgroundColor: ["#60a5fa", "#facc15"]
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
