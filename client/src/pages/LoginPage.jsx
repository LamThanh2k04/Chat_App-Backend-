import axios from 'axios';
import React, { useState } from 'react'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import useStore from '../store/useStore';
const LoginPage = () => {
  const {checkAuth} = useStore()
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const validateForm = () => {
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Email is invalid");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = validateForm();
    if (success) {
      try {
        const res = await axios.post("/api/auth/login", formData);
        localStorage.setItem("token", res.data.token);
        await checkAuth()
        toast.success("Login successful!");
        setFormData({
          email: "",
          password: "",
        });
        navigate("/");
      } catch (error) {
        toast.error("Login failed. Please try again.");
      }
    }
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side (form) */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign up your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="input input-bordered w-full pl-10 focus:outline-none"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="input input-bordered w-full pl-10 focus:outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              {isLoading ? "Loading..." : "Sign in"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="link link-primary">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side image */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  )
}

export default LoginPage