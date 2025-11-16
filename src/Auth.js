// src/Auth.js
import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./styles.css"; // Ensure styles are available

function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState("tenant"); // default selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (isSignUp) {
        // Sign up logic
        result = await supabase.auth.signUp({ 
            email, 
            password,
            // Include user_metadata to store the role, though RLS should enforce
            options: { data: { user_type: userType } }
        });
      } else {
        // Login logic
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) throw result.error;
      
      // If login is successful, manually check if the session and user exist
      if (result.data.session && result.data.user) {
         // ✅ Store user type locally
        localStorage.setItem("userType", userType);
        onLogin(result.data.session, userType);
      } else if (isSignUp && !result.data.session) {
          // New sign-up but email confirmation is pending
          alert("Account created successfully. Please check your email to confirm your account before logging in.");
      }

    } catch (err) {
      console.error(err);
      // Fallback for clearer error messages
      const message = err.message || "An unknown error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container p-8 max-w-sm mx-auto my-20 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        {isSignUp ? "Create an Account" : "Welcome Back"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        {/* 🔽 Role Selection */}
        <div className="role-select flex justify-center space-x-6 pt-2">
          <label className="flex items-center text-gray-700 font-medium cursor-pointer">
            <input
              type="radio"
              value="tenant"
              checked={userType === "tenant"}
              onChange={(e) => setUserType(e.target.value)}
              className="form-radio text-indigo-600"
            />
            <span className="ml-2">Tenant</span>
          </label>
          <label className="flex items-center text-gray-700 font-medium cursor-pointer">
            <input
              type="radio"
              value="landlord"
              checked={userType === "landlord"}
              onChange={(e) => setUserType(e.target.value)}
              className="form-radio text-indigo-600"
            />
            <span className="ml-2">Landlord</span>
          </label>
        </div>

        {error && <p className="error text-red-500 font-medium text-sm mt-3">{error}</p>}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150"
        >
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button 
          type="button" 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-indigo-600 font-semibold hover:text-indigo-800"
        >
          {isSignUp ? "Login" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}

export default Auth;