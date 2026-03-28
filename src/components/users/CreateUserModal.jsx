import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InputField, SelectField } from '../ui/InputField';
import { NeonButton } from '../ui/NeonButton';
import { CredentialDisplay } from './CredentialDisplay';
import { createUserAccount } from '../../firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { ROLES, ROLE_LABELS } from '../../utils/permissions';
import { GAMES } from '../../utils/games';
import { generateTempPassword } from '../../utils/credentialGenerator';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateUserModal = ({ isOpen, onClose }) => {
  const { user, userDoc } = useAuth();
  const { isOwner, canCreateManagers } = useRole();
  const [step, setStep] = useState('form'); // form | credentials
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    role: ROLES.PLAYER,
    game: '',
  });

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Available roles based on current user's role
  const availableRoles = [
    { value: ROLES.PLAYER, label: ROLE_LABELS[ROLES.PLAYER] },
    { value: ROLES.GAME_TEAM_MANAGER, label: ROLE_LABELS[ROLES.GAME_TEAM_MANAGER] },
    ...(canCreateManagers() ? [{ value: ROLES.MANAGER, label: ROLE_LABELS[ROLES.MANAGER] }] : []),
  ];

  const handleCreate = async () => {
    if (!form.displayName.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setLoading(true);
    try {
      const tempPassword = generateTempPassword(form.displayName);
      const email = form.email.includes('@') ? form.email : `${form.email.toLowerCase().replace(/[^a-z0-9.]/g, '')}@zentrixesports.com`;

      const result = await createUserAccount({
        email,
        password: tempPassword,
        displayName: form.displayName.trim(),
        role: form.role,
        game: form.game || null,
        createdByUid: user.uid,
        createdByName: userDoc.displayName,
        createdByEmail: userDoc.email,
      });

      setCredentials({
        email: result.email,
        password: tempPassword,
        displayName: result.displayName,
        role: result.role,
      });

      setStep('credentials');
      toast.success('Account created successfully');
    } catch (err) {
      console.error('[Zentrix] Create user error:', err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered');
      } else {
        toast.error(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setForm({ displayName: '', email: '', role: ROLES.PLAYER, game: '' });
    setCredentials(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'form' ? 'Create User Account' : 'Account Created'}
      subtitle={step === 'form' ? 'Issue login credentials' : 'Save these credentials now'}
      size="md"
    >
      {step === 'form' ? (
        <div className="space-y-4">
          <InputField
            label="Full Name"
            value={form.displayName}
            onChange={(e) => updateForm('displayName', e.target.value)}
            placeholder="John Doe"
            required
          />

          <InputField
            label="Email"
            value={form.email}
            onChange={(e) => updateForm('email', e.target.value)}
            placeholder="john@zentrixesports.com"
            required
          />

          <SelectField
            label="Role"
            value={form.role}
            onChange={(e) => updateForm('role', e.target.value)}
            options={availableRoles}
            required
          />

          {(form.role === ROLES.PLAYER || form.role === ROLES.GAME_TEAM_MANAGER) && (
            <SelectField
              label="Assigned Game"
              value={form.game}
              onChange={(e) => updateForm('game', e.target.value)}
              options={GAMES.map(g => ({ value: g.name, label: g.name }))}
              placeholder="Select game..."
            />
          )}

          <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-4 mt-4">
            <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
              A temporary password will be auto-generated. The user will be required to complete their profile on first login.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <NeonButton variant="secondary" onClick={handleClose}>Cancel</NeonButton>
            <NeonButton variant="primary" onClick={handleCreate} disabled={loading}>
              <UserPlus size={14} />
              {loading ? 'Creating...' : 'Create Account'}
            </NeonButton>
          </div>
        </div>
      ) : (
        <CredentialDisplay credentials={credentials} onDone={handleClose} />
      )}
    </Modal>
  );
};
