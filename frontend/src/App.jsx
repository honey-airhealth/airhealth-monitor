import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Sensors } from './components/Sensors';
import { DataSources } from './components/DataSources';
import { ApiCapabilities } from './components/ApiCapabilities';
import { Team } from './components/Team';
import { Footer } from './components/Footer';

export default function App() {
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