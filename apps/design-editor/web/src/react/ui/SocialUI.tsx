import type { CSSProperties } from 'react';
import type { FriendStatus } from './UseSocial';

export const ACCENT = '#e8863a';

export const STATUS_COLOR: Record<FriendStatus, string> = {
    hosting: ACCENT,
    online: '#3ddc84',
    offline: '#6b6b76'
};

export const STATUS_LABEL: Record<FriendStatus, string> = {
    hosting: 'Hosting a session',
    online: 'Online',
    offline: 'Offline'
};

export const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: 8,
    background: '#1a1a1a',
    color: '#fff',
    border: '1px solid #5a5a66',
    borderRadius: 6,
    fontSize: 14
};

export const mutedStyle: CSSProperties = { margin: 0, color: '#9a9aa6', fontSize: 13 };

export const smallButtonStyle: CSSProperties = { padding: '4px 10px', fontSize: 12 };

interface AvatarProps
{
    name: string;
    status?: FriendStatus;
    size?: number;
}

/** Round initial on a colour derived from the name, with an optional presence dot. */
export function Avatar({ name, status, size = 36 }: AvatarProps)
{
    let hash = 0;
    for (const character of name)
        hash = (hash * 31 + character.charCodeAt(0)) % 360;

    return (
        <div
            style={{
                position: 'relative',
                flexShrink: 0,
                width: size,
                height: size,
                borderRadius: '50%',
                background: `hsl(${hash} 55% 42%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: size * 0.42
            }}
        >
            {name.charAt(0).toUpperCase()}
            {status && (
                <span
                    style={{
                        position: 'absolute',
                        right: -2,
                        bottom: -2,
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: STATUS_COLOR[status],
                        border: '2px solid #141418'
                    }}
                />
            )}
        </div>
    );
}