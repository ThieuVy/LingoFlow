import React, { useState } from 'react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic gửi mail thực tế sẽ gọi API Supabase ở đây
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/20 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-200/20 blur-[120px]"></div>

      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10">
        {!submitted ? (
          <>
            <div className="mb-8">
                <button onClick={onBackToLogin} className="flex items-center text-slate-400 hover:text-slate-600 mb-6 font-bold text-sm transition-colors group">
                    <div className="p-1 rounded-full group-hover:bg-slate-100 mr-1 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </div>
                    Back to Login
                </button>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 16.536L14 19l-3 3-1.732-2.268L6 16l-1-1 2.268-1.732 2.536 2.536L13.029 12.529A6 6 0 0115 7z" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Forgot Password?</h2>
                <p className="text-slate-500 mt-2 leading-relaxed">No worries! Enter your email and we'll send you reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">Email Address</label>
                <input type="email" required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" placeholder="Enter your email" />
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] transition-all">
                Reset Password
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Email sent!</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">Check your email for instructions to reset your password.</p>
            <button onClick={onBackToLogin} className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;