import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GlassCard } from '../ui/GlassCard';
import { NeonButton } from '../ui/NeonButton';
import { InputField, SelectField } from '../ui/InputField';
import { FileUploadZone } from '../ui/FileUploadZone';
import { Avatar } from '../ui/Avatar';
import { GAMES } from '../../utils/games';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Gamepad2, Camera, Globe, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Personal Info', 'Game Profile', 'Photo & Socials', 'Review'];

export const FirstLoginSetup = ({ onComplete }) => {
  const { user, userDoc } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    displayName: userDoc?.displayName || '',
    ign: '',
    game: userDoc?.game || '',
    phone: '',
    bio: '',
    photoURL: '',
    photoFile: null,
    socialLinks: {
      instagram: '',
      twitter: '',
      youtube: '',
      discord: '',
    },
  });

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateSocial = (platform, value) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const handlePhotoSelect = (file) => {
    updateField('photoFile', file);
    updateField('photoURL', URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let photoURL = profile.photoURL || '';

      // Skip Firebase Storage upload for now — use the blob URL or empty
      // Photo upload can be done later in the Profile page
      if (profile.photoFile) {
        // Try Firebase Storage upload, but don't block on it
        try {
          const { uploadFile, getStoragePath } = await import('../../firebase/storage');
          const path = getStoragePath('avatar', profile.photoFile.name);
          photoURL = await Promise.race([
            uploadFile(profile.photoFile, path),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout')), 10000)),
          ]);
        } catch (uploadErr) {
          console.warn('[Zentrix] Photo upload skipped:', uploadErr.message);
          photoURL = ''; // Will use fallback avatar
        }
      }

      // Direct Firestore update with timeout protection
      const userRef = doc(db, 'users', user.uid);
      await Promise.race([
        updateDoc(userRef, {
          displayName: profile.displayName,
          ign: profile.ign,
          game: profile.game,
          phone: profile.phone,
          bio: profile.bio,
          photoURL,
          socialLinks: profile.socialLinks,
          profileComplete: true,
          profileCompletedAt: Date.now(),
          updatedAt: Date.now(),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 8000)),
      ]);

      toast.success('Profile setup complete! Welcome to Zentrix.');
      onComplete?.();
    } catch (err) {
      console.error('[Zentrix] Profile setup failed:', err);

      // If it was a timeout or permission error, still try to proceed
      if (err.message === 'Firestore timeout' || err.code === 'permission-denied') {
        toast.error('Save timed out. Proceeding anyway — you can update your profile later.');
        // Navigate anyway so user isn't stuck
        setTimeout(() => onComplete?.(), 1000);
      } else {
        toast.error('Failed to save profile: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return profile.displayName.trim().length >= 2;
      case 1: return profile.ign.trim().length >= 2 && profile.game;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  // Allow skipping the entire setup for system accounts
  const handleSkip = () => {
    toast('Skipping setup — you can complete your profile later.');
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-space flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <GlassCard elevated className="w-full max-w-lg z-10 p-8 border border-white/10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black font-display tracking-widest text-white uppercase">
            Complete <span className="text-cyan-400">Setup</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">
            First Login — Profile Configuration Required
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                i < step ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400' :
                i === step ? 'bg-cyan-400 border-cyan-400 text-black' :
                'bg-white/5 border-white/10 text-slate-600'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-cyan-400/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[200px]">
          {step === 0 && (
            <div className="space-y-4 animate-fade-up">
              <InputField
                label="Full Name"
                value={profile.displayName}
                onChange={(e) => updateField('displayName', e.target.value)}
                placeholder="Your full name"
                icon={<User size={12} />}
                required
              />
              <InputField
                label="Phone (Optional)"
                type="tel"
                value={profile.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-up">
              <InputField
                label="In-Game Name (IGN)"
                value={profile.ign}
                onChange={(e) => updateField('ign', e.target.value)}
                placeholder="Your gaming alias"
                icon={<Gamepad2 size={12} />}
                required
              />
              <SelectField
                label="Primary Game"
                value={profile.game}
                onChange={(e) => updateField('game', e.target.value)}
                options={GAMES.map(g => ({ value: g.name, label: g.name }))}
                required
              />
              <InputField
                label="Short Bio"
                value={profile.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="IGL / Fragger / Support..."
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-4 mb-4">
                <Avatar src={profile.photoURL} name={profile.displayName} size="xl" />
                <div className="flex-1">
                  <FileUploadZone
                    label="Profile Photo"
                    hint="Upload your photo"
                    onFileSelect={handlePhotoSelect}
                    file={profile.photoFile}
                    preview={profile.photoURL}
                    onClear={() => { updateField('photoFile', null); updateField('photoURL', ''); }}
                  />
                </div>
              </div>
              <InputField
                label="Instagram"
                value={profile.socialLinks.instagram}
                onChange={(e) => updateSocial('instagram', e.target.value)}
                placeholder="@username"
                icon={<Globe size={12} />}
              />
              <InputField
                label="Discord"
                value={profile.socialLinks.discord}
                onChange={(e) => updateSocial('discord', e.target.value)}
                placeholder="username#1234"
              />
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-up">
              <div className="glass-card rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-4">
                  <Avatar src={profile.photoURL} name={profile.displayName} size="lg" />
                  <div>
                    <p className="text-lg font-bold text-white">{profile.displayName}</p>
                    <p className="text-xs text-cyan-400 font-display">{profile.ign}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Game</p>
                    <p className="text-sm text-white font-bold">{profile.game || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Role</p>
                    <p className="text-sm text-white font-bold">{profile.bio || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <NeonButton variant="secondary" onClick={() => setStep(step - 1)}>
                Back
              </NeonButton>
            )}
            <button
              onClick={handleSkip}
              className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors px-3 py-2"
            >
              Skip Setup
            </button>
          </div>

          {step < STEPS.length - 1 ? (
            <NeonButton
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next <ChevronRight size={14} />
            </NeonButton>
          ) : (
            <NeonButton
              variant="primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Complete Setup'}
            </NeonButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
