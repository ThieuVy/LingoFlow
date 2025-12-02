import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

interface LoginProps {
  onLogin: () => void;
  onRegisterClick: () => void;
  onForgotClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick, onForgotClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Successful login is caught by App.tsx listener
    } catch (error: any) {
        alert(error.message);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Brand & Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50"></div>
        
        <div className="relative z-10 text-white max-w-lg">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/50">
              <span className="font-bold text-2xl tracking-tighter">LF</span>
           </div>
           <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">Master Languages with <span className="text-blue-400">AI Intelligence.</span></h1>
           <p className="text-slate-300 text-lg leading-relaxed">Join thousands of learners achieving fluency faster with LingoFlow's personalized AI tutor, real-time speaking practice, and adaptive curriculum.</p>
           
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">Email</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">Password</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
               <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                  <span className="ml-2 text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Remember me</span>
               </label>
               <button type="button" onClick={onForgotClick} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</button>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account? <button onClick={onRegisterClick} className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all ml-1">Sign up for free</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;