/**
 * Hosting screen. The session now exists on the backend before anyone connects, so:
 *
 * 1. opening this page creates the room (and shows the code friends can type);
 * 2. friends who are online see it in their friends list as "hosting";
 * 3. the host starts the editor when ready, which opens the collaboration socket.
 *
 * The backend refuses the socket to anyone who is not a friend of the host, so the
 * friends-only rule is enforced there, not by hiding the button here.
 */
export declare function HostPage(): import("react").JSX.Element;
//# sourceMappingURL=HostPage.d.ts.map