import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoanNavigation from './pages/LoanNavigation';

export function App() {
  return (
   
      <Router>
      
        <main className="container">
          <Routes>
            <Route path="/" element={<LoanNavigation />} />
          </Routes>
        </main>
      </Router>
  )
}

export default App;