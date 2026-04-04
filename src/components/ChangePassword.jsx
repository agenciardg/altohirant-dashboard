import { useState } from 'react';

function EyeIcon({ visible, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', padding: 4,
      color: 'var(--t3, #6B7280)', display: 'flex', alignItems: 'center',
    }}>
      {visible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      )}
    </button>
  );
}

const styles = {
  container: {
    width: '280px',
    background: '#1e1e1e',
    borderRadius: '10px',
    padding: '16px',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  },
  title: {
    color: '#f0ece4',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '14px',
    letterSpacing: '0.02em',
  },
  fieldGroup: {
    marginBottom: '10px',
  },
  label: {
    display: 'block',
    color: '#a89f93',
    fontSize: '11px',
    fontWeight: '500',
    marginBottom: '5px',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    background: '#2a2a2a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '6px',
    color: '#f0ece4',
    fontSize: '13px',
    padding: '8px 32px 8px 10px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.15s ease',
  },
  inputFocus: {
    borderColor: '#E85D04',
  },
  button: {
    width: '100%',
    background: '#E85D04',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    padding: '9px 12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginTop: '14px',
    letterSpacing: '0.02em',
    transition: 'background 0.15s ease, opacity 0.15s ease',
  },
  buttonHover: {
    background: '#c94e03',
  },
  buttonDisabled: {
    opacity: '0.6',
    cursor: 'not-allowed',
  },
  message: {
    fontSize: '12px',
    borderRadius: '5px',
    padding: '7px 10px',
    marginTop: '10px',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  messageSuccess: {
    background: 'rgba(232,160,32,0.12)',
    border: '1px solid rgba(232,160,32,0.3)',
    color: '#e8a020',
  },
  messageError: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
  },
};

export default function ChangePassword({ updatePassword, verifyPassword }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'Preencha todos os campos.';
    }
    if (newPassword.length < 6) {
      return 'A nova senha deve ter no mínimo 6 caracteres.';
    }
    if (newPassword !== confirmPassword) {
      return 'As senhas não coincidem.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const validationError = validate();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setLoading(true);
    try {
      await verifyPassword(currentPassword);
      await updatePassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({
        type: 'success',
        text: 'Senha alterada com sucesso! Informe a nova senha à equipe da Agência RDG.',
      });
    } catch (err) {
      const errorText = err?.message || 'Erro ao alterar a senha. Tente novamente.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(focusedField === fieldName ? styles.inputFocus : {}),
  });

  const getButtonStyle = () => ({
    ...styles.button,
    ...(buttonHovered && !loading ? styles.buttonHover : {}),
    ...(loading ? styles.buttonDisabled : {}),
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>Alterar Senha</div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="cp-senha-atual">
            Senha atual
          </label>
          <div style={styles.inputWrap}>
            <input
              id="cp-senha-atual"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setMessage(null); }}
              onFocus={() => setFocusedField('current')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('current')}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
              disabled={loading}
            />
            <EyeIcon visible={showCurrent} onClick={() => setShowCurrent(v => !v)} />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="cp-nova-senha">
            Nova senha
          </label>
          <div style={styles.inputWrap}>
            <input
              id="cp-nova-senha"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setMessage(null); }}
              onFocus={() => setFocusedField('new')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('new')}
              placeholder="Min. 6 caracteres"
              autoComplete="new-password"
              disabled={loading}
            />
            <EyeIcon visible={showNew} onClick={() => setShowNew(v => !v)} />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="cp-confirmar-senha">
            Confirmar nova senha
          </label>
          <div style={styles.inputWrap}>
            <input
              id="cp-confirmar-senha"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setMessage(null); }}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('confirm')}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              disabled={loading}
            />
            <EyeIcon visible={showConfirm} onClick={() => setShowConfirm(v => !v)} />
          </div>
        </div>

        <button
          type="submit"
          style={getButtonStyle()}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.messageSuccess : styles.messageError),
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
