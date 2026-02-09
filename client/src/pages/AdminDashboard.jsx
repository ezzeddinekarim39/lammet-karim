import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaSignOutAlt, FaUpload } from 'react-icons/fa';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [form, setForm] = useState({ name: '', price: '', image_url: '' });
  const [isUploading, setIsUploading] = useState(false); // Loading state for image
  const navigate = useNavigate();

  // Use the Render URL if hosting, or localhost if testing
  // CHANGE THIS to your actual Render URL when you deploy!
  const API_URL = 'http://localhost:3001/api';
  // const API_URL = 'https://lammet-api.onrender.com/api';

  useEffect(() => {
    fetchData();
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
    if(window.confirm("Delete this item?")) {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchData();
    }
  };

  // --- NEW: Handle Image File Selection ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file); // Converts file to Base64 string
    reader.onloadend = () => {
      setForm({ ...form, image_url: reader.result }); // Save the string
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Error reading file!");
      setIsUploading(false);
    };
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if(!form.name || !form.price || !form.image_url) return alert("Please fill all details and upload an image");

    await axios.post(`${API_URL}/products`, form);
    setForm({ name: '', price: '', image_url: '' });
    // Reset file input manually if needed, or just refresh list
    fetchData();
    alert("Product Added Successfully!");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Lammet Karim Management</p>
        </div>
        <button onClick={handleLogout} className="btn-logout"><FaSignOutAlt /> Logout</button>
      </div>

      <div style={{marginBottom:'20px', display:'flex', gap:'10px'}}>
        <button onClick={() => setActiveTab('orders')} style={{background: activeTab === 'orders' ? '#2f3542' : '#ddd', color: activeTab === 'orders' ? 'white' : 'black', width:'auto', padding:'10px 20px'}}>
          Incoming Orders
        </button>
        <button onClick={() => setActiveTab('menu')} style={{background: activeTab === 'menu' ? '#2f3542' : '#ddd', color: activeTab === 'menu' ? 'white' : 'black', width:'auto', padding:'10px 20px'}}>
          Menu Management
        </button>
      </div>

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
                        <td>{items.map((i, idx) => <div key={idx}>{i.quantity}x {i.name}</div>)}</td>
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
        <div className="dashboard-content">
          <div className="form-section">
            <h3><FaPlus /> Add New Item</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Cheese Burger" />
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="e.g. 5.99" />
              </div>

              {/* --- NEW FILE UPLOAD INPUT --- */}
              <div className="form-group">
                <label>Product Image</label>
                <div style={{border:'2px dashed #ccc', padding:'20px', borderRadius:'10px', textAlign:'center', cursor:'pointer', position:'relative'}}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{opacity:0, position:'absolute', top:0, left:0, width:'100%', height:'100%', cursor:'pointer'}}
                  />
                  {form.image_url ? (
                    <img src={form.image_url} alt="Preview" style={{height:'100px', borderRadius:'10px'}} />
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

          <div className="list-section">
            <h3>Current Menu</h3>
            <div className="product-table-wrapper">
              <table className="product-table">
                <thead><tr><th>Img</th><th>Name</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.image_url} alt="t" className="table-img"/></td>
                      <td>{p.name}</td>
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