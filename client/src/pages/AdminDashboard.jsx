import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaSignOutAlt, FaUpload, FaclipboardList, FaHamburger } from 'react-icons/fa';
import { menuData } from '../data/menuData'; // Import your local data file

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'

  // Updated Form State with new fields (Category, Description)
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image_url: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Use your Render Backend URL
  const API_URL = 'https://lammet-api.onrender.com/api';

  useEffect(() => {
    fetchData();
    // Set up auto-refresh for orders every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const prodRes = await axios.get(`${API_URL}/products`);
      setProducts(prodRes.data);
      const ordRes = await axios.get(`${API_URL}/orders`);
      setOrders(ordRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin');
  };

  const handleDeleteProduct = async (id) => {
    if(window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        fetchData(); // Refresh list
      } catch (err) {
        alert("Error deleting item");
      }
    }
  };

  // --- 1. HANDLE IMAGE UPLOAD (Converts to Base64) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setForm({ ...form, image_url: reader.result });
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Error reading file!");
      setIsUploading(false);
    };
  };

  // --- 2. ADD NEW PRODUCT (Manual) ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if(!form.name || !form.price || !form.category) {
      return alert("Please fill in Name, Price, and Category.");
    }

    try {
      await axios.post(`${API_URL}/products`, form);
      setForm({ name: '', price: '', category: '', description: '', image_url: '' }); // Clear form
      fetchData(); // Refresh list
      alert("Item added successfully!");
    } catch (err) {
      alert("Error adding item. Make sure the backend supports these fields.");
      console.error(err);
    }
  };

  // --- 3. MAGIC IMPORT FUNCTION (Uploads menuData.js) ---
  const importMenuToDatabase = async () => {
    if (!window.confirm(`This will upload ${menuData.length} items from your file to the database. Continue?`)) return;

    alert("Starting upload... this might take a few seconds.");

    let count = 0;
    for (const item of menuData) {
      try {
        // We map 'image' from file to 'image_url' for database
        await axios.post(`${API_URL}/products`, {
          name: item.name,
          price: item.price,
          category: item.category,
          image_url: item.image,
          description: item.description
        });
        count++;
      } catch (error) {
        console.error("Failed to upload:", item.name);
      }
    }

    alert(`Success! Uploaded ${count} items.`);
    fetchData(); // Refresh list immediately
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Lammet Karim Management</p>
        </div>
        <button onClick={handleLogout} className="btn-logout"><FaSignOutAlt /> Logout</button>
      </div>

      {/* TABS */}
      <div style={{marginBottom:'20px', display:'flex', gap:'10px'}}>
        <button onClick={() => setActiveTab('orders')} style={{background: activeTab === 'orders' ? '#2f3542' : '#ddd', color: activeTab === 'orders' ? 'white' : 'black', width:'auto', padding:'10px 20px', borderRadius: '5px', cursor: 'pointer', border: 'none'}}>
          Incoming Orders ({orders.length})
        </button>
        <button onClick={() => setActiveTab('menu')} style={{background: activeTab === 'menu' ? '#2f3542' : '#ddd', color: activeTab === 'menu' ? 'white' : 'black', width:'auto', padding:'10px 20px', borderRadius: '5px', cursor: 'pointer', border: 'none'}}>
          Menu Management
        </button>
      </div>

      {/* --- TAB 1: ORDERS --- */}
      {activeTab === 'orders' ? (
        <div className="list-section">
          <h3>Recent Orders</h3>
          {orders.length === 0 ? <p>No orders yet.</p> : (
            <div className="product-table-wrapper">
              <table className="product-table">
                <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th></tr></thead>
                <tbody>
                  {orders.map(order => {
                    const items = JSON.parse(order.items || "[]");
                    return (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td><strong>{order.customer_name}</strong><br/>{order.customer_phone}</td>
                        <td>{items.map((i, idx) => <div key={idx} style={{fontSize:'0.9rem'}}>{i.quantity}x {i.name}</div>)}</td>
                        <td style={{color:'#27ae60', fontWeight:'bold'}}>${order.total_amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* --- TAB 2: MENU MANAGEMENT --- */
        <div className="dashboard-content">

          {/* MAGIC IMPORT BUTTON */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '10px', borderLeft: '5px solid #2196f3' }}>
            <h3 style={{marginTop:0}}>🚀 Quick Setup</h3>
            <p>Database empty? Click this to upload your Saj, Crepe, and Cocktail menu instantly.</p>
            <button onClick={importMenuToDatabase} style={{ backgroundColor: '#2196f3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' }}>
              Upload Full Menu to Database
            </button>
          </div>

          <div className="form-section">
            <h3><FaPlus /> Add New Item</h3>
            <form onSubmit={handleAddProduct}>

              {/* Row 1: Name & Price */}
              <div style={{display:'flex', gap:'10px'}}>
                <div className="form-group" style={{flex:1}}>
                  <label>Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Cheese Burger" required />
                </div>
                <div className="form-group" style={{width:'100px'}}>
                  <label>Price ($)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" required />
                </div>
              </div>

              {/* Row 2: Category & Description */}
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}}>
                    <option value="">Select Category...</option>
                    <option value="Saj">Saj</option>
                    <option value="Crepe">Crepe</option>
                    <option value="Cocktails">Cocktails</option>
                    <option value="Hookah">Hookah</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Delicious cheese with ham..." style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
              </div>

              {/* Row 3: Image Upload */}
              <div className="form-group">
                <label>Product Image</label>
                <div style={{border:'2px dashed #ccc', padding:'20px', borderRadius:'10px', textAlign:'center', cursor:'pointer', position:'relative', backgroundColor:'#fafafa'}}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{opacity:0, position:'absolute', top:0, left:0, width:'100%', height:'100%', cursor:'pointer'}}
                  />
                  {form.image_url ? (
                    <img src={form.image_url} alt="Preview" style={{height:'100px', borderRadius:'10px', objectFit:'cover'}} />
                  ) : (
                    <div style={{color:'#999'}}>
                      <FaUpload size={20} />
                      <p>Click to Upload Image</p>
                    </div>
                  )}
                </div>
                {isUploading && <p style={{color:'orange', fontSize:'0.8rem'}}>Processing image...</p>}
              </div>

              <button type="submit" className="btn-add" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Add Product"}
              </button>
            </form>
          </div>

          {/* ITEM LIST */}
          <div className="list-section">
            <h3>Current Menu ({products.length})</h3>
            <div className="product-table-wrapper">
              <table className="product-table">
                <thead><tr><th>Img</th><th>Name</th><th>Category</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.image_url || "https://via.placeholder.com/50"} alt="t" className="table-img" style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'5px'}}/></td>
                      <td>
                        <strong>{p.name}</strong>
                        <div style={{fontSize:'0.8rem', color:'#666'}}>{p.description ? p.description.substring(0, 20) + '...' : ''}</div>
                      </td>
                      <td><span style={{backgroundColor:'#eee', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem'}}>{p.category || 'General'}</span></td>
                      <td>${p.price}</td>
                      <td><button onClick={() => handleDeleteProduct(p.id)} className="btn-delete"><FaTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;