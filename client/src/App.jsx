import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './Footer';
import './App.css';

function Layout({ children, cartCount }) {
  const location = useLocation();
  const showFooter = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  return (
    <>
      {!isAdminPage && (
        <nav className="navbar">
          <h1><Link to="/" style={{textDecoration:'none', color:'inherit'}}>Lammet Karim</Link></h1>
          <div className="nav-links">
            <Link to="/">Menu</Link>
            <Link to="/cart">Cart ({cartCount})</Link>
          </div>
        </nav>
      )}
      <div className="container">{children}</div>
      {showFooter && <Footer />}
    </>
  );
}

function App() {
  const [cart, setCart] = useState([]);

  // 1. Add to Cart (Handles duplicates)
  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        // If item exists, just increase quantity
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // New item, start at quantity 1
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert(`${product.name} added!`);
  };

  // 2. Update Quantity (+ or -)
  const updateQuantity = (id, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // 3. Remove Item
  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // 4. Clear Cart after successful order
  const clearCart = () => setCart([]);

  return (
    <BrowserRouter>
      <Layout cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}>
        <Routes>
          <Route path="/" element={<Menu addToCart={addToCart} />} />
          <Route path="/cart" element={
            <Cart
              cart={cart}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
            />
          } />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;