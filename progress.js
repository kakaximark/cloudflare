(function () {
  function webAppDetection () {
    var s = this;
    this.isAndroid = function () {
      try {
        var e = /Android/.test(window.navigator.userAgent);
        return e;
      } catch (t) {
        return false;
      }
    };
    this.isIOS = function () {
      try {
        var e = [
          "iPad Simulator",
          "iPhone Simulator",
          "iPod Simulator",
          "iPad",
          "iPhone",
          "iPod",
        ];
        var t =
          e.includes(navigator.platform) ||
          (navigator.userAgent.includes("Mac") && "ontouchend" in document);
        return t;
      } catch (i) {
        return false;
      }
    };
    this.isMacOs = function () {
      try {
        return (
          window.navigator.platform.toLowerCase().includes("mac") &&
          !s.isIOS()
        );
      } catch (e) {
        return false;
      }
    };
    this.isWindows = function () {
      try {
        return window.navigator.platform.toLowerCase().includes("win");
      } catch (e) {
        return false;
      }
    };
    this.isSafari = function () {
      try {
        return (
          navigator.vendor &&
          navigator.vendor.includes("Apple") &&
          navigator.userAgent &&
          !navigator.userAgent.includes("CriOS") &&
          !navigator.userAgent.includes("FxiOS") &&
          !navigator.userAgent.includes("EdgiOS")
        );
      } catch (e) {
        return false;
      }
    };
    this.isFirefox = function () {
      try {
        var e = navigator.userAgent.toLowerCase().includes("firefox");
        if (!e) {
          return false;
        }
        var t = window.navigator.platform.toLowerCase();
        var i = t.includes("mac") || t.includes("win");
        if (!i) {
          return false;
        }
        return true;
      } catch (a) {
        return false;
      }
    };
    this.isSamsungInternet = function () {
      try {
        return navigator.userAgent.toLowerCase().includes("samsungbrowser");
      } catch (e) {
        return false;
      }
    };
    this.isChromeEdgeOnMacOs = function () {
      try {
        return (
          navigator.vendor.toLowerCase().includes("google") &&
          window.navigator.platform.toLowerCase().includes("mac")
        );
      } catch (e) {
        return false;
      }
    };
    this.isArc = function () {
      try {
        return getComputedStyle(document.documentElement).getPropertyValue(
          "--arc-palette-title"
        );
      } catch (e) {
        return false;
      }
    };
    this.isEdge = function () {
      try {
        return (
          window.navigator.userAgent.includes("Edge") ||
          window.navigator.userAgent.includes("Edg/") ||
          window.navigator.userAgent.includes("EdgiOS")
        );
      } catch (e) {
        return false;
      }
    };
    this.isChrome = function () {
      try {
        var e = window.navigator.userAgent.toLowerCase();
        var t = window.chrome || e.includes("chrome");
        if (!t) {
          return false;
        }
        var i = s.isEdge();
        if (i) {
          return false;
        }
        var a = e.includes("opr");
        if (a) {
          return false;
        }
        var n = s.isArc();
        if (n) {
          return false;
        }
        return true;
      } catch (r) {
        return false;
      }
    };
    this.isOpera = function () {
      try {
        return window.navigator.userAgent.toLowerCase().includes("opr");
      } catch (e) {
        return false;
      }
    };
    this.supportsNativeiOSPush = function () {
      if (!window.webkit) {
        return false;
      }
      if (!window.webkit.messageHandlers) {
        return false;
      }
      if (
        !window.webkit.messageHandlers["progressier-requests-push-status"]
      ) {
        return false;
      }
      return true;
    };
    this.appstore = function () {
      return s.supportsNativeiOSPush();
    };
    this.supportsPush = function () {
      if (s.supportsNativeiOSPush()) {
        return true;
      }
      if (!window.PushManager) {
        return false;
      }
      if (!navigator.serviceWorker) {
        return false;
      }
      if (!window.Notification) {
        return false;
      }
      return true;
    };
    this.isFromTwitter = function () {
      if (s.definitelyNotTwitter) {
        return false;
      }
      if (!s.isIOS() && !s.isAndroid()) {
        return false;
      }
      if (s.isIOS() && !s.isSafari()) {
        return false;
      }
      return (
        document.referrer.includes("https://t.co") ||
        window.location.href.includes("progressierreferrer=twitter")
      );
    };
    this.isInAppBrowser = function () {
      try {
        var t = window.navigator.userAgent;
        var e = [
          "wv",
          "Line/",
          "FBAN",
          "FBBV",
          "FBAV",
          "FB_IAB",
          "Instagram",
          "MicroMessenger",
          "Twitter",
          "Kakao",
          "KAKAO",
        ];
        var i = false;
        e.forEach(function (e) {
          if (!t.includes(e)) {
            return;
          }
          i = true;
        });
        return i;
      } catch (a) {
        return false;
      }
    };
    this.isChromeOS = function () {
      try {
        return (
          window.navigator.platform.toLowerCase().includes("linux") &&
          window.navigator.userAgent.toLowerCase().includes("cros")
        );
      } catch (e) {
        return false;
      }
    };
    this.isDesktop = function () {
      try {
        if (s.isWindows()) {
          return true;
        }
        if (s.isIOS()) {
          return false;
        }
        if (s.isAndroid()) {
          return false;
        }
        if (s.isMacOs()) {
          return true;
        }
        if (s.isChromeOS()) {
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    };
    this.isSafariWithPushOnMacOs = function () {
      if (!s.isSafari()) {
        return false;
      }
      if (!s.isMacOs()) {
        return false;
      }
      if (!s.supportsPush()) {
        return false;
      }
      return true;
    };
    this.isSafariWithInstallationMacOS = function () {
      try {
        if (!s.isSafari()) {
          return false;
        }
        if (!s.isMacOs()) {
          return false;
        }
        var e = navigator.userAgent;
        var t = /Safari\//i.test(e);
        if (!t) {
          return false;
        }
        var i = e.match(/Version\/(\d+)/i);
        if (i && i[1]) {
          var a = parseInt(i[1], 10);
          if (a >= 17) {
            return true;
          }
        }
        return false;
      } catch (n) {
        return false;
      }
    };
    this.canBePushPrompted = function () {
      if (!s.isIOS() && !s.isAndroid()) {
        return false;
      }
      if (!s.supportsPush()) {
        return false;
      }
      var e = Notification.permission;
      if (e === "denied" || e === "granted") {
        return false;
      }
      return true;
    };
    this.isStandalone = function () {
      return (
        navigator.standalone ||
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.matchMedia("(display-mode: fullscreen)").matches &&
          (s.isAndroid() || s.isIOS())) ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.matchMedia("(display-mode: window-controls-overlay)").matches
      );
    };
    this.iosVersion = function () {
      if (!s.isIOS()) {
        return false;
      }
      var e = navigator.userAgent;
      if (!/iP(hone|od|ad)/.test(e)) {
        return false;
      }
      var t = e.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (!t || !t[1]) {
        return false;
      }
      var i = parseFloat(t[1] + "." + (t[2] || 0));
      return i;
    };
    this.recentiOS = function () {
      try {
        let e = s.iosVersion();
        if (!e) {
          return false;
        }
        if (e < 16.7) {
          return false;
        }
        let t = navigator.userAgent.match(/CriOS\/(\d+)/);
        if (!t) {
          return false;
        }
        let i = parseInt(t[1], 10);
        if (i < 116) {
          return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    };
    this.isTWA = function () {
      if (!s.isAndroid()) {
        return false;
      }
      if (!s.isStandalone()) {
        return false;
      }
      try {
        if (
          document.referrer.startsWith("android-app://") ||
          window.sessionStorage.getItem("opened-from-twa")
        ) {
          window.sessionStorage.setItem("opened-from-twa", true);
          return true;
        }
      } catch (e) {}
      return false;
    };
    this.requiresInScopeSw = function () {
      try {
        if (s.isIOS()) {
          return false;
        }
        if (s.isSafari()) {
          return false;
        }
        if (s.isFirefox()) {
          return false;
        }
        if (s.isOpera()) {
          return false;
        }
        if (s.isArc()) {
          return false;
        }
        if (s.isSamsungInternet()) {
          return true;
        }
        let e = window.navigator.userAgent;
        let t = e.match(/Chrome\/(\d+)/);
        let i = parseInt(t[1]);
        if (i >= 111 && e.includes("Android")) {
          return false;
        }
        if (i >= 114) {
          return false;
        }
        return true;
      } catch (e) {
        return true;
      }
    };
    this.isIframe = function () {
      try {
        if (window.self !== window.top) {
          return true;
        }
        return false;
      } catch (e) {
        return true;
      }
    };
    try {
      s.result = {};
      for (var e in s) {
        if (typeof s[e] !== "function") {
          continue;
        }
        s.result[e] = s[e]();
      }
    } catch (t) {}
  }

  var obj = {
    installable: false,
    standalone: false,
    detection: new webAppDetection(),
    emit: function (event, data) {
      const e = new CustomEvent(event, data);
      window.dispatchEvent(e);
    },
    install: function () {
      if (obj.nativePrompt) {
        obj.nativePrompt.prompt();
        obj.nativePrompt.userChoice.then(function (choiceResult) {
          if (choiceResult.outcome === "accepted") {
            localStorage.setItem("webAppInstalled", 'true');
          }
        });
      }
    }
  }

  function installPromptHandler(e) {
    obj.nativePrompt = e;
    obj.installable = true;
    localStorage.setItem("webAppAvailable", 'true');
  }

  window.addEventListener("beforeinstallprompt", installPromptHandler);

  function generateWebIcon() {
    let icon512 = '';
    let icon192 = '';
    window.webAppManifestSettings.icons.forEach(icon => {
      if (icon.sizes === '512x512') {
        icon512 = icon.src;
      } else if (icon.sizes === '192x192') {
        icon192 = icon.src;
      }
    })

    icon192 = icon192 || icon512;

    const iconsData = [
      { rel: 'shortcut icon', href: icon192 },
      { rel: 'apple-touch-icon', href: icon192 },
      { sizes: '180x180', rel: 'apple-touch-icon', href: icon192 },
      { rel: 'apple-touch-icon-precomposed', href: icon192 }
    ];
    
    const headElement = document.getElementsByTagName('head')[0];
    
    iconsData.forEach(icon => {
      // 查找是否已存在具有相同rel和sizes的link元素
      let selector = `link[rel="${icon.rel}"]`;
      if (icon.sizes) {
        selector += `[sizes="${icon.sizes}"]`;
      }
      let existingLink = document.querySelector(selector);
    
      const link = document.createElement('link');
      link.rel = icon.rel;
      link.href = icon.href;
      if (icon.sizes) {
        link.setAttribute('sizes', icon.sizes);
      }
    
      if (existingLink) {
        // 如果存在相同的link标签，则替换
        headElement.replaceChild(link, existingLink);
      } else {
        // 如果不存在，则添加新的link标签
        headElement.appendChild(link);
      }
    });
  }

  function createManifestLink() {
    if ("webAppManifestSettings" in window) {
      const manifest = JSON.stringify(window.webAppManifestSettings)
      let link = document.createElement("link")
      link.rel = "manifest"
      link.href = "data:text/json;charset=utf-8," + encodeURIComponent(manifest)
      
      const existingManifest = document.querySelector('link[rel="manifest"]')
      if (existingManifest) {
        document.head.replaceChild(link, existingManifest)
      } else {
        document.head.appendChild(link)
      }
    }
  }

  async function generateStartupImageBase64(src, backgroundColor, width, height) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imgSize = width > height ? height : width;
  
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
  
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const x = (width - imgSize/3) / 2;
        const y = (height - imgSize/3) / 2;
        ctx.drawImage(img, x, y, imgSize/3, imgSize/3);
        resolve(canvas.toDataURL());
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  async function createIosStartupLink() {
    const isIOS = obj.detection.isIOS();
    if (isIOS && window.webAppManifestSettings.icons.length > 0) {
      const screenWidth = window.screen.width * 2;
      const screenHeight = window.screen.height * 2;
      const color = window.webAppManifestSettings.background_color;
      const icon = window.webAppManifestSettings.icons.find(icon => icon.sizes === '512x512');

      if (icon && color) {
        const portraitImage = await generateStartupImageBase64(  // 生成竖屏启动图
          icon.src,
          color,
          screenWidth,
          screenHeight,
        );

        const landscapeImage = await generateStartupImageBase64(  // 生成横屏启动图
          icon.src,
          color,
          screenHeight,
          screenWidth,
        );

        const portraitLink = document.createElement('link');
        portraitLink.rel = 'apple-touch-startup-image';
        portraitLink.media = `screen and (device-width: ${screenWidth/2}px) and (device-height: ${screenHeight/2}px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)`;
        portraitLink.href = portraitImage;
        document.head.appendChild(portraitLink);
        
        const landscapeLink = document.createElement('link');
        landscapeLink.rel = 'apple-touch-startup-image';
        landscapeLink.media = `screen and (device-width: ${screenWidth/2}px) and (device-height: ${screenHeight/2}px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)`;
        landscapeLink.href = landscapeImage;
        document.head.appendChild(landscapeLink);
      }
    }
  }

  function checkStandalone() {
    const isIOS = obj.detection.isIOS();
    const standalone = obj.detection.isStandalone();
    if (standalone && !isIOS)
      localStorage.setItem("webAppInstalled", 'true');
  }

  function checkWebApp(pollTimes = 20, duration = 300) {
    return new Promise((resolve, _reject) => {
      let times = 0;
      const interval = setInterval(() => {
        const available = localStorage.getItem("webAppAvailable") === "true";
        const installed = localStorage.getItem("webAppInstalled") === "true";
  
        if (obj.installable || available && !installed || obj.detection.isIOS() && obj.detection.isSafari()) {
          clearInterval(interval);
          obj.emit("webAppDetected", obj.nativePrompt);
          localStorage.setItem("webAppInstalled", 'false');
          window.removeEventListener("beforeinstallprompt", installPromptHandler);
          resolve(true);
        }
  
        times++;
        if (times >= pollTimes) {
          clearInterval(interval);
          window.removeEventListener("beforeinstallprompt", installPromptHandler);
          if (installed) {
            obj.emit("webAppDetected", { detail :'launchAllowed' });
          } else {
            localStorage.setItem("webAppUnavailable", 'true');
            obj.emit("webAppDetected", { detail: 'unavailable'});
          }
          resolve(false);
        }
      }, duration);
    });
  };

  function init() {
    
 // Samsung browser does not need to do this
 if(!obj.detection.isSamsungInternet()) {
  createManifestLink();
}

    createIosStartupLink(); 
    generateWebIcon();
    checkWebApp();
    checkStandalone();
  }

  init();
})();

