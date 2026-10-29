import ProductList from "../pages/ProductList";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductDetail from "../pages/ProductDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
}

export default App;