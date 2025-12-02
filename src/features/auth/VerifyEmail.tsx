import React from 'react';

interface VerifyEmailProps {
  onBackToLogin: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ onBackToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center border border-slate-100 animate-fadeIn">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify your email</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          We've sent a verification link to your email address.<br/>
          Please check your inbox (and spam folder) to activate your account.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => window.open('[https://gmail.com](https://gmail.com)', '_blank')}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center"
          >
            Open Email App
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </button>
          
          <button 
            onClick={onBackToLogin}
            className="w-full py-3.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;