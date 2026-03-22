import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
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
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Insights() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [featureData, setFeatureData] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true); // Added Loading State

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const token = await getToken();

        // Parallel Fetch for efficiency
        const [resFeatures, resMarket] = await Promise.all([
          fetch("https://homepredictioniq.onrender.com/api/analytics/features/", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("https://homepredictioniq.onrender.com/api/analytics/market_status/", {
            headers: { Authorization: `Bearer ${token}`, "X-Clerk-User-ID": user.id }
          })
        ]);

        // 1. Feature Importance
        if (resFeatures.ok) {
          setFeatureData(await resFeatures.json());
        }

        // 2. Market Status
        if (resMarket.ok) {
          setMarketData(await resMarket.json());
        }

      } catch (e) {
        console.error("Error loading analytics:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, getToken]);


  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: "#fff" } } },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: { ticks: { color: "#fff" } }
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="relative min-h-screen px-6 py-12 text-white">

      {/* Background - ALWAYS VISIBLE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c)"
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10">

        <h1 className="text-4xl font-bold mb-4">
          Market Intelligence
        </h1>
        <p className="opacity-80 mb-10">
          AI-Driven Analysis of Price Drivers & Market Position
        </p>

        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <p className="text-xl font-semibold animate-pulse">Loading Market Intelligence...</p>
          </div>
        ) : (
          <>
            {/* 1️⃣ Feature Importance */}
            <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl mb-12">
              <h2 className="mb-4 font-semibold">
                What Drives Home Prices? (AI Model Weights)
              </h2>
              <p className="text-sm opacity-70 mb-4">This chart shows which features (Area, Location, Status) have the biggest impact on price, extracted directly from our ML model.</p>
              <Bar
                data={{
                  labels: featureData.map(f => f.feature.toUpperCase()),
                  datasets: [{
                    label: "Feature Impact Score",
                    data: featureData.map(f => f.score),
                    backgroundColor: "#4ade80",
                    borderRadius: 4
                  }]
                }}
                options={chartOptions}
              />
            </div>

            {/* 2️⃣ Market Comparison */}
            {marketData ? (
              <div className="grid md:grid-cols-2 gap-10 mb-12">

                <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl">
                  <h2 className="mb-4 font-semibold">
                    Price vs Market Average
                  </h2>
                  <Bar
                    data={{
                      labels: ["Your Price", "Region Avg", "City Avg"],
                      datasets: [{
                        label: "Price (Lakhs)",
                        data: [
                          marketData.your_price,
                          marketData.region_avg,
                          marketData.city_avg
                        ],
                        backgroundColor: ["#facc15", "#60a5fa", "#9ca3af"]
                      }]
                    }}
                    options={chartOptions}
                  />
                </div>

                <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl flex flex-col justify-center">
                  <h2 className="text-xl font-semibold mb-2">Analysis for {marketData.region_label}</h2>

                  <div className="space-y-4">
                    <div className="bg-black/30 p-4 rounded-lg">
                      <p className="text-sm text-gray-300">Region Average</p>
                      <p className="text-2xl font-bold">₹ {marketData.region_avg} Lakhs</p>
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg">
                      <p className="text-sm text-gray-300">City-Wide Average</p>
                      <p className="text-2xl font-bold">₹ {marketData.city_avg} Lakhs</p>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <p>
                        Your property is
                        <span className="font-bold text-yellow-300"> {marketData.your_price > marketData.region_avg ? "ABOVE" : "BELOW"} </span>
                        the average price in {marketData.region_label}.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-10 text-center opacity-50 bg-white/10 rounded-xl">
                <p className="text-xl mb-2">No Market Data Available</p>
                <p className="text-sm">Make a prediction first to see how it compares to the market.</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
