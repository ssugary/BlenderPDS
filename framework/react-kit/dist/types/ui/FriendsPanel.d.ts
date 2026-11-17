import { Friend, Social } from './UseSocial';
interface FriendsPanelProps {
    social: Social;
    /** Called when the user asks to join a friend who is hosting. Omit it to hide the Join button. */
    onJoin?: (friend: Friend) => void;
    /** Called when the user invites an online friend to their own session. Omit it to hide the Invite button. */
    onInvite?: (friend: Friend) => void;
}
export declare function FriendsPanel({ social, onJoin, onInvite }: FriendsPanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=FriendsPanel.d.ts.map