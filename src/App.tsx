import { Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { SoloGame } from './pages/SoloGame';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/play" element={<SoloGame />} />
    </Routes>
  );
}

export default App;
