import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaHome, FaShoppingCart, FaUserLock } from 'react-icons/fa'; // Import Icons
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
      {/* 1. TOP NAVBAR (Desktop: Full | Mobile: Logo Only) */}
      {!isAdminPage && (
        <nav className="navbar">
          <h1><Link to="/" style={{textDecoration:'none', color:'inherit'}}>Lammet Karim</Link></h1>

          {/* These links only show on Desktop now via CSS */}
          <div className="nav-links desktop-only">
            <Link to="/">Menu</Link>
            <Link to="/cart">Cart ({cartCount})</Link>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className="container">{children}</div>

      {showFooter && <Footer />}

      {/* 2. BOTTOM NAVIGATION BAR (Mobile/Tablet Only) */}
      {!isAdminPage && (
        <div className="bottom-nav mobile-only">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <FaHome size={24} />
            <span>Menu</span>
          </Link>

          <Link to="/cart" className={`nav-item ${location.pathname === '/cart' ? 'active' : ''}`}>
            <div className="icon-wrapper">
              <FaShoppingCart size={24} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </Link>

          <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
            <FaUserLock size={24} />
            <span>Admin</span>
          </Link>
        </div>
      )}
    </>
  );
}

function App() {
  const [cart, setCart] = useState([]);

  // 1. Add to Cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    // Removed alert for smoother mobile experience
  };

  // 2. Update Quantity
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

  // 4. Clear Cart
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