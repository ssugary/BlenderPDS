import { useNavigate } from 'react-router-dom';
import { useSocialContext } from './SocialContext';
import { Avatar } from './SocialUI';

/** Thin bar across the top of every lobby screen: the brand on the left, the account on the right. */
export function LobbyTopBar()
{
    const navigate = useNavigate();
    const { user, logout } = useSocialContext();

    return (
        <div className="lobby-topbar">
            <button className="lobby-brand" onClick={() => navigate('/')}>BLENDERPDS</button>

            {user ? (
                <div className="lobby-user">
                    <Avatar name={user.name} size={28} />
                    <span>{user.name}</span>
                    <button className="lobby-link" onClick={logout}>Sign out</button>
                </div>
            ) : (
                <button className="lobby-link" onClick={() => navigate('/login')}>Sign in</button>
            )}
        </div>
    );
}