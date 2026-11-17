import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Social, useSocial } from './UseSocial';

const SocialContext = createContext<Social | null>(null);

/** Keeps the signed-in user and the friends list alive across every route. */
export function SocialProvider({ children }: { children: ReactNode })
{
    const social = useSocial();
    return <SocialContext.Provider value={social}>{children}</SocialContext.Provider>;
}

export function useSocialContext(): Social
{
    const social = useContext(SocialContext);
    if (!social)
        throw new Error('useSocialContext must be used inside <SocialProvider>.');

    return social;
}