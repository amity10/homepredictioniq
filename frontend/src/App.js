import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from "@clerk/clerk-react";

import MainLayout from "./components/Layout";
import Landing from "./pages/Landing";
import Predict from "./pages/Predict";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Recommendations from "./pages/Recommendations";
import About from "./pages/About"; // ⭐ About Project page

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ FIX: Added Clerk routes */}
        <Route path="/sign-in" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up" element={<SignUp routing="path" path="/sign-up" />} />

        {/* ===== LAYOUT WITH NAVBAR (ALL PAGES) ===== */}
        <Route path="/" element={<MainLayout />}>

          {/* ---------- PUBLIC ---------- */}
          <Route index element={<Landing />} />

          {/* ---------- PREDICT ---------- */}
          <Route
            path="predict"
            element={
              <>
                <SignedIn>
                  <Predict />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* ---------- DASHBOARD ---------- */}
          <Route
            path="dashboard"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* ---------- ANALYTICS ---------- */}
          <Route
            path="analytics"
            element={
              <>
                <SignedIn>
                  <Analytics />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* ---------- RECOMMENDATIONS + INVESTMENT ---------- */}
          <Route
            path="recommendations"
            element={
              <>
                <SignedIn>
                  <Recommendations />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* ---------- ABOUT PROJECT ---------- */}
          <Route path="about" element={<About />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;