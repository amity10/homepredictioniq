import { NavLink } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import Logo from "./Logo";


export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="text-xl font-bold text-white tracking-wide">
          <Logo />
       </NavLink>

        {/* Navigation */}
        <nav className="flex items-center gap-8 text-white font-medium">


          <SignedIn>
            <NavLink to="/predict">Predict</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/analytics">Analytics</NavLink>
            <NavLink to="/recommendations">Reccomendations</NavLink>
            <NavLink to="/about">About</NavLink>


            <UserButton />
          </SignedIn>

          <SignedOut>
            <NavLink to="/sign-in">Login</NavLink>
          </SignedOut>

        </nav>

      </div>
    </header>
  );
}
