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
}, o = {
	read(e, t) {
		return e.fields.get(t);
	},
	value(e, t) {
		return o.read(e, t)?.value;
	},
	write(e, t, n, r) {
		let i = e.fields, o = i.get(t);
		return o ? o.set(n, r) : (i.set(t, new a(n, r)), !0);
	}
}, s = {
	isPresent(e) {
		return e.removeStamp === null || t(e.removeStamp, e.addStamp) <= 0;
	},
	add(e, n) {
		t(n, e.addStamp) > 0 && (e.addStamp = n), e.deleted = !s.isPresent(e);
	},
	remove(e, n) {
		(e.removeStamp === null || t(n, e.removeStamp) > 0) && (e.removeStamp = n), e.deleted = !s.isPresent(e);
	}
}, c = class {
	id;
	createdBy;
	addStamp;
	meta = /* @__PURE__ */ new Map();
	fields = /* @__PURE__ */ new Map();
	removeStamp = null;
	deleted = !1;
	constructor(e, t, n) {
		this.id = e, this.createdBy = t, this.addStamp = n;
	}
}, l = class e {
	kinds;
	records = /* @__PURE__ */ new Map();
	constructor(e) {
		this.kinds = e;
	}
	apply(e) {
		let t = this.kinds.get(e.kind);
		return t ? t.apply(this.draft, e) : [];
	}
	get(e) {
		return this.records.get(e);
	}
	all() {
		return this.records.values();
	}
	static replay(t, n) {
		let r = new e(n);
		for (let e of t) r.apply(e);
		return r;
	}
	draft = {
		get: (e) => this.records.get(e),
		create: (e, t, n = {}) => {
			let r = new c(e, t, t);
			for (let [e, t] of Object.entries(n)) r.meta.set(e, t);
			return this.records.set(e, r), r;
		},
		isPresent: (e) => s.isPresent(e),
		addToSet: (e, t) => s.add(e, t),
		removeFromSet: (e, t) => s.remove(e, t),
		readField: (e, t) => o.value(e, t),
		writeField: (e, t, n, r) => o.write(e, t, n, r),
		all: () => this.records.values(),
		metaValue: (e, t) => e.meta.get(t)
	};
}, u = class {
	definitions = /* @__PURE__ */ new Map();
	constructor(e = []) {
		for (let t of e) this.register(t);
	}
	register(e) {
		if (this.definitions.has(e.kind)) throw Error(`Operation kind already registered: ${e.kind}`);
		return this.definitions.set(e.kind, {
			kind: e.kind,
			validate: (t) => e.validate(t),
			apply: (t, n) => e.apply(t, n)
		}), this;
	}
	get(e) {
		return this.definitions.get(e);
	}
	has(e) {
		return this.definitions.has(e);
	}
	kinds() {
		return [...this.definitions.keys()];
	}
}, d = class {
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
}, f = new d(), p = 500, m = 5, h = 500, g = 5e3, _ = class {
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
		t !== null && (e?.type === "sync_hello" && (this.lastHello = t), this.socket?.readyState === WebSocket.OPEN ? this.socket.send(t) : (this.pending.length >= p && this.pending.shift(), this.pending.push(e)));
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
				if (this.attempts < m) {
					let e = Math.min(h * 2 ** this.attempts, g);
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
}, v = "/api";
function y(e) {
	v = e.baseUrl.replace(/\/$/, ""), x = null;
}
var b = class extends Error {
	status;
	constructor(e, t) {
		super(t), this.status = e, this.name = "ApiError";
	}
}, x = null;
async function S() {
	if (x) return x;
	let e = await fetch(`${v}/auth/csrf`, { credentials: "include" });
	if (!e.ok) throw new b(e.status, "Could not get a CSRF token from the server.");
	return x = await e.json(), x;
}
function C() {
	x = null;
}
async function w(e, t = {}) {
	let n = (t.method ?? "GET").toUpperCase(), r = { ...t.headers };
	if (t.body && (r["Content-Type"] = "application/json"), n !== "GET" && n !== "HEAD") {
		let { token: e, headerName: t } = await S();
		r[t] = e;
	}
	let i = await fetch(`${v}${e}`, {
		...t,
		method: n,
		headers: r,
		credentials: "include"
	});
	if (!i.ok) throw new b(i.status, await T(i));
	if (i.status === 204) return;
	let a = await i.text();
	return a === "" ? void 0 : JSON.parse(a);
}
async function T(e) {
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
async function E(e, t) {
	return w("/auth/login", {
		method: "POST",
		body: JSON.stringify({
			email: e,
			password: t
		})
	});
}
async function D() {
	try {
		await w("/auth/logout", { method: "POST" });
	} finally {
		C();
	}
}
async function O(e, t, n) {
	return w("/users", {
		method: "POST",
		body: JSON.stringify({
			nickname: e,
			email: t,
			password: n
		})
	});
}
async function k(e) {
	return w(`/users/${e}/confirm-email`, { method: "POST" });
}
async function A(e) {
	let t = await w("/users"), n = e.trim().toLowerCase();
	return t.find((e) => e.nickname.toLowerCase() === n) ?? null;
}
async function j(e) {
	return w(`/users/${e}/friends`);
}
async function M(e) {
	return w(`/users/${e}/friend-requests`);
}
async function N(e, t) {
	return w(`/users/${e}/friend-requests`, {
		method: "POST",
		body: JSON.stringify({ receiverId: t })
	});
}
async function P(e, t) {
	return w(`/users/${e}/friend-requests/${t}/accept`, { method: "POST" });
}
async function F(e, t) {
	return w(`/users/${e}/friend-requests/${t}/reject`, { method: "POST" });
}
async function I(e, t) {
	return w(`/users/${e}/friend-requests/${t}`, { method: "DELETE" });
}
async function L(e, t) {
	return w(`/users/${e}/friends/${t}`, { method: "DELETE" });
}
async function R(e) {
	return w("/sessions", {
		method: "POST",
		body: JSON.stringify({ hostId: e })
	});
}
async function z(e) {
	return w(`/sessions/${e}`);
}
async function B(e) {
	try {
		return await w(`/sessions/open/${e}`);
	} catch (e) {
		if (e instanceof b && e.status === 404) return null;
		throw e;
	}
}
async function V(e) {
	return w(`/sessions/code/${encodeURIComponent(e.trim())}`);
}
async function H(e, t) {
	return w(`/sessions/${e}/join`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function U(e, t) {
	return w(`/sessions/${e}/leave`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function W(e, t) {
	return w(`/sessions/${e}/end`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function G(e) {
	return w(`/sessions/${e}/participants`);
}
async function K(e) {
	return w(`/sessions/friends/${e}`);
}
async function q(e) {
	try {
		return await w(`/sessions/${e}/state`);
	} catch (e) {
		if (e instanceof b && e.status === 404) return null;
		throw e;
	}
}
export { b as ApiError, e as CORE_VERSION, l as DocumentState, d as EventBus, f as GLOBAL_BUS, a as LWWRegister, r as LamportClock, o as LwwStrategy, i as OpLog, u as OperationKindRegistry, s as TombstoneSetStrategy, _ as WebSocketTransport, P as acceptFriendRequest, I as cancelFriendRequest, t as compareOpId, y as configureBackend, k as confirmEmail, R as createSession, W as endSession, A as findUserByNickname, B as getOpenSession, z as getSession, V as getSessionByCode, q as getSessionState, H as joinSession, U as leaveSession, M as listFriendRequests, j as listFriends, K as listFriendsSessions, G as listParticipants, E as login, D as logout, n as opIdKey, O as register, F as rejectFriendRequest, L as removeFriend, C as resetCsrf, N as sendFriendRequest };

//# sourceMappingURL=collab3d-core.js.map