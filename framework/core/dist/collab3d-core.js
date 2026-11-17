// src/version.ts
var e = "0.2.0";
// src/crdt/OpId.ts
function t(e, t) {
	return e.lamport === t.lamport ? e.siteId < t.siteId ? -1 : +(e.siteId > t.siteId) : e.lamport - t.lamport;
}
function n(e) {
	return `${e.lamport}@${e.siteId}`;
}
// src/crdt/LamportClock.ts
var r = class {
	siteId;
	counter = 0;
	constructor(e) {
		this.siteId = e;
	}
	tick() {
		return this.counter += 1, {
			lamport: this.counter,
			siteId: this.siteId
		};
	}
	observe(e) {
		this.counter = Math.max(this.counter, e.lamport);
	}
	get current() {
		return this.counter;
	}
	get id() {
		return this.siteId;
	}
}, i = class {
	ops = [];
	keys = /* @__PURE__ */ new Set();
	vv = {};
	append(e) {
		let t = n(e.id);
		return !this.keys.has(t) && (this.keys.add(t), this.ops.push(e), this.vv[e.id.siteId] = Math.max(this.vv[e.id.siteId] ?? 0, e.id.lamport), !0);
	}
	has(e) {
		return this.keys.has(n(e));
	}
	since(e) {
		return this.ops.filter((t) => t.id.lamport > (e[t.id.siteId] ?? 0));
	}
	versionVector() {
		return { ...this.vv };
	}
	all() {
		return this.ops;
	}
}, a = class {
	value;
	stamp;
	constructor(e, t) {
		this.value = e, this.stamp = t;
	}
	set(e, n) {
		return t(n, this.stamp) > 0 && (this.value = e, this.stamp = n, !0);
	}
	static wins(e, n) {
		return t(e, n) > 0;
	}
}, o = class {
	listeners;
	constructor() {
		this.listeners = /* @__PURE__ */ new Map();
	}
	on(e, t) {
		let n = this.listeners.get(e);
		if (n) n.push(t);
		else {
			let n = [];
			n.push(t), this.listeners.set(e, n);
		}
	}
	off(e, t) {
		let n = this.listeners.get(e);
		n && this.listeners.set(e, n.filter((e) => e !== t));
	}
	emit(e, t) {
		let n = this.listeners.get(e);
		n && n.forEach((e) => e(t));
	}
}, s = new o(), c = 500, l = 5, u = 500, d = 5e3, f = class {
	socket;
	messageListeners;
	closeListeners;
	pending;
	lastHello;
	attempts;
	closedByUser;
	url;
	constructor(e) {
		this.url = e, this.socket = null, this.messageListeners = [], this.closeListeners = [], this.pending = [], this.lastHello = null, this.attempts = 0, this.closedByUser = !1, this.open();
	}
	static urlFor(e, t) {
		return `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/sessions/${e}?userId=${t}`;
	}
	send(e) {
		let t = this.serialize(e);
		t !== null && (e?.type === "sync_hello" && (this.lastHello = t), this.socket?.readyState === WebSocket.OPEN ? this.socket.send(t) : (this.pending.length >= c && this.pending.shift(), this.pending.push(e)));
	}
	onMessage(e) {
		this.messageListeners.push(e);
	}
	offMessage(e) {
		this.messageListeners = this.messageListeners.filter((t) => t !== e);
	}
	onClose(e) {
		this.closeListeners.push(e);
	}
	offClose(e) {
		this.closeListeners = this.closeListeners.filter((t) => t !== e);
	}
	close() {
		this.closedByUser = !0, this.pending = [], this.socket?.close(), this.socket = null;
	}
	open() {
		let e = new WebSocket(this.url);
		this.socket = e, e.onopen = () => {
			this.attempts = 0, this.lastHello !== null && this.pending.length > 0 && e.send(this.lastHello);
			let t = this.pending;
			this.pending = [];
			for (let n of t) {
				let t = this.serialize(n);
				t !== null && (n?.type !== "sync_hello" || t !== this.lastHello) && e.send(t);
			}
		}, e.onmessage = (e) => {
			let t;
			try {
				t = JSON.parse(e.data);
			} catch {
				return;
			}
			for (let e of [...this.messageListeners]) e(t);
		}, e.onclose = () => {
			if (!this.closedByUser) {
				if (this.attempts < l) {
					let e = Math.min(u * 2 ** this.attempts, d);
					this.attempts += 1, window.setTimeout(() => {
						this.closedByUser || this.open();
					}, e);
				} else this.notifyClose();
			}
		}, e.onerror = () => {};
	}
	serialize(e) {
		try {
			return JSON.stringify(e);
		} catch {
			return null;
		}
	}
	notifyClose() {
		for (let e of [...this.closeListeners]) e();
	}
}, p = "/api";
function m(e) {
	p = e.baseUrl.replace(/\/$/, ""), g = null;
}
var h = class extends Error {
	status;
	constructor(e, t) {
		super(t), this.status = e, this.name = "ApiError";
	}
}, g = null;
async function _() {
	if (g) return g;
	let e = await fetch(`${p}/auth/csrf`, { credentials: "include" });
	if (!e.ok) throw new h(e.status, "Could not get a CSRF token from the server.");
	return g = await e.json(), g;
}
function v() {
	g = null;
}
async function y(e, t = {}) {
	let n = (t.method ?? "GET").toUpperCase(), r = { ...t.headers };
	if (t.body && (r["Content-Type"] = "application/json"), n !== "GET" && n !== "HEAD") {
		let { token: e, headerName: t } = await _();
		r[t] = e;
	}
	let i = await fetch(`${p}${e}`, {
		...t,
		method: n,
		headers: r,
		credentials: "include"
	});
	if (!i.ok) throw new h(i.status, await b(i));
	if (i.status === 204) return;
	let a = await i.text();
	return a === "" ? void 0 : JSON.parse(a);
}
async function b(e) {
	let t = await e.text();
	if (t !== "") try {
		let n = JSON.parse(t);
		return n.message ?? n.error ?? `${e.status}`;
	} catch {
		return t;
	}
	switch (e.status) {
		case 400: return "The server rejected the data.";
		case 401: return "Your session expired. Sign in again.";
		case 403: return "You are not allowed to do that.";
		case 404: return "Not found.";
		case 409: return "Conflicting state on the server.";
		default: return `Request failed (${e.status}).`;
	}
}
async function x(e, t) {
	return y("/auth/login", {
		method: "POST",
		body: JSON.stringify({
			email: e,
			password: t
		})
	});
}
async function S() {
	try {
		await y("/auth/logout", { method: "POST" });
	} finally {
		v();
	}
}
async function C(e, t, n) {
	return y("/users", {
		method: "POST",
		body: JSON.stringify({
			nickname: e,
			email: t,
			password: n
		})
	});
}
async function w(e) {
	return y(`/users/${e}/confirm-email`, { method: "POST" });
}
async function T(e) {
	let t = await y("/users"), n = e.trim().toLowerCase();
	return t.find((e) => e.nickname.toLowerCase() === n) ?? null;
}
async function E(e) {
	return y(`/users/${e}/friends`);
}
async function D(e) {
	return y(`/users/${e}/friend-requests`);
}
async function O(e, t) {
	return y(`/users/${e}/friend-requests`, {
		method: "POST",
		body: JSON.stringify({ receiverId: t })
	});
}
async function k(e, t) {
	return y(`/users/${e}/friend-requests/${t}/accept`, { method: "POST" });
}
async function A(e, t) {
	return y(`/users/${e}/friend-requests/${t}/reject`, { method: "POST" });
}
async function j(e, t) {
	return y(`/users/${e}/friend-requests/${t}`, { method: "DELETE" });
}
async function M(e, t) {
	return y(`/users/${e}/friends/${t}`, { method: "DELETE" });
}
async function N(e) {
	return y("/sessions", {
		method: "POST",
		body: JSON.stringify({ hostId: e })
	});
}
async function P(e) {
	return y(`/sessions/${e}`);
}
async function F(e) {
	try {
		return await y(`/sessions/open/${e}`);
	} catch (e) {
		if (e instanceof h && e.status === 404) return null;
		throw e;
	}
}
async function I(e) {
	return y(`/sessions/code/${encodeURIComponent(e.trim())}`);
}
async function L(e, t) {
	return y(`/sessions/${e}/join`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function R(e, t) {
	return y(`/sessions/${e}/leave`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function z(e, t) {
	return y(`/sessions/${e}/end`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function B(e) {
	return y(`/sessions/${e}/participants`);
}
async function V(e) {
	return y(`/sessions/friends/${e}`);
}
async function H(e) {
	try {
		return await y(`/sessions/${e}/state`);
	} catch (e) {
		if (e instanceof h && e.status === 404) return null;
		throw e;
	}
}
export { h as ApiError, e as CORE_VERSION, o as EventBus, s as GLOBAL_BUS, a as LWWRegister, r as LamportClock, i as OpLog, f as WebSocketTransport, k as acceptFriendRequest, j as cancelFriendRequest, t as compareOpId, m as configureBackend, w as confirmEmail, N as createSession, z as endSession, T as findUserByNickname, F as getOpenSession, P as getSession, I as getSessionByCode, H as getSessionState, L as joinSession, R as leaveSession, D as listFriendRequests, E as listFriends, V as listFriendsSessions, B as listParticipants, x as login, S as logout, n as opIdKey, C as register, A as rejectFriendRequest, M as removeFriend, v as resetCsrf, O as sendFriendRequest };

//# sourceMappingURL=collab3d-core.js.map