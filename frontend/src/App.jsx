import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Sensors } from "./components/Sensors";
import { DataSources } from "./components/DataSources";
import { ApiCapabilities } from "./components/ApiCapabilities";
import { Team } from "./components/Team";
import { Footer } from "./components/Footer";
import Dashboard from "./Dashboard.jsx";

function HomePage() {
  return (
    <div className="size-full">
      <Hero />
      <Features />
      <Sensors />
      <DataSources />
      <ApiCapabilities />
      <Team />
      <Footer />
    </div>
  );
}

export default function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  if (pathname === "/dashboard") {
    return <Dashboard />;
  }

  return <HomePage />;
}
