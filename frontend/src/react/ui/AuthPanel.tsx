import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Social, User } from './UseSocial';
import { ACCENT, Avatar, inputStyle, mutedStyle, smallButtonStyle } from './SocialUI';

type AuthMode = 'login' | 'register';

interface AuthPanelProps
{
    social: Social;
    /** Called after a successful login or registration. */
    onDone: () => void;
}

const tabStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${active ? ACCENT : '#444'}`,
    borderRadius: 0,
    color: active ? '#fff' : '#9a9aa6'
});

export function AuthPanel({ social, onDone }: AuthPanelProps)
{
    const [mode, setMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const switchMode = (next: AuthMode) =>
    {
        setMode(next);
        setError('');
    };

    const submit = async (event: FormEvent) =>
    {
        event.preventDefault();
        setError('');

        if (mode === 'register' && password !== confirm)
        {
            setError('Passwords do not match.');
            return;
        }

        setBusy(true);
        const problem = mode === 'login'
            ? await social.login(name, password)
            : await social.register(name, password);
        setBusy(false);

        if (problem)
            setError(problem);
        else
            onDone();
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex' }}>
                <button type="button" style={tabStyle(mode === 'login')} onClick={() => switchMode('login')}>Sign in</button>
                <button type="button" style={tabStyle(mode === 'register')} onClick={() => switchMode('register')}>Register</button>
            </div>

            <input
                type="text"
                placeholder="Username"
                autoComplete="username"
                value={name}
                onChange={(event) => setName(event.target.value)}
                style={inputStyle}
            />
            <input
                type="password"
                placeholder="Password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
            />
            {mode === 'register' && (
                <input
                    type="password"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    style={inputStyle}
                />
            )}

            {error !== '' && <p style={{ ...mutedStyle, color: '#ff7b7b' }}>{error}</p>}

            <button type="submit" disabled={busy} style={{ background: ACCENT, borderColor: ACCENT, color: '#111', fontWeight: 'bold' }}>
                {busy ? 'Please wait...' : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
        </form>
    );
}

interface UserChipProps
{
    user: User;
    onLogout: () => void;
}

export function UserChip({ user, onLogout }: UserChipProps)
{
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={user.name} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                <div style={mutedStyle}>Signed in</div>
            </div>
            <button style={smallButtonStyle} onClick={onLogout}>Sign out</button>
        </div>
    );
}