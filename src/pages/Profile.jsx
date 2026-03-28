import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { InputField } from '../components/ui/InputField';
import { Avatar } from '../components/ui/Avatar';
import { FileUploadZone } from '../components/ui/FileUploadZone';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { uploadFile, getStoragePath } from '../firebase/storage';
import { updateDocument } from '../firebase/firestore';
import { getRoleLabel } from '../utils/permissions';
import { Save, User, Shield, Mail, Gamepad2, Calendar } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, userDoc } = useAuth();
  const { role } = useRole();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: userDoc?.displayName || '',
    ign: userDoc?.ign || '',
    phone: userDoc?.phone || '',
    bio: userDoc?.bio || '',
    socialLinks: userDoc?.socialLinks || { instagram: '', twitter: '', youtube: '', discord: '' },
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(userDoc?.photoURL || '');

  // SYNC: Ensure form is populated when userDoc loads or changes while NOT editing
  React.useEffect(() => {
    if (userDoc && !editing) {
      setForm({
        displayName: userDoc.displayName || '',
        ign: userDoc.ign || '',
        phone: userDoc.phone || '',
        bio: userDoc.bio || '',
        socialLinks: userDoc.socialLinks || { instagram: '', twitter: '', youtube: '', discord: '' },
      });
      setPhotoPreview(userDoc.photoURL || '');
    }
  }, [userDoc, editing]);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateSocial = (platform, value) => {
    setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [platform]: value } }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      let photoURL = userDoc?.photoURL || '';
      
      // If a new file was selected, upload it first
      if (photoFile) {
        const path = getStoragePath('avatar', photoFile.name);
        photoURL = await uploadFile(photoFile, path);
      }

      // Update Firestore
      await updateDocument('users', user.uid, {
        ...form,
        photoURL,
        // Ensure profile is marked as complete if it wasn't already
        profileComplete: true,
        updatedAt: Date.now()
      });

      toast.success('Profile updated successfully');
      setEditing(false);
      setPhotoFile(null); // Reset file selection
    } catch (err) {
      console.error('[Profile] Save error:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-3xl mx-auto">
      <div className="mb-10">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2 block">Account</span>
        <h1 className="text-4xl font-black font-display tracking-tighter text-white uppercase">Profile</h1>
      </div>

      {/* Profile Header */}
      <GlassCard delay={0.1} className="mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar src={photoPreview || userDoc?.photoURL} name={userDoc?.displayName || 'U'} size="xl" />
            {editing && (
              <FileUploadZone
                onFileSelect={(file) => { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }}
                className="mt-2"
                label=""
                hint="Change photo"
              />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white">{userDoc?.displayName}</h2>
            <p className="text-sm text-cyan-400 font-display mt-1">{userDoc?.ign || 'No IGN set'}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={role}>{getRoleLabel(role)}</Badge>
              {userDoc?.game && <Badge variant="primary">{userDoc.game}</Badge>}
            </div>
          </div>
          {!editing && (
            <NeonButton variant="secondary" onClick={() => setEditing(true)}>Edit</NeonButton>
          )}
        </div>
      </GlassCard>

      {/* Details */}
      <GlassCard delay={0.2}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
              <Mail size={16} className="text-slate-500" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Email</p>
                <p className="text-sm text-white font-medium">{userDoc?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
              <Calendar size={16} className="text-slate-500" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Joined</p>
                <p className="text-sm text-white font-medium">{formatDate(userDoc?.createdAt)}</p>
              </div>
            </div>
          </div>

          {editing && (
            <>
              <div className="h-px bg-white/5 my-4" />
              <InputField label="Display Name" value={form.displayName} onChange={(e) => updateField('displayName', e.target.value)} />
              <InputField label="In-Game Name" value={form.ign} onChange={(e) => updateField('ign', e.target.value)} />
              <InputField label="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
              <InputField label="Bio" value={form.bio} onChange={(e) => updateField('bio', e.target.value)} />

              <div className="h-px bg-white/5 my-4" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Social Links</p>
              <InputField label="Instagram" value={form.socialLinks.instagram} onChange={(e) => updateSocial('instagram', e.target.value)} />
              <InputField label="Discord" value={form.socialLinks.discord} onChange={(e) => updateSocial('discord', e.target.value)} />
              <InputField label="Twitter" value={form.socialLinks.twitter} onChange={(e) => updateSocial('twitter', e.target.value)} />
              <InputField label="YouTube" value={form.socialLinks.youtube} onChange={(e) => updateSocial('youtube', e.target.value)} />

              <div className="flex justify-end gap-3 pt-4">
                <NeonButton variant="secondary" onClick={() => setEditing(false)}>Cancel</NeonButton>
                <NeonButton variant="primary" onClick={handleSave} disabled={saving}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </NeonButton>
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
