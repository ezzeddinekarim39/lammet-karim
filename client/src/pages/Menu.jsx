import { useState, useEffect } from 'react';
import axios from 'axios';

function Menu({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 1. DEFINE YOUR CATEGORIES HERE (Exact spelling is important!)
  const categories = ["All", "Saj", "Crepe", "Cocktails", "Hookah"];

  // Fetch from Database (Live Data)
  useEffect(() => {
    // CHANGE THIS URL TO YOUR RENDER URL WHEN DEPLOYING
    axios.get('https://lammet-api.onrender.com/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  // Filter logic
  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(item => item.category === selectedCategory);

  return (
    <div className="menu-page">
      <div className="hero" style={{backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', padding: '60px 20px', textAlign: 'center', color: 'white'}}>
        <div style={{backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '10px', display: 'inline-block'}}>
          <h2 style={{fontSize: '2.5rem', margin: '0'}}>Menu Lammet Karim</h2>
          <p style={{fontSize: '1.2rem'}}>Authentic Taste, Delivered to Your Door.</p>
        </div>
      </div>

      <div className="container" style={{padding: '20px'}}>

        {/* 2. CATEGORY BUTTONS (Fixed List) */}
        <div className="categories" style={{display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '30px'}}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                // Active button is RED, others are GREY
                backgroundColor: selectedCategory === cat ? '#d32f2f' : '#eee',
                color: selectedCategory === cat ? 'white' : '#333',
                transition: '0.3s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && <p style={{textAlign:'center'}}>Loading delicious food...</p>}

        {/* Grid */}
        <div className="grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px'}}>
          {filteredProducts.length === 0 && !loading ? (
            <p style={{textAlign:'center', gridColumn:'1/-1', color:'#888'}}>No items found in this category yet.</p>
          ) : (
            filteredProducts.map(p => (
              <div key={p.id} className="card" style={{border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
                <div style={{height: '200px', overflow: 'hidden'}}>
                  <img src={p.image_url || "https://via.placeholder.com/300"} alt={p.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
                <div className="card-content" style={{padding: '15px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <h3 style={{margin: '0', fontSize: '1.2rem'}}>{p.name}</h3>
                    <span className="price" style={{fontWeight: 'bold', color: '#2e7d32'}}>${p.price}</span>
                  </div>
                  {/* Shows description if available */}
                  <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '15px', height:'40px', overflow:'hidden'}}>
                     {p.description || "Fresh and tasty."}
                  </p>
                  <button onClick={() => addToCart(p)} style={{ width: '100%', padding: '10px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Menu;