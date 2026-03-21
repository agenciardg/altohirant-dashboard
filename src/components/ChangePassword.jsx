import { useState } from 'react';

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
  input: {
    width: '100%',
    background: '#2a2a2a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '6px',
    color: '#f0ece4',
    fontSize: '13px',
    padding: '8px 10px',
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
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#4ade80',
  },
  messageError: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
  },
};

export default function ChangePassword({ updatePassword }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [focusedField, setFocusedField] = useState(null);
  const [buttonHovered, setButtonHovered] = useState(false);

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      return 'Preencha todos os campos.';
    }
    if (newPassword.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres.';
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
      await updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
    } catch (err) {
      const errorText =
        err?.message || 'Erro ao alterar a senha. Tente novamente.';
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
          <label style={styles.label} htmlFor="cp-nova-senha">
            Nova senha
          </label>
          <input
            id="cp-nova-senha"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setMessage(null);
            }}
            onFocus={() => setFocusedField('new')}
            onBlur={() => setFocusedField(null)}
            style={getInputStyle('new')}
            placeholder="Min. 6 caracteres"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="cp-confirmar-senha">
            Confirmar senha
          </label>
          <input
            id="cp-confirmar-senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setMessage(null);
            }}
            onFocus={() => setFocusedField('confirm')}
            onBlur={() => setFocusedField(null)}
            style={getInputStyle('confirm')}
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            disabled={loading}
          />
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
        <div
          style={{
            ...styles.message,
            ...(message.type === 'success'
              ? styles.messageSuccess
              : styles.messageError),
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
