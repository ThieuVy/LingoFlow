import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

interface RegisterProps {
  onRegisterSuccess: () => void; // Callback mới để chuyển trang
  onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onLoginClick }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: `${firstName} ${lastName}`.trim(),
                    avatar_url: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff&bold=true`
                }
            }
        });
        if (error) throw error;
        onRegisterSuccess(); // Chuyển sang màn hình xác nhận Email
    } catch (error: any) {
        alert(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Right Side - Visual (Đảo ngược vị trí so với Login) */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative overflow-hidden items-center justify-center p-12 order-2">
        <div className="absolute inset-0 bg-[url('[https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop](https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop)')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-900/80 to-purple-900/80"></div>
        
        <div className="relative z-10 text-white max-w-lg text-right">
           <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">Start your journey <br/>to <span className="text-indigo-300">Fluency.</span></h1>
           <p className="text-indigo-100 text-lg leading-relaxed">Create an account to unlock personalized lessons, live speaking practice, and comprehensive progress tracking.</p>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/50 order-1">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Create an account</h2>
            <p className="text-slate-500 mt-2">Get started with LingoFlow for free.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">First Name</label>
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="John" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">Last Name</label>
                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="Doe" />
                </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 mt-4">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account? <button onClick={onLoginClick} className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all ml-1">Log in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;