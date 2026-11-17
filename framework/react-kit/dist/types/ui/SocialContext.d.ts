import type { ReactNode } from 'react';
import { Social } from './UseSocial';
/** Keeps the signed-in user and the friends list alive across every route. */
export declare function SocialProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useSocialContext(): Social;
//# sourceMappingURL=SocialContext.d.ts.map