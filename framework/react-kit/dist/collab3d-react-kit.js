import { Navigate as e, Outlet as t, useLocation as n, useNavigate as r, useOutletContext as i } from "react-router-dom";
import { createContext as a, useCallback as o, useContext as s, useEffect as c, useRef as l, useState as u } from "react";
import { Fragment as d, jsx as f, jsxs as p } from "react/jsx-runtime";
import { ApiError as m, GLOBAL_BUS as h, WebSocketTransport as g, acceptFriendRequest as _, createSession as v, findUserByNickname as y, getOpenSession as b, getSessionByCode as x, joinSession as S, listFriendRequests as C, listFriends as w, listFriendsSessions as T, listParticipants as E, login as D, logout as O, register as k, rejectFriendRequest as A, removeFriend as j, sendFriendRequest as M } from "@collab3d/core";
var ee = 1e3, te = 1001, N = 1002, P = 1003, ne = 1004, re = 1005, ie = 1006, ae = 1007, oe = 1008, se = 1009, F = 1014, ce = 1015, le = 1016, ue = 1020, I = 1023, de = 1026, fe = 1027, L = 2300, pe = 2301, R = 2302, z = 2400, B = 2401, V = 2402, H = 3e3, U = 3001, me = 3200, he = 3201, ge = "srgb", _e = "srgb-linear", ve = "display-p3", W = "display-p3-linear", ye = "linear", be = "srgb", xe = "rec709", Se = 7680, Ce = 35044, we = 1035, Te = 2e3, G = class {
	addEventListener(e, t) {
		this._listeners === void 0 && (this._listeners = {});
		let n = this._listeners;
		n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
	}
	hasEventListener(e, t) {
		if (this._listeners === void 0) return !1;
		let n = this._listeners;
		return n[e] !== void 0 && n[e].indexOf(t) !== -1;
	}
	removeEventListener(e, t) {
		if (this._listeners === void 0) return;
		let n = this._listeners[e];
		if (n !== void 0) {
			let e = n.indexOf(t);
			e !== -1 && n.splice(e, 1);
		}
	}
	dispatchEvent(e) {
		if (this._listeners === void 0) return;
		let t = this._listeners[e.type];
		if (t !== void 0) {
			e.target = this;
			let n = t.slice(0);
			for (let t = 0, r = n.length; t < r; t++) n[t].call(this, e);
			e.target = null;
		}
	}
}, Ee = /* @__PURE__ */ "00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff".split("."), De = 1234567, Oe = Math.PI / 180, ke = 180 / Math.PI;
function Ae() {
	let e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0, r = Math.random() * 4294967295 | 0;
	return (Ee[e & 255] + Ee[e >> 8 & 255] + Ee[e >> 16 & 255] + Ee[e >> 24 & 255] + "-" + Ee[t & 255] + Ee[t >> 8 & 255] + "-" + Ee[t >> 16 & 15 | 64] + Ee[t >> 24 & 255] + "-" + Ee[n & 63 | 128] + Ee[n >> 8 & 255] + "-" + Ee[n >> 16 & 255] + Ee[n >> 24 & 255] + Ee[r & 255] + Ee[r >> 8 & 255] + Ee[r >> 16 & 255] + Ee[r >> 24 & 255]).toLowerCase();
}
function je(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Me(e, t) {
	return (e % t + t) % t;
}
function Ne(e, t, n, r, i) {
	return r + (e - t) * (i - r) / (n - t);
}
function Pe(e, t, n) {
	return e === t ? 0 : (n - e) / (t - e);
}
function Fe(e, t, n) {
	return (1 - n) * e + n * t;
}
function Ie(e, t, n, r) {
	return Fe(e, t, 1 - Math.exp(-n * r));
}
function Le(e, t = 1) {
	return t - Math.abs(Me(e, t * 2) - t);
}
function Re(e, t, n) {
	return e <= t ? 0 : e >= n ? 1 : (e = (e - t) / (n - t), e * e * (3 - 2 * e));
}
function ze(e, t, n) {
	return e <= t ? 0 : e >= n ? 1 : (e = (e - t) / (n - t), e * e * e * (e * (e * 6 - 15) + 10));
}
function Be(e, t) {
	return e + Math.floor(Math.random() * (t - e + 1));
}
function Ve(e, t) {
	return e + Math.random() * (t - e);
}
function He(e) {
	return e * (.5 - Math.random());
}
function Ue(e) {
	e !== void 0 && (De = e);
	let t = De += 1831565813;
	return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function We(e) {
	return e * Oe;
}
function Ge(e) {
	return e * ke;
}
function Ke(e) {
	return !(e & e - 1) && e !== 0;
}
function qe(e) {
	return 2 ** Math.ceil(Math.log(e) / Math.LN2);
}
function Je(e) {
	return 2 ** Math.floor(Math.log(e) / Math.LN2);
}
function Ye(e, t, n, r, i) {
	let a = Math.cos, o = Math.sin, s = a(n / 2), c = o(n / 2), l = a((t + r) / 2), u = o((t + r) / 2), d = a((t - r) / 2), f = o((t - r) / 2), p = a((r - t) / 2), m = o((r - t) / 2);
	switch (i) {
		case "XYX":
			e.set(s * u, c * d, c * f, s * l);
			break;
		case "YZY":
			e.set(c * f, s * u, c * d, s * l);
			break;
		case "ZXZ":
			e.set(c * d, c * f, s * u, s * l);
			break;
		case "XZX":
			e.set(s * u, c * m, c * p, s * l);
			break;
		case "YXY":
			e.set(c * p, s * u, c * m, s * l);
			break;
		case "ZYZ":
			e.set(c * m, c * p, s * u, s * l);
			break;
		default: console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + i);
	}
}
function Xe(e, t) {
	switch (t.constructor) {
		case Float32Array: return e;
		case Uint32Array: return e / 4294967295;
		case Uint16Array: return e / 65535;
		case Uint8Array: return e / 255;
		case Int32Array: return Math.max(e / 2147483647, -1);
		case Int16Array: return Math.max(e / 32767, -1);
		case Int8Array: return Math.max(e / 127, -1);
		default: throw Error("Invalid component type.");
	}
}
function Ze(e, t) {
	switch (t.constructor) {
		case Float32Array: return e;
		case Uint32Array: return Math.round(e * 4294967295);
		case Uint16Array: return Math.round(e * 65535);
		case Uint8Array: return Math.round(e * 255);
		case Int32Array: return Math.round(e * 2147483647);
		case Int16Array: return Math.round(e * 32767);
		case Int8Array: return Math.round(e * 127);
		default: throw Error("Invalid component type.");
	}
}
var Qe = {
	DEG2RAD: Oe,
	RAD2DEG: ke,
	generateUUID: Ae,
	clamp: je,
	euclideanModulo: Me,
	mapLinear: Ne,
	inverseLerp: Pe,
	lerp: Fe,
	damp: Ie,
	pingpong: Le,
	smoothstep: Re,
	smootherstep: ze,
	randInt: Be,
	randFloat: Ve,
	randFloatSpread: He,
	seededRandom: Ue,
	degToRad: We,
	radToDeg: Ge,
	isPowerOfTwo: Ke,
	ceilPowerOfTwo: qe,
	floorPowerOfTwo: Je,
	setQuaternionFromProperEuler: Ye,
	normalize: Ze,
	denormalize: Xe
}, K = class e {
	constructor(t = 0, n = 0) {
		e.prototype.isVector2 = !0, this.x = t, this.y = n;
	}
	get width() {
		return this.x;
	}
	set width(e) {
		this.x = e;
	}
	get height() {
		return this.y;
	}
	set height(e) {
		this.y = e;
	}
	set(e, t) {
		return this.x = e, this.y = t, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			default: throw Error("index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			default: throw Error("index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this;
	}
	divide(e) {
		return this.x /= e.x, this.y /= e.y, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	applyMatrix3(e) {
		let t = this.x, n = this.y, r = e.elements;
		return this.x = r[0] * t + r[3] * n + r[6], this.y = r[1] * t + r[4] * n + r[7], this;
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
	}
	clamp(e, t) {
		return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this;
	}
	clampScalar(e, t) {
		return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y;
	}
	cross(e) {
		return this.x * e.y - this.y * e.x;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	angle() {
		return Math.atan2(-this.y, -this.x) + Math.PI;
	}
	angleTo(e) {
		let t = Math.sqrt(this.lengthSq() * e.lengthSq());
		if (t === 0) return Math.PI / 2;
		let n = this.dot(e) / t;
		return Math.acos(je(n, -1, 1));
	}
	distanceTo(e) {
		return Math.sqrt(this.distanceToSquared(e));
	}
	distanceToSquared(e) {
		let t = this.x - e.x, n = this.y - e.y;
		return t * t + n * n;
	}
	manhattanDistanceTo(e) {
		return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this;
	}
	rotateAround(e, t) {
		let n = Math.cos(t), r = Math.sin(t), i = this.x - e.x, a = this.y - e.y;
		return this.x = i * n - a * r + e.x, this.y = i * r + a * n + e.y, this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y;
	}
}, q = class e {
	constructor(t, n, r, i, a, o, s, c, l) {
		e.prototype.isMatrix3 = !0, this.elements = [
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1
		], t !== void 0 && this.set(t, n, r, i, a, o, s, c, l);
	}
	set(e, t, n, r, i, a, o, s, c) {
		let l = this.elements;
		return l[0] = e, l[1] = r, l[2] = o, l[3] = t, l[4] = i, l[5] = s, l[6] = n, l[7] = a, l[8] = c, this;
	}
	identity() {
		return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
	}
	copy(e) {
		let t = this.elements, n = e.elements;
		return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this;
	}
	extractBasis(e, t, n) {
		return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
	}
	setFromMatrix4(e) {
		let t = e.elements;
		return this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this;
	}
	multiply(e) {
		return this.multiplyMatrices(this, e);
	}
	premultiply(e) {
		return this.multiplyMatrices(e, this);
	}
	multiplyMatrices(e, t) {
		let n = e.elements, r = t.elements, i = this.elements, a = n[0], o = n[3], s = n[6], c = n[1], l = n[4], u = n[7], d = n[2], f = n[5], p = n[8], m = r[0], h = r[3], g = r[6], _ = r[1], v = r[4], y = r[7], b = r[2], x = r[5], S = r[8];
		return i[0] = a * m + o * _ + s * b, i[3] = a * h + o * v + s * x, i[6] = a * g + o * y + s * S, i[1] = c * m + l * _ + u * b, i[4] = c * h + l * v + u * x, i[7] = c * g + l * y + u * S, i[2] = d * m + f * _ + p * b, i[5] = d * h + f * v + p * x, i[8] = d * g + f * y + p * S, this;
	}
	multiplyScalar(e) {
		let t = this.elements;
		return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
	}
	determinant() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8];
		return t * a * l - t * o * c - n * i * l + n * o * s + r * i * c - r * a * s;
	}
	invert() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8], u = l * a - o * c, d = o * s - l * i, f = c * i - a * s, p = t * u + n * d + r * f;
		if (p === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
		let m = 1 / p;
		return e[0] = u * m, e[1] = (r * c - l * n) * m, e[2] = (o * n - r * a) * m, e[3] = d * m, e[4] = (l * t - r * s) * m, e[5] = (r * i - o * t) * m, e[6] = f * m, e[7] = (n * s - c * t) * m, e[8] = (a * t - n * i) * m, this;
	}
	transpose() {
		let e, t = this.elements;
		return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
	}
	getNormalMatrix(e) {
		return this.setFromMatrix4(e).invert().transpose();
	}
	transposeIntoArray(e) {
		let t = this.elements;
		return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
	}
	setUvTransform(e, t, n, r, i, a, o) {
		let s = Math.cos(i), c = Math.sin(i);
		return this.set(n * s, n * c, -n * (s * a + c * o) + a + e, -r * c, r * s, -r * (-c * a + s * o) + o + t, 0, 0, 1), this;
	}
	scale(e, t) {
		return this.premultiply($e.makeScale(e, t)), this;
	}
	rotate(e) {
		return this.premultiply($e.makeRotation(-e)), this;
	}
	translate(e, t) {
		return this.premultiply($e.makeTranslation(e, t)), this;
	}
	makeTranslation(e, t) {
		return e.isVector2 ? this.set(1, 0, e.x, 0, 1, e.y, 0, 0, 1) : this.set(1, 0, e, 0, 1, t, 0, 0, 1), this;
	}
	makeRotation(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, -n, 0, n, t, 0, 0, 0, 1), this;
	}
	makeScale(e, t) {
		return this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this;
	}
	equals(e) {
		let t = this.elements, n = e.elements;
		for (let e = 0; e < 9; e++) if (t[e] !== n[e]) return !1;
		return !0;
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 9; n++) this.elements[n] = e[n + t];
		return this;
	}
	toArray(e = [], t = 0) {
		let n = this.elements;
		return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e;
	}
	clone() {
		return new this.constructor().fromArray(this.elements);
	}
}, $e = /*@__PURE__*/ new q();
function et(e) {
	for (let t = e.length - 1; t >= 0; --t) if (e[t] >= 65535) return !0;
	return !1;
}
function tt(e) {
	return document.createElementNS("http://www.w3.org/1999/xhtml", e);
}
function nt() {
	let e = tt("canvas");
	return e.style.display = "block", e;
}
var rt = {};
function it(e) {
	e in rt || (rt[e] = !0, console.warn(e));
}
var at = /*@__PURE__*/ new q().set(.8224621, .177538, 0, .0331941, .9668058, 0, .0170827, .0723974, .9105199), ot = /*@__PURE__*/ new q().set(1.2249401, -.2249404, 0, -.0420569, 1.0420571, 0, -.0196376, -.0786361, 1.0982735), st = {
	[_e]: {
		transfer: ye,
		primaries: xe,
		toReference: (e) => e,
		fromReference: (e) => e
	},
	[ge]: {
		transfer: be,
		primaries: xe,
		toReference: (e) => e.convertSRGBToLinear(),
		fromReference: (e) => e.convertLinearToSRGB()
	},
	[W]: {
		transfer: ye,
		primaries: "p3",
		toReference: (e) => e.applyMatrix3(ot),
		fromReference: (e) => e.applyMatrix3(at)
	},
	[ve]: {
		transfer: be,
		primaries: "p3",
		toReference: (e) => e.convertSRGBToLinear().applyMatrix3(ot),
		fromReference: (e) => e.applyMatrix3(at).convertLinearToSRGB()
	}
}, ct = /* @__PURE__ */ new Set([_e, W]), J = {
	enabled: !0,
	_workingColorSpace: _e,
	get workingColorSpace() {
		return this._workingColorSpace;
	},
	set workingColorSpace(e) {
		if (!ct.has(e)) throw Error(`Unsupported working color space, "${e}".`);
		this._workingColorSpace = e;
	},
	convert: function(e, t, n) {
		if (this.enabled === !1 || t === n || !t || !n) return e;
		let r = st[t].toReference, i = st[n].fromReference;
		return i(r(e));
	},
	fromWorkingColorSpace: function(e, t) {
		return this.convert(e, this._workingColorSpace, t);
	},
	toWorkingColorSpace: function(e, t) {
		return this.convert(e, t, this._workingColorSpace);
	},
	getPrimaries: function(e) {
		return st[e].primaries;
	},
	getTransfer: function(e) {
		return e === "" ? ye : st[e].transfer;
	}
};
function lt(e) {
	return e < .04045 ? e * .0773993808 : (e * .9478672986 + .0521327014) ** 2.4;
}
function ut(e) {
	return e < .0031308 ? e * 12.92 : 1.055 * e ** .41666 - .055;
}
var dt, ft = class {
	static getDataURL(e) {
		if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
		let t;
		if (e instanceof HTMLCanvasElement) t = e;
		else {
			dt === void 0 && (dt = tt("canvas")), dt.width = e.width, dt.height = e.height;
			let n = dt.getContext("2d");
			e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = dt;
		}
		return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", .6)) : t.toDataURL("image/png");
	}
	static sRGBToLinear(e) {
		if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
			let t = tt("canvas");
			t.width = e.width, t.height = e.height;
			let n = t.getContext("2d");
			n.drawImage(e, 0, 0, e.width, e.height);
			let r = n.getImageData(0, 0, e.width, e.height), i = r.data;
			for (let e = 0; e < i.length; e++) i[e] = lt(i[e] / 255) * 255;
			return n.putImageData(r, 0, 0), t;
		}
		if (e.data) {
			let t = e.data.slice(0);
			for (let e = 0; e < t.length; e++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[e] = Math.floor(lt(t[e] / 255) * 255) : t[e] = lt(t[e]);
			return {
				data: t,
				width: e.width,
				height: e.height
			};
		}
		return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
	}
}, pt = 0, mt = class {
	constructor(e = null) {
		this.isSource = !0, Object.defineProperty(this, "id", { value: pt++ }), this.uuid = Ae(), this.data = e, this.dataReady = !0, this.version = 0;
	}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
		let n = {
			uuid: this.uuid,
			url: ""
		}, r = this.data;
		if (r !== null) {
			let e;
			if (Array.isArray(r)) {
				e = [];
				for (let t = 0, n = r.length; t < n; t++) r[t].isDataTexture ? e.push(ht(r[t].image)) : e.push(ht(r[t]));
			} else e = ht(r);
			n.url = e;
		}
		return t || (e.images[this.uuid] = n), n;
	}
};
function ht(e) {
	return typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap ? ft.getDataURL(e) : e.data ? {
		data: Array.from(e.data),
		width: e.width,
		height: e.height,
		type: e.data.constructor.name
	} : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
var gt = 0, _t = class e extends G {
	constructor(t = e.DEFAULT_IMAGE, n = e.DEFAULT_MAPPING, r = te, i = te, a = ie, o = oe, s = I, c = se, l = e.DEFAULT_ANISOTROPY, u = "") {
		super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: gt++ }), this.uuid = Ae(), this.name = "", this.source = new mt(t), this.mipmaps = [], this.mapping = n, this.channel = 0, this.wrapS = r, this.wrapT = i, this.magFilter = a, this.minFilter = o, this.anisotropy = l, this.format = s, this.internalFormat = null, this.type = c, this.offset = new K(0, 0), this.repeat = new K(1, 1), this.center = new K(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new q(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, typeof u == "string" ? this.colorSpace = u : (it("THREE.Texture: Property .encoding has been replaced by .colorSpace."), this.colorSpace = u === 3001 ? ge : ""), this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.needsPMREMUpdate = !1;
	}
	get image() {
		return this.source.data;
	}
	set image(e = null) {
		this.source.data = e;
	}
	updateMatrix() {
		this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		if (!t && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
		let n = {
			metadata: {
				version: 4.6,
				type: "Texture",
				generator: "Texture.toJSON"
			},
			uuid: this.uuid,
			name: this.name,
			image: this.source.toJSON(e).uuid,
			mapping: this.mapping,
			channel: this.channel,
			repeat: [this.repeat.x, this.repeat.y],
			offset: [this.offset.x, this.offset.y],
			center: [this.center.x, this.center.y],
			rotation: this.rotation,
			wrap: [this.wrapS, this.wrapT],
			format: this.format,
			internalFormat: this.internalFormat,
			type: this.type,
			colorSpace: this.colorSpace,
			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy,
			flipY: this.flipY,
			generateMipmaps: this.generateMipmaps,
			premultiplyAlpha: this.premultiplyAlpha,
			unpackAlignment: this.unpackAlignment
		};
		return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
	transformUv(e) {
		if (this.mapping !== 300) return e;
		if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1) switch (this.wrapS) {
			case ee:
				e.x -= Math.floor(e.x);
				break;
			case te:
				e.x = e.x < 0 ? 0 : 1;
				break;
			case N: Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x -= Math.floor(e.x);
		}
		if (e.y < 0 || e.y > 1) switch (this.wrapT) {
			case ee:
				e.y -= Math.floor(e.y);
				break;
			case te:
				e.y = e.y < 0 ? 0 : 1;
				break;
			case N: Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y -= Math.floor(e.y);
		}
		return this.flipY && (e.y = 1 - e.y), e;
	}
	set needsUpdate(e) {
		e === !0 && (this.version++, this.source.needsUpdate = !0);
	}
	get encoding() {
		return it("THREE.Texture: Property .encoding has been replaced by .colorSpace."), this.colorSpace === "srgb" ? U : H;
	}
	set encoding(e) {
		it("THREE.Texture: Property .encoding has been replaced by .colorSpace."), this.colorSpace = e === 3001 ? ge : "";
	}
};
_t.DEFAULT_IMAGE = null, _t.DEFAULT_MAPPING = 300, _t.DEFAULT_ANISOTROPY = 1;
var vt = class e {
	constructor(t = 0, n = 0, r = 0, i = 1) {
		e.prototype.isVector4 = !0, this.x = t, this.y = n, this.z = r, this.w = i;
	}
	get width() {
		return this.z;
	}
	set width(e) {
		this.z = e;
	}
	get height() {
		return this.w;
	}
	set height(e) {
		this.w = e;
	}
	set(e, t, n, r) {
		return this.x = e, this.y = t, this.z = n, this.w = r, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this.z = e, this.w = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setZ(e) {
		return this.z = e, this;
	}
	setW(e) {
		return this.w = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			case 2:
				this.z = t;
				break;
			case 3:
				this.w = t;
				break;
			default: throw Error("index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
			default: throw Error("index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y, this.z, this.w);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w === void 0 ? 1 : e.w, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this.z += e, this.w += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
	}
	applyMatrix4(e) {
		let t = this.x, n = this.y, r = this.z, i = this.w, a = e.elements;
		return this.x = a[0] * t + a[4] * n + a[8] * r + a[12] * i, this.y = a[1] * t + a[5] * n + a[9] * r + a[13] * i, this.z = a[2] * t + a[6] * n + a[10] * r + a[14] * i, this.w = a[3] * t + a[7] * n + a[11] * r + a[15] * i, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	setAxisAngleFromQuaternion(e) {
		this.w = 2 * Math.acos(e.w);
		let t = Math.sqrt(1 - e.w * e.w);
		return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
	}
	setAxisAngleFromRotationMatrix(e) {
		let t, n, r, i, a = .01, o = .1, s = e.elements, c = s[0], l = s[4], u = s[8], d = s[1], f = s[5], p = s[9], m = s[2], h = s[6], g = s[10];
		if (Math.abs(l - d) < a && Math.abs(u - m) < a && Math.abs(p - h) < a) {
			if (Math.abs(l + d) < o && Math.abs(u + m) < o && Math.abs(p + h) < o && Math.abs(c + f + g - 3) < o) return this.set(1, 0, 0, 0), this;
			t = Math.PI;
			let e = (c + 1) / 2, s = (f + 1) / 2, _ = (g + 1) / 2, v = (l + d) / 4, y = (u + m) / 4, b = (p + h) / 4;
			return e > s && e > _ ? e < a ? (n = 0, r = .707106781, i = .707106781) : (n = Math.sqrt(e), r = v / n, i = y / n) : s > _ ? s < a ? (n = .707106781, r = 0, i = .707106781) : (r = Math.sqrt(s), n = v / r, i = b / r) : _ < a ? (n = .707106781, r = .707106781, i = 0) : (i = Math.sqrt(_), n = y / i, r = b / i), this.set(n, r, i, t), this;
		}
		let _ = Math.sqrt((h - p) * (h - p) + (u - m) * (u - m) + (d - l) * (d - l));
		return Math.abs(_) < .001 && (_ = 1), this.x = (h - p) / _, this.y = (u - m) / _, this.z = (d - l) / _, this.w = Math.acos((c + f + g - 1) / 2), this;
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
	}
	clamp(e, t) {
		return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this.w = Math.max(e.w, Math.min(t.w, this.w)), this;
	}
	clampScalar(e, t) {
		return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this.w = Math.max(e, Math.min(t, this.w)), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y, yield this.z, yield this.w;
	}
}, yt = class extends G {
	constructor(e = 1, t = 1, n = {}) {
		super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new vt(0, 0, e, t), this.scissorTest = !1, this.viewport = new vt(0, 0, e, t);
		let r = {
			width: e,
			height: t,
			depth: 1
		};
		n.encoding !== void 0 && (it("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."), n.colorSpace = n.encoding === 3001 ? ge : ""), n = Object.assign({
			generateMipmaps: !1,
			internalFormat: null,
			minFilter: ie,
			depthBuffer: !0,
			stencilBuffer: !1,
			depthTexture: null,
			samples: 0
		}, n), this.texture = new _t(r, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.flipY = !1, this.texture.generateMipmaps = n.generateMipmaps, this.texture.internalFormat = n.internalFormat, this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.depthTexture = n.depthTexture, this.samples = n.samples;
	}
	setSize(e, t, n = 1) {
		(this.width !== e || this.height !== t || this.depth !== n) && (this.width = e, this.height = t, this.depth = n, this.texture.image.width = e, this.texture.image.height = t, this.texture.image.depth = n, this.dispose()), this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.texture = e.texture.clone(), this.texture.isRenderTargetTexture = !0;
		let t = Object.assign({}, e.texture.image);
		return this.texture.source = new mt(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
}, bt = class extends yt {
	constructor(e = 1, t = 1, n = {}) {
		super(e, t, n), this.isWebGLRenderTarget = !0;
	}
}, xt = class extends _t {
	constructor(e = null, t = 1, n = 1, r = 1) {
		super(null), this.isDataArrayTexture = !0, this.image = {
			data: e,
			width: t,
			height: n,
			depth: r
		}, this.magFilter = P, this.minFilter = P, this.wrapR = te, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
	}
}, St = class extends _t {
	constructor(e = null, t = 1, n = 1, r = 1) {
		super(null), this.isData3DTexture = !0, this.image = {
			data: e,
			width: t,
			height: n,
			depth: r
		}, this.magFilter = P, this.minFilter = P, this.wrapR = te, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
	}
}, Ct = class {
	constructor(e = 0, t = 0, n = 0, r = 1) {
		this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = r;
	}
	static slerpFlat(e, t, n, r, i, a, o) {
		let s = n[r + 0], c = n[r + 1], l = n[r + 2], u = n[r + 3], d = i[a + 0], f = i[a + 1], p = i[a + 2], m = i[a + 3];
		if (o === 0) e[t + 0] = s, e[t + 1] = c, e[t + 2] = l, e[t + 3] = u;
		else if (o === 1) e[t + 0] = d, e[t + 1] = f, e[t + 2] = p, e[t + 3] = m;
		else {
			if (u !== m || s !== d || c !== f || l !== p) {
				let e = 1 - o, t = s * d + c * f + l * p + u * m, n = t >= 0 ? 1 : -1, r = 1 - t * t;
				if (r > 2 ** -52) {
					let i = Math.sqrt(r), a = Math.atan2(i, t * n);
					e = Math.sin(e * a) / i, o = Math.sin(o * a) / i;
				}
				let i = o * n;
				if (s = s * e + d * i, c = c * e + f * i, l = l * e + p * i, u = u * e + m * i, e === 1 - o) {
					let e = 1 / Math.sqrt(s * s + c * c + l * l + u * u);
					s *= e, c *= e, l *= e, u *= e;
				}
			}
			e[t] = s, e[t + 1] = c, e[t + 2] = l, e[t + 3] = u;
		}
	}
	static multiplyQuaternionsFlat(e, t, n, r, i, a) {
		let o = n[r], s = n[r + 1], c = n[r + 2], l = n[r + 3], u = i[a], d = i[a + 1], f = i[a + 2], p = i[a + 3];
		return e[t] = o * p + l * u + s * f - c * d, e[t + 1] = s * p + l * d + c * u - o * f, e[t + 2] = c * p + l * f + o * d - s * u, e[t + 3] = l * p - o * u - s * d - c * f, e;
	}
	get x() {
		return this._x;
	}
	set x(e) {
		this._x = e, this._onChangeCallback();
	}
	get y() {
		return this._y;
	}
	set y(e) {
		this._y = e, this._onChangeCallback();
	}
	get z() {
		return this._z;
	}
	set z(e) {
		this._z = e, this._onChangeCallback();
	}
	get w() {
		return this._w;
	}
	set w(e) {
		this._w = e, this._onChangeCallback();
	}
	set(e, t, n, r) {
		return this._x = e, this._y = t, this._z = n, this._w = r, this._onChangeCallback(), this;
	}
	clone() {
		return new this.constructor(this._x, this._y, this._z, this._w);
	}
	copy(e) {
		return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
	}
	setFromEuler(e, t = !0) {
		let n = e._x, r = e._y, i = e._z, a = e._order, o = Math.cos, s = Math.sin, c = o(n / 2), l = o(r / 2), u = o(i / 2), d = s(n / 2), f = s(r / 2), p = s(i / 2);
		switch (a) {
			case "XYZ":
				this._x = d * l * u + c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "YXZ":
				this._x = d * l * u + c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u + d * f * p;
				break;
			case "ZXY":
				this._x = d * l * u - c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "ZYX":
				this._x = d * l * u - c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u + d * f * p;
				break;
			case "YZX":
				this._x = d * l * u + c * f * p, this._y = c * f * u + d * l * p, this._z = c * l * p - d * f * u, this._w = c * l * u - d * f * p;
				break;
			case "XZY":
				this._x = d * l * u - c * f * p, this._y = c * f * u - d * l * p, this._z = c * l * p + d * f * u, this._w = c * l * u + d * f * p;
				break;
			default: console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a);
		}
		return t === !0 && this._onChangeCallback(), this;
	}
	setFromAxisAngle(e, t) {
		let n = t / 2, r = Math.sin(n);
		return this._x = e.x * r, this._y = e.y * r, this._z = e.z * r, this._w = Math.cos(n), this._onChangeCallback(), this;
	}
	setFromRotationMatrix(e) {
		let t = e.elements, n = t[0], r = t[4], i = t[8], a = t[1], o = t[5], s = t[9], c = t[2], l = t[6], u = t[10], d = n + o + u;
		if (d > 0) {
			let e = .5 / Math.sqrt(d + 1);
			this._w = .25 / e, this._x = (l - s) * e, this._y = (i - c) * e, this._z = (a - r) * e;
		} else if (n > o && n > u) {
			let e = 2 * Math.sqrt(1 + n - o - u);
			this._w = (l - s) / e, this._x = .25 * e, this._y = (r + a) / e, this._z = (i + c) / e;
		} else if (o > u) {
			let e = 2 * Math.sqrt(1 + o - n - u);
			this._w = (i - c) / e, this._x = (r + a) / e, this._y = .25 * e, this._z = (s + l) / e;
		} else {
			let e = 2 * Math.sqrt(1 + u - n - o);
			this._w = (a - r) / e, this._x = (i + c) / e, this._y = (s + l) / e, this._z = .25 * e;
		}
		return this._onChangeCallback(), this;
	}
	setFromUnitVectors(e, t) {
		let n = e.dot(t) + 1;
		return n < 2 ** -52 ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
	}
	angleTo(e) {
		return 2 * Math.acos(Math.abs(je(this.dot(e), -1, 1)));
	}
	rotateTowards(e, t) {
		let n = this.angleTo(e);
		if (n === 0) return this;
		let r = Math.min(1, t / n);
		return this.slerp(e, r), this;
	}
	identity() {
		return this.set(0, 0, 0, 1);
	}
	invert() {
		return this.conjugate();
	}
	conjugate() {
		return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
	}
	dot(e) {
		return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
	}
	lengthSq() {
		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
	}
	length() {
		return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
	}
	normalize() {
		let e = this.length();
		return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x *= e, this._y *= e, this._z *= e, this._w *= e), this._onChangeCallback(), this;
	}
	multiply(e) {
		return this.multiplyQuaternions(this, e);
	}
	premultiply(e) {
		return this.multiplyQuaternions(e, this);
	}
	multiplyQuaternions(e, t) {
		let n = e._x, r = e._y, i = e._z, a = e._w, o = t._x, s = t._y, c = t._z, l = t._w;
		return this._x = n * l + a * o + r * c - i * s, this._y = r * l + a * s + i * o - n * c, this._z = i * l + a * c + n * s - r * o, this._w = a * l - n * o - r * s - i * c, this._onChangeCallback(), this;
	}
	slerp(e, t) {
		if (t === 0) return this;
		if (t === 1) return this.copy(e);
		let n = this._x, r = this._y, i = this._z, a = this._w, o = a * e._w + n * e._x + r * e._y + i * e._z;
		if (o < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, o = -o) : this.copy(e), o >= 1) return this._w = a, this._x = n, this._y = r, this._z = i, this;
		let s = 1 - o * o;
		if (s <= 2 ** -52) {
			let e = 1 - t;
			return this._w = e * a + t * this._w, this._x = e * n + t * this._x, this._y = e * r + t * this._y, this._z = e * i + t * this._z, this.normalize(), this;
		}
		let c = Math.sqrt(s), l = Math.atan2(c, o), u = Math.sin((1 - t) * l) / c, d = Math.sin(t * l) / c;
		return this._w = a * u + this._w * d, this._x = n * u + this._x * d, this._y = r * u + this._y * d, this._z = i * u + this._z * d, this._onChangeCallback(), this;
	}
	slerpQuaternions(e, t, n) {
		return this.copy(e).slerp(t, n);
	}
	random() {
		let e = Math.random(), t = Math.sqrt(1 - e), n = Math.sqrt(e), r = 2 * Math.PI * Math.random(), i = 2 * Math.PI * Math.random();
		return this.set(t * Math.cos(r), n * Math.sin(i), n * Math.cos(i), t * Math.sin(r));
	}
	equals(e) {
		return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
	}
	fromArray(e, t = 0) {
		return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
	}
	fromBufferAttribute(e, t) {
		return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
	}
	toJSON() {
		return this.toArray();
	}
	_onChange(e) {
		return this._onChangeCallback = e, this;
	}
	_onChangeCallback() {}
	*[Symbol.iterator]() {
		yield this._x, yield this._y, yield this._z, yield this._w;
	}
}, Y = class e {
	constructor(t = 0, n = 0, r = 0) {
		e.prototype.isVector3 = !0, this.x = t, this.y = n, this.z = r;
	}
	set(e, t, n) {
		return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this;
	}
	setScalar(e) {
		return this.x = e, this.y = e, this.z = e, this;
	}
	setX(e) {
		return this.x = e, this;
	}
	setY(e) {
		return this.y = e, this;
	}
	setZ(e) {
		return this.z = e, this;
	}
	setComponent(e, t) {
		switch (e) {
			case 0:
				this.x = t;
				break;
			case 1:
				this.y = t;
				break;
			case 2:
				this.z = t;
				break;
			default: throw Error("index is out of range: " + e);
		}
		return this;
	}
	getComponent(e) {
		switch (e) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw Error("index is out of range: " + e);
		}
	}
	clone() {
		return new this.constructor(this.x, this.y, this.z);
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this.z = e.z, this;
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this.z += e.z, this;
	}
	addScalar(e) {
		return this.x += e, this.y += e, this.z += e, this;
	}
	addVectors(e, t) {
		return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
	}
	addScaledVector(e, t) {
		return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
	}
	subScalar(e) {
		return this.x -= e, this.y -= e, this.z -= e, this;
	}
	subVectors(e, t) {
		return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
	}
	multiply(e) {
		return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
	}
	multiplyScalar(e) {
		return this.x *= e, this.y *= e, this.z *= e, this;
	}
	multiplyVectors(e, t) {
		return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
	}
	applyEuler(e) {
		return this.applyQuaternion(Tt.setFromEuler(e));
	}
	applyAxisAngle(e, t) {
		return this.applyQuaternion(Tt.setFromAxisAngle(e, t));
	}
	applyMatrix3(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements;
		return this.x = i[0] * t + i[3] * n + i[6] * r, this.y = i[1] * t + i[4] * n + i[7] * r, this.z = i[2] * t + i[5] * n + i[8] * r, this;
	}
	applyNormalMatrix(e) {
		return this.applyMatrix3(e).normalize();
	}
	applyMatrix4(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements, a = 1 / (i[3] * t + i[7] * n + i[11] * r + i[15]);
		return this.x = (i[0] * t + i[4] * n + i[8] * r + i[12]) * a, this.y = (i[1] * t + i[5] * n + i[9] * r + i[13]) * a, this.z = (i[2] * t + i[6] * n + i[10] * r + i[14]) * a, this;
	}
	applyQuaternion(e) {
		let t = this.x, n = this.y, r = this.z, i = e.x, a = e.y, o = e.z, s = e.w, c = 2 * (a * r - o * n), l = 2 * (o * t - i * r), u = 2 * (i * n - a * t);
		return this.x = t + s * c + a * u - o * l, this.y = n + s * l + o * c - i * u, this.z = r + s * u + i * l - a * c, this;
	}
	project(e) {
		return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
	}
	unproject(e) {
		return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
	}
	transformDirection(e) {
		let t = this.x, n = this.y, r = this.z, i = e.elements;
		return this.x = i[0] * t + i[4] * n + i[8] * r, this.y = i[1] * t + i[5] * n + i[9] * r, this.z = i[2] * t + i[6] * n + i[10] * r, this.normalize();
	}
	divide(e) {
		return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
	}
	divideScalar(e) {
		return this.multiplyScalar(1 / e);
	}
	min(e) {
		return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
	}
	max(e) {
		return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
	}
	clamp(e, t) {
		return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this;
	}
	clampScalar(e, t) {
		return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this;
	}
	clampLength(e, t) {
		let n = this.length();
		return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
	}
	floor() {
		return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
	}
	ceil() {
		return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
	}
	round() {
		return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
	}
	roundToZero() {
		return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
	}
	negate() {
		return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y + this.z * e.z;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
	}
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	setLength(e) {
		return this.normalize().multiplyScalar(e);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
	}
	lerpVectors(e, t, n) {
		return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this;
	}
	cross(e) {
		return this.crossVectors(this, e);
	}
	crossVectors(e, t) {
		let n = e.x, r = e.y, i = e.z, a = t.x, o = t.y, s = t.z;
		return this.x = r * s - i * o, this.y = i * a - n * s, this.z = n * o - r * a, this;
	}
	projectOnVector(e) {
		let t = e.lengthSq();
		if (t === 0) return this.set(0, 0, 0);
		let n = e.dot(this) / t;
		return this.copy(e).multiplyScalar(n);
	}
	projectOnPlane(e) {
		return wt.copy(this).projectOnVector(e), this.sub(wt);
	}
	reflect(e) {
		return this.sub(wt.copy(e).multiplyScalar(2 * this.dot(e)));
	}
	angleTo(e) {
		let t = Math.sqrt(this.lengthSq() * e.lengthSq());
		if (t === 0) return Math.PI / 2;
		let n = this.dot(e) / t;
		return Math.acos(je(n, -1, 1));
	}
	distanceTo(e) {
		return Math.sqrt(this.distanceToSquared(e));
	}
	distanceToSquared(e) {
		let t = this.x - e.x, n = this.y - e.y, r = this.z - e.z;
		return t * t + n * n + r * r;
	}
	manhattanDistanceTo(e) {
		return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
	}
	setFromSpherical(e) {
		return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
	}
	setFromSphericalCoords(e, t, n) {
		let r = Math.sin(t) * e;
		return this.x = r * Math.sin(n), this.y = Math.cos(t) * e, this.z = r * Math.cos(n), this;
	}
	setFromCylindrical(e) {
		return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
	}
	setFromCylindricalCoords(e, t, n) {
		return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this;
	}
	setFromMatrixPosition(e) {
		let t = e.elements;
		return this.x = t[12], this.y = t[13], this.z = t[14], this;
	}
	setFromMatrixScale(e) {
		let t = this.setFromMatrixColumn(e, 0).length(), n = this.setFromMatrixColumn(e, 1).length(), r = this.setFromMatrixColumn(e, 2).length();
		return this.x = t, this.y = n, this.z = r, this;
	}
	setFromMatrixColumn(e, t) {
		return this.fromArray(e.elements, t * 4);
	}
	setFromMatrix3Column(e, t) {
		return this.fromArray(e.elements, t * 3);
	}
	setFromEuler(e) {
		return this.x = e._x, this.y = e._y, this.z = e._z, this;
	}
	setFromColor(e) {
		return this.x = e.r, this.y = e.g, this.z = e.b, this;
	}
	equals(e) {
		return e.x === this.x && e.y === this.y && e.z === this.z;
	}
	fromArray(e, t = 0) {
		return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
	}
	fromBufferAttribute(e, t) {
		return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
	}
	random() {
		return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
	}
	randomDirection() {
		let e = (Math.random() - .5) * 2, t = Math.random() * Math.PI * 2, n = Math.sqrt(1 - e ** 2);
		return this.x = n * Math.cos(t), this.y = n * Math.sin(t), this.z = e, this;
	}
	*[Symbol.iterator]() {
		yield this.x, yield this.y, yield this.z;
	}
}, wt = /*@__PURE__*/ new Y(), Tt = /*@__PURE__*/ new Ct(), Et = class {
	constructor(e = new Y(Infinity, Infinity, Infinity), t = new Y(-Infinity, -Infinity, -Infinity)) {
		this.isBox3 = !0, this.min = e, this.max = t;
	}
	set(e, t) {
		return this.min.copy(e), this.max.copy(t), this;
	}
	setFromArray(e) {
		this.makeEmpty();
		for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint(Ot.fromArray(e, t));
		return this;
	}
	setFromBufferAttribute(e) {
		this.makeEmpty();
		for (let t = 0, n = e.count; t < n; t++) this.expandByPoint(Ot.fromBufferAttribute(e, t));
		return this;
	}
	setFromPoints(e) {
		this.makeEmpty();
		for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
		return this;
	}
	setFromCenterAndSize(e, t) {
		let n = Ot.copy(t).multiplyScalar(.5);
		return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
	}
	setFromObject(e, t = !1) {
		return this.makeEmpty(), this.expandByObject(e, t);
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.min.copy(e.min), this.max.copy(e.max), this;
	}
	makeEmpty() {
		return this.min.x = this.min.y = this.min.z = Infinity, this.max.x = this.max.y = this.max.z = -Infinity, this;
	}
	isEmpty() {
		return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
	}
	getCenter(e) {
		return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(.5);
	}
	getSize(e) {
		return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
	}
	expandByPoint(e) {
		return this.min.min(e), this.max.max(e), this;
	}
	expandByVector(e) {
		return this.min.sub(e), this.max.add(e), this;
	}
	expandByScalar(e) {
		return this.min.addScalar(-e), this.max.addScalar(e), this;
	}
	expandByObject(e, t = !1) {
		e.updateWorldMatrix(!1, !1);
		let n = e.geometry;
		if (n !== void 0) {
			let r = n.getAttribute("position");
			if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0) for (let t = 0, n = r.count; t < n; t++) e.isMesh === !0 ? e.getVertexPosition(t, Ot) : Ot.fromBufferAttribute(r, t), Ot.applyMatrix4(e.matrixWorld), this.expandByPoint(Ot);
			else e.boundingBox === void 0 ? (n.boundingBox === null && n.computeBoundingBox(), kt.copy(n.boundingBox)) : (e.boundingBox === null && e.computeBoundingBox(), kt.copy(e.boundingBox)), kt.applyMatrix4(e.matrixWorld), this.union(kt);
		}
		let r = e.children;
		for (let e = 0, n = r.length; e < n; e++) this.expandByObject(r[e], t);
		return this;
	}
	containsPoint(e) {
		return !(e.x < this.min.x || e.x > this.max.x || e.y < this.min.y || e.y > this.max.y || e.z < this.min.z || e.z > this.max.z);
	}
	containsBox(e) {
		return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
	}
	getParameter(e, t) {
		return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z));
	}
	intersectsBox(e) {
		return !(e.max.x < this.min.x || e.min.x > this.max.x || e.max.y < this.min.y || e.min.y > this.max.y || e.max.z < this.min.z || e.min.z > this.max.z);
	}
	intersectsSphere(e) {
		return this.clampPoint(e.center, Ot), Ot.distanceToSquared(e.center) <= e.radius * e.radius;
	}
	intersectsPlane(e) {
		let t, n;
		return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
	}
	intersectsTriangle(e) {
		if (this.isEmpty()) return !1;
		this.getCenter(It), Lt.subVectors(this.max, It), At.subVectors(e.a, It), jt.subVectors(e.b, It), Mt.subVectors(e.c, It), Nt.subVectors(jt, At), Pt.subVectors(Mt, jt), Ft.subVectors(At, Mt);
		let t = [
			0,
			-Nt.z,
			Nt.y,
			0,
			-Pt.z,
			Pt.y,
			0,
			-Ft.z,
			Ft.y,
			Nt.z,
			0,
			-Nt.x,
			Pt.z,
			0,
			-Pt.x,
			Ft.z,
			0,
			-Ft.x,
			-Nt.y,
			Nt.x,
			0,
			-Pt.y,
			Pt.x,
			0,
			-Ft.y,
			Ft.x,
			0
		];
		return !Bt(t, At, jt, Mt, Lt) || (t = [
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1
		], !Bt(t, At, jt, Mt, Lt)) ? !1 : (Rt.crossVectors(Nt, Pt), t = [
			Rt.x,
			Rt.y,
			Rt.z
		], Bt(t, At, jt, Mt, Lt));
	}
	clampPoint(e, t) {
		return t.copy(e).clamp(this.min, this.max);
	}
	distanceToPoint(e) {
		return this.clampPoint(e, Ot).distanceTo(e);
	}
	getBoundingSphere(e) {
		return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Ot).length() * .5), e;
	}
	intersect(e) {
		return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
	}
	union(e) {
		return this.min.min(e.min), this.max.max(e.max), this;
	}
	applyMatrix4(e) {
		return this.isEmpty() || (Dt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Dt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Dt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Dt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Dt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Dt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Dt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Dt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Dt)), this;
	}
	translate(e) {
		return this.min.add(e), this.max.add(e), this;
	}
	equals(e) {
		return e.min.equals(this.min) && e.max.equals(this.max);
	}
}, Dt = [
	/*@__PURE__*/ new Y(),
	/*@__PURE__*/ new Y(),
	/*@__PURE__*/ new Y(),
	/*@__PURE__*/ new Y(),
	/*@__PURE__*/ new Y(),
	/*@__PURE__*/ new Y(),
	/*@__PURE__*/ new Y(),
	/*@__PURE__*/ new Y()
], Ot = /*@__PURE__*/ new Y(), kt = /*@__PURE__*/ new Et(), At = /*@__PURE__*/ new Y(), jt = /*@__PURE__*/ new Y(), Mt = /*@__PURE__*/ new Y(), Nt = /*@__PURE__*/ new Y(), Pt = /*@__PURE__*/ new Y(), Ft = /*@__PURE__*/ new Y(), It = /*@__PURE__*/ new Y(), Lt = /*@__PURE__*/ new Y(), Rt = /*@__PURE__*/ new Y(), zt = /*@__PURE__*/ new Y();
function Bt(e, t, n, r, i) {
	for (let a = 0, o = e.length - 3; a <= o; a += 3) {
		zt.fromArray(e, a);
		let o = i.x * Math.abs(zt.x) + i.y * Math.abs(zt.y) + i.z * Math.abs(zt.z), s = t.dot(zt), c = n.dot(zt), l = r.dot(zt);
		if (Math.max(-Math.max(s, c, l), Math.min(s, c, l)) > o) return !1;
	}
	return !0;
}
var Vt = /*@__PURE__*/ new Et(), Ht = /*@__PURE__*/ new Y(), Ut = /*@__PURE__*/ new Y(), Wt = class {
	constructor(e = new Y(), t = -1) {
		this.isSphere = !0, this.center = e, this.radius = t;
	}
	set(e, t) {
		return this.center.copy(e), this.radius = t, this;
	}
	setFromPoints(e, t) {
		let n = this.center;
		t === void 0 ? Vt.setFromPoints(e).getCenter(n) : n.copy(t);
		let r = 0;
		for (let t = 0, i = e.length; t < i; t++) r = Math.max(r, n.distanceToSquared(e[t]));
		return this.radius = Math.sqrt(r), this;
	}
	copy(e) {
		return this.center.copy(e.center), this.radius = e.radius, this;
	}
	isEmpty() {
		return this.radius < 0;
	}
	makeEmpty() {
		return this.center.set(0, 0, 0), this.radius = -1, this;
	}
	containsPoint(e) {
		return e.distanceToSquared(this.center) <= this.radius * this.radius;
	}
	distanceToPoint(e) {
		return e.distanceTo(this.center) - this.radius;
	}
	intersectsSphere(e) {
		let t = this.radius + e.radius;
		return e.center.distanceToSquared(this.center) <= t * t;
	}
	intersectsBox(e) {
		return e.intersectsSphere(this);
	}
	intersectsPlane(e) {
		return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
	}
	clampPoint(e, t) {
		let n = this.center.distanceToSquared(e);
		return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
	}
	getBoundingBox(e) {
		return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
	}
	applyMatrix4(e) {
		return this.center.applyMatrix4(e), this.radius *= e.getMaxScaleOnAxis(), this;
	}
	translate(e) {
		return this.center.add(e), this;
	}
	expandByPoint(e) {
		if (this.isEmpty()) return this.center.copy(e), this.radius = 0, this;
		Ht.subVectors(e, this.center);
		let t = Ht.lengthSq();
		if (t > this.radius * this.radius) {
			let e = Math.sqrt(t), n = (e - this.radius) * .5;
			this.center.addScaledVector(Ht, n / e), this.radius += n;
		}
		return this;
	}
	union(e) {
		return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Ut.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(Ht.copy(e.center).add(Ut)), this.expandByPoint(Ht.copy(e.center).sub(Ut))), this);
	}
	equals(e) {
		return e.center.equals(this.center) && e.radius === this.radius;
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, Gt = /*@__PURE__*/ new Y(), Kt = /*@__PURE__*/ new Y(), qt = /*@__PURE__*/ new Y(), Jt = /*@__PURE__*/ new Y(), Yt = /*@__PURE__*/ new Y(), Xt = /*@__PURE__*/ new Y(), Zt = /*@__PURE__*/ new Y(), Qt = class {
	constructor(e = new Y(), t = new Y(0, 0, -1)) {
		this.origin = e, this.direction = t;
	}
	set(e, t) {
		return this.origin.copy(e), this.direction.copy(t), this;
	}
	copy(e) {
		return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
	}
	at(e, t) {
		return t.copy(this.origin).addScaledVector(this.direction, e);
	}
	lookAt(e) {
		return this.direction.copy(e).sub(this.origin).normalize(), this;
	}
	recast(e) {
		return this.origin.copy(this.at(e, Gt)), this;
	}
	closestPointToPoint(e, t) {
		t.subVectors(e, this.origin);
		let n = t.dot(this.direction);
		return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
	}
	distanceToPoint(e) {
		return Math.sqrt(this.distanceSqToPoint(e));
	}
	distanceSqToPoint(e) {
		let t = Gt.subVectors(e, this.origin).dot(this.direction);
		return t < 0 ? this.origin.distanceToSquared(e) : (Gt.copy(this.origin).addScaledVector(this.direction, t), Gt.distanceToSquared(e));
	}
	distanceSqToSegment(e, t, n, r) {
		Kt.copy(e).add(t).multiplyScalar(.5), qt.copy(t).sub(e).normalize(), Jt.copy(this.origin).sub(Kt);
		let i = e.distanceTo(t) * .5, a = -this.direction.dot(qt), o = Jt.dot(this.direction), s = -Jt.dot(qt), c = Jt.lengthSq(), l = Math.abs(1 - a * a), u, d, f, p;
		if (l > 0) {
			if (u = a * s - o, d = a * o - s, p = i * l, u >= 0) {
				if (d >= -p) {
					if (d <= p) {
						let e = 1 / l;
						u *= e, d *= e, f = u * (u + a * d + 2 * o) + d * (a * u + d + 2 * s) + c;
					} else d = i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
				} else d = -i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
			} else d <= -p ? (u = Math.max(0, -(-a * i + o)), d = u > 0 ? -i : Math.min(Math.max(-i, -s), i), f = -u * u + d * (d + 2 * s) + c) : d <= p ? (u = 0, d = Math.min(Math.max(-i, -s), i), f = d * (d + 2 * s) + c) : (u = Math.max(0, -(a * i + o)), d = u > 0 ? i : Math.min(Math.max(-i, -s), i), f = -u * u + d * (d + 2 * s) + c);
		} else d = a > 0 ? -i : i, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * s) + c;
		return n && n.copy(this.origin).addScaledVector(this.direction, u), r && r.copy(Kt).addScaledVector(qt, d), f;
	}
	intersectSphere(e, t) {
		Gt.subVectors(e.center, this.origin);
		let n = Gt.dot(this.direction), r = Gt.dot(Gt) - n * n, i = e.radius * e.radius;
		if (r > i) return null;
		let a = Math.sqrt(i - r), o = n - a, s = n + a;
		return s < 0 ? null : o < 0 ? this.at(s, t) : this.at(o, t);
	}
	intersectsSphere(e) {
		return this.distanceSqToPoint(e.center) <= e.radius * e.radius;
	}
	distanceToPlane(e) {
		let t = e.normal.dot(this.direction);
		if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
		let n = -(this.origin.dot(e.normal) + e.constant) / t;
		return n >= 0 ? n : null;
	}
	intersectPlane(e, t) {
		let n = this.distanceToPlane(e);
		return n === null ? null : this.at(n, t);
	}
	intersectsPlane(e) {
		let t = e.distanceToPoint(this.origin);
		return t === 0 || e.normal.dot(this.direction) * t < 0;
	}
	intersectBox(e, t) {
		let n, r, i, a, o, s, c = 1 / this.direction.x, l = 1 / this.direction.y, u = 1 / this.direction.z, d = this.origin;
		return c >= 0 ? (n = (e.min.x - d.x) * c, r = (e.max.x - d.x) * c) : (n = (e.max.x - d.x) * c, r = (e.min.x - d.x) * c), l >= 0 ? (i = (e.min.y - d.y) * l, a = (e.max.y - d.y) * l) : (i = (e.max.y - d.y) * l, a = (e.min.y - d.y) * l), n > a || i > r || ((i > n || isNaN(n)) && (n = i), (a < r || isNaN(r)) && (r = a), u >= 0 ? (o = (e.min.z - d.z) * u, s = (e.max.z - d.z) * u) : (o = (e.max.z - d.z) * u, s = (e.min.z - d.z) * u), n > s || o > r) || ((o > n || n !== n) && (n = o), (s < r || r !== r) && (r = s), r < 0) ? null : this.at(n >= 0 ? n : r, t);
	}
	intersectsBox(e) {
		return this.intersectBox(e, Gt) !== null;
	}
	intersectTriangle(e, t, n, r, i) {
		Yt.subVectors(t, e), Xt.subVectors(n, e), Zt.crossVectors(Yt, Xt);
		let a = this.direction.dot(Zt), o;
		if (a > 0) {
			if (r) return null;
			o = 1;
		} else if (a < 0) o = -1, a = -a;
		else return null;
		Jt.subVectors(this.origin, e);
		let s = o * this.direction.dot(Xt.crossVectors(Jt, Xt));
		if (s < 0) return null;
		let c = o * this.direction.dot(Yt.cross(Jt));
		if (c < 0 || s + c > a) return null;
		let l = -o * Jt.dot(Zt);
		return l < 0 ? null : this.at(l / a, i);
	}
	applyMatrix4(e) {
		return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
	}
	equals(e) {
		return e.origin.equals(this.origin) && e.direction.equals(this.direction);
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, $t = class e {
	constructor(t, n, r, i, a, o, s, c, l, u, d, f, p, m, h, g) {
		e.prototype.isMatrix4 = !0, this.elements = [
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		], t !== void 0 && this.set(t, n, r, i, a, o, s, c, l, u, d, f, p, m, h, g);
	}
	set(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
		let g = this.elements;
		return g[0] = e, g[4] = t, g[8] = n, g[12] = r, g[1] = i, g[5] = a, g[9] = o, g[13] = s, g[2] = c, g[6] = l, g[10] = u, g[14] = d, g[3] = f, g[7] = p, g[11] = m, g[15] = h, this;
	}
	identity() {
		return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
	}
	clone() {
		return new e().fromArray(this.elements);
	}
	copy(e) {
		let t = this.elements, n = e.elements;
		return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this;
	}
	copyPosition(e) {
		let t = this.elements, n = e.elements;
		return t[12] = n[12], t[13] = n[13], t[14] = n[14], this;
	}
	setFromMatrix3(e) {
		let t = e.elements;
		return this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this;
	}
	extractBasis(e, t, n) {
		return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
	}
	makeBasis(e, t, n) {
		return this.set(e.x, t.x, n.x, 0, e.y, t.y, n.y, 0, e.z, t.z, n.z, 0, 0, 0, 0, 1), this;
	}
	extractRotation(e) {
		let t = this.elements, n = e.elements, r = 1 / en.setFromMatrixColumn(e, 0).length(), i = 1 / en.setFromMatrixColumn(e, 1).length(), a = 1 / en.setFromMatrixColumn(e, 2).length();
		return t[0] = n[0] * r, t[1] = n[1] * r, t[2] = n[2] * r, t[3] = 0, t[4] = n[4] * i, t[5] = n[5] * i, t[6] = n[6] * i, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
	}
	makeRotationFromEuler(e) {
		let t = this.elements, n = e.x, r = e.y, i = e.z, a = Math.cos(n), o = Math.sin(n), s = Math.cos(r), c = Math.sin(r), l = Math.cos(i), u = Math.sin(i);
		if (e.order === "XYZ") {
			let e = a * l, n = a * u, r = o * l, i = o * u;
			t[0] = s * l, t[4] = -s * u, t[8] = c, t[1] = n + r * c, t[5] = e - i * c, t[9] = -o * s, t[2] = i - e * c, t[6] = r + n * c, t[10] = a * s;
		} else if (e.order === "YXZ") {
			let e = s * l, n = s * u, r = c * l, i = c * u;
			t[0] = e + i * o, t[4] = r * o - n, t[8] = a * c, t[1] = a * u, t[5] = a * l, t[9] = -o, t[2] = n * o - r, t[6] = i + e * o, t[10] = a * s;
		} else if (e.order === "ZXY") {
			let e = s * l, n = s * u, r = c * l, i = c * u;
			t[0] = e - i * o, t[4] = -a * u, t[8] = r + n * o, t[1] = n + r * o, t[5] = a * l, t[9] = i - e * o, t[2] = -a * c, t[6] = o, t[10] = a * s;
		} else if (e.order === "ZYX") {
			let e = a * l, n = a * u, r = o * l, i = o * u;
			t[0] = s * l, t[4] = r * c - n, t[8] = e * c + i, t[1] = s * u, t[5] = i * c + e, t[9] = n * c - r, t[2] = -c, t[6] = o * s, t[10] = a * s;
		} else if (e.order === "YZX") {
			let e = a * s, n = a * c, r = o * s, i = o * c;
			t[0] = s * l, t[4] = i - e * u, t[8] = r * u + n, t[1] = u, t[5] = a * l, t[9] = -o * l, t[2] = -c * l, t[6] = n * u + r, t[10] = e - i * u;
		} else if (e.order === "XZY") {
			let e = a * s, n = a * c, r = o * s, i = o * c;
			t[0] = s * l, t[4] = -u, t[8] = c * l, t[1] = e * u + i, t[5] = a * l, t[9] = n * u - r, t[2] = r * u - n, t[6] = o * l, t[10] = i * u + e;
		}
		return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
	}
	makeRotationFromQuaternion(e) {
		return this.compose(nn, e, rn);
	}
	lookAt(e, t, n) {
		let r = this.elements;
		return sn.subVectors(e, t), sn.lengthSq() === 0 && (sn.z = 1), sn.normalize(), an.crossVectors(n, sn), an.lengthSq() === 0 && (Math.abs(n.z) === 1 ? sn.x += 1e-4 : sn.z += 1e-4, sn.normalize(), an.crossVectors(n, sn)), an.normalize(), on.crossVectors(sn, an), r[0] = an.x, r[4] = on.x, r[8] = sn.x, r[1] = an.y, r[5] = on.y, r[9] = sn.y, r[2] = an.z, r[6] = on.z, r[10] = sn.z, this;
	}
	multiply(e) {
		return this.multiplyMatrices(this, e);
	}
	premultiply(e) {
		return this.multiplyMatrices(e, this);
	}
	multiplyMatrices(e, t) {
		let n = e.elements, r = t.elements, i = this.elements, a = n[0], o = n[4], s = n[8], c = n[12], l = n[1], u = n[5], d = n[9], f = n[13], p = n[2], m = n[6], h = n[10], g = n[14], _ = n[3], v = n[7], y = n[11], b = n[15], x = r[0], S = r[4], C = r[8], w = r[12], T = r[1], E = r[5], D = r[9], O = r[13], k = r[2], A = r[6], j = r[10], M = r[14], ee = r[3], te = r[7], N = r[11], P = r[15];
		return i[0] = a * x + o * T + s * k + c * ee, i[4] = a * S + o * E + s * A + c * te, i[8] = a * C + o * D + s * j + c * N, i[12] = a * w + o * O + s * M + c * P, i[1] = l * x + u * T + d * k + f * ee, i[5] = l * S + u * E + d * A + f * te, i[9] = l * C + u * D + d * j + f * N, i[13] = l * w + u * O + d * M + f * P, i[2] = p * x + m * T + h * k + g * ee, i[6] = p * S + m * E + h * A + g * te, i[10] = p * C + m * D + h * j + g * N, i[14] = p * w + m * O + h * M + g * P, i[3] = _ * x + v * T + y * k + b * ee, i[7] = _ * S + v * E + y * A + b * te, i[11] = _ * C + v * D + y * j + b * N, i[15] = _ * w + v * O + y * M + b * P, this;
	}
	multiplyScalar(e) {
		let t = this.elements;
		return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
	}
	determinant() {
		let e = this.elements, t = e[0], n = e[4], r = e[8], i = e[12], a = e[1], o = e[5], s = e[9], c = e[13], l = e[2], u = e[6], d = e[10], f = e[14], p = e[3], m = e[7], h = e[11], g = e[15];
		return p * (+i * s * u - r * c * u - i * o * d + n * c * d + r * o * f - n * s * f) + m * (+t * s * f - t * c * d + i * a * d - r * a * f + r * c * l - i * s * l) + h * (+t * c * u - t * o * f - i * a * u + n * a * f + i * o * l - n * c * l) + g * (-r * o * l - t * s * u + t * o * d + r * a * u - n * a * d + n * s * l);
	}
	transpose() {
		let e = this.elements, t;
		return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
	}
	setPosition(e, t, n) {
		let r = this.elements;
		return e.isVector3 ? (r[12] = e.x, r[13] = e.y, r[14] = e.z) : (r[12] = e, r[13] = t, r[14] = n), this;
	}
	invert() {
		let e = this.elements, t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8], u = e[9], d = e[10], f = e[11], p = e[12], m = e[13], h = e[14], g = e[15], _ = u * h * c - m * d * c + m * s * f - o * h * f - u * s * g + o * d * g, v = p * d * c - l * h * c - p * s * f + a * h * f + l * s * g - a * d * g, y = l * m * c - p * u * c + p * o * f - a * m * f - l * o * g + a * u * g, b = p * u * s - l * m * s - p * o * d + a * m * d + l * o * h - a * u * h, x = t * _ + n * v + r * y + i * b;
		if (x === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		let S = 1 / x;
		return e[0] = _ * S, e[1] = (m * d * i - u * h * i - m * r * f + n * h * f + u * r * g - n * d * g) * S, e[2] = (o * h * i - m * s * i + m * r * c - n * h * c - o * r * g + n * s * g) * S, e[3] = (u * s * i - o * d * i - u * r * c + n * d * c + o * r * f - n * s * f) * S, e[4] = v * S, e[5] = (l * h * i - p * d * i + p * r * f - t * h * f - l * r * g + t * d * g) * S, e[6] = (p * s * i - a * h * i - p * r * c + t * h * c + a * r * g - t * s * g) * S, e[7] = (a * d * i - l * s * i + l * r * c - t * d * c - a * r * f + t * s * f) * S, e[8] = y * S, e[9] = (p * u * i - l * m * i - p * n * f + t * m * f + l * n * g - t * u * g) * S, e[10] = (a * m * i - p * o * i + p * n * c - t * m * c - a * n * g + t * o * g) * S, e[11] = (l * o * i - a * u * i - l * n * c + t * u * c + a * n * f - t * o * f) * S, e[12] = b * S, e[13] = (l * m * r - p * u * r + p * n * d - t * m * d - l * n * h + t * u * h) * S, e[14] = (p * o * r - a * m * r - p * n * s + t * m * s + a * n * h - t * o * h) * S, e[15] = (a * u * r - l * o * r + l * n * s - t * u * s - a * n * d + t * o * d) * S, this;
	}
	scale(e) {
		let t = this.elements, n = e.x, r = e.y, i = e.z;
		return t[0] *= n, t[4] *= r, t[8] *= i, t[1] *= n, t[5] *= r, t[9] *= i, t[2] *= n, t[6] *= r, t[10] *= i, t[3] *= n, t[7] *= r, t[11] *= i, this;
	}
	getMaxScaleOnAxis() {
		let e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], r = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
		return Math.sqrt(Math.max(t, n, r));
	}
	makeTranslation(e, t, n) {
		return e.isVector3 ? this.set(1, 0, 0, e.x, 0, 1, 0, e.y, 0, 0, 1, e.z, 0, 0, 0, 1) : this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, n, 0, 0, 0, 1), this;
	}
	makeRotationX(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(1, 0, 0, 0, 0, t, -n, 0, 0, n, t, 0, 0, 0, 0, 1), this;
	}
	makeRotationY(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, 0, n, 0, 0, 1, 0, 0, -n, 0, t, 0, 0, 0, 0, 1), this;
	}
	makeRotationZ(e) {
		let t = Math.cos(e), n = Math.sin(e);
		return this.set(t, -n, 0, 0, n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
	}
	makeRotationAxis(e, t) {
		let n = Math.cos(t), r = Math.sin(t), i = 1 - n, a = e.x, o = e.y, s = e.z, c = i * a, l = i * o;
		return this.set(c * a + n, c * o - r * s, c * s + r * o, 0, c * o + r * s, l * o + n, l * s - r * a, 0, c * s - r * o, l * s + r * a, i * s * s + n, 0, 0, 0, 0, 1), this;
	}
	makeScale(e, t, n) {
		return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this;
	}
	makeShear(e, t, n, r, i, a) {
		return this.set(1, n, i, 0, e, 1, a, 0, t, r, 1, 0, 0, 0, 0, 1), this;
	}
	compose(e, t, n) {
		let r = this.elements, i = t._x, a = t._y, o = t._z, s = t._w, c = i + i, l = a + a, u = o + o, d = i * c, f = i * l, p = i * u, m = a * l, h = a * u, g = o * u, _ = s * c, v = s * l, y = s * u, b = n.x, x = n.y, S = n.z;
		return r[0] = (1 - (m + g)) * b, r[1] = (f + y) * b, r[2] = (p - v) * b, r[3] = 0, r[4] = (f - y) * x, r[5] = (1 - (d + g)) * x, r[6] = (h + _) * x, r[7] = 0, r[8] = (p + v) * S, r[9] = (h - _) * S, r[10] = (1 - (d + m)) * S, r[11] = 0, r[12] = e.x, r[13] = e.y, r[14] = e.z, r[15] = 1, this;
	}
	decompose(e, t, n) {
		let r = this.elements, i = en.set(r[0], r[1], r[2]).length(), a = en.set(r[4], r[5], r[6]).length(), o = en.set(r[8], r[9], r[10]).length();
		this.determinant() < 0 && (i = -i), e.x = r[12], e.y = r[13], e.z = r[14], tn.copy(this);
		let s = 1 / i, c = 1 / a, l = 1 / o;
		return tn.elements[0] *= s, tn.elements[1] *= s, tn.elements[2] *= s, tn.elements[4] *= c, tn.elements[5] *= c, tn.elements[6] *= c, tn.elements[8] *= l, tn.elements[9] *= l, tn.elements[10] *= l, t.setFromRotationMatrix(tn), n.x = i, n.y = a, n.z = o, this;
	}
	makePerspective(e, t, n, r, i, a, o = Te) {
		let s = this.elements, c = 2 * i / (t - e), l = 2 * i / (n - r), u = (t + e) / (t - e), d = (n + r) / (n - r), f, p;
		if (o === 2e3) f = -(a + i) / (a - i), p = -2 * a * i / (a - i);
		else if (o === 2001) f = -a / (a - i), p = -a * i / (a - i);
		else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
		return s[0] = c, s[4] = 0, s[8] = u, s[12] = 0, s[1] = 0, s[5] = l, s[9] = d, s[13] = 0, s[2] = 0, s[6] = 0, s[10] = f, s[14] = p, s[3] = 0, s[7] = 0, s[11] = -1, s[15] = 0, this;
	}
	makeOrthographic(e, t, n, r, i, a, o = Te) {
		let s = this.elements, c = 1 / (t - e), l = 1 / (n - r), u = 1 / (a - i), d = (t + e) * c, f = (n + r) * l, p, m;
		if (o === 2e3) p = (a + i) * u, m = -2 * u;
		else if (o === 2001) p = i * u, m = -1 * u;
		else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
		return s[0] = 2 * c, s[4] = 0, s[8] = 0, s[12] = -d, s[1] = 0, s[5] = 2 * l, s[9] = 0, s[13] = -f, s[2] = 0, s[6] = 0, s[10] = m, s[14] = -p, s[3] = 0, s[7] = 0, s[11] = 0, s[15] = 1, this;
	}
	equals(e) {
		let t = this.elements, n = e.elements;
		for (let e = 0; e < 16; e++) if (t[e] !== n[e]) return !1;
		return !0;
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 16; n++) this.elements[n] = e[n + t];
		return this;
	}
	toArray(e = [], t = 0) {
		let n = this.elements;
		return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e;
	}
}, en = /*@__PURE__*/ new Y(), tn = /*@__PURE__*/ new $t(), nn = /*@__PURE__*/ new Y(0, 0, 0), rn = /*@__PURE__*/ new Y(1, 1, 1), an = /*@__PURE__*/ new Y(), on = /*@__PURE__*/ new Y(), sn = /*@__PURE__*/ new Y(), cn = /*@__PURE__*/ new $t(), ln = /*@__PURE__*/ new Ct(), un = class e {
	constructor(t = 0, n = 0, r = 0, i = e.DEFAULT_ORDER) {
		this.isEuler = !0, this._x = t, this._y = n, this._z = r, this._order = i;
	}
	get x() {
		return this._x;
	}
	set x(e) {
		this._x = e, this._onChangeCallback();
	}
	get y() {
		return this._y;
	}
	set y(e) {
		this._y = e, this._onChangeCallback();
	}
	get z() {
		return this._z;
	}
	set z(e) {
		this._z = e, this._onChangeCallback();
	}
	get order() {
		return this._order;
	}
	set order(e) {
		this._order = e, this._onChangeCallback();
	}
	set(e, t, n, r = this._order) {
		return this._x = e, this._y = t, this._z = n, this._order = r, this._onChangeCallback(), this;
	}
	clone() {
		return new this.constructor(this._x, this._y, this._z, this._order);
	}
	copy(e) {
		return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
	}
	setFromRotationMatrix(e, t = this._order, n = !0) {
		let r = e.elements, i = r[0], a = r[4], o = r[8], s = r[1], c = r[5], l = r[9], u = r[2], d = r[6], f = r[10];
		switch (t) {
			case "XYZ":
				this._y = Math.asin(je(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-l, f), this._z = Math.atan2(-a, i)) : (this._x = Math.atan2(d, c), this._z = 0);
				break;
			case "YXZ":
				this._x = Math.asin(-je(l, -1, 1)), Math.abs(l) < .9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(s, c)) : (this._y = Math.atan2(-u, i), this._z = 0);
				break;
			case "ZXY":
				this._x = Math.asin(je(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(s, i));
				break;
			case "ZYX":
				this._y = Math.asin(-je(u, -1, 1)), Math.abs(u) < .9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(s, i)) : (this._x = 0, this._z = Math.atan2(-a, c));
				break;
			case "YZX":
				this._z = Math.asin(je(s, -1, 1)), Math.abs(s) < .9999999 ? (this._x = Math.atan2(-l, c), this._y = Math.atan2(-u, i)) : (this._x = 0, this._y = Math.atan2(o, f));
				break;
			case "XZY":
				this._z = Math.asin(-je(a, -1, 1)), Math.abs(a) < .9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, i)) : (this._x = Math.atan2(-l, f), this._y = 0);
				break;
			default: console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
		}
		return this._order = t, n === !0 && this._onChangeCallback(), this;
	}
	setFromQuaternion(e, t, n) {
		return cn.makeRotationFromQuaternion(e), this.setFromRotationMatrix(cn, t, n);
	}
	setFromVector3(e, t = this._order) {
		return this.set(e.x, e.y, e.z, t);
	}
	reorder(e) {
		return ln.setFromEuler(this), this.setFromQuaternion(ln, e);
	}
	equals(e) {
		return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
	}
	fromArray(e) {
		return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
	}
	_onChange(e) {
		return this._onChangeCallback = e, this;
	}
	_onChangeCallback() {}
	*[Symbol.iterator]() {
		yield this._x, yield this._y, yield this._z, yield this._order;
	}
};
un.DEFAULT_ORDER = "XYZ";
var dn = class {
	constructor() {
		this.mask = 1;
	}
	set(e) {
		this.mask = 1 << e >>> 0;
	}
	enable(e) {
		this.mask |= 1 << e;
	}
	enableAll() {
		this.mask = -1;
	}
	toggle(e) {
		this.mask ^= 1 << e;
	}
	disable(e) {
		this.mask &= ~(1 << e);
	}
	disableAll() {
		this.mask = 0;
	}
	test(e) {
		return (this.mask & e.mask) !== 0;
	}
	isEnabled(e) {
		return !!(this.mask & 1 << e);
	}
}, fn = 0, pn = /*@__PURE__*/ new Y(), mn = /*@__PURE__*/ new Ct(), hn = /*@__PURE__*/ new $t(), gn = /*@__PURE__*/ new Y(), _n = /*@__PURE__*/ new Y(), vn = /*@__PURE__*/ new Y(), yn = /*@__PURE__*/ new Ct(), bn = /*@__PURE__*/ new Y(1, 0, 0), xn = /*@__PURE__*/ new Y(0, 1, 0), Sn = /*@__PURE__*/ new Y(0, 0, 1), Cn = { type: "added" }, wn = { type: "removed" }, Tn = class e extends G {
	constructor() {
		super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: fn++ }), this.uuid = Ae(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = e.DEFAULT_UP.clone();
		let t = new Y(), n = new un(), r = new Ct(), i = new Y(1, 1, 1);
		function a() {
			r.setFromEuler(n, !1);
		}
		function o() {
			n.setFromQuaternion(r, void 0, !1);
		}
		n._onChange(a), r._onChange(o), Object.defineProperties(this, {
			position: {
				configurable: !0,
				enumerable: !0,
				value: t
			},
			rotation: {
				configurable: !0,
				enumerable: !0,
				value: n
			},
			quaternion: {
				configurable: !0,
				enumerable: !0,
				value: r
			},
			scale: {
				configurable: !0,
				enumerable: !0,
				value: i
			},
			modelViewMatrix: { value: new $t() },
			normalMatrix: { value: new q() }
		}), this.matrix = new $t(), this.matrixWorld = new $t(), this.matrixAutoUpdate = e.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new dn(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
	}
	onBeforeShadow() {}
	onAfterShadow() {}
	onBeforeRender() {}
	onAfterRender() {}
	applyMatrix4(e) {
		this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
	}
	applyQuaternion(e) {
		return this.quaternion.premultiply(e), this;
	}
	setRotationFromAxisAngle(e, t) {
		this.quaternion.setFromAxisAngle(e, t);
	}
	setRotationFromEuler(e) {
		this.quaternion.setFromEuler(e, !0);
	}
	setRotationFromMatrix(e) {
		this.quaternion.setFromRotationMatrix(e);
	}
	setRotationFromQuaternion(e) {
		this.quaternion.copy(e);
	}
	rotateOnAxis(e, t) {
		return mn.setFromAxisAngle(e, t), this.quaternion.multiply(mn), this;
	}
	rotateOnWorldAxis(e, t) {
		return mn.setFromAxisAngle(e, t), this.quaternion.premultiply(mn), this;
	}
	rotateX(e) {
		return this.rotateOnAxis(bn, e);
	}
	rotateY(e) {
		return this.rotateOnAxis(xn, e);
	}
	rotateZ(e) {
		return this.rotateOnAxis(Sn, e);
	}
	translateOnAxis(e, t) {
		return pn.copy(e).applyQuaternion(this.quaternion), this.position.add(pn.multiplyScalar(t)), this;
	}
	translateX(e) {
		return this.translateOnAxis(bn, e);
	}
	translateY(e) {
		return this.translateOnAxis(xn, e);
	}
	translateZ(e) {
		return this.translateOnAxis(Sn, e);
	}
	localToWorld(e) {
		return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
	}
	worldToLocal(e) {
		return this.updateWorldMatrix(!0, !1), e.applyMatrix4(hn.copy(this.matrixWorld).invert());
	}
	lookAt(e, t, n) {
		e.isVector3 ? gn.copy(e) : gn.set(e, t, n);
		let r = this.parent;
		this.updateWorldMatrix(!0, !1), _n.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? hn.lookAt(_n, gn, this.up) : hn.lookAt(gn, _n, this.up), this.quaternion.setFromRotationMatrix(hn), r && (hn.extractRotation(r.matrixWorld), mn.setFromRotationMatrix(hn), this.quaternion.premultiply(mn.invert()));
	}
	add(e) {
		if (arguments.length > 1) {
			for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
			return this;
		}
		return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.parent !== null && e.parent.remove(e), e.parent = this, this.children.push(e), e.dispatchEvent(Cn)) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
	}
	remove(e) {
		if (arguments.length > 1) {
			for (let e = 0; e < arguments.length; e++) this.remove(arguments[e]);
			return this;
		}
		let t = this.children.indexOf(e);
		return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(wn)), this;
	}
	removeFromParent() {
		let e = this.parent;
		return e !== null && e.remove(this), this;
	}
	clear() {
		return this.remove(...this.children);
	}
	attach(e) {
		return this.updateWorldMatrix(!0, !1), hn.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), hn.multiply(e.parent.matrixWorld)), e.applyMatrix4(hn), this.add(e), e.updateWorldMatrix(!1, !0), this;
	}
	getObjectById(e) {
		return this.getObjectByProperty("id", e);
	}
	getObjectByName(e) {
		return this.getObjectByProperty("name", e);
	}
	getObjectByProperty(e, t) {
		if (this[e] === t) return this;
		for (let n = 0, r = this.children.length; n < r; n++) {
			let r = this.children[n].getObjectByProperty(e, t);
			if (r !== void 0) return r;
		}
	}
	getObjectsByProperty(e, t, n = []) {
		this[e] === t && n.push(this);
		let r = this.children;
		for (let i = 0, a = r.length; i < a; i++) r[i].getObjectsByProperty(e, t, n);
		return n;
	}
	getWorldPosition(e) {
		return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
	}
	getWorldQuaternion(e) {
		return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(_n, e, vn), e;
	}
	getWorldScale(e) {
		return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(_n, yn, e), e;
	}
	getWorldDirection(e) {
		this.updateWorldMatrix(!0, !1);
		let t = this.matrixWorld.elements;
		return e.set(t[8], t[9], t[10]).normalize();
	}
	raycast() {}
	traverse(e) {
		e(this);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) t[n].traverse(e);
	}
	traverseVisible(e) {
		if (this.visible === !1) return;
		e(this);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) t[n].traverseVisible(e);
	}
	traverseAncestors(e) {
		let t = this.parent;
		t !== null && (e(t), t.traverseAncestors(e));
	}
	updateMatrix() {
		this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
	}
	updateMatrixWorld(e) {
		this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), this.matrixWorldNeedsUpdate = !1, e = !0);
		let t = this.children;
		for (let n = 0, r = t.length; n < r; n++) {
			let r = t[n];
			(r.matrixWorldAutoUpdate === !0 || e === !0) && r.updateMatrixWorld(e);
		}
	}
	updateWorldMatrix(e, t) {
		let n = this.parent;
		if (e === !0 && n !== null && n.matrixWorldAutoUpdate === !0 && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), t === !0) {
			let e = this.children;
			for (let t = 0, n = e.length; t < n; t++) {
				let n = e[t];
				n.matrixWorldAutoUpdate === !0 && n.updateWorldMatrix(!1, !0);
			}
		}
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string", n = {};
		t && (e = {
			geometries: {},
			materials: {},
			textures: {},
			images: {},
			shapes: {},
			skeletons: {},
			animations: {},
			nodes: {}
		}, n.metadata = {
			version: 4.6,
			type: "Object",
			generator: "Object3D.toJSON"
		});
		let r = {};
		r.uuid = this.uuid, r.type = this.type, this.name !== "" && (r.name = this.name), this.castShadow === !0 && (r.castShadow = !0), this.receiveShadow === !0 && (r.receiveShadow = !0), this.visible === !1 && (r.visible = !1), this.frustumCulled === !1 && (r.frustumCulled = !1), this.renderOrder !== 0 && (r.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (r.userData = this.userData), r.layers = this.layers.mask, r.matrix = this.matrix.toArray(), r.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (r.matrixAutoUpdate = !1), this.isInstancedMesh && (r.type = "InstancedMesh", r.count = this.count, r.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (r.type = "BatchedMesh", r.perObjectFrustumCulled = this.perObjectFrustumCulled, r.sortObjects = this.sortObjects, r.drawRanges = this._drawRanges, r.reservedRanges = this._reservedRanges, r.visibility = this._visibility, r.active = this._active, r.bounds = this._bounds.map((e) => ({
			boxInitialized: e.boxInitialized,
			boxMin: e.box.min.toArray(),
			boxMax: e.box.max.toArray(),
			sphereInitialized: e.sphereInitialized,
			sphereRadius: e.sphere.radius,
			sphereCenter: e.sphere.center.toArray()
		})), r.maxGeometryCount = this._maxGeometryCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.geometryCount = this._geometryCount, r.matricesTexture = this._matricesTexture.toJSON(e), this.boundingSphere !== null && (r.boundingSphere = {
			center: r.boundingSphere.center.toArray(),
			radius: r.boundingSphere.radius
		}), this.boundingBox !== null && (r.boundingBox = {
			min: r.boundingBox.min.toArray(),
			max: r.boundingBox.max.toArray()
		}));
		function i(t, n) {
			return t[n.uuid] === void 0 && (t[n.uuid] = n.toJSON(e)), n.uuid;
		}
		if (this.isScene) this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(e).uuid);
		else if (this.isMesh || this.isLine || this.isPoints) {
			r.geometry = i(e.geometries, this.geometry);
			let t = this.geometry.parameters;
			if (t !== void 0 && t.shapes !== void 0) {
				let n = t.shapes;
				if (Array.isArray(n)) for (let t = 0, r = n.length; t < r; t++) {
					let r = n[t];
					i(e.shapes, r);
				}
				else i(e.shapes, n);
			}
		}
		if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (i(e.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0) {
			if (Array.isArray(this.material)) {
				let t = [];
				for (let n = 0, r = this.material.length; n < r; n++) t.push(i(e.materials, this.material[n]));
				r.material = t;
			} else r.material = i(e.materials, this.material);
		}
		if (this.children.length > 0) {
			r.children = [];
			for (let t = 0; t < this.children.length; t++) r.children.push(this.children[t].toJSON(e).object);
		}
		if (this.animations.length > 0) {
			r.animations = [];
			for (let t = 0; t < this.animations.length; t++) {
				let n = this.animations[t];
				r.animations.push(i(e.animations, n));
			}
		}
		if (t) {
			let t = a(e.geometries), r = a(e.materials), i = a(e.textures), o = a(e.images), s = a(e.shapes), c = a(e.skeletons), l = a(e.animations), u = a(e.nodes);
			t.length > 0 && (n.geometries = t), r.length > 0 && (n.materials = r), i.length > 0 && (n.textures = i), o.length > 0 && (n.images = o), s.length > 0 && (n.shapes = s), c.length > 0 && (n.skeletons = c), l.length > 0 && (n.animations = l), u.length > 0 && (n.nodes = u);
		}
		return n.object = r, n;
		function a(e) {
			let t = [];
			for (let n in e) {
				let r = e[n];
				delete r.metadata, t.push(r);
			}
			return t;
		}
	}
	clone(e) {
		return new this.constructor().copy(this, e);
	}
	copy(e, t = !0) {
		if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0) for (let t = 0; t < e.children.length; t++) {
			let n = e.children[t];
			this.add(n.clone());
		}
		return this;
	}
};
Tn.DEFAULT_UP = /*@__PURE__*/ new Y(0, 1, 0), Tn.DEFAULT_MATRIX_AUTO_UPDATE = !0, Tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
var En = /*@__PURE__*/ new Y(), Dn = /*@__PURE__*/ new Y(), On = /*@__PURE__*/ new Y(), kn = /*@__PURE__*/ new Y(), An = /*@__PURE__*/ new Y(), jn = /*@__PURE__*/ new Y(), Mn = /*@__PURE__*/ new Y(), Nn = /*@__PURE__*/ new Y(), Pn = /*@__PURE__*/ new Y(), Fn = /*@__PURE__*/ new Y(), In = class e {
	constructor(e = new Y(), t = new Y(), n = new Y()) {
		this.a = e, this.b = t, this.c = n;
	}
	static getNormal(e, t, n, r) {
		r.subVectors(n, t), En.subVectors(e, t), r.cross(En);
		let i = r.lengthSq();
		return i > 0 ? r.multiplyScalar(1 / Math.sqrt(i)) : r.set(0, 0, 0);
	}
	static getBarycoord(e, t, n, r, i) {
		En.subVectors(r, t), Dn.subVectors(n, t), On.subVectors(e, t);
		let a = En.dot(En), o = En.dot(Dn), s = En.dot(On), c = Dn.dot(Dn), l = Dn.dot(On), u = a * c - o * o;
		if (u === 0) return i.set(0, 0, 0), null;
		let d = 1 / u, f = (c * s - o * l) * d, p = (a * l - o * s) * d;
		return i.set(1 - f - p, p, f);
	}
	static containsPoint(e, t, n, r) {
		return this.getBarycoord(e, t, n, r, kn) !== null && kn.x >= 0 && kn.y >= 0 && kn.x + kn.y <= 1;
	}
	static getInterpolation(e, t, n, r, i, a, o, s) {
		return this.getBarycoord(e, t, n, r, kn) === null ? (s.x = 0, s.y = 0, "z" in s && (s.z = 0), "w" in s && (s.w = 0), null) : (s.setScalar(0), s.addScaledVector(i, kn.x), s.addScaledVector(a, kn.y), s.addScaledVector(o, kn.z), s);
	}
	static isFrontFacing(e, t, n, r) {
		return En.subVectors(n, t), Dn.subVectors(e, t), En.cross(Dn).dot(r) < 0;
	}
	set(e, t, n) {
		return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
	}
	setFromPointsAndIndices(e, t, n, r) {
		return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[r]), this;
	}
	setFromAttributeAndIndices(e, t, n, r) {
		return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, r), this;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
	}
	getArea() {
		return En.subVectors(this.c, this.b), Dn.subVectors(this.a, this.b), En.cross(Dn).length() * .5;
	}
	getMidpoint(e) {
		return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
	}
	getNormal(t) {
		return e.getNormal(this.a, this.b, this.c, t);
	}
	getPlane(e) {
		return e.setFromCoplanarPoints(this.a, this.b, this.c);
	}
	getBarycoord(t, n) {
		return e.getBarycoord(t, this.a, this.b, this.c, n);
	}
	getInterpolation(t, n, r, i, a) {
		return e.getInterpolation(t, this.a, this.b, this.c, n, r, i, a);
	}
	containsPoint(t) {
		return e.containsPoint(t, this.a, this.b, this.c);
	}
	isFrontFacing(t) {
		return e.isFrontFacing(this.a, this.b, this.c, t);
	}
	intersectsBox(e) {
		return e.intersectsTriangle(this);
	}
	closestPointToPoint(e, t) {
		let n = this.a, r = this.b, i = this.c, a, o;
		An.subVectors(r, n), jn.subVectors(i, n), Nn.subVectors(e, n);
		let s = An.dot(Nn), c = jn.dot(Nn);
		if (s <= 0 && c <= 0) return t.copy(n);
		Pn.subVectors(e, r);
		let l = An.dot(Pn), u = jn.dot(Pn);
		if (l >= 0 && u <= l) return t.copy(r);
		let d = s * u - l * c;
		if (d <= 0 && s >= 0 && l <= 0) return a = s / (s - l), t.copy(n).addScaledVector(An, a);
		Fn.subVectors(e, i);
		let f = An.dot(Fn), p = jn.dot(Fn);
		if (p >= 0 && f <= p) return t.copy(i);
		let m = f * c - s * p;
		if (m <= 0 && c >= 0 && p <= 0) return o = c / (c - p), t.copy(n).addScaledVector(jn, o);
		let h = l * p - f * u;
		if (h <= 0 && u - l >= 0 && f - p >= 0) return Mn.subVectors(i, r), o = (u - l) / (u - l + (f - p)), t.copy(r).addScaledVector(Mn, o);
		let g = 1 / (h + m + d);
		return a = m * g, o = d * g, t.copy(n).addScaledVector(An, a).addScaledVector(jn, o);
	}
	equals(e) {
		return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
	}
}, Ln = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
}, Rn = {
	h: 0,
	s: 0,
	l: 0
}, zn = {
	h: 0,
	s: 0,
	l: 0
};
function Bn(e, t, n) {
	return n < 0 && (n += 1), n > 1 && --n, n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * 6 * (2 / 3 - n) : e;
}
var X = class {
	constructor(e, t, n) {
		return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
	}
	set(e, t, n) {
		if (t === void 0 && n === void 0) {
			let t = e;
			t && t.isColor ? this.copy(t) : typeof t == "number" ? this.setHex(t) : typeof t == "string" && this.setStyle(t);
		} else this.setRGB(e, t, n);
		return this;
	}
	setScalar(e) {
		return this.r = e, this.g = e, this.b = e, this;
	}
	setHex(e, t = ge) {
		return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, J.toWorkingColorSpace(this, t), this;
	}
	setRGB(e, t, n, r = J.workingColorSpace) {
		return this.r = e, this.g = t, this.b = n, J.toWorkingColorSpace(this, r), this;
	}
	setHSL(e, t, n, r = J.workingColorSpace) {
		if (e = Me(e, 1), t = je(t, 0, 1), n = je(n, 0, 1), t === 0) this.r = this.g = this.b = n;
		else {
			let r = n <= .5 ? n * (1 + t) : n + t - n * t, i = 2 * n - r;
			this.r = Bn(i, r, e + 1 / 3), this.g = Bn(i, r, e), this.b = Bn(i, r, e - 1 / 3);
		}
		return J.toWorkingColorSpace(this, r), this;
	}
	setStyle(e, t = ge) {
		function n(t) {
			t !== void 0 && parseFloat(t) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
		}
		let r;
		if (r = /^(\w+)\(([^\)]*)\)/.exec(e)) {
			let i, a = r[1], o = r[2];
			switch (a) {
				case "rgb":
				case "rgba":
					if (i = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(i[4]), this.setRGB(Math.min(255, parseInt(i[1], 10)) / 255, Math.min(255, parseInt(i[2], 10)) / 255, Math.min(255, parseInt(i[3], 10)) / 255, t);
					if (i = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(i[4]), this.setRGB(Math.min(100, parseInt(i[1], 10)) / 100, Math.min(100, parseInt(i[2], 10)) / 100, Math.min(100, parseInt(i[3], 10)) / 100, t);
					break;
				case "hsl":
				case "hsla":
					if (i = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(i[4]), this.setHSL(parseFloat(i[1]) / 360, parseFloat(i[2]) / 100, parseFloat(i[3]) / 100, t);
					break;
				default: console.warn("THREE.Color: Unknown color model " + e);
			}
		} else if (r = /^\#([A-Fa-f\d]+)$/.exec(e)) {
			let n = r[1], i = n.length;
			if (i === 3) return this.setRGB(parseInt(n.charAt(0), 16) / 15, parseInt(n.charAt(1), 16) / 15, parseInt(n.charAt(2), 16) / 15, t);
			if (i === 6) return this.setHex(parseInt(n, 16), t);
			console.warn("THREE.Color: Invalid hex color " + e);
		} else if (e && e.length > 0) return this.setColorName(e, t);
		return this;
	}
	setColorName(e, t = ge) {
		let n = Ln[e.toLowerCase()];
		return n === void 0 ? console.warn("THREE.Color: Unknown color " + e) : this.setHex(n, t), this;
	}
	clone() {
		return new this.constructor(this.r, this.g, this.b);
	}
	copy(e) {
		return this.r = e.r, this.g = e.g, this.b = e.b, this;
	}
	copySRGBToLinear(e) {
		return this.r = lt(e.r), this.g = lt(e.g), this.b = lt(e.b), this;
	}
	copyLinearToSRGB(e) {
		return this.r = ut(e.r), this.g = ut(e.g), this.b = ut(e.b), this;
	}
	convertSRGBToLinear() {
		return this.copySRGBToLinear(this), this;
	}
	convertLinearToSRGB() {
		return this.copyLinearToSRGB(this), this;
	}
	getHex(e = ge) {
		return J.fromWorkingColorSpace(Vn.copy(this), e), Math.round(je(Vn.r * 255, 0, 255)) * 65536 + Math.round(je(Vn.g * 255, 0, 255)) * 256 + Math.round(je(Vn.b * 255, 0, 255));
	}
	getHexString(e = ge) {
		return ("000000" + this.getHex(e).toString(16)).slice(-6);
	}
	getHSL(e, t = J.workingColorSpace) {
		J.fromWorkingColorSpace(Vn.copy(this), t);
		let n = Vn.r, r = Vn.g, i = Vn.b, a = Math.max(n, r, i), o = Math.min(n, r, i), s, c, l = (o + a) / 2;
		if (o === a) s = 0, c = 0;
		else {
			let e = a - o;
			switch (c = l <= .5 ? e / (a + o) : e / (2 - a - o), a) {
				case n:
					s = (r - i) / e + (r < i ? 6 : 0);
					break;
				case r:
					s = (i - n) / e + 2;
					break;
				case i: s = (n - r) / e + 4;
			}
			s /= 6;
		}
		return e.h = s, e.s = c, e.l = l, e;
	}
	getRGB(e, t = J.workingColorSpace) {
		return J.fromWorkingColorSpace(Vn.copy(this), t), e.r = Vn.r, e.g = Vn.g, e.b = Vn.b, e;
	}
	getStyle(e = ge) {
		J.fromWorkingColorSpace(Vn.copy(this), e);
		let t = Vn.r, n = Vn.g, r = Vn.b;
		return e === "srgb" ? `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(r * 255)})` : `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`;
	}
	offsetHSL(e, t, n) {
		return this.getHSL(Rn), this.setHSL(Rn.h + e, Rn.s + t, Rn.l + n);
	}
	add(e) {
		return this.r += e.r, this.g += e.g, this.b += e.b, this;
	}
	addColors(e, t) {
		return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
	}
	addScalar(e) {
		return this.r += e, this.g += e, this.b += e, this;
	}
	sub(e) {
		return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
	}
	multiply(e) {
		return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
	}
	multiplyScalar(e) {
		return this.r *= e, this.g *= e, this.b *= e, this;
	}
	lerp(e, t) {
		return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
	}
	lerpColors(e, t, n) {
		return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
	}
	lerpHSL(e, t) {
		this.getHSL(Rn), e.getHSL(zn);
		let n = Fe(Rn.h, zn.h, t), r = Fe(Rn.s, zn.s, t), i = Fe(Rn.l, zn.l, t);
		return this.setHSL(n, r, i), this;
	}
	setFromVector3(e) {
		return this.r = e.x, this.g = e.y, this.b = e.z, this;
	}
	applyMatrix3(e) {
		let t = this.r, n = this.g, r = this.b, i = e.elements;
		return this.r = i[0] * t + i[3] * n + i[6] * r, this.g = i[1] * t + i[4] * n + i[7] * r, this.b = i[2] * t + i[5] * n + i[8] * r, this;
	}
	equals(e) {
		return e.r === this.r && e.g === this.g && e.b === this.b;
	}
	fromArray(e, t = 0) {
		return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
	}
	toArray(e = [], t = 0) {
		return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
	}
	fromBufferAttribute(e, t) {
		return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
	}
	toJSON() {
		return this.getHex();
	}
	*[Symbol.iterator]() {
		yield this.r, yield this.g, yield this.b;
	}
}, Vn = /*@__PURE__*/ new X();
X.NAMES = Ln;
var Hn = 0, Un = class extends G {
	constructor() {
		super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Hn++ }), this.uuid = Ae(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new X(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Se, this.stencilZFail = Se, this.stencilZPass = Se, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
	}
	get alphaTest() {
		return this._alphaTest;
	}
	set alphaTest(e) {
		this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
	}
	onBuild() {}
	onBeforeRender() {}
	onBeforeCompile() {}
	customProgramCacheKey() {
		return this.onBeforeCompile.toString();
	}
	setValues(e) {
		if (e !== void 0) for (let t in e) {
			let n = e[t];
			if (n === void 0) {
				console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
				continue;
			}
			let r = this[t];
			r === void 0 ? console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`) : r && r.isColor ? r.set(n) : r && r.isVector3 && n && n.isVector3 ? r.copy(n) : this[t] = n;
		}
	}
	toJSON(e) {
		let t = e === void 0 || typeof e == "string";
		t && (e = {
			textures: {},
			images: {}
		});
		let n = { metadata: {
			version: 4.6,
			type: "Material",
			generator: "Material.toJSON"
		} };
		n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== Infinity && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== 1 && (n.blending = this.blending), this.side !== 0 && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== 204 && (n.blendSrc = this.blendSrc), this.blendDst !== 205 && (n.blendDst = this.blendDst), this.blendEquation !== 100 && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== 3 && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== 519 && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== 7680 && (n.stencilFail = this.stencilFail), this.stencilZFail !== 7680 && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== 7680 && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
		function r(e) {
			let t = [];
			for (let n in e) {
				let r = e[n];
				delete r.metadata, t.push(r);
			}
			return t;
		}
		if (t) {
			let t = r(e.textures), i = r(e.images);
			t.length > 0 && (n.textures = t), i.length > 0 && (n.images = i);
		}
		return n;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
		let t = e.clippingPlanes, n = null;
		if (t !== null) {
			let e = t.length;
			n = Array(e);
			for (let r = 0; r !== e; ++r) n[r] = t[r].clone();
		}
		return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
}, Wn = class extends Un {
	constructor(e) {
		super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new X(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = 0, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
	}
}, Gn = /*@__PURE__*/ new Y(), Kn = /*@__PURE__*/ new K(), qn = class {
	constructor(e, t, n = !1) {
		if (Array.isArray(e)) throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");
		this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e === void 0 ? 0 : e.length / t, this.normalized = n, this.usage = Ce, this._updateRange = {
			offset: 0,
			count: -1
		}, this.updateRanges = [], this.gpuType = ce, this.version = 0;
	}
	onUploadCallback() {}
	set needsUpdate(e) {
		e === !0 && this.version++;
	}
	get updateRange() {
		return it("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."), this._updateRange;
	}
	setUsage(e) {
		return this.usage = e, this;
	}
	addUpdateRange(e, t) {
		this.updateRanges.push({
			start: e,
			count: t
		});
	}
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	copy(e) {
		return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
	}
	copyAt(e, t, n) {
		e *= this.itemSize, n *= t.itemSize;
		for (let r = 0, i = this.itemSize; r < i; r++) this.array[e + r] = t.array[n + r];
		return this;
	}
	copyArray(e) {
		return this.array.set(e), this;
	}
	applyMatrix3(e) {
		if (this.itemSize === 2) for (let t = 0, n = this.count; t < n; t++) Kn.fromBufferAttribute(this, t), Kn.applyMatrix3(e), this.setXY(t, Kn.x, Kn.y);
		else if (this.itemSize === 3) for (let t = 0, n = this.count; t < n; t++) Gn.fromBufferAttribute(this, t), Gn.applyMatrix3(e), this.setXYZ(t, Gn.x, Gn.y, Gn.z);
		return this;
	}
	applyMatrix4(e) {
		for (let t = 0, n = this.count; t < n; t++) Gn.fromBufferAttribute(this, t), Gn.applyMatrix4(e), this.setXYZ(t, Gn.x, Gn.y, Gn.z);
		return this;
	}
	applyNormalMatrix(e) {
		for (let t = 0, n = this.count; t < n; t++) Gn.fromBufferAttribute(this, t), Gn.applyNormalMatrix(e), this.setXYZ(t, Gn.x, Gn.y, Gn.z);
		return this;
	}
	transformDirection(e) {
		for (let t = 0, n = this.count; t < n; t++) Gn.fromBufferAttribute(this, t), Gn.transformDirection(e), this.setXYZ(t, Gn.x, Gn.y, Gn.z);
		return this;
	}
	set(e, t = 0) {
		return this.array.set(e, t), this;
	}
	getComponent(e, t) {
		let n = this.array[e * this.itemSize + t];
		return this.normalized && (n = Xe(n, this.array)), n;
	}
	setComponent(e, t, n) {
		return this.normalized && (n = Ze(n, this.array)), this.array[e * this.itemSize + t] = n, this;
	}
	getX(e) {
		let t = this.array[e * this.itemSize];
		return this.normalized && (t = Xe(t, this.array)), t;
	}
	setX(e, t) {
		return this.normalized && (t = Ze(t, this.array)), this.array[e * this.itemSize] = t, this;
	}
	getY(e) {
		let t = this.array[e * this.itemSize + 1];
		return this.normalized && (t = Xe(t, this.array)), t;
	}
	setY(e, t) {
		return this.normalized && (t = Ze(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
	}
	getZ(e) {
		let t = this.array[e * this.itemSize + 2];
		return this.normalized && (t = Xe(t, this.array)), t;
	}
	setZ(e, t) {
		return this.normalized && (t = Ze(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
	}
	getW(e) {
		let t = this.array[e * this.itemSize + 3];
		return this.normalized && (t = Xe(t, this.array)), t;
	}
	setW(e, t) {
		return this.normalized && (t = Ze(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
	}
	setXY(e, t, n) {
		return e *= this.itemSize, this.normalized && (t = Ze(t, this.array), n = Ze(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
	}
	setXYZ(e, t, n, r) {
		return e *= this.itemSize, this.normalized && (t = Ze(t, this.array), n = Ze(n, this.array), r = Ze(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this;
	}
	setXYZW(e, t, n, r, i) {
		return e *= this.itemSize, this.normalized && (t = Ze(t, this.array), n = Ze(n, this.array), r = Ze(r, this.array), i = Ze(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this.array[e + 3] = i, this;
	}
	onUpload(e) {
		return this.onUploadCallback = e, this;
	}
	clone() {
		return new this.constructor(this.array, this.itemSize).copy(this);
	}
	toJSON() {
		let e = {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.from(this.array),
			normalized: this.normalized
		};
		return this.name !== "" && (e.name = this.name), this.usage !== 35044 && (e.usage = this.usage), e;
	}
}, Jn = class extends qn {
	constructor(e, t, n) {
		super(new Uint16Array(e), t, n);
	}
}, Yn = class extends qn {
	constructor(e, t, n) {
		super(new Uint32Array(e), t, n);
	}
}, Xn = class extends qn {
	constructor(e, t, n) {
		super(new Float32Array(e), t, n);
	}
}, Zn = 0, Qn = /*@__PURE__*/ new $t(), $n = /*@__PURE__*/ new Tn(), er = /*@__PURE__*/ new Y(), tr = /*@__PURE__*/ new Et(), nr = /*@__PURE__*/ new Et(), rr = /*@__PURE__*/ new Y(), ir = class e extends G {
	constructor() {
		super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Zn++ }), this.uuid = Ae(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
			start: 0,
			count: Infinity
		}, this.userData = {};
	}
	getIndex() {
		return this.index;
	}
	setIndex(e) {
		return this.index = Array.isArray(e) ? new (et(e) ? Yn : Jn)(e, 1) : e, this;
	}
	getAttribute(e) {
		return this.attributes[e];
	}
	setAttribute(e, t) {
		return this.attributes[e] = t, this;
	}
	deleteAttribute(e) {
		return delete this.attributes[e], this;
	}
	hasAttribute(e) {
		return this.attributes[e] !== void 0;
	}
	addGroup(e, t, n = 0) {
		this.groups.push({
			start: e,
			count: t,
			materialIndex: n
		});
	}
	clearGroups() {
		this.groups = [];
	}
	setDrawRange(e, t) {
		this.drawRange.start = e, this.drawRange.count = t;
	}
	applyMatrix4(e) {
		let t = this.attributes.position;
		t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
		let n = this.attributes.normal;
		if (n !== void 0) {
			let t = new q().getNormalMatrix(e);
			n.applyNormalMatrix(t), n.needsUpdate = !0;
		}
		let r = this.attributes.tangent;
		return r !== void 0 && (r.transformDirection(e), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
	}
	applyQuaternion(e) {
		return Qn.makeRotationFromQuaternion(e), this.applyMatrix4(Qn), this;
	}
	rotateX(e) {
		return Qn.makeRotationX(e), this.applyMatrix4(Qn), this;
	}
	rotateY(e) {
		return Qn.makeRotationY(e), this.applyMatrix4(Qn), this;
	}
	rotateZ(e) {
		return Qn.makeRotationZ(e), this.applyMatrix4(Qn), this;
	}
	translate(e, t, n) {
		return Qn.makeTranslation(e, t, n), this.applyMatrix4(Qn), this;
	}
	scale(e, t, n) {
		return Qn.makeScale(e, t, n), this.applyMatrix4(Qn), this;
	}
	lookAt(e) {
		return $n.lookAt(e), $n.updateMatrix(), this.applyMatrix4($n.matrix), this;
	}
	center() {
		return this.computeBoundingBox(), this.boundingBox.getCenter(er).negate(), this.translate(er.x, er.y, er.z), this;
	}
	setFromPoints(e) {
		let t = [];
		for (let n = 0, r = e.length; n < r; n++) {
			let r = e[n];
			t.push(r.x, r.y, r.z || 0);
		}
		return this.setAttribute("position", new Xn(t, 3)), this;
	}
	computeBoundingBox() {
		this.boundingBox === null && (this.boundingBox = new Et());
		let e = this.attributes.position, t = this.morphAttributes.position;
		if (e && e.isGLBufferAttribute) console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set \"mesh.frustumCulled\" to \"false\".", this), this.boundingBox.set(new Y(-Infinity, -Infinity, -Infinity), new Y(Infinity, Infinity, Infinity));
		else {
			if (e !== void 0) {
				if (this.boundingBox.setFromBufferAttribute(e), t) for (let e = 0, n = t.length; e < n; e++) {
					let n = t[e];
					tr.setFromBufferAttribute(n), this.morphTargetsRelative ? (rr.addVectors(this.boundingBox.min, tr.min), this.boundingBox.expandByPoint(rr), rr.addVectors(this.boundingBox.max, tr.max), this.boundingBox.expandByPoint(rr)) : (this.boundingBox.expandByPoint(tr.min), this.boundingBox.expandByPoint(tr.max));
				}
			} else this.boundingBox.makeEmpty();
			(isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error("THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The \"position\" attribute is likely to have NaN values.", this);
		}
	}
	computeBoundingSphere() {
		this.boundingSphere === null && (this.boundingSphere = new Wt());
		let e = this.attributes.position, t = this.morphAttributes.position;
		if (e && e.isGLBufferAttribute) console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set \"mesh.frustumCulled\" to \"false\".", this), this.boundingSphere.set(new Y(), Infinity);
		else if (e) {
			let n = this.boundingSphere.center;
			if (tr.setFromBufferAttribute(e), t) for (let e = 0, n = t.length; e < n; e++) {
				let n = t[e];
				nr.setFromBufferAttribute(n), this.morphTargetsRelative ? (rr.addVectors(tr.min, nr.min), tr.expandByPoint(rr), rr.addVectors(tr.max, nr.max), tr.expandByPoint(rr)) : (tr.expandByPoint(nr.min), tr.expandByPoint(nr.max));
			}
			tr.getCenter(n);
			let r = 0;
			for (let t = 0, i = e.count; t < i; t++) rr.fromBufferAttribute(e, t), r = Math.max(r, n.distanceToSquared(rr));
			if (t) for (let i = 0, a = t.length; i < a; i++) {
				let a = t[i], o = this.morphTargetsRelative;
				for (let t = 0, i = a.count; t < i; t++) rr.fromBufferAttribute(a, t), o && (er.fromBufferAttribute(e, t), rr.add(er)), r = Math.max(r, n.distanceToSquared(rr));
			}
			this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && console.error("THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The \"position\" attribute is likely to have NaN values.", this);
		}
	}
	computeTangents() {
		let e = this.index, t = this.attributes;
		if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
			console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
			return;
		}
		let n = e.array, r = t.position.array, i = t.normal.array, a = t.uv.array, o = r.length / 3;
		this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new qn(new Float32Array(4 * o), 4));
		let s = this.getAttribute("tangent").array, c = [], l = [];
		for (let e = 0; e < o; e++) c[e] = new Y(), l[e] = new Y();
		let u = new Y(), d = new Y(), f = new Y(), p = new K(), m = new K(), h = new K(), g = new Y(), _ = new Y();
		function v(e, t, n) {
			u.fromArray(r, e * 3), d.fromArray(r, t * 3), f.fromArray(r, n * 3), p.fromArray(a, e * 2), m.fromArray(a, t * 2), h.fromArray(a, n * 2), d.sub(u), f.sub(u), m.sub(p), h.sub(p);
			let i = 1 / (m.x * h.y - h.x * m.y);
			isFinite(i) && (g.copy(d).multiplyScalar(h.y).addScaledVector(f, -m.y).multiplyScalar(i), _.copy(f).multiplyScalar(m.x).addScaledVector(d, -h.x).multiplyScalar(i), c[e].add(g), c[t].add(g), c[n].add(g), l[e].add(_), l[t].add(_), l[n].add(_));
		}
		let y = this.groups;
		y.length === 0 && (y = [{
			start: 0,
			count: n.length
		}]);
		for (let e = 0, t = y.length; e < t; ++e) {
			let t = y[e], r = t.start, i = t.count;
			for (let e = r, t = r + i; e < t; e += 3) v(n[e + 0], n[e + 1], n[e + 2]);
		}
		let b = new Y(), x = new Y(), S = new Y(), C = new Y();
		function w(e) {
			S.fromArray(i, e * 3), C.copy(S);
			let t = c[e];
			b.copy(t), b.sub(S.multiplyScalar(S.dot(t))).normalize(), x.crossVectors(C, t);
			let n = x.dot(l[e]) < 0 ? -1 : 1;
			s[e * 4] = b.x, s[e * 4 + 1] = b.y, s[e * 4 + 2] = b.z, s[e * 4 + 3] = n;
		}
		for (let e = 0, t = y.length; e < t; ++e) {
			let t = y[e], r = t.start, i = t.count;
			for (let e = r, t = r + i; e < t; e += 3) w(n[e + 0]), w(n[e + 1]), w(n[e + 2]);
		}
	}
	computeVertexNormals() {
		let e = this.index, t = this.getAttribute("position");
		if (t !== void 0) {
			let n = this.getAttribute("normal");
			if (n === void 0) n = new qn(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
			else for (let e = 0, t = n.count; e < t; e++) n.setXYZ(e, 0, 0, 0);
			let r = new Y(), i = new Y(), a = new Y(), o = new Y(), s = new Y(), c = new Y(), l = new Y(), u = new Y();
			if (e) for (let d = 0, f = e.count; d < f; d += 3) {
				let f = e.getX(d + 0), p = e.getX(d + 1), m = e.getX(d + 2);
				r.fromBufferAttribute(t, f), i.fromBufferAttribute(t, p), a.fromBufferAttribute(t, m), l.subVectors(a, i), u.subVectors(r, i), l.cross(u), o.fromBufferAttribute(n, f), s.fromBufferAttribute(n, p), c.fromBufferAttribute(n, m), o.add(l), s.add(l), c.add(l), n.setXYZ(f, o.x, o.y, o.z), n.setXYZ(p, s.x, s.y, s.z), n.setXYZ(m, c.x, c.y, c.z);
			}
			else for (let e = 0, o = t.count; e < o; e += 3) r.fromBufferAttribute(t, e + 0), i.fromBufferAttribute(t, e + 1), a.fromBufferAttribute(t, e + 2), l.subVectors(a, i), u.subVectors(r, i), l.cross(u), n.setXYZ(e + 0, l.x, l.y, l.z), n.setXYZ(e + 1, l.x, l.y, l.z), n.setXYZ(e + 2, l.x, l.y, l.z);
			this.normalizeNormals(), n.needsUpdate = !0;
		}
	}
	normalizeNormals() {
		let e = this.attributes.normal;
		for (let t = 0, n = e.count; t < n; t++) rr.fromBufferAttribute(e, t), rr.normalize(), e.setXYZ(t, rr.x, rr.y, rr.z);
	}
	toNonIndexed() {
		function t(e, t) {
			let n = e.array, r = e.itemSize, i = e.normalized, a = new n.constructor(t.length * r), o = 0, s = 0;
			for (let i = 0, c = t.length; i < c; i++) {
				o = e.isInterleavedBufferAttribute ? t[i] * e.data.stride + e.offset : t[i] * r;
				for (let e = 0; e < r; e++) a[s++] = n[o++];
			}
			return new qn(a, r, i);
		}
		if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
		let n = new e(), r = this.index.array, i = this.attributes;
		for (let e in i) {
			let a = i[e], o = t(a, r);
			n.setAttribute(e, o);
		}
		let a = this.morphAttributes;
		for (let e in a) {
			let i = [], o = a[e];
			for (let e = 0, n = o.length; e < n; e++) {
				let n = o[e], a = t(n, r);
				i.push(a);
			}
			n.morphAttributes[e] = i;
		}
		n.morphTargetsRelative = this.morphTargetsRelative;
		let o = this.groups;
		for (let e = 0, t = o.length; e < t; e++) {
			let t = o[e];
			n.addGroup(t.start, t.count, t.materialIndex);
		}
		return n;
	}
	toJSON() {
		let e = { metadata: {
			version: 4.6,
			type: "BufferGeometry",
			generator: "BufferGeometry.toJSON"
		} };
		if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
			let t = this.parameters;
			for (let n in t) t[n] !== void 0 && (e[n] = t[n]);
			return e;
		}
		e.data = { attributes: {} };
		let t = this.index;
		t !== null && (e.data.index = {
			type: t.array.constructor.name,
			array: Array.prototype.slice.call(t.array)
		});
		let n = this.attributes;
		for (let t in n) {
			let r = n[t];
			e.data.attributes[t] = r.toJSON(e.data);
		}
		let r = {}, i = !1;
		for (let t in this.morphAttributes) {
			let n = this.morphAttributes[t], a = [];
			for (let t = 0, r = n.length; t < r; t++) {
				let r = n[t];
				a.push(r.toJSON(e.data));
			}
			a.length > 0 && (r[t] = a, i = !0);
		}
		i && (e.data.morphAttributes = r, e.data.morphTargetsRelative = this.morphTargetsRelative);
		let a = this.groups;
		a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
		let o = this.boundingSphere;
		return o !== null && (e.data.boundingSphere = {
			center: o.center.toArray(),
			radius: o.radius
		}), e;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	copy(e) {
		this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
		let t = {};
		this.name = e.name;
		let n = e.index;
		n !== null && this.setIndex(n.clone(t));
		let r = e.attributes;
		for (let e in r) {
			let n = r[e];
			this.setAttribute(e, n.clone(t));
		}
		let i = e.morphAttributes;
		for (let e in i) {
			let n = [], r = i[e];
			for (let e = 0, i = r.length; e < i; e++) n.push(r[e].clone(t));
			this.morphAttributes[e] = n;
		}
		this.morphTargetsRelative = e.morphTargetsRelative;
		let a = e.groups;
		for (let e = 0, t = a.length; e < t; e++) {
			let t = a[e];
			this.addGroup(t.start, t.count, t.materialIndex);
		}
		let o = e.boundingBox;
		o !== null && (this.boundingBox = o.clone());
		let s = e.boundingSphere;
		return s !== null && (this.boundingSphere = s.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
	}
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
}, ar = /*@__PURE__*/ new $t(), or = /*@__PURE__*/ new Qt(), sr = /*@__PURE__*/ new Wt(), cr = /*@__PURE__*/ new Y(), lr = /*@__PURE__*/ new Y(), ur = /*@__PURE__*/ new Y(), dr = /*@__PURE__*/ new Y(), fr = /*@__PURE__*/ new Y(), pr = /*@__PURE__*/ new Y(), mr = /*@__PURE__*/ new K(), hr = /*@__PURE__*/ new K(), gr = /*@__PURE__*/ new K(), _r = /*@__PURE__*/ new Y(), vr = /*@__PURE__*/ new Y(), yr = /*@__PURE__*/ new Y(), br = /*@__PURE__*/ new Y(), xr = /*@__PURE__*/ new Y(), Sr = class extends Tn {
	constructor(e = new ir(), t = new Wn()) {
		super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.updateMorphTargets();
	}
	copy(e, t) {
		return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
	}
	updateMorphTargets() {
		let e = this.geometry.morphAttributes, t = Object.keys(e);
		if (t.length > 0) {
			let n = e[t[0]];
			if (n !== void 0) {
				this.morphTargetInfluences = [], this.morphTargetDictionary = {};
				for (let e = 0, t = n.length; e < t; e++) {
					let t = n[e].name || String(e);
					this.morphTargetInfluences.push(0), this.morphTargetDictionary[t] = e;
				}
			}
		}
	}
	getVertexPosition(e, t) {
		let n = this.geometry, r = n.attributes.position, i = n.morphAttributes.position, a = n.morphTargetsRelative;
		t.fromBufferAttribute(r, e);
		let o = this.morphTargetInfluences;
		if (i && o) {
			pr.set(0, 0, 0);
			for (let n = 0, r = i.length; n < r; n++) {
				let r = o[n], s = i[n];
				r !== 0 && (fr.fromBufferAttribute(s, e), a ? pr.addScaledVector(fr, r) : pr.addScaledVector(fr.sub(t), r));
			}
			t.add(pr);
		}
		return t;
	}
	raycast(e, t) {
		let n = this.geometry, r = this.material, i = this.matrixWorld;
		r !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), sr.copy(n.boundingSphere), sr.applyMatrix4(i), or.copy(e.ray).recast(e.near), sr.containsPoint(or.origin) === !1 && (or.intersectSphere(sr, cr) === null || or.origin.distanceToSquared(cr) > (e.far - e.near) ** 2) || (ar.copy(i).invert(), or.copy(e.ray).applyMatrix4(ar), (n.boundingBox === null || or.intersectsBox(n.boundingBox) !== !1) && this._computeIntersections(e, t, or)));
	}
	_computeIntersections(e, t, n) {
		let r, i = this.geometry, a = this.material, o = i.index, s = i.attributes.position, c = i.attributes.uv, l = i.attributes.uv1, u = i.attributes.normal, d = i.groups, f = i.drawRange;
		if (o !== null) {
			if (Array.isArray(a)) for (let i = 0, s = d.length; i < s; i++) {
				let s = d[i], p = a[s.materialIndex], m = Math.max(s.start, f.start), h = Math.min(o.count, Math.min(s.start + s.count, f.start + f.count));
				for (let i = m, a = h; i < a; i += 3) {
					let a = o.getX(i), d = o.getX(i + 1), f = o.getX(i + 2);
					r = wr(this, p, e, n, c, l, u, a, d, f), r && (r.faceIndex = Math.floor(i / 3), r.face.materialIndex = s.materialIndex, t.push(r));
				}
			}
			else {
				let i = Math.max(0, f.start), s = Math.min(o.count, f.start + f.count);
				for (let d = i, f = s; d < f; d += 3) {
					let i = o.getX(d), s = o.getX(d + 1), f = o.getX(d + 2);
					r = wr(this, a, e, n, c, l, u, i, s, f), r && (r.faceIndex = Math.floor(d / 3), t.push(r));
				}
			}
		} else if (s !== void 0) {
			if (Array.isArray(a)) for (let i = 0, o = d.length; i < o; i++) {
				let o = d[i], p = a[o.materialIndex], m = Math.max(o.start, f.start), h = Math.min(s.count, Math.min(o.start + o.count, f.start + f.count));
				for (let i = m, a = h; i < a; i += 3) {
					let a = i, s = i + 1, d = i + 2;
					r = wr(this, p, e, n, c, l, u, a, s, d), r && (r.faceIndex = Math.floor(i / 3), r.face.materialIndex = o.materialIndex, t.push(r));
				}
			}
			else {
				let i = Math.max(0, f.start), o = Math.min(s.count, f.start + f.count);
				for (let s = i, d = o; s < d; s += 3) {
					let i = s, o = s + 1, d = s + 2;
					r = wr(this, a, e, n, c, l, u, i, o, d), r && (r.faceIndex = Math.floor(s / 3), t.push(r));
				}
			}
		}
	}
};
function Cr(e, t, n, r, i, a, o, s) {
	let c;
	if (c = t.side === 1 ? r.intersectTriangle(o, a, i, !0, s) : r.intersectTriangle(i, a, o, t.side === 0, s), c === null) return null;
	xr.copy(s), xr.applyMatrix4(e.matrixWorld);
	let l = n.ray.origin.distanceTo(xr);
	return l < n.near || l > n.far ? null : {
		distance: l,
		point: xr.clone(),
		object: e
	};
}
function wr(e, t, n, r, i, a, o, s, c, l) {
	e.getVertexPosition(s, lr), e.getVertexPosition(c, ur), e.getVertexPosition(l, dr);
	let u = Cr(e, t, n, r, lr, ur, dr, br);
	if (u) {
		i && (mr.fromBufferAttribute(i, s), hr.fromBufferAttribute(i, c), gr.fromBufferAttribute(i, l), u.uv = In.getInterpolation(br, lr, ur, dr, mr, hr, gr, new K())), a && (mr.fromBufferAttribute(a, s), hr.fromBufferAttribute(a, c), gr.fromBufferAttribute(a, l), u.uv1 = In.getInterpolation(br, lr, ur, dr, mr, hr, gr, new K()), u.uv2 = u.uv1), o && (_r.fromBufferAttribute(o, s), vr.fromBufferAttribute(o, c), yr.fromBufferAttribute(o, l), u.normal = In.getInterpolation(br, lr, ur, dr, _r, vr, yr, new Y()), u.normal.dot(r.direction) > 0 && u.normal.multiplyScalar(-1));
		let e = {
			a: s,
			b: c,
			c: l,
			normal: new Y(),
			materialIndex: 0
		};
		In.getNormal(lr, ur, dr, e.normal), u.face = e;
	}
	return u;
}
var Tr = class e extends ir {
	constructor(e = 1, t = 1, n = 1, r = 1, i = 1, a = 1) {
		super(), this.type = "BoxGeometry", this.parameters = {
			width: e,
			height: t,
			depth: n,
			widthSegments: r,
			heightSegments: i,
			depthSegments: a
		};
		let o = this;
		r = Math.floor(r), i = Math.floor(i), a = Math.floor(a);
		let s = [], c = [], l = [], u = [], d = 0, f = 0;
		p("z", "y", "x", -1, -1, n, t, e, a, i, 0), p("z", "y", "x", 1, -1, n, t, -e, a, i, 1), p("x", "z", "y", 1, 1, e, n, t, r, a, 2), p("x", "z", "y", 1, -1, e, n, -t, r, a, 3), p("x", "y", "z", 1, -1, e, t, n, r, i, 4), p("x", "y", "z", -1, -1, e, t, -n, r, i, 5), this.setIndex(s), this.setAttribute("position", new Xn(c, 3)), this.setAttribute("normal", new Xn(l, 3)), this.setAttribute("uv", new Xn(u, 2));
		function p(e, t, n, r, i, a, p, m, h, g, _) {
			let v = a / h, y = p / g, b = a / 2, x = p / 2, S = m / 2, C = h + 1, w = g + 1, T = 0, E = 0, D = new Y();
			for (let a = 0; a < w; a++) {
				let o = a * y - x;
				for (let s = 0; s < C; s++) D[e] = (s * v - b) * r, D[t] = o * i, D[n] = S, c.push(D.x, D.y, D.z), D[e] = 0, D[t] = 0, D[n] = m > 0 ? 1 : -1, l.push(D.x, D.y, D.z), u.push(s / h), u.push(1 - a / g), T += 1;
			}
			for (let e = 0; e < g; e++) for (let t = 0; t < h; t++) {
				let n = d + t + C * e, r = d + t + C * (e + 1), i = d + (t + 1) + C * (e + 1), a = d + (t + 1) + C * e;
				s.push(n, r, a), s.push(r, i, a), E += 6;
			}
			o.addGroup(f, E, _), f += E, d += T;
		}
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
	}
};
function Er(e) {
	let t = {};
	for (let n in e) {
		t[n] = {};
		for (let r in e[n]) {
			let i = e[n][r];
			i && (i.isColor || i.isMatrix3 || i.isMatrix4 || i.isVector2 || i.isVector3 || i.isVector4 || i.isTexture || i.isQuaternion) ? i.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[n][r] = null) : t[n][r] = i.clone() : Array.isArray(i) ? t[n][r] = i.slice() : t[n][r] = i;
		}
	}
	return t;
}
function Dr(e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = Er(e[n]);
		for (let e in r) t[e] = r[e];
	}
	return t;
}
function Or(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) t.push(e[n].clone());
	return t;
}
function kr(e) {
	return e.getRenderTarget() === null ? e.outputColorSpace : J.workingColorSpace;
}
var Ar = {
	clone: Er,
	merge: Dr
}, jr = "void main() {\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}", Mr = "void main() {\n	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}", Nr = class extends Un {
	constructor(e) {
		super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = jr, this.fragmentShader = Mr, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
			derivatives: !1,
			fragDepth: !1,
			drawBuffers: !1,
			shaderTextureLOD: !1,
			clipCullDistance: !1,
			multiDraw: !1
		}, this.defaultAttributeValues = {
			color: [
				1,
				1,
				1
			],
			uv: [0, 0],
			uv1: [0, 0]
		}, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Er(e.uniforms), this.uniformsGroups = Or(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		t.glslVersion = this.glslVersion, t.uniforms = {};
		for (let n in this.uniforms) {
			let r = this.uniforms[n].value;
			r && r.isTexture ? t.uniforms[n] = {
				type: "t",
				value: r.toJSON(e).uuid
			} : r && r.isColor ? t.uniforms[n] = {
				type: "c",
				value: r.getHex()
			} : r && r.isVector2 ? t.uniforms[n] = {
				type: "v2",
				value: r.toArray()
			} : r && r.isVector3 ? t.uniforms[n] = {
				type: "v3",
				value: r.toArray()
			} : r && r.isVector4 ? t.uniforms[n] = {
				type: "v4",
				value: r.toArray()
			} : r && r.isMatrix3 ? t.uniforms[n] = {
				type: "m3",
				value: r.toArray()
			} : r && r.isMatrix4 ? t.uniforms[n] = {
				type: "m4",
				value: r.toArray()
			} : t.uniforms[n] = { value: r };
		}
		Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
		let n = {};
		for (let e in this.extensions) this.extensions[e] === !0 && (n[e] = !0);
		return Object.keys(n).length > 0 && (t.extensions = n), t;
	}
}, Pr = class extends Tn {
	constructor() {
		super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new $t(), this.projectionMatrix = new $t(), this.projectionMatrixInverse = new $t(), this.coordinateSystem = Te;
	}
	copy(e, t) {
		return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
	}
	getWorldDirection(e) {
		return super.getWorldDirection(e).negate();
	}
	updateMatrixWorld(e) {
		super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
	}
	updateWorldMatrix(e, t) {
		super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, Fr = /*@__PURE__*/ new Y(), Ir = /*@__PURE__*/ new K(), Lr = /*@__PURE__*/ new K(), Rr = class extends Pr {
	constructor(e = 50, t = 1, n = .1, r = 2e3) {
		super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = r, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
	}
	copy(e, t) {
		return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
	}
	setFocalLength(e) {
		let t = .5 * this.getFilmHeight() / e;
		this.fov = ke * 2 * Math.atan(t), this.updateProjectionMatrix();
	}
	getFocalLength() {
		let e = Math.tan(Oe * .5 * this.fov);
		return .5 * this.getFilmHeight() / e;
	}
	getEffectiveFOV() {
		return ke * 2 * Math.atan(Math.tan(Oe * .5 * this.fov) / this.zoom);
	}
	getFilmWidth() {
		return this.filmGauge * Math.min(this.aspect, 1);
	}
	getFilmHeight() {
		return this.filmGauge / Math.max(this.aspect, 1);
	}
	getViewBounds(e, t, n) {
		Fr.set(-1, -1, .5).applyMatrix4(this.projectionMatrixInverse), t.set(Fr.x, Fr.y).multiplyScalar(-e / Fr.z), Fr.set(1, 1, .5).applyMatrix4(this.projectionMatrixInverse), n.set(Fr.x, Fr.y).multiplyScalar(-e / Fr.z);
	}
	getViewSize(e, t) {
		return this.getViewBounds(e, Ir, Lr), t.subVectors(Lr, Ir);
	}
	setViewOffset(e, t, n, r, i, a) {
		this.aspect = e / t, this.view === null && (this.view = {
			enabled: !0,
			fullWidth: 1,
			fullHeight: 1,
			offsetX: 0,
			offsetY: 0,
			width: 1,
			height: 1
		}), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = i, this.view.height = a, this.updateProjectionMatrix();
	}
	clearViewOffset() {
		this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
	}
	updateProjectionMatrix() {
		let e = this.near, t = e * Math.tan(Oe * .5 * this.fov) / this.zoom, n = 2 * t, r = this.aspect * n, i = -.5 * r, a = this.view;
		if (this.view !== null && this.view.enabled) {
			let e = a.fullWidth, o = a.fullHeight;
			i += a.offsetX * r / e, t -= a.offsetY * n / o, r *= a.width / e, n *= a.height / o;
		}
		let o = this.filmOffset;
		o !== 0 && (i += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(i, i + r, t, t - n, e, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
	}
}, zr = -90, Br = 1, Vr = class extends Tn {
	constructor(e, t, n) {
		super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
		let r = new Rr(zr, Br, e, t);
		r.layers = this.layers, this.add(r);
		let i = new Rr(zr, Br, e, t);
		i.layers = this.layers, this.add(i);
		let a = new Rr(zr, Br, e, t);
		a.layers = this.layers, this.add(a);
		let o = new Rr(zr, Br, e, t);
		o.layers = this.layers, this.add(o);
		let s = new Rr(zr, Br, e, t);
		s.layers = this.layers, this.add(s);
		let c = new Rr(zr, Br, e, t);
		c.layers = this.layers, this.add(c);
	}
	updateCoordinateSystem() {
		let e = this.coordinateSystem, t = this.children.concat(), [n, r, i, a, o, s] = t;
		for (let e of t) this.remove(e);
		if (e === 2e3) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), i.up.set(0, 0, -1), i.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), s.up.set(0, 1, 0), s.lookAt(0, 0, -1);
		else if (e === 2001) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), r.up.set(0, -1, 0), r.lookAt(1, 0, 0), i.up.set(0, 0, 1), i.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), s.up.set(0, -1, 0), s.lookAt(0, 0, -1);
		else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
		for (let e of t) this.add(e), e.updateMatrixWorld();
	}
	update(e, t) {
		this.parent === null && this.updateMatrixWorld();
		let { renderTarget: n, activeMipmapLevel: r } = this;
		this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
		let [i, a, o, s, c, l] = this.children, u = e.getRenderTarget(), d = e.getActiveCubeFace(), f = e.getActiveMipmapLevel(), p = e.xr.enabled;
		e.xr.enabled = !1;
		let m = n.texture.generateMipmaps;
		n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, r), e.render(t, i), e.setRenderTarget(n, 1, r), e.render(t, a), e.setRenderTarget(n, 2, r), e.render(t, o), e.setRenderTarget(n, 3, r), e.render(t, s), e.setRenderTarget(n, 4, r), e.render(t, c), n.texture.generateMipmaps = m, e.setRenderTarget(n, 5, r), e.render(t, l), e.setRenderTarget(u, d, f), e.xr.enabled = p, n.texture.needsPMREMUpdate = !0;
	}
}, Hr = class extends _t {
	constructor(e, t, n, r, i, a, o, s, c, l) {
		e = e === void 0 ? [] : e, t = t === void 0 ? 301 : t, super(e, t, n, r, i, a, o, s, c, l), this.isCubeTexture = !0, this.flipY = !1;
	}
	get images() {
		return this.image;
	}
	set images(e) {
		this.image = e;
	}
}, Ur = class extends bt {
	constructor(e = 1, t = {}) {
		super(e, e, t), this.isWebGLCubeRenderTarget = !0;
		let n = {
			width: e,
			height: e,
			depth: 1
		}, r = [
			n,
			n,
			n,
			n,
			n,
			n
		];
		t.encoding !== void 0 && (it("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."), t.colorSpace = t.encoding === 3001 ? ge : ""), this.texture = new Hr(r, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 && t.generateMipmaps, this.texture.minFilter = t.minFilter === void 0 ? ie : t.minFilter;
	}
	fromEquirectangularTexture(e, t) {
		this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
		let n = {
			uniforms: { tEquirect: { value: null } },
			vertexShader: "\n\n				varying vec3 vWorldDirection;\n\n				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\n					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n\n				}\n\n				void main() {\n\n					vWorldDirection = transformDirection( position, modelMatrix );\n\n					#include <begin_vertex>\n					#include <project_vertex>\n\n				}\n			",
			fragmentShader: "\n\n				uniform sampler2D tEquirect;\n\n				varying vec3 vWorldDirection;\n\n				#include <common>\n\n				void main() {\n\n					vec3 direction = normalize( vWorldDirection );\n\n					vec2 sampleUV = equirectUv( direction );\n\n					gl_FragColor = texture2D( tEquirect, sampleUV );\n\n				}\n			"
		}, r = new Tr(5, 5, 5), i = new Nr({
			name: "CubemapFromEquirect",
			uniforms: Er(n.uniforms),
			vertexShader: n.vertexShader,
			fragmentShader: n.fragmentShader,
			side: 1,
			blending: 0
		});
		i.uniforms.tEquirect.value = t;
		let a = new Sr(r, i), o = t.minFilter;
		return t.minFilter === 1008 && (t.minFilter = ie), new Vr(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
	}
	clear(e, t, n, r) {
		let i = e.getRenderTarget();
		for (let i = 0; i < 6; i++) e.setRenderTarget(this, i), e.clear(t, n, r);
		e.setRenderTarget(i);
	}
}, Wr = /*@__PURE__*/ new Y(), Gr = /*@__PURE__*/ new Y(), Kr = /*@__PURE__*/ new q(), qr = class {
	constructor(e = new Y(1, 0, 0), t = 0) {
		this.isPlane = !0, this.normal = e, this.constant = t;
	}
	set(e, t) {
		return this.normal.copy(e), this.constant = t, this;
	}
	setComponents(e, t, n, r) {
		return this.normal.set(e, t, n), this.constant = r, this;
	}
	setFromNormalAndCoplanarPoint(e, t) {
		return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
	}
	setFromCoplanarPoints(e, t, n) {
		let r = Wr.subVectors(n, t).cross(Gr.subVectors(e, t)).normalize();
		return this.setFromNormalAndCoplanarPoint(r, e), this;
	}
	copy(e) {
		return this.normal.copy(e.normal), this.constant = e.constant, this;
	}
	normalize() {
		let e = 1 / this.normal.length();
		return this.normal.multiplyScalar(e), this.constant *= e, this;
	}
	negate() {
		return this.constant *= -1, this.normal.negate(), this;
	}
	distanceToPoint(e) {
		return this.normal.dot(e) + this.constant;
	}
	distanceToSphere(e) {
		return this.distanceToPoint(e.center) - e.radius;
	}
	projectPoint(e, t) {
		return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
	}
	intersectLine(e, t) {
		let n = e.delta(Wr), r = this.normal.dot(n);
		if (r === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
		let i = -(e.start.dot(this.normal) + this.constant) / r;
		return i < 0 || i > 1 ? null : t.copy(e.start).addScaledVector(n, i);
	}
	intersectsLine(e) {
		let t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
		return t < 0 && n > 0 || n < 0 && t > 0;
	}
	intersectsBox(e) {
		return e.intersectsPlane(this);
	}
	intersectsSphere(e) {
		return e.intersectsPlane(this);
	}
	coplanarPoint(e) {
		return e.copy(this.normal).multiplyScalar(-this.constant);
	}
	applyMatrix4(e, t) {
		let n = t || Kr.getNormalMatrix(e), r = this.coplanarPoint(Wr).applyMatrix4(e), i = this.normal.applyMatrix3(n).normalize();
		return this.constant = -r.dot(i), this;
	}
	translate(e) {
		return this.constant -= e.dot(this.normal), this;
	}
	equals(e) {
		return e.normal.equals(this.normal) && e.constant === this.constant;
	}
	clone() {
		return new this.constructor().copy(this);
	}
}, Jr = /*@__PURE__*/ new Wt(), Yr = /*@__PURE__*/ new Y(), Xr = class {
	constructor(e = new qr(), t = new qr(), n = new qr(), r = new qr(), i = new qr(), a = new qr()) {
		this.planes = [
			e,
			t,
			n,
			r,
			i,
			a
		];
	}
	set(e, t, n, r, i, a) {
		let o = this.planes;
		return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(r), o[4].copy(i), o[5].copy(a), this;
	}
	copy(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
		return this;
	}
	setFromProjectionMatrix(e, t = Te) {
		let n = this.planes, r = e.elements, i = r[0], a = r[1], o = r[2], s = r[3], c = r[4], l = r[5], u = r[6], d = r[7], f = r[8], p = r[9], m = r[10], h = r[11], g = r[12], _ = r[13], v = r[14], y = r[15];
		if (n[0].setComponents(s - i, d - c, h - f, y - g).normalize(), n[1].setComponents(s + i, d + c, h + f, y + g).normalize(), n[2].setComponents(s + a, d + l, h + p, y + _).normalize(), n[3].setComponents(s - a, d - l, h - p, y - _).normalize(), n[4].setComponents(s - o, d - u, h - m, y - v).normalize(), t === 2e3) n[5].setComponents(s + o, d + u, h + m, y + v).normalize();
		else if (t === 2001) n[5].setComponents(o, u, m, v).normalize();
		else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
		return this;
	}
	intersectsObject(e) {
		if (e.boundingSphere !== void 0) e.boundingSphere === null && e.computeBoundingSphere(), Jr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
		else {
			let t = e.geometry;
			t.boundingSphere === null && t.computeBoundingSphere(), Jr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
		}
		return this.intersectsSphere(Jr);
	}
	intersectsSprite(e) {
		return Jr.center.set(0, 0, 0), Jr.radius = .7071067811865476, Jr.applyMatrix4(e.matrixWorld), this.intersectsSphere(Jr);
	}
	intersectsSphere(e) {
		let t = this.planes, n = e.center, r = -e.radius;
		for (let e = 0; e < 6; e++) if (t[e].distanceToPoint(n) < r) return !1;
		return !0;
	}
	intersectsBox(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) {
			let r = t[n];
			if (Yr.x = r.normal.x > 0 ? e.max.x : e.min.x, Yr.y = r.normal.y > 0 ? e.max.y : e.min.y, Yr.z = r.normal.z > 0 ? e.max.z : e.min.z, r.distanceToPoint(Yr) < 0) return !1;
		}
		return !0;
	}
	containsPoint(e) {
		let t = this.planes;
		for (let n = 0; n < 6; n++) if (t[n].distanceToPoint(e) < 0) return !1;
		return !0;
	}
	clone() {
		return new this.constructor().copy(this);
	}
};
function Zr() {
	let e = null, t = !1, n = null, r = null;
	function i(t, a) {
		n(t, a), r = e.requestAnimationFrame(i);
	}
	return {
		start: function() {
			t !== !0 && n !== null && (r = e.requestAnimationFrame(i), t = !0);
		},
		stop: function() {
			e.cancelAnimationFrame(r), t = !1;
		},
		setAnimationLoop: function(e) {
			n = e;
		},
		setContext: function(t) {
			e = t;
		}
	};
}
function Qr(e, t) {
	let n = t.isWebGL2, r = /* @__PURE__ */ new WeakMap();
	function i(t, r) {
		let i = t.array, a = t.usage, o = i.byteLength, s = e.createBuffer();
		e.bindBuffer(r, s), e.bufferData(r, i, a), t.onUploadCallback();
		let c;
		if (i instanceof Float32Array) c = e.FLOAT;
		else if (i instanceof Uint16Array) {
			if (t.isFloat16BufferAttribute) {
				if (n) c = e.HALF_FLOAT;
				else throw Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");
			} else c = e.UNSIGNED_SHORT;
		} else if (i instanceof Int16Array) c = e.SHORT;
		else if (i instanceof Uint32Array) c = e.UNSIGNED_INT;
		else if (i instanceof Int32Array) c = e.INT;
		else if (i instanceof Int8Array) c = e.BYTE;
		else if (i instanceof Uint8Array) c = e.UNSIGNED_BYTE;
		else if (i instanceof Uint8ClampedArray) c = e.UNSIGNED_BYTE;
		else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: " + i);
		return {
			buffer: s,
			type: c,
			bytesPerElement: i.BYTES_PER_ELEMENT,
			version: t.version,
			size: o
		};
	}
	function a(t, r, i) {
		let a = r.array, o = r._updateRange, s = r.updateRanges;
		if (e.bindBuffer(i, t), o.count === -1 && s.length === 0 && e.bufferSubData(i, 0, a), s.length !== 0) {
			for (let t = 0, r = s.length; t < r; t++) {
				let r = s[t];
				n ? e.bufferSubData(i, r.start * a.BYTES_PER_ELEMENT, a, r.start, r.count) : e.bufferSubData(i, r.start * a.BYTES_PER_ELEMENT, a.subarray(r.start, r.start + r.count));
			}
			r.clearUpdateRanges();
		}
		o.count !== -1 && (n ? e.bufferSubData(i, o.offset * a.BYTES_PER_ELEMENT, a, o.offset, o.count) : e.bufferSubData(i, o.offset * a.BYTES_PER_ELEMENT, a.subarray(o.offset, o.offset + o.count)), o.count = -1), r.onUploadCallback();
	}
	function o(e) {
		return e.isInterleavedBufferAttribute && (e = e.data), r.get(e);
	}
	function s(t) {
		t.isInterleavedBufferAttribute && (t = t.data);
		let n = r.get(t);
		n && (e.deleteBuffer(n.buffer), r.delete(t));
	}
	function c(e, t) {
		if (e.isGLBufferAttribute) {
			let t = r.get(e);
			(!t || t.version < e.version) && r.set(e, {
				buffer: e.buffer,
				type: e.type,
				bytesPerElement: e.elementSize,
				version: e.version
			});
			return;
		}
		e.isInterleavedBufferAttribute && (e = e.data);
		let n = r.get(e);
		if (n === void 0) r.set(e, i(e, t));
		else if (n.version < e.version) {
			if (n.size !== e.array.byteLength) throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
			a(n.buffer, e, t), n.version = e.version;
		}
	}
	return {
		get: o,
		remove: s,
		update: c
	};
}
var $r = class e extends ir {
	constructor(e = 1, t = 1, n = 1, r = 1) {
		super(), this.type = "PlaneGeometry", this.parameters = {
			width: e,
			height: t,
			widthSegments: n,
			heightSegments: r
		};
		let i = e / 2, a = t / 2, o = Math.floor(n), s = Math.floor(r), c = o + 1, l = s + 1, u = e / o, d = t / s, f = [], p = [], m = [], h = [];
		for (let e = 0; e < l; e++) {
			let t = e * d - a;
			for (let n = 0; n < c; n++) {
				let r = n * u - i;
				p.push(r, -t, 0), m.push(0, 0, 1), h.push(n / o), h.push(1 - e / s);
			}
		}
		for (let e = 0; e < s; e++) for (let t = 0; t < o; t++) {
			let n = t + c * e, r = t + c * (e + 1), i = t + 1 + c * (e + 1), a = t + 1 + c * e;
			f.push(n, r, a), f.push(r, i, a);
		}
		this.setIndex(f), this.setAttribute("position", new Xn(p, 3)), this.setAttribute("normal", new Xn(m, 3)), this.setAttribute("uv", new Xn(h, 2));
	}
	copy(e) {
		return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
	}
	static fromJSON(t) {
		return new e(t.width, t.height, t.widthSegments, t.heightSegments);
	}
}, Z = {
	alphahash_fragment: "#ifdef USE_ALPHAHASH\n	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;\n#endif",
	alphahash_pars_fragment: "#ifdef USE_ALPHAHASH\n	const float ALPHA_HASH_SCALE = 0.05;\n	float hash2D( vec2 value ) {\n		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );\n	}\n	float hash3D( vec3 value ) {\n		return hash2D( vec2( hash2D( value.xy ), value.z ) );\n	}\n	float getAlphaHashThreshold( vec3 position ) {\n		float maxDeriv = max(\n			length( dFdx( position.xyz ) ),\n			length( dFdy( position.xyz ) )\n		);\n		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );\n		vec2 pixScales = vec2(\n			exp2( floor( log2( pixScale ) ) ),\n			exp2( ceil( log2( pixScale ) ) )\n		);\n		vec2 alpha = vec2(\n			hash3D( floor( pixScales.x * position.xyz ) ),\n			hash3D( floor( pixScales.y * position.xyz ) )\n		);\n		float lerpFactor = fract( log2( pixScale ) );\n		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;\n		float a = min( lerpFactor, 1.0 - lerpFactor );\n		vec3 cases = vec3(\n			x * x / ( 2.0 * a * ( 1.0 - a ) ),\n			( x - 0.5 * a ) / ( 1.0 - a ),\n			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )\n		);\n		float threshold = ( x < ( 1.0 - a ) )\n			? ( ( x < a ) ? cases.x : cases.y )\n			: cases.z;\n		return clamp( threshold , 1.0e-6, 1.0 );\n	}\n#endif",
	alphamap_fragment: "#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;\n#endif",
	alphamap_pars_fragment: "#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif",
	alphatest_fragment: "#ifdef USE_ALPHATEST\n	#ifdef ALPHA_TO_COVERAGE\n	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );\n	if ( diffuseColor.a == 0.0 ) discard;\n	#else\n	if ( diffuseColor.a < alphaTest ) discard;\n	#endif\n#endif",
	alphatest_pars_fragment: "#ifdef USE_ALPHATEST\n	uniform float alphaTest;\n#endif",
	aomap_fragment: "#ifdef USE_AOMAP\n	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;\n	reflectedLight.indirectDiffuse *= ambientOcclusion;\n	#if defined( USE_CLEARCOAT ) \n		clearcoatSpecularIndirect *= ambientOcclusion;\n	#endif\n	#if defined( USE_SHEEN ) \n		sheenSpecularIndirect *= ambientOcclusion;\n	#endif\n	#if defined( USE_ENVMAP ) && defined( STANDARD )\n		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );\n		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );\n	#endif\n#endif",
	aomap_pars_fragment: "#ifdef USE_AOMAP\n	uniform sampler2D aoMap;\n	uniform float aoMapIntensity;\n#endif",
	batching_pars_vertex: "#ifdef USE_BATCHING\n	attribute float batchId;\n	uniform highp sampler2D batchingTexture;\n	mat4 getBatchingMatrix( const in float i ) {\n		int size = textureSize( batchingTexture, 0 ).x;\n		int j = int( i ) * 4;\n		int x = j % size;\n		int y = j / size;\n		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );\n		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );\n		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );\n		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );\n		return mat4( v1, v2, v3, v4 );\n	}\n#endif",
	batching_vertex: "#ifdef USE_BATCHING\n	mat4 batchingMatrix = getBatchingMatrix( batchId );\n#endif",
	begin_vertex: "vec3 transformed = vec3( position );\n#ifdef USE_ALPHAHASH\n	vPosition = vec3( position );\n#endif",
	beginnormal_vertex: "vec3 objectNormal = vec3( normal );\n#ifdef USE_TANGENT\n	vec3 objectTangent = vec3( tangent.xyz );\n#endif",
	bsdfs: "float G_BlinnPhong_Implicit( ) {\n	return 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotVH = saturate( dot( viewDir, halfDir ) );\n	vec3 F = F_Schlick( specularColor, 1.0, dotVH );\n	float G = G_BlinnPhong_Implicit( );\n	float D = D_BlinnPhong( shininess, dotNH );\n	return F * ( G * D );\n} // validated",
	iridescence_fragment: "#ifdef USE_IRIDESCENCE\n	const mat3 XYZ_TO_REC709 = mat3(\n		 3.2404542, -0.9692660,  0.0556434,\n		-1.5371385,  1.8760108, -0.2040259,\n		-0.4985314,  0.0415560,  1.0572252\n	);\n	vec3 Fresnel0ToIor( vec3 fresnel0 ) {\n		vec3 sqrtF0 = sqrt( fresnel0 );\n		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );\n	}\n	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {\n		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );\n	}\n	float IorToFresnel0( float transmittedIor, float incidentIor ) {\n		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));\n	}\n	vec3 evalSensitivity( float OPD, vec3 shift ) {\n		float phase = 2.0 * PI * OPD * 1.0e-9;\n		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );\n		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );\n		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );\n		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );\n		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );\n		xyz /= 1.0685e-7;\n		vec3 rgb = XYZ_TO_REC709 * xyz;\n		return rgb;\n	}\n	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {\n		vec3 I;\n		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );\n		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );\n		float cosTheta2Sq = 1.0 - sinTheta2Sq;\n		if ( cosTheta2Sq < 0.0 ) {\n			return vec3( 1.0 );\n		}\n		float cosTheta2 = sqrt( cosTheta2Sq );\n		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );\n		float R12 = F_Schlick( R0, 1.0, cosTheta1 );\n		float T121 = 1.0 - R12;\n		float phi12 = 0.0;\n		if ( iridescenceIOR < outsideIOR ) phi12 = PI;\n		float phi21 = PI - phi12;\n		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );\n		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );\n		vec3 phi23 = vec3( 0.0 );\n		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;\n		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;\n		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;\n		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;\n		vec3 phi = vec3( phi21 ) + phi23;\n		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );\n		vec3 r123 = sqrt( R123 );\n		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );\n		vec3 C0 = R12 + Rs;\n		I = C0;\n		vec3 Cm = Rs - T121;\n		for ( int m = 1; m <= 2; ++ m ) {\n			Cm *= r123;\n			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );\n			I += Cm * Sm;\n		}\n		return max( I, vec3( 0.0 ) );\n	}\n#endif",
	bumpmap_pars_fragment: "#ifdef USE_BUMPMAP\n	uniform sampler2D bumpMap;\n	uniform float bumpScale;\n	vec2 dHdxy_fwd() {\n		vec2 dSTdx = dFdx( vBumpMapUv );\n		vec2 dSTdy = dFdy( vBumpMapUv );\n		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;\n		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;\n		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;\n		return vec2( dBx, dBy );\n	}\n	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {\n		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );\n		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );\n		vec3 vN = surf_norm;\n		vec3 R1 = cross( vSigmaY, vN );\n		vec3 R2 = cross( vN, vSigmaX );\n		float fDet = dot( vSigmaX, R1 ) * faceDirection;\n		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n		return normalize( abs( fDet ) * surf_norm - vGrad );\n	}\n#endif",
	clipping_planes_fragment: "#if NUM_CLIPPING_PLANES > 0\n	vec4 plane;\n	#ifdef ALPHA_TO_COVERAGE\n		float distanceToPlane, distanceGradient;\n		float clipOpacity = 1.0;\n		#pragma unroll_loop_start\n		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n			plane = clippingPlanes[ i ];\n			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;\n			distanceGradient = fwidth( distanceToPlane ) / 2.0;\n			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );\n			if ( clipOpacity == 0.0 ) discard;\n		}\n		#pragma unroll_loop_end\n		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n			float unionClipOpacity = 1.0;\n			#pragma unroll_loop_start\n			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n				plane = clippingPlanes[ i ];\n				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;\n				distanceGradient = fwidth( distanceToPlane ) / 2.0;\n				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );\n			}\n			#pragma unroll_loop_end\n			clipOpacity *= 1.0 - unionClipOpacity;\n		#endif\n		diffuseColor.a *= clipOpacity;\n		if ( diffuseColor.a == 0.0 ) discard;\n	#else\n		#pragma unroll_loop_start\n		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n			plane = clippingPlanes[ i ];\n			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;\n		}\n		#pragma unroll_loop_end\n		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n			bool clipped = true;\n			#pragma unroll_loop_start\n			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n				plane = clippingPlanes[ i ];\n				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;\n			}\n			#pragma unroll_loop_end\n			if ( clipped ) discard;\n		#endif\n	#endif\n#endif",
	clipping_planes_pars_fragment: "#if NUM_CLIPPING_PLANES > 0\n	varying vec3 vClipPosition;\n	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif",
	clipping_planes_pars_vertex: "#if NUM_CLIPPING_PLANES > 0\n	varying vec3 vClipPosition;\n#endif",
	clipping_planes_vertex: "#if NUM_CLIPPING_PLANES > 0\n	vClipPosition = - mvPosition.xyz;\n#endif",
	color_fragment: "#if defined( USE_COLOR_ALPHA )\n	diffuseColor *= vColor;\n#elif defined( USE_COLOR )\n	diffuseColor.rgb *= vColor;\n#endif",
	color_pars_fragment: "#if defined( USE_COLOR_ALPHA )\n	varying vec4 vColor;\n#elif defined( USE_COLOR )\n	varying vec3 vColor;\n#endif",
	color_pars_vertex: "#if defined( USE_COLOR_ALPHA )\n	varying vec4 vColor;\n#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n	varying vec3 vColor;\n#endif",
	color_vertex: "#if defined( USE_COLOR_ALPHA )\n	vColor = vec4( 1.0 );\n#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n	vColor = vec3( 1.0 );\n#endif\n#ifdef USE_COLOR\n	vColor *= color;\n#endif\n#ifdef USE_INSTANCING_COLOR\n	vColor.xyz *= instanceColor.xyz;\n#endif",
	common: "#define PI 3.141592653589793\n#define PI2 6.283185307179586\n#define PI_HALF 1.5707963267948966\n#define RECIPROCAL_PI 0.3183098861837907\n#define RECIPROCAL_PI2 0.15915494309189535\n#define EPSILON 1e-6\n#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\n#define whiteComplement( a ) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nvec3 pow2( const in vec3 x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }\nfloat average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }\nhighp float rand( const in vec2 uv ) {\n	const highp float a = 12.9898, b = 78.233, c = 43758.5453;\n	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n	return fract( sin( sn ) * c );\n}\n#ifdef HIGH_PRECISION\n	float precisionSafeLength( vec3 v ) { return length( v ); }\n#else\n	float precisionSafeLength( vec3 v ) {\n		float maxComponent = max3( abs( v ) );\n		return length( v / maxComponent ) * maxComponent;\n	}\n#endif\nstruct IncidentLight {\n	vec3 color;\n	vec3 direction;\n	bool visible;\n};\nstruct ReflectedLight {\n	vec3 directDiffuse;\n	vec3 directSpecular;\n	vec3 indirectDiffuse;\n	vec3 indirectSpecular;\n};\n#ifdef USE_ALPHAHASH\n	varying vec3 vPosition;\n#endif\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nmat3 transposeMat3( const in mat3 m ) {\n	mat3 tmp;\n	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );\n	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );\n	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );\n	return tmp;\n}\nfloat luminance( const in vec3 rgb ) {\n	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );\n	return dot( weights, rgb );\n}\nbool isPerspectiveMatrix( mat4 m ) {\n	return m[ 2 ][ 3 ] == - 1.0;\n}\nvec2 equirectUv( in vec3 dir ) {\n	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;\n	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n	return vec2( u, v );\n}\nvec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n	return RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {\n	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n}\nfloat F_Schlick( const in float f0, const in float f90, const in float dotVH ) {\n	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n} // validated",
	cube_uv_reflection_fragment: "#ifdef ENVMAP_TYPE_CUBE_UV\n	#define cubeUV_minMipLevel 4.0\n	#define cubeUV_minTileSize 16.0\n	float getFace( vec3 direction ) {\n		vec3 absDirection = abs( direction );\n		float face = - 1.0;\n		if ( absDirection.x > absDirection.z ) {\n			if ( absDirection.x > absDirection.y )\n				face = direction.x > 0.0 ? 0.0 : 3.0;\n			else\n				face = direction.y > 0.0 ? 1.0 : 4.0;\n		} else {\n			if ( absDirection.z > absDirection.y )\n				face = direction.z > 0.0 ? 2.0 : 5.0;\n			else\n				face = direction.y > 0.0 ? 1.0 : 4.0;\n		}\n		return face;\n	}\n	vec2 getUV( vec3 direction, float face ) {\n		vec2 uv;\n		if ( face == 0.0 ) {\n			uv = vec2( direction.z, direction.y ) / abs( direction.x );\n		} else if ( face == 1.0 ) {\n			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );\n		} else if ( face == 2.0 ) {\n			uv = vec2( - direction.x, direction.y ) / abs( direction.z );\n		} else if ( face == 3.0 ) {\n			uv = vec2( - direction.z, direction.y ) / abs( direction.x );\n		} else if ( face == 4.0 ) {\n			uv = vec2( - direction.x, direction.z ) / abs( direction.y );\n		} else {\n			uv = vec2( direction.x, direction.y ) / abs( direction.z );\n		}\n		return 0.5 * ( uv + 1.0 );\n	}\n	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {\n		float face = getFace( direction );\n		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );\n		mipInt = max( mipInt, cubeUV_minMipLevel );\n		float faceSize = exp2( mipInt );\n		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;\n		if ( face > 2.0 ) {\n			uv.y += faceSize;\n			face -= 3.0;\n		}\n		uv.x += face * faceSize;\n		uv.x += filterInt * 3.0 * cubeUV_minTileSize;\n		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );\n		uv.x *= CUBEUV_TEXEL_WIDTH;\n		uv.y *= CUBEUV_TEXEL_HEIGHT;\n		#ifdef texture2DGradEXT\n			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;\n		#else\n			return texture2D( envMap, uv ).rgb;\n		#endif\n	}\n	#define cubeUV_r0 1.0\n	#define cubeUV_m0 - 2.0\n	#define cubeUV_r1 0.8\n	#define cubeUV_m1 - 1.0\n	#define cubeUV_r4 0.4\n	#define cubeUV_m4 2.0\n	#define cubeUV_r5 0.305\n	#define cubeUV_m5 3.0\n	#define cubeUV_r6 0.21\n	#define cubeUV_m6 4.0\n	float roughnessToMip( float roughness ) {\n		float mip = 0.0;\n		if ( roughness >= cubeUV_r1 ) {\n			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;\n		} else if ( roughness >= cubeUV_r4 ) {\n			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;\n		} else if ( roughness >= cubeUV_r5 ) {\n			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;\n		} else if ( roughness >= cubeUV_r6 ) {\n			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;\n		} else {\n			mip = - 2.0 * log2( 1.16 * roughness );		}\n		return mip;\n	}\n	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {\n		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );\n		float mipF = fract( mip );\n		float mipInt = floor( mip );\n		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );\n		if ( mipF == 0.0 ) {\n			return vec4( color0, 1.0 );\n		} else {\n			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );\n			return vec4( mix( color0, color1, mipF ), 1.0 );\n		}\n	}\n#endif",
	defaultnormal_vertex: "vec3 transformedNormal = objectNormal;\n#ifdef USE_TANGENT\n	vec3 transformedTangent = objectTangent;\n#endif\n#ifdef USE_BATCHING\n	mat3 bm = mat3( batchingMatrix );\n	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );\n	transformedNormal = bm * transformedNormal;\n	#ifdef USE_TANGENT\n		transformedTangent = bm * transformedTangent;\n	#endif\n#endif\n#ifdef USE_INSTANCING\n	mat3 im = mat3( instanceMatrix );\n	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );\n	transformedNormal = im * transformedNormal;\n	#ifdef USE_TANGENT\n		transformedTangent = im * transformedTangent;\n	#endif\n#endif\ntransformedNormal = normalMatrix * transformedNormal;\n#ifdef FLIP_SIDED\n	transformedNormal = - transformedNormal;\n#endif\n#ifdef USE_TANGENT\n	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;\n	#ifdef FLIP_SIDED\n		transformedTangent = - transformedTangent;\n	#endif\n#endif",
	displacementmap_pars_vertex: "#ifdef USE_DISPLACEMENTMAP\n	uniform sampler2D displacementMap;\n	uniform float displacementScale;\n	uniform float displacementBias;\n#endif",
	displacementmap_vertex: "#ifdef USE_DISPLACEMENTMAP\n	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );\n#endif",
	emissivemap_fragment: "#ifdef USE_EMISSIVEMAP\n	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );\n	totalEmissiveRadiance *= emissiveColor.rgb;\n#endif",
	emissivemap_pars_fragment: "#ifdef USE_EMISSIVEMAP\n	uniform sampler2D emissiveMap;\n#endif",
	colorspace_fragment: "gl_FragColor = linearToOutputTexel( gl_FragColor );",
	colorspace_pars_fragment: "\nconst mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(\n	vec3( 0.8224621, 0.177538, 0.0 ),\n	vec3( 0.0331941, 0.9668058, 0.0 ),\n	vec3( 0.0170827, 0.0723974, 0.9105199 )\n);\nconst mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(\n	vec3( 1.2249401, - 0.2249404, 0.0 ),\n	vec3( - 0.0420569, 1.0420571, 0.0 ),\n	vec3( - 0.0196376, - 0.0786361, 1.0982735 )\n);\nvec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {\n	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );\n}\nvec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {\n	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );\n}\nvec4 LinearTransferOETF( in vec4 value ) {\n	return value;\n}\nvec4 sRGBTransferOETF( in vec4 value ) {\n	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );\n}\nvec4 LinearToLinear( in vec4 value ) {\n	return value;\n}\nvec4 LinearTosRGB( in vec4 value ) {\n	return sRGBTransferOETF( value );\n}",
	envmap_fragment: "#ifdef USE_ENVMAP\n	#ifdef ENV_WORLDPOS\n		vec3 cameraToFrag;\n		if ( isOrthographic ) {\n			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n		} else {\n			cameraToFrag = normalize( vWorldPosition - cameraPosition );\n		}\n		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vec3 reflectVec = reflect( cameraToFrag, worldNormal );\n		#else\n			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );\n		#endif\n	#else\n		vec3 reflectVec = vReflect;\n	#endif\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n	#else\n		vec4 envColor = vec4( 0.0 );\n	#endif\n	#ifdef ENVMAP_BLENDING_MULTIPLY\n		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n	#elif defined( ENVMAP_BLENDING_MIX )\n		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n	#elif defined( ENVMAP_BLENDING_ADD )\n		outgoingLight += envColor.xyz * specularStrength * reflectivity;\n	#endif\n#endif",
	envmap_common_pars_fragment: "#ifdef USE_ENVMAP\n	uniform float envMapIntensity;\n	uniform float flipEnvMap;\n	#ifdef ENVMAP_TYPE_CUBE\n		uniform samplerCube envMap;\n	#else\n		uniform sampler2D envMap;\n	#endif\n	\n#endif",
	envmap_pars_fragment: "#ifdef USE_ENVMAP\n	uniform float reflectivity;\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n		#define ENV_WORLDPOS\n	#endif\n	#ifdef ENV_WORLDPOS\n		varying vec3 vWorldPosition;\n		uniform float refractionRatio;\n	#else\n		varying vec3 vReflect;\n	#endif\n#endif",
	envmap_pars_vertex: "#ifdef USE_ENVMAP\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n		#define ENV_WORLDPOS\n	#endif\n	#ifdef ENV_WORLDPOS\n		\n		varying vec3 vWorldPosition;\n	#else\n		varying vec3 vReflect;\n		uniform float refractionRatio;\n	#endif\n#endif",
	envmap_physical_pars_fragment: "#ifdef USE_ENVMAP\n	vec3 getIBLIrradiance( const in vec3 normal ) {\n		#ifdef ENVMAP_TYPE_CUBE_UV\n			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );\n			return PI * envMapColor.rgb * envMapIntensity;\n		#else\n			return vec3( 0.0 );\n		#endif\n	}\n	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {\n		#ifdef ENVMAP_TYPE_CUBE_UV\n			vec3 reflectVec = reflect( - viewDir, normal );\n			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );\n			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );\n			return envMapColor.rgb * envMapIntensity;\n		#else\n			return vec3( 0.0 );\n		#endif\n	}\n	#ifdef USE_ANISOTROPY\n		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {\n			#ifdef ENVMAP_TYPE_CUBE_UV\n				vec3 bentNormal = cross( bitangent, viewDir );\n				bentNormal = normalize( cross( bentNormal, bitangent ) );\n				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );\n				return getIBLRadiance( viewDir, bentNormal, roughness );\n			#else\n				return vec3( 0.0 );\n			#endif\n		}\n	#endif\n#endif",
	envmap_vertex: "#ifdef USE_ENVMAP\n	#ifdef ENV_WORLDPOS\n		vWorldPosition = worldPosition.xyz;\n	#else\n		vec3 cameraToVertex;\n		if ( isOrthographic ) {\n			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n		} else {\n			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n		}\n		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vReflect = reflect( cameraToVertex, worldNormal );\n		#else\n			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n		#endif\n	#endif\n#endif",
	fog_vertex: "#ifdef USE_FOG\n	vFogDepth = - mvPosition.z;\n#endif",
	fog_pars_vertex: "#ifdef USE_FOG\n	varying float vFogDepth;\n#endif",
	fog_fragment: "#ifdef USE_FOG\n	#ifdef FOG_EXP2\n		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );\n	#else\n		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );\n	#endif\n	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif",
	fog_pars_fragment: "#ifdef USE_FOG\n	uniform vec3 fogColor;\n	varying float vFogDepth;\n	#ifdef FOG_EXP2\n		uniform float fogDensity;\n	#else\n		uniform float fogNear;\n		uniform float fogFar;\n	#endif\n#endif",
	gradientmap_pars_fragment: "#ifdef USE_GRADIENTMAP\n	uniform sampler2D gradientMap;\n#endif\nvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n	float dotNL = dot( normal, lightDirection );\n	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n	#ifdef USE_GRADIENTMAP\n		return vec3( texture2D( gradientMap, coord ).r );\n	#else\n		vec2 fw = fwidth( coord ) * 0.5;\n		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );\n	#endif\n}",
	lightmap_fragment: "#ifdef USE_LIGHTMAP\n	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;\n	reflectedLight.indirectDiffuse += lightMapIrradiance;\n#endif",
	lightmap_pars_fragment: "#ifdef USE_LIGHTMAP\n	uniform sampler2D lightMap;\n	uniform float lightMapIntensity;\n#endif",
	lights_lambert_fragment: "LambertMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularStrength = specularStrength;",
	lights_lambert_pars_fragment: "varying vec3 vViewPosition;\nstruct LambertMaterial {\n	vec3 diffuseColor;\n	float specularStrength;\n};\nvoid RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_Lambert\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert",
	lights_pars_begin: "uniform bool receiveShadow;\nuniform vec3 ambientLightColor;\n#if defined( USE_LIGHT_PROBES )\n	uniform vec3 lightProbe[ 9 ];\n#endif\nvec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {\n	float x = normal.x, y = normal.y, z = normal.z;\n	vec3 result = shCoefficients[ 0 ] * 0.886227;\n	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;\n	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;\n	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;\n	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;\n	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;\n	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );\n	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;\n	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );\n	return result;\n}\nvec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {\n	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );\n	return irradiance;\n}\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n	vec3 irradiance = ambientLightColor;\n	return irradiance;\n}\nfloat getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n	#if defined ( LEGACY_LIGHTS )\n		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {\n			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );\n		}\n		return 1.0;\n	#else\n		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n		if ( cutoffDistance > 0.0 ) {\n			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n		}\n		return distanceFalloff;\n	#endif\n}\nfloat getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {\n	return smoothstep( coneCosine, penumbraCosine, angleCosine );\n}\n#if NUM_DIR_LIGHTS > 0\n	struct DirectionalLight {\n		vec3 direction;\n		vec3 color;\n	};\n	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {\n		light.color = directionalLight.color;\n		light.direction = directionalLight.direction;\n		light.visible = true;\n	}\n#endif\n#if NUM_POINT_LIGHTS > 0\n	struct PointLight {\n		vec3 position;\n		vec3 color;\n		float distance;\n		float decay;\n	};\n	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {\n		vec3 lVector = pointLight.position - geometryPosition;\n		light.direction = normalize( lVector );\n		float lightDistance = length( lVector );\n		light.color = pointLight.color;\n		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );\n		light.visible = ( light.color != vec3( 0.0 ) );\n	}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n	struct SpotLight {\n		vec3 position;\n		vec3 direction;\n		vec3 color;\n		float distance;\n		float decay;\n		float coneCos;\n		float penumbraCos;\n	};\n	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {\n		vec3 lVector = spotLight.position - geometryPosition;\n		light.direction = normalize( lVector );\n		float angleCos = dot( light.direction, spotLight.direction );\n		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n		if ( spotAttenuation > 0.0 ) {\n			float lightDistance = length( lVector );\n			light.color = spotLight.color * spotAttenuation;\n			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );\n			light.visible = ( light.color != vec3( 0.0 ) );\n		} else {\n			light.color = vec3( 0.0 );\n			light.visible = false;\n		}\n	}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n	struct RectAreaLight {\n		vec3 color;\n		vec3 position;\n		vec3 halfWidth;\n		vec3 halfHeight;\n	};\n	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;\n	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n	struct HemisphereLight {\n		vec3 direction;\n		vec3 skyColor;\n		vec3 groundColor;\n	};\n	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {\n		float dotNL = dot( normal, hemiLight.direction );\n		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n		return irradiance;\n	}\n#endif",
	lights_toon_fragment: "ToonMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;",
	lights_toon_pars_fragment: "varying vec3 vViewPosition;\nstruct ToonMaterial {\n	vec3 diffuseColor;\n};\nvoid RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_Toon\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon",
	lights_phong_fragment: "BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;",
	lights_phong_pars_fragment: "varying vec3 vViewPosition;\nstruct BlinnPhongMaterial {\n	vec3 diffuseColor;\n	vec3 specularColor;\n	float specularShininess;\n	float specularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_BlinnPhong\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong",
	lights_physical_fragment: "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nvec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\nmaterial.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;\nmaterial.roughness = min( material.roughness, 1.0 );\n#ifdef IOR\n	material.ior = ior;\n	#ifdef USE_SPECULAR\n		float specularIntensityFactor = specularIntensity;\n		vec3 specularColorFactor = specularColor;\n		#ifdef USE_SPECULAR_COLORMAP\n			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;\n		#endif\n		#ifdef USE_SPECULAR_INTENSITYMAP\n			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;\n		#endif\n		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );\n	#else\n		float specularIntensityFactor = 1.0;\n		vec3 specularColorFactor = vec3( 1.0 );\n		material.specularF90 = 1.0;\n	#endif\n	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );\n#else\n	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );\n	material.specularF90 = 1.0;\n#endif\n#ifdef USE_CLEARCOAT\n	material.clearcoat = clearcoat;\n	material.clearcoatRoughness = clearcoatRoughness;\n	material.clearcoatF0 = vec3( 0.04 );\n	material.clearcoatF90 = 1.0;\n	#ifdef USE_CLEARCOATMAP\n		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;\n	#endif\n	#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;\n	#endif\n	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );\n	material.clearcoatRoughness += geometryRoughness;\n	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\n#endif\n#ifdef USE_IRIDESCENCE\n	material.iridescence = iridescence;\n	material.iridescenceIOR = iridescenceIOR;\n	#ifdef USE_IRIDESCENCEMAP\n		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;\n	#endif\n	#ifdef USE_IRIDESCENCE_THICKNESSMAP\n		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;\n	#else\n		material.iridescenceThickness = iridescenceThicknessMaximum;\n	#endif\n#endif\n#ifdef USE_SHEEN\n	material.sheenColor = sheenColor;\n	#ifdef USE_SHEEN_COLORMAP\n		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;\n	#endif\n	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );\n	#ifdef USE_SHEEN_ROUGHNESSMAP\n		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;\n	#endif\n#endif\n#ifdef USE_ANISOTROPY\n	#ifdef USE_ANISOTROPYMAP\n		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );\n		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;\n		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;\n	#else\n		vec2 anisotropyV = anisotropyVector;\n	#endif\n	material.anisotropy = length( anisotropyV );\n	if( material.anisotropy == 0.0 ) {\n		anisotropyV = vec2( 1.0, 0.0 );\n	} else {\n		anisotropyV /= material.anisotropy;\n		material.anisotropy = saturate( material.anisotropy );\n	}\n	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );\n	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;\n	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;\n#endif",
	lights_physical_pars_fragment: "struct PhysicalMaterial {\n	vec3 diffuseColor;\n	float roughness;\n	vec3 specularColor;\n	float specularF90;\n	#ifdef USE_CLEARCOAT\n		float clearcoat;\n		float clearcoatRoughness;\n		vec3 clearcoatF0;\n		float clearcoatF90;\n	#endif\n	#ifdef USE_IRIDESCENCE\n		float iridescence;\n		float iridescenceIOR;\n		float iridescenceThickness;\n		vec3 iridescenceFresnel;\n		vec3 iridescenceF0;\n	#endif\n	#ifdef USE_SHEEN\n		vec3 sheenColor;\n		float sheenRoughness;\n	#endif\n	#ifdef IOR\n		float ior;\n	#endif\n	#ifdef USE_TRANSMISSION\n		float transmission;\n		float transmissionAlpha;\n		float thickness;\n		float attenuationDistance;\n		vec3 attenuationColor;\n	#endif\n	#ifdef USE_ANISOTROPY\n		float anisotropy;\n		float alphaT;\n		vec3 anisotropyT;\n		vec3 anisotropyB;\n	#endif\n};\nvec3 clearcoatSpecularDirect = vec3( 0.0 );\nvec3 clearcoatSpecularIndirect = vec3( 0.0 );\nvec3 sheenSpecularDirect = vec3( 0.0 );\nvec3 sheenSpecularIndirect = vec3(0.0 );\nvec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {\n    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );\n    float x2 = x * x;\n    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );\n    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );\n}\nfloat V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n	float a2 = pow2( alpha );\n	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n	return 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n	float a2 = pow2( alpha );\n	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n	return RECIPROCAL_PI * a2 / pow2( denom );\n}\n#ifdef USE_ANISOTROPY\n	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {\n		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );\n		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );\n		float v = 0.5 / ( gv + gl );\n		return saturate(v);\n	}\n	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {\n		float a2 = alphaT * alphaB;\n		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );\n		highp float v2 = dot( v, v );\n		float w2 = a2 / v2;\n		return RECIPROCAL_PI * a2 * pow2 ( w2 );\n	}\n#endif\n#ifdef USE_CLEARCOAT\n	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {\n		vec3 f0 = material.clearcoatF0;\n		float f90 = material.clearcoatF90;\n		float roughness = material.clearcoatRoughness;\n		float alpha = pow2( roughness );\n		vec3 halfDir = normalize( lightDir + viewDir );\n		float dotNL = saturate( dot( normal, lightDir ) );\n		float dotNV = saturate( dot( normal, viewDir ) );\n		float dotNH = saturate( dot( normal, halfDir ) );\n		float dotVH = saturate( dot( viewDir, halfDir ) );\n		vec3 F = F_Schlick( f0, f90, dotVH );\n		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n		float D = D_GGX( alpha, dotNH );\n		return F * ( V * D );\n	}\n#endif\nvec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {\n	vec3 f0 = material.specularColor;\n	float f90 = material.specularF90;\n	float roughness = material.roughness;\n	float alpha = pow2( roughness );\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotVH = saturate( dot( viewDir, halfDir ) );\n	vec3 F = F_Schlick( f0, f90, dotVH );\n	#ifdef USE_IRIDESCENCE\n		F = mix( F, material.iridescenceFresnel, material.iridescence );\n	#endif\n	#ifdef USE_ANISOTROPY\n		float dotTL = dot( material.anisotropyT, lightDir );\n		float dotTV = dot( material.anisotropyT, viewDir );\n		float dotTH = dot( material.anisotropyT, halfDir );\n		float dotBL = dot( material.anisotropyB, lightDir );\n		float dotBV = dot( material.anisotropyB, viewDir );\n		float dotBH = dot( material.anisotropyB, halfDir );\n		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );\n		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );\n	#else\n		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n		float D = D_GGX( alpha, dotNH );\n	#endif\n	return F * ( V * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n	const float LUT_SIZE = 64.0;\n	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n	const float LUT_BIAS = 0.5 / LUT_SIZE;\n	float dotNV = saturate( dot( N, V ) );\n	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );\n	uv = uv * LUT_SCALE + LUT_BIAS;\n	return uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n	float l = length( f );\n	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n	float x = dot( v1, v2 );\n	float y = abs( x );\n	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;\n	float b = 3.4175940 + ( 4.1616724 + y ) * y;\n	float v = a / b;\n	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;\n	return cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n	vec3 lightNormal = cross( v1, v2 );\n	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n	vec3 T1, T2;\n	T1 = normalize( V - N * dot( V, N ) );\n	T2 = - cross( N, T1 );\n	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );\n	vec3 coords[ 4 ];\n	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n	coords[ 0 ] = normalize( coords[ 0 ] );\n	coords[ 1 ] = normalize( coords[ 1 ] );\n	coords[ 2 ] = normalize( coords[ 2 ] );\n	coords[ 3 ] = normalize( coords[ 3 ] );\n	vec3 vectorFormFactor = vec3( 0.0 );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );\n	return vec3( result );\n}\n#if defined( USE_SHEEN )\nfloat D_Charlie( float roughness, float dotNH ) {\n	float alpha = pow2( roughness );\n	float invAlpha = 1.0 / alpha;\n	float cos2h = dotNH * dotNH;\n	float sin2h = max( 1.0 - cos2h, 0.0078125 );\n	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );\n}\nfloat V_Neubelt( float dotNV, float dotNL ) {\n	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );\n}\nvec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float D = D_Charlie( sheenRoughness, dotNH );\n	float V = V_Neubelt( dotNV, dotNL );\n	return sheenColor * ( D * V );\n}\n#endif\nfloat IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float r2 = roughness * roughness;\n	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;\n	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;\n	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );\n	return saturate( DG * RECIPROCAL_PI );\n}\nvec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {\n	float dotNV = saturate( dot( normal, viewDir ) );\n	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n	vec4 r = roughness * c0 + c1;\n	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;\n	return fab;\n}\nvec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {\n	vec2 fab = DFGApprox( normal, viewDir, roughness );\n	return specularColor * fab.x + specularF90 * fab.y;\n}\n#ifdef USE_IRIDESCENCE\nvoid computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#else\nvoid computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#endif\n	vec2 fab = DFGApprox( normal, viewDir, roughness );\n	#ifdef USE_IRIDESCENCE\n		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );\n	#else\n		vec3 Fr = specularColor;\n	#endif\n	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;\n	float Ess = fab.x + fab.y;\n	float Ems = 1.0 - Ess;\n	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );\n	singleScatter += FssEss;\n	multiScatter += Fms * Ems;\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n		vec3 normal = geometryNormal;\n		vec3 viewDir = geometryViewDir;\n		vec3 position = geometryPosition;\n		vec3 lightPos = rectAreaLight.position;\n		vec3 halfWidth = rectAreaLight.halfWidth;\n		vec3 halfHeight = rectAreaLight.halfHeight;\n		vec3 lightColor = rectAreaLight.color;\n		float roughness = material.roughness;\n		vec3 rectCoords[ 4 ];\n		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;\n		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;\n		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;\n		vec2 uv = LTC_Uv( normal, viewDir, roughness );\n		vec4 t1 = texture2D( ltc_1, uv );\n		vec4 t2 = texture2D( ltc_2, uv );\n		mat3 mInv = mat3(\n			vec3( t1.x, 0, t1.y ),\n			vec3(    0, 1,    0 ),\n			vec3( t1.z, 0, t1.w )\n		);\n		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );\n		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );\n	}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	#ifdef USE_CLEARCOAT\n		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );\n		vec3 ccIrradiance = dotNLcc * directLight.color;\n		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );\n	#endif\n	#ifdef USE_SHEEN\n		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );\n	#endif\n	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {\n	#ifdef USE_CLEARCOAT\n		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );\n	#endif\n	#ifdef USE_SHEEN\n		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n	#endif\n	vec3 singleScattering = vec3( 0.0 );\n	vec3 multiScattering = vec3( 0.0 );\n	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;\n	#ifdef USE_IRIDESCENCE\n		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );\n	#else\n		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );\n	#endif\n	vec3 totalScattering = singleScattering + multiScattering;\n	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );\n	reflectedLight.indirectSpecular += radiance * singleScattering;\n	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;\n	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;\n}\n#define RE_Direct				RE_Direct_Physical\n#define RE_Direct_RectArea		RE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular		RE_IndirectSpecular_Physical\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}",
	lights_fragment_begin: "\nvec3 geometryPosition = - vViewPosition;\nvec3 geometryNormal = normal;\nvec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\nvec3 geometryClearcoatNormal = vec3( 0.0 );\n#ifdef USE_CLEARCOAT\n	geometryClearcoatNormal = clearcoatNormal;\n#endif\n#ifdef USE_IRIDESCENCE\n	float dotNVi = saturate( dot( normal, geometryViewDir ) );\n	if ( material.iridescenceThickness == 0.0 ) {\n		material.iridescence = 0.0;\n	} else {\n		material.iridescence = saturate( material.iridescence );\n	}\n	if ( material.iridescence > 0.0 ) {\n		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );\n		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );\n	}\n#endif\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n	PointLight pointLight;\n	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n	PointLightShadow pointLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n		pointLight = pointLights[ i ];\n		getPointLightInfo( pointLight, geometryPosition, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )\n		pointLightShadow = pointLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n	SpotLight spotLight;\n	vec4 spotColor;\n	vec3 spotLightCoord;\n	bool inSpotLightMap;\n	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n	SpotLightShadow spotLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n		spotLight = spotLights[ i ];\n		getSpotLightInfo( spotLight, geometryPosition, directLight );\n		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX\n		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS\n		#else\n		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n		#endif\n		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )\n			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;\n			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );\n			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );\n			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;\n		#endif\n		#undef SPOT_LIGHT_MAP_INDEX\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n		spotLightShadow = spotLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n	DirectionalLight directionalLight;\n	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n	DirectionalLightShadow directionalLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n		directionalLight = directionalLights[ i ];\n		getDirectionalLightInfo( directionalLight, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n		directionalLightShadow = directionalLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n	RectAreaLight rectAreaLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n		rectAreaLight = rectAreaLights[ i ];\n		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if defined( RE_IndirectDiffuse )\n	vec3 iblIrradiance = vec3( 0.0 );\n	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n	#if defined( USE_LIGHT_PROBES )\n		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );\n	#endif\n	#if ( NUM_HEMI_LIGHTS > 0 )\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );\n		}\n		#pragma unroll_loop_end\n	#endif\n#endif\n#if defined( RE_IndirectSpecular )\n	vec3 radiance = vec3( 0.0 );\n	vec3 clearcoatRadiance = vec3( 0.0 );\n#endif",
	lights_fragment_maps: "#if defined( RE_IndirectDiffuse )\n	#ifdef USE_LIGHTMAP\n		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;\n		irradiance += lightMapIrradiance;\n	#endif\n	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )\n		iblIrradiance += getIBLIrradiance( geometryNormal );\n	#endif\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n	#ifdef USE_ANISOTROPY\n		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );\n	#else\n		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );\n	#endif\n	#ifdef USE_CLEARCOAT\n		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );\n	#endif\n#endif",
	lights_fragment_end: "#if defined( RE_IndirectDiffuse )\n	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n#endif\n#if defined( RE_IndirectSpecular )\n	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n#endif",
	logdepthbuf_fragment: "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif",
	logdepthbuf_pars_fragment: "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n	uniform float logDepthBufFC;\n	varying float vFragDepth;\n	varying float vIsPerspective;\n#endif",
	logdepthbuf_pars_vertex: "#ifdef USE_LOGDEPTHBUF\n	#ifdef USE_LOGDEPTHBUF_EXT\n		varying float vFragDepth;\n		varying float vIsPerspective;\n	#else\n		uniform float logDepthBufFC;\n	#endif\n#endif",
	logdepthbuf_vertex: "#ifdef USE_LOGDEPTHBUF\n	#ifdef USE_LOGDEPTHBUF_EXT\n		vFragDepth = 1.0 + gl_Position.w;\n		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );\n	#else\n		if ( isPerspectiveMatrix( projectionMatrix ) ) {\n			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;\n			gl_Position.z *= gl_Position.w;\n		}\n	#endif\n#endif",
	map_fragment: "#ifdef USE_MAP\n	vec4 sampledDiffuseColor = texture2D( map, vMapUv );\n	#ifdef DECODE_VIDEO_TEXTURE\n		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );\n	\n	#endif\n	diffuseColor *= sampledDiffuseColor;\n#endif",
	map_pars_fragment: "#ifdef USE_MAP\n	uniform sampler2D map;\n#endif",
	map_particle_fragment: "#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n	#if defined( USE_POINTS_UV )\n		vec2 uv = vUv;\n	#else\n		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;\n	#endif\n#endif\n#ifdef USE_MAP\n	diffuseColor *= texture2D( map, uv );\n#endif\n#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, uv ).g;\n#endif",
	map_particle_pars_fragment: "#if defined( USE_POINTS_UV )\n	varying vec2 vUv;\n#else\n	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n		uniform mat3 uvTransform;\n	#endif\n#endif\n#ifdef USE_MAP\n	uniform sampler2D map;\n#endif\n#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif",
	metalnessmap_fragment: "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );\n	metalnessFactor *= texelMetalness.b;\n#endif",
	metalnessmap_pars_fragment: "#ifdef USE_METALNESSMAP\n	uniform sampler2D metalnessMap;\n#endif",
	morphcolor_vertex: "#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )\n	vColor *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		#if defined( USE_COLOR_ALPHA )\n			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];\n		#elif defined( USE_COLOR )\n			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];\n		#endif\n	}\n#endif",
	morphnormal_vertex: "#ifdef USE_MORPHNORMALS\n	objectNormal *= morphTargetBaseInfluence;\n	#ifdef MORPHTARGETS_TEXTURE\n		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];\n		}\n	#else\n		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];\n		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];\n		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];\n		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];\n	#endif\n#endif",
	morphtarget_pars_vertex: "#ifdef USE_MORPHTARGETS\n	uniform float morphTargetBaseInfluence;\n	#ifdef MORPHTARGETS_TEXTURE\n		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n		uniform sampler2DArray morphTargetsTexture;\n		uniform ivec2 morphTargetsTextureSize;\n		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {\n			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;\n			int y = texelIndex / morphTargetsTextureSize.x;\n			int x = texelIndex - y * morphTargetsTextureSize.x;\n			ivec3 morphUV = ivec3( x, y, morphTargetIndex );\n			return texelFetch( morphTargetsTexture, morphUV, 0 );\n		}\n	#else\n		#ifndef USE_MORPHNORMALS\n			uniform float morphTargetInfluences[ 8 ];\n		#else\n			uniform float morphTargetInfluences[ 4 ];\n		#endif\n	#endif\n#endif",
	morphtarget_vertex: "#ifdef USE_MORPHTARGETS\n	transformed *= morphTargetBaseInfluence;\n	#ifdef MORPHTARGETS_TEXTURE\n		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];\n		}\n	#else\n		transformed += morphTarget0 * morphTargetInfluences[ 0 ];\n		transformed += morphTarget1 * morphTargetInfluences[ 1 ];\n		transformed += morphTarget2 * morphTargetInfluences[ 2 ];\n		transformed += morphTarget3 * morphTargetInfluences[ 3 ];\n		#ifndef USE_MORPHNORMALS\n			transformed += morphTarget4 * morphTargetInfluences[ 4 ];\n			transformed += morphTarget5 * morphTargetInfluences[ 5 ];\n			transformed += morphTarget6 * morphTargetInfluences[ 6 ];\n			transformed += morphTarget7 * morphTargetInfluences[ 7 ];\n		#endif\n	#endif\n#endif",
	normal_fragment_begin: "float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;\n#ifdef FLAT_SHADED\n	vec3 fdx = dFdx( vViewPosition );\n	vec3 fdy = dFdy( vViewPosition );\n	vec3 normal = normalize( cross( fdx, fdy ) );\n#else\n	vec3 normal = normalize( vNormal );\n	#ifdef DOUBLE_SIDED\n		normal *= faceDirection;\n	#endif\n#endif\n#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )\n	#ifdef USE_TANGENT\n		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n	#else\n		mat3 tbn = getTangentFrame( - vViewPosition, normal,\n		#if defined( USE_NORMALMAP )\n			vNormalMapUv\n		#elif defined( USE_CLEARCOAT_NORMALMAP )\n			vClearcoatNormalMapUv\n		#else\n			vUv\n		#endif\n		);\n	#endif\n	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )\n		tbn[0] *= faceDirection;\n		tbn[1] *= faceDirection;\n	#endif\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	#ifdef USE_TANGENT\n		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n	#else\n		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );\n	#endif\n	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )\n		tbn2[0] *= faceDirection;\n		tbn2[1] *= faceDirection;\n	#endif\n#endif\nvec3 nonPerturbedNormal = normal;",
	normal_fragment_maps: "#ifdef USE_NORMALMAP_OBJECTSPACE\n	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n	#ifdef FLIP_SIDED\n		normal = - normal;\n	#endif\n	#ifdef DOUBLE_SIDED\n		normal = normal * faceDirection;\n	#endif\n	normal = normalize( normalMatrix * normal );\n#elif defined( USE_NORMALMAP_TANGENTSPACE )\n	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n	mapN.xy *= normalScale;\n	normal = normalize( tbn * mapN );\n#elif defined( USE_BUMPMAP )\n	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );\n#endif",
	normal_pars_fragment: "#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n	#ifdef USE_TANGENT\n		varying vec3 vTangent;\n		varying vec3 vBitangent;\n	#endif\n#endif",
	normal_pars_vertex: "#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n	#ifdef USE_TANGENT\n		varying vec3 vTangent;\n		varying vec3 vBitangent;\n	#endif\n#endif",
	normal_vertex: "#ifndef FLAT_SHADED\n	vNormal = normalize( transformedNormal );\n	#ifdef USE_TANGENT\n		vTangent = normalize( transformedTangent );\n		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );\n	#endif\n#endif",
	normalmap_pars_fragment: "#ifdef USE_NORMALMAP\n	uniform sampler2D normalMap;\n	uniform vec2 normalScale;\n#endif\n#ifdef USE_NORMALMAP_OBJECTSPACE\n	uniform mat3 normalMatrix;\n#endif\n#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )\n	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {\n		vec3 q0 = dFdx( eye_pos.xyz );\n		vec3 q1 = dFdy( eye_pos.xyz );\n		vec2 st0 = dFdx( uv.st );\n		vec2 st1 = dFdy( uv.st );\n		vec3 N = surf_norm;\n		vec3 q1perp = cross( q1, N );\n		vec3 q0perp = cross( N, q0 );\n		vec3 T = q1perp * st0.x + q0perp * st1.x;\n		vec3 B = q1perp * st0.y + q0perp * st1.y;\n		float det = max( dot( T, T ), dot( B, B ) );\n		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );\n		return mat3( T * scale, B * scale, N );\n	}\n#endif",
	clearcoat_normal_fragment_begin: "#ifdef USE_CLEARCOAT\n	vec3 clearcoatNormal = nonPerturbedNormal;\n#endif",
	clearcoat_normal_fragment_maps: "#ifdef USE_CLEARCOAT_NORMALMAP\n	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;\n	clearcoatMapN.xy *= clearcoatNormalScale;\n	clearcoatNormal = normalize( tbn2 * clearcoatMapN );\n#endif",
	clearcoat_pars_fragment: "#ifdef USE_CLEARCOATMAP\n	uniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	uniform sampler2D clearcoatNormalMap;\n	uniform vec2 clearcoatNormalScale;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	uniform sampler2D clearcoatRoughnessMap;\n#endif",
	iridescence_pars_fragment: "#ifdef USE_IRIDESCENCEMAP\n	uniform sampler2D iridescenceMap;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	uniform sampler2D iridescenceThicknessMap;\n#endif",
	opaque_fragment: "#ifdef OPAQUE\ndiffuseColor.a = 1.0;\n#endif\n#ifdef USE_TRANSMISSION\ndiffuseColor.a *= material.transmissionAlpha;\n#endif\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );",
	packing: "vec3 packNormalToRGB( const in vec3 normal ) {\n	return normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n	return 2.0 * rgb.xyz - 1.0;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n	vec4 r = vec4( fract( v * PackFactors ), v );\n	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n	return dot( v, UnpackFactors );\n}\nvec2 packDepthToRG( in highp float v ) {\n	return packDepthToRGBA( v ).yx;\n}\nfloat unpackRGToDepth( const in highp vec2 v ) {\n	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );\n}\nvec4 pack2HalfToRGBA( vec2 v ) {\n	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );\n	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );\n}\nvec2 unpackRGBATo2Half( vec4 v ) {\n	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n	return ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {\n	return depth * ( near - far ) - near;\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {\n	return ( near * far ) / ( ( far - near ) * depth - far );\n}",
	premultiplied_alpha_fragment: "#ifdef PREMULTIPLIED_ALPHA\n	gl_FragColor.rgb *= gl_FragColor.a;\n#endif",
	project_vertex: "vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_BATCHING\n	mvPosition = batchingMatrix * mvPosition;\n#endif\n#ifdef USE_INSTANCING\n	mvPosition = instanceMatrix * mvPosition;\n#endif\nmvPosition = modelViewMatrix * mvPosition;\ngl_Position = projectionMatrix * mvPosition;",
	dithering_fragment: "#ifdef DITHERING\n	gl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif",
	dithering_pars_fragment: "#ifdef DITHERING\n	vec3 dithering( vec3 color ) {\n		float grid_position = rand( gl_FragCoord.xy );\n		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n		return color + dither_shift_RGB;\n	}\n#endif",
	roughnessmap_fragment: "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );\n	roughnessFactor *= texelRoughness.g;\n#endif",
	roughnessmap_pars_fragment: "#ifdef USE_ROUGHNESSMAP\n	uniform sampler2D roughnessMap;\n#endif",
	shadowmap_pars_fragment: "#if NUM_SPOT_LIGHT_COORDS > 0\n	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#if NUM_SPOT_LIGHT_MAPS > 0\n	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];\n#endif\n#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n		struct DirectionalLightShadow {\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n		struct SpotLightShadow {\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n		struct PointLightShadow {\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n			float shadowCameraNear;\n			float shadowCameraFar;\n		};\n		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n	#endif\n	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {\n		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\n	}\n	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {\n		return unpackRGBATo2Half( texture2D( shadow, uv ) );\n	}\n	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){\n		float occlusion = 1.0;\n		vec2 distribution = texture2DDistribution( shadow, uv );\n		float hard_shadow = step( compare , distribution.x );\n		if (hard_shadow != 1.0 ) {\n			float distance = compare - distribution.x ;\n			float variance = max( 0.00000, distribution.y * distribution.y );\n			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );\n		}\n		return occlusion;\n	}\n	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n		float shadow = 1.0;\n		shadowCoord.xyz /= shadowCoord.w;\n		shadowCoord.z += shadowBias;\n		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n		if ( frustumTest ) {\n		#if defined( SHADOWMAP_TYPE_PCF )\n			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n			float dx0 = - texelSize.x * shadowRadius;\n			float dy0 = - texelSize.y * shadowRadius;\n			float dx1 = + texelSize.x * shadowRadius;\n			float dy1 = + texelSize.y * shadowRadius;\n			float dx2 = dx0 / 2.0;\n			float dy2 = dy0 / 2.0;\n			float dx3 = dx1 / 2.0;\n			float dy3 = dy1 / 2.0;\n			shadow = (\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n			) * ( 1.0 / 17.0 );\n		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n			float dx = texelSize.x;\n			float dy = texelSize.y;\n			vec2 uv = shadowCoord.xy;\n			vec2 f = fract( uv * shadowMapSize + 0.5 );\n			uv -= f * texelSize;\n			shadow = (\n				texture2DCompare( shadowMap, uv, shadowCoord.z ) +\n				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +\n				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),\n					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),\n					 f.x ) +\n				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),\n					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),\n					 f.x ) +\n				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),\n					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),\n					 f.y ) +\n				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),\n					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),\n					 f.y ) +\n				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),\n						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),\n						  f.x ),\n					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),\n						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),\n						  f.x ),\n					 f.y )\n			) * ( 1.0 / 9.0 );\n		#elif defined( SHADOWMAP_TYPE_VSM )\n			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );\n		#else\n			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\n		#endif\n		}\n		return shadow;\n	}\n	vec2 cubeToUV( vec3 v, float texelSizeY ) {\n		vec3 absV = abs( v );\n		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n		absV *= scaleToCube;\n		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n		vec2 planar = v.xy;\n		float almostATexel = 1.5 * texelSizeY;\n		float almostOne = 1.0 - almostATexel;\n		if ( absV.z >= almostOne ) {\n			if ( v.z > 0.0 )\n				planar.x = 4.0 - v.x;\n		} else if ( absV.x >= almostOne ) {\n			float signX = sign( v.x );\n			planar.x = v.z * signX + 2.0 * signX;\n		} else if ( absV.y >= almostOne ) {\n			float signY = sign( v.y );\n			planar.x = v.x + 2.0 * signY + 2.0;\n			planar.y = v.z * signY - 2.0;\n		}\n		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n	}\n	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\n		vec3 lightToPosition = shadowCoord.xyz;\n		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;\n		vec3 bd3D = normalize( lightToPosition );\n		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )\n			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\n			return (\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\n			) * ( 1.0 / 9.0 );\n		#else\n			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\n		#endif\n	}\n#endif",
	shadowmap_pars_vertex: "#if NUM_SPOT_LIGHT_COORDS > 0\n	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];\n	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n		struct DirectionalLightShadow {\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n		struct SpotLightShadow {\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n		struct PointLightShadow {\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n			float shadowCameraNear;\n			float shadowCameraFar;\n		};\n		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n	#endif\n#endif",
	shadowmap_vertex: "#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )\n	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n	vec4 shadowWorldPosition;\n#endif\n#if defined( USE_SHADOWMAP )\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );\n			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;\n		}\n		#pragma unroll_loop_end\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );\n			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;\n		}\n		#pragma unroll_loop_end\n	#endif\n#endif\n#if NUM_SPOT_LIGHT_COORDS > 0\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {\n		shadowWorldPosition = worldPosition;\n		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;\n		#endif\n		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;\n	}\n	#pragma unroll_loop_end\n#endif",
	shadowmask_pars_fragment: "float getShadowMask() {\n	float shadow = 1.0;\n	#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n	DirectionalLightShadow directionalLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n		directionalLight = directionalLightShadows[ i ];\n		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n	SpotLightShadow spotLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n		spotLight = spotLightShadows[ i ];\n		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n	PointLightShadow pointLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n		pointLight = pointLightShadows[ i ];\n		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#endif\n	return shadow;\n}",
	skinbase_vertex: "#ifdef USE_SKINNING\n	mat4 boneMatX = getBoneMatrix( skinIndex.x );\n	mat4 boneMatY = getBoneMatrix( skinIndex.y );\n	mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n	mat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif",
	skinning_pars_vertex: "#ifdef USE_SKINNING\n	uniform mat4 bindMatrix;\n	uniform mat4 bindMatrixInverse;\n	uniform highp sampler2D boneTexture;\n	mat4 getBoneMatrix( const in float i ) {\n		int size = textureSize( boneTexture, 0 ).x;\n		int j = int( i ) * 4;\n		int x = j % size;\n		int y = j / size;\n		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );\n		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );\n		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );\n		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );\n		return mat4( v1, v2, v3, v4 );\n	}\n#endif",
	skinning_vertex: "#ifdef USE_SKINNING\n	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n	vec4 skinned = vec4( 0.0 );\n	skinned += boneMatX * skinVertex * skinWeight.x;\n	skinned += boneMatY * skinVertex * skinWeight.y;\n	skinned += boneMatZ * skinVertex * skinWeight.z;\n	skinned += boneMatW * skinVertex * skinWeight.w;\n	transformed = ( bindMatrixInverse * skinned ).xyz;\n#endif",
	skinnormal_vertex: "#ifdef USE_SKINNING\n	mat4 skinMatrix = mat4( 0.0 );\n	skinMatrix += skinWeight.x * boneMatX;\n	skinMatrix += skinWeight.y * boneMatY;\n	skinMatrix += skinWeight.z * boneMatZ;\n	skinMatrix += skinWeight.w * boneMatW;\n	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n	#ifdef USE_TANGENT\n		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n	#endif\n#endif",
	specularmap_fragment: "float specularStrength;\n#ifdef USE_SPECULARMAP\n	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );\n	specularStrength = texelSpecular.r;\n#else\n	specularStrength = 1.0;\n#endif",
	specularmap_pars_fragment: "#ifdef USE_SPECULARMAP\n	uniform sampler2D specularMap;\n#endif",
	tonemapping_fragment: "#if defined( TONE_MAPPING )\n	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif",
	tonemapping_pars_fragment: "#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\nuniform float toneMappingExposure;\nvec3 LinearToneMapping( vec3 color ) {\n	return saturate( toneMappingExposure * color );\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n	color *= toneMappingExposure;\n	return saturate( color / ( vec3( 1.0 ) + color ) );\n}\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n	color *= toneMappingExposure;\n	color = max( vec3( 0.0 ), color - 0.004 );\n	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\nvec3 RRTAndODTFit( vec3 v ) {\n	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n	return a / b;\n}\nvec3 ACESFilmicToneMapping( vec3 color ) {\n	const mat3 ACESInputMat = mat3(\n		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),\n		vec3( 0.04823, 0.01566, 0.83777 )\n	);\n	const mat3 ACESOutputMat = mat3(\n		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),\n		vec3( -0.07367, -0.00605,  1.07602 )\n	);\n	color *= toneMappingExposure / 0.6;\n	color = ACESInputMat * color;\n	color = RRTAndODTFit( color );\n	color = ACESOutputMat * color;\n	return saturate( color );\n}\nconst mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(\n	vec3( 1.6605, - 0.1246, - 0.0182 ),\n	vec3( - 0.5876, 1.1329, - 0.1006 ),\n	vec3( - 0.0728, - 0.0083, 1.1187 )\n);\nconst mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(\n	vec3( 0.6274, 0.0691, 0.0164 ),\n	vec3( 0.3293, 0.9195, 0.0880 ),\n	vec3( 0.0433, 0.0113, 0.8956 )\n);\nvec3 agxDefaultContrastApprox( vec3 x ) {\n	vec3 x2 = x * x;\n	vec3 x4 = x2 * x2;\n	return + 15.5 * x4 * x2\n		- 40.14 * x4 * x\n		+ 31.96 * x4\n		- 6.868 * x2 * x\n		+ 0.4298 * x2\n		+ 0.1191 * x\n		- 0.00232;\n}\nvec3 AgXToneMapping( vec3 color ) {\n	const mat3 AgXInsetMatrix = mat3(\n		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),\n		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),\n		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )\n	);\n	const mat3 AgXOutsetMatrix = mat3(\n		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),\n		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),\n		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )\n	);\n	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;\n	color *= toneMappingExposure;\n	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;\n	color = AgXInsetMatrix * color;\n	color = max( color, 1e-10 );	color = log2( color );\n	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );\n	color = clamp( color, 0.0, 1.0 );\n	color = agxDefaultContrastApprox( color );\n	color = AgXOutsetMatrix * color;\n	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );\n	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;\n	color = clamp( color, 0.0, 1.0 );\n	return color;\n}\nvec3 CustomToneMapping( vec3 color ) { return color; }",
	transmission_fragment: "#ifdef USE_TRANSMISSION\n	material.transmission = transmission;\n	material.transmissionAlpha = 1.0;\n	material.thickness = thickness;\n	material.attenuationDistance = attenuationDistance;\n	material.attenuationColor = attenuationColor;\n	#ifdef USE_TRANSMISSIONMAP\n		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;\n	#endif\n	#ifdef USE_THICKNESSMAP\n		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;\n	#endif\n	vec3 pos = vWorldPosition;\n	vec3 v = normalize( cameraPosition - pos );\n	vec3 n = inverseTransformDirection( normal, viewMatrix );\n	vec4 transmitted = getIBLVolumeRefraction(\n		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,\n		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,\n		material.attenuationColor, material.attenuationDistance );\n	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );\n	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );\n#endif",
	transmission_pars_fragment: "#ifdef USE_TRANSMISSION\n	uniform float transmission;\n	uniform float thickness;\n	uniform float attenuationDistance;\n	uniform vec3 attenuationColor;\n	#ifdef USE_TRANSMISSIONMAP\n		uniform sampler2D transmissionMap;\n	#endif\n	#ifdef USE_THICKNESSMAP\n		uniform sampler2D thicknessMap;\n	#endif\n	uniform vec2 transmissionSamplerSize;\n	uniform sampler2D transmissionSamplerMap;\n	uniform mat4 modelMatrix;\n	uniform mat4 projectionMatrix;\n	varying vec3 vWorldPosition;\n	float w0( float a ) {\n		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );\n	}\n	float w1( float a ) {\n		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );\n	}\n	float w2( float a ){\n		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );\n	}\n	float w3( float a ) {\n		return ( 1.0 / 6.0 ) * ( a * a * a );\n	}\n	float g0( float a ) {\n		return w0( a ) + w1( a );\n	}\n	float g1( float a ) {\n		return w2( a ) + w3( a );\n	}\n	float h0( float a ) {\n		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );\n	}\n	float h1( float a ) {\n		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );\n	}\n	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {\n		uv = uv * texelSize.zw + 0.5;\n		vec2 iuv = floor( uv );\n		vec2 fuv = fract( uv );\n		float g0x = g0( fuv.x );\n		float g1x = g1( fuv.x );\n		float h0x = h0( fuv.x );\n		float h1x = h1( fuv.x );\n		float h0y = h0( fuv.y );\n		float h1y = h1( fuv.y );\n		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +\n			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );\n	}\n	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {\n		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );\n		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );\n		vec2 fLodSizeInv = 1.0 / fLodSize;\n		vec2 cLodSizeInv = 1.0 / cLodSize;\n		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );\n		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );\n		return mix( fSample, cSample, fract( lod ) );\n	}\n	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {\n		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );\n		vec3 modelScale;\n		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );\n		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );\n		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );\n		return normalize( refractionVector ) * thickness * modelScale;\n	}\n	float applyIorToRoughness( const in float roughness, const in float ior ) {\n		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );\n	}\n	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {\n		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );\n		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );\n	}\n	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {\n		if ( isinf( attenuationDistance ) ) {\n			return vec3( 1.0 );\n		} else {\n			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;\n			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;\n		}\n	}\n	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,\n		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,\n		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,\n		const in vec3 attenuationColor, const in float attenuationDistance ) {\n		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );\n		vec3 refractedRayExit = position + transmissionRay;\n		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n		vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n		refractionCoords += 1.0;\n		refractionCoords /= 2.0;\n		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );\n		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );\n		vec3 attenuatedColor = transmittance * transmittedLight.rgb;\n		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );\n		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;\n		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );\n	}\n#endif",
	uv_pars_fragment: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	varying vec2 vUv;\n#endif\n#ifdef USE_MAP\n	varying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n	varying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n	varying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n	varying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n	varying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n	varying vec2 vNormalMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n	varying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n	varying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	varying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	varying vec2 vAnisotropyMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n	varying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	varying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	varying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	varying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	varying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	varying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	varying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n	varying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	varying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	varying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	uniform mat3 transmissionMapTransform;\n	varying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n	uniform mat3 thicknessMapTransform;\n	varying vec2 vThicknessMapUv;\n#endif",
	uv_pars_vertex: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	varying vec2 vUv;\n#endif\n#ifdef USE_MAP\n	uniform mat3 mapTransform;\n	varying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n	uniform mat3 alphaMapTransform;\n	varying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n	uniform mat3 lightMapTransform;\n	varying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n	uniform mat3 aoMapTransform;\n	varying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n	uniform mat3 bumpMapTransform;\n	varying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n	uniform mat3 normalMapTransform;\n	varying vec2 vNormalMapUv;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n	uniform mat3 displacementMapTransform;\n	varying vec2 vDisplacementMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n	uniform mat3 emissiveMapTransform;\n	varying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n	uniform mat3 metalnessMapTransform;\n	varying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	uniform mat3 roughnessMapTransform;\n	varying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	uniform mat3 anisotropyMapTransform;\n	varying vec2 vAnisotropyMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n	uniform mat3 clearcoatMapTransform;\n	varying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	uniform mat3 clearcoatNormalMapTransform;\n	varying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	uniform mat3 clearcoatRoughnessMapTransform;\n	varying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	uniform mat3 sheenColorMapTransform;\n	varying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	uniform mat3 sheenRoughnessMapTransform;\n	varying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	uniform mat3 iridescenceMapTransform;\n	varying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	uniform mat3 iridescenceThicknessMapTransform;\n	varying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n	uniform mat3 specularMapTransform;\n	varying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	uniform mat3 specularColorMapTransform;\n	varying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	uniform mat3 specularIntensityMapTransform;\n	varying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	uniform mat3 transmissionMapTransform;\n	varying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n	uniform mat3 thicknessMapTransform;\n	varying vec2 vThicknessMapUv;\n#endif",
	uv_vertex: "#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	vUv = vec3( uv, 1 ).xy;\n#endif\n#ifdef USE_MAP\n	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ALPHAMAP\n	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_LIGHTMAP\n	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_AOMAP\n	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_BUMPMAP\n	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_NORMALMAP\n	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_EMISSIVEMAP\n	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_METALNESSMAP\n	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOATMAP\n	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULARMAP\n	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_THICKNESSMAP\n	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;\n#endif",
	worldpos_vertex: "#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0\n	vec4 worldPosition = vec4( transformed, 1.0 );\n	#ifdef USE_BATCHING\n		worldPosition = batchingMatrix * worldPosition;\n	#endif\n	#ifdef USE_INSTANCING\n		worldPosition = instanceMatrix * worldPosition;\n	#endif\n	worldPosition = modelMatrix * worldPosition;\n#endif",
	background_vert: "varying vec2 vUv;\nuniform mat3 uvTransform;\nvoid main() {\n	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n	gl_Position = vec4( position.xy, 1.0, 1.0 );\n}",
	background_frag: "uniform sampler2D t2D;\nuniform float backgroundIntensity;\nvarying vec2 vUv;\nvoid main() {\n	vec4 texColor = texture2D( t2D, vUv );\n	#ifdef DECODE_VIDEO_TEXTURE\n		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );\n	#endif\n	texColor.rgb *= backgroundIntensity;\n	gl_FragColor = texColor;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	backgroundCube_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n	gl_Position.z = gl_Position.w;\n}",
	backgroundCube_frag: "#ifdef ENVMAP_TYPE_CUBE\n	uniform samplerCube envMap;\n#elif defined( ENVMAP_TYPE_CUBE_UV )\n	uniform sampler2D envMap;\n#endif\nuniform float flipEnvMap;\nuniform float backgroundBlurriness;\nuniform float backgroundIntensity;\nvarying vec3 vWorldDirection;\n#include <cube_uv_reflection_fragment>\nvoid main() {\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );\n	#elif defined( ENVMAP_TYPE_CUBE_UV )\n		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );\n	#else\n		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n	#endif\n	texColor.rgb *= backgroundIntensity;\n	gl_FragColor = texColor;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	cube_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n	gl_Position.z = gl_Position.w;\n}",
	cube_frag: "uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldDirection;\nvoid main() {\n	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );\n	gl_FragColor = texColor;\n	gl_FragColor.a *= opacity;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	depth_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <skinbase_vertex>\n	#ifdef USE_DISPLACEMENTMAP\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vHighPrecisionZW = gl_Position.zw;\n}",
	depth_frag: "#if DEPTH_PACKING == 3200\n	uniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n	vec4 diffuseColor = vec4( 1.0 );\n	#include <clipping_planes_fragment>\n	#if DEPTH_PACKING == 3200\n		diffuseColor.a = opacity;\n	#endif\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <logdepthbuf_fragment>\n	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;\n	#if DEPTH_PACKING == 3200\n		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );\n	#elif DEPTH_PACKING == 3201\n		gl_FragColor = packDepthToRGBA( fragCoordZ );\n	#endif\n}",
	distanceRGBA_vert: "#define DISTANCE\nvarying vec3 vWorldPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <skinbase_vertex>\n	#ifdef USE_DISPLACEMENTMAP\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <worldpos_vertex>\n	#include <clipping_planes_vertex>\n	vWorldPosition = worldPosition.xyz;\n}",
	distanceRGBA_frag: "#define DISTANCE\nuniform vec3 referencePosition;\nuniform float nearDistance;\nuniform float farDistance;\nvarying vec3 vWorldPosition;\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main () {\n	vec4 diffuseColor = vec4( 1.0 );\n	#include <clipping_planes_fragment>\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	float dist = length( vWorldPosition - referencePosition );\n	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n	dist = saturate( dist );\n	gl_FragColor = packDepthToRGBA( dist );\n}",
	equirect_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n}",
	equirect_frag: "uniform sampler2D tEquirect;\nvarying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vec3 direction = normalize( vWorldDirection );\n	vec2 sampleUV = equirectUv( direction );\n	gl_FragColor = texture2D( tEquirect, sampleUV );\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}",
	linedashed_vert: "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	vLineDistance = scale * lineDistance;\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n}",
	linedashed_frag: "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	if ( mod( vLineDistance, totalSize ) > dashSize ) {\n		discard;\n	}\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}",
	meshbasic_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinbase_vertex>\n		#include <skinnormal_vertex>\n		#include <defaultnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <fog_vertex>\n}",
	meshbasic_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	#ifdef USE_LIGHTMAP\n		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;\n	#else\n		reflectedLight.indirectDiffuse += vec3( 1.0 );\n	#endif\n	#include <aomap_fragment>\n	reflectedLight.indirectDiffuse *= diffuseColor.rgb;\n	vec3 outgoingLight = reflectedLight.indirectDiffuse;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshlambert_vert: "#define LAMBERT\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshlambert_frag: "#define LAMBERT\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_lambert_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_lambert_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshmatcap_vert: "#define MATCAP\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n	vViewPosition = - mvPosition.xyz;\n}",
	meshmatcap_frag: "#define MATCAP\nuniform vec3 diffuse;\nuniform float opacity;\nuniform sampler2D matcap;\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	vec3 viewDir = normalize( vViewPosition );\n	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );\n	vec3 y = cross( viewDir, x );\n	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;\n	#ifdef USE_MATCAP\n		vec4 matcapColor = texture2D( matcap, uv );\n	#else\n		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );\n	#endif\n	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshnormal_vert: "#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	varying vec3 vViewPosition;\n#endif\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	vViewPosition = - mvPosition.xyz;\n#endif\n}",
	meshnormal_frag: "#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	varying vec3 vViewPosition;\n#endif\n#include <packing>\n#include <uv_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );\n	#ifdef OPAQUE\n		gl_FragColor.a = 1.0;\n	#endif\n}",
	meshphong_vert: "#define PHONG\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshphong_frag: "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_phong_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshphysical_vert: "#define STANDARD\nvarying vec3 vViewPosition;\n#ifdef USE_TRANSMISSION\n	varying vec3 vWorldPosition;\n#endif\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n#ifdef USE_TRANSMISSION\n	vWorldPosition = worldPosition.xyz;\n#endif\n}",
	meshphysical_frag: "#define STANDARD\n#ifdef PHYSICAL\n	#define IOR\n	#define USE_SPECULAR\n#endif\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifdef IOR\n	uniform float ior;\n#endif\n#ifdef USE_SPECULAR\n	uniform float specularIntensity;\n	uniform vec3 specularColor;\n	#ifdef USE_SPECULAR_COLORMAP\n		uniform sampler2D specularColorMap;\n	#endif\n	#ifdef USE_SPECULAR_INTENSITYMAP\n		uniform sampler2D specularIntensityMap;\n	#endif\n#endif\n#ifdef USE_CLEARCOAT\n	uniform float clearcoat;\n	uniform float clearcoatRoughness;\n#endif\n#ifdef USE_IRIDESCENCE\n	uniform float iridescence;\n	uniform float iridescenceIOR;\n	uniform float iridescenceThicknessMinimum;\n	uniform float iridescenceThicknessMaximum;\n#endif\n#ifdef USE_SHEEN\n	uniform vec3 sheenColor;\n	uniform float sheenRoughness;\n	#ifdef USE_SHEEN_COLORMAP\n		uniform sampler2D sheenColorMap;\n	#endif\n	#ifdef USE_SHEEN_ROUGHNESSMAP\n		uniform sampler2D sheenRoughnessMap;\n	#endif\n#endif\n#ifdef USE_ANISOTROPY\n	uniform vec2 anisotropyVector;\n	#ifdef USE_ANISOTROPYMAP\n		uniform sampler2D anisotropyMap;\n	#endif\n#endif\nvarying vec3 vViewPosition;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <iridescence_fragment>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_physical_pars_fragment>\n#include <transmission_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <clearcoat_pars_fragment>\n#include <iridescence_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <roughnessmap_fragment>\n	#include <metalnessmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <clearcoat_normal_fragment_begin>\n	#include <clearcoat_normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_physical_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n	#include <transmission_fragment>\n	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;\n	#ifdef USE_SHEEN\n		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );\n		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;\n	#endif\n	#ifdef USE_CLEARCOAT\n		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );\n		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );\n		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;\n	#endif\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	meshtoon_vert: "#define TOON\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	meshtoon_frag: "#define TOON\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_toon_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_toon_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}",
	points_vert: "uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n#ifdef USE_POINTS_UV\n	varying vec2 vUv;\n	uniform mat3 uvTransform;\n#endif\nvoid main() {\n	#ifdef USE_POINTS_UV\n		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n	#endif\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	gl_PointSize = size;\n	#ifdef USE_SIZEATTENUATION\n		bool isPerspective = isPerspectiveMatrix( projectionMatrix );\n		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );\n	#endif\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <fog_vertex>\n}",
	points_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_particle_fragment>\n	#include <color_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}",
	shadow_vert: "#include <common>\n#include <batching_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <shadowmap_pars_vertex>\nvoid main() {\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}",
	shadow_frag: "uniform vec3 color;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <logdepthbuf_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n	#include <logdepthbuf_fragment>\n	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n}",
	sprite_vert: "uniform float rotation;\nuniform vec2 center;\n#include <common>\n#include <uv_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\n	vec2 scale;\n	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );\n	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );\n	#ifndef USE_SIZEATTENUATION\n		bool isPerspective = isPerspectiveMatrix( projectionMatrix );\n		if ( isPerspective ) scale *= - mvPosition.z;\n	#endif\n	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;\n	vec2 rotatedPosition;\n	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\n	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\n	mvPosition.xy += rotatedPosition;\n	gl_Position = projectionMatrix * mvPosition;\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n}",
	sprite_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n}"
}, Q = {
	common: {
		diffuse: { value: /*@__PURE__*/ new X(16777215) },
		opacity: { value: 1 },
		map: { value: null },
		mapTransform: { value: /*@__PURE__*/ new q() },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new q() },
		alphaTest: { value: 0 }
	},
	specularmap: {
		specularMap: { value: null },
		specularMapTransform: { value: /*@__PURE__*/ new q() }
	},
	envmap: {
		envMap: { value: null },
		flipEnvMap: { value: -1 },
		reflectivity: { value: 1 },
		ior: { value: 1.5 },
		refractionRatio: { value: .98 }
	},
	aomap: {
		aoMap: { value: null },
		aoMapIntensity: { value: 1 },
		aoMapTransform: { value: /*@__PURE__*/ new q() }
	},
	lightmap: {
		lightMap: { value: null },
		lightMapIntensity: { value: 1 },
		lightMapTransform: { value: /*@__PURE__*/ new q() }
	},
	bumpmap: {
		bumpMap: { value: null },
		bumpMapTransform: { value: /*@__PURE__*/ new q() },
		bumpScale: { value: 1 }
	},
	normalmap: {
		normalMap: { value: null },
		normalMapTransform: { value: /*@__PURE__*/ new q() },
		normalScale: { value: /*@__PURE__*/ new K(1, 1) }
	},
	displacementmap: {
		displacementMap: { value: null },
		displacementMapTransform: { value: /*@__PURE__*/ new q() },
		displacementScale: { value: 1 },
		displacementBias: { value: 0 }
	},
	emissivemap: {
		emissiveMap: { value: null },
		emissiveMapTransform: { value: /*@__PURE__*/ new q() }
	},
	metalnessmap: {
		metalnessMap: { value: null },
		metalnessMapTransform: { value: /*@__PURE__*/ new q() }
	},
	roughnessmap: {
		roughnessMap: { value: null },
		roughnessMapTransform: { value: /*@__PURE__*/ new q() }
	},
	gradientmap: { gradientMap: { value: null } },
	fog: {
		fogDensity: { value: 25e-5 },
		fogNear: { value: 1 },
		fogFar: { value: 2e3 },
		fogColor: { value: /*@__PURE__*/ new X(16777215) }
	},
	lights: {
		ambientLightColor: { value: [] },
		lightProbe: { value: [] },
		directionalLights: {
			value: [],
			properties: {
				direction: {},
				color: {}
			}
		},
		directionalLightShadows: {
			value: [],
			properties: {
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			}
		},
		directionalShadowMap: { value: [] },
		directionalShadowMatrix: { value: [] },
		spotLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				direction: {},
				distance: {},
				coneCos: {},
				penumbraCos: {},
				decay: {}
			}
		},
		spotLightShadows: {
			value: [],
			properties: {
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			}
		},
		spotLightMap: { value: [] },
		spotShadowMap: { value: [] },
		spotLightMatrix: { value: [] },
		pointLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				decay: {},
				distance: {}
			}
		},
		pointLightShadows: {
			value: [],
			properties: {
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {},
				shadowCameraNear: {},
				shadowCameraFar: {}
			}
		},
		pointShadowMap: { value: [] },
		pointShadowMatrix: { value: [] },
		hemisphereLights: {
			value: [],
			properties: {
				direction: {},
				skyColor: {},
				groundColor: {}
			}
		},
		rectAreaLights: {
			value: [],
			properties: {
				color: {},
				position: {},
				width: {},
				height: {}
			}
		},
		ltc_1: { value: null },
		ltc_2: { value: null }
	},
	points: {
		diffuse: { value: /*@__PURE__*/ new X(16777215) },
		opacity: { value: 1 },
		size: { value: 1 },
		scale: { value: 1 },
		map: { value: null },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new q() },
		alphaTest: { value: 0 },
		uvTransform: { value: /*@__PURE__*/ new q() }
	},
	sprite: {
		diffuse: { value: /*@__PURE__*/ new X(16777215) },
		opacity: { value: 1 },
		center: { value: /*@__PURE__*/ new K(.5, .5) },
		rotation: { value: 0 },
		map: { value: null },
		mapTransform: { value: /*@__PURE__*/ new q() },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new q() },
		alphaTest: { value: 0 }
	}
}, ei = {
	basic: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.specularmap,
			Q.envmap,
			Q.aomap,
			Q.lightmap,
			Q.fog
		]),
		vertexShader: Z.meshbasic_vert,
		fragmentShader: Z.meshbasic_frag
	},
	lambert: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.specularmap,
			Q.envmap,
			Q.aomap,
			Q.lightmap,
			Q.emissivemap,
			Q.bumpmap,
			Q.normalmap,
			Q.displacementmap,
			Q.fog,
			Q.lights,
			{ emissive: { value: /*@__PURE__*/ new X(0) } }
		]),
		vertexShader: Z.meshlambert_vert,
		fragmentShader: Z.meshlambert_frag
	},
	phong: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.specularmap,
			Q.envmap,
			Q.aomap,
			Q.lightmap,
			Q.emissivemap,
			Q.bumpmap,
			Q.normalmap,
			Q.displacementmap,
			Q.fog,
			Q.lights,
			{
				emissive: { value: /*@__PURE__*/ new X(0) },
				specular: { value: /*@__PURE__*/ new X(1118481) },
				shininess: { value: 30 }
			}
		]),
		vertexShader: Z.meshphong_vert,
		fragmentShader: Z.meshphong_frag
	},
	standard: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.envmap,
			Q.aomap,
			Q.lightmap,
			Q.emissivemap,
			Q.bumpmap,
			Q.normalmap,
			Q.displacementmap,
			Q.roughnessmap,
			Q.metalnessmap,
			Q.fog,
			Q.lights,
			{
				emissive: { value: /*@__PURE__*/ new X(0) },
				roughness: { value: 1 },
				metalness: { value: 0 },
				envMapIntensity: { value: 1 }
			}
		]),
		vertexShader: Z.meshphysical_vert,
		fragmentShader: Z.meshphysical_frag
	},
	toon: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.aomap,
			Q.lightmap,
			Q.emissivemap,
			Q.bumpmap,
			Q.normalmap,
			Q.displacementmap,
			Q.gradientmap,
			Q.fog,
			Q.lights,
			{ emissive: { value: /*@__PURE__*/ new X(0) } }
		]),
		vertexShader: Z.meshtoon_vert,
		fragmentShader: Z.meshtoon_frag
	},
	matcap: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.bumpmap,
			Q.normalmap,
			Q.displacementmap,
			Q.fog,
			{ matcap: { value: null } }
		]),
		vertexShader: Z.meshmatcap_vert,
		fragmentShader: Z.meshmatcap_frag
	},
	points: {
		uniforms: /*@__PURE__*/ Dr([Q.points, Q.fog]),
		vertexShader: Z.points_vert,
		fragmentShader: Z.points_frag
	},
	dashed: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.fog,
			{
				scale: { value: 1 },
				dashSize: { value: 1 },
				totalSize: { value: 2 }
			}
		]),
		vertexShader: Z.linedashed_vert,
		fragmentShader: Z.linedashed_frag
	},
	depth: {
		uniforms: /*@__PURE__*/ Dr([Q.common, Q.displacementmap]),
		vertexShader: Z.depth_vert,
		fragmentShader: Z.depth_frag
	},
	normal: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.bumpmap,
			Q.normalmap,
			Q.displacementmap,
			{ opacity: { value: 1 } }
		]),
		vertexShader: Z.meshnormal_vert,
		fragmentShader: Z.meshnormal_frag
	},
	sprite: {
		uniforms: /*@__PURE__*/ Dr([Q.sprite, Q.fog]),
		vertexShader: Z.sprite_vert,
		fragmentShader: Z.sprite_frag
	},
	background: {
		uniforms: {
			uvTransform: { value: /*@__PURE__*/ new q() },
			t2D: { value: null },
			backgroundIntensity: { value: 1 }
		},
		vertexShader: Z.background_vert,
		fragmentShader: Z.background_frag
	},
	backgroundCube: {
		uniforms: {
			envMap: { value: null },
			flipEnvMap: { value: -1 },
			backgroundBlurriness: { value: 0 },
			backgroundIntensity: { value: 1 }
		},
		vertexShader: Z.backgroundCube_vert,
		fragmentShader: Z.backgroundCube_frag
	},
	cube: {
		uniforms: {
			tCube: { value: null },
			tFlip: { value: -1 },
			opacity: { value: 1 }
		},
		vertexShader: Z.cube_vert,
		fragmentShader: Z.cube_frag
	},
	equirect: {
		uniforms: { tEquirect: { value: null } },
		vertexShader: Z.equirect_vert,
		fragmentShader: Z.equirect_frag
	},
	distanceRGBA: {
		uniforms: /*@__PURE__*/ Dr([
			Q.common,
			Q.displacementmap,
			{
				referencePosition: { value: /*@__PURE__*/ new Y() },
				nearDistance: { value: 1 },
				farDistance: { value: 1e3 }
			}
		]),
		vertexShader: Z.distanceRGBA_vert,
		fragmentShader: Z.distanceRGBA_frag
	},
	shadow: {
		uniforms: /*@__PURE__*/ Dr([
			Q.lights,
			Q.fog,
			{
				color: { value: /*@__PURE__*/ new X(0) },
				opacity: { value: 1 }
			}
		]),
		vertexShader: Z.shadow_vert,
		fragmentShader: Z.shadow_frag
	}
};
ei.physical = {
	uniforms: /*@__PURE__*/ Dr([ei.standard.uniforms, {
		clearcoat: { value: 0 },
		clearcoatMap: { value: null },
		clearcoatMapTransform: { value: /*@__PURE__*/ new q() },
		clearcoatNormalMap: { value: null },
		clearcoatNormalMapTransform: { value: /*@__PURE__*/ new q() },
		clearcoatNormalScale: { value: /*@__PURE__*/ new K(1, 1) },
		clearcoatRoughness: { value: 0 },
		clearcoatRoughnessMap: { value: null },
		clearcoatRoughnessMapTransform: { value: /*@__PURE__*/ new q() },
		iridescence: { value: 0 },
		iridescenceMap: { value: null },
		iridescenceMapTransform: { value: /*@__PURE__*/ new q() },
		iridescenceIOR: { value: 1.3 },
		iridescenceThicknessMinimum: { value: 100 },
		iridescenceThicknessMaximum: { value: 400 },
		iridescenceThicknessMap: { value: null },
		iridescenceThicknessMapTransform: { value: /*@__PURE__*/ new q() },
		sheen: { value: 0 },
		sheenColor: { value: /*@__PURE__*/ new X(0) },
		sheenColorMap: { value: null },
		sheenColorMapTransform: { value: /*@__PURE__*/ new q() },
		sheenRoughness: { value: 1 },
		sheenRoughnessMap: { value: null },
		sheenRoughnessMapTransform: { value: /*@__PURE__*/ new q() },
		transmission: { value: 0 },
		transmissionMap: { value: null },
		transmissionMapTransform: { value: /*@__PURE__*/ new q() },
		transmissionSamplerSize: { value: /*@__PURE__*/ new K() },
		transmissionSamplerMap: { value: null },
		thickness: { value: 0 },
		thicknessMap: { value: null },
		thicknessMapTransform: { value: /*@__PURE__*/ new q() },
		attenuationDistance: { value: 0 },
		attenuationColor: { value: /*@__PURE__*/ new X(0) },
		specularColor: { value: /*@__PURE__*/ new X(1, 1, 1) },
		specularColorMap: { value: null },
		specularColorMapTransform: { value: /*@__PURE__*/ new q() },
		specularIntensity: { value: 1 },
		specularIntensityMap: { value: null },
		specularIntensityMapTransform: { value: /*@__PURE__*/ new q() },
		anisotropyVector: { value: /*@__PURE__*/ new K() },
		anisotropyMap: { value: null },
		anisotropyMapTransform: { value: /*@__PURE__*/ new q() }
	}]),
	vertexShader: Z.meshphysical_vert,
	fragmentShader: Z.meshphysical_frag
};
var ti = {
	r: 0,
	b: 0,
	g: 0
};
function ni(e, t, n, r, i, a, o) {
	let s = new X(0), c = a === !0 ? 0 : 1, l, u, d = null, f = 0, p = null;
	function m(a, m) {
		let g = !1, _ = m.isScene === !0 ? m.background : null;
		_ && _.isTexture && (_ = (m.backgroundBlurriness > 0 ? n : t).get(_)), _ === null ? h(s, c) : _ && _.isColor && (h(_, 1), g = !0);
		let v = e.xr.getEnvironmentBlendMode();
		v === "additive" ? r.buffers.color.setClear(0, 0, 0, 1, o) : v === "alpha-blend" && r.buffers.color.setClear(0, 0, 0, 0, o), (e.autoClear || g) && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), _ && (_.isCubeTexture || _.mapping === 306) ? (u === void 0 && (u = new Sr(new Tr(1, 1, 1), new Nr({
			name: "BackgroundCubeMaterial",
			uniforms: Er(ei.backgroundCube.uniforms),
			vertexShader: ei.backgroundCube.vertexShader,
			fragmentShader: ei.backgroundCube.fragmentShader,
			side: 1,
			depthTest: !1,
			depthWrite: !1,
			fog: !1
		})), u.geometry.deleteAttribute("normal"), u.geometry.deleteAttribute("uv"), u.onBeforeRender = function(e, t, n) {
			this.matrixWorld.copyPosition(n.matrixWorld);
		}, Object.defineProperty(u.material, "envMap", { get: function() {
			return this.uniforms.envMap.value;
		} }), i.update(u)), u.material.uniforms.envMap.value = _, u.material.uniforms.flipEnvMap.value = _.isCubeTexture && _.isRenderTargetTexture === !1 ? -1 : 1, u.material.uniforms.backgroundBlurriness.value = m.backgroundBlurriness, u.material.uniforms.backgroundIntensity.value = m.backgroundIntensity, u.material.toneMapped = J.getTransfer(_.colorSpace) !== be, (d !== _ || f !== _.version || p !== e.toneMapping) && (u.material.needsUpdate = !0, d = _, f = _.version, p = e.toneMapping), u.layers.enableAll(), a.unshift(u, u.geometry, u.material, 0, 0, null)) : _ && _.isTexture && (l === void 0 && (l = new Sr(new $r(2, 2), new Nr({
			name: "BackgroundMaterial",
			uniforms: Er(ei.background.uniforms),
			vertexShader: ei.background.vertexShader,
			fragmentShader: ei.background.fragmentShader,
			side: 0,
			depthTest: !1,
			depthWrite: !1,
			fog: !1
		})), l.geometry.deleteAttribute("normal"), Object.defineProperty(l.material, "map", { get: function() {
			return this.uniforms.t2D.value;
		} }), i.update(l)), l.material.uniforms.t2D.value = _, l.material.uniforms.backgroundIntensity.value = m.backgroundIntensity, l.material.toneMapped = J.getTransfer(_.colorSpace) !== be, _.matrixAutoUpdate === !0 && _.updateMatrix(), l.material.uniforms.uvTransform.value.copy(_.matrix), (d !== _ || f !== _.version || p !== e.toneMapping) && (l.material.needsUpdate = !0, d = _, f = _.version, p = e.toneMapping), l.layers.enableAll(), a.unshift(l, l.geometry, l.material, 0, 0, null));
	}
	function h(t, n) {
		t.getRGB(ti, kr(e)), r.buffers.color.setClear(ti.r, ti.g, ti.b, n, o);
	}
	return {
		getClearColor: function() {
			return s;
		},
		setClearColor: function(e, t = 1) {
			s.set(e), c = t, h(s, c);
		},
		getClearAlpha: function() {
			return c;
		},
		setClearAlpha: function(e) {
			c = e, h(s, c);
		},
		render: m
	};
}
function ri(e, t, n, r) {
	let i = e.getParameter(e.MAX_VERTEX_ATTRIBS), a = r.isWebGL2 ? null : t.get("OES_vertex_array_object"), o = r.isWebGL2 || a !== null, s = {}, c = g(null), l = c, u = !1;
	function d(t, r, i, a, s) {
		let c = !1;
		if (o) {
			let e = h(a, i, r);
			l !== e && (l = e, p(l.object)), c = _(t, a, i, s), c && v(t, a, i, s);
		} else {
			let e = r.wireframe === !0;
			(l.geometry !== a.id || l.program !== i.id || l.wireframe !== e) && (l.geometry = a.id, l.program = i.id, l.wireframe = e, c = !0);
		}
		s !== null && n.update(s, e.ELEMENT_ARRAY_BUFFER), (c || u) && (u = !1, w(t, r, i, a), s !== null && e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, n.get(s).buffer));
	}
	function f() {
		return r.isWebGL2 ? e.createVertexArray() : a.createVertexArrayOES();
	}
	function p(t) {
		return r.isWebGL2 ? e.bindVertexArray(t) : a.bindVertexArrayOES(t);
	}
	function m(t) {
		return r.isWebGL2 ? e.deleteVertexArray(t) : a.deleteVertexArrayOES(t);
	}
	function h(e, t, n) {
		let r = n.wireframe === !0, i = s[e.id];
		i === void 0 && (i = {}, s[e.id] = i);
		let a = i[t.id];
		a === void 0 && (a = {}, i[t.id] = a);
		let o = a[r];
		return o === void 0 && (o = g(f()), a[r] = o), o;
	}
	function g(e) {
		let t = [], n = [], r = [];
		for (let e = 0; e < i; e++) t[e] = 0, n[e] = 0, r[e] = 0;
		return {
			geometry: null,
			program: null,
			wireframe: !1,
			newAttributes: t,
			enabledAttributes: n,
			attributeDivisors: r,
			object: e,
			attributes: {},
			index: null
		};
	}
	function _(e, t, n, r) {
		let i = l.attributes, a = t.attributes, o = 0, s = n.getAttributes();
		for (let t in s) if (s[t].location >= 0) {
			let n = i[t], r = a[t];
			if (r === void 0 && (t === "instanceMatrix" && e.instanceMatrix && (r = e.instanceMatrix), t === "instanceColor" && e.instanceColor && (r = e.instanceColor)), n === void 0 || n.attribute !== r || r && n.data !== r.data) return !0;
			o++;
		}
		return l.attributesNum !== o || l.index !== r;
	}
	function v(e, t, n, r) {
		let i = {}, a = t.attributes, o = 0, s = n.getAttributes();
		for (let t in s) if (s[t].location >= 0) {
			let n = a[t];
			n === void 0 && (t === "instanceMatrix" && e.instanceMatrix && (n = e.instanceMatrix), t === "instanceColor" && e.instanceColor && (n = e.instanceColor));
			let r = {};
			r.attribute = n, n && n.data && (r.data = n.data), i[t] = r, o++;
		}
		l.attributes = i, l.attributesNum = o, l.index = r;
	}
	function y() {
		let e = l.newAttributes;
		for (let t = 0, n = e.length; t < n; t++) e[t] = 0;
	}
	function b(e) {
		x(e, 0);
	}
	function x(n, i) {
		let a = l.newAttributes, o = l.enabledAttributes, s = l.attributeDivisors;
		a[n] = 1, o[n] === 0 && (e.enableVertexAttribArray(n), o[n] = 1), s[n] !== i && ((r.isWebGL2 ? e : t.get("ANGLE_instanced_arrays"))[r.isWebGL2 ? "vertexAttribDivisor" : "vertexAttribDivisorANGLE"](n, i), s[n] = i);
	}
	function S() {
		let t = l.newAttributes, n = l.enabledAttributes;
		for (let r = 0, i = n.length; r < i; r++) n[r] !== t[r] && (e.disableVertexAttribArray(r), n[r] = 0);
	}
	function C(t, n, r, i, a, o, s) {
		s === !0 ? e.vertexAttribIPointer(t, n, r, a, o) : e.vertexAttribPointer(t, n, r, i, a, o);
	}
	function w(i, a, o, s) {
		if (r.isWebGL2 === !1 && (i.isInstancedMesh || s.isInstancedBufferGeometry) && t.get("ANGLE_instanced_arrays") === null) return;
		y();
		let c = s.attributes, l = o.getAttributes(), u = a.defaultAttributeValues;
		for (let t in l) {
			let a = l[t];
			if (a.location >= 0) {
				let o = c[t];
				if (o === void 0 && (t === "instanceMatrix" && i.instanceMatrix && (o = i.instanceMatrix), t === "instanceColor" && i.instanceColor && (o = i.instanceColor)), o !== void 0) {
					let t = o.normalized, c = o.itemSize, l = n.get(o);
					if (l === void 0) continue;
					let u = l.buffer, d = l.type, f = l.bytesPerElement, p = r.isWebGL2 === !0 && (d === e.INT || d === e.UNSIGNED_INT || o.gpuType === 1013);
					if (o.isInterleavedBufferAttribute) {
						let n = o.data, r = n.stride, l = o.offset;
						if (n.isInstancedInterleavedBuffer) {
							for (let e = 0; e < a.locationSize; e++) x(a.location + e, n.meshPerAttribute);
							i.isInstancedMesh !== !0 && s._maxInstanceCount === void 0 && (s._maxInstanceCount = n.meshPerAttribute * n.count);
						} else for (let e = 0; e < a.locationSize; e++) b(a.location + e);
						e.bindBuffer(e.ARRAY_BUFFER, u);
						for (let e = 0; e < a.locationSize; e++) C(a.location + e, c / a.locationSize, d, t, r * f, (l + c / a.locationSize * e) * f, p);
					} else {
						if (o.isInstancedBufferAttribute) {
							for (let e = 0; e < a.locationSize; e++) x(a.location + e, o.meshPerAttribute);
							i.isInstancedMesh !== !0 && s._maxInstanceCount === void 0 && (s._maxInstanceCount = o.meshPerAttribute * o.count);
						} else for (let e = 0; e < a.locationSize; e++) b(a.location + e);
						e.bindBuffer(e.ARRAY_BUFFER, u);
						for (let e = 0; e < a.locationSize; e++) C(a.location + e, c / a.locationSize, d, t, c * f, c / a.locationSize * e * f, p);
					}
				} else if (u !== void 0) {
					let n = u[t];
					if (n !== void 0) switch (n.length) {
						case 2:
							e.vertexAttrib2fv(a.location, n);
							break;
						case 3:
							e.vertexAttrib3fv(a.location, n);
							break;
						case 4:
							e.vertexAttrib4fv(a.location, n);
							break;
						default: e.vertexAttrib1fv(a.location, n);
					}
				}
			}
		}
		S();
	}
	function T() {
		O();
		for (let e in s) {
			let t = s[e];
			for (let e in t) {
				let n = t[e];
				for (let e in n) m(n[e].object), delete n[e];
				delete t[e];
			}
			delete s[e];
		}
	}
	function E(e) {
		if (s[e.id] === void 0) return;
		let t = s[e.id];
		for (let e in t) {
			let n = t[e];
			for (let e in n) m(n[e].object), delete n[e];
			delete t[e];
		}
		delete s[e.id];
	}
	function D(e) {
		for (let t in s) {
			let n = s[t];
			if (n[e.id] === void 0) continue;
			let r = n[e.id];
			for (let e in r) m(r[e].object), delete r[e];
			delete n[e.id];
		}
	}
	function O() {
		k(), u = !0, l !== c && (l = c, p(l.object));
	}
	function k() {
		c.geometry = null, c.program = null, c.wireframe = !1;
	}
	return {
		setup: d,
		reset: O,
		resetDefaultState: k,
		dispose: T,
		releaseStatesOfGeometry: E,
		releaseStatesOfProgram: D,
		initAttributes: y,
		enableAttribute: b,
		disableUnusedAttributes: S
	};
}
function ii(e, t, n, r) {
	let i = r.isWebGL2, a;
	function o(e) {
		a = e;
	}
	function s(t, r) {
		e.drawArrays(a, t, r), n.update(r, a, 1);
	}
	function c(r, o, s) {
		if (s === 0) return;
		let c, l;
		if (i) c = e, l = "drawArraysInstanced";
		else if (c = t.get("ANGLE_instanced_arrays"), l = "drawArraysInstancedANGLE", c === null) {
			console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
			return;
		}
		c[l](a, r, o, s), n.update(o, a, s);
	}
	function l(e, r, i) {
		if (i === 0) return;
		let o = t.get("WEBGL_multi_draw");
		if (o === null) for (let t = 0; t < i; t++) this.render(e[t], r[t]);
		else {
			o.multiDrawArraysWEBGL(a, e, 0, r, 0, i);
			let t = 0;
			for (let e = 0; e < i; e++) t += r[e];
			n.update(t, a, 1);
		}
	}
	this.setMode = o, this.render = s, this.renderInstances = c, this.renderMultiDraw = l;
}
function ai(e, t, n) {
	let r;
	function i() {
		if (r !== void 0) return r;
		if (t.has("EXT_texture_filter_anisotropic") === !0) {
			let n = t.get("EXT_texture_filter_anisotropic");
			r = e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
		} else r = 0;
		return r;
	}
	function a(t) {
		if (t === "highp") {
			if (e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision > 0) return "highp";
			t = "mediump";
		}
		return t === "mediump" && e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
	}
	let o = typeof WebGL2RenderingContext < "u" && e.constructor.name === "WebGL2RenderingContext", s = n.precision === void 0 ? "highp" : n.precision, c = a(s);
	c !== s && (console.warn("THREE.WebGLRenderer:", s, "not supported, using", c, "instead."), s = c);
	let l = o || t.has("WEBGL_draw_buffers"), u = n.logarithmicDepthBuffer === !0, d = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), f = e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS), p = e.getParameter(e.MAX_TEXTURE_SIZE), m = e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE), h = e.getParameter(e.MAX_VERTEX_ATTRIBS), g = e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS), _ = e.getParameter(e.MAX_VARYING_VECTORS), v = e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS), y = f > 0, b = o || t.has("OES_texture_float"), x = y && b, S = o ? e.getParameter(e.MAX_SAMPLES) : 0;
	return {
		isWebGL2: o,
		drawBuffers: l,
		getMaxAnisotropy: i,
		getMaxPrecision: a,
		precision: s,
		logarithmicDepthBuffer: u,
		maxTextures: d,
		maxVertexTextures: f,
		maxTextureSize: p,
		maxCubemapSize: m,
		maxAttributes: h,
		maxVertexUniforms: g,
		maxVaryings: _,
		maxFragmentUniforms: v,
		vertexTextures: y,
		floatFragmentTextures: b,
		floatVertexTextures: x,
		maxSamples: S
	};
}
function oi(e) {
	let t = this, n = null, r = 0, i = !1, a = !1, o = new qr(), s = new q(), c = {
		value: null,
		needsUpdate: !1
	};
	this.uniform = c, this.numPlanes = 0, this.numIntersection = 0, this.init = function(e, t) {
		let n = e.length !== 0 || t || r !== 0 || i;
		return i = t, r = e.length, n;
	}, this.beginShadows = function() {
		a = !0, u(null);
	}, this.endShadows = function() {
		a = !1;
	}, this.setGlobalState = function(e, t) {
		n = u(e, t, 0);
	}, this.setState = function(t, o, s) {
		let d = t.clippingPlanes, f = t.clipIntersection, p = t.clipShadows, m = e.get(t);
		if (!i || d === null || d.length === 0 || a && !p) a ? u(null) : l();
		else {
			let e = a ? 0 : r, t = e * 4, i = m.clippingState || null;
			c.value = i, i = u(d, o, t, s);
			for (let e = 0; e !== t; ++e) i[e] = n[e];
			m.clippingState = i, this.numIntersection = f ? this.numPlanes : 0, this.numPlanes += e;
		}
	};
	function l() {
		c.value !== n && (c.value = n, c.needsUpdate = r > 0), t.numPlanes = r, t.numIntersection = 0;
	}
	function u(e, n, r, i) {
		let a = e === null ? 0 : e.length, l = null;
		if (a !== 0) {
			if (l = c.value, i !== !0 || l === null) {
				let t = r + a * 4, i = n.matrixWorldInverse;
				s.getNormalMatrix(i), (l === null || l.length < t) && (l = new Float32Array(t));
				for (let t = 0, n = r; t !== a; ++t, n += 4) o.copy(e[t]).applyMatrix4(i, s), o.normal.toArray(l, n), l[n + 3] = o.constant;
			}
			c.value = l, c.needsUpdate = !0;
		}
		return t.numPlanes = a, t.numIntersection = 0, l;
	}
}
function si(e) {
	let t = /* @__PURE__ */ new WeakMap();
	function n(e, t) {
		return t === 303 ? e.mapping = 301 : t === 304 && (e.mapping = 302), e;
	}
	function r(r) {
		if (r && r.isTexture) {
			let a = r.mapping;
			if (a === 303 || a === 304) {
				if (t.has(r)) {
					let e = t.get(r).texture;
					return n(e, r.mapping);
				}
				{
					let a = r.image;
					if (a && a.height > 0) {
						let o = new Ur(a.height);
						return o.fromEquirectangularTexture(e, r), t.set(r, o), r.addEventListener("dispose", i), n(o.texture, r.mapping);
					}
					return null;
				}
			}
		}
		return r;
	}
	function i(e) {
		let n = e.target;
		n.removeEventListener("dispose", i);
		let r = t.get(n);
		r !== void 0 && (t.delete(n), r.dispose());
	}
	function a() {
		t = /* @__PURE__ */ new WeakMap();
	}
	return {
		get: r,
		dispose: a
	};
}
var ci = class extends Pr {
	constructor(e = -1, t = 1, n = 1, r = -1, i = .1, a = 2e3) {
		super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = r, this.near = i, this.far = a, this.updateProjectionMatrix();
	}
	copy(e, t) {
		return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
	}
	setViewOffset(e, t, n, r, i, a) {
		this.view === null && (this.view = {
			enabled: !0,
			fullWidth: 1,
			fullHeight: 1,
			offsetX: 0,
			offsetY: 0,
			width: 1,
			height: 1
		}), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = i, this.view.height = a, this.updateProjectionMatrix();
	}
	clearViewOffset() {
		this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
	}
	updateProjectionMatrix() {
		let e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, r = (this.top + this.bottom) / 2, i = n - e, a = n + e, o = r + t, s = r - t;
		if (this.view !== null && this.view.enabled) {
			let e = (this.right - this.left) / this.view.fullWidth / this.zoom, t = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
			i += e * this.view.offsetX, a = i + e * this.view.width, o -= t * this.view.offsetY, s = o - t * this.view.height;
		}
		this.projectionMatrix.makeOrthographic(i, a, o, s, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
	}
}, li = 4, ui = [
	.125,
	.215,
	.35,
	.446,
	.526,
	.582
], di = 20, fi = /*@__PURE__*/ new ci(), pi = /*@__PURE__*/ new X(), mi = null, hi = 0, gi = 0, _i = (1 + Math.sqrt(5)) / 2, vi = 1 / _i, yi = [
	/*@__PURE__*/ new Y(1, 1, 1),
	/*@__PURE__*/ new Y(-1, 1, 1),
	/*@__PURE__*/ new Y(1, 1, -1),
	/*@__PURE__*/ new Y(-1, 1, -1),
	/*@__PURE__*/ new Y(0, _i, vi),
	/*@__PURE__*/ new Y(0, _i, -vi),
	/*@__PURE__*/ new Y(vi, 0, _i),
	/*@__PURE__*/ new Y(-vi, 0, _i),
	/*@__PURE__*/ new Y(_i, vi, 0),
	/*@__PURE__*/ new Y(-_i, vi, 0)
], bi = class {
	constructor(e) {
		this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
	}
	fromScene(e, t = 0, n = .1, r = 100) {
		mi = this._renderer.getRenderTarget(), hi = this._renderer.getActiveCubeFace(), gi = this._renderer.getActiveMipmapLevel(), this._setSize(256);
		let i = this._allocateTargets();
		return i.depthBuffer = !0, this._sceneToCubeUV(e, n, r, i), t > 0 && this._blur(i, 0, 0, t), this._applyPMREM(i), this._cleanup(i), i;
	}
	fromEquirectangular(e, t = null) {
		return this._fromTexture(e, t);
	}
	fromCubemap(e, t = null) {
		return this._fromTexture(e, t);
	}
	compileCubemapShader() {
		this._cubemapMaterial === null && (this._cubemapMaterial = Ei(), this._compileMaterial(this._cubemapMaterial));
	}
	compileEquirectangularShader() {
		this._equirectMaterial === null && (this._equirectMaterial = Ti(), this._compileMaterial(this._equirectMaterial));
	}
	dispose() {
		this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
	}
	_setSize(e) {
		this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = 2 ** this._lodMax;
	}
	_dispose() {
		this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
		for (let e = 0; e < this._lodPlanes.length; e++) this._lodPlanes[e].dispose();
	}
	_cleanup(e) {
		this._renderer.setRenderTarget(mi, hi, gi), e.scissorTest = !1, Ci(e, 0, 0, e.width, e.height);
	}
	_fromTexture(e, t) {
		e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), mi = this._renderer.getRenderTarget(), hi = this._renderer.getActiveCubeFace(), gi = this._renderer.getActiveMipmapLevel();
		let n = t || this._allocateTargets();
		return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
	}
	_allocateTargets() {
		let e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
			magFilter: ie,
			minFilter: ie,
			generateMipmaps: !1,
			type: le,
			format: I,
			colorSpace: _e,
			depthBuffer: !1
		}, r = Si(e, t, n);
		if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
			this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Si(e, t, n);
			let { _lodMax: r } = this;
			({sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas} = xi(r)), this._blurMaterial = wi(r, e, t);
		}
		return r;
	}
	_compileMaterial(e) {
		let t = new Sr(this._lodPlanes[0], e);
		this._renderer.compile(t, fi);
	}
	_sceneToCubeUV(e, t, n, r) {
		let i = new Rr(90, 1, t, n), a = [
			1,
			-1,
			1,
			1,
			1,
			1
		], o = [
			1,
			1,
			1,
			-1,
			-1,
			-1
		], s = this._renderer, c = s.autoClear, l = s.toneMapping;
		s.getClearColor(pi), s.toneMapping = 0, s.autoClear = !1;
		let u = new Wn({
			name: "PMREM.Background",
			side: 1,
			depthWrite: !1,
			depthTest: !1
		}), d = new Sr(new Tr(), u), f = !1, p = e.background;
		p ? p.isColor && (u.color.copy(p), e.background = null, f = !0) : (u.color.copy(pi), f = !0);
		for (let t = 0; t < 6; t++) {
			let n = t % 3;
			n === 0 ? (i.up.set(0, a[t], 0), i.lookAt(o[t], 0, 0)) : n === 1 ? (i.up.set(0, 0, a[t]), i.lookAt(0, o[t], 0)) : (i.up.set(0, a[t], 0), i.lookAt(0, 0, o[t]));
			let c = this._cubeSize;
			Ci(r, n * c, t > 2 ? c : 0, c, c), s.setRenderTarget(r), f && s.render(d, i), s.render(e, i);
		}
		d.geometry.dispose(), d.material.dispose(), s.toneMapping = l, s.autoClear = c, e.background = p;
	}
	_textureToCubeUV(e, t) {
		let n = this._renderer, r = e.mapping === 301 || e.mapping === 302;
		r ? (this._cubemapMaterial === null && (this._cubemapMaterial = Ei()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Ti());
		let i = r ? this._cubemapMaterial : this._equirectMaterial, a = new Sr(this._lodPlanes[0], i), o = i.uniforms;
		o.envMap.value = e;
		let s = this._cubeSize;
		Ci(t, 0, 0, 3 * s, 2 * s), n.setRenderTarget(t), n.render(a, fi);
	}
	_applyPMREM(e) {
		let t = this._renderer, n = t.autoClear;
		t.autoClear = !1;
		for (let t = 1; t < this._lodPlanes.length; t++) {
			let n = Math.sqrt(this._sigmas[t] * this._sigmas[t] - this._sigmas[t - 1] * this._sigmas[t - 1]), r = yi[(t - 1) % yi.length];
			this._blur(e, t - 1, t, n, r);
		}
		t.autoClear = n;
	}
	_blur(e, t, n, r, i) {
		let a = this._pingPongRenderTarget;
		this._halfBlur(e, a, t, n, r, "latitudinal", i), this._halfBlur(a, e, n, n, r, "longitudinal", i);
	}
	_halfBlur(e, t, n, r, i, a, o) {
		let s = this._renderer, c = this._blurMaterial;
		a !== "latitudinal" && a !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
		let l = new Sr(this._lodPlanes[r], c), u = c.uniforms, d = this._sizeLods[n] - 1, f = isFinite(i) ? Math.PI / (2 * d) : 2 * Math.PI / 39, p = i / f, m = isFinite(i) ? 1 + Math.floor(3 * p) : di;
		m > di && console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${di}`);
		let h = [], g = 0;
		for (let e = 0; e < di; ++e) {
			let t = e / p, n = Math.exp(-t * t / 2);
			h.push(n), e === 0 ? g += n : e < m && (g += 2 * n);
		}
		for (let e = 0; e < h.length; e++) h[e] = h[e] / g;
		u.envMap.value = e.texture, u.samples.value = m, u.weights.value = h, u.latitudinal.value = a === "latitudinal", o && (u.poleAxis.value = o);
		let { _lodMax: _ } = this;
		u.dTheta.value = f, u.mipInt.value = _ - n;
		let v = this._sizeLods[r];
		Ci(t, 3 * v * (r > _ - li ? r - _ + li : 0), 4 * (this._cubeSize - v), 3 * v, 2 * v), s.setRenderTarget(t), s.render(l, fi);
	}
};
function xi(e) {
	let t = [], n = [], r = [], i = e, a = e - li + 1 + ui.length;
	for (let o = 0; o < a; o++) {
		let a = 2 ** i;
		n.push(a);
		let s = 1 / a;
		o > e - li ? s = ui[o - e + li - 1] : o === 0 && (s = 0), r.push(s);
		let c = 1 / (a - 2), l = -c, u = 1 + c, d = [
			l,
			l,
			u,
			l,
			u,
			u,
			l,
			l,
			u,
			u,
			l,
			u
		], f = /* @__PURE__ */ new Float32Array(108), p = /* @__PURE__ */ new Float32Array(72), m = /* @__PURE__ */ new Float32Array(36);
		for (let e = 0; e < 6; e++) {
			let t = e % 3 * 2 / 3 - 1, n = e > 2 ? 0 : -1, r = [
				t,
				n,
				0,
				t + 2 / 3,
				n,
				0,
				t + 2 / 3,
				n + 1,
				0,
				t,
				n,
				0,
				t + 2 / 3,
				n + 1,
				0,
				t,
				n + 1,
				0
			];
			f.set(r, 18 * e), p.set(d, 12 * e);
			let i = [
				e,
				e,
				e,
				e,
				e,
				e
			];
			m.set(i, 6 * e);
		}
		let h = new ir();
		h.setAttribute("position", new qn(f, 3)), h.setAttribute("uv", new qn(p, 2)), h.setAttribute("faceIndex", new qn(m, 1)), t.push(h), i > li && i--;
	}
	return {
		lodPlanes: t,
		sizeLods: n,
		sigmas: r
	};
}
function Si(e, t, n) {
	let r = new bt(e, t, n);
	return r.texture.mapping = 306, r.texture.name = "PMREM.cubeUv", r.scissorTest = !0, r;
}
function Ci(e, t, n, r, i) {
	e.viewport.set(t, n, r, i), e.scissor.set(t, n, r, i);
}
function wi(e, t, n) {
	let r = new Float32Array(di), i = new Y(0, 1, 0);
	return new Nr({
		name: "SphericalGaussianBlur",
		defines: {
			n: di,
			CUBEUV_TEXEL_WIDTH: 1 / t,
			CUBEUV_TEXEL_HEIGHT: 1 / n,
			CUBEUV_MAX_MIP: `${e}.0`
		},
		uniforms: {
			envMap: { value: null },
			samples: { value: 1 },
			weights: { value: r },
			latitudinal: { value: !1 },
			dTheta: { value: 0 },
			mipInt: { value: 0 },
			poleAxis: { value: i }
		},
		vertexShader: Di(),
		fragmentShader: "\n\n			precision mediump float;\n			precision mediump int;\n\n			varying vec3 vOutputDirection;\n\n			uniform sampler2D envMap;\n			uniform int samples;\n			uniform float weights[ n ];\n			uniform bool latitudinal;\n			uniform float dTheta;\n			uniform float mipInt;\n			uniform vec3 poleAxis;\n\n			#define ENVMAP_TYPE_CUBE_UV\n			#include <cube_uv_reflection_fragment>\n\n			vec3 getSample( float theta, vec3 axis ) {\n\n				float cosTheta = cos( theta );\n				// Rodrigues' axis-angle rotation\n				vec3 sampleDirection = vOutputDirection * cosTheta\n					+ cross( axis, vOutputDirection ) * sin( theta )\n					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );\n\n				return bilinearCubeUV( envMap, sampleDirection, mipInt );\n\n			}\n\n			void main() {\n\n				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );\n\n				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {\n\n					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );\n\n				}\n\n				axis = normalize( axis );\n\n				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );\n\n				for ( int i = 1; i < n; i++ ) {\n\n					if ( i >= samples ) {\n\n						break;\n\n					}\n\n					float theta = dTheta * float( i );\n					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );\n					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );\n\n				}\n\n			}\n		",
		blending: 0,
		depthTest: !1,
		depthWrite: !1
	});
}
function Ti() {
	return new Nr({
		name: "EquirectangularToCubeUV",
		uniforms: { envMap: { value: null } },
		vertexShader: Di(),
		fragmentShader: "\n\n			precision mediump float;\n			precision mediump int;\n\n			varying vec3 vOutputDirection;\n\n			uniform sampler2D envMap;\n\n			#include <common>\n\n			void main() {\n\n				vec3 outputDirection = normalize( vOutputDirection );\n				vec2 uv = equirectUv( outputDirection );\n\n				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );\n\n			}\n		",
		blending: 0,
		depthTest: !1,
		depthWrite: !1
	});
}
function Ei() {
	return new Nr({
		name: "CubemapToCubeUV",
		uniforms: {
			envMap: { value: null },
			flipEnvMap: { value: -1 }
		},
		vertexShader: Di(),
		fragmentShader: "\n\n			precision mediump float;\n			precision mediump int;\n\n			uniform float flipEnvMap;\n\n			varying vec3 vOutputDirection;\n\n			uniform samplerCube envMap;\n\n			void main() {\n\n				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );\n\n			}\n		",
		blending: 0,
		depthTest: !1,
		depthWrite: !1
	});
}
function Di() {
	return "\n\n		precision mediump float;\n		precision mediump int;\n\n		attribute float faceIndex;\n\n		varying vec3 vOutputDirection;\n\n		// RH coordinate system; PMREM face-indexing convention\n		vec3 getDirection( vec2 uv, float face ) {\n\n			uv = 2.0 * uv - 1.0;\n\n			vec3 direction = vec3( uv, 1.0 );\n\n			if ( face == 0.0 ) {\n\n				direction = direction.zyx; // ( 1, v, u ) pos x\n\n			} else if ( face == 1.0 ) {\n\n				direction = direction.xzy;\n				direction.xz *= -1.0; // ( -u, 1, -v ) pos y\n\n			} else if ( face == 2.0 ) {\n\n				direction.x *= -1.0; // ( -u, v, 1 ) pos z\n\n			} else if ( face == 3.0 ) {\n\n				direction = direction.zyx;\n				direction.xz *= -1.0; // ( -1, v, -u ) neg x\n\n			} else if ( face == 4.0 ) {\n\n				direction = direction.xzy;\n				direction.xy *= -1.0; // ( -u, -1, v ) neg y\n\n			} else if ( face == 5.0 ) {\n\n				direction.z *= -1.0; // ( u, v, -1 ) neg z\n\n			}\n\n			return direction;\n\n		}\n\n		void main() {\n\n			vOutputDirection = getDirection( uv, faceIndex );\n			gl_Position = vec4( position, 1.0 );\n\n		}\n	";
}
function Oi(e) {
	let t = /* @__PURE__ */ new WeakMap(), n = null;
	function r(r) {
		if (r && r.isTexture) {
			let o = r.mapping, s = o === 303 || o === 304, c = o === 301 || o === 302;
			if (s || c) {
				if (r.isRenderTargetTexture && r.needsPMREMUpdate === !0) {
					r.needsPMREMUpdate = !1;
					let i = t.get(r);
					return n === null && (n = new bi(e)), i = s ? n.fromEquirectangular(r, i) : n.fromCubemap(r, i), t.set(r, i), i.texture;
				}
				if (t.has(r)) return t.get(r).texture;
				{
					let o = r.image;
					if (s && o && o.height > 0 || c && o && i(o)) {
						n === null && (n = new bi(e));
						let i = s ? n.fromEquirectangular(r) : n.fromCubemap(r);
						return t.set(r, i), r.addEventListener("dispose", a), i.texture;
					}
					return null;
				}
			}
		}
		return r;
	}
	function i(e) {
		let t = 0;
		for (let n = 0; n < 6; n++) e[n] !== void 0 && t++;
		return t === 6;
	}
	function a(e) {
		let n = e.target;
		n.removeEventListener("dispose", a);
		let r = t.get(n);
		r !== void 0 && (t.delete(n), r.dispose());
	}
	function o() {
		t = /* @__PURE__ */ new WeakMap(), n !== null && (n.dispose(), n = null);
	}
	return {
		get: r,
		dispose: o
	};
}
function ki(e) {
	let t = {};
	function n(n) {
		if (t[n] !== void 0) return t[n];
		let r;
		switch (n) {
			case "WEBGL_depth_texture":
				r = e.getExtension("WEBGL_depth_texture") || e.getExtension("MOZ_WEBGL_depth_texture") || e.getExtension("WEBKIT_WEBGL_depth_texture");
				break;
			case "EXT_texture_filter_anisotropic":
				r = e.getExtension("EXT_texture_filter_anisotropic") || e.getExtension("MOZ_EXT_texture_filter_anisotropic") || e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
				break;
			case "WEBGL_compressed_texture_s3tc":
				r = e.getExtension("WEBGL_compressed_texture_s3tc") || e.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
				break;
			case "WEBGL_compressed_texture_pvrtc":
				r = e.getExtension("WEBGL_compressed_texture_pvrtc") || e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
				break;
			default: r = e.getExtension(n);
		}
		return t[n] = r, r;
	}
	return {
		has: function(e) {
			return n(e) !== null;
		},
		init: function(e) {
			e.isWebGL2 ? (n("EXT_color_buffer_float"), n("WEBGL_clip_cull_distance")) : (n("WEBGL_depth_texture"), n("OES_texture_float"), n("OES_texture_half_float"), n("OES_texture_half_float_linear"), n("OES_standard_derivatives"), n("OES_element_index_uint"), n("OES_vertex_array_object"), n("ANGLE_instanced_arrays")), n("OES_texture_float_linear"), n("EXT_color_buffer_half_float"), n("WEBGL_multisampled_render_to_texture");
		},
		get: function(e) {
			let t = n(e);
			return t === null && console.warn("THREE.WebGLRenderer: " + e + " extension not supported."), t;
		}
	};
}
function Ai(e, t, n, r) {
	let i = {}, a = /* @__PURE__ */ new WeakMap();
	function o(e) {
		let s = e.target;
		s.index !== null && t.remove(s.index);
		for (let e in s.attributes) t.remove(s.attributes[e]);
		for (let e in s.morphAttributes) {
			let n = s.morphAttributes[e];
			for (let e = 0, r = n.length; e < r; e++) t.remove(n[e]);
		}
		s.removeEventListener("dispose", o), delete i[s.id];
		let c = a.get(s);
		c && (t.remove(c), a.delete(s)), r.releaseStatesOfGeometry(s), s.isInstancedBufferGeometry === !0 && delete s._maxInstanceCount, n.memory.geometries--;
	}
	function s(e, t) {
		return i[t.id] === !0 || (t.addEventListener("dispose", o), i[t.id] = !0, n.memory.geometries++), t;
	}
	function c(n) {
		let r = n.attributes;
		for (let n in r) t.update(r[n], e.ARRAY_BUFFER);
		let i = n.morphAttributes;
		for (let n in i) {
			let r = i[n];
			for (let n = 0, i = r.length; n < i; n++) t.update(r[n], e.ARRAY_BUFFER);
		}
	}
	function l(e) {
		let n = [], r = e.index, i = e.attributes.position, o = 0;
		if (r !== null) {
			let e = r.array;
			o = r.version;
			for (let t = 0, r = e.length; t < r; t += 3) {
				let r = e[t + 0], i = e[t + 1], a = e[t + 2];
				n.push(r, i, i, a, a, r);
			}
		} else if (i !== void 0) {
			let e = i.array;
			o = i.version;
			for (let t = 0, r = e.length / 3 - 1; t < r; t += 3) {
				let e = t + 0, r = t + 1, i = t + 2;
				n.push(e, r, r, i, i, e);
			}
		} else return;
		let s = new (et(n) ? Yn : Jn)(n, 1);
		s.version = o;
		let c = a.get(e);
		c && t.remove(c), a.set(e, s);
	}
	function u(e) {
		let t = a.get(e);
		if (t) {
			let n = e.index;
			n !== null && t.version < n.version && l(e);
		} else l(e);
		return a.get(e);
	}
	return {
		get: s,
		update: c,
		getWireframeAttribute: u
	};
}
function ji(e, t, n, r) {
	let i = r.isWebGL2, a;
	function o(e) {
		a = e;
	}
	let s, c;
	function l(e) {
		s = e.type, c = e.bytesPerElement;
	}
	function u(t, r) {
		e.drawElements(a, r, s, t * c), n.update(r, a, 1);
	}
	function d(r, o, l) {
		if (l === 0) return;
		let u, d;
		if (i) u = e, d = "drawElementsInstanced";
		else if (u = t.get("ANGLE_instanced_arrays"), d = "drawElementsInstancedANGLE", u === null) {
			console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
			return;
		}
		u[d](a, o, s, r * c, l), n.update(o, a, l);
	}
	function f(e, r, i) {
		if (i === 0) return;
		let o = t.get("WEBGL_multi_draw");
		if (o === null) for (let t = 0; t < i; t++) this.render(e[t] / c, r[t]);
		else {
			o.multiDrawElementsWEBGL(a, r, 0, s, e, 0, i);
			let t = 0;
			for (let e = 0; e < i; e++) t += r[e];
			n.update(t, a, 1);
		}
	}
	this.setMode = o, this.setIndex = l, this.render = u, this.renderInstances = d, this.renderMultiDraw = f;
}
function Mi(e) {
	let t = {
		geometries: 0,
		textures: 0
	}, n = {
		frame: 0,
		calls: 0,
		triangles: 0,
		points: 0,
		lines: 0
	};
	function r(t, r, i) {
		switch (n.calls++, r) {
			case e.TRIANGLES:
				n.triangles += t / 3 * i;
				break;
			case e.LINES:
				n.lines += t / 2 * i;
				break;
			case e.LINE_STRIP:
				n.lines += i * (t - 1);
				break;
			case e.LINE_LOOP:
				n.lines += i * t;
				break;
			case e.POINTS:
				n.points += i * t;
				break;
			default: console.error("THREE.WebGLInfo: Unknown draw mode:", r);
		}
	}
	function i() {
		n.calls = 0, n.triangles = 0, n.points = 0, n.lines = 0;
	}
	return {
		memory: t,
		render: n,
		programs: null,
		autoReset: !0,
		reset: i,
		update: r
	};
}
function Ni(e, t) {
	return e[0] - t[0];
}
function Pi(e, t) {
	return Math.abs(t[1]) - Math.abs(e[1]);
}
function Fi(e, t, n) {
	let r = {}, i = /* @__PURE__ */ new Float32Array(8), a = /* @__PURE__ */ new WeakMap(), o = new vt(), s = [];
	for (let e = 0; e < 8; e++) s[e] = [e, 0];
	function c(c, l, u) {
		let d = c.morphTargetInfluences;
		if (t.isWebGL2 === !0) {
			let r = l.morphAttributes.position || l.morphAttributes.normal || l.morphAttributes.color, i = r === void 0 ? 0 : r.length, s = a.get(l);
			if (s === void 0 || s.count !== i) {
				s !== void 0 && s.texture.dispose();
				let e = l.morphAttributes.position !== void 0, n = l.morphAttributes.normal !== void 0, r = l.morphAttributes.color !== void 0, c = l.morphAttributes.position || [], u = l.morphAttributes.normal || [], d = l.morphAttributes.color || [], f = 0;
				e === !0 && (f = 1), n === !0 && (f = 2), r === !0 && (f = 3);
				let p = l.attributes.position.count * f, m = 1;
				p > t.maxTextureSize && (m = Math.ceil(p / t.maxTextureSize), p = t.maxTextureSize);
				let h = new Float32Array(p * m * 4 * i), g = new xt(h, p, m, i);
				g.type = ce, g.needsUpdate = !0;
				let _ = f * 4;
				for (let t = 0; t < i; t++) {
					let i = c[t], a = u[t], s = d[t], l = p * m * 4 * t;
					for (let t = 0; t < i.count; t++) {
						let c = t * _;
						e === !0 && (o.fromBufferAttribute(i, t), h[l + c + 0] = o.x, h[l + c + 1] = o.y, h[l + c + 2] = o.z, h[l + c + 3] = 0), n === !0 && (o.fromBufferAttribute(a, t), h[l + c + 4] = o.x, h[l + c + 5] = o.y, h[l + c + 6] = o.z, h[l + c + 7] = 0), r === !0 && (o.fromBufferAttribute(s, t), h[l + c + 8] = o.x, h[l + c + 9] = o.y, h[l + c + 10] = o.z, h[l + c + 11] = s.itemSize === 4 ? o.w : 1);
					}
				}
				s = {
					count: i,
					texture: g,
					size: new K(p, m)
				}, a.set(l, s);
				function v() {
					g.dispose(), a.delete(l), l.removeEventListener("dispose", v);
				}
				l.addEventListener("dispose", v);
			}
			let c = 0;
			for (let e = 0; e < d.length; e++) c += d[e];
			let f = l.morphTargetsRelative ? 1 : 1 - c;
			u.getUniforms().setValue(e, "morphTargetBaseInfluence", f), u.getUniforms().setValue(e, "morphTargetInfluences", d), u.getUniforms().setValue(e, "morphTargetsTexture", s.texture, n), u.getUniforms().setValue(e, "morphTargetsTextureSize", s.size);
		} else {
			let t = d === void 0 ? 0 : d.length, n = r[l.id];
			if (n === void 0 || n.length !== t) {
				n = [];
				for (let e = 0; e < t; e++) n[e] = [e, 0];
				r[l.id] = n;
			}
			for (let e = 0; e < t; e++) {
				let t = n[e];
				t[0] = e, t[1] = d[e];
			}
			n.sort(Pi);
			for (let e = 0; e < 8; e++) e < t && n[e][1] ? (s[e][0] = n[e][0], s[e][1] = n[e][1]) : (s[e][0] = 2 ** 53 - 1, s[e][1] = 0);
			s.sort(Ni);
			let a = l.morphAttributes.position, o = l.morphAttributes.normal, c = 0;
			for (let e = 0; e < 8; e++) {
				let t = s[e], n = t[0], r = t[1];
				n !== 2 ** 53 - 1 && r ? (a && l.getAttribute("morphTarget" + e) !== a[n] && l.setAttribute("morphTarget" + e, a[n]), o && l.getAttribute("morphNormal" + e) !== o[n] && l.setAttribute("morphNormal" + e, o[n]), i[e] = r, c += r) : (a && l.hasAttribute("morphTarget" + e) === !0 && l.deleteAttribute("morphTarget" + e), o && l.hasAttribute("morphNormal" + e) === !0 && l.deleteAttribute("morphNormal" + e), i[e] = 0);
			}
			let f = l.morphTargetsRelative ? 1 : 1 - c;
			u.getUniforms().setValue(e, "morphTargetBaseInfluence", f), u.getUniforms().setValue(e, "morphTargetInfluences", i);
		}
	}
	return { update: c };
}
function Ii(e, t, n, r) {
	let i = /* @__PURE__ */ new WeakMap();
	function a(a) {
		let o = r.render.frame, c = a.geometry, l = t.get(a, c);
		if (i.get(l) !== o && (t.update(l), i.set(l, o)), a.isInstancedMesh && (a.hasEventListener("dispose", s) === !1 && a.addEventListener("dispose", s), i.get(a) !== o && (n.update(a.instanceMatrix, e.ARRAY_BUFFER), a.instanceColor !== null && n.update(a.instanceColor, e.ARRAY_BUFFER), i.set(a, o))), a.isSkinnedMesh) {
			let e = a.skeleton;
			i.get(e) !== o && (e.update(), i.set(e, o));
		}
		return l;
	}
	function o() {
		i = /* @__PURE__ */ new WeakMap();
	}
	function s(e) {
		let t = e.target;
		t.removeEventListener("dispose", s), n.remove(t.instanceMatrix), t.instanceColor !== null && n.remove(t.instanceColor);
	}
	return {
		update: a,
		dispose: o
	};
}
var Li = class extends _t {
	constructor(e, t, n, r, i, a, o, s, c, l) {
		if (l = l === void 0 ? de : l, l !== 1026 && l !== 1027) throw Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
		n === void 0 && l === 1026 && (n = F), n === void 0 && l === 1027 && (n = ue), super(null, r, i, a, o, s, l, n, c), this.isDepthTexture = !0, this.image = {
			width: e,
			height: t
		}, this.magFilter = o === void 0 ? P : o, this.minFilter = s === void 0 ? P : s, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
	}
	copy(e) {
		return super.copy(e), this.compareFunction = e.compareFunction, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
	}
}, Ri = /*@__PURE__*/ new _t(), zi = /*@__PURE__*/ new Li(1, 1);
zi.compareFunction = 515;
var Bi = /*@__PURE__*/ new xt(), Vi = /*@__PURE__*/ new St(), Hi = /*@__PURE__*/ new Hr(), Ui = [], Wi = [], Gi = /* @__PURE__ */ new Float32Array(16), Ki = /* @__PURE__ */ new Float32Array(9), qi = /* @__PURE__ */ new Float32Array(4);
function Ji(e, t, n) {
	let r = e[0];
	if (r <= 0 || r > 0) return e;
	let i = t * n, a = Ui[i];
	if (a === void 0 && (a = new Float32Array(i), Ui[i] = a), t !== 0) {
		r.toArray(a, 0);
		for (let r = 1, i = 0; r !== t; ++r) i += n, e[r].toArray(a, i);
	}
	return a;
}
function Yi(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0, r = e.length; n < r; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function Xi(e, t) {
	for (let n = 0, r = t.length; n < r; n++) e[n] = t[n];
}
function Zi(e, t) {
	let n = Wi[t];
	n === void 0 && (n = new Int32Array(t), Wi[t] = n);
	for (let r = 0; r !== t; ++r) n[r] = e.allocateTextureUnit();
	return n;
}
function Qi(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1f(this.addr, t), n[0] = t);
}
function $i(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2f(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (Yi(n, t)) return;
		e.uniform2fv(this.addr, t), Xi(n, t);
	}
}
function ea(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3f(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else if (t.r !== void 0) (n[0] !== t.r || n[1] !== t.g || n[2] !== t.b) && (e.uniform3f(this.addr, t.r, t.g, t.b), n[0] = t.r, n[1] = t.g, n[2] = t.b);
	else {
		if (Yi(n, t)) return;
		e.uniform3fv(this.addr, t), Xi(n, t);
	}
}
function ta(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4f(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (Yi(n, t)) return;
		e.uniform4fv(this.addr, t), Xi(n, t);
	}
}
function na(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (Yi(n, t)) return;
		e.uniformMatrix2fv(this.addr, !1, t), Xi(n, t);
	} else {
		if (Yi(n, r)) return;
		qi.set(r), e.uniformMatrix2fv(this.addr, !1, qi), Xi(n, r);
	}
}
function ra(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (Yi(n, t)) return;
		e.uniformMatrix3fv(this.addr, !1, t), Xi(n, t);
	} else {
		if (Yi(n, r)) return;
		Ki.set(r), e.uniformMatrix3fv(this.addr, !1, Ki), Xi(n, r);
	}
}
function ia(e, t) {
	let n = this.cache, r = t.elements;
	if (r === void 0) {
		if (Yi(n, t)) return;
		e.uniformMatrix4fv(this.addr, !1, t), Xi(n, t);
	} else {
		if (Yi(n, r)) return;
		Gi.set(r), e.uniformMatrix4fv(this.addr, !1, Gi), Xi(n, r);
	}
}
function aa(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1i(this.addr, t), n[0] = t);
}
function oa(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2i(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (Yi(n, t)) return;
		e.uniform2iv(this.addr, t), Xi(n, t);
	}
}
function sa(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3i(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else {
		if (Yi(n, t)) return;
		e.uniform3iv(this.addr, t), Xi(n, t);
	}
}
function ca(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4i(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (Yi(n, t)) return;
		e.uniform4iv(this.addr, t), Xi(n, t);
	}
}
function la(e, t) {
	let n = this.cache;
	n[0] !== t && (e.uniform1ui(this.addr, t), n[0] = t);
}
function ua(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y) && (e.uniform2ui(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
	else {
		if (Yi(n, t)) return;
		e.uniform2uiv(this.addr, t), Xi(n, t);
	}
}
function da(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3ui(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
	else {
		if (Yi(n, t)) return;
		e.uniform3uiv(this.addr, t), Xi(n, t);
	}
}
function fa(e, t) {
	let n = this.cache;
	if (t.x !== void 0) (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4ui(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
	else {
		if (Yi(n, t)) return;
		e.uniform4uiv(this.addr, t), Xi(n, t);
	}
}
function pa(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i);
	let a = this.type === e.SAMPLER_2D_SHADOW ? zi : Ri;
	n.setTexture2D(t || a, i);
}
function ma(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i), n.setTexture3D(t || Vi, i);
}
function ha(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i), n.setTextureCube(t || Hi, i);
}
function ga(e, t, n) {
	let r = this.cache, i = n.allocateTextureUnit();
	r[0] !== i && (e.uniform1i(this.addr, i), r[0] = i), n.setTexture2DArray(t || Bi, i);
}
function _a(e) {
	switch (e) {
		case 5126: return Qi;
		case 35664: return $i;
		case 35665: return ea;
		case 35666: return ta;
		case 35674: return na;
		case 35675: return ra;
		case 35676: return ia;
		case 5124:
		case 35670: return aa;
		case 35667:
		case 35671: return oa;
		case 35668:
		case 35672: return sa;
		case 35669:
		case 35673: return ca;
		case 5125: return la;
		case 36294: return ua;
		case 36295: return da;
		case 36296: return fa;
		case 35678:
		case 36198:
		case 36298:
		case 36306:
		case 35682: return pa;
		case 35679:
		case 36299:
		case 36307: return ma;
		case 35680:
		case 36300:
		case 36308:
		case 36293: return ha;
		case 36289:
		case 36303:
		case 36311:
		case 36292: return ga;
	}
}
function va(e, t) {
	e.uniform1fv(this.addr, t);
}
function ya(e, t) {
	let n = Ji(t, this.size, 2);
	e.uniform2fv(this.addr, n);
}
function ba(e, t) {
	let n = Ji(t, this.size, 3);
	e.uniform3fv(this.addr, n);
}
function xa(e, t) {
	let n = Ji(t, this.size, 4);
	e.uniform4fv(this.addr, n);
}
function Sa(e, t) {
	let n = Ji(t, this.size, 4);
	e.uniformMatrix2fv(this.addr, !1, n);
}
function Ca(e, t) {
	let n = Ji(t, this.size, 9);
	e.uniformMatrix3fv(this.addr, !1, n);
}
function wa(e, t) {
	let n = Ji(t, this.size, 16);
	e.uniformMatrix4fv(this.addr, !1, n);
}
function Ta(e, t) {
	e.uniform1iv(this.addr, t);
}
function Ea(e, t) {
	e.uniform2iv(this.addr, t);
}
function Da(e, t) {
	e.uniform3iv(this.addr, t);
}
function Oa(e, t) {
	e.uniform4iv(this.addr, t);
}
function ka(e, t) {
	e.uniform1uiv(this.addr, t);
}
function Aa(e, t) {
	e.uniform2uiv(this.addr, t);
}
function ja(e, t) {
	e.uniform3uiv(this.addr, t);
}
function Ma(e, t) {
	e.uniform4uiv(this.addr, t);
}
function Na(e, t, n) {
	let r = this.cache, i = t.length, a = Zi(n, i);
	Yi(r, a) || (e.uniform1iv(this.addr, a), Xi(r, a));
	for (let e = 0; e !== i; ++e) n.setTexture2D(t[e] || Ri, a[e]);
}
function Pa(e, t, n) {
	let r = this.cache, i = t.length, a = Zi(n, i);
	Yi(r, a) || (e.uniform1iv(this.addr, a), Xi(r, a));
	for (let e = 0; e !== i; ++e) n.setTexture3D(t[e] || Vi, a[e]);
}
function Fa(e, t, n) {
	let r = this.cache, i = t.length, a = Zi(n, i);
	Yi(r, a) || (e.uniform1iv(this.addr, a), Xi(r, a));
	for (let e = 0; e !== i; ++e) n.setTextureCube(t[e] || Hi, a[e]);
}
function Ia(e, t, n) {
	let r = this.cache, i = t.length, a = Zi(n, i);
	Yi(r, a) || (e.uniform1iv(this.addr, a), Xi(r, a));
	for (let e = 0; e !== i; ++e) n.setTexture2DArray(t[e] || Bi, a[e]);
}
function La(e) {
	switch (e) {
		case 5126: return va;
		case 35664: return ya;
		case 35665: return ba;
		case 35666: return xa;
		case 35674: return Sa;
		case 35675: return Ca;
		case 35676: return wa;
		case 5124:
		case 35670: return Ta;
		case 35667:
		case 35671: return Ea;
		case 35668:
		case 35672: return Da;
		case 35669:
		case 35673: return Oa;
		case 5125: return ka;
		case 36294: return Aa;
		case 36295: return ja;
		case 36296: return Ma;
		case 35678:
		case 36198:
		case 36298:
		case 36306:
		case 35682: return Na;
		case 35679:
		case 36299:
		case 36307: return Pa;
		case 35680:
		case 36300:
		case 36308:
		case 36293: return Fa;
		case 36289:
		case 36303:
		case 36311:
		case 36292: return Ia;
	}
}
var Ra = class {
	constructor(e, t, n) {
		this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = _a(t.type);
	}
}, za = class {
	constructor(e, t, n) {
		this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = La(t.type);
	}
}, Ba = class {
	constructor(e) {
		this.id = e, this.seq = [], this.map = {};
	}
	setValue(e, t, n) {
		let r = this.seq;
		for (let i = 0, a = r.length; i !== a; ++i) {
			let a = r[i];
			a.setValue(e, t[a.id], n);
		}
	}
}, Va = /(\w+)(\])?(\[|\.)?/g;
function Ha(e, t) {
	e.seq.push(t), e.map[t.id] = t;
}
function Ua(e, t, n) {
	let r = e.name, i = r.length;
	for (Va.lastIndex = 0;;) {
		let a = Va.exec(r), o = Va.lastIndex, s = a[1], c = a[2] === "]", l = a[3];
		if (c && (s |= 0), l === void 0 || l === "[" && o + 2 === i) {
			Ha(n, l === void 0 ? new Ra(s, e, t) : new za(s, e, t));
			break;
		}
		{
			let e = n.map[s];
			e === void 0 && (e = new Ba(s), Ha(n, e)), n = e;
		}
	}
}
var Wa = class {
	constructor(e, t) {
		this.seq = [], this.map = {};
		let n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
		for (let r = 0; r < n; ++r) {
			let n = e.getActiveUniform(t, r);
			Ua(n, e.getUniformLocation(t, n.name), this);
		}
	}
	setValue(e, t, n, r) {
		let i = this.map[t];
		i !== void 0 && i.setValue(e, n, r);
	}
	setOptional(e, t, n) {
		let r = t[n];
		r !== void 0 && this.setValue(e, n, r);
	}
	static upload(e, t, n, r) {
		for (let i = 0, a = t.length; i !== a; ++i) {
			let a = t[i], o = n[a.id];
			o.needsUpdate !== !1 && a.setValue(e, o.value, r);
		}
	}
	static seqWithValue(e, t) {
		let n = [];
		for (let r = 0, i = e.length; r !== i; ++r) {
			let i = e[r];
			i.id in t && n.push(i);
		}
		return n;
	}
};
function Ga(e, t, n) {
	let r = e.createShader(t);
	return e.shaderSource(r, n), e.compileShader(r), r;
}
var Ka = 37297, qa = 0;
function Ja(e, t) {
	let n = e.split("\n"), r = [], i = Math.max(t - 6, 0), a = Math.min(t + 6, n.length);
	for (let e = i; e < a; e++) {
		let i = e + 1;
		r.push(`${i === t ? ">" : " "} ${i}: ${n[e]}`);
	}
	return r.join("\n");
}
function Ya(e) {
	let t = J.getPrimaries(J.workingColorSpace), n = J.getPrimaries(e), r;
	switch (t === n ? r = "" : t === "p3" && n === "rec709" ? r = "LinearDisplayP3ToLinearSRGB" : t === "rec709" && n === "p3" && (r = "LinearSRGBToLinearDisplayP3"), e) {
		case _e:
		case W: return [r, "LinearTransferOETF"];
		case ge:
		case ve: return [r, "sRGBTransferOETF"];
		default: return console.warn("THREE.WebGLProgram: Unsupported color space:", e), [r, "LinearTransferOETF"];
	}
}
function Xa(e, t, n) {
	let r = e.getShaderParameter(t, e.COMPILE_STATUS), i = e.getShaderInfoLog(t).trim();
	if (r && i === "") return "";
	let a = /ERROR: 0:(\d+)/.exec(i);
	if (a) {
		let r = parseInt(a[1]);
		return n.toUpperCase() + "\n\n" + i + "\n\n" + Ja(e.getShaderSource(t), r);
	}
	return i;
}
function Za(e, t) {
	let n = Ya(t);
	return `vec4 ${e}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`;
}
function Qa(e, t) {
	let n;
	switch (t) {
		case 1:
			n = "Linear";
			break;
		case 2:
			n = "Reinhard";
			break;
		case 3:
			n = "OptimizedCineon";
			break;
		case 4:
			n = "ACESFilmic";
			break;
		case 6:
			n = "AgX";
			break;
		case 5:
			n = "Custom";
			break;
		default: console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), n = "Linear";
	}
	return "vec3 " + e + "( vec3 color ) { return " + n + "ToneMapping( color ); }";
}
function $a(e) {
	return [
		e.extensionDerivatives || e.envMapCubeUVHeight || e.bumpMap || e.normalMapTangentSpace || e.clearcoatNormalMap || e.flatShading || e.alphaToCoverage || e.shaderID === "physical" ? "#extension GL_OES_standard_derivatives : enable" : "",
		(e.extensionFragDepth || e.logarithmicDepthBuffer) && e.rendererExtensionFragDepth ? "#extension GL_EXT_frag_depth : enable" : "",
		e.extensionDrawBuffers && e.rendererExtensionDrawBuffers ? "#extension GL_EXT_draw_buffers : require" : "",
		(e.extensionShaderTextureLOD || e.envMap || e.transmission) && e.rendererExtensionShaderTextureLod ? "#extension GL_EXT_shader_texture_lod : enable" : ""
	].filter(ro).join("\n");
}
function eo(e) {
	return [e.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", e.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(ro).join("\n");
}
function to(e) {
	let t = [];
	for (let n in e) {
		let r = e[n];
		r !== !1 && t.push("#define " + n + " " + r);
	}
	return t.join("\n");
}
function no(e, t) {
	let n = {}, r = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES);
	for (let i = 0; i < r; i++) {
		let r = e.getActiveAttrib(t, i), a = r.name, o = 1;
		r.type === e.FLOAT_MAT2 && (o = 2), r.type === e.FLOAT_MAT3 && (o = 3), r.type === e.FLOAT_MAT4 && (o = 4), n[a] = {
			type: r.type,
			location: e.getAttribLocation(t, a),
			locationSize: o
		};
	}
	return n;
}
function ro(e) {
	return e !== "";
}
function io(e, t) {
	let n = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
	return e.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, n).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function ao(e, t) {
	return e.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
var oo = /^[ \t]*#include +<([\w\d./]+)>/gm;
function so(e) {
	return e.replace(oo, lo);
}
var co = /* @__PURE__ */ new Map([
	["encodings_fragment", "colorspace_fragment"],
	["encodings_pars_fragment", "colorspace_pars_fragment"],
	["output_fragment", "opaque_fragment"]
]);
function lo(e, t) {
	let n = Z[t];
	if (n === void 0) {
		let e = co.get(t);
		if (e !== void 0) n = Z[e], console.warn("THREE.WebGLRenderer: Shader chunk \"%s\" has been deprecated. Use \"%s\" instead.", t, e);
		else throw Error("Can not resolve #include <" + t + ">");
	}
	return so(n);
}
var uo = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function fo(e) {
	return e.replace(uo, po);
}
function po(e, t, n, r) {
	let i = "";
	for (let e = parseInt(t); e < parseInt(n); e++) i += r.replace(/\[\s*i\s*\]/g, "[ " + e + " ]").replace(/UNROLLED_LOOP_INDEX/g, e);
	return i;
}
function mo(e) {
	let t = `precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	`;
	return e.isWebGL2 && (t += `precision ${e.precision} sampler3D;
		precision ${e.precision} sampler2DArray;
		precision ${e.precision} sampler2DShadow;
		precision ${e.precision} samplerCubeShadow;
		precision ${e.precision} sampler2DArrayShadow;
		precision ${e.precision} isampler2D;
		precision ${e.precision} isampler3D;
		precision ${e.precision} isamplerCube;
		precision ${e.precision} isampler2DArray;
		precision ${e.precision} usampler2D;
		precision ${e.precision} usampler3D;
		precision ${e.precision} usamplerCube;
		precision ${e.precision} usampler2DArray;
		`), e.precision === "highp" ? t += "\n#define HIGH_PRECISION" : e.precision === "mediump" ? t += "\n#define MEDIUM_PRECISION" : e.precision === "lowp" && (t += "\n#define LOW_PRECISION"), t;
}
function ho(e) {
	let t = "SHADOWMAP_TYPE_BASIC";
	return e.shadowMapType === 1 ? t = "SHADOWMAP_TYPE_PCF" : e.shadowMapType === 2 ? t = "SHADOWMAP_TYPE_PCF_SOFT" : e.shadowMapType === 3 && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function go(e) {
	let t = "ENVMAP_TYPE_CUBE";
	if (e.envMap) switch (e.envMapMode) {
		case 301:
		case 302:
			t = "ENVMAP_TYPE_CUBE";
			break;
		case 306: t = "ENVMAP_TYPE_CUBE_UV";
	}
	return t;
}
function _o(e) {
	let t = "ENVMAP_MODE_REFLECTION";
	if (e.envMap) switch (e.envMapMode) {
		case 302: t = "ENVMAP_MODE_REFRACTION";
	}
	return t;
}
function vo(e) {
	let t = "ENVMAP_BLENDING_NONE";
	if (e.envMap) switch (e.combine) {
		case 0:
			t = "ENVMAP_BLENDING_MULTIPLY";
			break;
		case 1:
			t = "ENVMAP_BLENDING_MIX";
			break;
		case 2: t = "ENVMAP_BLENDING_ADD";
	}
	return t;
}
function yo(e) {
	let t = e.envMapCubeUVHeight;
	if (t === null) return null;
	let n = Math.log2(t) - 2, r = 1 / t;
	return {
		texelWidth: 1 / (3 * Math.max(2 ** n, 112)),
		texelHeight: r,
		maxMip: n
	};
}
function bo(e, t, n, r) {
	let i = e.getContext(), a = n.defines, o = n.vertexShader, s = n.fragmentShader, c = ho(n), l = go(n), u = _o(n), d = vo(n), f = yo(n), p = n.isWebGL2 ? "" : $a(n), m = eo(n), h = to(a), g = i.createProgram(), _, v, y = n.glslVersion ? "#version " + n.glslVersion + "\n" : "";
	n.isRawShaderMaterial ? (_ = [
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		h
	].filter(ro).join("\n"), _.length > 0 && (_ += "\n"), v = [
		p,
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		h
	].filter(ro).join("\n"), v.length > 0 && (v += "\n")) : (_ = [
		mo(n),
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		h,
		n.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
		n.batching ? "#define USE_BATCHING" : "",
		n.instancing ? "#define USE_INSTANCING" : "",
		n.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
		n.useFog && n.fog ? "#define USE_FOG" : "",
		n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
		n.map ? "#define USE_MAP" : "",
		n.envMap ? "#define USE_ENVMAP" : "",
		n.envMap ? "#define " + u : "",
		n.lightMap ? "#define USE_LIGHTMAP" : "",
		n.aoMap ? "#define USE_AOMAP" : "",
		n.bumpMap ? "#define USE_BUMPMAP" : "",
		n.normalMap ? "#define USE_NORMALMAP" : "",
		n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
		n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
		n.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
		n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
		n.anisotropy ? "#define USE_ANISOTROPY" : "",
		n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
		n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
		n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
		n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
		n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
		n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
		n.specularMap ? "#define USE_SPECULARMAP" : "",
		n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
		n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
		n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
		n.metalnessMap ? "#define USE_METALNESSMAP" : "",
		n.alphaMap ? "#define USE_ALPHAMAP" : "",
		n.alphaHash ? "#define USE_ALPHAHASH" : "",
		n.transmission ? "#define USE_TRANSMISSION" : "",
		n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
		n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
		n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
		n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
		n.mapUv ? "#define MAP_UV " + n.mapUv : "",
		n.alphaMapUv ? "#define ALPHAMAP_UV " + n.alphaMapUv : "",
		n.lightMapUv ? "#define LIGHTMAP_UV " + n.lightMapUv : "",
		n.aoMapUv ? "#define AOMAP_UV " + n.aoMapUv : "",
		n.emissiveMapUv ? "#define EMISSIVEMAP_UV " + n.emissiveMapUv : "",
		n.bumpMapUv ? "#define BUMPMAP_UV " + n.bumpMapUv : "",
		n.normalMapUv ? "#define NORMALMAP_UV " + n.normalMapUv : "",
		n.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + n.displacementMapUv : "",
		n.metalnessMapUv ? "#define METALNESSMAP_UV " + n.metalnessMapUv : "",
		n.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + n.roughnessMapUv : "",
		n.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + n.anisotropyMapUv : "",
		n.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + n.clearcoatMapUv : "",
		n.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + n.clearcoatNormalMapUv : "",
		n.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + n.clearcoatRoughnessMapUv : "",
		n.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + n.iridescenceMapUv : "",
		n.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + n.iridescenceThicknessMapUv : "",
		n.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + n.sheenColorMapUv : "",
		n.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + n.sheenRoughnessMapUv : "",
		n.specularMapUv ? "#define SPECULARMAP_UV " + n.specularMapUv : "",
		n.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + n.specularColorMapUv : "",
		n.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + n.specularIntensityMapUv : "",
		n.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + n.transmissionMapUv : "",
		n.thicknessMapUv ? "#define THICKNESSMAP_UV " + n.thicknessMapUv : "",
		n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
		n.vertexColors ? "#define USE_COLOR" : "",
		n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
		n.vertexUv1s ? "#define USE_UV1" : "",
		n.vertexUv2s ? "#define USE_UV2" : "",
		n.vertexUv3s ? "#define USE_UV3" : "",
		n.pointsUvs ? "#define USE_POINTS_UV" : "",
		n.flatShading ? "#define FLAT_SHADED" : "",
		n.skinning ? "#define USE_SKINNING" : "",
		n.morphTargets ? "#define USE_MORPHTARGETS" : "",
		n.morphNormals && n.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
		n.morphColors && n.isWebGL2 ? "#define USE_MORPHCOLORS" : "",
		n.morphTargetsCount > 0 && n.isWebGL2 ? "#define MORPHTARGETS_TEXTURE" : "",
		n.morphTargetsCount > 0 && n.isWebGL2 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + n.morphTextureStride : "",
		n.morphTargetsCount > 0 && n.isWebGL2 ? "#define MORPHTARGETS_COUNT " + n.morphTargetsCount : "",
		n.doubleSided ? "#define DOUBLE_SIDED" : "",
		n.flipSided ? "#define FLIP_SIDED" : "",
		n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
		n.shadowMapEnabled ? "#define " + c : "",
		n.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
		n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
		n.useLegacyLights ? "#define LEGACY_LIGHTS" : "",
		n.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
		n.logarithmicDepthBuffer && n.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "",
		"uniform mat4 modelMatrix;",
		"uniform mat4 modelViewMatrix;",
		"uniform mat4 projectionMatrix;",
		"uniform mat4 viewMatrix;",
		"uniform mat3 normalMatrix;",
		"uniform vec3 cameraPosition;",
		"uniform bool isOrthographic;",
		"#ifdef USE_INSTANCING",
		"	attribute mat4 instanceMatrix;",
		"#endif",
		"#ifdef USE_INSTANCING_COLOR",
		"	attribute vec3 instanceColor;",
		"#endif",
		"attribute vec3 position;",
		"attribute vec3 normal;",
		"attribute vec2 uv;",
		"#ifdef USE_UV1",
		"	attribute vec2 uv1;",
		"#endif",
		"#ifdef USE_UV2",
		"	attribute vec2 uv2;",
		"#endif",
		"#ifdef USE_UV3",
		"	attribute vec2 uv3;",
		"#endif",
		"#ifdef USE_TANGENT",
		"	attribute vec4 tangent;",
		"#endif",
		"#if defined( USE_COLOR_ALPHA )",
		"	attribute vec4 color;",
		"#elif defined( USE_COLOR )",
		"	attribute vec3 color;",
		"#endif",
		"#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )",
		"	attribute vec3 morphTarget0;",
		"	attribute vec3 morphTarget1;",
		"	attribute vec3 morphTarget2;",
		"	attribute vec3 morphTarget3;",
		"	#ifdef USE_MORPHNORMALS",
		"		attribute vec3 morphNormal0;",
		"		attribute vec3 morphNormal1;",
		"		attribute vec3 morphNormal2;",
		"		attribute vec3 morphNormal3;",
		"	#else",
		"		attribute vec3 morphTarget4;",
		"		attribute vec3 morphTarget5;",
		"		attribute vec3 morphTarget6;",
		"		attribute vec3 morphTarget7;",
		"	#endif",
		"#endif",
		"#ifdef USE_SKINNING",
		"	attribute vec4 skinIndex;",
		"	attribute vec4 skinWeight;",
		"#endif",
		"\n"
	].filter(ro).join("\n"), v = [
		p,
		mo(n),
		"#define SHADER_TYPE " + n.shaderType,
		"#define SHADER_NAME " + n.shaderName,
		h,
		n.useFog && n.fog ? "#define USE_FOG" : "",
		n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
		n.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
		n.map ? "#define USE_MAP" : "",
		n.matcap ? "#define USE_MATCAP" : "",
		n.envMap ? "#define USE_ENVMAP" : "",
		n.envMap ? "#define " + l : "",
		n.envMap ? "#define " + u : "",
		n.envMap ? "#define " + d : "",
		f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
		f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
		f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
		n.lightMap ? "#define USE_LIGHTMAP" : "",
		n.aoMap ? "#define USE_AOMAP" : "",
		n.bumpMap ? "#define USE_BUMPMAP" : "",
		n.normalMap ? "#define USE_NORMALMAP" : "",
		n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
		n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
		n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
		n.anisotropy ? "#define USE_ANISOTROPY" : "",
		n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
		n.clearcoat ? "#define USE_CLEARCOAT" : "",
		n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
		n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
		n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
		n.iridescence ? "#define USE_IRIDESCENCE" : "",
		n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
		n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
		n.specularMap ? "#define USE_SPECULARMAP" : "",
		n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
		n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
		n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
		n.metalnessMap ? "#define USE_METALNESSMAP" : "",
		n.alphaMap ? "#define USE_ALPHAMAP" : "",
		n.alphaTest ? "#define USE_ALPHATEST" : "",
		n.alphaHash ? "#define USE_ALPHAHASH" : "",
		n.sheen ? "#define USE_SHEEN" : "",
		n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
		n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
		n.transmission ? "#define USE_TRANSMISSION" : "",
		n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
		n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
		n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
		n.vertexColors || n.instancingColor ? "#define USE_COLOR" : "",
		n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
		n.vertexUv1s ? "#define USE_UV1" : "",
		n.vertexUv2s ? "#define USE_UV2" : "",
		n.vertexUv3s ? "#define USE_UV3" : "",
		n.pointsUvs ? "#define USE_POINTS_UV" : "",
		n.gradientMap ? "#define USE_GRADIENTMAP" : "",
		n.flatShading ? "#define FLAT_SHADED" : "",
		n.doubleSided ? "#define DOUBLE_SIDED" : "",
		n.flipSided ? "#define FLIP_SIDED" : "",
		n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
		n.shadowMapEnabled ? "#define " + c : "",
		n.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
		n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
		n.useLegacyLights ? "#define LEGACY_LIGHTS" : "",
		n.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
		n.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
		n.logarithmicDepthBuffer && n.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "",
		"uniform mat4 viewMatrix;",
		"uniform vec3 cameraPosition;",
		"uniform bool isOrthographic;",
		n.toneMapping === 0 ? "" : "#define TONE_MAPPING",
		n.toneMapping === 0 ? "" : Z.tonemapping_pars_fragment,
		n.toneMapping === 0 ? "" : Qa("toneMapping", n.toneMapping),
		n.dithering ? "#define DITHERING" : "",
		n.opaque ? "#define OPAQUE" : "",
		Z.colorspace_pars_fragment,
		Za("linearToOutputTexel", n.outputColorSpace),
		n.useDepthPacking ? "#define DEPTH_PACKING " + n.depthPacking : "",
		"\n"
	].filter(ro).join("\n")), o = so(o), o = io(o, n), o = ao(o, n), s = so(s), s = io(s, n), s = ao(s, n), o = fo(o), s = fo(s), n.isWebGL2 && n.isRawShaderMaterial !== !0 && (y = "#version 300 es\n", _ = [
		m,
		"precision mediump sampler2DArray;",
		"#define attribute in",
		"#define varying out",
		"#define texture2D texture"
	].join("\n") + "\n" + _, v = [
		"precision mediump sampler2DArray;",
		"#define varying in",
		n.glslVersion === "300 es" ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
		n.glslVersion === "300 es" ? "" : "#define gl_FragColor pc_fragColor",
		"#define gl_FragDepthEXT gl_FragDepth",
		"#define texture2D texture",
		"#define textureCube texture",
		"#define texture2DProj textureProj",
		"#define texture2DLodEXT textureLod",
		"#define texture2DProjLodEXT textureProjLod",
		"#define textureCubeLodEXT textureLod",
		"#define texture2DGradEXT textureGrad",
		"#define texture2DProjGradEXT textureProjGrad",
		"#define textureCubeGradEXT textureGrad"
	].join("\n") + "\n" + v);
	let b = y + _ + o, x = y + v + s, S = Ga(i, i.VERTEX_SHADER, b), C = Ga(i, i.FRAGMENT_SHADER, x);
	i.attachShader(g, S), i.attachShader(g, C), n.index0AttributeName === void 0 ? n.morphTargets === !0 && i.bindAttribLocation(g, 0, "position") : i.bindAttribLocation(g, 0, n.index0AttributeName), i.linkProgram(g);
	function w(t) {
		if (e.debug.checkShaderErrors) {
			let n = i.getProgramInfoLog(g).trim(), r = i.getShaderInfoLog(S).trim(), a = i.getShaderInfoLog(C).trim(), o = !0, s = !0;
			if (i.getProgramParameter(g, i.LINK_STATUS) === !1) {
				if (o = !1, typeof e.debug.onShaderError == "function") e.debug.onShaderError(i, g, S, C);
				else {
					let e = Xa(i, S, "vertex"), r = Xa(i, C, "fragment");
					console.error("THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(g, i.VALIDATE_STATUS) + "\n\nMaterial Name: " + t.name + "\nMaterial Type: " + t.type + "\n\nProgram Info Log: " + n + "\n" + e + "\n" + r);
				}
			} else n === "" ? (r === "" || a === "") && (s = !1) : console.warn("THREE.WebGLProgram: Program Info Log:", n);
			s && (t.diagnostics = {
				runnable: o,
				programLog: n,
				vertexShader: {
					log: r,
					prefix: _
				},
				fragmentShader: {
					log: a,
					prefix: v
				}
			});
		}
		i.deleteShader(S), i.deleteShader(C), T = new Wa(i, g), E = no(i, g);
	}
	let T;
	this.getUniforms = function() {
		return T === void 0 && w(this), T;
	};
	let E;
	this.getAttributes = function() {
		return E === void 0 && w(this), E;
	};
	let D = n.rendererExtensionParallelShaderCompile === !1;
	return this.isReady = function() {
		return D === !1 && (D = i.getProgramParameter(g, Ka)), D;
	}, this.destroy = function() {
		r.releaseStatesOfProgram(this), i.deleteProgram(g), this.program = void 0;
	}, this.type = n.shaderType, this.name = n.shaderName, this.id = qa++, this.cacheKey = t, this.usedTimes = 1, this.program = g, this.vertexShader = S, this.fragmentShader = C, this;
}
var xo = 0, So = class {
	constructor() {
		this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
	}
	update(e) {
		let t = e.vertexShader, n = e.fragmentShader, r = this._getShaderStage(t), i = this._getShaderStage(n), a = this._getShaderCacheForMaterial(e);
		return a.has(r) === !1 && (a.add(r), r.usedTimes++), a.has(i) === !1 && (a.add(i), i.usedTimes++), this;
	}
	remove(e) {
		let t = this.materialCache.get(e);
		for (let e of t) e.usedTimes--, e.usedTimes === 0 && this.shaderCache.delete(e.code);
		return this.materialCache.delete(e), this;
	}
	getVertexShaderID(e) {
		return this._getShaderStage(e.vertexShader).id;
	}
	getFragmentShaderID(e) {
		return this._getShaderStage(e.fragmentShader).id;
	}
	dispose() {
		this.shaderCache.clear(), this.materialCache.clear();
	}
	_getShaderCacheForMaterial(e) {
		let t = this.materialCache, n = t.get(e);
		return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
	}
	_getShaderStage(e) {
		let t = this.shaderCache, n = t.get(e);
		return n === void 0 && (n = new Co(e), t.set(e, n)), n;
	}
}, Co = class {
	constructor(e) {
		this.id = xo++, this.code = e, this.usedTimes = 0;
	}
};
function wo(e, t, n, r, i, a, o) {
	let s = new dn(), c = new So(), l = /* @__PURE__ */ new Set(), u = [], d = i.isWebGL2, f = i.logarithmicDepthBuffer, p = i.vertexTextures, m = i.precision, h = {
		MeshDepthMaterial: "depth",
		MeshDistanceMaterial: "distanceRGBA",
		MeshNormalMaterial: "normal",
		MeshBasicMaterial: "basic",
		MeshLambertMaterial: "lambert",
		MeshPhongMaterial: "phong",
		MeshToonMaterial: "toon",
		MeshStandardMaterial: "physical",
		MeshPhysicalMaterial: "physical",
		MeshMatcapMaterial: "matcap",
		LineBasicMaterial: "basic",
		LineDashedMaterial: "dashed",
		PointsMaterial: "points",
		ShadowMaterial: "shadow",
		SpriteMaterial: "sprite"
	};
	function g(e) {
		return l.add(e), e === 0 ? "uv" : `uv${e}`;
	}
	function _(a, s, u, _, v) {
		let y = _.fog, b = v.geometry, x = a.isMeshStandardMaterial ? _.environment : null, S = (a.isMeshStandardMaterial ? n : t).get(a.envMap || x), C = S && S.mapping === 306 ? S.image.height : null, w = h[a.type];
		a.precision !== null && (m = i.getMaxPrecision(a.precision), m !== a.precision && console.warn("THREE.WebGLProgram.getParameters:", a.precision, "not supported, using", m, "instead."));
		let T = b.morphAttributes.position || b.morphAttributes.normal || b.morphAttributes.color, E = T === void 0 ? 0 : T.length, D = 0;
		b.morphAttributes.position !== void 0 && (D = 1), b.morphAttributes.normal !== void 0 && (D = 2), b.morphAttributes.color !== void 0 && (D = 3);
		let O, k, A, j;
		if (w) {
			let e = ei[w];
			O = e.vertexShader, k = e.fragmentShader;
		} else O = a.vertexShader, k = a.fragmentShader, c.update(a), A = c.getVertexShaderID(a), j = c.getFragmentShaderID(a);
		let M = e.getRenderTarget(), ee = v.isInstancedMesh === !0, te = v.isBatchedMesh === !0, N = !!a.map, P = !!a.matcap, ne = !!S, re = !!a.aoMap, ie = !!a.lightMap, ae = !!a.bumpMap, oe = !!a.normalMap, se = !!a.displacementMap, F = !!a.emissiveMap, ce = !!a.metalnessMap, le = !!a.roughnessMap, ue = a.anisotropy > 0, I = a.clearcoat > 0, de = a.iridescence > 0, fe = a.sheen > 0, L = a.transmission > 0, pe = ue && !!a.anisotropyMap, R = I && !!a.clearcoatMap, z = I && !!a.clearcoatNormalMap, B = I && !!a.clearcoatRoughnessMap, V = de && !!a.iridescenceMap, H = de && !!a.iridescenceThicknessMap, U = fe && !!a.sheenColorMap, me = fe && !!a.sheenRoughnessMap, he = !!a.specularMap, ge = !!a.specularColorMap, ve = !!a.specularIntensityMap, W = L && !!a.transmissionMap, ye = L && !!a.thicknessMap, be = !!a.gradientMap, xe = !!a.alphaMap, Se = a.alphaTest > 0, Ce = !!a.alphaHash, we = !!a.extensions, Te = 0;
		a.toneMapped && (M === null || M.isXRRenderTarget === !0) && (Te = e.toneMapping);
		let G = {
			isWebGL2: d,
			shaderID: w,
			shaderType: a.type,
			shaderName: a.name,
			vertexShader: O,
			fragmentShader: k,
			defines: a.defines,
			customVertexShaderID: A,
			customFragmentShaderID: j,
			isRawShaderMaterial: a.isRawShaderMaterial === !0,
			glslVersion: a.glslVersion,
			precision: m,
			batching: te,
			instancing: ee,
			instancingColor: ee && v.instanceColor !== null,
			supportsVertexTextures: p,
			outputColorSpace: M === null ? e.outputColorSpace : M.isXRRenderTarget === !0 ? M.texture.colorSpace : _e,
			alphaToCoverage: !!a.alphaToCoverage,
			map: N,
			matcap: P,
			envMap: ne,
			envMapMode: ne && S.mapping,
			envMapCubeUVHeight: C,
			aoMap: re,
			lightMap: ie,
			bumpMap: ae,
			normalMap: oe,
			displacementMap: p && se,
			emissiveMap: F,
			normalMapObjectSpace: oe && a.normalMapType === 1,
			normalMapTangentSpace: oe && a.normalMapType === 0,
			metalnessMap: ce,
			roughnessMap: le,
			anisotropy: ue,
			anisotropyMap: pe,
			clearcoat: I,
			clearcoatMap: R,
			clearcoatNormalMap: z,
			clearcoatRoughnessMap: B,
			iridescence: de,
			iridescenceMap: V,
			iridescenceThicknessMap: H,
			sheen: fe,
			sheenColorMap: U,
			sheenRoughnessMap: me,
			specularMap: he,
			specularColorMap: ge,
			specularIntensityMap: ve,
			transmission: L,
			transmissionMap: W,
			thicknessMap: ye,
			gradientMap: be,
			opaque: a.transparent === !1 && a.blending === 1 && a.alphaToCoverage === !1,
			alphaMap: xe,
			alphaTest: Se,
			alphaHash: Ce,
			combine: a.combine,
			mapUv: N && g(a.map.channel),
			aoMapUv: re && g(a.aoMap.channel),
			lightMapUv: ie && g(a.lightMap.channel),
			bumpMapUv: ae && g(a.bumpMap.channel),
			normalMapUv: oe && g(a.normalMap.channel),
			displacementMapUv: se && g(a.displacementMap.channel),
			emissiveMapUv: F && g(a.emissiveMap.channel),
			metalnessMapUv: ce && g(a.metalnessMap.channel),
			roughnessMapUv: le && g(a.roughnessMap.channel),
			anisotropyMapUv: pe && g(a.anisotropyMap.channel),
			clearcoatMapUv: R && g(a.clearcoatMap.channel),
			clearcoatNormalMapUv: z && g(a.clearcoatNormalMap.channel),
			clearcoatRoughnessMapUv: B && g(a.clearcoatRoughnessMap.channel),
			iridescenceMapUv: V && g(a.iridescenceMap.channel),
			iridescenceThicknessMapUv: H && g(a.iridescenceThicknessMap.channel),
			sheenColorMapUv: U && g(a.sheenColorMap.channel),
			sheenRoughnessMapUv: me && g(a.sheenRoughnessMap.channel),
			specularMapUv: he && g(a.specularMap.channel),
			specularColorMapUv: ge && g(a.specularColorMap.channel),
			specularIntensityMapUv: ve && g(a.specularIntensityMap.channel),
			transmissionMapUv: W && g(a.transmissionMap.channel),
			thicknessMapUv: ye && g(a.thicknessMap.channel),
			alphaMapUv: xe && g(a.alphaMap.channel),
			vertexTangents: !!b.attributes.tangent && (oe || ue),
			vertexColors: a.vertexColors,
			vertexAlphas: a.vertexColors === !0 && !!b.attributes.color && b.attributes.color.itemSize === 4,
			pointsUvs: v.isPoints === !0 && !!b.attributes.uv && (N || xe),
			fog: !!y,
			useFog: a.fog === !0,
			fogExp2: !!y && y.isFogExp2,
			flatShading: a.flatShading === !0,
			sizeAttenuation: a.sizeAttenuation === !0,
			logarithmicDepthBuffer: f,
			skinning: v.isSkinnedMesh === !0,
			morphTargets: b.morphAttributes.position !== void 0,
			morphNormals: b.morphAttributes.normal !== void 0,
			morphColors: b.morphAttributes.color !== void 0,
			morphTargetsCount: E,
			morphTextureStride: D,
			numDirLights: s.directional.length,
			numPointLights: s.point.length,
			numSpotLights: s.spot.length,
			numSpotLightMaps: s.spotLightMap.length,
			numRectAreaLights: s.rectArea.length,
			numHemiLights: s.hemi.length,
			numDirLightShadows: s.directionalShadowMap.length,
			numPointLightShadows: s.pointShadowMap.length,
			numSpotLightShadows: s.spotShadowMap.length,
			numSpotLightShadowsWithMaps: s.numSpotLightShadowsWithMaps,
			numLightProbes: s.numLightProbes,
			numClippingPlanes: o.numPlanes,
			numClipIntersection: o.numIntersection,
			dithering: a.dithering,
			shadowMapEnabled: e.shadowMap.enabled && u.length > 0,
			shadowMapType: e.shadowMap.type,
			toneMapping: Te,
			useLegacyLights: e._useLegacyLights,
			decodeVideoTexture: N && a.map.isVideoTexture === !0 && J.getTransfer(a.map.colorSpace) === "srgb",
			premultipliedAlpha: a.premultipliedAlpha,
			doubleSided: a.side === 2,
			flipSided: a.side === 1,
			useDepthPacking: a.depthPacking >= 0,
			depthPacking: a.depthPacking || 0,
			index0AttributeName: a.index0AttributeName,
			extensionDerivatives: we && a.extensions.derivatives === !0,
			extensionFragDepth: we && a.extensions.fragDepth === !0,
			extensionDrawBuffers: we && a.extensions.drawBuffers === !0,
			extensionShaderTextureLOD: we && a.extensions.shaderTextureLOD === !0,
			extensionClipCullDistance: we && a.extensions.clipCullDistance === !0 && r.has("WEBGL_clip_cull_distance"),
			extensionMultiDraw: we && a.extensions.multiDraw === !0 && r.has("WEBGL_multi_draw"),
			rendererExtensionFragDepth: d || r.has("EXT_frag_depth"),
			rendererExtensionDrawBuffers: d || r.has("WEBGL_draw_buffers"),
			rendererExtensionShaderTextureLod: d || r.has("EXT_shader_texture_lod"),
			rendererExtensionParallelShaderCompile: r.has("KHR_parallel_shader_compile"),
			customProgramCacheKey: a.customProgramCacheKey()
		};
		return G.vertexUv1s = l.has(1), G.vertexUv2s = l.has(2), G.vertexUv3s = l.has(3), l.clear(), G;
	}
	function v(t) {
		let n = [];
		if (t.shaderID ? n.push(t.shaderID) : (n.push(t.customVertexShaderID), n.push(t.customFragmentShaderID)), t.defines !== void 0) for (let e in t.defines) n.push(e), n.push(t.defines[e]);
		return t.isRawShaderMaterial === !1 && (y(n, t), b(n, t), n.push(e.outputColorSpace)), n.push(t.customProgramCacheKey), n.join();
	}
	function y(e, t) {
		e.push(t.precision), e.push(t.outputColorSpace), e.push(t.envMapMode), e.push(t.envMapCubeUVHeight), e.push(t.mapUv), e.push(t.alphaMapUv), e.push(t.lightMapUv), e.push(t.aoMapUv), e.push(t.bumpMapUv), e.push(t.normalMapUv), e.push(t.displacementMapUv), e.push(t.emissiveMapUv), e.push(t.metalnessMapUv), e.push(t.roughnessMapUv), e.push(t.anisotropyMapUv), e.push(t.clearcoatMapUv), e.push(t.clearcoatNormalMapUv), e.push(t.clearcoatRoughnessMapUv), e.push(t.iridescenceMapUv), e.push(t.iridescenceThicknessMapUv), e.push(t.sheenColorMapUv), e.push(t.sheenRoughnessMapUv), e.push(t.specularMapUv), e.push(t.specularColorMapUv), e.push(t.specularIntensityMapUv), e.push(t.transmissionMapUv), e.push(t.thicknessMapUv), e.push(t.combine), e.push(t.fogExp2), e.push(t.sizeAttenuation), e.push(t.morphTargetsCount), e.push(t.morphAttributeCount), e.push(t.numDirLights), e.push(t.numPointLights), e.push(t.numSpotLights), e.push(t.numSpotLightMaps), e.push(t.numHemiLights), e.push(t.numRectAreaLights), e.push(t.numDirLightShadows), e.push(t.numPointLightShadows), e.push(t.numSpotLightShadows), e.push(t.numSpotLightShadowsWithMaps), e.push(t.numLightProbes), e.push(t.shadowMapType), e.push(t.toneMapping), e.push(t.numClippingPlanes), e.push(t.numClipIntersection), e.push(t.depthPacking);
	}
	function b(e, t) {
		s.disableAll(), t.isWebGL2 && s.enable(0), t.supportsVertexTextures && s.enable(1), t.instancing && s.enable(2), t.instancingColor && s.enable(3), t.matcap && s.enable(4), t.envMap && s.enable(5), t.normalMapObjectSpace && s.enable(6), t.normalMapTangentSpace && s.enable(7), t.clearcoat && s.enable(8), t.iridescence && s.enable(9), t.alphaTest && s.enable(10), t.vertexColors && s.enable(11), t.vertexAlphas && s.enable(12), t.vertexUv1s && s.enable(13), t.vertexUv2s && s.enable(14), t.vertexUv3s && s.enable(15), t.vertexTangents && s.enable(16), t.anisotropy && s.enable(17), t.alphaHash && s.enable(18), t.batching && s.enable(19), e.push(s.mask), s.disableAll(), t.fog && s.enable(0), t.useFog && s.enable(1), t.flatShading && s.enable(2), t.logarithmicDepthBuffer && s.enable(3), t.skinning && s.enable(4), t.morphTargets && s.enable(5), t.morphNormals && s.enable(6), t.morphColors && s.enable(7), t.premultipliedAlpha && s.enable(8), t.shadowMapEnabled && s.enable(9), t.useLegacyLights && s.enable(10), t.doubleSided && s.enable(11), t.flipSided && s.enable(12), t.useDepthPacking && s.enable(13), t.dithering && s.enable(14), t.transmission && s.enable(15), t.sheen && s.enable(16), t.opaque && s.enable(17), t.pointsUvs && s.enable(18), t.decodeVideoTexture && s.enable(19), t.alphaToCoverage && s.enable(20), e.push(s.mask);
	}
	function x(e) {
		let t = h[e.type], n;
		if (t) {
			let e = ei[t];
			n = Ar.clone(e.uniforms);
		} else n = e.uniforms;
		return n;
	}
	function S(t, n) {
		let r;
		for (let e = 0, t = u.length; e < t; e++) {
			let t = u[e];
			if (t.cacheKey === n) {
				r = t, ++r.usedTimes;
				break;
			}
		}
		return r === void 0 && (r = new bo(e, n, t, a), u.push(r)), r;
	}
	function C(e) {
		if (--e.usedTimes === 0) {
			let t = u.indexOf(e);
			u[t] = u[u.length - 1], u.pop(), e.destroy();
		}
	}
	function w(e) {
		c.remove(e);
	}
	function T() {
		c.dispose();
	}
	return {
		getParameters: _,
		getProgramCacheKey: v,
		getUniforms: x,
		acquireProgram: S,
		releaseProgram: C,
		releaseShaderCache: w,
		programs: u,
		dispose: T
	};
}
function To() {
	let e = /* @__PURE__ */ new WeakMap();
	function t(t) {
		let n = e.get(t);
		return n === void 0 && (n = {}, e.set(t, n)), n;
	}
	function n(t) {
		e.delete(t);
	}
	function r(t, n, r) {
		e.get(t)[n] = r;
	}
	function i() {
		e = /* @__PURE__ */ new WeakMap();
	}
	return {
		get: t,
		remove: n,
		update: r,
		dispose: i
	};
}
function Eo(e, t) {
	return e.groupOrder === t.groupOrder ? e.renderOrder === t.renderOrder ? e.material.id === t.material.id ? e.z === t.z ? e.id - t.id : e.z - t.z : e.material.id - t.material.id : e.renderOrder - t.renderOrder : e.groupOrder - t.groupOrder;
}
function Do(e, t) {
	return e.groupOrder === t.groupOrder ? e.renderOrder === t.renderOrder ? e.z === t.z ? e.id - t.id : t.z - e.z : e.renderOrder - t.renderOrder : e.groupOrder - t.groupOrder;
}
function Oo() {
	let e = [], t = 0, n = [], r = [], i = [];
	function a() {
		t = 0, n.length = 0, r.length = 0, i.length = 0;
	}
	function o(n, r, i, a, o, s) {
		let c = e[t];
		return c === void 0 ? (c = {
			id: n.id,
			object: n,
			geometry: r,
			material: i,
			groupOrder: a,
			renderOrder: n.renderOrder,
			z: o,
			group: s
		}, e[t] = c) : (c.id = n.id, c.object = n, c.geometry = r, c.material = i, c.groupOrder = a, c.renderOrder = n.renderOrder, c.z = o, c.group = s), t++, c;
	}
	function s(e, t, a, s, c, l) {
		let u = o(e, t, a, s, c, l);
		a.transmission > 0 ? r.push(u) : a.transparent === !0 ? i.push(u) : n.push(u);
	}
	function c(e, t, a, s, c, l) {
		let u = o(e, t, a, s, c, l);
		a.transmission > 0 ? r.unshift(u) : a.transparent === !0 ? i.unshift(u) : n.unshift(u);
	}
	function l(e, t) {
		n.length > 1 && n.sort(e || Eo), r.length > 1 && r.sort(t || Do), i.length > 1 && i.sort(t || Do);
	}
	function u() {
		for (let n = t, r = e.length; n < r; n++) {
			let t = e[n];
			if (t.id === null) break;
			t.id = null, t.object = null, t.geometry = null, t.material = null, t.group = null;
		}
	}
	return {
		opaque: n,
		transmissive: r,
		transparent: i,
		init: a,
		push: s,
		unshift: c,
		finish: u,
		sort: l
	};
}
function ko() {
	let e = /* @__PURE__ */ new WeakMap();
	function t(t, n) {
		let r = e.get(t), i;
		return r === void 0 ? (i = new Oo(), e.set(t, [i])) : n >= r.length ? (i = new Oo(), r.push(i)) : i = r[n], i;
	}
	function n() {
		e = /* @__PURE__ */ new WeakMap();
	}
	return {
		get: t,
		dispose: n
	};
}
function Ao() {
	let e = {};
	return { get: function(t) {
		if (e[t.id] !== void 0) return e[t.id];
		let n;
		switch (t.type) {
			case "DirectionalLight":
				n = {
					direction: new Y(),
					color: new X()
				};
				break;
			case "SpotLight":
				n = {
					position: new Y(),
					direction: new Y(),
					color: new X(),
					distance: 0,
					coneCos: 0,
					penumbraCos: 0,
					decay: 0
				};
				break;
			case "PointLight":
				n = {
					position: new Y(),
					color: new X(),
					distance: 0,
					decay: 0
				};
				break;
			case "HemisphereLight":
				n = {
					direction: new Y(),
					skyColor: new X(),
					groundColor: new X()
				};
				break;
			case "RectAreaLight": n = {
				color: new X(),
				position: new Y(),
				halfWidth: new Y(),
				halfHeight: new Y()
			};
		}
		return e[t.id] = n, n;
	} };
}
function jo() {
	let e = {};
	return { get: function(t) {
		if (e[t.id] !== void 0) return e[t.id];
		let n;
		switch (t.type) {
			case "DirectionalLight":
				n = {
					shadowBias: 0,
					shadowNormalBias: 0,
					shadowRadius: 1,
					shadowMapSize: new K()
				};
				break;
			case "SpotLight":
				n = {
					shadowBias: 0,
					shadowNormalBias: 0,
					shadowRadius: 1,
					shadowMapSize: new K()
				};
				break;
			case "PointLight": n = {
				shadowBias: 0,
				shadowNormalBias: 0,
				shadowRadius: 1,
				shadowMapSize: new K(),
				shadowCameraNear: 1,
				shadowCameraFar: 1e3
			};
		}
		return e[t.id] = n, n;
	} };
}
var Mo = 0;
function No(e, t) {
	return (t.castShadow ? 2 : 0) - (e.castShadow ? 2 : 0) + +!!t.map - !!e.map;
}
function Po(e, t) {
	let n = new Ao(), r = jo(), i = {
		version: 0,
		hash: {
			directionalLength: -1,
			pointLength: -1,
			spotLength: -1,
			rectAreaLength: -1,
			hemiLength: -1,
			numDirectionalShadows: -1,
			numPointShadows: -1,
			numSpotShadows: -1,
			numSpotMaps: -1,
			numLightProbes: -1
		},
		ambient: [
			0,
			0,
			0
		],
		probe: [],
		directional: [],
		directionalShadow: [],
		directionalShadowMap: [],
		directionalShadowMatrix: [],
		spot: [],
		spotLightMap: [],
		spotShadow: [],
		spotShadowMap: [],
		spotLightMatrix: [],
		rectArea: [],
		rectAreaLTC1: null,
		rectAreaLTC2: null,
		point: [],
		pointShadow: [],
		pointShadowMap: [],
		pointShadowMatrix: [],
		hemi: [],
		numSpotLightShadowsWithMaps: 0,
		numLightProbes: 0
	};
	for (let e = 0; e < 9; e++) i.probe.push(new Y());
	let a = new Y(), o = new $t(), s = new $t();
	function c(a, o) {
		let s = 0, c = 0, l = 0;
		for (let e = 0; e < 9; e++) i.probe[e].set(0, 0, 0);
		let u = 0, d = 0, f = 0, p = 0, m = 0, h = 0, g = 0, _ = 0, v = 0, y = 0, b = 0;
		a.sort(No);
		let x = o === !0 ? Math.PI : 1;
		for (let e = 0, t = a.length; e < t; e++) {
			let t = a[e], o = t.color, S = t.intensity, C = t.distance, w = t.shadow && t.shadow.map ? t.shadow.map.texture : null;
			if (t.isAmbientLight) s += o.r * S * x, c += o.g * S * x, l += o.b * S * x;
			else if (t.isLightProbe) {
				for (let e = 0; e < 9; e++) i.probe[e].addScaledVector(t.sh.coefficients[e], S);
				b++;
			} else if (t.isDirectionalLight) {
				let e = n.get(t);
				if (e.color.copy(t.color).multiplyScalar(t.intensity * x), t.castShadow) {
					let e = t.shadow, n = r.get(t);
					n.shadowBias = e.bias, n.shadowNormalBias = e.normalBias, n.shadowRadius = e.radius, n.shadowMapSize = e.mapSize, i.directionalShadow[u] = n, i.directionalShadowMap[u] = w, i.directionalShadowMatrix[u] = t.shadow.matrix, h++;
				}
				i.directional[u] = e, u++;
			} else if (t.isSpotLight) {
				let e = n.get(t);
				e.position.setFromMatrixPosition(t.matrixWorld), e.color.copy(o).multiplyScalar(S * x), e.distance = C, e.coneCos = Math.cos(t.angle), e.penumbraCos = Math.cos(t.angle * (1 - t.penumbra)), e.decay = t.decay, i.spot[f] = e;
				let a = t.shadow;
				if (t.map && (i.spotLightMap[v] = t.map, v++, a.updateMatrices(t), t.castShadow && y++), i.spotLightMatrix[f] = a.matrix, t.castShadow) {
					let e = r.get(t);
					e.shadowBias = a.bias, e.shadowNormalBias = a.normalBias, e.shadowRadius = a.radius, e.shadowMapSize = a.mapSize, i.spotShadow[f] = e, i.spotShadowMap[f] = w, _++;
				}
				f++;
			} else if (t.isRectAreaLight) {
				let e = n.get(t);
				e.color.copy(o).multiplyScalar(S), e.halfWidth.set(t.width * .5, 0, 0), e.halfHeight.set(0, t.height * .5, 0), i.rectArea[p] = e, p++;
			} else if (t.isPointLight) {
				let e = n.get(t);
				if (e.color.copy(t.color).multiplyScalar(t.intensity * x), e.distance = t.distance, e.decay = t.decay, t.castShadow) {
					let e = t.shadow, n = r.get(t);
					n.shadowBias = e.bias, n.shadowNormalBias = e.normalBias, n.shadowRadius = e.radius, n.shadowMapSize = e.mapSize, n.shadowCameraNear = e.camera.near, n.shadowCameraFar = e.camera.far, i.pointShadow[d] = n, i.pointShadowMap[d] = w, i.pointShadowMatrix[d] = t.shadow.matrix, g++;
				}
				i.point[d] = e, d++;
			} else if (t.isHemisphereLight) {
				let e = n.get(t);
				e.skyColor.copy(t.color).multiplyScalar(S * x), e.groundColor.copy(t.groundColor).multiplyScalar(S * x), i.hemi[m] = e, m++;
			}
		}
		p > 0 && (t.isWebGL2 ? e.has("OES_texture_float_linear") === !0 ? (i.rectAreaLTC1 = Q.LTC_FLOAT_1, i.rectAreaLTC2 = Q.LTC_FLOAT_2) : (i.rectAreaLTC1 = Q.LTC_HALF_1, i.rectAreaLTC2 = Q.LTC_HALF_2) : e.has("OES_texture_float_linear") === !0 ? (i.rectAreaLTC1 = Q.LTC_FLOAT_1, i.rectAreaLTC2 = Q.LTC_FLOAT_2) : e.has("OES_texture_half_float_linear") === !0 ? (i.rectAreaLTC1 = Q.LTC_HALF_1, i.rectAreaLTC2 = Q.LTC_HALF_2) : console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")), i.ambient[0] = s, i.ambient[1] = c, i.ambient[2] = l;
		let S = i.hash;
		(S.directionalLength !== u || S.pointLength !== d || S.spotLength !== f || S.rectAreaLength !== p || S.hemiLength !== m || S.numDirectionalShadows !== h || S.numPointShadows !== g || S.numSpotShadows !== _ || S.numSpotMaps !== v || S.numLightProbes !== b) && (i.directional.length = u, i.spot.length = f, i.rectArea.length = p, i.point.length = d, i.hemi.length = m, i.directionalShadow.length = h, i.directionalShadowMap.length = h, i.pointShadow.length = g, i.pointShadowMap.length = g, i.spotShadow.length = _, i.spotShadowMap.length = _, i.directionalShadowMatrix.length = h, i.pointShadowMatrix.length = g, i.spotLightMatrix.length = _ + v - y, i.spotLightMap.length = v, i.numSpotLightShadowsWithMaps = y, i.numLightProbes = b, S.directionalLength = u, S.pointLength = d, S.spotLength = f, S.rectAreaLength = p, S.hemiLength = m, S.numDirectionalShadows = h, S.numPointShadows = g, S.numSpotShadows = _, S.numSpotMaps = v, S.numLightProbes = b, i.version = Mo++);
	}
	function l(e, t) {
		let n = 0, r = 0, c = 0, l = 0, u = 0, d = t.matrixWorldInverse;
		for (let t = 0, f = e.length; t < f; t++) {
			let f = e[t];
			if (f.isDirectionalLight) {
				let e = i.directional[n];
				e.direction.setFromMatrixPosition(f.matrixWorld), a.setFromMatrixPosition(f.target.matrixWorld), e.direction.sub(a), e.direction.transformDirection(d), n++;
			} else if (f.isSpotLight) {
				let e = i.spot[c];
				e.position.setFromMatrixPosition(f.matrixWorld), e.position.applyMatrix4(d), e.direction.setFromMatrixPosition(f.matrixWorld), a.setFromMatrixPosition(f.target.matrixWorld), e.direction.sub(a), e.direction.transformDirection(d), c++;
			} else if (f.isRectAreaLight) {
				let e = i.rectArea[l];
				e.position.setFromMatrixPosition(f.matrixWorld), e.position.applyMatrix4(d), s.identity(), o.copy(f.matrixWorld), o.premultiply(d), s.extractRotation(o), e.halfWidth.set(f.width * .5, 0, 0), e.halfHeight.set(0, f.height * .5, 0), e.halfWidth.applyMatrix4(s), e.halfHeight.applyMatrix4(s), l++;
			} else if (f.isPointLight) {
				let e = i.point[r];
				e.position.setFromMatrixPosition(f.matrixWorld), e.position.applyMatrix4(d), r++;
			} else if (f.isHemisphereLight) {
				let e = i.hemi[u];
				e.direction.setFromMatrixPosition(f.matrixWorld), e.direction.transformDirection(d), u++;
			}
		}
	}
	return {
		setup: c,
		setupView: l,
		state: i
	};
}
function Fo(e, t) {
	let n = new Po(e, t), r = [], i = [];
	function a() {
		r.length = 0, i.length = 0;
	}
	function o(e) {
		r.push(e);
	}
	function s(e) {
		i.push(e);
	}
	function c(e) {
		n.setup(r, e);
	}
	function l(e) {
		n.setupView(r, e);
	}
	return {
		init: a,
		state: {
			lightsArray: r,
			shadowsArray: i,
			lights: n
		},
		setupLights: c,
		setupLightsView: l,
		pushLight: o,
		pushShadow: s
	};
}
function Io(e, t) {
	let n = /* @__PURE__ */ new WeakMap();
	function r(r, i = 0) {
		let a = n.get(r), o;
		return a === void 0 ? (o = new Fo(e, t), n.set(r, [o])) : i >= a.length ? (o = new Fo(e, t), a.push(o)) : o = a[i], o;
	}
	function i() {
		n = /* @__PURE__ */ new WeakMap();
	}
	return {
		get: r,
		dispose: i
	};
}
var Lo = class extends Un {
	constructor(e) {
		super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = me, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
	}
}, Ro = class extends Un {
	constructor(e) {
		super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
	}
}, zo = "void main() {\n	gl_Position = vec4( position, 1.0 );\n}", Bo = "uniform sampler2D shadow_pass;\nuniform vec2 resolution;\nuniform float radius;\n#include <packing>\nvoid main() {\n	const float samples = float( VSM_SAMPLES );\n	float mean = 0.0;\n	float squared_mean = 0.0;\n	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );\n	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;\n	for ( float i = 0.0; i < samples; i ++ ) {\n		float uvOffset = uvStart + i * uvStride;\n		#ifdef HORIZONTAL_PASS\n			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );\n			mean += distribution.x;\n			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;\n		#else\n			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );\n			mean += depth;\n			squared_mean += depth * depth;\n		#endif\n	}\n	mean = mean / samples;\n	squared_mean = squared_mean / samples;\n	float std_dev = sqrt( squared_mean - mean * mean );\n	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );\n}";
function Vo(e, t, n) {
	let r = new Xr(), i = new K(), a = new K(), o = new vt(), s = new Lo({ depthPacking: he }), c = new Ro(), l = {}, u = n.maxTextureSize, d = {
		0: 1,
		1: 0,
		2: 2
	}, f = new Nr({
		defines: { VSM_SAMPLES: 8 },
		uniforms: {
			shadow_pass: { value: null },
			resolution: { value: new K() },
			radius: { value: 4 }
		},
		vertexShader: zo,
		fragmentShader: Bo
	}), p = f.clone();
	p.defines.HORIZONTAL_PASS = 1;
	let m = new ir();
	m.setAttribute("position", new qn(new Float32Array([
		-1,
		-1,
		.5,
		3,
		-1,
		.5,
		-1,
		3,
		.5
	]), 3));
	let h = new Sr(m, f), g = this;
	this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
	let _ = this.type;
	this.render = function(t, n, s) {
		if (g.enabled === !1 || g.autoUpdate === !1 && g.needsUpdate === !1 || t.length === 0) return;
		let c = e.getRenderTarget(), l = e.getActiveCubeFace(), d = e.getActiveMipmapLevel(), f = e.state;
		f.setBlending(0), f.buffers.color.setClear(1, 1, 1, 1), f.buffers.depth.setTest(!0), f.setScissorTest(!1);
		let p = _ !== 3 && this.type === 3, m = _ === 3 && this.type !== 3;
		for (let c = 0, l = t.length; c < l; c++) {
			let l = t[c], d = l.shadow;
			if (d === void 0) {
				console.warn("THREE.WebGLShadowMap:", l, "has no shadow.");
				continue;
			}
			if (d.autoUpdate === !1 && d.needsUpdate === !1) continue;
			i.copy(d.mapSize);
			let h = d.getFrameExtents();
			if (i.multiply(h), a.copy(d.mapSize), (i.x > u || i.y > u) && (i.x > u && (a.x = Math.floor(u / h.x), i.x = a.x * h.x, d.mapSize.x = a.x), i.y > u && (a.y = Math.floor(u / h.y), i.y = a.y * h.y, d.mapSize.y = a.y)), d.map === null || p === !0 || m === !0) {
				let e = this.type === 3 ? {} : {
					minFilter: P,
					magFilter: P
				};
				d.map !== null && d.map.dispose(), d.map = new bt(i.x, i.y, e), d.map.texture.name = l.name + ".shadowMap", d.camera.updateProjectionMatrix();
			}
			e.setRenderTarget(d.map), e.clear();
			let g = d.getViewportCount();
			for (let e = 0; e < g; e++) {
				let t = d.getViewport(e);
				o.set(a.x * t.x, a.y * t.y, a.x * t.z, a.y * t.w), f.viewport(o), d.updateMatrices(l, e), r = d.getFrustum(), b(n, s, d.camera, l, this.type);
			}
			d.isPointLightShadow !== !0 && this.type === 3 && v(d, s), d.needsUpdate = !1;
		}
		_ = this.type, g.needsUpdate = !1, e.setRenderTarget(c, l, d);
	};
	function v(n, r) {
		let a = t.update(h);
		f.defines.VSM_SAMPLES !== n.blurSamples && (f.defines.VSM_SAMPLES = n.blurSamples, p.defines.VSM_SAMPLES = n.blurSamples, f.needsUpdate = !0, p.needsUpdate = !0), n.mapPass === null && (n.mapPass = new bt(i.x, i.y)), f.uniforms.shadow_pass.value = n.map.texture, f.uniforms.resolution.value = n.mapSize, f.uniforms.radius.value = n.radius, e.setRenderTarget(n.mapPass), e.clear(), e.renderBufferDirect(r, null, a, f, h, null), p.uniforms.shadow_pass.value = n.mapPass.texture, p.uniforms.resolution.value = n.mapSize, p.uniforms.radius.value = n.radius, e.setRenderTarget(n.map), e.clear(), e.renderBufferDirect(r, null, a, p, h, null);
	}
	function y(t, n, r, i) {
		let a = null, o = r.isPointLight === !0 ? t.customDistanceMaterial : t.customDepthMaterial;
		if (o !== void 0) a = o;
		else if (a = r.isPointLight === !0 ? c : s, e.localClippingEnabled && n.clipShadows === !0 && Array.isArray(n.clippingPlanes) && n.clippingPlanes.length !== 0 || n.displacementMap && n.displacementScale !== 0 || n.alphaMap && n.alphaTest > 0 || n.map && n.alphaTest > 0) {
			let e = a.uuid, t = n.uuid, r = l[e];
			r === void 0 && (r = {}, l[e] = r);
			let i = r[t];
			i === void 0 && (i = a.clone(), r[t] = i, n.addEventListener("dispose", x)), a = i;
		}
		if (a.visible = n.visible, a.wireframe = n.wireframe, i === 3 ? a.side = n.shadowSide === null ? n.side : n.shadowSide : a.side = n.shadowSide === null ? d[n.side] : n.shadowSide, a.alphaMap = n.alphaMap, a.alphaTest = n.alphaTest, a.map = n.map, a.clipShadows = n.clipShadows, a.clippingPlanes = n.clippingPlanes, a.clipIntersection = n.clipIntersection, a.displacementMap = n.displacementMap, a.displacementScale = n.displacementScale, a.displacementBias = n.displacementBias, a.wireframeLinewidth = n.wireframeLinewidth, a.linewidth = n.linewidth, r.isPointLight === !0 && a.isMeshDistanceMaterial === !0) {
			let t = e.properties.get(a);
			t.light = r;
		}
		return a;
	}
	function b(n, i, a, o, s) {
		if (n.visible === !1) return;
		if (n.layers.test(i.layers) && (n.isMesh || n.isLine || n.isPoints) && (n.castShadow || n.receiveShadow && s === 3) && (!n.frustumCulled || r.intersectsObject(n))) {
			n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse, n.matrixWorld);
			let r = t.update(n), c = n.material;
			if (Array.isArray(c)) {
				let t = r.groups;
				for (let l = 0, u = t.length; l < u; l++) {
					let u = t[l], d = c[u.materialIndex];
					if (d && d.visible) {
						let t = y(n, d, o, s);
						n.onBeforeShadow(e, n, i, a, r, t, u), e.renderBufferDirect(a, null, r, t, n, u), n.onAfterShadow(e, n, i, a, r, t, u);
					}
				}
			} else if (c.visible) {
				let t = y(n, c, o, s);
				n.onBeforeShadow(e, n, i, a, r, t, null), e.renderBufferDirect(a, null, r, t, n, null), n.onAfterShadow(e, n, i, a, r, t, null);
			}
		}
		let c = n.children;
		for (let e = 0, t = c.length; e < t; e++) b(c[e], i, a, o, s);
	}
	function x(e) {
		e.target.removeEventListener("dispose", x);
		for (let t in l) {
			let n = l[t], r = e.target.uuid;
			r in n && (n[r].dispose(), delete n[r]);
		}
	}
}
function Ho(e, t, n) {
	let r = n.isWebGL2;
	function i() {
		let t = !1, n = new vt(), r = null, i = new vt(0, 0, 0, 0);
		return {
			setMask: function(n) {
				r !== n && !t && (e.colorMask(n, n, n, n), r = n);
			},
			setLocked: function(e) {
				t = e;
			},
			setClear: function(t, r, a, o, s) {
				s === !0 && (t *= o, r *= o, a *= o), n.set(t, r, a, o), i.equals(n) === !1 && (e.clearColor(t, r, a, o), i.copy(n));
			},
			reset: function() {
				t = !1, r = null, i.set(-1, 0, 0, 0);
			}
		};
	}
	function a() {
		let t = !1, n = null, r = null, i = null;
		return {
			setTest: function(t) {
				t ? le(e.DEPTH_TEST) : ue(e.DEPTH_TEST);
			},
			setMask: function(r) {
				n !== r && !t && (e.depthMask(r), n = r);
			},
			setFunc: function(t) {
				if (r !== t) {
					switch (t) {
						case 0:
							e.depthFunc(e.NEVER);
							break;
						case 1:
							e.depthFunc(e.ALWAYS);
							break;
						case 2:
							e.depthFunc(e.LESS);
							break;
						case 3:
							e.depthFunc(e.LEQUAL);
							break;
						case 4:
							e.depthFunc(e.EQUAL);
							break;
						case 5:
							e.depthFunc(e.GEQUAL);
							break;
						case 6:
							e.depthFunc(e.GREATER);
							break;
						case 7:
							e.depthFunc(e.NOTEQUAL);
							break;
						default: e.depthFunc(e.LEQUAL);
					}
					r = t;
				}
			},
			setLocked: function(e) {
				t = e;
			},
			setClear: function(t) {
				i !== t && (e.clearDepth(t), i = t);
			},
			reset: function() {
				t = !1, n = null, r = null, i = null;
			}
		};
	}
	function o() {
		let t = !1, n = null, r = null, i = null, a = null, o = null, s = null, c = null, l = null;
		return {
			setTest: function(n) {
				t || (n ? le(e.STENCIL_TEST) : ue(e.STENCIL_TEST));
			},
			setMask: function(r) {
				n !== r && !t && (e.stencilMask(r), n = r);
			},
			setFunc: function(t, n, o) {
				(r !== t || i !== n || a !== o) && (e.stencilFunc(t, n, o), r = t, i = n, a = o);
			},
			setOp: function(t, n, r) {
				(o !== t || s !== n || c !== r) && (e.stencilOp(t, n, r), o = t, s = n, c = r);
			},
			setLocked: function(e) {
				t = e;
			},
			setClear: function(t) {
				l !== t && (e.clearStencil(t), l = t);
			},
			reset: function() {
				t = !1, n = null, r = null, i = null, a = null, o = null, s = null, c = null, l = null;
			}
		};
	}
	let s = new i(), c = new a(), l = new o(), u = /* @__PURE__ */ new WeakMap(), d = /* @__PURE__ */ new WeakMap(), f = {}, p = {}, m = /* @__PURE__ */ new WeakMap(), h = [], g = null, _ = !1, v = null, y = null, b = null, x = null, S = null, C = null, w = null, T = new X(0, 0, 0), E = 0, D = !1, O = null, k = null, A = null, j = null, M = null, ee = e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS), te = !1, N = 0, P = e.getParameter(e.VERSION);
	P.indexOf("WebGL") === -1 ? P.indexOf("OpenGL ES") !== -1 && (N = parseFloat(/^OpenGL ES (\d)/.exec(P)[1]), te = N >= 2) : (N = parseFloat(/^WebGL (\d)/.exec(P)[1]), te = N >= 1);
	let ne = null, re = {}, ie = e.getParameter(e.SCISSOR_BOX), ae = e.getParameter(e.VIEWPORT), oe = new vt().fromArray(ie), se = new vt().fromArray(ae);
	function F(t, n, i, a) {
		let o = /* @__PURE__ */ new Uint8Array(4), s = e.createTexture();
		e.bindTexture(t, s), e.texParameteri(t, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(t, e.TEXTURE_MAG_FILTER, e.NEAREST);
		for (let s = 0; s < i; s++) r && (t === e.TEXTURE_3D || t === e.TEXTURE_2D_ARRAY) ? e.texImage3D(n, 0, e.RGBA, 1, 1, a, 0, e.RGBA, e.UNSIGNED_BYTE, o) : e.texImage2D(n + s, 0, e.RGBA, 1, 1, 0, e.RGBA, e.UNSIGNED_BYTE, o);
		return s;
	}
	let ce = {};
	ce[e.TEXTURE_2D] = F(e.TEXTURE_2D, e.TEXTURE_2D, 1), ce[e.TEXTURE_CUBE_MAP] = F(e.TEXTURE_CUBE_MAP, e.TEXTURE_CUBE_MAP_POSITIVE_X, 6), r && (ce[e.TEXTURE_2D_ARRAY] = F(e.TEXTURE_2D_ARRAY, e.TEXTURE_2D_ARRAY, 1, 1), ce[e.TEXTURE_3D] = F(e.TEXTURE_3D, e.TEXTURE_3D, 1, 1)), s.setClear(0, 0, 0, 1), c.setClear(1), l.setClear(0), le(e.DEPTH_TEST), c.setFunc(3), B(!1), V(1), le(e.CULL_FACE), R(0);
	function le(t) {
		f[t] !== !0 && (e.enable(t), f[t] = !0);
	}
	function ue(t) {
		f[t] !== !1 && (e.disable(t), f[t] = !1);
	}
	function I(t, n) {
		return p[t] !== n && (e.bindFramebuffer(t, n), p[t] = n, r && (t === e.DRAW_FRAMEBUFFER && (p[e.FRAMEBUFFER] = n), t === e.FRAMEBUFFER && (p[e.DRAW_FRAMEBUFFER] = n)), !0);
	}
	function de(r, i) {
		let a = h, o = !1;
		if (r) {
			if (a = m.get(i), a === void 0 && (a = [], m.set(i, a)), r.isWebGLMultipleRenderTargets) {
				let t = r.texture;
				if (a.length !== t.length || a[0] !== e.COLOR_ATTACHMENT0) {
					for (let n = 0, r = t.length; n < r; n++) a[n] = e.COLOR_ATTACHMENT0 + n;
					a.length = t.length, o = !0;
				}
			} else a[0] !== e.COLOR_ATTACHMENT0 && (a[0] = e.COLOR_ATTACHMENT0, o = !0);
		} else a[0] !== e.BACK && (a[0] = e.BACK, o = !0);
		o && (n.isWebGL2 ? e.drawBuffers(a) : t.get("WEBGL_draw_buffers").drawBuffersWEBGL(a));
	}
	function fe(t) {
		return g !== t && (e.useProgram(t), g = t, !0);
	}
	let L = {
		100: e.FUNC_ADD,
		101: e.FUNC_SUBTRACT,
		102: e.FUNC_REVERSE_SUBTRACT
	};
	if (r) L[103] = e.MIN, L[104] = e.MAX;
	else {
		let e = t.get("EXT_blend_minmax");
		e !== null && (L[103] = e.MIN_EXT, L[104] = e.MAX_EXT);
	}
	let pe = {
		200: e.ZERO,
		201: e.ONE,
		202: e.SRC_COLOR,
		204: e.SRC_ALPHA,
		210: e.SRC_ALPHA_SATURATE,
		208: e.DST_COLOR,
		206: e.DST_ALPHA,
		203: e.ONE_MINUS_SRC_COLOR,
		205: e.ONE_MINUS_SRC_ALPHA,
		209: e.ONE_MINUS_DST_COLOR,
		207: e.ONE_MINUS_DST_ALPHA,
		211: e.CONSTANT_COLOR,
		212: e.ONE_MINUS_CONSTANT_COLOR,
		213: e.CONSTANT_ALPHA,
		214: e.ONE_MINUS_CONSTANT_ALPHA
	};
	function R(t, n, r, i, a, o, s, c, l, u) {
		if (t === 0) _ === !0 && (ue(e.BLEND), _ = !1);
		else if (_ === !1 && (le(e.BLEND), _ = !0), t !== 5) {
			if (t !== v || u !== D) {
				if ((y !== 100 || S !== 100) && (e.blendEquation(e.FUNC_ADD), y = 100, S = 100), u) switch (t) {
					case 1:
						e.blendFuncSeparate(e.ONE, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
						break;
					case 2:
						e.blendFunc(e.ONE, e.ONE);
						break;
					case 3:
						e.blendFuncSeparate(e.ZERO, e.ONE_MINUS_SRC_COLOR, e.ZERO, e.ONE);
						break;
					case 4:
						e.blendFuncSeparate(e.ZERO, e.SRC_COLOR, e.ZERO, e.SRC_ALPHA);
						break;
					default: console.error("THREE.WebGLState: Invalid blending: ", t);
				}
				else switch (t) {
					case 1:
						e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
						break;
					case 2:
						e.blendFunc(e.SRC_ALPHA, e.ONE);
						break;
					case 3:
						e.blendFuncSeparate(e.ZERO, e.ONE_MINUS_SRC_COLOR, e.ZERO, e.ONE);
						break;
					case 4:
						e.blendFunc(e.ZERO, e.SRC_COLOR);
						break;
					default: console.error("THREE.WebGLState: Invalid blending: ", t);
				}
				b = null, x = null, C = null, w = null, T.set(0, 0, 0), E = 0, v = t, D = u;
			}
		} else a ||= n, o ||= r, s ||= i, (n !== y || a !== S) && (e.blendEquationSeparate(L[n], L[a]), y = n, S = a), (r !== b || i !== x || o !== C || s !== w) && (e.blendFuncSeparate(pe[r], pe[i], pe[o], pe[s]), b = r, x = i, C = o, w = s), (c.equals(T) === !1 || l !== E) && (e.blendColor(c.r, c.g, c.b, l), T.copy(c), E = l), v = t, D = !1;
	}
	function z(t, n) {
		t.side === 2 ? ue(e.CULL_FACE) : le(e.CULL_FACE);
		let r = t.side === 1;
		n && (r = !r), B(r), t.blending === 1 && t.transparent === !1 ? R(0) : R(t.blending, t.blendEquation, t.blendSrc, t.blendDst, t.blendEquationAlpha, t.blendSrcAlpha, t.blendDstAlpha, t.blendColor, t.blendAlpha, t.premultipliedAlpha), c.setFunc(t.depthFunc), c.setTest(t.depthTest), c.setMask(t.depthWrite), s.setMask(t.colorWrite);
		let i = t.stencilWrite;
		l.setTest(i), i && (l.setMask(t.stencilWriteMask), l.setFunc(t.stencilFunc, t.stencilRef, t.stencilFuncMask), l.setOp(t.stencilFail, t.stencilZFail, t.stencilZPass)), U(t.polygonOffset, t.polygonOffsetFactor, t.polygonOffsetUnits), t.alphaToCoverage === !0 ? le(e.SAMPLE_ALPHA_TO_COVERAGE) : ue(e.SAMPLE_ALPHA_TO_COVERAGE);
	}
	function B(t) {
		O !== t && (t ? e.frontFace(e.CW) : e.frontFace(e.CCW), O = t);
	}
	function V(t) {
		t === 0 ? ue(e.CULL_FACE) : (le(e.CULL_FACE), t !== k && (t === 1 ? e.cullFace(e.BACK) : t === 2 ? e.cullFace(e.FRONT) : e.cullFace(e.FRONT_AND_BACK))), k = t;
	}
	function H(t) {
		t !== A && (te && e.lineWidth(t), A = t);
	}
	function U(t, n, r) {
		t ? (le(e.POLYGON_OFFSET_FILL), (j !== n || M !== r) && (e.polygonOffset(n, r), j = n, M = r)) : ue(e.POLYGON_OFFSET_FILL);
	}
	function me(t) {
		t ? le(e.SCISSOR_TEST) : ue(e.SCISSOR_TEST);
	}
	function he(t) {
		t === void 0 && (t = e.TEXTURE0 + ee - 1), ne !== t && (e.activeTexture(t), ne = t);
	}
	function ge(t, n, r) {
		r === void 0 && (r = ne === null ? e.TEXTURE0 + ee - 1 : ne);
		let i = re[r];
		i === void 0 && (i = {
			type: void 0,
			texture: void 0
		}, re[r] = i), (i.type !== t || i.texture !== n) && (ne !== r && (e.activeTexture(r), ne = r), e.bindTexture(t, n || ce[t]), i.type = t, i.texture = n);
	}
	function _e() {
		let t = re[ne];
		t !== void 0 && t.type !== void 0 && (e.bindTexture(t.type, null), t.type = void 0, t.texture = void 0);
	}
	function ve() {
		try {
			e.compressedTexImage2D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function W() {
		try {
			e.compressedTexImage3D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function ye() {
		try {
			e.texSubImage2D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function be() {
		try {
			e.texSubImage3D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function xe() {
		try {
			e.compressedTexSubImage2D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function Se() {
		try {
			e.compressedTexSubImage3D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function Ce() {
		try {
			e.texStorage2D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function we() {
		try {
			e.texStorage3D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function Te() {
		try {
			e.texImage2D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function G() {
		try {
			e.texImage3D.apply(e, arguments);
		} catch (e) {
			console.error("THREE.WebGLState:", e);
		}
	}
	function Ee(t) {
		oe.equals(t) === !1 && (e.scissor(t.x, t.y, t.z, t.w), oe.copy(t));
	}
	function De(t) {
		se.equals(t) === !1 && (e.viewport(t.x, t.y, t.z, t.w), se.copy(t));
	}
	function Oe(t, n) {
		let r = d.get(n);
		r === void 0 && (r = /* @__PURE__ */ new WeakMap(), d.set(n, r));
		let i = r.get(t);
		i === void 0 && (i = e.getUniformBlockIndex(n, t.name), r.set(t, i));
	}
	function ke(t, n) {
		let r = d.get(n).get(t);
		u.get(n) !== r && (e.uniformBlockBinding(n, r, t.__bindingPointIndex), u.set(n, r));
	}
	function Ae() {
		e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.POLYGON_OFFSET_FILL), e.disable(e.SCISSOR_TEST), e.disable(e.STENCIL_TEST), e.disable(e.SAMPLE_ALPHA_TO_COVERAGE), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.ONE, e.ZERO), e.blendFuncSeparate(e.ONE, e.ZERO, e.ONE, e.ZERO), e.blendColor(0, 0, 0, 0), e.colorMask(!0, !0, !0, !0), e.clearColor(0, 0, 0, 0), e.depthMask(!0), e.depthFunc(e.LESS), e.clearDepth(1), e.stencilMask(4294967295), e.stencilFunc(e.ALWAYS, 0, 4294967295), e.stencilOp(e.KEEP, e.KEEP, e.KEEP), e.clearStencil(0), e.cullFace(e.BACK), e.frontFace(e.CCW), e.polygonOffset(0, 0), e.activeTexture(e.TEXTURE0), e.bindFramebuffer(e.FRAMEBUFFER, null), r === !0 && (e.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), e.bindFramebuffer(e.READ_FRAMEBUFFER, null)), e.useProgram(null), e.lineWidth(1), e.scissor(0, 0, e.canvas.width, e.canvas.height), e.viewport(0, 0, e.canvas.width, e.canvas.height), f = {}, ne = null, re = {}, p = {}, m = /* @__PURE__ */ new WeakMap(), h = [], g = null, _ = !1, v = null, y = null, b = null, x = null, S = null, C = null, w = null, T = new X(0, 0, 0), E = 0, D = !1, O = null, k = null, A = null, j = null, M = null, oe.set(0, 0, e.canvas.width, e.canvas.height), se.set(0, 0, e.canvas.width, e.canvas.height), s.reset(), c.reset(), l.reset();
	}
	return {
		buffers: {
			color: s,
			depth: c,
			stencil: l
		},
		enable: le,
		disable: ue,
		bindFramebuffer: I,
		drawBuffers: de,
		useProgram: fe,
		setBlending: R,
		setMaterial: z,
		setFlipSided: B,
		setCullFace: V,
		setLineWidth: H,
		setPolygonOffset: U,
		setScissorTest: me,
		activeTexture: he,
		bindTexture: ge,
		unbindTexture: _e,
		compressedTexImage2D: ve,
		compressedTexImage3D: W,
		texImage2D: Te,
		texImage3D: G,
		updateUBOMapping: Oe,
		uniformBlockBinding: ke,
		texStorage2D: Ce,
		texStorage3D: we,
		texSubImage2D: ye,
		texSubImage3D: be,
		compressedTexSubImage2D: xe,
		compressedTexSubImage3D: Se,
		scissor: Ee,
		viewport: De,
		reset: Ae
	};
}
function Uo(e, t, n, r, i, a, o) {
	let s = i.isWebGL2, c = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), u = /* @__PURE__ */ new WeakMap(), d, f = /* @__PURE__ */ new WeakMap(), p = !1;
	try {
		p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
	} catch {}
	function m(e, t) {
		return p ? new OffscreenCanvas(e, t) : tt("canvas");
	}
	function h(e, t, n, r) {
		let i = 1;
		if ((e.width > r || e.height > r) && (i = r / Math.max(e.width, e.height)), i < 1 || t === !0) {
			if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
				let r = t ? Je : Math.floor, a = r(i * e.width), o = r(i * e.height);
				d === void 0 && (d = m(a, o));
				let s = n ? m(a, o) : d;
				return s.width = a, s.height = o, s.getContext("2d").drawImage(e, 0, 0, a, o), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + e.width + "x" + e.height + ") to (" + a + "x" + o + ")."), s;
			}
			return "data" in e && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + e.width + "x" + e.height + ")."), e;
		}
		return e;
	}
	function g(e) {
		return Ke(e.width) && Ke(e.height);
	}
	function _(e) {
		return s ? !1 : e.wrapS !== 1001 || e.wrapT !== 1001 || e.minFilter !== 1003 && e.minFilter !== 1006;
	}
	function v(e, t) {
		return e.generateMipmaps && t && e.minFilter !== 1003 && e.minFilter !== 1006;
	}
	function y(t) {
		e.generateMipmap(t);
	}
	function b(n, r, i, a, o = !1) {
		if (s === !1) return r;
		if (n !== null) {
			if (e[n] !== void 0) return e[n];
			console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + n + "'");
		}
		let c = r;
		if (r === e.RED && (i === e.FLOAT && (c = e.R32F), i === e.HALF_FLOAT && (c = e.R16F), i === e.UNSIGNED_BYTE && (c = e.R8)), r === e.RED_INTEGER && (i === e.UNSIGNED_BYTE && (c = e.R8UI), i === e.UNSIGNED_SHORT && (c = e.R16UI), i === e.UNSIGNED_INT && (c = e.R32UI), i === e.BYTE && (c = e.R8I), i === e.SHORT && (c = e.R16I), i === e.INT && (c = e.R32I)), r === e.RG && (i === e.FLOAT && (c = e.RG32F), i === e.HALF_FLOAT && (c = e.RG16F), i === e.UNSIGNED_BYTE && (c = e.RG8)), r === e.RGBA) {
			let t = o ? ye : J.getTransfer(a);
			i === e.FLOAT && (c = e.RGBA32F), i === e.HALF_FLOAT && (c = e.RGBA16F), i === e.UNSIGNED_BYTE && (c = t === "srgb" ? e.SRGB8_ALPHA8 : e.RGBA8), i === e.UNSIGNED_SHORT_4_4_4_4 && (c = e.RGBA4), i === e.UNSIGNED_SHORT_5_5_5_1 && (c = e.RGB5_A1);
		}
		return (c === e.R16F || c === e.R32F || c === e.RG16F || c === e.RG32F || c === e.RGBA16F || c === e.RGBA32F) && t.get("EXT_color_buffer_float"), c;
	}
	function x(e, t, n) {
		return v(e, n) === !0 || e.isFramebufferTexture && e.minFilter !== 1003 && e.minFilter !== 1006 ? Math.log2(Math.max(t.width, t.height)) + 1 : e.mipmaps !== void 0 && e.mipmaps.length > 0 ? e.mipmaps.length : e.isCompressedTexture && Array.isArray(e.image) ? t.mipmaps.length : 1;
	}
	function S(t) {
		return t === 1003 || t === 1004 || t === 1005 ? e.NEAREST : e.LINEAR;
	}
	function C(e) {
		let t = e.target;
		t.removeEventListener("dispose", C), T(t), t.isVideoTexture && u.delete(t);
	}
	function w(e) {
		let t = e.target;
		t.removeEventListener("dispose", w), D(t);
	}
	function T(e) {
		let t = r.get(e);
		if (t.__webglInit === void 0) return;
		let n = e.source, i = f.get(n);
		if (i) {
			let r = i[t.__cacheKey];
			r.usedTimes--, r.usedTimes === 0 && E(e), Object.keys(i).length === 0 && f.delete(n);
		}
		r.remove(e);
	}
	function E(t) {
		let n = r.get(t);
		e.deleteTexture(n.__webglTexture);
		let i = t.source, a = f.get(i);
		delete a[n.__cacheKey], o.memory.textures--;
	}
	function D(t) {
		let n = t.texture, i = r.get(t), a = r.get(n);
		if (a.__webglTexture !== void 0 && (e.deleteTexture(a.__webglTexture), o.memory.textures--), t.depthTexture && t.depthTexture.dispose(), t.isWebGLCubeRenderTarget) for (let t = 0; t < 6; t++) {
			if (Array.isArray(i.__webglFramebuffer[t])) for (let n = 0; n < i.__webglFramebuffer[t].length; n++) e.deleteFramebuffer(i.__webglFramebuffer[t][n]);
			else e.deleteFramebuffer(i.__webglFramebuffer[t]);
			i.__webglDepthbuffer && e.deleteRenderbuffer(i.__webglDepthbuffer[t]);
		}
		else {
			if (Array.isArray(i.__webglFramebuffer)) for (let t = 0; t < i.__webglFramebuffer.length; t++) e.deleteFramebuffer(i.__webglFramebuffer[t]);
			else e.deleteFramebuffer(i.__webglFramebuffer);
			if (i.__webglDepthbuffer && e.deleteRenderbuffer(i.__webglDepthbuffer), i.__webglMultisampledFramebuffer && e.deleteFramebuffer(i.__webglMultisampledFramebuffer), i.__webglColorRenderbuffer) for (let t = 0; t < i.__webglColorRenderbuffer.length; t++) i.__webglColorRenderbuffer[t] && e.deleteRenderbuffer(i.__webglColorRenderbuffer[t]);
			i.__webglDepthRenderbuffer && e.deleteRenderbuffer(i.__webglDepthRenderbuffer);
		}
		if (t.isWebGLMultipleRenderTargets) for (let t = 0, i = n.length; t < i; t++) {
			let i = r.get(n[t]);
			i.__webglTexture && (e.deleteTexture(i.__webglTexture), o.memory.textures--), r.remove(n[t]);
		}
		r.remove(n), r.remove(t);
	}
	let O = 0;
	function k() {
		O = 0;
	}
	function A() {
		let e = O;
		return e >= i.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + e + " texture units while this GPU supports only " + i.maxTextures), O += 1, e;
	}
	function j(e) {
		let t = [];
		return t.push(e.wrapS), t.push(e.wrapT), t.push(e.wrapR || 0), t.push(e.magFilter), t.push(e.minFilter), t.push(e.anisotropy), t.push(e.internalFormat), t.push(e.format), t.push(e.type), t.push(e.generateMipmaps), t.push(e.premultiplyAlpha), t.push(e.flipY), t.push(e.unpackAlignment), t.push(e.colorSpace), t.join();
	}
	function M(t, i) {
		let a = r.get(t);
		if (t.isVideoTexture && be(t), t.isRenderTargetTexture === !1 && t.version > 0 && a.__version !== t.version) {
			let e = t.image;
			if (e === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
			else if (e.complete === !1) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
			else {
				R(a, t, i);
				return;
			}
		}
		n.bindTexture(e.TEXTURE_2D, a.__webglTexture, e.TEXTURE0 + i);
	}
	function se(t, i) {
		let a = r.get(t);
		t.version > 0 && a.__version !== t.version ? R(a, t, i) : n.bindTexture(e.TEXTURE_2D_ARRAY, a.__webglTexture, e.TEXTURE0 + i);
	}
	function ce(t, i) {
		let a = r.get(t);
		t.version > 0 && a.__version !== t.version ? R(a, t, i) : n.bindTexture(e.TEXTURE_3D, a.__webglTexture, e.TEXTURE0 + i);
	}
	function le(t, i) {
		let a = r.get(t);
		t.version > 0 && a.__version !== t.version ? z(a, t, i) : n.bindTexture(e.TEXTURE_CUBE_MAP, a.__webglTexture, e.TEXTURE0 + i);
	}
	let I = {
		[ee]: e.REPEAT,
		[te]: e.CLAMP_TO_EDGE,
		[N]: e.MIRRORED_REPEAT
	}, de = {
		[P]: e.NEAREST,
		[ne]: e.NEAREST_MIPMAP_NEAREST,
		[re]: e.NEAREST_MIPMAP_LINEAR,
		[ie]: e.LINEAR,
		[ae]: e.LINEAR_MIPMAP_NEAREST,
		[oe]: e.LINEAR_MIPMAP_LINEAR
	}, fe = {
		512: e.NEVER,
		519: e.ALWAYS,
		513: e.LESS,
		515: e.LEQUAL,
		514: e.EQUAL,
		518: e.GEQUAL,
		516: e.GREATER,
		517: e.NOTEQUAL
	};
	function L(n, a, o) {
		if (a.type === 1015 && t.has("OES_texture_float_linear") === !1 && (a.magFilter === 1006 || a.magFilter === 1007 || a.magFilter === 1005 || a.magFilter === 1008 || a.minFilter === 1006 || a.minFilter === 1007 || a.minFilter === 1005 || a.minFilter === 1008) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), o ? (e.texParameteri(n, e.TEXTURE_WRAP_S, I[a.wrapS]), e.texParameteri(n, e.TEXTURE_WRAP_T, I[a.wrapT]), (n === e.TEXTURE_3D || n === e.TEXTURE_2D_ARRAY) && e.texParameteri(n, e.TEXTURE_WRAP_R, I[a.wrapR]), e.texParameteri(n, e.TEXTURE_MAG_FILTER, de[a.magFilter]), e.texParameteri(n, e.TEXTURE_MIN_FILTER, de[a.minFilter])) : (e.texParameteri(n, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(n, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), (n === e.TEXTURE_3D || n === e.TEXTURE_2D_ARRAY) && e.texParameteri(n, e.TEXTURE_WRAP_R, e.CLAMP_TO_EDGE), (a.wrapS !== 1001 || a.wrapT !== 1001) && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."), e.texParameteri(n, e.TEXTURE_MAG_FILTER, S(a.magFilter)), e.texParameteri(n, e.TEXTURE_MIN_FILTER, S(a.minFilter)), a.minFilter !== 1003 && a.minFilter !== 1006 && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")), a.compareFunction && (e.texParameteri(n, e.TEXTURE_COMPARE_MODE, e.COMPARE_REF_TO_TEXTURE), e.texParameteri(n, e.TEXTURE_COMPARE_FUNC, fe[a.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
			let o = t.get("EXT_texture_filter_anisotropic");
			if (a.magFilter === 1003 || a.minFilter !== 1005 && a.minFilter !== 1008 || a.type === 1015 && t.has("OES_texture_float_linear") === !1 || s === !1 && a.type === 1016 && t.has("OES_texture_half_float_linear") === !1) return;
			(a.anisotropy > 1 || r.get(a).__currentAnisotropy) && (e.texParameterf(n, o.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(a.anisotropy, i.getMaxAnisotropy())), r.get(a).__currentAnisotropy = a.anisotropy);
		}
	}
	function pe(t, n) {
		let r = !1;
		t.__webglInit === void 0 && (t.__webglInit = !0, n.addEventListener("dispose", C));
		let i = n.source, a = f.get(i);
		a === void 0 && (a = {}, f.set(i, a));
		let s = j(n);
		if (s !== t.__cacheKey) {
			a[s] === void 0 && (a[s] = {
				texture: e.createTexture(),
				usedTimes: 0
			}, o.memory.textures++, r = !0), a[s].usedTimes++;
			let i = a[t.__cacheKey];
			i !== void 0 && (a[t.__cacheKey].usedTimes--, i.usedTimes === 0 && E(n)), t.__cacheKey = s, t.__webglTexture = a[s].texture;
		}
		return r;
	}
	function R(t, o, c) {
		let l = e.TEXTURE_2D;
		(o.isDataArrayTexture || o.isCompressedArrayTexture) && (l = e.TEXTURE_2D_ARRAY), o.isData3DTexture && (l = e.TEXTURE_3D);
		let u = pe(t, o), d = o.source;
		n.bindTexture(l, t.__webglTexture, e.TEXTURE0 + c);
		let f = r.get(d);
		if (d.version !== f.__version || u === !0) {
			n.activeTexture(e.TEXTURE0 + c);
			let t = J.getPrimaries(J.workingColorSpace), r = o.colorSpace === "" ? null : J.getPrimaries(o.colorSpace), p = o.colorSpace === "" || t === r ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
			e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, o.flipY), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, o.premultiplyAlpha), e.pixelStorei(e.UNPACK_ALIGNMENT, o.unpackAlignment), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, p);
			let m = _(o) && g(o.image) === !1, S = h(o.image, m, !1, i.maxTextureSize);
			S = xe(o, S);
			let C = g(S) || s, w = a.convert(o.format, o.colorSpace), T = a.convert(o.type), E = b(o.internalFormat, w, T, o.colorSpace, o.isVideoTexture);
			L(l, o, C);
			let D, O = o.mipmaps, k = s && o.isVideoTexture !== !0 && E !== 36196, A = f.__version === void 0 || u === !0, j = d.dataReady, M = x(o, S, C);
			if (o.isDepthTexture) E = e.DEPTH_COMPONENT, s ? E = o.type === 1015 ? e.DEPTH_COMPONENT32F : o.type === 1014 ? e.DEPTH_COMPONENT24 : o.type === 1020 ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT16 : o.type === 1015 && console.error("WebGLRenderer: Floating point depth texture requires WebGL2."), o.format === 1026 && E === e.DEPTH_COMPONENT && o.type !== 1012 && o.type !== 1014 && (console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."), o.type = F, T = a.convert(o.type)), o.format === 1027 && E === e.DEPTH_COMPONENT && (E = e.DEPTH_STENCIL, o.type !== 1020 && (console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."), o.type = ue, T = a.convert(o.type))), A && (k ? n.texStorage2D(e.TEXTURE_2D, 1, E, S.width, S.height) : n.texImage2D(e.TEXTURE_2D, 0, E, S.width, S.height, 0, w, T, null));
			else if (o.isDataTexture) {
				if (O.length > 0 && C) {
					k && A && n.texStorage2D(e.TEXTURE_2D, M, E, O[0].width, O[0].height);
					for (let t = 0, r = O.length; t < r; t++) D = O[t], k ? j && n.texSubImage2D(e.TEXTURE_2D, t, 0, 0, D.width, D.height, w, T, D.data) : n.texImage2D(e.TEXTURE_2D, t, E, D.width, D.height, 0, w, T, D.data);
					o.generateMipmaps = !1;
				} else k ? (A && n.texStorage2D(e.TEXTURE_2D, M, E, S.width, S.height), j && n.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, S.width, S.height, w, T, S.data)) : n.texImage2D(e.TEXTURE_2D, 0, E, S.width, S.height, 0, w, T, S.data);
			} else if (o.isCompressedTexture) {
				if (o.isCompressedArrayTexture) {
					k && A && n.texStorage3D(e.TEXTURE_2D_ARRAY, M, E, O[0].width, O[0].height, S.depth);
					for (let t = 0, r = O.length; t < r; t++) D = O[t], o.format === 1023 ? k ? j && n.texSubImage3D(e.TEXTURE_2D_ARRAY, t, 0, 0, 0, D.width, D.height, S.depth, w, T, D.data) : n.texImage3D(e.TEXTURE_2D_ARRAY, t, E, D.width, D.height, S.depth, 0, w, T, D.data) : w === null ? console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : k ? j && n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, t, 0, 0, 0, D.width, D.height, S.depth, w, D.data, 0, 0) : n.compressedTexImage3D(e.TEXTURE_2D_ARRAY, t, E, D.width, D.height, S.depth, 0, D.data, 0, 0);
				} else {
					k && A && n.texStorage2D(e.TEXTURE_2D, M, E, O[0].width, O[0].height);
					for (let t = 0, r = O.length; t < r; t++) D = O[t], o.format === 1023 ? k ? j && n.texSubImage2D(e.TEXTURE_2D, t, 0, 0, D.width, D.height, w, T, D.data) : n.texImage2D(e.TEXTURE_2D, t, E, D.width, D.height, 0, w, T, D.data) : w === null ? console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : k ? j && n.compressedTexSubImage2D(e.TEXTURE_2D, t, 0, 0, D.width, D.height, w, D.data) : n.compressedTexImage2D(e.TEXTURE_2D, t, E, D.width, D.height, 0, D.data);
				}
			} else if (o.isDataArrayTexture) k ? (A && n.texStorage3D(e.TEXTURE_2D_ARRAY, M, E, S.width, S.height, S.depth), j && n.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, 0, S.width, S.height, S.depth, w, T, S.data)) : n.texImage3D(e.TEXTURE_2D_ARRAY, 0, E, S.width, S.height, S.depth, 0, w, T, S.data);
			else if (o.isData3DTexture) k ? (A && n.texStorage3D(e.TEXTURE_3D, M, E, S.width, S.height, S.depth), j && n.texSubImage3D(e.TEXTURE_3D, 0, 0, 0, 0, S.width, S.height, S.depth, w, T, S.data)) : n.texImage3D(e.TEXTURE_3D, 0, E, S.width, S.height, S.depth, 0, w, T, S.data);
			else if (o.isFramebufferTexture) {
				if (A) {
					if (k) n.texStorage2D(e.TEXTURE_2D, M, E, S.width, S.height);
					else {
						let t = S.width, r = S.height;
						for (let i = 0; i < M; i++) n.texImage2D(e.TEXTURE_2D, i, E, t, r, 0, w, T, null), t >>= 1, r >>= 1;
					}
				}
			} else if (O.length > 0 && C) {
				k && A && n.texStorage2D(e.TEXTURE_2D, M, E, O[0].width, O[0].height);
				for (let t = 0, r = O.length; t < r; t++) D = O[t], k ? j && n.texSubImage2D(e.TEXTURE_2D, t, 0, 0, w, T, D) : n.texImage2D(e.TEXTURE_2D, t, E, w, T, D);
				o.generateMipmaps = !1;
			} else k ? (A && n.texStorage2D(e.TEXTURE_2D, M, E, S.width, S.height), j && n.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, w, T, S)) : n.texImage2D(e.TEXTURE_2D, 0, E, w, T, S);
			v(o, C) && y(l), f.__version = d.version, o.onUpdate && o.onUpdate(o);
		}
		t.__version = o.version;
	}
	function z(t, o, c) {
		if (o.image.length !== 6) return;
		let l = pe(t, o), u = o.source;
		n.bindTexture(e.TEXTURE_CUBE_MAP, t.__webglTexture, e.TEXTURE0 + c);
		let d = r.get(u);
		if (u.version !== d.__version || l === !0) {
			n.activeTexture(e.TEXTURE0 + c);
			let t = J.getPrimaries(J.workingColorSpace), r = o.colorSpace === "" ? null : J.getPrimaries(o.colorSpace), f = o.colorSpace === "" || t === r ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
			e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, o.flipY), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, o.premultiplyAlpha), e.pixelStorei(e.UNPACK_ALIGNMENT, o.unpackAlignment), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, f);
			let p = o.isCompressedTexture || o.image[0].isCompressedTexture, m = o.image[0] && o.image[0].isDataTexture, _ = [];
			for (let e = 0; e < 6; e++) !p && !m ? _[e] = h(o.image[e], !1, !0, i.maxCubemapSize) : _[e] = m ? o.image[e].image : o.image[e], _[e] = xe(o, _[e]);
			let S = _[0], C = g(S) || s, w = a.convert(o.format, o.colorSpace), T = a.convert(o.type), E = b(o.internalFormat, w, T, o.colorSpace), D = s && o.isVideoTexture !== !0, O = d.__version === void 0 || l === !0, k = u.dataReady, A = x(o, S, C);
			L(e.TEXTURE_CUBE_MAP, o, C);
			let j;
			if (p) {
				D && O && n.texStorage2D(e.TEXTURE_CUBE_MAP, A, E, S.width, S.height);
				for (let t = 0; t < 6; t++) {
					j = _[t].mipmaps;
					for (let r = 0; r < j.length; r++) {
						let i = j[r];
						o.format === 1023 ? D ? k && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r, 0, 0, i.width, i.height, w, T, i.data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r, E, i.width, i.height, 0, w, T, i.data) : w === null ? console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : D ? k && n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r, 0, 0, i.width, i.height, w, i.data) : n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r, E, i.width, i.height, 0, i.data);
					}
				}
			} else {
				j = o.mipmaps, D && O && (j.length > 0 && A++, n.texStorage2D(e.TEXTURE_CUBE_MAP, A, E, _[0].width, _[0].height));
				for (let t = 0; t < 6; t++) if (m) {
					D ? k && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, 0, 0, _[t].width, _[t].height, w, T, _[t].data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, E, _[t].width, _[t].height, 0, w, T, _[t].data);
					for (let r = 0; r < j.length; r++) {
						let i = j[r].image[t].image;
						D ? k && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r + 1, 0, 0, i.width, i.height, w, T, i.data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r + 1, E, i.width, i.height, 0, w, T, i.data);
					}
				} else {
					D ? k && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, 0, 0, w, T, _[t]) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, E, w, T, _[t]);
					for (let r = 0; r < j.length; r++) {
						let i = j[r];
						D ? k && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r + 1, 0, 0, w, T, i.image[t]) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, r + 1, E, w, T, i.image[t]);
					}
				}
			}
			v(o, C) && y(e.TEXTURE_CUBE_MAP), d.__version = u.version, o.onUpdate && o.onUpdate(o);
		}
		t.__version = o.version;
	}
	function B(t, i, o, s, l, u) {
		let d = a.convert(o.format, o.colorSpace), f = a.convert(o.type), p = b(o.internalFormat, d, f, o.colorSpace);
		if (!r.get(i).__hasExternalTextures) {
			let t = Math.max(1, i.width >> u), r = Math.max(1, i.height >> u);
			l === e.TEXTURE_3D || l === e.TEXTURE_2D_ARRAY ? n.texImage3D(l, u, p, t, r, i.depth, 0, d, f, null) : n.texImage2D(l, u, p, t, r, 0, d, f, null);
		}
		n.bindFramebuffer(e.FRAMEBUFFER, t), W(i) ? c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, s, l, r.get(o).__webglTexture, 0, ve(i)) : (l === e.TEXTURE_2D || l >= e.TEXTURE_CUBE_MAP_POSITIVE_X && l <= e.TEXTURE_CUBE_MAP_NEGATIVE_Z) && e.framebufferTexture2D(e.FRAMEBUFFER, s, l, r.get(o).__webglTexture, u), n.bindFramebuffer(e.FRAMEBUFFER, null);
	}
	function V(t, n, r) {
		if (e.bindRenderbuffer(e.RENDERBUFFER, t), n.depthBuffer && !n.stencilBuffer) {
			let i = s === !0 ? e.DEPTH_COMPONENT24 : e.DEPTH_COMPONENT16;
			if (r || W(n)) {
				let t = n.depthTexture;
				t && t.isDepthTexture && (t.type === 1015 ? i = e.DEPTH_COMPONENT32F : t.type === 1014 && (i = e.DEPTH_COMPONENT24));
				let r = ve(n);
				W(n) ? c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, r, i, n.width, n.height) : e.renderbufferStorageMultisample(e.RENDERBUFFER, r, i, n.width, n.height);
			} else e.renderbufferStorage(e.RENDERBUFFER, i, n.width, n.height);
			e.framebufferRenderbuffer(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.RENDERBUFFER, t);
		} else if (n.depthBuffer && n.stencilBuffer) {
			let i = ve(n);
			r && W(n) === !1 ? e.renderbufferStorageMultisample(e.RENDERBUFFER, i, e.DEPTH24_STENCIL8, n.width, n.height) : W(n) ? c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, i, e.DEPTH24_STENCIL8, n.width, n.height) : e.renderbufferStorage(e.RENDERBUFFER, e.DEPTH_STENCIL, n.width, n.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.DEPTH_STENCIL_ATTACHMENT, e.RENDERBUFFER, t);
		} else {
			let t = n.isWebGLMultipleRenderTargets === !0 ? n.texture : [n.texture];
			for (let i = 0; i < t.length; i++) {
				let o = t[i], s = a.convert(o.format, o.colorSpace), l = a.convert(o.type), u = b(o.internalFormat, s, l, o.colorSpace), d = ve(n);
				r && W(n) === !1 ? e.renderbufferStorageMultisample(e.RENDERBUFFER, d, u, n.width, n.height) : W(n) ? c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, d, u, n.width, n.height) : e.renderbufferStorage(e.RENDERBUFFER, u, n.width, n.height);
			}
		}
		e.bindRenderbuffer(e.RENDERBUFFER, null);
	}
	function H(t, i) {
		if (i && i.isWebGLCubeRenderTarget) throw Error("Depth Texture with cube render targets is not supported");
		if (n.bindFramebuffer(e.FRAMEBUFFER, t), !(i.depthTexture && i.depthTexture.isDepthTexture)) throw Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
		r.get(i.depthTexture).__webglTexture && i.depthTexture.image.width === i.width && i.depthTexture.image.height === i.height || (i.depthTexture.image.width = i.width, i.depthTexture.image.height = i.height, i.depthTexture.needsUpdate = !0), M(i.depthTexture, 0);
		let a = r.get(i.depthTexture).__webglTexture, o = ve(i);
		if (i.depthTexture.format === 1026) W(i) ? c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.TEXTURE_2D, a, 0, o) : e.framebufferTexture2D(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.TEXTURE_2D, a, 0);
		else if (i.depthTexture.format === 1027) W(i) ? c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, e.DEPTH_STENCIL_ATTACHMENT, e.TEXTURE_2D, a, 0, o) : e.framebufferTexture2D(e.FRAMEBUFFER, e.DEPTH_STENCIL_ATTACHMENT, e.TEXTURE_2D, a, 0);
		else throw Error("Unknown depthTexture format");
	}
	function U(t) {
		let i = r.get(t), a = t.isWebGLCubeRenderTarget === !0;
		if (t.depthTexture && !i.__autoAllocateDepthBuffer) {
			if (a) throw Error("target.depthTexture not supported in Cube render targets");
			H(i.__webglFramebuffer, t);
		} else if (a) {
			i.__webglDepthbuffer = [];
			for (let r = 0; r < 6; r++) n.bindFramebuffer(e.FRAMEBUFFER, i.__webglFramebuffer[r]), i.__webglDepthbuffer[r] = e.createRenderbuffer(), V(i.__webglDepthbuffer[r], t, !1);
		} else n.bindFramebuffer(e.FRAMEBUFFER, i.__webglFramebuffer), i.__webglDepthbuffer = e.createRenderbuffer(), V(i.__webglDepthbuffer, t, !1);
		n.bindFramebuffer(e.FRAMEBUFFER, null);
	}
	function me(t, n, i) {
		let a = r.get(t);
		n !== void 0 && B(a.__webglFramebuffer, t, t.texture, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, 0), i !== void 0 && U(t);
	}
	function he(t) {
		let c = t.texture, l = r.get(t), u = r.get(c);
		t.addEventListener("dispose", w), t.isWebGLMultipleRenderTargets !== !0 && (u.__webglTexture === void 0 && (u.__webglTexture = e.createTexture()), u.__version = c.version, o.memory.textures++);
		let d = t.isWebGLCubeRenderTarget === !0, f = t.isWebGLMultipleRenderTargets === !0, p = g(t) || s;
		if (d) {
			l.__webglFramebuffer = [];
			for (let t = 0; t < 6; t++) if (s && c.mipmaps && c.mipmaps.length > 0) {
				l.__webglFramebuffer[t] = [];
				for (let n = 0; n < c.mipmaps.length; n++) l.__webglFramebuffer[t][n] = e.createFramebuffer();
			} else l.__webglFramebuffer[t] = e.createFramebuffer();
		} else {
			if (s && c.mipmaps && c.mipmaps.length > 0) {
				l.__webglFramebuffer = [];
				for (let t = 0; t < c.mipmaps.length; t++) l.__webglFramebuffer[t] = e.createFramebuffer();
			} else l.__webglFramebuffer = e.createFramebuffer();
			if (f) {
				if (i.drawBuffers) {
					let n = t.texture;
					for (let t = 0, i = n.length; t < i; t++) {
						let i = r.get(n[t]);
						i.__webglTexture === void 0 && (i.__webglTexture = e.createTexture(), o.memory.textures++);
					}
				} else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");
			}
			if (s && t.samples > 0 && W(t) === !1) {
				let r = f ? c : [c];
				l.__webglMultisampledFramebuffer = e.createFramebuffer(), l.__webglColorRenderbuffer = [], n.bindFramebuffer(e.FRAMEBUFFER, l.__webglMultisampledFramebuffer);
				for (let n = 0; n < r.length; n++) {
					let i = r[n];
					l.__webglColorRenderbuffer[n] = e.createRenderbuffer(), e.bindRenderbuffer(e.RENDERBUFFER, l.__webglColorRenderbuffer[n]);
					let o = a.convert(i.format, i.colorSpace), s = a.convert(i.type), c = b(i.internalFormat, o, s, i.colorSpace, t.isXRRenderTarget === !0), u = ve(t);
					e.renderbufferStorageMultisample(e.RENDERBUFFER, u, c, t.width, t.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + n, e.RENDERBUFFER, l.__webglColorRenderbuffer[n]);
				}
				e.bindRenderbuffer(e.RENDERBUFFER, null), t.depthBuffer && (l.__webglDepthRenderbuffer = e.createRenderbuffer(), V(l.__webglDepthRenderbuffer, t, !0)), n.bindFramebuffer(e.FRAMEBUFFER, null);
			}
		}
		if (d) {
			n.bindTexture(e.TEXTURE_CUBE_MAP, u.__webglTexture), L(e.TEXTURE_CUBE_MAP, c, p);
			for (let n = 0; n < 6; n++) if (s && c.mipmaps && c.mipmaps.length > 0) for (let r = 0; r < c.mipmaps.length; r++) B(l.__webglFramebuffer[n][r], t, c, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + n, r);
			else B(l.__webglFramebuffer[n], t, c, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + n, 0);
			v(c, p) && y(e.TEXTURE_CUBE_MAP), n.unbindTexture();
		} else if (f) {
			let i = t.texture;
			for (let a = 0, o = i.length; a < o; a++) {
				let o = i[a], s = r.get(o);
				n.bindTexture(e.TEXTURE_2D, s.__webglTexture), L(e.TEXTURE_2D, o, p), B(l.__webglFramebuffer, t, o, e.COLOR_ATTACHMENT0 + a, e.TEXTURE_2D, 0), v(o, p) && y(e.TEXTURE_2D);
			}
			n.unbindTexture();
		} else {
			let r = e.TEXTURE_2D;
			if ((t.isWebGL3DRenderTarget || t.isWebGLArrayRenderTarget) && (s ? r = t.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY : console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")), n.bindTexture(r, u.__webglTexture), L(r, c, p), s && c.mipmaps && c.mipmaps.length > 0) for (let n = 0; n < c.mipmaps.length; n++) B(l.__webglFramebuffer[n], t, c, e.COLOR_ATTACHMENT0, r, n);
			else B(l.__webglFramebuffer, t, c, e.COLOR_ATTACHMENT0, r, 0);
			v(c, p) && y(r), n.unbindTexture();
		}
		t.depthBuffer && U(t);
	}
	function ge(t) {
		let i = g(t) || s, a = t.isWebGLMultipleRenderTargets === !0 ? t.texture : [t.texture];
		for (let o = 0, s = a.length; o < s; o++) {
			let s = a[o];
			if (v(s, i)) {
				let i = t.isWebGLCubeRenderTarget ? e.TEXTURE_CUBE_MAP : e.TEXTURE_2D, a = r.get(s).__webglTexture;
				n.bindTexture(i, a), y(i), n.unbindTexture();
			}
		}
	}
	function _e(t) {
		if (s && t.samples > 0 && W(t) === !1) {
			let i = t.isWebGLMultipleRenderTargets ? t.texture : [t.texture], a = t.width, o = t.height, s = e.COLOR_BUFFER_BIT, c = [], u = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, d = r.get(t), f = t.isWebGLMultipleRenderTargets === !0;
			if (f) for (let t = 0; t < i.length; t++) n.bindFramebuffer(e.FRAMEBUFFER, d.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + t, e.RENDERBUFFER, null), n.bindFramebuffer(e.FRAMEBUFFER, d.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + t, e.TEXTURE_2D, null, 0);
			n.bindFramebuffer(e.READ_FRAMEBUFFER, d.__webglMultisampledFramebuffer), n.bindFramebuffer(e.DRAW_FRAMEBUFFER, d.__webglFramebuffer);
			for (let n = 0; n < i.length; n++) {
				c.push(e.COLOR_ATTACHMENT0 + n), t.depthBuffer && c.push(u);
				let p = d.__ignoreDepthValues !== void 0 && d.__ignoreDepthValues;
				if (p === !1 && (t.depthBuffer && (s |= e.DEPTH_BUFFER_BIT), t.stencilBuffer && (s |= e.STENCIL_BUFFER_BIT)), f && e.framebufferRenderbuffer(e.READ_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, d.__webglColorRenderbuffer[n]), p === !0 && (e.invalidateFramebuffer(e.READ_FRAMEBUFFER, [u]), e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, [u])), f) {
					let t = r.get(i[n]).__webglTexture;
					e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, t, 0);
				}
				e.blitFramebuffer(0, 0, a, o, 0, 0, a, o, s, e.NEAREST), l && e.invalidateFramebuffer(e.READ_FRAMEBUFFER, c);
			}
			if (n.bindFramebuffer(e.READ_FRAMEBUFFER, null), n.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), f) for (let t = 0; t < i.length; t++) {
				n.bindFramebuffer(e.FRAMEBUFFER, d.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + t, e.RENDERBUFFER, d.__webglColorRenderbuffer[t]);
				let a = r.get(i[t]).__webglTexture;
				n.bindFramebuffer(e.FRAMEBUFFER, d.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + t, e.TEXTURE_2D, a, 0);
			}
			n.bindFramebuffer(e.DRAW_FRAMEBUFFER, d.__webglMultisampledFramebuffer);
		}
	}
	function ve(e) {
		return Math.min(i.maxSamples, e.samples);
	}
	function W(e) {
		let n = r.get(e);
		return s && e.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && n.__useRenderToTexture !== !1;
	}
	function be(e) {
		let t = o.render.frame;
		u.get(e) !== t && (u.set(e, t), e.update());
	}
	function xe(e, n) {
		let r = e.colorSpace, i = e.format, a = e.type;
		return e.isCompressedTexture === !0 || e.isVideoTexture === !0 || e.format === 1035 || r !== "srgb-linear" && r !== "" && (J.getTransfer(r) === "srgb" ? s === !1 ? t.has("EXT_sRGB") === !0 && i === 1023 ? (e.format = we, e.minFilter = ie, e.generateMipmaps = !1) : n = ft.sRGBToLinear(n) : (i !== 1023 || a !== 1009) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", r)), n;
	}
	this.allocateTextureUnit = A, this.resetTextureUnits = k, this.setTexture2D = M, this.setTexture2DArray = se, this.setTexture3D = ce, this.setTextureCube = le, this.rebindTextures = me, this.setupRenderTarget = he, this.updateRenderTargetMipmap = ge, this.updateMultisampleRenderTarget = _e, this.setupDepthRenderbuffer = U, this.setupFrameBufferTexture = B, this.useMultisampledRTT = W;
}
function Wo(e, t, n) {
	let r = n.isWebGL2;
	function i(n, i = "") {
		let a, o = J.getTransfer(i);
		if (n === 1009) return e.UNSIGNED_BYTE;
		if (n === 1017) return e.UNSIGNED_SHORT_4_4_4_4;
		if (n === 1018) return e.UNSIGNED_SHORT_5_5_5_1;
		if (n === 1010) return e.BYTE;
		if (n === 1011) return e.SHORT;
		if (n === 1012) return e.UNSIGNED_SHORT;
		if (n === 1013) return e.INT;
		if (n === 1014) return e.UNSIGNED_INT;
		if (n === 1015) return e.FLOAT;
		if (n === 1016) return r ? e.HALF_FLOAT : (a = t.get("OES_texture_half_float"), a === null ? null : a.HALF_FLOAT_OES);
		if (n === 1021) return e.ALPHA;
		if (n === 1023) return e.RGBA;
		if (n === 1024) return e.LUMINANCE;
		if (n === 1025) return e.LUMINANCE_ALPHA;
		if (n === 1026) return e.DEPTH_COMPONENT;
		if (n === 1027) return e.DEPTH_STENCIL;
		if (n === 1035) return a = t.get("EXT_sRGB"), a === null ? null : a.SRGB_ALPHA_EXT;
		if (n === 1028) return e.RED;
		if (n === 1029) return e.RED_INTEGER;
		if (n === 1030) return e.RG;
		if (n === 1031) return e.RG_INTEGER;
		if (n === 1033) return e.RGBA_INTEGER;
		if (n === 33776 || n === 33777 || n === 33778 || n === 33779) {
			if (o === "srgb") {
				if (a = t.get("WEBGL_compressed_texture_s3tc_srgb"), a !== null) {
					if (n === 33776) return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;
					if (n === 33777) return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
					if (n === 33778) return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
					if (n === 33779) return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
				} else return null;
			} else if (a = t.get("WEBGL_compressed_texture_s3tc"), a !== null) {
				if (n === 33776) return a.COMPRESSED_RGB_S3TC_DXT1_EXT;
				if (n === 33777) return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;
				if (n === 33778) return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;
				if (n === 33779) return a.COMPRESSED_RGBA_S3TC_DXT5_EXT;
			} else return null;
		}
		if (n === 35840 || n === 35841 || n === 35842 || n === 35843) {
			if (a = t.get("WEBGL_compressed_texture_pvrtc"), a !== null) {
				if (n === 35840) return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				if (n === 35841) return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
				if (n === 35842) return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
				if (n === 35843) return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
			} else return null;
		}
		if (n === 36196) return a = t.get("WEBGL_compressed_texture_etc1"), a === null ? null : a.COMPRESSED_RGB_ETC1_WEBGL;
		if (n === 37492 || n === 37496) {
			if (a = t.get("WEBGL_compressed_texture_etc"), a !== null) {
				if (n === 37492) return o === "srgb" ? a.COMPRESSED_SRGB8_ETC2 : a.COMPRESSED_RGB8_ETC2;
				if (n === 37496) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : a.COMPRESSED_RGBA8_ETC2_EAC;
			} else return null;
		}
		if (n === 37808 || n === 37809 || n === 37810 || n === 37811 || n === 37812 || n === 37813 || n === 37814 || n === 37815 || n === 37816 || n === 37817 || n === 37818 || n === 37819 || n === 37820 || n === 37821) {
			if (a = t.get("WEBGL_compressed_texture_astc"), a !== null) {
				if (n === 37808) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : a.COMPRESSED_RGBA_ASTC_4x4_KHR;
				if (n === 37809) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : a.COMPRESSED_RGBA_ASTC_5x4_KHR;
				if (n === 37810) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : a.COMPRESSED_RGBA_ASTC_5x5_KHR;
				if (n === 37811) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : a.COMPRESSED_RGBA_ASTC_6x5_KHR;
				if (n === 37812) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : a.COMPRESSED_RGBA_ASTC_6x6_KHR;
				if (n === 37813) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : a.COMPRESSED_RGBA_ASTC_8x5_KHR;
				if (n === 37814) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : a.COMPRESSED_RGBA_ASTC_8x6_KHR;
				if (n === 37815) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : a.COMPRESSED_RGBA_ASTC_8x8_KHR;
				if (n === 37816) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : a.COMPRESSED_RGBA_ASTC_10x5_KHR;
				if (n === 37817) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : a.COMPRESSED_RGBA_ASTC_10x6_KHR;
				if (n === 37818) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : a.COMPRESSED_RGBA_ASTC_10x8_KHR;
				if (n === 37819) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : a.COMPRESSED_RGBA_ASTC_10x10_KHR;
				if (n === 37820) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : a.COMPRESSED_RGBA_ASTC_12x10_KHR;
				if (n === 37821) return o === "srgb" ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : a.COMPRESSED_RGBA_ASTC_12x12_KHR;
			} else return null;
		}
		if (n === 36492 || n === 36494 || n === 36495) {
			if (a = t.get("EXT_texture_compression_bptc"), a !== null) {
				if (n === 36492) return o === "srgb" ? a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : a.COMPRESSED_RGBA_BPTC_UNORM_EXT;
				if (n === 36494) return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
				if (n === 36495) return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
			} else return null;
		}
		if (n === 36283 || n === 36284 || n === 36285 || n === 36286) {
			if (a = t.get("EXT_texture_compression_rgtc"), a !== null) {
				if (n === 36492) return a.COMPRESSED_RED_RGTC1_EXT;
				if (n === 36284) return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;
				if (n === 36285) return a.COMPRESSED_RED_GREEN_RGTC2_EXT;
				if (n === 36286) return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
			} else return null;
		}
		return n === 1020 ? r ? e.UNSIGNED_INT_24_8 : (a = t.get("WEBGL_depth_texture"), a === null ? null : a.UNSIGNED_INT_24_8_WEBGL) : e[n] === void 0 ? null : e[n];
	}
	return { convert: i };
}
var Go = class extends Rr {
	constructor(e = []) {
		super(), this.isArrayCamera = !0, this.cameras = e;
	}
}, Ko = class extends Tn {
	constructor() {
		super(), this.isGroup = !0, this.type = "Group";
	}
}, qo = { type: "move" }, Jo = class {
	constructor() {
		this._targetRay = null, this._grip = null, this._hand = null;
	}
	getHandSpace() {
		return this._hand === null && (this._hand = new Ko(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
	}
	getTargetRaySpace() {
		return this._targetRay === null && (this._targetRay = new Ko(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new Y(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new Y()), this._targetRay;
	}
	getGripSpace() {
		return this._grip === null && (this._grip = new Ko(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new Y(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new Y()), this._grip;
	}
	dispatchEvent(e) {
		return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
	}
	connect(e) {
		if (e && e.hand) {
			let t = this._hand;
			if (t) for (let n of e.hand.values()) this._getHandJoint(t, n);
		}
		return this.dispatchEvent({
			type: "connected",
			data: e
		}), this;
	}
	disconnect(e) {
		return this.dispatchEvent({
			type: "disconnected",
			data: e
		}), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
	}
	update(e, t, n) {
		let r = null, i = null, a = null, o = this._targetRay, s = this._grip, c = this._hand;
		if (e && t.session.visibilityState !== "visible-blurred") {
			if (c && e.hand) {
				a = !0;
				for (let r of e.hand.values()) {
					let e = t.getJointPose(r, n), i = this._getHandJoint(c, r);
					e !== null && (i.matrix.fromArray(e.transform.matrix), i.matrix.decompose(i.position, i.rotation, i.scale), i.matrixWorldNeedsUpdate = !0, i.jointRadius = e.radius), i.visible = e !== null;
				}
				let r = c.joints["index-finger-tip"], i = c.joints["thumb-tip"], o = r.position.distanceTo(i.position);
				c.inputState.pinching && o > .025 ? (c.inputState.pinching = !1, this.dispatchEvent({
					type: "pinchend",
					handedness: e.handedness,
					target: this
				})) : !c.inputState.pinching && o <= .015 && (c.inputState.pinching = !0, this.dispatchEvent({
					type: "pinchstart",
					handedness: e.handedness,
					target: this
				}));
			} else s !== null && e.gripSpace && (i = t.getPose(e.gripSpace, n), i !== null && (s.matrix.fromArray(i.transform.matrix), s.matrix.decompose(s.position, s.rotation, s.scale), s.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (s.hasLinearVelocity = !0, s.linearVelocity.copy(i.linearVelocity)) : s.hasLinearVelocity = !1, i.angularVelocity ? (s.hasAngularVelocity = !0, s.angularVelocity.copy(i.angularVelocity)) : s.hasAngularVelocity = !1));
			o !== null && (r = t.getPose(e.targetRaySpace, n), r === null && i !== null && (r = i), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(qo)));
		}
		return o !== null && (o.visible = r !== null), s !== null && (s.visible = i !== null), c !== null && (c.visible = a !== null), this;
	}
	_getHandJoint(e, t) {
		if (e.joints[t.jointName] === void 0) {
			let n = new Ko();
			n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
		}
		return e.joints[t.jointName];
	}
}, Yo = "\nvoid main() {\n\n	gl_Position = vec4( position, 1.0 );\n\n}", Xo = "\nuniform sampler2DArray depthColor;\nuniform float depthWidth;\nuniform float depthHeight;\n\nvoid main() {\n\n	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );\n\n	if ( coord.x >= 1.0 ) {\n\n		gl_FragDepthEXT = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;\n\n	} else {\n\n		gl_FragDepthEXT = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;\n\n	}\n\n}", Zo = class {
	constructor() {
		this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
	}
	init(e, t, n) {
		if (this.texture === null) {
			let r = new _t(), i = e.properties.get(r);
			i.__webglTexture = t.texture, (t.depthNear != n.depthNear || t.depthFar != n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = r;
		}
	}
	render(e, t) {
		if (this.texture !== null) {
			if (this.mesh === null) {
				let e = t.cameras[0].viewport, n = new Nr({
					extensions: { fragDepth: !0 },
					vertexShader: Yo,
					fragmentShader: Xo,
					uniforms: {
						depthColor: { value: this.texture },
						depthWidth: { value: e.z },
						depthHeight: { value: e.w }
					}
				});
				this.mesh = new Sr(new $r(20, 20), n);
			}
			e.render(this.mesh, t);
		}
	}
	reset() {
		this.texture = null, this.mesh = null;
	}
}, Qo = class extends G {
	constructor(e, t) {
		super();
		let n = this, r = null, i = 1, a = null, o = "local-floor", s = 1, c = null, l = null, u = null, d = null, f = null, p = null, m = new Zo(), h = t.getContextAttributes(), g = null, _ = null, v = [], y = [], b = new K(), x = null, S = new Rr();
		S.layers.enable(1), S.viewport = new vt();
		let C = new Rr();
		C.layers.enable(2), C.viewport = new vt();
		let w = [S, C], T = new Go();
		T.layers.enable(1), T.layers.enable(2);
		let E = null, D = null;
		this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(e) {
			let t = v[e];
			return t === void 0 && (t = new Jo(), v[e] = t), t.getTargetRaySpace();
		}, this.getControllerGrip = function(e) {
			let t = v[e];
			return t === void 0 && (t = new Jo(), v[e] = t), t.getGripSpace();
		}, this.getHand = function(e) {
			let t = v[e];
			return t === void 0 && (t = new Jo(), v[e] = t), t.getHandSpace();
		};
		function O(e) {
			let t = y.indexOf(e.inputSource);
			if (t === -1) return;
			let n = v[t];
			n !== void 0 && (n.update(e.inputSource, e.frame, c || a), n.dispatchEvent({
				type: e.type,
				data: e.inputSource
			}));
		}
		function k() {
			r.removeEventListener("select", O), r.removeEventListener("selectstart", O), r.removeEventListener("selectend", O), r.removeEventListener("squeeze", O), r.removeEventListener("squeezestart", O), r.removeEventListener("squeezeend", O), r.removeEventListener("end", k), r.removeEventListener("inputsourceschange", A);
			for (let e = 0; e < v.length; e++) {
				let t = y[e];
				t !== null && (y[e] = null, v[e].disconnect(t));
			}
			E = null, D = null, m.reset(), e.setRenderTarget(g), f = null, d = null, u = null, r = null, _ = null, re.stop(), n.isPresenting = !1, e.setPixelRatio(x), e.setSize(b.width, b.height, !1), n.dispatchEvent({ type: "sessionend" });
		}
		this.setFramebufferScaleFactor = function(e) {
			i = e, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
		}, this.setReferenceSpaceType = function(e) {
			o = e, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
		}, this.getReferenceSpace = function() {
			return c || a;
		}, this.setReferenceSpace = function(e) {
			c = e;
		}, this.getBaseLayer = function() {
			return d === null ? f : d;
		}, this.getBinding = function() {
			return u;
		}, this.getFrame = function() {
			return p;
		}, this.getSession = function() {
			return r;
		}, this.setSession = async function(l) {
			if (r = l, r !== null) {
				if (g = e.getRenderTarget(), r.addEventListener("select", O), r.addEventListener("selectstart", O), r.addEventListener("selectend", O), r.addEventListener("squeeze", O), r.addEventListener("squeezestart", O), r.addEventListener("squeezeend", O), r.addEventListener("end", k), r.addEventListener("inputsourceschange", A), h.xrCompatible !== !0 && await t.makeXRCompatible(), x = e.getPixelRatio(), e.getSize(b), r.renderState.layers === void 0 || e.capabilities.isWebGL2 === !1) {
					let n = {
						antialias: r.renderState.layers !== void 0 || h.antialias,
						alpha: !0,
						depth: h.depth,
						stencil: h.stencil,
						framebufferScaleFactor: i
					};
					f = new XRWebGLLayer(r, t, n), r.updateRenderState({ baseLayer: f }), e.setPixelRatio(1), e.setSize(f.framebufferWidth, f.framebufferHeight, !1), _ = new bt(f.framebufferWidth, f.framebufferHeight, {
						format: I,
						type: se,
						colorSpace: e.outputColorSpace,
						stencilBuffer: h.stencil
					});
				} else {
					let n = null, a = null, o = null;
					h.depth && (o = h.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, n = h.stencil ? fe : de, a = h.stencil ? ue : F);
					let s = {
						colorFormat: t.RGBA8,
						depthFormat: o,
						scaleFactor: i
					};
					u = new XRWebGLBinding(r, t), d = u.createProjectionLayer(s), r.updateRenderState({ layers: [d] }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), _ = new bt(d.textureWidth, d.textureHeight, {
						format: I,
						type: se,
						depthTexture: new Li(d.textureWidth, d.textureHeight, a, void 0, void 0, void 0, void 0, void 0, void 0, n),
						stencilBuffer: h.stencil,
						colorSpace: e.outputColorSpace,
						samples: h.antialias ? 4 : 0
					});
					let c = e.properties.get(_);
					c.__ignoreDepthValues = d.ignoreDepthValues;
				}
				_.isXRRenderTarget = !0, this.setFoveation(s), c = null, a = await r.requestReferenceSpace(o), re.setContext(r), re.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
			}
		}, this.getEnvironmentBlendMode = function() {
			if (r !== null) return r.environmentBlendMode;
		};
		function A(e) {
			for (let t = 0; t < e.removed.length; t++) {
				let n = e.removed[t], r = y.indexOf(n);
				r >= 0 && (y[r] = null, v[r].disconnect(n));
			}
			for (let t = 0; t < e.added.length; t++) {
				let n = e.added[t], r = y.indexOf(n);
				if (r === -1) {
					for (let e = 0; e < v.length; e++) if (e >= y.length) {
						y.push(n), r = e;
						break;
					} else if (y[e] === null) {
						y[e] = n, r = e;
						break;
					}
					if (r === -1) break;
				}
				let i = v[r];
				i && i.connect(n);
			}
		}
		let j = new Y(), M = new Y();
		function ee(e, t, n) {
			j.setFromMatrixPosition(t.matrixWorld), M.setFromMatrixPosition(n.matrixWorld);
			let r = j.distanceTo(M), i = t.projectionMatrix.elements, a = n.projectionMatrix.elements, o = i[14] / (i[10] - 1), s = i[14] / (i[10] + 1), c = (i[9] + 1) / i[5], l = (i[9] - 1) / i[5], u = (i[8] - 1) / i[0], d = (a[8] + 1) / a[0], f = o * u, p = o * d, m = r / (-u + d), h = m * -u;
			t.matrixWorld.decompose(e.position, e.quaternion, e.scale), e.translateX(h), e.translateZ(m), e.matrixWorld.compose(e.position, e.quaternion, e.scale), e.matrixWorldInverse.copy(e.matrixWorld).invert();
			let g = o + m, _ = s + m, v = f - h, y = p + (r - h), b = c * s / _ * g, x = l * s / _ * g;
			e.projectionMatrix.makePerspective(v, y, b, x, g, _), e.projectionMatrixInverse.copy(e.projectionMatrix).invert();
		}
		function te(e, t) {
			t === null ? e.matrixWorld.copy(e.matrix) : e.matrixWorld.multiplyMatrices(t.matrixWorld, e.matrix), e.matrixWorldInverse.copy(e.matrixWorld).invert();
		}
		this.updateCamera = function(e) {
			if (r === null) return;
			m.texture !== null && (e.near = m.depthNear, e.far = m.depthFar), T.near = C.near = S.near = e.near, T.far = C.far = S.far = e.far, (E !== T.near || D !== T.far) && (r.updateRenderState({
				depthNear: T.near,
				depthFar: T.far
			}), E = T.near, D = T.far, S.near = E, S.far = D, C.near = E, C.far = D, S.updateProjectionMatrix(), C.updateProjectionMatrix(), e.updateProjectionMatrix());
			let t = e.parent, n = T.cameras;
			te(T, t);
			for (let e = 0; e < n.length; e++) te(n[e], t);
			n.length === 2 ? ee(T, S, C) : T.projectionMatrix.copy(S.projectionMatrix), N(e, T, t);
		};
		function N(e, t, n) {
			n === null ? e.matrix.copy(t.matrixWorld) : (e.matrix.copy(n.matrixWorld), e.matrix.invert(), e.matrix.multiply(t.matrixWorld)), e.matrix.decompose(e.position, e.quaternion, e.scale), e.updateMatrixWorld(!0), e.projectionMatrix.copy(t.projectionMatrix), e.projectionMatrixInverse.copy(t.projectionMatrixInverse), e.isPerspectiveCamera && (e.fov = ke * 2 * Math.atan(1 / e.projectionMatrix.elements[5]), e.zoom = 1);
		}
		this.getCamera = function() {
			return T;
		}, this.getFoveation = function() {
			if (d !== null || f !== null) return s;
		}, this.setFoveation = function(e) {
			s = e, d !== null && (d.fixedFoveation = e), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = e);
		}, this.hasDepthSensing = function() {
			return m.texture !== null;
		};
		let P = null;
		function ne(t, i) {
			if (l = i.getViewerPose(c || a), p = i, l !== null) {
				let t = l.views;
				f !== null && (e.setRenderTargetFramebuffer(_, f.framebuffer), e.setRenderTarget(_));
				let n = !1;
				t.length !== T.cameras.length && (T.cameras.length = 0, n = !0);
				for (let r = 0; r < t.length; r++) {
					let i = t[r], a = null;
					if (f !== null) a = f.getViewport(i);
					else {
						let t = u.getViewSubImage(d, i);
						a = t.viewport, r === 0 && (e.setRenderTargetTextures(_, t.colorTexture, d.ignoreDepthValues ? void 0 : t.depthStencilTexture), e.setRenderTarget(_));
					}
					let o = w[r];
					o === void 0 && (o = new Rr(), o.layers.enable(r), o.viewport = new vt(), w[r] = o), o.matrix.fromArray(i.transform.matrix), o.matrix.decompose(o.position, o.quaternion, o.scale), o.projectionMatrix.fromArray(i.projectionMatrix), o.projectionMatrixInverse.copy(o.projectionMatrix).invert(), o.viewport.set(a.x, a.y, a.width, a.height), r === 0 && (T.matrix.copy(o.matrix), T.matrix.decompose(T.position, T.quaternion, T.scale)), n === !0 && T.cameras.push(o);
				}
				let i = r.enabledFeatures;
				if (i && i.includes("depth-sensing")) {
					let n = u.getDepthInformation(t[0]);
					n && n.isValid && n.texture && m.init(e, n, r.renderState);
				}
			}
			for (let e = 0; e < v.length; e++) {
				let t = y[e], n = v[e];
				t !== null && n !== void 0 && n.update(t, i, c || a);
			}
			m.render(e, T), P && P(t, i), i.detectedPlanes && n.dispatchEvent({
				type: "planesdetected",
				data: i
			}), p = null;
		}
		let re = new Zr();
		re.setAnimationLoop(ne), this.setAnimationLoop = function(e) {
			P = e;
		}, this.dispose = function() {};
	}
};
function $o(e, t) {
	function n(e, t) {
		e.matrixAutoUpdate === !0 && e.updateMatrix(), t.value.copy(e.matrix);
	}
	function r(t, n) {
		n.color.getRGB(t.fogColor.value, kr(e)), n.isFog ? (t.fogNear.value = n.near, t.fogFar.value = n.far) : n.isFogExp2 && (t.fogDensity.value = n.density);
	}
	function i(e, t, n, r, i) {
		t.isMeshBasicMaterial || t.isMeshLambertMaterial ? a(e, t) : t.isMeshToonMaterial ? (a(e, t), d(e, t)) : t.isMeshPhongMaterial ? (a(e, t), u(e, t)) : t.isMeshStandardMaterial ? (a(e, t), f(e, t), t.isMeshPhysicalMaterial && p(e, t, i)) : t.isMeshMatcapMaterial ? (a(e, t), m(e, t)) : t.isMeshDepthMaterial ? a(e, t) : t.isMeshDistanceMaterial ? (a(e, t), h(e, t)) : t.isMeshNormalMaterial ? a(e, t) : t.isLineBasicMaterial ? (o(e, t), t.isLineDashedMaterial && s(e, t)) : t.isPointsMaterial ? c(e, t, n, r) : t.isSpriteMaterial ? l(e, t) : t.isShadowMaterial ? (e.color.value.copy(t.color), e.opacity.value = t.opacity) : t.isShaderMaterial && (t.uniformsNeedUpdate = !1);
	}
	function a(r, i) {
		r.opacity.value = i.opacity, i.color && r.diffuse.value.copy(i.color), i.emissive && r.emissive.value.copy(i.emissive).multiplyScalar(i.emissiveIntensity), i.map && (r.map.value = i.map, n(i.map, r.mapTransform)), i.alphaMap && (r.alphaMap.value = i.alphaMap, n(i.alphaMap, r.alphaMapTransform)), i.bumpMap && (r.bumpMap.value = i.bumpMap, n(i.bumpMap, r.bumpMapTransform), r.bumpScale.value = i.bumpScale, i.side === 1 && (r.bumpScale.value *= -1)), i.normalMap && (r.normalMap.value = i.normalMap, n(i.normalMap, r.normalMapTransform), r.normalScale.value.copy(i.normalScale), i.side === 1 && r.normalScale.value.negate()), i.displacementMap && (r.displacementMap.value = i.displacementMap, n(i.displacementMap, r.displacementMapTransform), r.displacementScale.value = i.displacementScale, r.displacementBias.value = i.displacementBias), i.emissiveMap && (r.emissiveMap.value = i.emissiveMap, n(i.emissiveMap, r.emissiveMapTransform)), i.specularMap && (r.specularMap.value = i.specularMap, n(i.specularMap, r.specularMapTransform)), i.alphaTest > 0 && (r.alphaTest.value = i.alphaTest);
		let a = t.get(i).envMap;
		if (a && (r.envMap.value = a, r.flipEnvMap.value = a.isCubeTexture && a.isRenderTargetTexture === !1 ? -1 : 1, r.reflectivity.value = i.reflectivity, r.ior.value = i.ior, r.refractionRatio.value = i.refractionRatio), i.lightMap) {
			r.lightMap.value = i.lightMap;
			let t = e._useLegacyLights === !0 ? Math.PI : 1;
			r.lightMapIntensity.value = i.lightMapIntensity * t, n(i.lightMap, r.lightMapTransform);
		}
		i.aoMap && (r.aoMap.value = i.aoMap, r.aoMapIntensity.value = i.aoMapIntensity, n(i.aoMap, r.aoMapTransform));
	}
	function o(e, t) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, t.map && (e.map.value = t.map, n(t.map, e.mapTransform));
	}
	function s(e, t) {
		e.dashSize.value = t.dashSize, e.totalSize.value = t.dashSize + t.gapSize, e.scale.value = t.scale;
	}
	function c(e, t, r, i) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, e.size.value = t.size * r, e.scale.value = i * .5, t.map && (e.map.value = t.map, n(t.map, e.uvTransform)), t.alphaMap && (e.alphaMap.value = t.alphaMap, n(t.alphaMap, e.alphaMapTransform)), t.alphaTest > 0 && (e.alphaTest.value = t.alphaTest);
	}
	function l(e, t) {
		e.diffuse.value.copy(t.color), e.opacity.value = t.opacity, e.rotation.value = t.rotation, t.map && (e.map.value = t.map, n(t.map, e.mapTransform)), t.alphaMap && (e.alphaMap.value = t.alphaMap, n(t.alphaMap, e.alphaMapTransform)), t.alphaTest > 0 && (e.alphaTest.value = t.alphaTest);
	}
	function u(e, t) {
		e.specular.value.copy(t.specular), e.shininess.value = Math.max(t.shininess, 1e-4);
	}
	function d(e, t) {
		t.gradientMap && (e.gradientMap.value = t.gradientMap);
	}
	function f(e, r) {
		e.metalness.value = r.metalness, r.metalnessMap && (e.metalnessMap.value = r.metalnessMap, n(r.metalnessMap, e.metalnessMapTransform)), e.roughness.value = r.roughness, r.roughnessMap && (e.roughnessMap.value = r.roughnessMap, n(r.roughnessMap, e.roughnessMapTransform)), t.get(r).envMap && (e.envMapIntensity.value = r.envMapIntensity);
	}
	function p(e, t, r) {
		e.ior.value = t.ior, t.sheen > 0 && (e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen), e.sheenRoughness.value = t.sheenRoughness, t.sheenColorMap && (e.sheenColorMap.value = t.sheenColorMap, n(t.sheenColorMap, e.sheenColorMapTransform)), t.sheenRoughnessMap && (e.sheenRoughnessMap.value = t.sheenRoughnessMap, n(t.sheenRoughnessMap, e.sheenRoughnessMapTransform))), t.clearcoat > 0 && (e.clearcoat.value = t.clearcoat, e.clearcoatRoughness.value = t.clearcoatRoughness, t.clearcoatMap && (e.clearcoatMap.value = t.clearcoatMap, n(t.clearcoatMap, e.clearcoatMapTransform)), t.clearcoatRoughnessMap && (e.clearcoatRoughnessMap.value = t.clearcoatRoughnessMap, n(t.clearcoatRoughnessMap, e.clearcoatRoughnessMapTransform)), t.clearcoatNormalMap && (e.clearcoatNormalMap.value = t.clearcoatNormalMap, n(t.clearcoatNormalMap, e.clearcoatNormalMapTransform), e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale), t.side === 1 && e.clearcoatNormalScale.value.negate())), t.iridescence > 0 && (e.iridescence.value = t.iridescence, e.iridescenceIOR.value = t.iridescenceIOR, e.iridescenceThicknessMinimum.value = t.iridescenceThicknessRange[0], e.iridescenceThicknessMaximum.value = t.iridescenceThicknessRange[1], t.iridescenceMap && (e.iridescenceMap.value = t.iridescenceMap, n(t.iridescenceMap, e.iridescenceMapTransform)), t.iridescenceThicknessMap && (e.iridescenceThicknessMap.value = t.iridescenceThicknessMap, n(t.iridescenceThicknessMap, e.iridescenceThicknessMapTransform))), t.transmission > 0 && (e.transmission.value = t.transmission, e.transmissionSamplerMap.value = r.texture, e.transmissionSamplerSize.value.set(r.width, r.height), t.transmissionMap && (e.transmissionMap.value = t.transmissionMap, n(t.transmissionMap, e.transmissionMapTransform)), e.thickness.value = t.thickness, t.thicknessMap && (e.thicknessMap.value = t.thicknessMap, n(t.thicknessMap, e.thicknessMapTransform)), e.attenuationDistance.value = t.attenuationDistance, e.attenuationColor.value.copy(t.attenuationColor)), t.anisotropy > 0 && (e.anisotropyVector.value.set(t.anisotropy * Math.cos(t.anisotropyRotation), t.anisotropy * Math.sin(t.anisotropyRotation)), t.anisotropyMap && (e.anisotropyMap.value = t.anisotropyMap, n(t.anisotropyMap, e.anisotropyMapTransform))), e.specularIntensity.value = t.specularIntensity, e.specularColor.value.copy(t.specularColor), t.specularColorMap && (e.specularColorMap.value = t.specularColorMap, n(t.specularColorMap, e.specularColorMapTransform)), t.specularIntensityMap && (e.specularIntensityMap.value = t.specularIntensityMap, n(t.specularIntensityMap, e.specularIntensityMapTransform));
	}
	function m(e, t) {
		t.matcap && (e.matcap.value = t.matcap);
	}
	function h(e, n) {
		let r = t.get(n).light;
		e.referencePosition.value.setFromMatrixPosition(r.matrixWorld), e.nearDistance.value = r.shadow.camera.near, e.farDistance.value = r.shadow.camera.far;
	}
	return {
		refreshFogUniforms: r,
		refreshMaterialUniforms: i
	};
}
function es(e, t, n, r) {
	let i = {}, a = {}, o = [], s = n.isWebGL2 ? e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS) : 0;
	function c(e, t) {
		let n = t.program;
		r.uniformBlockBinding(e, n);
	}
	function l(e, n) {
		let o = i[e.id];
		o === void 0 && (m(e), o = u(e), i[e.id] = o, e.addEventListener("dispose", g));
		let s = n.program;
		r.updateUBOMapping(e, s);
		let c = t.render.frame;
		a[e.id] !== c && (f(e), a[e.id] = c);
	}
	function u(t) {
		let n = d();
		t.__bindingPointIndex = n;
		let r = e.createBuffer(), i = t.__size, a = t.usage;
		return e.bindBuffer(e.UNIFORM_BUFFER, r), e.bufferData(e.UNIFORM_BUFFER, i, a), e.bindBuffer(e.UNIFORM_BUFFER, null), e.bindBufferBase(e.UNIFORM_BUFFER, n, r), r;
	}
	function d() {
		for (let e = 0; e < s; e++) if (o.indexOf(e) === -1) return o.push(e), e;
		return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
	}
	function f(t) {
		let n = i[t.id], r = t.uniforms, a = t.__cache;
		e.bindBuffer(e.UNIFORM_BUFFER, n);
		for (let t = 0, n = r.length; t < n; t++) {
			let n = Array.isArray(r[t]) ? r[t] : [r[t]];
			for (let r = 0, i = n.length; r < i; r++) {
				let i = n[r];
				if (p(i, t, r, a) === !0) {
					let t = i.__offset, n = Array.isArray(i.value) ? i.value : [i.value], r = 0;
					for (let a = 0; a < n.length; a++) {
						let o = n[a], s = h(o);
						typeof o == "number" || typeof o == "boolean" ? (i.__data[0] = o, e.bufferSubData(e.UNIFORM_BUFFER, t + r, i.__data)) : o.isMatrix3 ? (i.__data[0] = o.elements[0], i.__data[1] = o.elements[1], i.__data[2] = o.elements[2], i.__data[3] = 0, i.__data[4] = o.elements[3], i.__data[5] = o.elements[4], i.__data[6] = o.elements[5], i.__data[7] = 0, i.__data[8] = o.elements[6], i.__data[9] = o.elements[7], i.__data[10] = o.elements[8], i.__data[11] = 0) : (o.toArray(i.__data, r), r += s.storage / Float32Array.BYTES_PER_ELEMENT);
					}
					e.bufferSubData(e.UNIFORM_BUFFER, t, i.__data);
				}
			}
		}
		e.bindBuffer(e.UNIFORM_BUFFER, null);
	}
	function p(e, t, n, r) {
		let i = e.value, a = t + "_" + n;
		if (r[a] === void 0) return r[a] = typeof i == "number" || typeof i == "boolean" ? i : i.clone(), !0;
		{
			let e = r[a];
			if (typeof i == "number" || typeof i == "boolean") {
				if (e !== i) return r[a] = i, !0;
			} else if (e.equals(i) === !1) return e.copy(i), !0;
		}
		return !1;
	}
	function m(e) {
		let t = e.uniforms, n = 0;
		for (let e = 0, r = t.length; e < r; e++) {
			let r = Array.isArray(t[e]) ? t[e] : [t[e]];
			for (let e = 0, t = r.length; e < t; e++) {
				let t = r[e], i = Array.isArray(t.value) ? t.value : [t.value];
				for (let e = 0, r = i.length; e < r; e++) {
					let r = i[e], a = h(r), o = n % 16;
					o !== 0 && 16 - o < a.boundary && (n += 16 - o), t.__data = new Float32Array(a.storage / Float32Array.BYTES_PER_ELEMENT), t.__offset = n, n += a.storage;
				}
			}
		}
		let r = n % 16;
		return r > 0 && (n += 16 - r), e.__size = n, e.__cache = {}, this;
	}
	function h(e) {
		let t = {
			boundary: 0,
			storage: 0
		};
		return typeof e == "number" || typeof e == "boolean" ? (t.boundary = 4, t.storage = 4) : e.isVector2 ? (t.boundary = 8, t.storage = 8) : e.isVector3 || e.isColor ? (t.boundary = 16, t.storage = 12) : e.isVector4 ? (t.boundary = 16, t.storage = 16) : e.isMatrix3 ? (t.boundary = 48, t.storage = 48) : e.isMatrix4 ? (t.boundary = 64, t.storage = 64) : e.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", e), t;
	}
	function g(t) {
		let n = t.target;
		n.removeEventListener("dispose", g);
		let r = o.indexOf(n.__bindingPointIndex);
		o.splice(r, 1), e.deleteBuffer(i[n.id]), delete i[n.id], delete a[n.id];
	}
	function _() {
		for (let t in i) e.deleteBuffer(i[t]);
		o = [], i = {}, a = {};
	}
	return {
		bind: c,
		update: l,
		dispose: _
	};
}
var ts = class {
	constructor(e = {}) {
		let { canvas: t = nt(), context: n = null, depth: r = !0, stencil: i = !0, alpha: a = !1, antialias: o = !1, premultipliedAlpha: s = !0, preserveDrawingBuffer: c = !1, powerPreference: l = "default", failIfMajorPerformanceCaveat: u = !1 } = e;
		this.isWebGLRenderer = !0;
		let d;
		d = n === null ? a : n.getContextAttributes().alpha;
		let f = /* @__PURE__ */ new Uint32Array(4), p = /* @__PURE__ */ new Int32Array(4), m = null, h = null, g = [], _ = [];
		this.domElement = t, this.debug = {
			checkShaderErrors: !0,
			onShaderError: null
		}, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = ge, this._useLegacyLights = !1, this.toneMapping = 0, this.toneMappingExposure = 1;
		let v = this, y = !1, b = 0, x = 0, S = null, C = -1, w = null, T = new vt(), E = new vt(), D = null, O = new X(0), k = 0, A = t.width, j = t.height, M = 1, ee = null, te = null, N = new vt(0, 0, A, j), P = new vt(0, 0, A, j), ne = !1, re = new Xr(), ie = !1, ae = !1, F = null, ce = new $t(), ue = new K(), I = new Y(), de = {
			background: null,
			fog: null,
			environment: null,
			overrideMaterial: null,
			isScene: !0
		};
		function fe() {
			return S === null ? M : 1;
		}
		let L = n;
		function pe(e, n) {
			for (let r = 0; r < e.length; r++) {
				let i = e[r], a = t.getContext(i, n);
				if (a !== null) return a;
			}
			return null;
		}
		try {
			let e = {
				alpha: !0,
				depth: r,
				stencil: i,
				antialias: o,
				premultipliedAlpha: s,
				preserveDrawingBuffer: c,
				powerPreference: l,
				failIfMajorPerformanceCaveat: u
			};
			if ("setAttribute" in t && t.setAttribute("data-engine", "three.js r161"), t.addEventListener("webglcontextlost", Pe, !1), t.addEventListener("webglcontextrestored", Fe, !1), t.addEventListener("webglcontextcreationerror", Ie, !1), L === null) {
				let t = [
					"webgl2",
					"webgl",
					"experimental-webgl"
				];
				if (v.isWebGL1Renderer === !0 && t.shift(), L = pe(t, e), L === null) throw pe(t) ? Error("Error creating WebGL context with your selected attributes.") : Error("Error creating WebGL context.");
			}
			typeof WebGLRenderingContext < "u" && L instanceof WebGLRenderingContext && console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."), L.getShaderPrecisionFormat === void 0 && (L.getShaderPrecisionFormat = function() {
				return {
					rangeMin: 1,
					rangeMax: 1,
					precision: 1
				};
			});
		} catch (e) {
			throw console.error("THREE.WebGLRenderer: " + e.message), e;
		}
		let R, z, B, V, H, U, me, he, ve, W, ye, be, xe, Se, Ce, we, Te, G, Ee, De, Oe, ke, Ae, je;
		function Me() {
			R = new ki(L), z = new ai(L, R, e), R.init(z), ke = new Wo(L, R, z), B = new Ho(L, R, z), V = new Mi(L), H = new To(), U = new Uo(L, R, B, H, z, ke, V), me = new si(v), he = new Oi(v), ve = new Qr(L, z), Ae = new ri(L, R, ve, z), W = new Ai(L, ve, V, Ae), ye = new Ii(L, W, ve, V), Ee = new Fi(L, z, U), we = new oi(H), be = new wo(v, me, he, R, z, Ae, we), xe = new $o(v, H), Se = new ko(), Ce = new Io(R, z), G = new ni(v, me, he, B, ye, d, s), Te = new Vo(v, ye, z), je = new es(L, V, z, B), De = new ii(L, R, V, z), Oe = new ji(L, R, V, z), V.programs = be.programs, v.capabilities = z, v.extensions = R, v.properties = H, v.renderLists = Se, v.shadowMap = Te, v.state = B, v.info = V;
		}
		Me();
		let Ne = new Qo(v, L);
		this.xr = Ne, this.getContext = function() {
			return L;
		}, this.getContextAttributes = function() {
			return L.getContextAttributes();
		}, this.forceContextLoss = function() {
			let e = R.get("WEBGL_lose_context");
			e && e.loseContext();
		}, this.forceContextRestore = function() {
			let e = R.get("WEBGL_lose_context");
			e && e.restoreContext();
		}, this.getPixelRatio = function() {
			return M;
		}, this.setPixelRatio = function(e) {
			e !== void 0 && (M = e, this.setSize(A, j, !1));
		}, this.getSize = function(e) {
			return e.set(A, j);
		}, this.setSize = function(e, n, r = !0) {
			Ne.isPresenting ? console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.") : (A = e, j = n, t.width = Math.floor(e * M), t.height = Math.floor(n * M), r === !0 && (t.style.width = e + "px", t.style.height = n + "px"), this.setViewport(0, 0, e, n));
		}, this.getDrawingBufferSize = function(e) {
			return e.set(A * M, j * M).floor();
		}, this.setDrawingBufferSize = function(e, n, r) {
			A = e, j = n, M = r, t.width = Math.floor(e * r), t.height = Math.floor(n * r), this.setViewport(0, 0, e, n);
		}, this.getCurrentViewport = function(e) {
			return e.copy(T);
		}, this.getViewport = function(e) {
			return e.copy(N);
		}, this.setViewport = function(e, t, n, r) {
			e.isVector4 ? N.set(e.x, e.y, e.z, e.w) : N.set(e, t, n, r), B.viewport(T.copy(N).multiplyScalar(M).floor());
		}, this.getScissor = function(e) {
			return e.copy(P);
		}, this.setScissor = function(e, t, n, r) {
			e.isVector4 ? P.set(e.x, e.y, e.z, e.w) : P.set(e, t, n, r), B.scissor(E.copy(P).multiplyScalar(M).floor());
		}, this.getScissorTest = function() {
			return ne;
		}, this.setScissorTest = function(e) {
			B.setScissorTest(ne = e);
		}, this.setOpaqueSort = function(e) {
			ee = e;
		}, this.setTransparentSort = function(e) {
			te = e;
		}, this.getClearColor = function(e) {
			return e.copy(G.getClearColor());
		}, this.setClearColor = function() {
			G.setClearColor.apply(G, arguments);
		}, this.getClearAlpha = function() {
			return G.getClearAlpha();
		}, this.setClearAlpha = function() {
			G.setClearAlpha.apply(G, arguments);
		}, this.clear = function(e = !0, t = !0, n = !0) {
			let r = 0;
			if (e) {
				let e = !1;
				if (S !== null) {
					let t = S.texture.format;
					e = t === 1033 || t === 1031 || t === 1029;
				}
				if (e) {
					let e = S.texture.type, t = e === 1009 || e === 1014 || e === 1012 || e === 1020 || e === 1017 || e === 1018, n = G.getClearColor(), r = G.getClearAlpha(), i = n.r, a = n.g, o = n.b;
					t ? (f[0] = i, f[1] = a, f[2] = o, f[3] = r, L.clearBufferuiv(L.COLOR, 0, f)) : (p[0] = i, p[1] = a, p[2] = o, p[3] = r, L.clearBufferiv(L.COLOR, 0, p));
				} else r |= L.COLOR_BUFFER_BIT;
			}
			t && (r |= L.DEPTH_BUFFER_BIT), n && (r |= L.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), L.clear(r);
		}, this.clearColor = function() {
			this.clear(!0, !1, !1);
		}, this.clearDepth = function() {
			this.clear(!1, !0, !1);
		}, this.clearStencil = function() {
			this.clear(!1, !1, !0);
		}, this.dispose = function() {
			t.removeEventListener("webglcontextlost", Pe, !1), t.removeEventListener("webglcontextrestored", Fe, !1), t.removeEventListener("webglcontextcreationerror", Ie, !1), Se.dispose(), Ce.dispose(), H.dispose(), me.dispose(), he.dispose(), ye.dispose(), Ae.dispose(), je.dispose(), be.dispose(), Ne.dispose(), Ne.removeEventListener("sessionstart", Ue), Ne.removeEventListener("sessionend", We), F &&= (F.dispose(), null), Ge.stop();
		};
		function Pe(e) {
			e.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), y = !0;
		}
		function Fe() {
			console.log("THREE.WebGLRenderer: Context Restored."), y = !1;
			let e = V.autoReset, t = Te.enabled, n = Te.autoUpdate, r = Te.needsUpdate, i = Te.type;
			Me(), V.autoReset = e, Te.enabled = t, Te.autoUpdate = n, Te.needsUpdate = r, Te.type = i;
		}
		function Ie(e) {
			console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", e.statusMessage);
		}
		function Le(e) {
			let t = e.target;
			t.removeEventListener("dispose", Le), Re(t);
		}
		function Re(e) {
			ze(e), H.remove(e);
		}
		function ze(e) {
			let t = H.get(e).programs;
			t !== void 0 && (t.forEach(function(e) {
				be.releaseProgram(e);
			}), e.isShaderMaterial && be.releaseShaderCache(e));
		}
		this.renderBufferDirect = function(e, t, n, r, i, a) {
			t === null && (t = de);
			let o = i.isMesh && i.matrixWorld.determinant() < 0, s = et(e, t, n, r, i);
			B.setMaterial(r, o);
			let c = n.index, l = 1;
			if (r.wireframe === !0) {
				if (c = W.getWireframeAttribute(n), c === void 0) return;
				l = 2;
			}
			let u = n.drawRange, d = n.attributes.position, f = u.start * l, p = (u.start + u.count) * l;
			a !== null && (f = Math.max(f, a.start * l), p = Math.min(p, (a.start + a.count) * l)), c === null ? d != null && (f = Math.max(f, 0), p = Math.min(p, d.count)) : (f = Math.max(f, 0), p = Math.min(p, c.count));
			let m = p - f;
			if (m < 0 || m === Infinity) return;
			Ae.setup(i, r, s, n, c);
			let h, g = De;
			if (c !== null && (h = ve.get(c), g = Oe, g.setIndex(h)), i.isMesh) r.wireframe === !0 ? (B.setLineWidth(r.wireframeLinewidth * fe()), g.setMode(L.LINES)) : g.setMode(L.TRIANGLES);
			else if (i.isLine) {
				let e = r.linewidth;
				e === void 0 && (e = 1), B.setLineWidth(e * fe()), i.isLineSegments ? g.setMode(L.LINES) : i.isLineLoop ? g.setMode(L.LINE_LOOP) : g.setMode(L.LINE_STRIP);
			} else i.isPoints ? g.setMode(L.POINTS) : i.isSprite && g.setMode(L.TRIANGLES);
			if (i.isBatchedMesh) g.renderMultiDraw(i._multiDrawStarts, i._multiDrawCounts, i._multiDrawCount);
			else if (i.isInstancedMesh) g.renderInstances(f, m, i.count);
			else if (n.isInstancedBufferGeometry) {
				let e = n._maxInstanceCount === void 0 ? Infinity : n._maxInstanceCount, t = Math.min(n.instanceCount, e);
				g.renderInstances(f, m, t);
			} else g.render(f, m);
		};
		function Be(e, t, n) {
			e.transparent === !0 && e.side === 2 && e.forceSinglePass === !1 ? (e.side = 1, e.needsUpdate = !0, Qe(e, t, n), e.side = 0, e.needsUpdate = !0, Qe(e, t, n), e.side = 2) : Qe(e, t, n);
		}
		this.compile = function(e, t, n = null) {
			n === null && (n = e), h = Ce.get(n), h.init(), _.push(h), n.traverseVisible(function(e) {
				e.isLight && e.layers.test(t.layers) && (h.pushLight(e), e.castShadow && h.pushShadow(e));
			}), e !== n && e.traverseVisible(function(e) {
				e.isLight && e.layers.test(t.layers) && (h.pushLight(e), e.castShadow && h.pushShadow(e));
			}), h.setupLights(v._useLegacyLights);
			let r = /* @__PURE__ */ new Set();
			return e.traverse(function(e) {
				let t = e.material;
				if (t) {
					if (Array.isArray(t)) for (let i = 0; i < t.length; i++) {
						let a = t[i];
						Be(a, n, e), r.add(a);
					}
					else Be(t, n, e), r.add(t);
				}
			}), _.pop(), h = null, r;
		}, this.compileAsync = function(e, t, n = null) {
			let r = this.compile(e, t, n);
			return new Promise((t) => {
				function n() {
					r.forEach(function(e) {
						H.get(e).currentProgram.isReady() && r.delete(e);
					}), r.size === 0 ? t(e) : setTimeout(n, 10);
				}
				R.get("KHR_parallel_shader_compile") === null ? setTimeout(n, 10) : n();
			});
		};
		let Ve = null;
		function He(e) {
			Ve && Ve(e);
		}
		function Ue() {
			Ge.stop();
		}
		function We() {
			Ge.start();
		}
		let Ge = new Zr();
		Ge.setAnimationLoop(He), typeof self < "u" && Ge.setContext(self), this.setAnimationLoop = function(e) {
			Ve = e, Ne.setAnimationLoop(e), e === null ? Ge.stop() : Ge.start();
		}, Ne.addEventListener("sessionstart", Ue), Ne.addEventListener("sessionend", We), this.render = function(e, t) {
			if (t !== void 0 && t.isCamera !== !0) {
				console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
				return;
			}
			if (y === !0) return;
			e.matrixWorldAutoUpdate === !0 && e.updateMatrixWorld(), t.parent === null && t.matrixWorldAutoUpdate === !0 && t.updateMatrixWorld(), Ne.enabled === !0 && Ne.isPresenting === !0 && (Ne.cameraAutoUpdate === !0 && Ne.updateCamera(t), t = Ne.getCamera()), e.isScene === !0 && e.onBeforeRender(v, e, t, S), h = Ce.get(e, _.length), h.init(), _.push(h), ce.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), re.setFromProjectionMatrix(ce), ae = this.localClippingEnabled, ie = we.init(this.clippingPlanes, ae), m = Se.get(e, g.length), m.init(), g.push(m), Ke(e, t, 0, v.sortObjects), m.finish(), v.sortObjects === !0 && m.sort(ee, te), this.info.render.frame++, ie === !0 && we.beginShadows();
			let n = h.state.shadowsArray;
			if (Te.render(n, e, t), ie === !0 && we.endShadows(), this.info.autoReset === !0 && this.info.reset(), (Ne.enabled === !1 || Ne.isPresenting === !1 || Ne.hasDepthSensing() === !1) && G.render(m, e), h.setupLights(v._useLegacyLights), t.isArrayCamera) {
				let n = t.cameras;
				for (let t = 0, r = n.length; t < r; t++) {
					let r = n[t];
					qe(m, e, r, r.viewport);
				}
			} else qe(m, e, t);
			S !== null && (U.updateMultisampleRenderTarget(S), U.updateRenderTargetMipmap(S)), e.isScene === !0 && e.onAfterRender(v, e, t), Ae.resetDefaultState(), C = -1, w = null, _.pop(), h = _.length > 0 ? _[_.length - 1] : null, g.pop(), m = g.length > 0 ? g[g.length - 1] : null;
		};
		function Ke(e, t, n, r) {
			if (e.visible === !1) return;
			if (e.layers.test(t.layers)) {
				if (e.isGroup) n = e.renderOrder;
				else if (e.isLOD) e.autoUpdate === !0 && e.update(t);
				else if (e.isLight) h.pushLight(e), e.castShadow && h.pushShadow(e);
				else if (e.isSprite) {
					if (!e.frustumCulled || re.intersectsSprite(e)) {
						r && I.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ce);
						let t = ye.update(e), i = e.material;
						i.visible && m.push(e, t, i, n, I.z, null);
					}
				} else if ((e.isMesh || e.isLine || e.isPoints) && (!e.frustumCulled || re.intersectsObject(e))) {
					let t = ye.update(e), i = e.material;
					if (r && (e.boundingSphere === void 0 ? (t.boundingSphere === null && t.computeBoundingSphere(), I.copy(t.boundingSphere.center)) : (e.boundingSphere === null && e.computeBoundingSphere(), I.copy(e.boundingSphere.center)), I.applyMatrix4(e.matrixWorld).applyMatrix4(ce)), Array.isArray(i)) {
						let r = t.groups;
						for (let a = 0, o = r.length; a < o; a++) {
							let o = r[a], s = i[o.materialIndex];
							s && s.visible && m.push(e, t, s, n, I.z, o);
						}
					} else i.visible && m.push(e, t, i, n, I.z, null);
				}
			}
			let i = e.children;
			for (let e = 0, a = i.length; e < a; e++) Ke(i[e], t, n, r);
		}
		function qe(e, t, n, r) {
			let i = e.opaque, a = e.transmissive, o = e.transparent;
			h.setupLightsView(n), ie === !0 && we.setGlobalState(v.clippingPlanes, n), a.length > 0 && Ye(i, a, t, n), r && B.viewport(T.copy(r)), i.length > 0 && Xe(i, t, n), a.length > 0 && Xe(a, t, n), o.length > 0 && Xe(o, t, n), B.buffers.depth.setTest(!0), B.buffers.depth.setMask(!0), B.buffers.color.setMask(!0), B.setPolygonOffset(!1);
		}
		function Ye(e, t, n, r) {
			if ((n.isScene === !0 ? n.overrideMaterial : null) !== null) return;
			let i = z.isWebGL2;
			F === null && (F = new bt(1, 1, {
				generateMipmaps: !0,
				type: R.has("EXT_color_buffer_half_float") ? le : se,
				minFilter: oe,
				samples: i ? 4 : 0
			})), v.getDrawingBufferSize(ue), i ? F.setSize(ue.x, ue.y) : F.setSize(Je(ue.x), Je(ue.y));
			let a = v.getRenderTarget();
			v.setRenderTarget(F), v.getClearColor(O), k = v.getClearAlpha(), k < 1 && v.setClearColor(16777215, .5), v.clear();
			let o = v.toneMapping;
			v.toneMapping = 0, Xe(e, n, r), U.updateMultisampleRenderTarget(F), U.updateRenderTargetMipmap(F);
			let s = !1;
			for (let e = 0, i = t.length; e < i; e++) {
				let i = t[e], a = i.object, o = i.geometry, c = i.material, l = i.group;
				if (c.side === 2 && a.layers.test(r.layers)) {
					let e = c.side;
					c.side = 1, c.needsUpdate = !0, Ze(a, n, r, o, c, l), c.side = e, c.needsUpdate = !0, s = !0;
				}
			}
			s === !0 && (U.updateMultisampleRenderTarget(F), U.updateRenderTargetMipmap(F)), v.setRenderTarget(a), v.setClearColor(O, k), v.toneMapping = o;
		}
		function Xe(e, t, n) {
			let r = t.isScene === !0 ? t.overrideMaterial : null;
			for (let i = 0, a = e.length; i < a; i++) {
				let a = e[i], o = a.object, s = a.geometry, c = r === null ? a.material : r, l = a.group;
				o.layers.test(n.layers) && Ze(o, t, n, s, c, l);
			}
		}
		function Ze(e, t, n, r, i, a) {
			e.onBeforeRender(v, t, n, r, i, a), e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse, e.matrixWorld), e.normalMatrix.getNormalMatrix(e.modelViewMatrix), i.onBeforeRender(v, t, n, r, e, a), i.transparent === !0 && i.side === 2 && i.forceSinglePass === !1 ? (i.side = 1, i.needsUpdate = !0, v.renderBufferDirect(n, t, r, i, e, a), i.side = 0, i.needsUpdate = !0, v.renderBufferDirect(n, t, r, i, e, a), i.side = 2) : v.renderBufferDirect(n, t, r, i, e, a), e.onAfterRender(v, t, n, r, i, a);
		}
		function Qe(e, t, n) {
			t.isScene !== !0 && (t = de);
			let r = H.get(e), i = h.state.lights, a = h.state.shadowsArray, o = i.state.version, s = be.getParameters(e, i.state, a, t, n), c = be.getProgramCacheKey(s), l = r.programs;
			r.environment = e.isMeshStandardMaterial ? t.environment : null, r.fog = t.fog, r.envMap = (e.isMeshStandardMaterial ? he : me).get(e.envMap || r.environment), l === void 0 && (e.addEventListener("dispose", Le), l = /* @__PURE__ */ new Map(), r.programs = l);
			let u = l.get(c);
			if (u !== void 0) {
				if (r.currentProgram === u && r.lightsStateVersion === o) return $e(e, s), u;
			} else s.uniforms = be.getUniforms(e), e.onBuild(n, s, v), e.onBeforeCompile(s, v), u = be.acquireProgram(s, c), l.set(c, u), r.uniforms = s.uniforms;
			let d = r.uniforms;
			return (!e.isShaderMaterial && !e.isRawShaderMaterial || e.clipping === !0) && (d.clippingPlanes = we.uniform), $e(e, s), r.needsLights = rt(e), r.lightsStateVersion = o, r.needsLights && (d.ambientLightColor.value = i.state.ambient, d.lightProbe.value = i.state.probe, d.directionalLights.value = i.state.directional, d.directionalLightShadows.value = i.state.directionalShadow, d.spotLights.value = i.state.spot, d.spotLightShadows.value = i.state.spotShadow, d.rectAreaLights.value = i.state.rectArea, d.ltc_1.value = i.state.rectAreaLTC1, d.ltc_2.value = i.state.rectAreaLTC2, d.pointLights.value = i.state.point, d.pointLightShadows.value = i.state.pointShadow, d.hemisphereLights.value = i.state.hemi, d.directionalShadowMap.value = i.state.directionalShadowMap, d.directionalShadowMatrix.value = i.state.directionalShadowMatrix, d.spotShadowMap.value = i.state.spotShadowMap, d.spotLightMatrix.value = i.state.spotLightMatrix, d.spotLightMap.value = i.state.spotLightMap, d.pointShadowMap.value = i.state.pointShadowMap, d.pointShadowMatrix.value = i.state.pointShadowMatrix), r.currentProgram = u, r.uniformsList = null, u;
		}
		function q(e) {
			if (e.uniformsList === null) {
				let t = e.currentProgram.getUniforms();
				e.uniformsList = Wa.seqWithValue(t.seq, e.uniforms);
			}
			return e.uniformsList;
		}
		function $e(e, t) {
			let n = H.get(e);
			n.outputColorSpace = t.outputColorSpace, n.batching = t.batching, n.instancing = t.instancing, n.instancingColor = t.instancingColor, n.skinning = t.skinning, n.morphTargets = t.morphTargets, n.morphNormals = t.morphNormals, n.morphColors = t.morphColors, n.morphTargetsCount = t.morphTargetsCount, n.numClippingPlanes = t.numClippingPlanes, n.numIntersection = t.numClipIntersection, n.vertexAlphas = t.vertexAlphas, n.vertexTangents = t.vertexTangents, n.toneMapping = t.toneMapping;
		}
		function et(e, t, n, r, i) {
			t.isScene !== !0 && (t = de), U.resetTextureUnits();
			let a = t.fog, o = r.isMeshStandardMaterial ? t.environment : null, s = S === null ? v.outputColorSpace : S.isXRRenderTarget === !0 ? S.texture.colorSpace : _e, c = (r.isMeshStandardMaterial ? he : me).get(r.envMap || o), l = r.vertexColors === !0 && !!n.attributes.color && n.attributes.color.itemSize === 4, u = !!n.attributes.tangent && (!!r.normalMap || r.anisotropy > 0), d = !!n.morphAttributes.position, f = !!n.morphAttributes.normal, p = !!n.morphAttributes.color, m = 0;
			r.toneMapped && (S === null || S.isXRRenderTarget === !0) && (m = v.toneMapping);
			let g = n.morphAttributes.position || n.morphAttributes.normal || n.morphAttributes.color, _ = g === void 0 ? 0 : g.length, y = H.get(r), b = h.state.lights;
			if (ie === !0 && (ae === !0 || e !== w)) {
				let t = e === w && r.id === C;
				we.setState(r, e, t);
			}
			let x = !1;
			r.version === y.__version ? y.needsLights && y.lightsStateVersion !== b.state.version ? x = !0 : y.outputColorSpace === s ? i.isBatchedMesh && y.batching === !1 || !i.isBatchedMesh && y.batching === !0 || i.isInstancedMesh && y.instancing === !1 || !i.isInstancedMesh && y.instancing === !0 || i.isSkinnedMesh && y.skinning === !1 || !i.isSkinnedMesh && y.skinning === !0 || i.isInstancedMesh && y.instancingColor === !0 && i.instanceColor === null || i.isInstancedMesh && y.instancingColor === !1 && i.instanceColor !== null ? x = !0 : y.envMap === c ? r.fog === !0 && y.fog !== a || y.numClippingPlanes !== void 0 && (y.numClippingPlanes !== we.numPlanes || y.numIntersection !== we.numIntersection) ? x = !0 : y.vertexAlphas === l && y.vertexTangents === u && y.morphTargets === d && y.morphNormals === f && y.morphColors === p && y.toneMapping === m ? z.isWebGL2 === !0 && y.morphTargetsCount !== _ && (x = !0) : x = !0 : x = !0 : x = !0 : (x = !0, y.__version = r.version);
			let T = y.currentProgram;
			x === !0 && (T = Qe(r, t, i));
			let E = !1, D = !1, O = !1, k = T.getUniforms(), A = y.uniforms;
			if (B.useProgram(T.program) && (E = !0, D = !0, O = !0), r.id !== C && (C = r.id, D = !0), E || w !== e) {
				k.setValue(L, "projectionMatrix", e.projectionMatrix), k.setValue(L, "viewMatrix", e.matrixWorldInverse);
				let t = k.map.cameraPosition;
				t !== void 0 && t.setValue(L, I.setFromMatrixPosition(e.matrixWorld)), z.logarithmicDepthBuffer && k.setValue(L, "logDepthBufFC", 2 / (Math.log(e.far + 1) / Math.LN2)), (r.isMeshPhongMaterial || r.isMeshToonMaterial || r.isMeshLambertMaterial || r.isMeshBasicMaterial || r.isMeshStandardMaterial || r.isShaderMaterial) && k.setValue(L, "isOrthographic", e.isOrthographicCamera === !0), w !== e && (w = e, D = !0, O = !0);
			}
			if (i.isSkinnedMesh) {
				k.setOptional(L, i, "bindMatrix"), k.setOptional(L, i, "bindMatrixInverse");
				let e = i.skeleton;
				e && (z.floatVertexTextures ? (e.boneTexture === null && e.computeBoneTexture(), k.setValue(L, "boneTexture", e.boneTexture, U)) : console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."));
			}
			i.isBatchedMesh && (k.setOptional(L, i, "batchingTexture"), k.setValue(L, "batchingTexture", i._matricesTexture, U));
			let ee = n.morphAttributes;
			if ((ee.position !== void 0 || ee.normal !== void 0 || ee.color !== void 0 && z.isWebGL2 === !0) && Ee.update(i, n, T), (D || y.receiveShadow !== i.receiveShadow) && (y.receiveShadow = i.receiveShadow, k.setValue(L, "receiveShadow", i.receiveShadow)), r.isMeshGouraudMaterial && r.envMap !== null && (A.envMap.value = c, A.flipEnvMap.value = c.isCubeTexture && c.isRenderTargetTexture === !1 ? -1 : 1), D && (k.setValue(L, "toneMappingExposure", v.toneMappingExposure), y.needsLights && tt(A, O), a && r.fog === !0 && xe.refreshFogUniforms(A, a), xe.refreshMaterialUniforms(A, r, M, j, F), Wa.upload(L, q(y), A, U)), r.isShaderMaterial && r.uniformsNeedUpdate === !0 && (Wa.upload(L, q(y), A, U), r.uniformsNeedUpdate = !1), r.isSpriteMaterial && k.setValue(L, "center", i.center), k.setValue(L, "modelViewMatrix", i.modelViewMatrix), k.setValue(L, "normalMatrix", i.normalMatrix), k.setValue(L, "modelMatrix", i.matrixWorld), r.isShaderMaterial || r.isRawShaderMaterial) {
				let e = r.uniformsGroups;
				for (let t = 0, n = e.length; t < n; t++) if (z.isWebGL2) {
					let n = e[t];
					je.update(n, T), je.bind(n, T);
				} else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.");
			}
			return T;
		}
		function tt(e, t) {
			e.ambientLightColor.needsUpdate = t, e.lightProbe.needsUpdate = t, e.directionalLights.needsUpdate = t, e.directionalLightShadows.needsUpdate = t, e.pointLights.needsUpdate = t, e.pointLightShadows.needsUpdate = t, e.spotLights.needsUpdate = t, e.spotLightShadows.needsUpdate = t, e.rectAreaLights.needsUpdate = t, e.hemisphereLights.needsUpdate = t;
		}
		function rt(e) {
			return e.isMeshLambertMaterial || e.isMeshToonMaterial || e.isMeshPhongMaterial || e.isMeshStandardMaterial || e.isShadowMaterial || e.isShaderMaterial && e.lights === !0;
		}
		this.getActiveCubeFace = function() {
			return b;
		}, this.getActiveMipmapLevel = function() {
			return x;
		}, this.getRenderTarget = function() {
			return S;
		}, this.setRenderTargetTextures = function(e, t, n) {
			H.get(e.texture).__webglTexture = t, H.get(e.depthTexture).__webglTexture = n;
			let r = H.get(e);
			r.__hasExternalTextures = !0, r.__hasExternalTextures && (r.__autoAllocateDepthBuffer = n === void 0, r.__autoAllocateDepthBuffer || R.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), r.__useRenderToTexture = !1));
		}, this.setRenderTargetFramebuffer = function(e, t) {
			let n = H.get(e);
			n.__webglFramebuffer = t, n.__useDefaultFramebuffer = t === void 0;
		}, this.setRenderTarget = function(e, t = 0, n = 0) {
			S = e, b = t, x = n;
			let r = !0, i = null, a = !1, o = !1;
			if (e) {
				let s = H.get(e);
				s.__useDefaultFramebuffer === void 0 ? s.__webglFramebuffer === void 0 ? U.setupRenderTarget(e) : s.__hasExternalTextures && U.rebindTextures(e, H.get(e.texture).__webglTexture, H.get(e.depthTexture).__webglTexture) : (B.bindFramebuffer(L.FRAMEBUFFER, null), r = !1);
				let c = e.texture;
				(c.isData3DTexture || c.isDataArrayTexture || c.isCompressedArrayTexture) && (o = !0);
				let l = H.get(e).__webglFramebuffer;
				e.isWebGLCubeRenderTarget ? (i = Array.isArray(l[t]) ? l[t][n] : l[t], a = !0) : i = z.isWebGL2 && e.samples > 0 && U.useMultisampledRTT(e) === !1 ? H.get(e).__webglMultisampledFramebuffer : Array.isArray(l) ? l[n] : l, T.copy(e.viewport), E.copy(e.scissor), D = e.scissorTest;
			} else T.copy(N).multiplyScalar(M).floor(), E.copy(P).multiplyScalar(M).floor(), D = ne;
			if (B.bindFramebuffer(L.FRAMEBUFFER, i) && z.drawBuffers && r && B.drawBuffers(e, i), B.viewport(T), B.scissor(E), B.setScissorTest(D), a) {
				let r = H.get(e.texture);
				L.framebufferTexture2D(L.FRAMEBUFFER, L.COLOR_ATTACHMENT0, L.TEXTURE_CUBE_MAP_POSITIVE_X + t, r.__webglTexture, n);
			} else if (o) {
				let r = H.get(e.texture), i = t || 0;
				L.framebufferTextureLayer(L.FRAMEBUFFER, L.COLOR_ATTACHMENT0, r.__webglTexture, n || 0, i);
			}
			C = -1;
		}, this.readRenderTargetPixels = function(e, t, n, r, i, a, o) {
			if (!(e && e.isWebGLRenderTarget)) {
				console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
				return;
			}
			let s = H.get(e).__webglFramebuffer;
			if (e.isWebGLCubeRenderTarget && o !== void 0 && (s = s[o]), s) {
				B.bindFramebuffer(L.FRAMEBUFFER, s);
				try {
					let o = e.texture, s = o.format, c = o.type;
					if (s !== 1023 && ke.convert(s) !== L.getParameter(L.IMPLEMENTATION_COLOR_READ_FORMAT)) {
						console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
						return;
					}
					let l = c === 1016 && (R.has("EXT_color_buffer_half_float") || z.isWebGL2 && R.has("EXT_color_buffer_float"));
					if (c !== 1009 && ke.convert(c) !== L.getParameter(L.IMPLEMENTATION_COLOR_READ_TYPE) && !(c === 1015 && (z.isWebGL2 || R.has("OES_texture_float") || R.has("WEBGL_color_buffer_float"))) && !l) {
						console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
						return;
					}
					t >= 0 && t <= e.width - r && n >= 0 && n <= e.height - i && L.readPixels(t, n, r, i, ke.convert(s), ke.convert(c), a);
				} finally {
					let e = S === null ? null : H.get(S).__webglFramebuffer;
					B.bindFramebuffer(L.FRAMEBUFFER, e);
				}
			}
		}, this.copyFramebufferToTexture = function(e, t, n = 0) {
			let r = 2 ** -n, i = Math.floor(t.image.width * r), a = Math.floor(t.image.height * r);
			U.setTexture2D(t, 0), L.copyTexSubImage2D(L.TEXTURE_2D, n, 0, 0, e.x, e.y, i, a), B.unbindTexture();
		}, this.copyTextureToTexture = function(e, t, n, r = 0) {
			let i = t.image.width, a = t.image.height, o = ke.convert(n.format), s = ke.convert(n.type);
			U.setTexture2D(n, 0), L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL, n.flipY), L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL, n.premultiplyAlpha), L.pixelStorei(L.UNPACK_ALIGNMENT, n.unpackAlignment), t.isDataTexture ? L.texSubImage2D(L.TEXTURE_2D, r, e.x, e.y, i, a, o, s, t.image.data) : t.isCompressedTexture ? L.compressedTexSubImage2D(L.TEXTURE_2D, r, e.x, e.y, t.mipmaps[0].width, t.mipmaps[0].height, o, t.mipmaps[0].data) : L.texSubImage2D(L.TEXTURE_2D, r, e.x, e.y, o, s, t.image), r === 0 && n.generateMipmaps && L.generateMipmap(L.TEXTURE_2D), B.unbindTexture();
		}, this.copyTextureToTexture3D = function(e, t, n, r, i = 0) {
			if (v.isWebGL1Renderer) {
				console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");
				return;
			}
			let a = e.max.x - e.min.x + 1, o = e.max.y - e.min.y + 1, s = e.max.z - e.min.z + 1, c = ke.convert(r.format), l = ke.convert(r.type), u;
			if (r.isData3DTexture) U.setTexture3D(r, 0), u = L.TEXTURE_3D;
			else if (r.isDataArrayTexture || r.isCompressedArrayTexture) U.setTexture2DArray(r, 0), u = L.TEXTURE_2D_ARRAY;
			else {
				console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
				return;
			}
			L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL, r.flipY), L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL, r.premultiplyAlpha), L.pixelStorei(L.UNPACK_ALIGNMENT, r.unpackAlignment);
			let d = L.getParameter(L.UNPACK_ROW_LENGTH), f = L.getParameter(L.UNPACK_IMAGE_HEIGHT), p = L.getParameter(L.UNPACK_SKIP_PIXELS), m = L.getParameter(L.UNPACK_SKIP_ROWS), h = L.getParameter(L.UNPACK_SKIP_IMAGES), g = n.isCompressedTexture ? n.mipmaps[i] : n.image;
			L.pixelStorei(L.UNPACK_ROW_LENGTH, g.width), L.pixelStorei(L.UNPACK_IMAGE_HEIGHT, g.height), L.pixelStorei(L.UNPACK_SKIP_PIXELS, e.min.x), L.pixelStorei(L.UNPACK_SKIP_ROWS, e.min.y), L.pixelStorei(L.UNPACK_SKIP_IMAGES, e.min.z), n.isDataTexture || n.isData3DTexture ? L.texSubImage3D(u, i, t.x, t.y, t.z, a, o, s, c, l, g.data) : n.isCompressedArrayTexture ? (console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."), L.compressedTexSubImage3D(u, i, t.x, t.y, t.z, a, o, s, c, g.data)) : L.texSubImage3D(u, i, t.x, t.y, t.z, a, o, s, c, l, g), L.pixelStorei(L.UNPACK_ROW_LENGTH, d), L.pixelStorei(L.UNPACK_IMAGE_HEIGHT, f), L.pixelStorei(L.UNPACK_SKIP_PIXELS, p), L.pixelStorei(L.UNPACK_SKIP_ROWS, m), L.pixelStorei(L.UNPACK_SKIP_IMAGES, h), i === 0 && r.generateMipmaps && L.generateMipmap(u), B.unbindTexture();
		}, this.initTexture = function(e) {
			e.isCubeTexture ? U.setTextureCube(e, 0) : e.isData3DTexture ? U.setTexture3D(e, 0) : e.isDataArrayTexture || e.isCompressedArrayTexture ? U.setTexture2DArray(e, 0) : U.setTexture2D(e, 0), B.unbindTexture();
		}, this.resetState = function() {
			b = 0, x = 0, S = null, B.reset(), Ae.reset();
		}, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
	}
	get coordinateSystem() {
		return Te;
	}
	get outputColorSpace() {
		return this._outputColorSpace;
	}
	set outputColorSpace(e) {
		this._outputColorSpace = e;
		let t = this.getContext();
		t.drawingBufferColorSpace = e === "display-p3" ? "display-p3" : "srgb", t.unpackColorSpace = J.workingColorSpace === "display-p3-linear" ? "display-p3" : "srgb";
	}
	get outputEncoding() {
		return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."), this.outputColorSpace === "srgb" ? U : H;
	}
	set outputEncoding(e) {
		console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."), this.outputColorSpace = e === 3001 ? ge : _e;
	}
	get useLegacyLights() {
		return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."), this._useLegacyLights;
	}
	set useLegacyLights(e) {
		console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."), this._useLegacyLights = e;
	}
}, ns = class extends ts {};
ns.prototype.isWebGL1Renderer = !0;
var rs = class extends Tn {
	constructor() {
		super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
	}
	copy(e, t) {
		return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t;
	}
}, is = class extends Nr {
	constructor(e) {
		super(e), this.isRawShaderMaterial = !0, this.type = "RawShaderMaterial";
	}
}, as = class extends Un {
	constructor(e) {
		super(), this.isMeshNormalMaterial = !0, this.type = "MeshNormalMaterial", this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new K(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.flatShading = !1, this.setValues(e);
	}
	copy(e) {
		return super.copy(e), this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.flatShading = e.flatShading, this;
	}
};
function os(e, t, n) {
	return !e || !n && e.constructor === t ? e : typeof t.BYTES_PER_ELEMENT == "number" ? new t(e) : Array.prototype.slice.call(e);
}
function ss(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
var cs = class {
	constructor(e, t, n, r) {
		this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = r === void 0 ? new t.constructor(n) : r, this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {};
	}
	evaluate(e) {
		let t = this.parameterPositions, n = this._cachedIndex, r = t[n], i = t[n - 1];
		validate_interval: {
			seek: {
				let a;
				linear_scan: {
					forward_scan: if (!(e < r)) {
						for (let a = n + 2;;) {
							if (r === void 0) {
								if (e < i) break forward_scan;
								return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
							}
							if (n === a) break;
							if (i = r, r = t[++n], e < r) break seek;
						}
						a = t.length;
						break linear_scan;
					}
					if (!(e >= i)) {
						let o = t[1];
						e < o && (n = 2, i = o);
						for (let a = n - 2;;) {
							if (i === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
							if (n === a) break;
							if (r = i, i = t[--n - 1], e >= i) break seek;
						}
						a = n, n = 0;
						break linear_scan;
					}
					break validate_interval;
				}
				for (; n < a;) {
					let r = n + a >>> 1;
					e < t[r] ? a = r : n = r + 1;
				}
				if (r = t[n], i = t[n - 1], i === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
				if (r === void 0) return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
			}
			this._cachedIndex = n, this.intervalChanged_(n, i, r);
		}
		return this.interpolate_(n, i, e, r);
	}
	getSettings_() {
		return this.settings || this.DefaultSettings_;
	}
	copySampleValue_(e) {
		let t = this.resultBuffer, n = this.sampleValues, r = this.valueSize, i = e * r;
		for (let e = 0; e !== r; ++e) t[e] = n[i + e];
		return t;
	}
	interpolate_() {
		throw Error("call to abstract method");
	}
	intervalChanged_() {}
}, ls = class extends cs {
	constructor(e, t, n, r) {
		super(e, t, n, r), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
			endingStart: z,
			endingEnd: z
		};
	}
	intervalChanged_(e, t, n) {
		let r = this.parameterPositions, i = e - 2, a = e + 1, o = r[i], s = r[a];
		if (o === void 0) switch (this.getSettings_().endingStart) {
			case B:
				i = e, o = 2 * t - n;
				break;
			case V:
				i = r.length - 2, o = t + r[i] - r[i + 1];
				break;
			default: i = e, o = n;
		}
		if (s === void 0) switch (this.getSettings_().endingEnd) {
			case B:
				a = e, s = 2 * n - t;
				break;
			case V:
				a = 1, s = n + r[1] - r[0];
				break;
			default: a = e - 1, s = t;
		}
		let c = (n - t) * .5, l = this.valueSize;
		this._weightPrev = c / (t - o), this._weightNext = c / (s - n), this._offsetPrev = i * l, this._offsetNext = a * l;
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = e * o, c = s - o, l = this._offsetPrev, u = this._offsetNext, d = this._weightPrev, f = this._weightNext, p = (n - t) / (r - t), m = p * p, h = m * p, g = -d * h + 2 * d * m - d * p, _ = (1 + d) * h + (-1.5 - 2 * d) * m + (-.5 + d) * p + 1, v = (-1 - f) * h + (1.5 + f) * m + .5 * p, y = f * h - f * m;
		for (let e = 0; e !== o; ++e) i[e] = g * a[l + e] + _ * a[c + e] + v * a[s + e] + y * a[u + e];
		return i;
	}
}, us = class extends cs {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = e * o, c = s - o, l = (n - t) / (r - t), u = 1 - l;
		for (let e = 0; e !== o; ++e) i[e] = a[c + e] * u + a[s + e] * l;
		return i;
	}
}, ds = class extends cs {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e) {
		return this.copySampleValue_(e - 1);
	}
}, fs = class {
	constructor(e, t, n, r) {
		if (e === void 0) throw Error("THREE.KeyframeTrack: track name is undefined");
		if (t === void 0 || t.length === 0) throw Error("THREE.KeyframeTrack: no keyframes in track named " + e);
		this.name = e, this.times = os(t, this.TimeBufferType), this.values = os(n, this.ValueBufferType), this.setInterpolation(r || this.DefaultInterpolation);
	}
	static toJSON(e) {
		let t = e.constructor, n;
		if (t.toJSON !== this.toJSON) n = t.toJSON(e);
		else {
			n = {
				name: e.name,
				times: os(e.times, Array),
				values: os(e.values, Array)
			};
			let t = e.getInterpolation();
			t !== e.DefaultInterpolation && (n.interpolation = t);
		}
		return n.type = e.ValueTypeName, n;
	}
	InterpolantFactoryMethodDiscrete(e) {
		return new ds(this.times, this.values, this.getValueSize(), e);
	}
	InterpolantFactoryMethodLinear(e) {
		return new us(this.times, this.values, this.getValueSize(), e);
	}
	InterpolantFactoryMethodSmooth(e) {
		return new ls(this.times, this.values, this.getValueSize(), e);
	}
	setInterpolation(e) {
		let t;
		switch (e) {
			case L:
				t = this.InterpolantFactoryMethodDiscrete;
				break;
			case pe:
				t = this.InterpolantFactoryMethodLinear;
				break;
			case R: t = this.InterpolantFactoryMethodSmooth;
		}
		if (t === void 0) {
			let t = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
			if (this.createInterpolant === void 0) {
				if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
				else throw Error(t);
			}
			return console.warn("THREE.KeyframeTrack:", t), this;
		}
		return this.createInterpolant = t, this;
	}
	getInterpolation() {
		switch (this.createInterpolant) {
			case this.InterpolantFactoryMethodDiscrete: return L;
			case this.InterpolantFactoryMethodLinear: return pe;
			case this.InterpolantFactoryMethodSmooth: return R;
		}
	}
	getValueSize() {
		return this.values.length / this.times.length;
	}
	shift(e) {
		if (e !== 0) {
			let t = this.times;
			for (let n = 0, r = t.length; n !== r; ++n) t[n] += e;
		}
		return this;
	}
	scale(e) {
		if (e !== 1) {
			let t = this.times;
			for (let n = 0, r = t.length; n !== r; ++n) t[n] *= e;
		}
		return this;
	}
	trim(e, t) {
		let n = this.times, r = n.length, i = 0, a = r - 1;
		for (; i !== r && n[i] < e;) ++i;
		for (; a !== -1 && n[a] > t;) --a;
		if (++a, i !== 0 || a !== r) {
			i >= a && (a = Math.max(a, 1), i = a - 1);
			let e = this.getValueSize();
			this.times = n.slice(i, a), this.values = this.values.slice(i * e, a * e);
		}
		return this;
	}
	validate() {
		let e = !0, t = this.getValueSize();
		t - Math.floor(t) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), e = !1);
		let n = this.times, r = this.values, i = n.length;
		i === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), e = !1);
		let a = null;
		for (let t = 0; t !== i; t++) {
			let r = n[t];
			if (typeof r == "number" && isNaN(r)) {
				console.error("THREE.KeyframeTrack: Time is not a valid number.", this, t, r), e = !1;
				break;
			}
			if (a !== null && a > r) {
				console.error("THREE.KeyframeTrack: Out of order keys.", this, t, r, a), e = !1;
				break;
			}
			a = r;
		}
		if (r !== void 0 && ss(r)) for (let t = 0, n = r.length; t !== n; ++t) {
			let n = r[t];
			if (isNaN(n)) {
				console.error("THREE.KeyframeTrack: Value is not a valid number.", this, t, n), e = !1;
				break;
			}
		}
		return e;
	}
	optimize() {
		let e = this.times.slice(), t = this.values.slice(), n = this.getValueSize(), r = this.getInterpolation() === R, i = e.length - 1, a = 1;
		for (let o = 1; o < i; ++o) {
			let i = !1, s = e[o];
			if (s !== e[o + 1] && (o !== 1 || s !== e[0])) {
				if (r) i = !0;
				else {
					let e = o * n, r = e - n, a = e + n;
					for (let o = 0; o !== n; ++o) {
						let n = t[e + o];
						if (n !== t[r + o] || n !== t[a + o]) {
							i = !0;
							break;
						}
					}
				}
			}
			if (i) {
				if (o !== a) {
					e[a] = e[o];
					let r = o * n, i = a * n;
					for (let e = 0; e !== n; ++e) t[i + e] = t[r + e];
				}
				++a;
			}
		}
		if (i > 0) {
			e[a] = e[i];
			for (let e = i * n, r = a * n, o = 0; o !== n; ++o) t[r + o] = t[e + o];
			++a;
		}
		return a === e.length ? (this.times = e, this.values = t) : (this.times = e.slice(0, a), this.values = t.slice(0, a * n)), this;
	}
	clone() {
		let e = this.times.slice(), t = this.values.slice(), n = this.constructor, r = new n(this.name, e, t);
		return r.createInterpolant = this.createInterpolant, r;
	}
};
fs.prototype.TimeBufferType = Float32Array, fs.prototype.ValueBufferType = Float32Array, fs.prototype.DefaultInterpolation = pe;
var ps = class extends fs {};
ps.prototype.ValueTypeName = "bool", ps.prototype.ValueBufferType = Array, ps.prototype.DefaultInterpolation = L, ps.prototype.InterpolantFactoryMethodLinear = void 0, ps.prototype.InterpolantFactoryMethodSmooth = void 0;
var ms = class extends fs {};
ms.prototype.ValueTypeName = "color";
var hs = class extends fs {};
hs.prototype.ValueTypeName = "number";
var gs = class extends cs {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	interpolate_(e, t, n, r) {
		let i = this.resultBuffer, a = this.sampleValues, o = this.valueSize, s = (n - t) / (r - t), c = e * o;
		for (let e = c + o; c !== e; c += 4) Ct.slerpFlat(i, 0, a, c - o, a, c, s);
		return i;
	}
}, _s = class extends fs {
	InterpolantFactoryMethodLinear(e) {
		return new gs(this.times, this.values, this.getValueSize(), e);
	}
};
_s.prototype.ValueTypeName = "quaternion", _s.prototype.DefaultInterpolation = pe, _s.prototype.InterpolantFactoryMethodSmooth = void 0;
var vs = class extends fs {};
vs.prototype.ValueTypeName = "string", vs.prototype.ValueBufferType = Array, vs.prototype.DefaultInterpolation = L, vs.prototype.InterpolantFactoryMethodLinear = void 0, vs.prototype.InterpolantFactoryMethodSmooth = void 0;
var ys = class extends fs {};
ys.prototype.ValueTypeName = "vector";
var bs = class extends Tn {
	constructor(e, t = 1) {
		super(), this.isLight = !0, this.type = "Light", this.color = new X(e), this.intensity = t;
	}
	dispose() {}
	copy(e, t) {
		return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
	}
	toJSON(e) {
		let t = super.toJSON(e);
		return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), t;
	}
}, xs = /*@__PURE__*/ new $t(), Ss = /*@__PURE__*/ new Y(), Cs = /*@__PURE__*/ new Y(), ws = class {
	constructor(e) {
		this.camera = e, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new K(512, 512), this.map = null, this.mapPass = null, this.matrix = new $t(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Xr(), this._frameExtents = new K(1, 1), this._viewportCount = 1, this._viewports = [new vt(0, 0, 1, 1)];
	}
	getViewportCount() {
		return this._viewportCount;
	}
	getFrustum() {
		return this._frustum;
	}
	updateMatrices(e) {
		let t = this.camera, n = this.matrix;
		Ss.setFromMatrixPosition(e.matrixWorld), t.position.copy(Ss), Cs.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Cs), t.updateMatrixWorld(), xs.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(xs), n.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), n.multiply(xs);
	}
	getViewport(e) {
		return this._viewports[e];
	}
	getFrameExtents() {
		return this._frameExtents;
	}
	dispose() {
		this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
	}
	copy(e) {
		return this.camera = e.camera.clone(), this.bias = e.bias, this.radius = e.radius, this.mapSize.copy(e.mapSize), this;
	}
	clone() {
		return new this.constructor().copy(this);
	}
	toJSON() {
		let e = {};
		return this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
	}
}, Ts = class extends ws {
	constructor() {
		super(new ci(-5, 5, 5, -5, .5, 500)), this.isDirectionalLightShadow = !0;
	}
}, Es = class extends bs {
	constructor(e, t) {
		super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Tn.DEFAULT_UP), this.updateMatrix(), this.target = new Tn(), this.shadow = new Ts();
	}
	dispose() {
		this.shadow.dispose();
	}
	copy(e) {
		return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
	}
}, Ds = class extends bs {
	constructor(e, t) {
		super(e, t), this.isAmbientLight = !0, this.type = "AmbientLight";
	}
}, Os = class {
	constructor(e = !0) {
		this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1;
	}
	start() {
		this.startTime = ks(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0;
	}
	stop() {
		this.getElapsedTime(), this.running = !1, this.autoStart = !1;
	}
	getElapsedTime() {
		return this.getDelta(), this.elapsedTime;
	}
	getDelta() {
		let e = 0;
		if (this.autoStart && !this.running) return this.start(), 0;
		if (this.running) {
			let t = ks();
			e = (t - this.oldTime) / 1e3, this.oldTime = t, this.elapsedTime += e;
		}
		return e;
	}
};
function ks() {
	return (typeof performance > "u" ? Date : performance).now();
}
var As = "\\[\\]\\.:\\/", js = /* @__PURE__ */ RegExp("[\\[\\]\\.:\\/]", "g"), Ms = "[^\\[\\]\\.:\\/]", Ns = "[^" + As.replace("\\.", "") + "]", Ps = /*@__PURE__*/ "((?:WC+[\\/:])*)".replace("WC", Ms), Fs = /*@__PURE__*/ "(WCOD+)?".replace("WCOD", Ns), Is = /*@__PURE__*/ "(?:\\.(WC+)(?:\\[(.+)\\])?)?".replace("WC", Ms), Ls = /*@__PURE__*/ "\\.(WC+)(?:\\[(.+)\\])?".replace("WC", Ms), Rs = RegExp("^" + Ps + Fs + Is + Ls + "$"), zs = [
	"material",
	"materials",
	"bones",
	"map"
], Bs = class {
	constructor(e, t, n) {
		let r = n || $.parseTrackName(t);
		this._targetGroup = e, this._bindings = e.subscribe_(t, r);
	}
	getValue(e, t) {
		this.bind();
		let n = this._targetGroup.nCachedObjects_, r = this._bindings[n];
		r !== void 0 && r.getValue(e, t);
	}
	setValue(e, t) {
		let n = this._bindings;
		for (let r = this._targetGroup.nCachedObjects_, i = n.length; r !== i; ++r) n[r].setValue(e, t);
	}
	bind() {
		let e = this._bindings;
		for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind();
	}
	unbind() {
		let e = this._bindings;
		for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind();
	}
}, $ = class e {
	constructor(t, n, r) {
		this.path = n, this.parsedPath = r || e.parseTrackName(n), this.node = e.findNode(t, this.parsedPath.nodeName), this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
	}
	static create(t, n, r) {
		return t && t.isAnimationObjectGroup ? new e.Composite(t, n, r) : new e(t, n, r);
	}
	static sanitizeNodeName(e) {
		return e.replace(/\s/g, "_").replace(js, "");
	}
	static parseTrackName(e) {
		let t = Rs.exec(e);
		if (t === null) throw Error("PropertyBinding: Cannot parse trackName: " + e);
		let n = {
			nodeName: t[2],
			objectName: t[3],
			objectIndex: t[4],
			propertyName: t[5],
			propertyIndex: t[6]
		}, r = n.nodeName && n.nodeName.lastIndexOf(".");
		if (r !== void 0 && r !== -1) {
			let e = n.nodeName.substring(r + 1);
			zs.indexOf(e) !== -1 && (n.nodeName = n.nodeName.substring(0, r), n.objectName = e);
		}
		if (n.propertyName === null || n.propertyName.length === 0) throw Error("PropertyBinding: can not parse propertyName from trackName: " + e);
		return n;
	}
	static findNode(e, t) {
		if (t === void 0 || t === "" || t === "." || t === -1 || t === e.name || t === e.uuid) return e;
		if (e.skeleton) {
			let n = e.skeleton.getBoneByName(t);
			if (n !== void 0) return n;
		}
		if (e.children) {
			let n = function(e) {
				for (let r = 0; r < e.length; r++) {
					let i = e[r];
					if (i.name === t || i.uuid === t) return i;
					let a = n(i.children);
					if (a) return a;
				}
				return null;
			}, r = n(e.children);
			if (r) return r;
		}
		return null;
	}
	_getValue_unavailable() {}
	_setValue_unavailable() {}
	_getValue_direct(e, t) {
		e[t] = this.targetObject[this.propertyName];
	}
	_getValue_array(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) e[t++] = n[r];
	}
	_getValue_arrayElement(e, t) {
		e[t] = this.resolvedProperty[this.propertyIndex];
	}
	_getValue_toArray(e, t) {
		this.resolvedProperty.toArray(e, t);
	}
	_setValue_direct(e, t) {
		this.targetObject[this.propertyName] = e[t];
	}
	_setValue_direct_setNeedsUpdate(e, t) {
		this.targetObject[this.propertyName] = e[t], this.targetObject.needsUpdate = !0;
	}
	_setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
		this.targetObject[this.propertyName] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_array(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
	}
	_setValue_array_setNeedsUpdate(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
		this.targetObject.needsUpdate = !0;
	}
	_setValue_array_setMatrixWorldNeedsUpdate(e, t) {
		let n = this.resolvedProperty;
		for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
		this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_arrayElement(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t];
	}
	_setValue_arrayElement_setNeedsUpdate(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.needsUpdate = !0;
	}
	_setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
		this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_setValue_fromArray(e, t) {
		this.resolvedProperty.fromArray(e, t);
	}
	_setValue_fromArray_setNeedsUpdate(e, t) {
		this.resolvedProperty.fromArray(e, t), this.targetObject.needsUpdate = !0;
	}
	_setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
		this.resolvedProperty.fromArray(e, t), this.targetObject.matrixWorldNeedsUpdate = !0;
	}
	_getValue_unbound(e, t) {
		this.bind(), this.getValue(e, t);
	}
	_setValue_unbound(e, t) {
		this.bind(), this.setValue(e, t);
	}
	bind() {
		let t = this.node, n = this.parsedPath, r = n.objectName, i = n.propertyName, a = n.propertyIndex;
		if (t || (t = e.findNode(this.rootNode, n.nodeName), this.node = t), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !t) {
			console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
			return;
		}
		if (r) {
			let e = n.objectIndex;
			switch (r) {
				case "materials":
					if (!t.material) {
						console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
						return;
					}
					if (!t.material.materials) {
						console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
						return;
					}
					t = t.material.materials;
					break;
				case "bones":
					if (!t.skeleton) {
						console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
						return;
					}
					t = t.skeleton.bones;
					for (let n = 0; n < t.length; n++) if (t[n].name === e) {
						e = n;
						break;
					}
					break;
				case "map":
					if ("map" in t) {
						t = t.map;
						break;
					}
					if (!t.material) {
						console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
						return;
					}
					if (!t.material.map) {
						console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
						return;
					}
					t = t.material.map;
					break;
				default:
					if (t[r] === void 0) {
						console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
						return;
					}
					t = t[r];
			}
			if (e !== void 0) {
				if (t[e] === void 0) {
					console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, t);
					return;
				}
				t = t[e];
			}
		}
		let o = t[i];
		if (o === void 0) {
			let e = n.nodeName;
			console.error("THREE.PropertyBinding: Trying to update property for track: " + e + "." + i + " but it wasn't found.", t);
			return;
		}
		let s = this.Versioning.None;
		this.targetObject = t, t.needsUpdate === void 0 ? t.matrixWorldNeedsUpdate !== void 0 && (s = this.Versioning.MatrixWorldNeedsUpdate) : s = this.Versioning.NeedsUpdate;
		let c = this.BindingType.Direct;
		if (a !== void 0) {
			if (i === "morphTargetInfluences") {
				if (!t.geometry) {
					console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
					return;
				}
				if (!t.geometry.morphAttributes) {
					console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
					return;
				}
				t.morphTargetDictionary[a] !== void 0 && (a = t.morphTargetDictionary[a]);
			}
			c = this.BindingType.ArrayElement, this.resolvedProperty = o, this.propertyIndex = a;
		} else o.fromArray !== void 0 && o.toArray !== void 0 ? (c = this.BindingType.HasFromToArray, this.resolvedProperty = o) : Array.isArray(o) ? (c = this.BindingType.EntireArray, this.resolvedProperty = o) : this.propertyName = i;
		this.getValue = this.GetterByBindingType[c], this.setValue = this.SetterByBindingTypeAndVersioning[c][s];
	}
	unbind() {
		this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
	}
};
$.Composite = Bs, $.prototype.BindingType = {
	Direct: 0,
	EntireArray: 1,
	ArrayElement: 2,
	HasFromToArray: 3
}, $.prototype.Versioning = {
	None: 0,
	NeedsUpdate: 1,
	MatrixWorldNeedsUpdate: 2
}, $.prototype.GetterByBindingType = [
	$.prototype._getValue_direct,
	$.prototype._getValue_array,
	$.prototype._getValue_arrayElement,
	$.prototype._getValue_toArray
], $.prototype.SetterByBindingTypeAndVersioning = [
	[
		$.prototype._setValue_direct,
		$.prototype._setValue_direct_setNeedsUpdate,
		$.prototype._setValue_direct_setMatrixWorldNeedsUpdate
	],
	[
		$.prototype._setValue_array,
		$.prototype._setValue_array_setNeedsUpdate,
		$.prototype._setValue_array_setMatrixWorldNeedsUpdate
	],
	[
		$.prototype._setValue_arrayElement,
		$.prototype._setValue_arrayElement_setNeedsUpdate,
		$.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
	],
	[
		$.prototype._setValue_fromArray,
		$.prototype._setValue_fromArray_setNeedsUpdate,
		$.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
	]
], typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: "161" } })), typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = "161");
// ../../node_modules/three/examples/jsm/shaders/CopyShader.js
var Vs = {
	name: "CopyShader",
	uniforms: {
		tDiffuse: { value: null },
		opacity: { value: 1 }
	},
	vertexShader: "\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vUv = uv;\n			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n		}",
	fragmentShader: "\n\n		uniform float opacity;\n\n		uniform sampler2D tDiffuse;\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vec4 texel = texture2D( tDiffuse, vUv );\n			gl_FragColor = opacity * texel;\n\n\n		}"
}, Hs = class {
	constructor() {
		this.isPass = !0, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1;
	}
	setSize() {}
	render() {
		console.error("THREE.Pass: .render() must be implemented in derived pass.");
	}
	dispose() {}
}, Us = new ci(-1, 1, 1, -1, 0, 1), Ws = new class extends ir {
	constructor() {
		super(), this.setAttribute("position", new Xn([
			-1,
			3,
			0,
			-1,
			-1,
			0,
			3,
			-1,
			0
		], 3)), this.setAttribute("uv", new Xn([
			0,
			2,
			0,
			0,
			2,
			0
		], 2));
	}
}(), Gs = class {
	constructor(e) {
		this._mesh = new Sr(Ws, e);
	}
	dispose() {
		this._mesh.geometry.dispose();
	}
	render(e) {
		e.render(this._mesh, Us);
	}
	get material() {
		return this._mesh.material;
	}
	set material(e) {
		this._mesh.material = e;
	}
}, Ks = class extends Hs {
	constructor(e, t) {
		super(), this.textureID = t === void 0 ? "tDiffuse" : t, e instanceof Nr ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = Ar.clone(e.uniforms), this.material = new Nr({
			name: e.name === void 0 ? "unspecified" : e.name,
			defines: Object.assign({}, e.defines),
			uniforms: this.uniforms,
			vertexShader: e.vertexShader,
			fragmentShader: e.fragmentShader
		})), this.fsQuad = new Gs(this.material);
	}
	render(e, t, n) {
		this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = n.texture), this.fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this.fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this.fsQuad.render(e));
	}
	dispose() {
		this.material.dispose(), this.fsQuad.dispose();
	}
}, qs = class extends Hs {
	constructor(e, t) {
		super(), this.scene = e, this.camera = t, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
	}
	render(e, t, n) {
		let r = e.getContext(), i = e.state;
		i.buffers.color.setMask(!1), i.buffers.depth.setMask(!1), i.buffers.color.setLocked(!0), i.buffers.depth.setLocked(!0);
		let a, o;
		this.inverse ? (a = 0, o = 1) : (a = 1, o = 0), i.buffers.stencil.setTest(!0), i.buffers.stencil.setOp(r.REPLACE, r.REPLACE, r.REPLACE), i.buffers.stencil.setFunc(r.ALWAYS, a, 4294967295), i.buffers.stencil.setClear(o), i.buffers.stencil.setLocked(!0), e.setRenderTarget(n), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(t), this.clear && e.clear(), e.render(this.scene, this.camera), i.buffers.color.setLocked(!1), i.buffers.depth.setLocked(!1), i.buffers.color.setMask(!0), i.buffers.depth.setMask(!0), i.buffers.stencil.setLocked(!1), i.buffers.stencil.setFunc(r.EQUAL, 1, 4294967295), i.buffers.stencil.setOp(r.KEEP, r.KEEP, r.KEEP), i.buffers.stencil.setLocked(!0);
	}
}, Js = class extends Hs {
	constructor() {
		super(), this.needsSwap = !1;
	}
	render(e) {
		e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1);
	}
}, Ys = class {
	constructor(e, t) {
		if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), t === void 0) {
			let n = e.getSize(new K());
			this._width = n.width, this._height = n.height, t = new bt(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: le }), t.texture.name = "EffectComposer.rt1";
		} else this._width = t.width, this._height = t.height;
		this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new Ks(Vs), this.copyPass.material.blending = 0, this.clock = new Os();
	}
	swapBuffers() {
		let e = this.readBuffer;
		this.readBuffer = this.writeBuffer, this.writeBuffer = e;
	}
	addPass(e) {
		this.passes.push(e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}
	insertPass(e, t) {
		this.passes.splice(t, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}
	removePass(e) {
		let t = this.passes.indexOf(e);
		t !== -1 && this.passes.splice(t, 1);
	}
	isLastEnabledPass(e) {
		for (let t = e + 1; t < this.passes.length; t++) if (this.passes[t].enabled) return !1;
		return !0;
	}
	render(e) {
		e === void 0 && (e = this.clock.getDelta());
		let t = this.renderer.getRenderTarget(), n = !1;
		for (let t = 0, r = this.passes.length; t < r; t++) {
			let r = this.passes[t];
			if (r.enabled !== !1) {
				if (r.renderToScreen = this.renderToScreen && this.isLastEnabledPass(t), r.render(this.renderer, this.writeBuffer, this.readBuffer, e, n), r.needsSwap) {
					if (n) {
						let t = this.renderer.getContext(), n = this.renderer.state.buffers.stencil;
						n.setFunc(t.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), n.setFunc(t.EQUAL, 1, 4294967295);
					}
					this.swapBuffers();
				}
				qs !== void 0 && (r instanceof qs ? n = !0 : r instanceof Js && (n = !1));
			}
		}
		this.renderer.setRenderTarget(t);
	}
	reset(e) {
		if (e === void 0) {
			let t = this.renderer.getSize(new K());
			this._pixelRatio = this.renderer.getPixelRatio(), this._width = t.width, this._height = t.height, e = this.renderTarget1.clone(), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
		}
		this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
	}
	setSize(e, t) {
		this._width = e, this._height = t;
		let n = this._width * this._pixelRatio, r = this._height * this._pixelRatio;
		this.renderTarget1.setSize(n, r), this.renderTarget2.setSize(n, r);
		for (let e = 0; e < this.passes.length; e++) this.passes[e].setSize(n, r);
	}
	setPixelRatio(e) {
		this._pixelRatio = e, this.setSize(this._width, this._height);
	}
	dispose() {
		this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
	}
}, Xs = class extends Hs {
	constructor(e, t, n, r = {}) {
		super(), this.pixelSize = e, this.resolution = new K(), this.renderResolution = new K(), this.pixelatedMaterial = this.createPixelatedMaterial(), this.normalMaterial = new as(), this.fsQuad = new Gs(this.pixelatedMaterial), this.scene = t, this.camera = n, this.normalEdgeStrength = r.normalEdgeStrength || .3, this.depthEdgeStrength = r.depthEdgeStrength || .4, this.beautyRenderTarget = new bt(), this.beautyRenderTarget.texture.minFilter = P, this.beautyRenderTarget.texture.magFilter = P, this.beautyRenderTarget.texture.type = le, this.beautyRenderTarget.depthTexture = new Li(), this.normalRenderTarget = new bt(), this.normalRenderTarget.texture.minFilter = P, this.normalRenderTarget.texture.magFilter = P, this.normalRenderTarget.texture.type = le;
	}
	dispose() {
		this.beautyRenderTarget.dispose(), this.normalRenderTarget.dispose(), this.pixelatedMaterial.dispose(), this.normalMaterial.dispose(), this.fsQuad.dispose();
	}
	setSize(e, t) {
		this.resolution.set(e, t), this.renderResolution.set(e / this.pixelSize | 0, t / this.pixelSize | 0);
		let { x: n, y: r } = this.renderResolution;
		this.beautyRenderTarget.setSize(n, r), this.normalRenderTarget.setSize(n, r), this.fsQuad.material.uniforms.resolution.value.set(n, r, 1 / n, 1 / r);
	}
	setPixelSize(e) {
		this.pixelSize = e, this.setSize(this.resolution.x, this.resolution.y);
	}
	render(e, t) {
		let n = this.fsQuad.material.uniforms;
		n.normalEdgeStrength.value = this.normalEdgeStrength, n.depthEdgeStrength.value = this.depthEdgeStrength, e.setRenderTarget(this.beautyRenderTarget), e.render(this.scene, this.camera);
		let r = this.scene.overrideMaterial;
		e.setRenderTarget(this.normalRenderTarget), this.scene.overrideMaterial = this.normalMaterial, e.render(this.scene, this.camera), this.scene.overrideMaterial = r, n.tDiffuse.value = this.beautyRenderTarget.texture, n.tDepth.value = this.beautyRenderTarget.depthTexture, n.tNormal.value = this.normalRenderTarget.texture, this.renderToScreen ? e.setRenderTarget(null) : (e.setRenderTarget(t), this.clear && e.clear()), this.fsQuad.render(e);
	}
	createPixelatedMaterial() {
		return new Nr({
			uniforms: {
				tDiffuse: { value: null },
				tDepth: { value: null },
				tNormal: { value: null },
				resolution: { value: new vt(this.renderResolution.x, this.renderResolution.y, 1 / this.renderResolution.x, 1 / this.renderResolution.y) },
				normalEdgeStrength: { value: 0 },
				depthEdgeStrength: { value: 0 }
			},
			vertexShader: "\n				varying vec2 vUv;\n\n				void main() {\n\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n				}\n			",
			fragmentShader: "\n				uniform sampler2D tDiffuse;\n				uniform sampler2D tDepth;\n				uniform sampler2D tNormal;\n				uniform vec4 resolution;\n				uniform float normalEdgeStrength;\n				uniform float depthEdgeStrength;\n				varying vec2 vUv;\n\n				float getDepth(int x, int y) {\n\n					return texture2D( tDepth, vUv + vec2(x, y) * resolution.zw ).r;\n\n				}\n\n				vec3 getNormal(int x, int y) {\n\n					return texture2D( tNormal, vUv + vec2(x, y) * resolution.zw ).rgb * 2.0 - 1.0;\n\n				}\n\n				float depthEdgeIndicator(float depth, vec3 normal) {\n\n					float diff = 0.0;\n					diff += clamp(getDepth(1, 0) - depth, 0.0, 1.0);\n					diff += clamp(getDepth(-1, 0) - depth, 0.0, 1.0);\n					diff += clamp(getDepth(0, 1) - depth, 0.0, 1.0);\n					diff += clamp(getDepth(0, -1) - depth, 0.0, 1.0);\n					return floor(smoothstep(0.01, 0.02, diff) * 2.) / 2.;\n\n				}\n\n				float neighborNormalEdgeIndicator(int x, int y, float depth, vec3 normal) {\n\n					float depthDiff = getDepth(x, y) - depth;\n					vec3 neighborNormal = getNormal(x, y);\n\n					// Edge pixels should yield to faces who's normals are closer to the bias normal.\n					vec3 normalEdgeBias = vec3(1., 1., 1.); // This should probably be a parameter.\n					float normalDiff = dot(normal - neighborNormal, normalEdgeBias);\n					float normalIndicator = clamp(smoothstep(-.01, .01, normalDiff), 0.0, 1.0);\n\n					// Only the shallower pixel should detect the normal edge.\n					float depthIndicator = clamp(sign(depthDiff * .25 + .0025), 0.0, 1.0);\n\n					return (1.0 - dot(normal, neighborNormal)) * depthIndicator * normalIndicator;\n\n				}\n\n				float normalEdgeIndicator(float depth, vec3 normal) {\n\n					float indicator = 0.0;\n\n					indicator += neighborNormalEdgeIndicator(0, -1, depth, normal);\n					indicator += neighborNormalEdgeIndicator(0, 1, depth, normal);\n					indicator += neighborNormalEdgeIndicator(-1, 0, depth, normal);\n					indicator += neighborNormalEdgeIndicator(1, 0, depth, normal);\n\n					return step(0.1, indicator);\n\n				}\n\n				void main() {\n\n					vec4 texel = texture2D( tDiffuse, vUv );\n\n					float depth = 0.0;\n					vec3 normal = vec3(0.0);\n\n					if (depthEdgeStrength > 0.0 || normalEdgeStrength > 0.0) {\n\n						depth = getDepth(0, 0);\n						normal = getNormal(0, 0);\n\n					}\n\n					float dei = 0.0;\n					if (depthEdgeStrength > 0.0)\n						dei = depthEdgeIndicator(depth, normal);\n\n					float nei = 0.0;\n					if (normalEdgeStrength > 0.0)\n						nei = normalEdgeIndicator(depth, normal);\n\n					float Strength = dei > 0.0 ? (1.0 - depthEdgeStrength * dei) : (1.0 + normalEdgeStrength * nei);\n\n					gl_FragColor = texel * Strength;\n\n				}\n			"
		});
	}
}, Zs = {
	name: "OutputShader",
	uniforms: {
		tDiffuse: { value: null },
		toneMappingExposure: { value: 1 }
	},
	vertexShader: "\n		precision highp float;\n\n		uniform mat4 modelViewMatrix;\n		uniform mat4 projectionMatrix;\n\n		attribute vec3 position;\n		attribute vec2 uv;\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vUv = uv;\n			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n		}",
	fragmentShader: "\n	\n		precision highp float;\n\n		uniform sampler2D tDiffuse;\n\n		#include <tonemapping_pars_fragment>\n		#include <colorspace_pars_fragment>\n\n		varying vec2 vUv;\n\n		void main() {\n\n			gl_FragColor = texture2D( tDiffuse, vUv );\n\n			// tone mapping\n\n			#ifdef LINEAR_TONE_MAPPING\n\n				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );\n\n			#elif defined( REINHARD_TONE_MAPPING )\n\n				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );\n\n			#elif defined( CINEON_TONE_MAPPING )\n\n				gl_FragColor.rgb = OptimizedCineonToneMapping( gl_FragColor.rgb );\n\n			#elif defined( ACES_FILMIC_TONE_MAPPING )\n\n				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );\n\n			#elif defined( AGX_TONE_MAPPING )\n\n				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );\n\n			#endif\n\n			// color space\n\n			#ifdef SRGB_TRANSFER\n\n				gl_FragColor = sRGBTransferOETF( gl_FragColor );\n\n			#endif\n\n		}"
}, Qs = class extends Hs {
	constructor() {
		super();
		let e = Zs;
		this.uniforms = Ar.clone(e.uniforms), this.material = new is({
			name: e.name,
			uniforms: this.uniforms,
			vertexShader: e.vertexShader,
			fragmentShader: e.fragmentShader
		}), this.fsQuad = new Gs(this.material), this._outputColorSpace = null, this._toneMapping = null;
	}
	render(e, t, n) {
		this.uniforms.tDiffuse.value = n.texture, this.uniforms.toneMappingExposure.value = e.toneMappingExposure, (this._outputColorSpace !== e.outputColorSpace || this._toneMapping !== e.toneMapping) && (this._outputColorSpace = e.outputColorSpace, this._toneMapping = e.toneMapping, this.material.defines = {}, J.getTransfer(this._outputColorSpace) === "srgb" && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === 1 ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === 2 ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === 3 ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === 4 ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === 6 && (this.material.defines.AGX_TONE_MAPPING = ""), this.material.needsUpdate = !0), this.renderToScreen === !0 ? (e.setRenderTarget(null), this.fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this.fsQuad.render(e));
	}
	dispose() {
		this.material.dispose(), this.fsQuad.dispose();
	}
}, $s = 6, ec = "#1f1f24", tc = "#1f1f24", nc = 16777215, rc = .07, ic = 6, ac = 45, oc = 2 * Math.sqrt(45) * .7, sc = {
	x: .25,
	y: .45
}, cc = .012, lc = .8;
function uc() {
	let e = l(null);
	return c(() => {
		let t = e.current;
		if (!t) return;
		let n = new ts({ antialias: !1 });
		n.setPixelRatio(1);
		let r = n.domElement;
		r.style.width = "100%", r.style.height = "100%", r.style.display = "block", t.appendChild(r);
		let i = new rs();
		i.background = new X(ec);
		let a = new Rr(ac, 1, .1, 100);
		a.position.z = ic, i.add(new Ds(16777215, .6));
		let o = new Es(16777215, 2.2);
		o.position.set(3, 4, 5), i.add(o);
		let s = new Tr(2, 2, 2), c = new Wn({ color: tc }), l = new Sr(s, c), u = 2.07, d = [
			new Tr(u, rc, rc),
			new Tr(rc, u, rc),
			new Tr(rc, rc, u)
		], f = new Wn({ color: nc });
		for (let e = 0; e < 3; e++) {
			let [t, n] = [
				0,
				1,
				2
			].filter((t) => t !== e);
			for (let r of [-1, 1]) for (let i of [-1, 1]) {
				let a = new Sr(d[e], f);
				a.position.setComponent(t, r), a.position.setComponent(n, i), l.add(a);
			}
		}
		l.rotation.set(.5, .7, 0), i.add(l);
		let p = new Ys(n), m = new Xs($s, i, a, {
			normalEdgeStrength: .4,
			depthEdgeStrength: .5
		});
		p.addPass(m), p.addPass(new Qs());
		let h = 1, g = 1, _ = () => {
			let e = Math.max(1, t.clientWidth), r = Math.max(1, t.clientHeight);
			n.setSize(e, r, !1), p.setSize(e, r), a.aspect = e / r, a.updateProjectionMatrix(), g = Math.tan(Qe.degToRad(ac / 2)) * ic, h = g * a.aspect;
		}, v = new ResizeObserver(_);
		v.observe(t), _();
		let y = !1, b = {
			x: 0,
			y: 0
		}, x = {
			x: 0,
			y: 0
		}, S = {
			x: 0,
			y: 0
		}, C = {
			x: sc.x,
			y: sc.y
		}, w = (e) => {
			let n = t.getBoundingClientRect();
			return {
				x: ((e.clientX - n.left) / n.width * 2 - 1) * h,
				y: (-((e.clientY - n.top) / n.height) * 2 + 1) * g
			};
		}, T = (e) => {
			if (e.button !== 0) return;
			y = !0, r.setPointerCapture(e.pointerId), b = {
				x: e.clientX,
				y: e.clientY
			};
			let t = w(e);
			x = {
				x: t.x - l.position.x,
				y: t.y - l.position.y
			}, S.x = 0, S.y = 0;
		}, E = (e) => {
			if (!y) return;
			let t = e.clientX - b.x, n = e.clientY - b.y;
			b = {
				x: e.clientX,
				y: e.clientY
			}, l.rotation.y += t * cc, l.rotation.x += n * cc, C.y = t * cc * 60, C.x = n * cc * 60;
			let r = w(e);
			l.position.x = Qe.clamp(r.x - x.x, -h * lc, h * lc), l.position.y = Qe.clamp(r.y - x.y, -g * lc, g * lc);
		}, D = (e) => {
			y = !1, r.hasPointerCapture(e.pointerId) && r.releasePointerCapture(e.pointerId);
		};
		r.style.touchAction = "none", r.style.cursor = "grab", r.addEventListener("pointerdown", T), r.addEventListener("pointermove", E), r.addEventListener("pointerup", D), r.addEventListener("pointercancel", D);
		let O = 0, k = performance.now(), A = (e) => {
			O = requestAnimationFrame(A);
			let t = Math.min((e - k) / 1e3, .05);
			if (k = e, !y) {
				for (let e of ["x", "y"]) {
					let n = -45 * l.position[e] - oc * S[e];
					S[e] += n * t, l.position[e] += S[e] * t;
				}
				let e = 1 - Math.exp(-2.5 * t);
				C.x += (sc.x - C.x) * e, C.y += (sc.y - C.y) * e, l.rotation.x += C.x * t, l.rotation.y += C.y * t;
			}
			p.render();
		};
		return O = requestAnimationFrame(A), () => {
			cancelAnimationFrame(O), v.disconnect(), r.removeEventListener("pointerdown", T), r.removeEventListener("pointermove", E), r.removeEventListener("pointerup", D), r.removeEventListener("pointercancel", D), m.dispose(), p.dispose(), s.dispose(), c.dispose(), n.dispose(), r.remove();
		};
	}, []), /* @__PURE__ */ f("div", {
		ref: e,
		style: {
			position: "absolute",
			inset: 0
		}
	});
}
// src/ui/UseSocial.ts
var dc = "blenderpds:user", fc = 15e3;
function pc() {
	try {
		let e = localStorage.getItem(dc);
		if (!e) return null;
		let t = JSON.parse(e);
		return typeof t?.id == "number" && typeof t?.name == "string" ? t : null;
	} catch {
		return null;
	}
}
function mc(e) {
	try {
		e ? localStorage.setItem(dc, JSON.stringify(e)) : localStorage.removeItem(dc);
	} catch {}
}
function hc(e) {
	if (e instanceof m) switch (e.status) {
		case 400: return "Check the fields and try again.";
		case 401: return "Invalid e-mail or password.";
		case 403: return "You are not allowed to do that.";
		case 404: return "Not found.";
		case 409: return "That conflicts with something already on the server.";
		default: return e.message;
	}
	return "Could not reach the server. Is the backend running?";
}
function gc() {
	let [e, t] = u(pc), [n, r] = u([]), [i, a] = u([]), [s, l] = u(!1), d = o(() => {
		mc(null), t(null), r([]), a([]);
	}, []), f = o(async () => {
		if (e) {
			l(!0);
			try {
				let [t, n, i] = await Promise.all([
					w(e.id),
					C(e.id),
					T(e.id)
				]), o = new Set(i.map((e) => e.hostId));
				r(t.map((e) => ({
					id: e.id,
					name: e.nickname,
					status: o.has(e.id) ? "hosting" : "offline"
				}))), a(n.map((e) => ({
					id: e.id,
					name: e.senderNickname
				})));
			} catch (e) {
				e instanceof m && e.status === 401 && d();
			} finally {
				l(!1);
			}
		}
	}, [e, d]);
	return c(() => {
		if (!e) return;
		f();
		let t = window.setInterval(() => {
			f();
		}, fc);
		return () => window.clearInterval(t);
	}, [e, f]), {
		user: e,
		friends: n,
		requests: i,
		loading: s,
		login: o(async (e, n) => {
			try {
				let r = await D(e.trim(), n), i = {
					id: r.id,
					name: r.nickname,
					email: r.email
				};
				return mc(i), t(i), null;
			} catch (e) {
				return hc(e);
			}
		}, []),
		register: o(async (e, t, n) => {
			try {
				return await k(e.trim(), t.trim(), n), null;
			} catch (e) {
				return e instanceof m && e.status === 409 ? "That e-mail is already registered." : hc(e);
			}
		}, []),
		logout: o(async () => {
			try {
				await O();
			} catch {}
			d();
		}, [d]),
		addFriend: o(async (t) => {
			if (!e) return "Sign in first.";
			let n = t.trim();
			if (n === "") return "Type a nickname.";
			try {
				let t = await y(n);
				return t ? t.id === e.id ? "That is you." : (await M(e.id, t.id), null) : `No user called ${n}.`;
			} catch (e) {
				return e instanceof m && e.status === 409 ? `You already have a pending request with ${n} (or you are already friends).` : e instanceof m && e.status === 403 ? "Confirm your e-mail before adding friends." : hc(e);
			}
		}, [e]),
		removeFriend: o(async (t) => {
			if (!e) return "Sign in first.";
			try {
				return await j(e.id, t), await f(), null;
			} catch (e) {
				return hc(e);
			}
		}, [e, f]),
		acceptRequest: o(async (t) => {
			if (!e) return "Sign in first.";
			try {
				return await _(e.id, t), await f(), null;
			} catch (e) {
				return hc(e);
			}
		}, [e, f]),
		declineRequest: o(async (t) => {
			if (!e) return "Sign in first.";
			try {
				return await A(e.id, t), await f(), null;
			} catch (e) {
				return hc(e);
			}
		}, [e, f]),
		refresh: f
	};
}
// src/ui/SocialContext.tsx
var _c = a(null);
function vc({ children: e }) {
	let t = gc();
	return /* @__PURE__ */ f(_c.Provider, {
		value: t,
		children: e
	});
}
function yc() {
	let e = s(_c);
	if (!e) throw Error("useSocialContext must be used inside <SocialProvider>.");
	return e;
}
// src/ui/SocialUI.tsx
var bc = "#e8863a", xc = {
	hosting: bc,
	online: "#3ddc84",
	offline: "#6b6b76"
}, Sc = {
	hosting: "Hosting a session",
	online: "Online",
	offline: "Offline"
}, Cc = {
	width: "100%",
	boxSizing: "border-box",
	padding: 8,
	background: "#1a1a1a",
	color: "#fff",
	border: "1px solid #5a5a66",
	borderRadius: 6,
	fontSize: 14
}, wc = {
	margin: 0,
	color: "#9a9aa6",
	fontSize: 13
}, Tc = {
	padding: "4px 10px",
	fontSize: 12
};
function Ec({ name: e, status: t, size: n = 36 }) {
	let r = 0;
	for (let t of e) r = (r * 31 + t.charCodeAt(0)) % 360;
	return /* @__PURE__ */ p("div", {
		style: {
			position: "relative",
			flexShrink: 0,
			width: n,
			height: n,
			borderRadius: "50%",
			background: `hsl(${r} 55% 42%)`,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontWeight: "bold",
			fontSize: n * .42
		},
		children: [e.charAt(0).toUpperCase(), t && /* @__PURE__ */ f("span", { style: {
			position: "absolute",
			right: -2,
			bottom: -2,
			width: 11,
			height: 11,
			borderRadius: "50%",
			background: xc[t],
			border: "2px solid #141418"
		} })]
	});
}
// src/ui/LobbyTopBar.tsx
function Dc() {
	let e = r(), { user: t, logout: n } = yc();
	return /* @__PURE__ */ p("div", {
		className: "lobby-topbar",
		children: [/* @__PURE__ */ f("button", {
			className: "lobby-brand",
			onClick: () => e("/"),
			children: "BLENDERPDS"
		}), t ? /* @__PURE__ */ p("div", {
			className: "lobby-user",
			children: [
				/* @__PURE__ */ f(Ec, {
					name: t.name,
					size: 28
				}),
				/* @__PURE__ */ f("span", { children: t.name }),
				/* @__PURE__ */ f("button", {
					className: "lobby-link",
					onClick: n,
					children: "Sign out"
				})
			]
		}) : /* @__PURE__ */ f("button", {
			className: "lobby-link",
			onClick: () => e("/login"),
			children: "Sign in"
		})]
	});
}
// src/ui/Lobby.tsx
var Oc = {
	position: "fixed",
	inset: 0,
	zIndex: 100,
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-start",
	paddingLeft: "8vw",
	background: "#1f1f24",
	color: "#fff"
}, kc = {
	position: "relative",
	zIndex: 1,
	width: "min(420px, 90vw)",
	boxSizing: "border-box",
	padding: 24,
	background: "rgba(20, 20, 24, 0.8)",
	border: "1px solid #444",
	borderRadius: 10
}, Ac = {
	...kc,
	width: "min(460px, 90vw)",
	padding: 0,
	background: "transparent",
	border: "none",
	borderRadius: 0
}, jc = "\n#lobby button {\n    padding: 10px 14px;\n    background: #2e2e36;\n    color: #fff;\n    border: 1px solid #5a5a66;\n    border-radius: 6px;\n    font-size: 14px;\n    cursor: pointer;\n    transition: background 0.15s, border-color 0.15s;\n}\n#lobby button:hover { background: #3d3d48; border-color: #e8863a; }\n\n@keyframes lobby-page-in {\n    from { opacity: 0; transform: translateY(8px); }\n    to   { opacity: 1; transform: none; }\n}\n\n/* Every route change remounts .lobby-page (it is keyed by the path), which replays this. */\n.lobby-page {\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n    animation: lobby-page-in 0.2s ease-out;\n}\n/* The menu animates block by block instead of as a whole. */\n.lobby-page--menu { gap: 12px; animation: none; }\n\n/* ---- top bar ---- */\n.lobby-topbar {\n    position: absolute;\n    top: 0; left: 0; right: 0;\n    height: 56px;\n    padding: 0 24px;\n    box-sizing: border-box;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.12);\n    z-index: 2;\n    /* The bar is see-through to the mouse so the cube can still be dragged beneath it. */\n    pointer-events: none;\n}\n.lobby-topbar > * { pointer-events: auto; }\n.lobby-user { display: flex; align-items: center; gap: 10px; font-size: 14px; }\n\n#lobby .lobby-brand {\n    margin: 0; padding: 0;\n    background: none; border: none; border-radius: 0;\n    font-size: 15px; font-weight: bold; letter-spacing: 0.35em;\n}\n#lobby .lobby-brand:hover { background: none; color: #e8863a; }\n\n#lobby .lobby-link {\n    margin: 0; padding: 4px 8px;\n    background: none; border: none; border-radius: 0;\n    color: #9a9aa6; font-size: 13px;\n}\n#lobby .lobby-link:hover { background: none; color: #fff; text-decoration: underline; }\n\n/* ---- menu blocks ---- */\n#lobby .menu-block {\n    display: flex;\n    flex-direction: column;\n    align-items: flex-start;\n    gap: 4px;\n    width: 100%;\n    margin: 0;\n    padding: 18px 22px;\n    text-align: left;\n    background: rgba(20, 20, 24, 0.72);\n    border: none;\n    border-left: 3px solid #444;\n    border-radius: 0;\n    animation: lobby-page-in 0.3s ease-out both;\n    transition: transform 0.15s, background 0.15s, border-color 0.15s;\n}\n#lobby .menu-block:hover {\n    background: rgba(40, 40, 48, 0.88);\n    border-left-color: #e8863a;\n    transform: translateX(8px);\n}\n#lobby .menu-block--primary { border-left-color: #e8863a; }\n\n.menu-block-title {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    font-size: 20px;\n    font-weight: bold;\n    letter-spacing: 0.15em;\n}\n.menu-block-hint { font-size: 13px; color: #9a9aa6; }\n.menu-badge {\n    padding: 2px 8px;\n    background: #e8863a;\n    color: #111;\n    border-radius: 10px;\n    font-size: 11px;\n    letter-spacing: 0.05em;\n}\n\n/* ---- leaving for the editor: everything fades to the plain background colour ---- */\n#lobby > * { transition: opacity 0.3s ease-in; }\n#lobby.lobby--leaving { pointer-events: none; }\n#lobby.lobby--leaving > * { opacity: 0; }\n\n@media (prefers-reduced-motion: reduce) {\n    #lobby > * { transition: none; }\n    .lobby-page, #lobby .menu-block { animation: none; }\n    #lobby .menu-block:hover { transform: none; }\n}\n";
function Mc({ onStart: e, leaving: r = !1 }) {
	let i = n(), a = { onStart: e }, o = i.pathname === "/";
	return /* @__PURE__ */ p("div", {
		id: "lobby",
		className: r ? "lobby--leaving" : void 0,
		style: Oc,
		children: [
			/* @__PURE__ */ f("style", { children: jc }),
			/* @__PURE__ */ f(uc, {}),
			/* @__PURE__ */ f(Dc, {}),
			/* @__PURE__ */ f("div", {
				style: o ? Ac : kc,
				children: /* @__PURE__ */ f("div", {
					className: `lobby-page${o ? " lobby-page--menu" : ""}`,
					children: /* @__PURE__ */ f(t, { context: a })
				}, i.pathname)
			})
		]
	});
}
// src/ui/LobbyShared.ts
var Nc = () => i(), Pc = { margin: 0 }, Fc = { margin: 0 }, Ic = {
	width: "100%",
	boxSizing: "border-box",
	background: "#1a1a1a",
	color: "#fff",
	border: "1px solid #666",
	fontFamily: "monospace",
	fontSize: 11
}, Lc = (e) => {
	navigator.clipboard?.writeText(e);
};
// src/ui/MenuPage.tsx
function Rc({ title: e, hint: t, index: n, onClick: r, badge: i }) {
	return /* @__PURE__ */ p("button", {
		className: "menu-block",
		style: { animationDelay: `${n * 60}ms` },
		onClick: r,
		children: [/* @__PURE__ */ p("span", {
			className: "menu-block-title",
			children: [e, i && /* @__PURE__ */ f("span", {
				className: "menu-badge",
				children: i
			})]
		}), /* @__PURE__ */ f("span", {
			className: "menu-block-hint",
			children: t
		})]
	});
}
function zc() {
	let e = r(), { onStart: t } = Nc(), { user: n, requests: i } = yc();
	return /* @__PURE__ */ p(d, { children: [
		/* @__PURE__ */ f("p", {
			style: {
				...Pc,
				color: "#9a9aa6"
			},
			children: "Collaborative 3D modeling."
		}),
		/* @__PURE__ */ f(Rc, {
			index: 0,
			title: "HOST",
			hint: "Create a session and invite a partner",
			onClick: () => e("/host")
		}),
		/* @__PURE__ */ f(Rc, {
			index: 1,
			title: "JOIN",
			hint: "Enter an invite code",
			onClick: () => e("/join")
		}),
		/* @__PURE__ */ f(Rc, {
			index: 2,
			title: "FRIENDS",
			hint: n ? "See who is online and join them" : "Sign in to play with friends",
			badge: n && i.length > 0 ? `${i.length} new` : void 0,
			onClick: () => e("/friends")
		}),
		/* @__PURE__ */ f(Rc, {
			index: 3,
			title: "OFFLINE",
			hint: "Work alone, no connection",
			onClick: () => t(null)
		})
	] });
}
// src/ui/HostPage.tsx
var Bc = 3e3;
async function Vc(e) {
	let t = await b(e);
	if (t) return t;
	try {
		return await v(e);
	} catch (t) {
		if (t instanceof m && t.status === 409) {
			let t = await b(e);
			if (t) return t;
		}
		throw t;
	}
}
function Hc() {
	let t = r(), { onStart: n } = Nc(), { user: i } = yc(), [a, s] = u(null), [m, h] = u([]), [_, v] = u(""), [y, b] = u(!1), x = l(!1), C = l(null);
	c(() => {
		if (!i) return;
		let e = !1;
		return C.current?.userId !== i.id && (C.current = {
			userId: i.id,
			session: Vc(i.id)
		}), C.current.session.then((t) => {
			e || s(t);
		}).catch((t) => {
			e || (C.current = null, v(t instanceof Error ? t.message : "Could not open a session."));
		}), () => {
			e = !0;
		};
	}, [i]), c(() => {
		if (!a) return;
		let e = !1, t = async () => {
			try {
				let t = await E(a.id);
				e || h(t);
			} catch {}
		};
		t();
		let n = window.setInterval(t, Bc);
		return () => {
			e = !0, window.clearInterval(n);
		};
	}, [a]);
	let w = o(async () => {
		if (a && i && !x.current) {
			x.current = !0, b(!0), v("");
			try {
				await S(a.id, i.id);
				let e = new g(g.urlFor(a.id, i.id));
				n({
					role: "host",
					transport: e,
					sessionId: a.id,
					userId: i.id
				});
			} catch (e) {
				x.current = !1, b(!1), v(e instanceof Error ? e.message : "Could not start the session.");
			}
		}
	}, [
		a,
		i,
		n
	]);
	if (!i) return /* @__PURE__ */ f(e, {
		to: "/login",
		replace: !0,
		state: { from: "/host" }
	});
	let T = m.filter((e) => e.active);
	return /* @__PURE__ */ p(d, { children: [
		/* @__PURE__ */ f("h2", {
			style: Fc,
			children: "Hosting"
		}),
		!a && _ === "" && /* @__PURE__ */ f("p", {
			style: Pc,
			children: "Opening a session..."
		}),
		a && /* @__PURE__ */ p(d, { children: [
			/* @__PURE__ */ f("p", {
				style: Pc,
				children: "Share this code with a friend, or just wait for them to see you in Friends:"
			}),
			/* @__PURE__ */ f("textarea", {
				readOnly: !0,
				rows: 1,
				value: a.code,
				style: Ic,
				onFocus: (e) => e.target.select()
			}),
			/* @__PURE__ */ f("button", {
				onClick: () => Lc(a.code),
				children: "Copy code"
			}),
			/* @__PURE__ */ f("div", {
				style: {
					...wc,
					textTransform: "uppercase",
					letterSpacing: 1
				},
				children: `In the session (${m.length}/${a.maxParticipants})`
			}),
			/* @__PURE__ */ f("p", {
				style: Pc,
				children: T.length <= 1 ? "Nobody else is connected yet." : `${T.filter((e) => e.userId !== i.id).map((e) => e.nickname).join(", ")} connected.`
			}),
			/* @__PURE__ */ f("button", {
				onClick: w,
				disabled: y,
				style: {
					background: "#e8863a",
					borderColor: "#e8863a",
					color: "#111",
					fontWeight: "bold"
				},
				children: y ? "Starting..." : "Start editing"
			})
		] }),
		_ !== "" && /* @__PURE__ */ f("p", {
			style: {
				...Pc,
				color: "#ff7b7b"
			},
			children: _
		}),
		/* @__PURE__ */ f("button", {
			onClick: () => t("/"),
			children: "Back"
		})
	] });
}
// src/ui/JoinPage.tsx
function Uc() {
	let t = r(), { onStart: n } = Nc(), { user: i } = yc(), [a, s] = u(""), [c, l] = u(null), [m, h] = u(""), [_, v] = u(!1), y = o(async () => {
		h(""), l(null), v(!0);
		try {
			l(await x(a));
		} catch {
			h("No open session with that code.");
		} finally {
			v(!1);
		}
	}, [a]), b = o(async () => {
		if (c && i) {
			h(""), v(!0);
			try {
				await S(c.id, i.id);
				let e = new g(g.urlFor(c.id, i.id));
				n({
					role: "guest",
					transport: e,
					sessionId: c.id,
					userId: i.id
				});
			} catch (e) {
				v(!1), h(e instanceof Error ? e.message : "Could not join that session.");
			}
		}
	}, [
		c,
		i,
		n
	]);
	return i ? /* @__PURE__ */ p(d, { children: [
		/* @__PURE__ */ f("h2", {
			style: Fc,
			children: "Joining"
		}),
		c === null ? /* @__PURE__ */ p(d, { children: [
			/* @__PURE__ */ f("p", {
				style: Pc,
				children: "1. Paste the session code the host gave you:"
			}),
			/* @__PURE__ */ f("textarea", {
				rows: 2,
				value: a,
				style: Ic,
				onChange: (e) => s(e.target.value)
			}),
			/* @__PURE__ */ f("button", {
				onClick: y,
				disabled: _ || a.trim() === "",
				children: _ ? "Looking it up..." : "Find session"
			})
		] }) : /* @__PURE__ */ p(d, { children: [
			/* @__PURE__ */ f("p", {
				style: Pc,
				children: `${c.hostNickname} is hosting (${c.participantCount}/${c.maxParticipants} in the session).`
			}),
			/* @__PURE__ */ f("button", {
				onClick: b,
				disabled: _,
				style: {
					background: "#e8863a",
					borderColor: "#e8863a",
					color: "#111",
					fontWeight: "bold"
				},
				children: _ ? "Joining..." : "Join session"
			}),
			/* @__PURE__ */ f("button", {
				onClick: () => l(null),
				children: "Another code"
			})
		] }),
		m !== "" && /* @__PURE__ */ f("p", {
			style: {
				...Pc,
				color: "#ff7b7b"
			},
			children: m
		}),
		/* @__PURE__ */ f("button", {
			onClick: () => t("/"),
			children: "Back"
		})
	] }) : /* @__PURE__ */ f(e, {
		to: "/login",
		replace: !0,
		state: { from: "/join" }
	});
}
// src/ui/AuthPanel.tsx
var Wc = (e) => ({
	flex: 1,
	background: "transparent",
	border: "none",
	borderBottom: `2px solid ${e ? bc : "#444"}`,
	borderRadius: 0,
	color: e ? "#fff" : "#9aa0a6"
});
function Gc({ social: e, onDone: t }) {
	let [n, r] = u("login"), [i, a] = u(""), [o, s] = u(""), [c, l] = u(""), [d, m] = u(""), [h, g] = u(""), [_, v] = u(""), [y, b] = u(!1), x = (e) => {
		r(e), g(""), v("");
	};
	return /* @__PURE__ */ p("form", {
		onSubmit: async (r) => {
			if (r.preventDefault(), g(""), v(""), o.trim() === "") {
				g("Type your e-mail.");
				return;
			}
			if (n === "register" && i.trim().length < 3) {
				g("The nickname needs at least 3 characters.");
				return;
			}
			if (n === "register" && c !== d) {
				g("Passwords do not match.");
				return;
			}
			b(!0);
			let a = n === "login" ? await e.login(o, c) : await e.register(i, o, c);
			b(!1), a ? g(a) : n === "register" ? (v("Account created. Click the link we e-mailed you to confirm it, then sign in."), l(""), m("")) : t();
		},
		style: {
			display: "flex",
			flexDirection: "column",
			gap: 10
		},
		children: [
			/* @__PURE__ */ p("div", {
				style: { display: "flex" },
				children: [/* @__PURE__ */ f("button", {
					type: "button",
					style: Wc(n === "login"),
					onClick: () => x("login"),
					children: "Sign in"
				}), /* @__PURE__ */ f("button", {
					type: "button",
					style: Wc(n === "register"),
					onClick: () => x("register"),
					children: "Register"
				})]
			}),
			n === "register" && /* @__PURE__ */ f("input", {
				type: "text",
				placeholder: "Nickname",
				autoComplete: "nickname",
				value: i,
				onChange: (e) => a(e.target.value),
				style: Cc
			}),
			/* @__PURE__ */ f("input", {
				type: "email",
				placeholder: "E-mail",
				autoComplete: "email",
				value: o,
				onChange: (e) => s(e.target.value),
				style: Cc
			}),
			/* @__PURE__ */ f("input", {
				type: "password",
				placeholder: "Password",
				autoComplete: n === "login" ? "current-password" : "new-password",
				value: c,
				onChange: (e) => l(e.target.value),
				style: Cc
			}),
			n === "register" && /* @__PURE__ */ f("input", {
				type: "password",
				placeholder: "Confirm password",
				autoComplete: "new-password",
				value: d,
				onChange: (e) => m(e.target.value),
				style: Cc
			}),
			h !== "" && /* @__PURE__ */ f("p", {
				style: {
					...wc,
					color: "#ff7b7b"
				},
				children: h
			}),
			_ !== "" && /* @__PURE__ */ f("p", {
				style: {
					...wc,
					color: "#3ddc84"
				},
				children: _
			}),
			/* @__PURE__ */ f("button", {
				type: "submit",
				disabled: y,
				style: {
					background: bc,
					borderColor: bc,
					color: "#111",
					fontWeight: "bold"
				},
				children: y ? "Please wait..." : n === "login" ? "Sign in" : "Create account"
			})
		]
	});
}
function Kc({ user: e, onLogout: t }) {
	return /* @__PURE__ */ p("div", {
		style: {
			display: "flex",
			alignItems: "center",
			gap: 10
		},
		children: [
			/* @__PURE__ */ f(Ec, {
				name: e.name,
				size: 32
			}),
			/* @__PURE__ */ p("div", {
				style: {
					flex: 1,
					minWidth: 0
				},
				children: [/* @__PURE__ */ f("div", {
					style: { fontWeight: "bold" },
					children: e.name
				}), /* @__PURE__ */ f("div", {
					style: wc,
					children: "Signed in"
				})]
			}),
			/* @__PURE__ */ f("button", {
				style: Tc,
				onClick: t,
				children: "Sign out"
			})
		]
	});
}
// src/ui/FriendsPanel.tsx
var qc = {
	hosting: 0,
	online: 1,
	offline: 2
}, Jc = {
	display: "flex",
	alignItems: "center",
	gap: 10,
	padding: "8px 10px",
	background: "rgba(255, 255, 255, 0.04)",
	borderRadius: 8
};
function Yc({ social: e, onJoin: t, onInvite: n }) {
	let [r, i] = u(""), [a, o] = u(null), [s, c] = u(!1), l = [...e.friends].sort((e, t) => qc[e.status] - qc[t.status] || e.name.localeCompare(t.name)), d = async (e) => {
		o(null);
		let t = await e();
		t && o({
			text: t,
			isError: !0
		});
	};
	return /* @__PURE__ */ p("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: 12
		},
		children: [
			/* @__PURE__ */ p("form", {
				onSubmit: async (t) => {
					t.preventDefault(), c(!0);
					let n = await e.addFriend(r);
					c(!1), n ? o({
						text: n,
						isError: !0
					}) : (o({
						text: `Friend request sent to ${r.trim()}.`,
						isError: !1
					}), i(""));
				},
				style: {
					display: "flex",
					gap: 6
				},
				children: [/* @__PURE__ */ f("input", {
					type: "text",
					placeholder: "Add a friend by username",
					value: r,
					onChange: (e) => i(e.target.value),
					style: {
						...Cc,
						flex: 1,
						minWidth: 0
					}
				}), /* @__PURE__ */ f("button", {
					type: "submit",
					disabled: s,
					children: "Add"
				})]
			}),
			a && /* @__PURE__ */ f("p", {
				style: {
					...wc,
					color: a.isError ? "#ff7b7b" : "#3ddc84"
				},
				children: a.text
			}),
			e.requests.length > 0 && /* @__PURE__ */ p("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 6
				},
				children: [/* @__PURE__ */ f("div", {
					style: {
						...wc,
						textTransform: "uppercase",
						letterSpacing: 1
					},
					children: `Requests (${e.requests.length})`
				}), e.requests.map((t) => /* @__PURE__ */ p("div", {
					style: Jc,
					children: [
						/* @__PURE__ */ f(Ec, { name: t.name }),
						/* @__PURE__ */ f("div", {
							style: {
								flex: 1,
								minWidth: 0,
								fontWeight: "bold"
							},
							children: t.name
						}),
						/* @__PURE__ */ f("button", {
							style: {
								...Tc,
								background: "#e8863a",
								borderColor: "#e8863a",
								color: "#111"
							},
							onClick: () => void d(() => e.acceptRequest(t.id)),
							children: "Accept"
						}),
						/* @__PURE__ */ f("button", {
							style: Tc,
							onClick: () => void d(() => e.declineRequest(t.id)),
							children: "Decline"
						})
					]
				}, t.id))]
			}),
			/* @__PURE__ */ p("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 6
				},
				children: [/* @__PURE__ */ f("div", {
					style: {
						...wc,
						textTransform: "uppercase",
						letterSpacing: 1
					},
					children: `Friends (${e.friends.length})`
				}), /* @__PURE__ */ p("div", {
					style: {
						maxHeight: 260,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						gap: 6
					},
					children: [l.length === 0 && /* @__PURE__ */ f("p", {
						style: wc,
						children: "No friends yet. Add someone by username above."
					}), l.map((r) => /* @__PURE__ */ p("div", {
						style: {
							...Jc,
							opacity: r.status === "offline" ? .6 : 1
						},
						children: [
							/* @__PURE__ */ f(Ec, {
								name: r.name,
								status: r.status
							}),
							/* @__PURE__ */ p("div", {
								style: {
									flex: 1,
									minWidth: 0
								},
								children: [/* @__PURE__ */ f("div", {
									style: {
										fontWeight: "bold",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap"
									},
									children: r.name
								}), /* @__PURE__ */ f("div", {
									style: {
										fontSize: 12,
										color: xc[r.status]
									},
									children: Sc[r.status]
								})]
							}),
							t && r.status === "hosting" && /* @__PURE__ */ f("button", {
								style: {
									...Tc,
									background: "#e8863a",
									borderColor: "#e8863a",
									color: "#111",
									fontWeight: "bold"
								},
								onClick: () => t(r),
								children: "Join"
							}),
							n && r.status === "online" && /* @__PURE__ */ f("button", {
								style: Tc,
								onClick: () => n(r),
								children: "Invite"
							}),
							/* @__PURE__ */ f("button", {
								title: "Remove friend",
								style: {
									...Tc,
									background: "transparent",
									border: "none",
									color: "#9a9aa6"
								},
								onClick: () => void d(() => e.removeFriend(r.id)),
								children: "✕"
							})
						]
					}, r.id))]
				})]
			})
		]
	});
}
// src/ui/SocialPage.tsx
function Xc() {
	let e = r(), t = n(), i = yc(), a = t.state?.from ?? "/";
	return /* @__PURE__ */ p(d, { children: [
		/* @__PURE__ */ f("h2", {
			style: Fc,
			children: "Account"
		}),
		/* @__PURE__ */ f(Gc, {
			social: i,
			onDone: () => e(a, { replace: !0 })
		}),
		/* @__PURE__ */ f("button", {
			onClick: () => e("/"),
			children: "Back"
		})
	] });
}
function Zc() {
	let t = r(), n = yc(), { onStart: i } = Nc(), [a, s] = u(""), [c, l] = u(!1), m = o(async (e) => {
		if (n.user && !c) {
			l(!0), s(`Asking to join ${e.name}...`);
			try {
				let t = (await T(n.user.id)).find((t) => t.hostId === e.id);
				if (!t) {
					s(`${e.name} is not hosting right now.`);
					return;
				}
				await S(t.id, n.user.id);
				let r = new g(g.urlFor(t.id, n.user.id));
				i({
					role: "guest",
					transport: r,
					sessionId: t.id,
					userId: n.user.id
				});
			} catch (e) {
				s(e instanceof Error ? e.message : "Could not join that session.");
			} finally {
				l(!1);
			}
		}
	}, [
		n.user,
		c,
		i
	]);
	return n.user ? /* @__PURE__ */ p(d, { children: [
		/* @__PURE__ */ f("h2", {
			style: Fc,
			children: "Friends"
		}),
		/* @__PURE__ */ f(Yc, {
			social: n,
			onJoin: m
		}),
		a !== "" && /* @__PURE__ */ f("p", {
			style: Pc,
			children: a
		}),
		/* @__PURE__ */ f("button", {
			onClick: () => t("/"),
			children: "Back"
		})
	] }) : /* @__PURE__ */ f(e, {
		to: "/login",
		replace: !0,
		state: { from: "/friends" }
	});
}
// src/ui/ChatPanel.tsx
var Qc = 500, $c = "#3ddc84", el = "#ff5252", tl = {
	position: "absolute",
	right: 10,
	bottom: 10,
	zIndex: 10,
	width: 280,
	display: "flex",
	flexDirection: "column",
	background: "rgba(30, 30, 30, 0.85)",
	color: "#fff",
	borderRadius: 6,
	padding: 10,
	gap: 6,
	fontSize: 13
};
function nl({ session: e }) {
	let [t, n] = u([]), [r, i] = u(!0), [a, o] = u(""), [s, m] = u(null), h = l(null), g = e.role === "host" ? "Guest" : "Host";
	c(() => {
		let t = (e) => {
			e?.type === "chat" && typeof e.text == "string" && n((t) => [...t, {
				author: g,
				text: e.text.slice(0, Qc)
			}]), e?.type === "session_roster" && Array.isArray(e.participants) && m(e.participants.filter((e) => e.active).length);
		}, r = () => {
			i(!1), n((e) => [...e, {
				author: null,
				text: `${g} disconnected.`
			}]);
		};
		return e.transport.onMessage(t), e.transport.onClose(r), () => {
			e.transport.offMessage(t), e.transport.offClose(r);
		};
	}, [e, g]), c(() => {
		let e = h.current;
		e && (e.scrollTop = e.scrollHeight);
	}, [t]);
	let _ = () => {
		let t = a.trim();
		t && (e.transport.send({
			type: "chat",
			text: t
		}), n((e) => [...e, {
			author: "You",
			text: t
		}]), o(""));
	};
	return /* @__PURE__ */ p("div", {
		id: "chat",
		style: tl,
		children: [
			/* @__PURE__ */ p("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 6,
					fontWeight: "bold"
				},
				children: [/* @__PURE__ */ f("span", { style: {
					width: 10,
					height: 10,
					borderRadius: "50%",
					display: "inline-block",
					background: r ? $c : el
				} }), /* @__PURE__ */ f("span", { children: `Players online: ${s ?? 1}` })]
			}),
			/* @__PURE__ */ f("div", {
				ref: h,
				style: {
					height: 160,
					overflowY: "auto",
					display: "flex",
					flexDirection: "column",
					gap: 3,
					wordBreak: "break-word"
				},
				children: t.map((e, t) => /* @__PURE__ */ f("div", {
					style: e.author === null ? {
						color: "#aaa",
						fontStyle: "italic"
					} : void 0,
					children: e.author === null ? e.text : /* @__PURE__ */ p(d, { children: [/* @__PURE__ */ f("strong", { children: `${e.author}: ` }), e.text] })
				}, t))
			}),
			/* @__PURE__ */ p("div", {
				style: {
					display: "flex",
					gap: 4
				},
				children: [/* @__PURE__ */ f("input", {
					type: "text",
					placeholder: "Message...",
					maxLength: Qc,
					value: a,
					disabled: !r,
					onChange: (e) => o(e.target.value),
					onKeyDown: (e) => {
						e.key === "Enter" && _();
					},
					style: {
						flex: 1,
						minWidth: 0,
						background: "#1a1a1a",
						color: "#fff",
						border: "1px solid #666",
						padding: 4
					}
				}), /* @__PURE__ */ f("button", {
					onClick: _,
					disabled: !r,
					children: "Send"
				})]
			})
		]
	});
}
// src/hooks/useBusEvent.ts
function rl(e, t) {
	let n = l(t);
	c(() => {
		n.current = t;
	}), c(() => {
		let t = (e) => n.current(e);
		return h.on(e, t), () => h.off(e, t);
	}, [e]);
}
// src/ui/Toast.tsx
var il = 2500, al = {
	position: "absolute",
	top: 10,
	left: "50%",
	transform: "translateX(-50%)",
	zIndex: 20,
	background: "rgba(30, 30, 30, 0.9)",
	color: "#fff",
	border: "1px solid #666",
	borderRadius: 6,
	padding: "8px 14px",
	fontSize: 13
};
function ol() {
	let [e, t] = u(null), n = l(void 0), r = o((e) => {
		t(e), window.clearTimeout(n.current), n.current = window.setTimeout(() => t(null), il);
	}, []);
	return rl("ui:toast", (e) => r(String(e))), c(() => () => window.clearTimeout(n.current), []), e === null ? null : /* @__PURE__ */ f("div", {
		id: "toast",
		style: al,
		children: e
	});
}
export { bc as ACCENT, Xc as AuthPage, Gc as AuthPanel, Ec as Avatar, nl as ChatPanel, Zc as FriendsPage, Yc as FriendsPanel, Hc as HostPage, Uc as JoinPage, Mc as Lobby, uc as LobbyCube, Dc as LobbyTopBar, zc as MenuPage, xc as STATUS_COLOR, Sc as STATUS_LABEL, vc as SocialProvider, ol as Toast, Kc as UserChip, Ic as codeBoxStyle, Lc as copy, Fc as headingStyle, Cc as inputStyle, wc as mutedStyle, Tc as smallButtonStyle, Pc as textStyle, rl as useBusEvent, Nc as useLobbyContext, gc as useSocial, yc as useSocialContext };

//# sourceMappingURL=collab3d-react-kit.js.map