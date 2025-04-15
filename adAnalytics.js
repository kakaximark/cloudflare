(function() {
  // 解析URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const keys = ['kwaiId', 'fbPixelId', 'ttPixelId', 'ch', 'sdmode', 'bgPixel', 'gtagId', 'test', 'tt_test_id', 'ttclid', 'afId', 'mgSkyPixelId'];
  keys.forEach(key => {
    if (urlParams.has(key)) {
      window[key] = urlParams.get(key);
    }
  });

  // Load Kwai Analytics
  if (window.kwaiId) {
    loadKwaiAnalytics(window.kwaiId);
  }

  // Load Bigo Analytics
  if (window.bgPixel) {
    loadBigoAnalytics(window.bgPixel);
  }

  // Load Tiktok Analytics
  if (window.ttPixelId) {
    loadTiktokAnalytics(window.ttPixelId);
  }

  // Load Facebook Analytics
  if (window.fbPixelId) {
    loadFacebookAnalytics(window.fbPixelId);
  }

  // Load Google Analytics
  if (window.gtagId) {
    loadGoogleAnalytics(window.gtagId);
  }

  // Load mgSky Analytics
  if (window.mgSkyPixelId) {
    loadMGSkyAnalytics(window.mgSkyPixelId);
  }

  function loadKwaiAnalytics(key) {
    !function (e, t) { "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.install = t() : e.install = t() }(window, (function () { return function (e) { var t = {}; function n(r) { if (t[r]) return t[r].exports; var o = t[r] = { i: r, l: !1, exports: {} }; return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports } return n.m = e, n.c = t, n.d = function (e, t, r) { n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r }) }, n.r = function (e) { "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 }) }, n.t = function (e, t) { if (1 & t && (e = n(e)), 8 & t) return e; if (4 & t && "object" == typeof e && e && e.__esModule) return e; var r = Object.create(null); if (n.r(r), Object.defineProperty(r, "default", { enumerable: !0, value: e }), 2 & t && "string" != typeof e) for (var o in e) n.d(r, o, function (t) { return e[t] }.bind(null, o)); return r }, n.n = function (e) { var t = e && e.__esModule ? function () { return e.default } : function () { return e }; return n.d(t, "a", t), t }, n.o = function (e, t) { return Object.prototype.hasOwnProperty.call(e, t) }, n.p = "", n(n.s = 0) }([function (e, t, n) { "use strict"; var r = this && this.__spreadArray || function (e, t, n) { if (n || 2 === arguments.length) for (var r, o = 0, i = t.length; o < i; o++)!r && o in t || (r || (r = Array.prototype.slice.call(t, 0, o)), r[o] = t[o]); return e.concat(r || Array.prototype.slice.call(t)) }; !function (e) { var t = window; t.KwaiAnalyticsObject = e, t[e] = t[e] || []; var n = t[e]; n.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"]; var o = function (e, t) { e[t] = function () { var n = Array.from(arguments), o = r([t], n, !0); e.push(o) } }; n.methods.forEach((function (e) { o(n, e) })), n.instance = function (e) { var t = n._i[e] || []; return n.methods.forEach((function (e) { o(t, e) })), t }, n.load = function (t, r) { n._i = n._i || {}, n._i[t] = [], n._i[t]._u = "https://s1.kwai.net/kos/s101/nlav11187/pixel/events.js", n._t = n._t || {}, n._t[t] = +new Date, n._o = n._o || {}, n._o[t] = r || {}; var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = "https://s1.kwai.net/kos/s101/nlav11187/pixel/events.js?sdkid=" + t + "&lib=" + e; var i = document.getElementsByTagName("script")[0];i.parentNode.insertBefore(o, i) } }("kwaiq") }]) }));
    try {
      kwaiq.load(key);
      kwaiq.page();
    } catch (error) {
      console.log(error);
    }
  }

  function loadBigoAnalytics(key) {
    window.bgdataLayer = window.bgdataLayer || [];
    function bge() { window.bgdataLayer.push(arguments); }
    bge('init', key);
    (function (b, e, v, n, t, s) {
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s)
    }(document, 'script', 'https://api.imotech.video/ad/events.js?pixel_id=' + key));
  }

  function loadTiktokAnalytics(key) {
    (function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"], ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++)ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)ttq.setAndDefer(e, ttq.methods[n]); return e }, ttq.load = function (e, n) { var i = "https://analytics.tiktok.com/i18n/pixel/events.js"; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = i + "?sdkid=" + e + "&lib=" + t; var a = document.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a) };
      ttq.load(key);
      ttq.page();
    }(window, document, 'ttq'));
  }

  function loadFacebookAnalytics(key) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ?
          n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js'));
    fbq('init', key + '');
    fbq('track', 'PageView');
  }

  function loadGoogleAnalytics(key) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({
        'gtm.start':
          new Date().getTime(), event: 'gtm.js'
      }); var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
          'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', key);
  }

  function loadMGSkyAnalytics(key) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://s.mgskyads.com/js/tag.js?aa=${key}`;
    document.head.appendChild(script);
  }
})();
