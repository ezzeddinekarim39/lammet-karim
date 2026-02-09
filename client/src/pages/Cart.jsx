import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowRight, FaMinus, FaPlus } from 'react-icons/fa';

function Cart({ cart, updateQuantity, removeFromCart, clearCart }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  // Calculate Total
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const checkout = async () => {
    if(!name || !phone) return alert("Please fill in your details.");

    try {
        // Send order to backend
        await axios.post('http://localhost:3001/api/orders', {
          customer_name: name,
          customer_phone: phone,
          items: JSON.stringify(cart), // Send items as a text string
          total_amount: total
        });

        alert("Order Placed Successfully!");
        clearCart(); // Empty the cart
        navigate('/');
    } catch (err) {
        console.error(err);
        alert("Failed to place order. Check console for errors.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page" style={{textAlign:'center', padding:'50px'}}>
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate('/')} className="btn-checkout" style={{width:'200px', margin:'20px auto'}}>Go to Menu</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Your Order</h2>
        <span className="cart-count">{cart.reduce((s, i) => s + i.quantity, 0)} Items</span>
      </div>

      <div className="cart-body">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <img src={item.image_url || "https://placehold.co/100"} alt={item.name} />
              <div>
                <div className="item-name">{item.name}</div>
                <div className="item-price">${item.price}</div>
              </div>
            </div>

            {/* Quantity Controls */}
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
              <div style={{display:'flex', alignItems:'center', background:'#f1f2f6', borderRadius:'8px'}}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{width:'30px', padding:'5px', background:'transparent', color:'#333', boxShadow:'none'}}><FaMinus size={10}/></button>
                <span style={{fontWeight:'bold', padding:'0 10px'}}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} style={{width:'30px', padding:'5px', background:'transparent', color:'#333', boxShadow:'none'}}><FaPlus size={10}/></button>
              </div>

              <button onClick={() => removeFromCart(item.id)} style={{background:'#ff7675', width:'40px', padding:'10px', boxShadow:'none'}}>
                <FaTrash color="white"/>
              </button>
            </div>
          </div>
        ))}

        <div className="cart-summary">
          <span className="total-label">Total:</span>
          <span className="total-price">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="checkout-section">
        <h3 className="checkout-title">Delivery Details</h3>
        <div className="form-grid">
          <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <button onClick={checkout} className="btn-checkout">Confirm Order <FaArrowRight /></button>
      </div>
    </div>
  );
}

export default Cart;