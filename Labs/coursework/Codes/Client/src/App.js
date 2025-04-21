import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MamaPage from './pages/MamaPage';
import MovieListPage from './pages/MovieListPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MamaPage/>} />
        <Route path="/movies" element={<MovieListPage/>}/>
      </Routes>
    </Router>
  );
}
    

export default App;
