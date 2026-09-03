import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "../services/api"; 

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const Login = () => {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "", 
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      console.log("🔄 Attempting:", isSignup ? "Signup" : "Login");
      console.log("📧 Email:", formData.email);

      if (isSignup) {
        response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      } else {
        response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
      }

      console.log("✅ Backend Response:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setToastMessage(isSignup ? "Signup successful!" : "Login successful!");
        setShowToast(true);

        setTimeout(() => {
          const user = response.data.user;
          if (user.role === "admin") navigate("/admin");
          else navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Full error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config?.url,
      });

      const message =
        error.response?.data?.message ||
        (isSignup ? "Signup failed" : "Login failed");
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-950 px-4">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-yellow-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-6">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg transition"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="text-center text-slate-600 dark:text-slate-300 mt-6">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            {isSignup ? "Login here" : "Sign up here"}
          </button>
        </p>
      </motion.div>
    </section>
  );
};

export default Login;
