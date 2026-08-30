import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Sprout, CheckCircle2, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, PhoneCall } from 'lucide-react';

export const RegisterFarmer: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    village: '',
    farmLocation: '',
    landAreaAcre: 3.5,
    soilType: 'Red Loamy',
    irrigationType: 'Drip Irrigation',
    mainCrops: 'Tomato, Green Chili, Red Onion',
  });

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phone OTP Verification States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'landAreaAcre' ? parseFloat(value) || 0 : value,
    }));
  };

  // Request Real Phone OTP
  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number before requesting OTP.');
      return;
    }
    setError(null);
    setOtpSending(true);
    setOtpMessage(null);

    try {
      const res = await api.post('/auth/otp/send', { phone: formData.phone.trim() });
      setOtpSent(true);
      setOtpMessage(res.data.message || 'Verification code sent to your mobile number.');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Phone verification service is not configured.'
      );
    } finally {
      setOtpSending(false);
    }
  };

  // Verify Real Phone OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    setError(null);
    setOtpVerifying(true);

    try {
      const res = await api.post('/auth/otp/verify', {
        phone: formData.phone.trim(),
        otp: otp.trim(),
      });
      setIsPhoneVerified(true);
      setOtpMessage('Mobile number verified successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Incorrect verification code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/register/farmer', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        farmLocation: formData.farmLocation,
        landAreaAcre: formData.landAreaAcre,
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        mainCrops: formData.mainCrops.split(',').map((s) => s.trim()),
      });

      // Automatically log the farmer in
      await login(formData.email, formData.password);
      navigate('/farmer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md mb-3">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Farmer Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Join thousands of farmers getting direct buyer prices and AI intelligence
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {otpMessage && (
          <div className="mb-6 bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{otpMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info & Mobile OTP */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              1. Personal & Contact Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ramesh@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Mobile Phone Field with Real OTP Button */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Mobile Number (OTP Verification)</label>
                  {isPhoneVerified && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Mobile Number Verified
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    name="phone"
                    required
                    disabled={isPhoneVerified}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                  />
                  {!isPhoneVerified && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpSending}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                </div>

                {/* OTP Verification Input Box */}
                {otpSent && !isPhoneVerified && (
                  <div className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full sm:w-48 px-3 py-2 bg-white border border-emerald-300 rounded-xl text-center text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={otpVerifying || otp.length !== 6}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {otpVerifying ? 'Verifying...' : 'Verify OTP Code'}
                    </button>
                  </div>
                )}
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Location & Land Area */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              2. Farm & Agricultural Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  required
                  placeholder="e.g. Coimbatore"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Taluk</label>
                <input
                  type="text"
                  name="village"
                  required
                  placeholder="e.g. Pollachi North"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Land Area (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="landAreaAcre"
                  required
                  value={formData.landAreaAcre}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Red Loamy">Red Loamy</option>
                  <option value="Black Soil">Black Cotton Soil</option>
                  <option value="Alluvial Soil">Alluvial Loam</option>
                  <option value="Clayey Soil">Clayey Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Irrigation Source</label>
                <select
                  name="irrigationType"
                  value={formData.irrigationType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Borewell / Open Well">Borewell / Open Well</option>
                  <option value="Canal Irrigation">Canal Irrigation</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farm Address / Location Reference
              </label>
              <input
                type="text"
                name="farmLocation"
                required
                placeholder="e.g. Survey No. 142/2, Anaimalai Road, Pollachi"
                value={formData.farmLocation}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Main Crops Grown (Comma Separated)
              </label>
              <input
                type="text"
                name="mainCrops"
                required
                placeholder="e.g. Tomato, Green Chili, Red Onion"
                value={formData.mainCrops}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Creating Farmer Account...' : 'Complete Farmer Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-6 mt-6 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-600 hover:underline font-bold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
