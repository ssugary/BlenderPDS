import { Social, User } from './UseSocial';
interface AuthPanelProps {
    social: Social;
    /** Called after a successful login. */
    onDone: () => void;
}
/**
 * Sign in / register against the backend.
 *
 * Registering does NOT sign the user in: the account starts unconfirmed and the login
 * is blocked until the link that the backend e-mails is clicked (see Mailpit in dev).
 */
export declare function AuthPanel({ social, onDone }: AuthPanelProps): import("react").JSX.Element;
interface UserChipProps {
    user: User;
    onLogout: () => void;
}
export declare function UserChip({ user, onLogout }: UserChipProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AuthPanel.d.ts.map