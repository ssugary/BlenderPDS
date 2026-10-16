import { useState } from 'react';
import type { FormEvent } from 'react';
import { Friend, FriendStatus, Social } from './UseSocial';
import { ACCENT, Avatar, inputStyle, mutedStyle, smallButtonStyle, STATUS_COLOR, STATUS_LABEL } from './SocialUI';

const STATUS_ORDER: Record<FriendStatus, number> = { hosting: 0, online: 1, offline: 2 };

interface FriendsPanelProps
{
    social: Social;
    /** Called when the user asks to join a friend who is hosting. Omit it to hide the Join button. */
    onJoin?: (friend: Friend) => void;
    /** Called when the user invites an online friend to their own session. Omit it to hide the Invite button. */
    onInvite?: (friend: Friend) => void;
}

const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8
};

export function FriendsPanel({ social, onJoin, onInvite }: FriendsPanelProps)
{
    const [name, setName] = useState('');
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
    const [busy, setBusy] = useState(false);

    const sorted = [...social.friends].sort(
        (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name)
    );

    const submit = async (event: FormEvent) =>
    {
        event.preventDefault();

        setBusy(true);
        const problem = await social.addFriend(name);
        setBusy(false);

        if (problem)
        {
            setMessage({ text: problem, isError: true });
            return;
        }

        setMessage({ text: `Friend request sent to ${name.trim()}.`, isError: false });
        setName('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <form onSubmit={submit} style={{ display: 'flex', gap: 6 }}>
                <input
                    type="text"
                    placeholder="Add a friend by username"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                />
                <button type="submit" disabled={busy}>Add</button>
            </form>

            {message && (
                <p style={{ ...mutedStyle, color: message.isError ? '#ff7b7b' : '#3ddc84' }}>{message.text}</p>
            )}

            {social.requests.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ ...mutedStyle, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {`Requests (${social.requests.length})`}
                    </div>
                    {social.requests.map((request) => (
                        <div key={request.id} style={rowStyle}>
                            <Avatar name={request.name} />
                            <div style={{ flex: 1, minWidth: 0, fontWeight: 'bold' }}>{request.name}</div>
                            <button
                                style={{ ...smallButtonStyle, background: ACCENT, borderColor: ACCENT, color: '#111' }}
                                onClick={() => social.acceptRequest(request.id)}
                            >
                                Accept
                            </button>
                            <button style={smallButtonStyle} onClick={() => social.declineRequest(request.id)}>Decline</button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ ...mutedStyle, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {`Friends (${social.friends.length})`}
                </div>

                <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sorted.length === 0 && <p style={mutedStyle}>No friends yet. Add someone by username above.</p>}

                    {sorted.map((friend) => (
                        <div key={friend.id} style={{ ...rowStyle, opacity: friend.status === 'offline' ? 0.6 : 1 }}>
                            <Avatar name={friend.name} status={friend.status} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {friend.name}
                                </div>
                                <div style={{ fontSize: 12, color: STATUS_COLOR[friend.status] }}>
                                    {STATUS_LABEL[friend.status]}
                                </div>
                            </div>
                            {onJoin && friend.status === 'hosting' && (
                                <button
                                    style={{ ...smallButtonStyle, background: ACCENT, borderColor: ACCENT, color: '#111', fontWeight: 'bold' }}
                                    onClick={() => onJoin(friend)}
                                >
                                    Join
                                </button>
                            )}
                            {onInvite && friend.status === 'online' && (
                                <button style={smallButtonStyle} onClick={() => onInvite(friend)}>Invite</button>
                            )}
                            <button
                                title="Remove friend"
                                style={{ ...smallButtonStyle, background: 'transparent', border: 'none', color: '#9a9aa6' }}
                                onClick={() => social.removeFriend(friend.id)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}