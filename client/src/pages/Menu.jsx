import { useEffect, useState } from 'react';
import axios from 'axios';

function Menu({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://lammet-api.onrender.com/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  return (
    <div>
      {/* 1. HERO SECTION: The big welcome image */}
      <div className="hero">
        <h2>Welcome to Lammet Karim</h2>
        <p>The best snacks, delivered to your door.</p>
      </div>

      <div className="container">
        <h3 className="section-title">Our Tasty Menu</h3>

        {loading ? (
          <p style={{textAlign:'center'}}>Loading snacks...</p>
        ) : (
          <div className="grid">
            {products.map(p => (
              <div key={p.id} className="card">
                <img
                  src={p.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                  alt={p.name}
                />
                <div className="card-content">
                  <h3>{p.name}</h3>
                  <span className="price">${p.price}</span>
                  <button onClick={() => addToCart(p)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;