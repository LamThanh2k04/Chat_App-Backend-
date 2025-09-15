import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";

import AuthImagePattern from "../components/AuthImagePattern";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return toast.error("First name is required");
    if (!formData.lastName.trim()) return toast.error("Last name is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Email is invalid");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = validateForm();
    if (success) {
      try {
        await axios.post("/api/auth/register", formData);
        toast.success("Registration successful!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        navigate("/login");
      } catch (error) {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

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
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Join us and explore more</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div className="form-control">
              <label className="label" htmlFor="firstName">
                <span className="label-text font-medium">First Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  className="input input-bordered w-full pl-10 focus:outline-none"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="form-control">
              <label className="label" htmlFor="lastName">
                <span className="label-text font-medium">Last Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  className="input input-bordered w-full pl-10 focus:outline-none"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

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

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label" htmlFor="confirmPassword">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="input input-bordered w-full pl-10 focus:outline-none"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full">
             {isLoading ? "Loading..." : "Create Account"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
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
  );
};

export default RegisterPage;
