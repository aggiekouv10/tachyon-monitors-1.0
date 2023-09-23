function P(t, n) {
    var e = (65535 & t) + (65535 & n);
    return (t >> 16) + (n >> 16) + (e >> 16) << 16 | 65535 & e;
}

function Y(t, n) {
    return t << n | t >>> 32 - n;
}

function R(t, n, e, r, o, i) {
    return P(Y(P(P(n, t), P(r, i)), o), e);
}

function N(t, n, e, r, o, i, a) {
    return R(n & e | ~n & r, t, n, o, i, a);
}

function z(t, n, e, r, o, i, a) {
    return R(n & r | e & ~r, t, n, o, i, a);
}

function X(t, n, e, r, o, i, a) {
    return R(n ^ e ^ r, t, n, o, i, a);
}

function F(t, n, e, r, o, i, a) {
    return R(e ^ (n | ~r), t, n, o, i, a);
}

function V(t, n) {
    t[n >> 5] |= 128 << n % 32, t[14 + (n + 64 >>> 9 << 4)] = n;
    var e = void 0,
        r = void 0,
        o = void 0,
        i = void 0,
        a = void 0,
        c = 1732584193,
        u = -271733879,
        f = -1732584194,
        g = 271733878;

    for (e = 0; e < t.length; e += 16) r = c, o = u, i = f, a = g, c = N(c, u, f, g, t[e], 7, -680876936), g = N(g, c, u, f, t[e + 1], 12, -389564586), f = N(f, g, c, u, t[e + 2], 17, 606105819), u = N(u, f, g, c, t[e + 3], 22, -1044525330), c = N(c, u, f, g, t[e + 4], 7, -176418897), g = N(g, c, u, f, t[e + 5], 12, 1200080426), f = N(f, g, c, u, t[e + 6], 17, -1473231341), u = N(u, f, g, c, t[e + 7], 22, -45705983), c = N(c, u, f, g, t[e + 8], 7, 1770035416), g = N(g, c, u, f, t[e + 9], 12, -1958414417), f = N(f, g, c, u, t[e + 10], 17, -42063), u = N(u, f, g, c, t[e + 11], 22, -1990404162), c = N(c, u, f, g, t[e + 12], 7, 1804603682), g = N(g, c, u, f, t[e + 13], 12, -40341101), f = N(f, g, c, u, t[e + 14], 17, -1502002290), u = N(u, f, g, c, t[e + 15], 22, 1236535329), c = z(c, u, f, g, t[e + 1], 5, -165796510), g = z(g, c, u, f, t[e + 6], 9, -1069501632), f = z(f, g, c, u, t[e + 11], 14, 643717713), u = z(u, f, g, c, t[e], 20, -373897302), c = z(c, u, f, g, t[e + 5], 5, -701558691), g = z(g, c, u, f, t[e + 10], 9, 38016083), f = z(f, g, c, u, t[e + 15], 14, -660478335), u = z(u, f, g, c, t[e + 4], 20, -405537848), c = z(c, u, f, g, t[e + 9], 5, 568446438), g = z(g, c, u, f, t[e + 14], 9, -1019803690), f = z(f, g, c, u, t[e + 3], 14, -187363961), u = z(u, f, g, c, t[e + 8], 20, 1163531501), c = z(c, u, f, g, t[e + 13], 5, -1444681467), g = z(g, c, u, f, t[e + 2], 9, -51403784), f = z(f, g, c, u, t[e + 7], 14, 1735328473), u = z(u, f, g, c, t[e + 12], 20, -1926607734), c = X(c, u, f, g, t[e + 5], 4, -378558), g = X(g, c, u, f, t[e + 8], 11, -2022574463), f = X(f, g, c, u, t[e + 11], 16, 1839030562), u = X(u, f, g, c, t[e + 14], 23, -35309556), c = X(c, u, f, g, t[e + 1], 4, -1530992060), g = X(g, c, u, f, t[e + 4], 11, 1272893353), f = X(f, g, c, u, t[e + 7], 16, -155497632), u = X(u, f, g, c, t[e + 10], 23, -1094730640), c = X(c, u, f, g, t[e + 13], 4, 681279174), g = X(g, c, u, f, t[e], 11, -358537222), f = X(f, g, c, u, t[e + 3], 16, -722521979), u = X(u, f, g, c, t[e + 6], 23, 76029189), c = X(c, u, f, g, t[e + 9], 4, -640364487), g = X(g, c, u, f, t[e + 12], 11, -421815835), f = X(f, g, c, u, t[e + 15], 16, 530742520), u = X(u, f, g, c, t[e + 2], 23, -995338651), c = F(c, u, f, g, t[e], 6, -198630844), g = F(g, c, u, f, t[e + 7], 10, 1126891415), f = F(f, g, c, u, t[e + 14], 15, -1416354905), u = F(u, f, g, c, t[e + 5], 21, -57434055), c = F(c, u, f, g, t[e + 12], 6, 1700485571), g = F(g, c, u, f, t[e + 3], 10, -1894986606), f = F(f, g, c, u, t[e + 10], 15, -1051523), u = F(u, f, g, c, t[e + 1], 21, -2054922799), c = F(c, u, f, g, t[e + 8], 6, 1873313359), g = F(g, c, u, f, t[e + 15], 10, -30611744), f = F(f, g, c, u, t[e + 6], 15, -1560198380), u = F(u, f, g, c, t[e + 13], 21, 1309151649), c = F(c, u, f, g, t[e + 4], 6, -145523070), g = F(g, c, u, f, t[e + 11], 10, -1120210379), f = F(f, g, c, u, t[e + 2], 15, 718787259), u = F(u, f, g, c, t[e + 9], 21, -343485551), c = P(c, r), u = P(u, o), f = P(f, i), g = P(g, a);

    return [c, u, f, g];
}

function j(t) {
    var n = void 0,
        e = "";

    for (n = 0; n < 32 * t.length; n += 8) e += String.fromCharCode(t[n >> 5] >>> n % 32 & 255);

    return e;
}

function W(t) {
    var n = void 0,
        e = [];

    for (e[(t.length >> 2) - 1] = void 0, n = 0; n < e.length; n += 1) e[n] = 0;

    for (n = 0; n < 8 * t.length; n += 8) e[n >> 5] |= (255 & t.charCodeAt(n / 8)) << n % 32;

    return e;
}

function Z(t) {
    return j(V(W(t), 8 * t.length));
}

function Q(n, t) {
    var e = void 0,
        r = W(n),
        o = [],
        i = [];

    for (o[15] = i[15] = void 0, r.length > 16 && (r = V(r, 8 * n.length)), e = 0; e < 16; e += 1) o[e] = 909522486 ^ r[e], i[e] = 1549556828 ^ r[e];

    var t = V(o.concat(W(t)), 512 + 8 * t.length);
    return j(V(i.concat(t), 640));
}

function B(t) {
    var n = "0123456789abcdef",
        e = "",
        r = void 0,
        o = void 0;

    for (o = 0; o < t.length; o += 1) r = t.charCodeAt(o), e += n.charAt(r >>> 4 & 15) + n.charAt(15 & r);

    return e;
}

function L(t) {
    return unescape(encodeURIComponent(t));
}

function J(n, t) {
    return Q(L(n), L(t));
}

function B(t) {
    var n = "0123456789abcdef",
        e = "",
        r = void 0,
        o = void 0;

    for (o = 0; o < t.length; o += 1) r = t.charCodeAt(o), e += n.charAt(r >>> 4 & 15) + n.charAt(15 & r);

    return e;
}

function q(n, t) {
    return B(J(n, t));
}

function K(t, n, e) {
    return (n ? (e ? J(n, t) : q(n, t)) : (e ? G(t) : H(t)));
}

function $(t, n, r) {
    // var o = e;
    // Af++, I("PX503");
    var i = K(t, n, r);
    // return T("PX503"), i;
    return i;
}



function fg() {
    var t = new Uint8Array(16);
    return crypto.getRandomValues(t), t;
}

var dg = fg(),
    Cg = [1 | dg[0], dg[1], dg[2], dg[3], dg[4], dg[5]],
    vg = 16383 & (dg[6] << 8 | dg[7]),
    pg = 0,
    mg = 0;


function E() {
    return +new Date();
}

for (var gg = [], lg = {}, sg = 0; sg < 256; sg++) gg[sg] = (sg + 256).toString(16).substr(1), lg[gg[sg]] = sg;

function Cn(t, n) {
    var e = n || 0,
        r = gg;
    return r[t[e++]] + r[t[e++]] + r[t[e++]] + r[t[e++]] + "-" + r[t[e++]] + r[t[e++]] + "-" + r[t[e++]] + r[t[e++]] + "-" + r[t[e++]] + r[t[e++]] + "-" + r[t[e++]] + r[t[e++]] + r[t[e++]] + r[t[e++]] + r[t[e++]] + r[t[e++]];
}

function vn(t, n, r, o) {
    // var i = e;
    // I("PX505");
    var a = "";
    if (o) try {
        for (var c = (new Date().getTime() * Math.random() + "").replace(".", ".".charCodeAt()).split("").slice(-16), u = 0; u < c.length; u++) c[u] = parseInt(10 * Math.random()) * +c[u] || parseInt(Math.random() * ug.len);

        a = Cn(c, 0, ug.cipher);
    } catch (t) { }
    var f = n && r || 0,
        g = n || [];
    t = t || {};
    var l = void 0 !== t.clockseq ? t.clockseq : vg,
        s = void 0 !== t.msecs ? t.msecs : E(),
        d = void 0 !== t.nsecs ? t.nsecs : mg + 1,
        C = s - pg + (d - mg) / 1e4;
    if (C < 0 && void 0 === t.clockseq && (l = l + 1 & 16383), (C < 0 || s > pg) && void 0 === t.nsecs && (d = 0), d >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    pg = s, mg = d, vg = l, s += 122192928e5;
    var v = (1e4 * (268435455 & s) + d) % 4294967296;
    g[f++] = v >>> 24 & 255, g[f++] = v >>> 16 & 255, g[f++] = v >>> 8 & 255, g[f++] = 255 & v;
    var p = s / 4294967296 * 1e4 & 268435455;
    g[f++] = p >>> 8 & 255, g[f++] = 255 & p, g[f++] = p >>> 24 & 15 | 16, g[f++] = p >>> 16 & 255, g[f++] = l >>> 8 | 128, g[f++] = 255 & l;

    for (var m = t.node || Cg, h = 0; h < 6; h++) g[f + h] = m[h];

    var y = n || Cn(g);
    // return a === y ? a : (T("PX505"), y);
    return a === y ? a : (null, y);
}

function qr() {
    return window["_pxAction"];
}

function Kr() {
    // var Bg = "pxc",
    // Lg = "pxhc",
    // Gg = "c";
    // var t = qr(); //this is undefined anyway
    // return t === Gg || t === Bg || t === Lg ? window._pxUuid || gn("uuid") || vn() : vn();
    return vn();
}

function Pi(t, n) {
    return [Kr(), t, n].join(":");
}

function h() {
    return ("undefined" != typeof JSON && "function" == typeof JSON.stringify && void 0 === Array.prototype.toJSON ? JSON.stringify : a).apply(null, Array.prototype.slice.call(arguments));
}

function Bt(t) {
    for (var n = "", e = "", r = 0; r < t.length; r++) {
        var o = t.charCodeAt(r);
        o >= Wf && o <= Zf ? n += t[r] : e += o % Qf;
    }

    return n + e;
}


var Wf = 48,
    Zf = 57,
    Qf = 10,
    Bf = 20;

function Qt(t, n) {
    var e = $(t, n);

    try {
        for (var r = Bt(e), o = "", i = 0; i < r.length; i += 2) o += r[i];

        return o;
    } catch (t) { }
}

var rC = "|",
    oC = window.performance && performance.timing,
    iC = window["chrome"],
    aC = "app",
    cC = "runtime",
    uC = ["webstore", cC, aC, "csi", "loadTimes"],
    fC = "createElement",
    gC = "webdriver",
    lC = "toJSON",
    sC = "fetch",
    dC = "webstore",
    CC = "runtime",
    vC = "onInstallStageChanged",
    pC = "dispatchToListener",
    mC = "sendMessage",
    hC = "install";

var c = ["onrendersubtreeactivation", "scheduler", "onactivateinvisible", "onoverscroll", "onscrollend", "trustedTypes", "requestPostAnimationFrame", "cancelPostAnimationFrame", "getComputedAccessibleNode", "getDefaultComputedStyle", "scrollByLines", "scrollByPages", "sizeToContent", "updateCommands", "dump", "setResizable", "mozInnerScreenX", "mozInnerScreenY", "scrollMaxX", "scrollMaxY", "fullScreen", "ondevicemotion", "ondeviceorientation", "onabsolutedeviceorientation", "ondeviceproximity", "onuserproximity", "ondevicelight", "InstallTrigger", "sidebar", "onvrdisplayconnect", "onvrdisplaydisconnect", "onvrdisplayactivate", "onvrdisplaydeactivate", "onvrdisplaypresentchange", "ondragexit", "onloadend", "onshow", "onmozfullscreenchange", "onmozfullscreenerror", "crossOriginIsolated", "caches", "applicationCache", "offscreenBuffering", "webkitIndexedDB", "webkitCancelRequestAnimationFrame", "getMatchedCSSRules", "showModalDialog", "webkitConvertPointFromPageToNode", "webkitConvertPointFromNodeToPage", "safari", "yandexApi", "yandex", "onelementpainted"];
var u = ["origin", "webkitFullScreenKeyboardInputAllowed", "onrejectionhandled", "onunhandledrejection", "getOverrideStyle", "getCSSCanvasContext", "onrendersubtreeactivation", "addressSpace", "onactivateinvisible", "onoverscroll", "onscrollend", "rootScroller", "ol_originalAddEventListener", "releaseCapture", "mozSetImageElement", "mozCancelFullScreen", "enableStyleSheetsForSet", "caretPositionFromPoint", "onbeforescriptexecute", "onafterscriptexecute", "mozFullScreen", "mozFullScreenEnabled", "selectedStyleSheetSet", "lastStyleSheetSet", "preferredStyleSheetSet", "styleSheetSets", "mozFullScreenElement", "ondragexit", "onloadend", "onshow", "onmozfullscreenchange", "onmozfullscreenerror", "registerElement"];
var f = ["deviceMemory", "getUserAgent", "clipboard", "credentials", "keyboard", "locks", "mediaDevices", "serviceWorker", "storage", "presentation", "bluetooth", "hid", "usb", "xr", "setAppBadge", "clearAppBadge", "getInstalledRelatedApps", "getUserMedia", "webkitGetUserMedia", "requestMIDIAccess", "canShare", "share", "scheduling", "serial", "sms", "wakeLock", "taintEnabled", "oscpu", "buildID", "getStorageUpdates"];
var g = ["ancestorOrigins", "fragmentDirective"];


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function ln(t, n) {
    for (var e = "", r = 0; r < t.length; r++) e += String.fromCharCode(n ^ t.charCodeAt(r));

    return e;
}

function un(t) {
    try {
        return Object.getPrototypeOf && Object.getPrototypeOf(t) || t.__proto__ || t.prototype;
    } catch (t) { }
}

function cn(t, n) {
    var e = "";
    if (!t) return e;
    e += t + "";
    var r = un(t);

    if (e += t.constructor || r && r.constructor || "", r) {
        var o = void 0;

        for (var i in r) {
            o = !0;

            try {
                r.hasOwnProperty(i) && (e += n ? i : fn(i, r));
            } catch (t) {
                e += i + (t && t.message);
            }
        }

        if (!o && "function" == typeof Object.keys) {
            var a = Object.keys(r);
            if (a && a.length > 0) for (var c = 0; c < a.length; c++) try {
                e += n ? a[c] : fn(a[c], r);
            } catch (t) {
                e += a[c] + (t && t.message);
            }
        }
    }

    try {
        for (var u in t) try {
            t.hasOwnProperty && t.hasOwnProperty(u) && (e += n ? u : fn(u, t));
        } catch (t) {
            e += t && t.message;
        }
    } catch (t) {
        e += t && t.message;
    }

    return e;
}

function on(t) {
    return t |= 0, t < 0 && (t += 4294967296), t.toString(16);
}

let Gf = 0;
function rn(t) {
    t = "" + t;

    for (var n = Gf, e = 0; e < t.length; e++) {
        n = (n << 5) - n + t.charCodeAt(e), n |= 0;
    }

    return on(n);
}

function ea() {
    return iC;
}

function fn(t, n) {
    try {
        return t + n[t];
    } catch (t) {
        return t;
    }
}

function pa(t, n) {
    for (var e = "", r = 0; r < n.length; r++) try {
        var o = n[r];
        e += "" + t.hasOwnProperty(o) + t[o];
    } catch (t) {
        e += t;
    }

    return rn(e);
}

function da() {
    try {
        var t = "webdriver",
            n = !1;
        return navigator[t] || navigator.hasOwnProperty(t) || (navigator[t] = 1, n = 1 !== navigator[t], delete navigator[t]), n;
    } catch (t) {
        return !0;
    }
}

function Ca() {
    try {
        var t = "refresh",
            n = !1;
        return navigator.plugins && (navigator.plugins[t] = 1, n = 1 !== navigator.plugins[t], delete navigator.plugins[t]), n;
    } catch (t) {
        return !0;
    }
}

function dn(t, n) {
    try {
        var e = "Object",
            r = "getOwnPropertyDescriptor",
            o = window[e][r];
        if ("function" != typeof o) return;
        return o(t, n);
    } catch (t) { }
}

function ta() {
    var t = window[sC],
        n = t ? (t + "").length : 0;
    return n += oC && oC[lC] ? (oC[lC] + "").length : 0, n += document && document[fC] ? (document[fC] + "").length : 0;
}

function na() {
    var t = "";
    if (!iC) return t;

    for (var n = 0, e = 0; e < uC.length; e++) try {
        n += (iC[uC[e]].constructor + "").length;
    } catch (t) { }

    t += n + rC;

    try {
        iC[dC][hC](0);
    } catch (n) {
        t += (n + "").length + rC;
    }

    try {
        iC[dC][hC]();
    } catch (n) {
        t += (n + "").length + rC;
    }

    if ("string" == typeof location.protocol && 0 === location.protocol.indexOf("http")) try {
        iC[CC][mC]();
    } catch (n) {
        t += (n + "").length + rC;
    }

    try {
        iC[dC][vC][pC]();
    } catch (n) {
        t += (n + "").length;
    }

    return t;
}

function Ya() {
    var t = void 0;
    return !!navigator.plugins && ("[object PluginArray]" === (t = "function" == typeof navigator.plugins.toString ? navigator.plugins.toString() : navigator.plugins.constructor && "function" == typeof navigator.plugins.constructor.toString ? navigator.plugins.constructor.toString() : EC(navigator.plugins)) || "[object MSPluginsCollection]" === t || "[object HTMLPluginsCollection]" === t);
}

EC = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
    return typeof t;
} : function (t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
}

function Ra() {
    var t = [];

    try {
        for (var n = 0; n < navigator.plugins.length && n < 30; n++) t.push(navigator.plugins[n].name);
    } catch (t) { }

    return t;
}

function Xa() {
    try {
        return new Date().getTimezoneOffset();
    } catch (t) {
        return 9999;
    }
}

var r = function () {
    try {
        return window.performance && performance["memory"];
    } catch (t) { }
}();

function Wa() {
    var t = null;
    if (void 0 !== document.hidden) t = ""; else for (var n = ["webkit", "moz", "ms", "o"], e = 0; e < n.length; e++) if (void 0 !== document[n[e] + "Hidden"]) {
        t = n[e];
        break;
    }
    return t;
}

function ja() {
    var t = Wa(),
        n = ("" === t ? "v" : "V") + "isibilityState";
    return document[n];
}

function Va() {
    try {
        document.createEvent("TouchEvent");
    } catch (t) {
        return !1;
    }
}

function Wt(t) {
    return "function" == typeof t && /\{\s*\[native code\]\s*\}/.test("" + t);
}

function Vt() {
    return "number" == typeof navigator.maxTouchPoints ? navigator.maxTouchPoints : "number" == typeof navigator.msMaxTouchPoints ? navigator.msMaxTouchPoints : void 0;
}

function Ma() {
    try {
        var t = navigator.mimeTypes && navigator.mimeTypes.toString();
        return "[object MimeTypeArray]" === t || /MSMimeTypesCollection/i.test(t);
    } catch (t) {
        return !1;
    }
}

function $t(t, n, e, r) {
    var o = void 0;

    try {
        o = e();
    } catch (t) { }

    return void 0 === o && (o = void 0 === r ? "missing" : r), o;
}

function Za() {
    var t = document.styleSheets,
        n = {
            cssFromStyleSheets: 0
        },
        e = !0,
        r = !1,
        o = void 0;

    try {
        for (var i, a = t[Symbol.iterator](); !(e = (i = a.next()).done); e = !0) {
            i.value.href && n.cssFromStyleSheets++;
        }
    } catch (t) {
        r = !0, o = t;
    } finally {
        try {
            !e && a.return && a.return();
        } finally {
            if (r) throw o;
        }
    }

    if (Qa()) {
        var c = performance.getEntriesByType("resource");
        n.imgFromResourceApi = 0, n.cssFromResourceApi = 0, n.fontFromResourceApi = 0;
        var u = !0,
            f = !1,
            g = void 0;

        try {
            for (var l, s = c[Symbol.iterator](); !(u = (l = s.next()).done); u = !0) {
                var d = l.value;
                "img" === d.initiatorType && n.imgFromResourceApi++, ("css" === d.initiatorType || "link" === d.initiatorType && -1 !== d.name.indexOf(".css")) && n.cssFromResourceApi++, "link" === d.initiatorType && -1 !== d.name.indexOf(".woff") && n.fontFromResourceApi++;
            }
        } catch (t) {
            f = !0, g = t;
        } finally {
            try {
                !u && s.return && s.return();
            } finally {
                if (f) throw g;
            }
        }
    }

    return n;
}

function ma(t) {
    if (void 0 !== t) return rn(t);
}

function Qa() {
    return performance && "function" == typeof performance.getEntriesByType;
}

function Na() {
    var t = [];

    try {
        var n = document.location.ancestorOrigins;
        if (document.location.ancestorOrigins) for (var e = 0; e < n.length; e++) n[e] && "null" !== n[e] && t.push(n[e]);
    } catch (t) { }

    return t;
}

let o = Za();

// NEW FROM HERE //
//               //
//               //
//               //
//               //
//               //
// NEW FROM HERE //

var h = document
var A = window,
    h = document,
    B = navigator,
    w = location,
    y = "undefined",
    m = "boolean",
    g = "number",
    p = "string",
    b = "function",
    G = "object",
    F = function (n, t) {
        var r = n.length,
            c = t ? Number(t) : 0;

        if (c != c && (c = 0), !(c < 0 || c >= r)) {
            var a,
                e = n.charCodeAt(c);
            return e >= 55296 && e <= 56319 && r > c + 1 && (a = n.charCodeAt(c + 1)) >= 56320 && a <= 57343 ? 1024 * (e - 55296) + a - 56320 + 65536 : e;
        }
    };

var mi = window.speechSynthesis.getVoices()
var hn = 0;

function oc() {
    var n = function () {
        var n = null;
        if (void 0 !== h.hidden) n = ""; else for (var t = ["webkit", "moz", "ms", "o"], r = 0; r < t.length; r++) if (void 0 !== h[t[r] + "Hidden"]) {
            n = t[r];
            break;
        }
        return n;
    }();

    return h[("" === n ? "v" : "V") + "isibilityState"];
}

function ffff(n) {
    return ffff = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (n) {
        return typeof n;
    } : function (n) {
        return n && "function" == typeof Symbol && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
    }, ffff(n);
}
var zn = function (n) {
    if (ffff(n) === m ? n : ("undefined" == typeof btoa ? "undefined" : ffff(btoa)) === b) return function (n) {
        return btoa(encodeURIComponent(n).replace(/%([0-9A-F]{2})/g, function (n, t) {
            return String.fromCharCode("0x" + t);
        }));
    };
    var t = A.unescape || A.decodeURI;
    return function (n) {
        var r,
            c,
            a,
            e,
            i,
            o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            l = 0,
            u = 0,
            f = [];
        if (!n) return n;

        try {
            n = t(encodeURIComponent(n));
        } catch (t) {
            return n;
        }

        do {
            r = (i = n.charCodeAt(l++) << 16 | n.charCodeAt(l++) << 8 | n.charCodeAt(l++)) >> 18 & 63, c = i >> 12 & 63, a = i >> 6 & 63, e = 63 & i, f[u++] = o.charAt(r) + o.charAt(c) + o.charAt(a) + o.charAt(e);
        } while (l < n.length);

        var R = f.join(""),
            v = n.length % 3;
        return (v ? R.slice(0, v - 3) : R) + "===".slice(v || 3);
    };
}()
function jt(n, t) {
    for (var r = "", c = 0; c < n.length; c++) r += String.fromCharCode(t ^ n.charCodeAt(c));

    return r;
}
function Co(n) {
    if (n) try {
        return zn(jt(n, 4210));
    } catch (n) { console.log(n) }
}
function xo() {
    return mi && mi.length > 0;
}
function kkkk() {
    if (!xo()) return;
    var n = mi.length - 1;
    return Co(mi[n].voiceURI);
}


function Bn(n, t) {
    var r = (65535 & n) + (65535 & t);
    return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r;
}
function wn(n, t, r, c, a, e) {
    return Bn((i = Bn(Bn(t, n), Bn(c, e))) << (o = a) | i >>> 32 - o, r);
    var i, o;
}
function yn(n, t, r, c, a, e, i) {
    return wn(t & r | ~t & c, n, t, a, e, i);
}
function mn(n, t, r, c, a, e, i) {
    return wn(t & c | r & ~c, n, t, a, e, i);
}
function gn(n, t, r, c, a, e, i) {
    return wn(t ^ r ^ c, n, t, a, e, i);
}
function pn(n, t, r, c, a, e, i) {
    return wn(r ^ (t | ~c), n, t, a, e, i);
}
function bn(n, t) {
    n[t >> 5] |= 128 << t % 32, n[14 + (t + 64 >>> 9 << 4)] = t;
    var r,
        c,
        a,
        e,
        i,
        o = 1732584193,
        l = -271733879,
        u = -1732584194,
        f = 271733878;

    for (r = 0; r < n.length; r += 16) c = o, a = l, e = u, i = f, o = yn(o, l, u, f, n[r], 7, -680876936), f = yn(f, o, l, u, n[r + 1], 12, -389564586), u = yn(u, f, o, l, n[r + 2], 17, 606105819), l = yn(l, u, f, o, n[r + 3], 22, -1044525330), o = yn(o, l, u, f, n[r + 4], 7, -176418897), f = yn(f, o, l, u, n[r + 5], 12, 1200080426), u = yn(u, f, o, l, n[r + 6], 17, -1473231341), l = yn(l, u, f, o, n[r + 7], 22, -45705983), o = yn(o, l, u, f, n[r + 8], 7, 1770035416), f = yn(f, o, l, u, n[r + 9], 12, -1958414417), u = yn(u, f, o, l, n[r + 10], 17, -42063), l = yn(l, u, f, o, n[r + 11], 22, -1990404162), o = yn(o, l, u, f, n[r + 12], 7, 1804603682), f = yn(f, o, l, u, n[r + 13], 12, -40341101), u = yn(u, f, o, l, n[r + 14], 17, -1502002290), o = mn(o, l = yn(l, u, f, o, n[r + 15], 22, 1236535329), u, f, n[r + 1], 5, -165796510), f = mn(f, o, l, u, n[r + 6], 9, -1069501632), u = mn(u, f, o, l, n[r + 11], 14, 643717713), l = mn(l, u, f, o, n[r], 20, -373897302), o = mn(o, l, u, f, n[r + 5], 5, -701558691), f = mn(f, o, l, u, n[r + 10], 9, 38016083), u = mn(u, f, o, l, n[r + 15], 14, -660478335), l = mn(l, u, f, o, n[r + 4], 20, -405537848), o = mn(o, l, u, f, n[r + 9], 5, 568446438), f = mn(f, o, l, u, n[r + 14], 9, -1019803690), u = mn(u, f, o, l, n[r + 3], 14, -187363961), l = mn(l, u, f, o, n[r + 8], 20, 1163531501), o = mn(o, l, u, f, n[r + 13], 5, -1444681467), f = mn(f, o, l, u, n[r + 2], 9, -51403784), u = mn(u, f, o, l, n[r + 7], 14, 1735328473), o = gn(o, l = mn(l, u, f, o, n[r + 12], 20, -1926607734), u, f, n[r + 5], 4, -378558), f = gn(f, o, l, u, n[r + 8], 11, -2022574463), u = gn(u, f, o, l, n[r + 11], 16, 1839030562), l = gn(l, u, f, o, n[r + 14], 23, -35309556), o = gn(o, l, u, f, n[r + 1], 4, -1530992060), f = gn(f, o, l, u, n[r + 4], 11, 1272893353), u = gn(u, f, o, l, n[r + 7], 16, -155497632), l = gn(l, u, f, o, n[r + 10], 23, -1094730640), o = gn(o, l, u, f, n[r + 13], 4, 681279174), f = gn(f, o, l, u, n[r], 11, -358537222), u = gn(u, f, o, l, n[r + 3], 16, -722521979), l = gn(l, u, f, o, n[r + 6], 23, 76029189), o = gn(o, l, u, f, n[r + 9], 4, -640364487), f = gn(f, o, l, u, n[r + 12], 11, -421815835), u = gn(u, f, o, l, n[r + 15], 16, 530742520), o = pn(o, l = gn(l, u, f, o, n[r + 2], 23, -995338651), u, f, n[r], 6, -198630844), f = pn(f, o, l, u, n[r + 7], 10, 1126891415), u = pn(u, f, o, l, n[r + 14], 15, -1416354905), l = pn(l, u, f, o, n[r + 5], 21, -57434055), o = pn(o, l, u, f, n[r + 12], 6, 1700485571), f = pn(f, o, l, u, n[r + 3], 10, -1894986606), u = pn(u, f, o, l, n[r + 10], 15, -1051523), l = pn(l, u, f, o, n[r + 1], 21, -2054922799), o = pn(o, l, u, f, n[r + 8], 6, 1873313359), f = pn(f, o, l, u, n[r + 15], 10, -30611744), u = pn(u, f, o, l, n[r + 6], 15, -1560198380), l = pn(l, u, f, o, n[r + 13], 21, 1309151649), o = pn(o, l, u, f, n[r + 4], 6, -145523070), f = pn(f, o, l, u, n[r + 11], 10, -1120210379), u = pn(u, f, o, l, n[r + 2], 15, 718787259), l = pn(l, u, f, o, n[r + 9], 21, -343485551), o = Bn(o, c), l = Bn(l, a), u = Bn(u, e), f = Bn(f, i);

    return [o, l, u, f];
}
function Zn(n) {
    var t,
        r,
        c = "0123456789abcdef",
        a = "";

    for (r = 0; r < n.length; r += 1) t = n.charCodeAt(r), a += c.charAt(t >>> 4 & 15) + c.charAt(15 & t);

    return a;
}
function Gn(n) {
    var t,
        r = "";

    for (t = 0; t < 32 * n.length; t += 8) r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255);

    return r;
}
function Fn(n) {
    var t,
        r = [];

    for (r[(n.length >> 2) - 1] = void 0, t = 0; t < r.length; t += 1) r[t] = 0;

    for (t = 0; t < 8 * n.length; t += 8) r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32;

    return r;
}
function Vn(n) {
    return unescape(encodeURIComponent(n));
}
function Qn(n) {
    return function (n) {
        return Gn(bn(Fn(n), 8 * n.length));
    }(Vn(n));
}
function Cn(n, t) {
    return function (n, t) {
        var r,
            c = Fn(n),
            a = [],
            e = [];

        for (a[15] = e[15] = void 0, c.length > 16 && (c = bn(c, 8 * n.length)), r = 0; r < 16; r += 1) a[r] = 909522486 ^ c[r], e[r] = 1549556828 ^ c[r];

        var i = bn(a.concat(Fn(t)), 512 + 8 * t.length);
        return Gn(bn(e.concat(i), 640));
    }(Vn(n), Vn(t));
}
function x123() {
    var n = "";

    try {
        n = new Intl.DateTimeFormat().format("");
    } catch (n) { }

    return Zn(Qn(n));
};

var c = false;
var r = ["ADTOP", "ADbox", "AdBar", "AdDiv", "AdIbl", "AdTop"],
    a = document.createElement("div");
if (a.setAttribute("style", "height:0px;width:0px;"), document.body.appendChild(a), "none" !== getComputedStyle(a).display) for (var e = 0; e < r.length; e++) if (a.id = r[e], "none" === getComputedStyle(a).display) {
    c = !0;
    break;
}
h.body.removeChild(a);

function whataaa() {
    try {
        var n = "refresh",
            t = !1;
        return B.plugins && (B.plugins[n] = 1, t = 1 !== B.plugins[n], delete B.plugins[n]), t;
    } catch (n) {
        return !0;
    }
}
function adaaa() {
    var n = A.performance && A.performance.memory;
    if (n) return Bi !== n.jsHeapSizeLimit || wi !== n.totalJSHeapSize || yi !== n.usedJSHeapSize;
}
function xaxa() {
    return Array.prototype.slice.call(A.getComputedStyle(h.documentElement, "")).join("").match(/-(moz|webkit|ms)-/)[1];
}

function an() {
    return +new Date();
}
var qn = "isTrusted",
    Kn = an(),
    nt = "script",
    tt = function () {
        var n = "mousewheel";

        try {
            A && B && /Firefox/i.test(B.userAgent) && (n = "DOMMouseScroll");
        } catch (n) { }

        return n;
    }(),
    rt = A.MutationObserver || A.WebKitMutationObserver || A.MozMutationObserver;

function ct(n, t) {
    if (!(n && n instanceof Element)) return "";
    var r,
        c = n[Kn];
    if (c) return t ? it(c) : c;

    try {
        r = function (n) {
            if (n.id) return "#" + n.id;

            for (var t, r = "", c = 0; c < 20; c++) {
                if (!(n && n instanceof Element)) return r;
                if ("html" === n.tagName.toLowerCase()) return r;
                if (n.id) return "#" + n.id + r;
                if (!((t = ut(n)) instanceof Element)) return n.tagName + r;
                if (at(r = et(n, t) + r)) return r;
                n = t, r = ">" + r;
            }
        }(n), r = r.replace(/^>/, ""), r = t ? it(r) : r, n[Kn] = r;
    } catch (n) { }

    return r || n.id || n.tagName || "";
}

function at(n) {
    try {
        return 1 === h.querySelectorAll(n).length;
    } catch (n) {
        return !1;
    }
}

function et(n, t) {
    if (1 === t.getElementsByTagName(n.tagName).length) return n.tagName;

    for (var r = 0; r < t.children.length; r++) if (t.children[r] === n) return n.tagName + ":nth-child(" + (r + 1) + ")";
}

function it(n) {
    if (ffff(n) === p) return n.replace(/:nth-child\((\d+)\)/g, function (n, t) {
        return t;
    });
}

function ot(n) {
    var t = y;
    return n && n.hasOwnProperty(qn) && (t = n[qn] && "false" !== n[qn] ? "true" : "false"), t;
}

function lt(n) {
    if (n) return n.target || n.toElement || n.srcElement;
}

function ut(n) {
    if (n) {
        var t = n.parentNode || n.parentElement;
        return t && 11 !== t.nodeType ? t : null;
    }
}

function ft(n) {
    try {
        var t = Element.prototype.getBoundingClientRect.call(n);
        return {
            left: t.left,
            top: t.top
        };
    } catch (n) {
        return {
            left: -1,
            top: -1
        };
    }
}

function Rt(n, t) {
    n && ffff(n.clientX) === g && ffff(n.clientY) === g && (t.x = +(n.clientX || -1).toFixed(2), t.y = +(n.clientY || -1).toFixed(2));
}

function vt(n) {
    var t = {};

    try {
        t.pageX = +(n.pageX || h.documentElement && n.clientX + h.documentElement.scrollLeft || 0).toFixed(2), t.pageY = +(n.pageY || h.documentElement && n.clientY + h.documentElement.scrollTop || 0).toFixed(2);
    } catch (n) { }

    return t;
}

function Wt(n, t) {
    rt && !n || ffff(t) !== b || new rt(function (n) {
        n.forEach(function (n) {
            if (n && "attributes" === n.type) {
                var r = n.attributeName,
                    c = r && n.target && ffff(n.target.getAttribute) === b && Element.prototype.getAttribute.call(n.target, n.attributeName);
                t(n.target, r, c);
            }
        });
    }).observe(n, {
        attributes: !0
    });
}

var st = 0,
    dt = 0,
    At = !0;
try {
    var ht = Object.defineProperty({}, "passive", {
        get: function () {
            return At = !1, !0;
        }
    });
    A.addEventListener("test", null, ht);
} catch (n) { }
function Bt(n) {
    return n ? Qt : Ct;
}
function wt() {
    try {
        null[0];
    } catch (n) {
        return n.stack || "";
    }
}
function yt() {
    if (zt()) return Math.round(A.performance.now());
}
function mt(n) {
    return (n || an()) - (Pn() || 0);
}
function gt(n, t) {
    var r = cn(n, t);
    return -1 !== r ? r : (n.push(t), n.length - 1);
}
function pt(n) {
    n = "" + n;

    for (var t = 0, r = 0; r < n.length; r++) {
        t = (t << 5) - t + n.charCodeAt(r), t |= 0;
    }

    return function (n) {
        (n |= 0) < 0 && (n += 4294967296);
        return n.toString(16);
    }(t);
}
var zr = "|",
    Mr = A.performance && A.performance.timing,
    Ir = A["chrome"],
    Yr = "app",
    _r = "runtime",
    jr = ["webstore", _r, Yr, "csi", "loadTimes"],
    Or = "webdriver";

function Ur() {
    return Ir;
}
var r = "opr",
    c = "opera",
    a = "yandex",
    e = "safari",
    i = Ur();
function bt(n, t) {
    var r = "";
    if (!n) return r;

    try {
        r += n + "";
    } catch (n) {
        return r;
    }

    var c = function (n) {
        try {
            return Object.getPrototypeOf && Object.getPrototypeOf(n) || n.__proto__ || n.prototype;
        } catch (n) { }
    }(n);

    if (r += n.constructor || c && c.constructor || "", c) {
        var a;

        for (var e in c) {
            a = !0;

            try {
                c.hasOwnProperty(e) && (r += t ? e : Gt(e, c));
            } catch (n) {
                r += e + (n && n.message);
            }
        }

        if (!a && ffff(Object.keys) === b) {
            var i = Object.keys(c);
            if (i && i.length > 0) for (var o = 0; o < i.length; o++) try {
                r += t ? i[o] : Gt(i[o], c);
            } catch (n) {
                r += i[o] + (n && n.message);
            }
        }
    }

    try {
        for (var l in n) try {
            n.hasOwnProperty && n.hasOwnProperty(l) && (r += t ? l : Gt(l, n));
        } catch (n) {
            r += n && n.message;
        }
    } catch (n) {
        r += n && n.message;
    }

    return r;
}
function Gt(n, t) {
    try {
        return n + t[n];
    } catch (n) {
        return n;
    }
}
function Ft(n, t) {
    t || (t = w.href), n = n.replace(/[[\]]/g, "\\$&");
    var r = new RegExp("[?&]" + n + "(=([^&#]*)|&|#|$)").exec(t);
    if (!r) return null;
    var c = r[2];
    if (!c) return "";
    if (c = decodeURIComponent(c.replace(/\+/g, " ")), "url" === n) try {
        c = Tn(c);
    } catch (n) { }
    return c;
}
function Zt(n, t) {
    try {
        var r = Vt(n, t);
        if (!r) return;
        var c = "";

        for (var a in r) c += r[a] + "";

        return pt(c);
    } catch (n) { }
}
function Vt(n, t) {
    try {
        var r = "Object",
            c = "getOwnPropertyDescriptor",
            a = A[r][c];
        if (ffff(a) !== b) return;
        return a(n, t);
    } catch (n) { }
}
var n = A.performance && A.performance.memory;
n && (Bi = n.jsHeapSizeLimit, wi = n.totalJSHeapSize, yi = n.usedJSHeapSize);

function PX11274() {
    var n = !1;

    try {
        n = ("undefined" == typeof global ? "undefined" : ffff(global)) === G && "[object global]" === String(global);
    } catch (n) { }

    try {
        n = n || ("undefined" == typeof process ? "undefined" : ffff(process)) === G && "[object process]" === String(process);
    } catch (n) { }

    try {
        n = n || !0 === /node|io\.js/.test(process.release.name);
    } catch (n) { }

    try {
        n = n || ("undefined" == typeof setImmediate ? "undefined" : ffff(setImmediate)) === b && 4 === setImmediate.length;
    } catch (n) { }

    try {
        n = n || ("undefined" == typeof __dirname ? "undefined" : ffff(__dirname)) === p;
    } catch (n) { }

    return n;
}
function Hr(n, t) {
    for (var r = "", c = 0; c < t.length; c++) try {
        var a = t[c];
        r += "" + n.hasOwnProperty(a);
    } catch (n) {
        r += n;
    }

    return pt(r);
}
let PX10162_HIBBETT = Hr(A, ["closed", "devicePixelRatio", "getSelection", "locationbar", "scrollbars", "crypto", "caches", "speechSynthesis", "menubar", "personalbar", "toolbar", "Dump", "VRDispaly", "VRDisplayCapabilities", "VRDisplayEvent", "VREyeParameters", "VRFieldOfView", "VRFrameData", "VRPose", "VRStageParameters", "mozInnerScreenX", "mozInnerScreenY", "mozRTCIceCandidate", "mozRTCPeerConnection", "mozRTCSessionDescription", "webkitMediaStream", "webkitRTCPeerConnection", "webkitSpeechGrammar", "webkitSpeechGrammarList", "webkitSpeechRecognition", "webkitSpeechRecognitionError", "webkitSpeechRecognitionEvent", "webkitURL", "scheduler", "getDefaultComputedStyle", "Yandex", "yandexAPI", "Chrome", "Opera", "onrendersubtreeactivation", "scheduler", "onactivateinvisible", "onoverscroll", "onscrollend", "ondevicemotion", "ondeviceorientation", "onabsolutedeviceorientation", "ondeviceproximity", "onuserproximity", "ondevicelight", "onvrdisplayconnect", "onvrdisplaydisconnect", "onvrdisplayactivate", "onvrdisplaydeactivate", "onvrdisplaypresentchange", "ondragexit", "onloadend", "onshow", "onelementpainted", "onmozfullscreenchange", "Onmozfullscreenerror", "Onabort", "Onafterprint", "Onanimationend", "Onanimationiteration", "Onanimationstart", "Onappinstalled", "Onauxclick", "onbeforeinstallprompt", "onbeforeprint", "onbeforeunload", "onbeforexrselect", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncuechange", "ondblclick", "ondevicemotion", "ondeviceorientation", "ondeviceorientationabsolute", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "onformdata", "ongotpointercapture", "onhashchange", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onlanguagechange", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onlostpointercapture", "onmessage", "onmessageerror", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onoffline", "ononline", "onpagehide", "onpageshow", "onpause", "onplay", "onplaying", "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave", "onpointermove", "onpointerout", "onpointerover", "onpointerrawupdate", "onpointerup", "onpopstate", "onprogress", "onratechange", "onrejectionhandled", "onreset", "onresize", "onscroll", "onsearch", "onseeked", "onseeking", "onselect", "onselectionchange", "onselectstart", "onstalled", "onstorage", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "ontransitioncancel", "ontransitionend", "ontransitionrun", "ontransitionstart", "onunhandledrejection", "onunload", "onvolumechange", "onwaiting", "onwebkitanimationend", "onwebkitanimationiteration", "onwebkitanimationstart", "onwebkittransitionend", "onwheel", "Math"]);
let PX10940_HIBBETT = Hr(h, ["onrejectionhandled", "onunhandledrejection", "getOverrideStyle", "getCSSCanvasContext", "onrendersubtreeactivation", "addressSpace", "onactivateinvisible", "onoverscroll", "onscrollend", "rootScroller", "ol_originalAddEventListener", "releaseCapture", "mozSetImageElement", "mozCancelFullScreen", "enableStyleSheetsForSet", "caretPositionFromPoint", "onbeforescriptexecute", "onafterscriptexecute", "mozFullScreen", "mozFullScreenEnabled", "selectedStyleSheetSet", "lastStyleSheetSet", "preferredStyleSheetSet", "styleSheetSets", "mozFullScreenElement", "ondragexit", "onloadend", "onshow", "onmozfullscreenchange", "onmozfullscreenerror", "registerElement", "compatMode", "contentType", "Doctype", "mozSyntheticDocument", "mozSetImageElement", "Plugins", "featurePolicy", "visibilityState", "Onafterscriptexecute", "Onbeforescriptexecute", "Oncopy", "oncut", "Onfullscreenchange", "Onpaste", "Onreadystatechange", "Onselectionchange", "Onvisibilitychange", "xmlVersion", "adoptNode", "Append", "CaptureEvents", "carePositionsFromPoint", "caretRangeFromPoint", "createAttribute", "CreateAttributeNS", "createcdatasECTION", "CREATEcOMMENT", "CREATEdOCUMENTfRAGMENT", "CREATEelement", "createElementNS", "createEntityReference", "createEvent", "createNodeIterator", "createProcessingInstruction", "createRange", "createTextNode", "createTouch", "createTouchList", "createTreeWalker", "createElementFromPoint", "createElementsFromPoint", "elementFromPoint", "elementsFromPoint", "enableStyleSheetsForSet", "exitPictureInPicture", "exitPointerLock", "getAnimatinos", "getBoxQuads", "getElementsById", "getElementsByClassName", "getElementbyTagName", "getSelection", "hasStorageAccess", "importNode", "normalizeDocument", "Prepend", "querySelector", "querySelectorAll", "releaseCapture", "RELEASEevents", "Replacechildren", "requestStorageAccess", "mozSetImageElement", "createExpression", "createNSResolver", "Evaluate", "Clear", "Close", "getElementByName", "hasFocus", "Open", "queryCommandEnabled", "queryCommandIndeterm", "queryCommandState", "queryCommandSupported", "queryCommandValue", "Write", "writeIn", "execComandShowHelp", "getBoxObjectFor", "loadOverlay", "queryCommandText", "fileSize"]);
let PX11209_HIBBETT = Hr(B, ["appCodeName", "appName", "Bluetooth", "Clipboard", "cookieEnabled", "Keyboard", "Locks", "mediaCapabilities", "mediaDevices", "mediaSession", "Permissions", "Presentation", "Product", "productSub (important returns the build number of the current browser)", "vendorSub (important return vendor version number)", "Serial", "vendorName", "Xr", "buildID (important return the buildID on firefox in addition to productSub)", "Securitypolicy", "Standalone", "Vibrate", "Share", "setAppBadge", "getvrdISPLAYS", "getUserMedia", "taintEnabled", "requestMediaKeySystemAccess", "registerProtocolHandler", "javaEnabled", "getBattery", "clearAppBadge"]);
let PX10498 = Hr(w, ["ancestorOrigins", "fragmentDirective"]);

let PX10162_WALMART = Hr(window, ["onrendersubtreeactivation", "scheduler", "onactivateinvisible", "onoverscroll", "onscrollend", "trustedTypes", "requestPostAnimationFrame", "cancelPostAnimationFrame", "getComputedAccessibleNode", "getDefaultComputedStyle", "scrollByLines", "scrollByPages", "sizeToContent", "updateCommands", "dump", "setResizable", "mozInnerScreenX", "mozInnerScreenY", "scrollMaxX", "scrollMaxY", "fullScreen", "ondevicemotion", "ondeviceorientation", "onabsolutedeviceorientation", "ondeviceproximity", "onuserproximity", "ondevicelight", "InstallTrigger", "sidebar", "onvrdisplayconnect", "onvrdisplaydisconnect", "onvrdisplayactivate", "onvrdisplaydeactivate", "onvrdisplaypresentchange", "ondragexit", "onloadend", "onshow", "onmozfullscreenchange", "onmozfullscreenerror", "crossOriginIsolated", "caches", "applicationCache", "offscreenBuffering", "webkitIndexedDB", "webkitCancelRequestAnimationFrame", "getMatchedCSSRules", "showModalDialog", "webkitConvertPointFromPageToNode", "webkitConvertPointFromNodeToPage", "safari", "yandexApi", "yandex", "onelementpainted"])
let PX10940_WALMART = Hr(document, ["origin", "webkitFullScreenKeyboardInputAllowed", "onrejectionhandled", "onunhandledrejection", "getOverrideStyle", "getCSSCanvasContext", "onrendersubtreeactivation", "addressSpace", "onactivateinvisible", "onoverscroll", "onscrollend", "rootScroller", "ol_originalAddEventListener", "releaseCapture", "mozSetImageElement", "mozCancelFullScreen", "enableStyleSheetsForSet", "caretPositionFromPoint", "onbeforescriptexecute", "onafterscriptexecute", "mozFullScreen", "mozFullScreenEnabled", "selectedStyleSheetSet", "lastStyleSheetSet", "preferredStyleSheetSet", "styleSheetSets", "mozFullScreenElement", "ondragexit", "onloadend", "onshow", "onmozfullscreenchange", "onmozfullscreenerror", "registerElement"])
let PX11209_WALMART = Hr(navigator, ["deviceMemory", "getUserAgent", "clipboard", "credentials", "keyboard", "locks", "mediaDevices", "serviceWorker", "storage", "presentation", "bluetooth", "hid", "usb", "xr", "setAppBadge", "clearAppBadge", "getInstalledRelatedApps", "getUserMedia", "webkitGetUserMedia", "requestMIDIAccess", "canShare", "share", "scheduling", "serial", "sms", "wakeLock", "taintEnabled", "oscpu", "buildID", "getStorageUpdates"])
function PX10289() {
    var n;
    if (!navigator.plugins) return !1;
    n = ffff(navigator.plugins.toString) === b ? navigator.plugins.toString() : navigator.plugins.constructor && f(navigator.plugins.constructor.toString) === b ? navigator.plugins.constructor.toString() : f(navigator.plugins);
    return "[object PluginArray]" === n || "[object MSPluginsCollection]" === n || "[object HTMLPluginsCollection]" === n;
}
function PX10174() {
    try {
        var n = navigator.mimeTypes && navigator.mimeTypes.toString();
        return "[object MimeTypeArray]" === n || /MSMimeTypesCollection/i.test(n);
    } catch (n) {
        return !1;
    }
}
var hi;
if (navigator.userAgentData)
    navigator.userAgentData.getHighEntropyValues(["architecture", "bitness", "brands", "mobile", "model", "platform", "platformVersion", "uaFullVersion"]).then(function (n) {
        hi = n;
    });
else
    console.log("FUCEKD")

function PX10800() {
    try {
        return window.hasOwnProperty("_cordovaNative") || window.hasOwnProperty("Ti") || window.hasOwnProperty("webView") || window.hasOwnProperty("Android") || document.hasOwnProperty("ondeviceready") || navigator.hasOwnProperty("standalone") || window.external && "notify" in window.external || navigator.userAgent.indexOf(" Mobile/") > 0 && -1 === navigator.userAgent.indexOf(" Safari/");
    } catch (n) {
        return !1;
    }
}
function gc(n) {
    var t = parseFloat(n);
    if (!isNaN(t)) return t;
}
function kt(n) {
    return ffff(n) === b && /\{\s*\[native code\]\s*\}/.test("" + n);
}
function PX10422() {
    var n = window.fetch,
        t = n ? (n + "").length : 0;
    return t += Mr && Mr.toJSON ? (Mr.toJSON + "").length : 0, t + (document && document.createElement ? (document.createElement + "").length : 0);
  }
function Rn() {
    for (var n = document.styleSheets, t = {
        cssFromStyleSheets: 0
    }, r = 0; r < n.length; r++) {
        n[r].href && t.cssFromStyleSheets++;
    }

    if (window.performance && ffff(window.performance.getEntriesByType) === b) {
        var c = window.performance.getEntriesByType("resource");
        t.imgFromResourceApi = 0, t.cssFromResourceApi = 0, t.fontFromResourceApi = 0;

        for (var a = 0; a < c.length; a++) {
            var e = c[a];
            "img" === e.initiatorType && t.imgFromResourceApi++, ("css" === e.initiatorType || "link" === e.initiatorType && -1 !== e.name.indexOf(".css")) && t.cssFromResourceApi++, "link" === e.initiatorType && -1 !== e.name.indexOf(".woff") && t.fontFromResourceApi++;
        }
    }

    return t;
}
var c = Rn()

var payload = {}

setTimeout(() => {
    let body = {
        "PX10065": !!window.Worklet,
        "PX11153": !!window.AudioWorklet,
        "PX10509": !!window.AudioWorkletNode,
        "PX10227": window.isSecureContext,
        "PX11249": !!Element.prototype.attachShadow,
        "PX11253": kkkk(),
        "PX11256": x123(),
        // "PX11264": c,
        "PX10410": whataaa(),
        "PX11243": adaaa(),
        "PX11245": xaxa(),
        "PX11246": A.eval.toString().length,
        "PX11247": /constructor/i.test(A.HTMLElement),
        "PX11274": PX11274(),
        "PX10046": A.hasOwnProperty("onorientationchange") || !!A.onorientationchange,
        "PX10218": pt(bt(i)),
        "PX10162_HIBBETT": PX10162_HIBBETT,
        "PX10940_HIBBETT": PX10940_HIBBETT,
        "PX11209_HIBBETT": PX11209_HIBBETT,
        "PX10162_WALMART": PX10162_WALMART,
        "PX10940_WALMART": PX10940_WALMART,
        "PX11209_WALMART": PX11209_WALMART,
        "PX10498": PX10498,
        "PX11055": na(),
        "PX10422": PX10422(),
        "PX10659": !!window.caches,
        "PX10316": !!window.caches,
        "PX10599": "object" === EC(window.chrome) && "function" == typeof Object.keys ? Object.keys(window.chrome) : [],
        "PX10790": navigator.plugins ? Ra() : [],
        "PX11010": navigator.plugins ? navigator.plugins.length : -1,
        "PX10289": navigator.plugins ? PX10289() : false,
        "PX10093": navigator.plugins[0] === navigator.plugins[0][0].enabledPlugin,
        "PX10604": navigator.plugins.item(4294967296) === navigator.plugins[0],
        "PX10296": navigator.language,
        "PX11186": navigator.platform,
        "PX10397": navigator.languages,
        "PX10472": navigator.userAgent,
        "PX10758": !!(navigator.doNotTrack || null === navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack),
        "PX10099": Xa(), //new Date().getTimezoneOffset()
        "PX10336": navigator.deviceMemory,
        "PX10373": navigator.languages && navigator.languages.length,
        "PX10802": navigator.product,
        "PX10628": navigator.productSub,
        "PX11039": navigator.appVersion,
        "PX10174": PX10174(),
        "PX10775": navigator.mimeTypes && navigator.mimeTypes.length || -1,
        "PX10539": navigator.appName,
        "PX10516": navigator.buildID,
        "PX10189": navigator.appCodeName,
        "PX10390": navigator.permissions && navigator.permissions.query && "query" === navigator.permissions.query.name,
        "PX10963": navigator.connection.rtt,
        "PX10081": navigator.connection.saveData,
        "PX10399": navigator.connection.downlink,
        "PX10273": navigator.connection.effectiveType,
        "PX10595": "onLine" in navigator && !0 === navigator.onLine,
        "PX10822": navigator.geolocation + "" == "[object Geolocation]",
        "PX11205": "cookieEnabled" in navigator && !0 === navigator.cookieEnabled,
        "PX11235": hi.architecture,
        "PX11236": hi.bitness,
        "PX11237": hi.brands,
        "PX11238": hi.mobile,
        "PX11239": hi.model,
        "PX11240": hi.platform,
        "PX11241": hi.platformVersion,
        "PX11242": hi.uaFullVersion,
        "PX11277": !!navigator.userAgentData,
        "PX11278": navigator.pdfViewerEnabled,
        "PX10561": screen && screen.width || -1,
        "PX10499": screen && screen.height || -1,
        "PX10843": screen && screen.availWidth || -1,
        "PX10850": screen && screen.availHeight || -1,
        "PX11113": (screen && screen.width || -1) + "X",
        "PX10724": screen && +screen.pixelDepth || 0,
        "PX10089": screen && +screen.colorDepth || 0,
        "PX10204": window.innerWidth || -1,
        "PX11138": window.innerHeight || -1,
        "PX11170": window.scrollX || window.pageXOffset || 0,
        "PX11174": window.scrollY || window.pageYOffset || 0,
        "PX10243": !(0 === window.outerWidth && 0 === window.outerHeight),
        "PX10800": PX10800(),
        "PX10058": oc(),
        "PX10872": gc(window.outerWidth),
        "PX10366": gc(window.outerHeight),
        "PX10156": kt(window.BatteryManager) || kt(navigator.battery) || kt(navigator.getBattery),
        // "PX10712": c.cssFromResourceApi

    }
    payload = body;
    console.log(JSON.stringify(payload))

    function utf8ToHex(str) {
        return Array.from(str).map(c =>
            c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16) :
                encodeURIComponent(c).replace(/\%/g, '').toLowerCase()
        ).join('');
    }

    fetch('/collector/collect', {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payload: utf8ToHex(btoa(JSON.stringify(payload)).split("").reverse().join("")).split("").reverse().join("") })
    }).then(response => {
        finish("Data Collected!<br>You may close the page")
    }).catch(() => {
        finish("Data Collection FAILED!<br>Please contact developer!")
    })


}, 5000);


function finish(text) {
    document.getElementById("text").innerHTML = text
}

// MAKE SURE TO WAIT 10s for PAGE TO LOAD
// Crosscheck: window.speechSynthesis.getVoices()