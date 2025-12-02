import React, { useState } from 'react';
import { supabase, updateUserProfile } from '../../services/supabase';
import { UserProfile } from '../../types/types';

interface EditProfileProps {
  user: UserProfile;
  onCancel: () => void;
  onSaveSuccess: (updatedUser: UserProfile) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onCancel, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    nativeLanguage: user.nativeLanguage,
    targetLanguage: user.targetLanguage,
    avatar: user.avatar
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
        // Cập nhật Database
        const error = await updateUserProfile(currentUser.id, {
            name: formData.name,
            nativeLanguage: formData.nativeLanguage,
            targetLanguage: formData.targetLanguage,
            avatar: formData.avatar
        });

        if (!error) {
            // Cập nhật User Metadata để sync ngay lập tức ở App.tsx
            await supabase.auth.updateUser({
                data: { 
                    full_name: formData.name,
                    avatar_url: formData.avatar
                }
            });
            
            // Callback cập nhật UI
            onSaveSuccess({
                ...user,
                ...formData
            });
        } else {
            alert("Failed to update profile.");
        }
    }
    setSaving(false);
  };

  return (
    <div className="p-8 sm:p-12 max-w-4xl mx-auto h-full flex flex-col justify-center animate-slideUp">
      <div className="bg-white rounded-[30px] shadow-2xl shadow-[#4318FF]/10 p-10 border border-slate-100">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
            <div>
                <h2 className="text-3xl font-bold text-[#1B2559]">Edit Profile</h2>
                <p className="text-[#A3AED0] mt-1">Update your personal information and learning preferences.</p>
            </div>
            <button onClick={onCancel} className="p-3 hover:bg-slate-50 rounded-full transition-colors text-[#A3AED0] hover:text-[#1B2559]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Avatar Section */}
            <div className="col-span-1 flex flex-col items-center">
                <div className="relative group cursor-pointer">
                    <img 
                        src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`} 
                        alt="Avatar" 
                        className="w-40 h-40 rounded-full object-cover border-4 border-[#F4F7FE] shadow-lg group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Change</span>
                    </div>
                </div>
                <p className="text-xs text-[#A3AED0] mt-4 text-center">
                    Allowed *.jpeg, *.jpg, *.png, *.gif<br/> max size of 3 MB
                </p>
                <div className="mt-4 w-full">
                    <label className="block text-xs font-bold text-[#1B2559] uppercase mb-2">Avatar URL</label>
                    <input 
                        type="text" 
                        value={formData.avatar}
                        onChange={e => setFormData({...formData, avatar: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-[#F4F7FE] border-none text-[#1B2559] focus:ring-2 focus:ring-[#4318FF] transition-all text-sm truncate"
                        placeholder="https://..."
                    />
                </div>
            </div>

            {/* Form Fields */}
            <div className="col-span-2 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-[#1B2559] mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4 rounded-xl bg-white border border-[#E9EDF7] text-[#1B2559] focus:border-[#4318FF] focus:ring-4 focus:ring-[#4318FF]/10 outline-none transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[#1B2559] mb-2">Native Language</label>
                        <div className="relative">
                            <select 
                                value={formData.nativeLanguage}
                                onChange={e => setFormData({...formData, nativeLanguage: e.target.value})}
                                className="w-full px-6 py-4 rounded-xl bg-[#F4F7FE] border-none text-[#1B2559] font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-[#4318FF]"
                            >
                                <option>Vietnamese</option>
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>Japanese</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#4318FF]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#1B2559] mb-2">Target Language</label>
                        <div className="relative">
                            <select 
                                value={formData.targetLanguage}
                                onChange={e => setFormData({...formData, targetLanguage: e.target.value})}
                                className="w-full px-6 py-4 rounded-xl bg-[#F4F7FE] border-none text-[#1B2559] font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-[#4318FF]"
                            >
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>Chinese</option>
                                <option>German</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#4318FF]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex gap-4">
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="flex-1 py-4 bg-[#4318FF] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-[#3311CC] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Saving Changes...
                            </>
                        ) : 'Save Changes'}
                    </button>
                    <button onClick={onCancel} className="px-8 py-4 bg-white border border-[#E9EDF7] text-[#1B2559] font-bold rounded-xl hover:bg-[#F4F7FE] transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;