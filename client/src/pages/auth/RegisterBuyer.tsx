import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { ShoppingCart, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const RegisterBuyer: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessType: 'RETAILER',
    gstNumber: '',
    state: 'Tamil Nadu',
    district: 'Chennai',
    location: 'Koyambedu Wholesale Hub, Chennai',
    requiredCrops: 'Tomato, Green Chili, Red Onion, Banana',
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await api.post('/auth/otp/verify', {
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
      await api.post('/auth/register/buyer', {
        name: formData.name,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        businessType: formData.businessType,
        gstNumber: formData.gstNumber || undefined,
        state: formData.state,
        district: formData.district,
        location: formData.location,
        requiredCrops: formData.requiredCrops.split(',').map((s) => s.trim()),
      });

      // Send buyer to login page as requested by required flow
      navigate('/login', {
        state: {
          registered: true,
          role: 'BUYER',
          email: formData.email,
          message: 'Buyer registration completed successfully! Please sign in to access your Buyer Dashboard.',
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Buyer registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md mb-3">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Account Type: Commercial Buyer
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Buyer Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Source directly from verified farmers with 100% Escrow payment protection
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Contact Person
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Suresh Krishnan"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Business Name
              </label>
              <input
                type="text"
                name="companyName"
                required
                placeholder="e.g. FreshFarm Retail Mart"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="procurement@freshmart.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Type</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RETAILER">Supermarket / Retail Chain</option>
                <option value="WHOLESALER">Wholesaler / APMC Trader</option>
                <option value="EXPORTER">Food & Commodity Exporter</option>
                <option value="PROCESSOR">Food Processing Enterprise</option>
                <option value="AGGREGATOR">Institutional Aggregator</option>
              </select>
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
                  placeholder="+91 98411 22334"
                  value={formData.phone}
                  onChange={handleChange}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                />
                {!isPhoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpSending}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
              </div>

              {/* OTP Input Box */}
              {otpSent && !isPhoneVerified && (
                <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full sm:w-48 px-3 py-2 bg-white border border-blue-300 rounded-xl text-center text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={otpVerifying || otp.length !== 6}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
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
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GST Number (Optional)
              </label>
              <input
                type="text"
                name="gstNumber"
                placeholder="33AABCF1234F1Z5"
                value={formData.gstNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Location / Delivery Hub Address
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Crops / Purchase Interest (Comma Separated)
            </label>
            <input
              type="text"
              name="requiredCrops"
              required
              placeholder="e.g. Tomato, Green Chili, Red Onion, Banana"
              value={formData.requiredCrops}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Creating Buyer Account...' : 'Complete Buyer Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-6 mt-6 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
