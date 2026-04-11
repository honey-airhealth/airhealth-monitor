import React from 'react';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Sensors } from './components/Sensors';
import { DataSources } from './components/DataSources';
import { ApiCapabilities } from './components/ApiCapabilities';
import { Team } from './components/Team';
import { Footer } from './components/Footer';
import ApiDashboardPage from './components/ApiDashboardPage';

function useHashRoute() {
  const getRoute = () => window.location.hash || '#/';
  const [route, setRoute] = React.useState(getRoute);

  React.useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

export default function App() {
  const route = useHashRoute();

  if (route === '#/api') {
    return <ApiDashboardPage />;
  }

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
