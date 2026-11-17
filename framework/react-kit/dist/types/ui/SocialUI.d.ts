import type { CSSProperties } from 'react';
import type { FriendStatus } from './UseSocial';
export declare const ACCENT = "#e8863a";
export declare const STATUS_COLOR: Record<FriendStatus, string>;
export declare const STATUS_LABEL: Record<FriendStatus, string>;
export declare const inputStyle: CSSProperties;
export declare const mutedStyle: CSSProperties;
export declare const smallButtonStyle: CSSProperties;
interface AvatarProps {
    name: string;
    status?: FriendStatus;
    size?: number;
}
/** Round initial on a colour derived from the name, with an optional presence dot. */
export declare function Avatar({ name, status, size }: AvatarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=SocialUI.d.ts.map