import * as e from "three";
import { OrbitControls as t } from "three/addons/controls/OrbitControls.js";
// src/version.ts
var n = "0.2.0";
// src/crdt/OpId.ts
function r(e, t) {
	return e.lamport === t.lamport ? e.siteId < t.siteId ? -1 : +(e.siteId > t.siteId) : e.lamport - t.lamport;
}
function i(e) {
	return `${e.lamport}@${e.siteId}`;
}
// src/crdt/LamportClock.ts
var a = class {
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
}, ee = class {
	ops = [];
	keys = /* @__PURE__ */ new Set();
	vv = {};
	append(e) {
		let t = i(e.id);
		return !this.keys.has(t) && (this.keys.add(t), this.ops.push(e), this.vv[e.id.siteId] = Math.max(this.vv[e.id.siteId] ?? 0, e.id.lamport), !0);
	}
	has(e) {
		return this.keys.has(i(e));
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
}, o = class {
	value;
	stamp;
	constructor(e, t) {
		this.value = e, this.stamp = t;
	}
	set(e, t) {
		return r(t, this.stamp) > 0 && (this.value = e, this.stamp = t, !0);
	}
	static wins(e, t) {
		return r(e, t) > 0;
	}
}, s = {
	read(e, t) {
		return e.fields.get(t);
	},
	value(e, t) {
		return s.read(e, t)?.value;
	},
	write(e, t, n, r) {
		let i = e.fields, a = i.get(t);
		return a ? a.set(n, r) : (i.set(t, new o(n, r)), !0);
	}
}, c = {
	isPresent(e) {
		return e.removeStamp === null || r(e.removeStamp, e.addStamp) <= 0;
	},
	add(e, t) {
		r(t, e.addStamp) > 0 && (e.addStamp = t), e.deleted = !c.isPresent(e);
	},
	remove(e, t) {
		(e.removeStamp === null || r(t, e.removeStamp) > 0) && (e.removeStamp = t), e.deleted = !c.isPresent(e);
	}
}, te = class {
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
}, ne = class e {
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
			let r = new te(e, t, t);
			for (let [e, t] of Object.entries(n)) r.meta.set(e, t);
			return this.records.set(e, r), r;
		},
		isPresent: (e) => c.isPresent(e),
		addToSet: (e, t) => c.add(e, t),
		removeFromSet: (e, t) => c.remove(e, t),
		readField: (e, t) => s.value(e, t),
		writeField: (e, t, n, r) => s.write(e, t, n, r),
		all: () => this.records.values(),
		metaValue: (e, t) => e.meta.get(t)
	};
}, re = class {
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
}, l = class {
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
}, u = new l(), ie = 500, d = 5, f = 500, p = 5e3, m = class {
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
		t !== null && (e?.type === "sync_hello" && (this.lastHello = t), this.socket?.readyState === WebSocket.OPEN ? this.socket.send(t) : (this.pending.length >= ie && this.pending.shift(), this.pending.push(e)));
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
				if (this.attempts < d) {
					let e = Math.min(f * 2 ** this.attempts, p);
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
}, h = "/api";
function ae(e) {
	h = e.baseUrl.replace(/\/$/, ""), _ = null;
}
var g = class extends Error {
	status;
	constructor(e, t) {
		super(t), this.status = e, this.name = "ApiError";
	}
}, _ = null;
async function oe() {
	if (_) return _;
	let e = await fetch(`${h}/auth/csrf`, { credentials: "include" });
	if (!e.ok) throw new g(e.status, "Could not get a CSRF token from the server.");
	return _ = await e.json(), _;
}
function v() {
	_ = null;
}
async function y(e, t = {}) {
	let n = (t.method ?? "GET").toUpperCase(), r = { ...t.headers };
	if (t.body && (r["Content-Type"] = "application/json"), n !== "GET" && n !== "HEAD") {
		let { token: e, headerName: t } = await oe();
		r[t] = e;
	}
	let i = await fetch(`${h}${e}`, {
		...t,
		method: n,
		headers: r,
		credentials: "include"
	});
	if (!i.ok) throw new g(i.status, await se(i));
	if (i.status === 204) return;
	let a = await i.text();
	return a === "" ? void 0 : JSON.parse(a);
}
async function se(e) {
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
async function ce(e, t) {
	return y("/auth/login", {
		method: "POST",
		body: JSON.stringify({
			email: e,
			password: t
		})
	});
}
async function b() {
	try {
		await y("/auth/logout", { method: "POST" });
	} finally {
		v();
	}
}
async function x(e, t, n) {
	return y("/users", {
		method: "POST",
		body: JSON.stringify({
			nickname: e,
			email: t,
			password: n
		})
	});
}
async function S(e) {
	return y(`/users/${e}/confirm-email`, { method: "POST" });
}
async function C(e) {
	let t = await y("/users"), n = e.trim().toLowerCase();
	return t.find((e) => e.nickname.toLowerCase() === n) ?? null;
}
async function w(e) {
	return y(`/users/${e}/friends`);
}
async function T(e) {
	return y(`/users/${e}/friend-requests`);
}
async function E(e, t) {
	return y(`/users/${e}/friend-requests`, {
		method: "POST",
		body: JSON.stringify({ receiverId: t })
	});
}
async function D(e, t) {
	return y(`/users/${e}/friend-requests/${t}/accept`, { method: "POST" });
}
async function O(e, t) {
	return y(`/users/${e}/friend-requests/${t}/reject`, { method: "POST" });
}
async function k(e, t) {
	return y(`/users/${e}/friend-requests/${t}`, { method: "DELETE" });
}
async function A(e, t) {
	return y(`/users/${e}/friends/${t}`, { method: "DELETE" });
}
async function j(e) {
	return y("/sessions", {
		method: "POST",
		body: JSON.stringify({ hostId: e })
	});
}
async function M(e) {
	return y(`/sessions/${e}`);
}
async function N(e) {
	try {
		return await y(`/sessions/open/${e}`);
	} catch (e) {
		if (e instanceof g && e.status === 404) return null;
		throw e;
	}
}
async function P(e) {
	return y(`/sessions/code/${encodeURIComponent(e.trim())}`);
}
async function F(e, t) {
	return y(`/sessions/${e}/join`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function le(e, t) {
	return y(`/sessions/${e}/leave`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function I(e, t) {
	return y(`/sessions/${e}/end`, {
		method: "POST",
		body: JSON.stringify({ userId: t })
	});
}
async function L(e) {
	return y(`/sessions/${e}/participants`);
}
async function R(e) {
	return y(`/sessions/friends/${e}`);
}
async function z(e) {
	try {
		return await y(`/sessions/${e}/state`);
	} catch (e) {
		if (e instanceof g && e.status === 404) return null;
		throw e;
	}
}
// src/scene/SceneManager.ts
var B = class {
	scene;
	objectsMap;
	constructor() {
		this.scene = new e.Scene(), this.scene.background = new e.Color(2368548), this.objectsMap = /* @__PURE__ */ new Map(), this.initEnvironment();
	}
	initEnvironment() {
		let t = new e.GridHelper(20, 20, 4473924, 2236962), n = new e.DirectionalLight(16777215, 1.2), r = new e.AmbientLight(16777215, .5);
		n.position.set(5, 12, 8), this.scene.add(t, n, r);
	}
	addObject(e) {
		return this.scene.add(e), this.objectsMap.set(e.uuid, e), e.uuid;
	}
	removeObject(e, t = !0) {
		let n = this.objectsMap.get(e);
		return n ? (this.scene.remove(n), this.objectsMap.delete(e), t && this.disposeObject(n), !0) : !1;
	}
	disposeObject(e) {
		let t = e;
		t.geometry && t.geometry.dispose(), Array.isArray(t.material) ? t.material.forEach((e) => e.dispose()) : t.material && t.material.dispose();
	}
	getObject(e) {
		return this.objectsMap.get(e);
	}
	getNativeScene() {
		return this.scene;
	}
}, V = class {
	raycaster;
	camera;
	sceneManager;
	pointer;
	constructor(t, n) {
		this.raycaster = new e.Raycaster(), this.raycaster.params.Points.threshold = .15, this.raycaster.params.Line = { threshold: .08 }, this.camera = t, this.sceneManager = n, this.pointer = new e.Vector2();
	}
	pick(e) {
		this.pointer.set(e.x, e.y), this.raycaster.setFromCamera(this.pointer, this.camera);
		let t = Array.from(this.sceneManager.objectsMap.values()), n = this.raycaster.intersectObjects(t, !0);
		return n.length > 0 ? n[0] : null;
	}
}, H = class {
	sceneManager;
	container;
	resizeHandler;
	renderer;
	constructor(t, n) {
		this.sceneManager = t, this.container = n || document.body, this.resizeHandler = null, this.renderer = new e.WebGLRenderer({ antialias: !0 }), this.renderer.setSize(window.innerWidth, window.innerHeight), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.container.appendChild(this.renderer.domElement);
	}
	render(e) {
		this.renderer.render(this.sceneManager.getNativeScene(), e);
	}
	bindEvents(e) {
		this.resizeHandler = () => this.handleResize(e), window.addEventListener("resize", this.resizeHandler);
	}
	dispose() {
		this.resizeHandler &&= (window.removeEventListener("resize", this.resizeHandler), null), this.renderer.dispose(), this.renderer.domElement.remove();
	}
	handleResize(e) {
		this.renderer.setSize(window.innerWidth, window.innerHeight), e.aspect = window.innerWidth / window.innerHeight, e.updateProjectionMatrix();
	}
}, U = new class {
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
}(), W = class {
	enable() {}
	disable() {}
	update(e) {}
	dispose() {}
}, G = class extends W {
	camera;
	controls;
	constructor(n, r) {
		super(), this.camera = n, this.controls = new t(n, r), this.controls.mouseButtons = {
			LEFT: null,
			MIDDLE: e.MOUSE.ROTATE,
			RIGHT: e.MOUSE.PAN
		}, this.controls.enabled = !1;
	}
	enable() {
		this.controls.enabled = !0;
	}
	disable() {
		this.controls.enabled = !1;
	}
	update(e) {
		this.controls.enabled && this.controls.update();
	}
	syncTarget(t = 5) {
		this.camera.updateMatrixWorld(!0);
		let n = new e.Vector3(), r = new e.Vector3();
		this.camera.getWorldPosition(n), this.camera.getWorldDirection(r), this.controls.target.copy(n).addScaledVector(r, t), this.controls.update();
	}
	dispose() {
		this.disable(), this.controls.dispose();
	}
}, K = class extends W {
	camera;
	domElement;
	enabled;
	isDragging;
	rotation;
	speed;
	lookSpeed;
	moveState;
	onBusAction = () => {};
	onWindowPointerUp = () => {};
	onWindowPointerMove = () => {};
	constructor(t, n) {
		super(), this.camera = t, this.domElement = n, this.enabled = !1, this.isDragging = !1, this.rotation = new e.Euler(0, 0, 0, "YXZ"), this.speed = 8, this.lookSpeed = .002, this.moveState = {
			forward: !1,
			backward: !1,
			left: !1,
			right: !1,
			up: !1,
			down: !1
		}, this.bindEvents();
	}
	enable() {
		this.enabled = !0, this.rotation.setFromQuaternion(this.camera.quaternion);
	}
	disable() {
		this.enabled = !1, this.isDragging = !1;
	}
	bindEvents() {
		this.onBusAction = ({ action: e, state: t }) => {
			if (!this.enabled) return;
			let n = t === "down";
			switch (e) {
				case "move:forward":
					this.moveState.forward = n;
					break;
				case "move:backward":
					this.moveState.backward = n;
					break;
				case "move:left":
					this.moveState.left = n;
					break;
				case "move:right":
					this.moveState.right = n;
					break;
				case "move:up":
					this.moveState.up = n;
					break;
				case "move:down": this.moveState.down = n;
			}
		}, U.on("input:action", this.onBusAction), this.domElement.addEventListener("pointerdown", (e) => {
			this.enabled && e.button === 1 && (this.isDragging = !0, this.domElement.setPointerCapture(e.pointerId));
		}), this.onWindowPointerUp = (e) => {
			this.isDragging = !1, this.domElement.hasPointerCapture(e.pointerId) && this.domElement.releasePointerCapture(e.pointerId);
		}, window.addEventListener("pointerup", this.onWindowPointerUp), this.onWindowPointerMove = (e) => {
			this.enabled && this.isDragging && (this.rotation.y -= e.movementX * this.lookSpeed, this.rotation.x -= e.movementY * this.lookSpeed, this.rotation.x = Math.max(-Math.PI / 2 + .05, Math.min(Math.PI / 2 - .05, this.rotation.x)), this.camera.quaternion.setFromEuler(this.rotation));
		}, window.addEventListener("pointermove", this.onWindowPointerMove);
	}
	dispose() {
		this.disable(), U.off("input:action", this.onBusAction), window.removeEventListener("pointerup", this.onWindowPointerUp), window.removeEventListener("pointermove", this.onWindowPointerMove);
	}
	update(t) {
		let n = this.speed * t, r = new e.Vector3();
		this.camera.getWorldDirection(r), r.y = 0, r.normalize();
		let i = new e.Vector3(-r.z, 0, r.x);
		this.moveState.forward && this.camera.position.addScaledVector(r, n), this.moveState.backward && this.camera.position.addScaledVector(r, -n), this.moveState.left && this.camera.position.addScaledVector(i, -n), this.moveState.right && this.camera.position.addScaledVector(i, n), this.moveState.up && (this.camera.position.y += n), this.moveState.down && (this.camera.position.y -= n);
	}
}, q = class {
	camera;
	domElement;
	strategies;
	navMode;
	active;
	constructor(e, t) {
		this.camera = e, this.domElement = t, this.strategies = {
			orbit: new G(this.camera, this.domElement),
			walk: new K(this.camera, this.domElement)
		}, this.navMode = "orbit", this.active = this.strategies.orbit, this.active.enable();
	}
	changeMode() {
		this.setMode(this.navMode === "walk" ? "orbit" : "walk");
	}
	setMode(e) {
		e !== this.navMode && (this.active.disable(), this.navMode === "walk" && e === "orbit" && this.strategies.orbit.syncTarget(), this.navMode = e, this.active = this.strategies[e], this.active.enable());
	}
	setGizmoDragging(e) {
		this.navMode === "orbit" ? this.strategies.orbit.controls.enabled = !e : this.strategies.walk.enabled = !e;
	}
	update(e) {
		this.active.update(e);
	}
	dispose() {
		this.active.disable(), this.strategies.orbit.dispose(), this.strategies.walk.dispose();
	}
}, J = class {
	sceneManager;
	renderEngine;
	cameraManager;
	clock = new e.Clock();
	frameCallbacks = [];
	animationFrameId = null;
	constructor(t) {
		this.sceneManager = new B(), this.renderEngine = new H(this.sceneManager, t), this.cameraManager = new q(new e.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1e3), this.renderEngine.renderer.domElement), this.renderEngine.bindEvents(this.cameraManager.camera), this.cameraManager.camera.position.set(5, 5, 5), this.cameraManager.camera.lookAt(0, 0, 0);
	}
	onFrame(e) {
		this.frameCallbacks.push(e);
	}
	start() {
		if (this.animationFrameId !== null) return;
		let e = () => {
			let t = this.clock.getDelta();
			this.cameraManager.update(t);
			for (let e of this.frameCallbacks) e(t);
			this.renderEngine.render(this.cameraManager.camera), this.animationFrameId = requestAnimationFrame(e);
		};
		e();
	}
	stop() {
		this.animationFrameId !== null && cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null;
	}
	dispose() {
		this.stop(), this.cameraManager.dispose(), this.renderEngine.dispose();
	}
}, ue = class {
	keybindings;
	constructor(e = {}) {
		this.keybindings = e, this.onKeyDown = this.onKeyDown.bind(this), this.onKeyUp = this.onKeyUp.bind(this);
	}
	init() {
		window.addEventListener("keydown", this.onKeyDown), window.addEventListener("keyup", this.onKeyUp);
	}
	destroy() {
		window.removeEventListener("keydown", this.onKeyDown), window.removeEventListener("keyup", this.onKeyUp);
	}
	onKeyDown(e) {
		let t = e.target;
		if (["INPUT", "TEXTAREA"].includes(t.tagName)) return;
		e.code === "Tab" && e.preventDefault();
		let n = this.keybindings[e.code];
		n && u.emit("input:action", {
			action: n,
			state: "down"
		});
	}
	onKeyUp(e) {
		let t = e.target;
		if (["INPUT", "TEXTAREA"].includes(t.tagName)) return;
		let n = this.keybindings[e.code];
		n && u.emit("input:action", {
			action: n,
			state: "up"
		});
	}
}, de = class {
	options;
	local = null;
	remote = /* @__PURE__ */ new Map();
	changeListeners = [];
	conflictListeners = [];
	throttleMs;
	ttlMs;
	messageType;
	now;
	timer = null;
	pending = !1;
	onMessage = (e) => this.handle(e);
	onClose = () => {
		this.remote.clear(), this.notifyChange();
	};
	constructor(e) {
		this.options = e, this.throttleMs = e.throttleMs ?? 0, this.ttlMs = e.ttlMs ?? 0, this.messageType = e.messageType ?? "presence", this.now = e.now ?? (() => Date.now()), e.transport.onMessage(this.onMessage), e.transport.onClose(this.onClose);
	}
	get state() {
		return this.local;
	}
	publish(e) {
		this.local = e, this.schedule();
	}
	peers() {
		return this.expire(), [...this.remote.values()];
	}
	onChange(e) {
		this.changeListeners.push(e);
	}
	onConflict(e) {
		this.conflictListeners.push(e);
	}
	stop() {
		this.timer !== null && clearTimeout(this.timer), this.timer = null, this.options.transport.offMessage(this.onMessage), this.options.transport.offClose(this.onClose);
	}
	schedule() {
		this.throttleMs <= 0 ? this.flush() : this.timer === null ? (this.flush(), this.timer = setTimeout(() => {
			this.timer = null, this.pending && (this.pending = !1, this.schedule());
		}, this.throttleMs)) : this.pending = !0;
	}
	flush() {
		this.options.transport.send({
			type: this.messageType,
			siteId: this.options.siteId,
			state: this.local === null ? null : this.options.encode(this.local)
		});
	}
	handle(e) {
		if (typeof e != "object" || !e) return;
		let t = e;
		if (t.type !== this.messageType || typeof t.siteId != "string" || t.siteId.length === 0 || t.siteId.length > 100 || t.siteId === this.options.siteId) return;
		let n = t.state === null ? null : this.options.decode(t.state);
		n === null ? (this.remote.delete(t.siteId), this.notifyChange()) : (this.remote.set(t.siteId, {
			siteId: t.siteId,
			state: n,
			seenAt: this.now()
		}), this.local !== null && JSON.stringify(this.options.encode(n)) === JSON.stringify(this.options.encode(this.local)) && t.siteId < this.options.siteId && (this.local = null, this.flush(), this.conflictListeners.forEach((e) => e(n))), this.notifyChange());
	}
	expire() {
		if (this.ttlMs <= 0) return;
		let e = this.now() - this.ttlMs;
		for (let [t, n] of this.remote) n.seenAt < e && this.remote.delete(t);
	}
	notifyChange() {
		this.changeListeners.forEach((e) => e());
	}
}, Y = {
	chunkSize: 200,
	maxOpsPerMessage: 1e3,
	validateOperation: (e) => typeof e == "object" && !!e && typeof e.kind == "string"
}, X = class {
	definitions = /* @__PURE__ */ new Map();
	constructor(e = []) {
		for (let t of e) this.register(t);
	}
	register(e) {
		if (this.definitions.has(e.type)) throw Error(`Message type already registered: ${e.type}`);
		return this.definitions.set(e.type, e), this;
	}
	get(e) {
		return this.definitions.get(e);
	}
	types() {
		return [...this.definitions.keys()];
	}
};
// src/sync/SyncEngine.ts
function Z(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? !1 : Object.values(e).every((e) => typeof e == "number" && Number.isFinite(e));
}
var Q = class {
	replica;
	transport;
	registry;
	policy;
	constructor(e, t, n = {}) {
		this.replica = e, this.transport = t, this.policy = {
			...Y,
			...n.policy
		}, this.registry = new X([
			this.helloDefinition(),
			this.opsDefinition(),
			...n.messages ?? []
		]);
	}
	start() {
		this.transport.onMessage(this.onMessage), this.replica.onLocalOp(this.onLocalOp), this.sendHello();
	}
	stop() {
		this.transport.offMessage(this.onMessage), this.replica.offLocalOp(this.onLocalOp);
	}
	get messages() {
		return this.registry.types();
	}
	onMessage = (e) => {
		if (typeof e != "object" || !e) return;
		let t = e;
		if (typeof t.type != "string") return;
		let n = this.registry.get(t.type);
		n && n.validate(e) && n.handle(e, this.context);
	};
	onLocalOp = (e) => this.context.send({
		type: "sync_ops",
		ops: [e]
	});
	get context() {
		return {
			replica: this.replica,
			policy: this.policy,
			send: (e) => this.transport.send(e)
		};
	}
	sendHello() {
		this.context.send({
			type: "sync_hello",
			vv: this.replica.log.versionVector()
		});
	}
	helloDefinition() {
		let e = this;
		return {
			type: "sync_hello",
			validate: (e) => Z(e?.vv),
			handle: (t) => e.answerHello(t.vv)
		};
	}
	opsDefinition() {
		let e = this;
		return {
			type: "sync_ops",
			validate: (e) => Array.isArray(e?.ops),
			handle: (t) => e.receiveOps(t.ops)
		};
	}
	answerHello(e) {
		let t = this.replica.log.since(e);
		for (let e = 0; e < t.length; e += this.policy.chunkSize) this.context.send({
			type: "sync_ops",
			ops: t.slice(e, e + this.policy.chunkSize)
		});
	}
	receiveOps(e) {
		for (let t of e.slice(0, this.policy.maxOpsPerMessage)) this.policy.validateOperation(t) && this.replica.receive(t);
	}
}, fe = class {
	formats = /* @__PURE__ */ new Map();
	register(e) {
		for (let t of e.extensions) {
			let n = t.toLowerCase();
			if (this.formats.has(n)) throw Error(`Scene format already registered for .${n}`);
			this.formats.set(n, e);
		}
		return this;
	}
	forExtension(e) {
		return this.formats.get(e.replace(/^\./, "").toLowerCase());
	}
	names() {
		return [...new Set([...this.formats.values()].map((e) => e.name))];
	}
}, $ = class {
	host;
	syncEngine;
	bus;
	mounted;
	constructor(e) {
		this.bus = e.bus ?? u, this.host = new J(e.container), this.syncEngine = e.session ? new Q(e.replica, e.session.transport, {
			policy: e.syncPolicy,
			messages: e.messages
		}) : null, this.syncEngine?.start(), this.mounted = e.mount({
			host: this.host,
			replica: e.replica,
			session: e.session ?? null,
			syncEngine: this.syncEngine,
			bus: this.bus,
			onFrame: (e) => this.host.onFrame(e)
		});
	}
	start() {
		this.host.start();
	}
	stop() {
		this.host.stop();
	}
	dispose() {
		this.host.stop(), this.syncEngine?.stop(), this.mounted?.dispose?.(), this.host.dispose();
	}
};
function pe(e) {
	return new $(e);
}
export { g as ApiError, n as CORE_VERSION, q as CameraManager, $ as CollabApp, Y as DEFAULT_SYNC_POLICY, ne as DocumentState, l as EventBus, u as GLOBAL_BUS, ue as InputManager, o as LWWRegister, a as LamportClock, s as LwwStrategy, X as MessageRegistry, W as Navigation, ee as OpLog, re as OperationKindRegistry, G as OrbitNavigation, de as PresenceChannel, V as RaycasterManager, H as RenderEngine, fe as SceneFormatRegistry, J as SceneHost, B as SceneManager, Q as SyncEngine, c as TombstoneSetStrategy, K as WalkNavigation, m as WebSocketTransport, D as acceptFriendRequest, k as cancelFriendRequest, r as compareOpId, ae as configureBackend, S as confirmEmail, pe as createCollabApp, j as createSession, I as endSession, C as findUserByNickname, N as getOpenSession, M as getSession, P as getSessionByCode, z as getSessionState, F as joinSession, le as leaveSession, T as listFriendRequests, w as listFriends, R as listFriendsSessions, L as listParticipants, ce as login, b as logout, i as opIdKey, x as register, O as rejectFriendRequest, A as removeFriend, v as resetCsrf, E as sendFriendRequest };

//# sourceMappingURL=collab3d-core.js.map