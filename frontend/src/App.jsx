import { Navigate, Route, Routes } from 'react-router';

import HomePage from './pages/HomePage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/analysis" element={<AnalysisPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;