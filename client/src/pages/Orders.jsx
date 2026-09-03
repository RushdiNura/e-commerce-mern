import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ordersAPI } from "../services/api";

const Order = () => {
  const { cartItems, total, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "Card",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Full name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else if (value.trim().length < 5) {
          newErrors.address = 'Address must be at least 5 characters';
        } else {
          delete newErrors.address;
        }
        break;
      case 'city':
        if (!value.trim()) {
          newErrors.city = 'City is required';
        } else {
          delete newErrors.city;
        }
        break;
      case 'postalCode':
        if (value && !/^[A-Z0-9\- ]+$/i.test(value)) {
          newErrors.postalCode = 'Invalid postal code format';
        } else {
          delete newErrors.postalCode;
        }
        break;
      case 'country':
        if (!value.trim()) {
          newErrors.country = 'Country is required';
        } else {
          delete newErrors.country;
        }
        break;
      default:
        if (!value.trim() && name !== 'postalCode') {
          newErrors[name] = 'This field is required';
        } else {
          delete newErrors[name];
        }
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validate field if it's been touched before
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Check if form is valid
  const isFormValid = () => {
    const required = ['name', 'email', 'address', 'city', 'country'];
    const hasErrors = Object.keys(errors).length > 0;
    const allRequiredFilled = required.every(field => formData[field].trim() !== '');
    
    return !hasErrors && allRequiredFilled && cartItems.length > 0;
  };

  // Auto-save form data to localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem('checkoutFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'paymentMethod') allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    if (!isFormValid()) {
      alert("Please fix the form errors before submitting.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      navigate("/products");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          name: item.product?.name || item.name,
          price: item.product?.new_price || item.product?.price || item.price || 0,
          quantity: item.quantity || 1,
          image: item.product?.image?.[0]?.url || item.product?.image?.url || item.product?.image || item.image?.[0]?.url || item.image?.url || item.image
        })),
        total: total,
        orderDate: new Date().toISOString(),
        status: "pending"
      };

      console.log("Submitting order:", orderData);

      const response = await ordersAPI.create(orderData);
      
      if (response.status === 200 || response.status === 201) {
        await clearCart();
        localStorage.removeItem('checkoutFormData');
        
        console.log("Order created successfully:", response.data);
        
        // ✅ FIXED: Redirect to correct route
        navigate("/my-orders", { 
          state: { 
            orderId: response.data._id || response.data.id,
            orderNumber: response.data.orderNumber,
            success: true,
            orderDate: new Date().toISOString()
          }
        });
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
    } catch (error) {
      console.error("Order submission failed:", error);
      
      let errorMessage = "Network error. Please check your connection and try again.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 
                      error.response.data?.error ||
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response received
        errorMessage = "No response from server. Please try again.";
      } else {
        // Something else happened
        errorMessage = error.message || "An unexpected error occurred.";
      }
      
      alert(`❌ Order Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Input field configuration
  const inputFields = [
    { field: "name", type: "text", label: "Full Name *", placeholder: "Enter your full name" },
    { field: "email", type: "email", label: "Email Address *", placeholder: "your.email@example.com" },
    { field: "address", type: "text", label: "Street Address *", placeholder: "123 Main Street" },
    { field: "city", type: "text", label: "City *", placeholder: "New York" },
    { field: "postalCode", type: "text", label: "Postal Code", placeholder: "10001" },
    { field: "country", type: "text", label: "Country *", placeholder: "United States" },
  ];

  const paymentMethods = [
    { value: "Card", label: "💳 Credit/Debit Card" },
    { value: "PayPal", label: "🔗 PayPal" },
    { value: "Cash", label: "💵 Cash on Delivery" },
    { value: "BankTransfer", label: "🏦 Bank Transfer" },
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <motion.h1
        className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Checkout
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Shipping Information Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-md"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-xl font-semibold text-indigo-500 mb-6">
            Shipping Information
          </h2>

          <div className="space-y-4">
            {inputFields.map(({ field, type, label, placeholder }) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-slate-700 dark:text-slate-300 mb-2 font-medium"
                >
                  {label}
                </label>
                <input
                  type={type}
                  name={field}
                  id={field}
                  value={formData[field]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                  className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors[field] && touched[field]
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                  required={label.includes("*")}
                />
                {errors[field] && touched[field] && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <span>⚠</span>
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}

            {/* Payment Method */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 font-medium">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Place Order - $${(total || 0).toFixed(2)}`
            )}
          </button>

          {/* Form Validation Summary */}
          {!isFormValid() && Object.keys(touched).length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2">
                <span>💡</span>
                Please fix the errors above before placing your order
              </p>
            </div>
          )}
        </motion.form>

        {/* Order Summary */}
        <motion.div
          className="bg-slate-900 text-slate-200 rounded-xl p-8 shadow-lg sticky top-8"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-xl font-semibold text-indigo-400 mb-6">
            Order Summary
          </h2>

          {/* Cart Items */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Your cart is empty</p>
                <button
                  onClick={() => navigate("/products")}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 underline"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const price =
                  item.product?.new_price ||
                  item.product?.price ||
                  item.price ||
                  0;
                const subtotal = price * (item.quantity || 1);

                return (
                  <div
                    key={item._id || item.id}
                    className="flex items-center justify-between border-b border-slate-700 pb-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.product?.image?.[0]?.url ||
                          item.product?.image?.url ||
                          item.product?.image ||
                          item.image?.[0]?.url ||
                          item.image?.url ||
                          item.image ||
                          "https://via.placeholder.com/100?text=No+Image"
                        }
                        alt={item.product?.name || item.name || "Product"}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-600"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />
                      <div>
                        <span className="text-sm text-slate-300 block font-medium">
                          {item.product?.name || item.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          ${parseFloat(price).toFixed(2)} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-200">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Order Total */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-700 mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>${(total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span className="text-green-400">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-slate-600">
                <span>Total</span>
                <span className="text-indigo-400">${(total || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Security Notice */}
      <motion.div 
        className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>🔒 Your information is secure and encrypted</p>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
    </section>
  );
};

export default Order;