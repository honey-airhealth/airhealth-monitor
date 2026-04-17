import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Sensors } from "./components/Sensors";
import { DataSources } from "./components/DataSources";
import { ApiCapabilities } from "./components/ApiCapabilities";
import ApiDashboardPage from "./components/ApiDashboardPage.jsx";
import VisualizationPage from "./components/VisualizationPage.jsx";
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
  const hash = typeof window !== "undefined" ? window.location.hash : "";

  if (pathname === "/dashboard") {
    return <Dashboard />;
  }

  if (pathname === "/api" || hash === "#/api") {
    return <ApiDashboardPage />;
  }

  if (pathname === "/statistic" || hash === "#/statistic") {
    return <VisualizationPage variant="statistic" />;
  }

  if (pathname === "/visualization" || hash === "#/visualization") {
    return <VisualizationPage variant="analytic" />;
  }

  return <HomePage />;
}
