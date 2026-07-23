import { Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { SoloGame } from './pages/SoloGame';
import { Glossary } from './pages/Glossary';
import { HostRoom } from './pages/multiplayer/HostRoom';
import { JoinRoom } from './pages/multiplayer/JoinRoom';
import { Lobby } from './pages/multiplayer/Lobby';
import { RoomGame } from './pages/multiplayer/RoomGame';
import { Caller } from './pages/multiplayer/Caller';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/play" element={<SoloGame />} />
      <Route path="/glossary" element={<Glossary />} />
      <Route path="/host" element={<HostRoom />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/join/:code" element={<JoinRoom />} />
      <Route path="/room/:code/lobby" element={<Lobby />} />
      <Route path="/room/:code/play" element={<RoomGame />} />
      <Route path="/room/:code/caller" element={<Caller />} />
    </Routes>
  );
}

export default App;
