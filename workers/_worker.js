// _worker.js

/**
 * Main Worker handler function
 * @param {Request} request - Incoming request object
 * @param {Object} env - Environment variables object
 * @returns {Promise<Response>} - Returns the processed response
 */
export default {
  async fetch(request, env, ctx) {
    const config = await getConfig(env);
    const url = new URL(request.url);
    const path = url.pathname.slice(1);
    const { isApi, isIndex } = matchPath(path, config);
    const args = { request, env, config, path, ctx };

    // 其他请求保持原有逻辑
    if (isApi) {
      return handleApiRequest(args);
    }

    // 劫持 index 页面请求
    if (isIndex) {
      return handleIndexRequest(args);
    }

    if (
      config.useVersionControl ||
      (config.useR2 && shouldUseR2(path, config))
    ) {
      return handleR2Request(args);
    }



    return env.ASSETS.fetch(request);
  },
};

/**
 * Handles API requests
 * @param {Request} request - Original request object
 * @param {Object} env - Environment variables object
 * @param {Object} config - Configuration object
 * @returns {Promise<Response>} - Returns the processed API response
 */
async function handleApiRequest(args) {
  const { request, env, config } = args;
  const x_sTime = Date.now();
  const apiUrl = await env.KV.get('apiUrl');
  const url = new URL(request.url);
  const newUrl = `${apiUrl}${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);

  const clientIP =
    request.headers.get('True-Client-IP') ||
    request.headers.get('CF-Connecting-IP');
  config.ipHeaders.forEach((header) => headers.set(header, clientIP));
  const x_e_Time = Date.now();

  return fetch(
    new Request(newUrl, {
      method: request.method,
      headers: {
        ...headers,
        ...headerDataTime(x_sTime, x_e_Time),
      },
      body: request.body,
    })
  );
}

/**
 * Handles R2 storage requests
 * @param {Request} request - Original request object
 * @param {Object} env - Environment variables object
 * @param {string} path - Request path
 * @param {Object} config - Configuration object
 * @returns {Promise<Response>} - Returns the R2 storage response
 */
async function handleR2Request(r2Res) {

  const { env, ctx, request, config } = r2Res;
  const x_sTime = Date.now();
  const versionData = await getVersionedPath(r2Res);
  const cacheUrl = await env.KV.get('r2Url') || await env.KV.get('apiUrl') || 'https://panda.cacheKeyfakedomain.cn';

  const cacheKey = `${cacheUrl}/${versionData.realPath}|${versionData.version}`;
  console.log('Cache Key:', cacheKey); // 输出cacheKey以便调试

  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (!response) {
    console.log('cache miss');
    const file = await getResource({ env, ...versionData });
    const { status, statusText } = file;
    const headers = await withHeaders({ file, x_sTime, ...r2Res, ...versionData, xFrom: 'R2' })
    const sMaxAge = parseSMaxAge(headers['Cache-Control']);
    console.log('sMaxAge:', sMaxAge);
    if (sMaxAge > 0 && !config.etagFiles.includes(getFileNameFromPath(versionData.realPath))) {
      headers['Vary'] = 'Accept-Encoding';
      response = new Response(file?.body, {
        status,
        statusText,
        headers,
      });
      ctx.waitUntil(cache.put(cacheKey, response.clone())); // 确保缓存被更新 
    } else {
      return new Response(file?.body, { status, statusText, headers });
    }
  }
  return response;
}

/**
 * Determines whether to use R2 storage
 * @param {string} path - Request path
 * @param {Object} config - Configuration object
 * @returns {boolean} - Whether to use R2 storage
 */
function shouldUseR2(path, config) {
  return config.r2Paths.some((prefix) => path.startsWith(prefix));
}

/**
 * Gets the Cache-Control header value
 * @param {string} path - Request path
 * @param {Object} config - Configuration object
 * @returns {string} - Cache-Control header value
 */
function getCacheControlHeader(path, config, request) {
  const { isIndex } = matchPath(path, config);
  const isGray = new URL(request.url).hostname.includes('gray');
  if (isIndex) {
    return 'no-cache';
  } else if (path.startsWith('assets/')) {
    return isGray ? config.cacheControlGray['assets/'] : config.cacheControl['assets/'];
  } else if (config.useVersionControl && !path.includes('/')) {
    return config.cacheControl.versionControlRoot;
  } else {
    return isGray ? config.cacheControlGray.default : config.cacheControl.default;
  }
}

/**
 * Retrieves a boolean value from KV storage
 * @param {Object} env - Environment variables object
 * @param {string} key - KV storage key
 * @returns {Promise<boolean>} - Returns the boolean value
 */
async function getKVBooleanValue(env, key) {
  const value = await env.KV.get(key);
  return value === 'true';
}

/**
 * Extracts the file name from a path
 * @param {string} path - File path
 * @returns {string} - File name
 */
function getFileNameFromPath(path) {
  return path.substring(path.lastIndexOf('/') + 1);
}

/**
 * Computes the ETag for a file
 * @param {ReadableStream} body - Readable stream of the file content
 * @returns {Promise<string>} - Returns the computed ETag
 */
async function computeETag(body) {
  const content = await new Response(body).arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-1', content);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `"${hashHex}"`; // ETag format includes quotes
}

/**
 * Retrieves the configuration
 * @param {Object} env - Environment variables object
 * @returns {Promise<Object>} - Returns the configuration object
 */
async function getConfig(env) {
  const [useR2, useVersionControl] = await Promise.all([
    getKVBooleanValue(env, 'isUseR2'),
    getKVBooleanValue(env, 'isUseVersionControl'),
  ]);

  return {
    useR2,
    useVersionControl,
    apiPaths: ['api/'],
    r2Paths: [
      '/assets/',
      '/first/',
      '/second/',
      '/svg/',
      '/images/',
      '/icons/',
      '/gif/',
      '/appReload/',
    ],
    nonVersionedPaths: ['assets/'],
    ipHeaders: ['X-Forwarded-For', 'X-Real-IP', 'CF-Connecting-IP'],
    cacheControl: {
      'assets/': 'public,s-maxage=300, max-age=86400, immutable',
      versionControlRoot: 'public, s-maxage=300, max-age=0, must-revalidate',
      default: 'public, s-maxage=300, max-age=3600',
    },
    cacheControlGray: {
      'assets/': 'public,s-maxage=60, max-age=86400, immutable',
      default: 'public, s-maxage=60, max-age=3600',
    },
    // Files that require ETag
    etagFiles: ['version.js'],
    // Paths that should have Cache-Control: no-cache
    noCachePaths: ['', 'launch', 'main/inicio'],
  };
}

/**
 * 处理 index 页面请求
 */
async function handleIndexRequest(indexRes) {
  const { env, request, config } = indexRes;
  const x_sTime = Date.now();
  try {
    // 获取原始 index.html
    let html;
    const versionData = await getVersionedPath(indexRes);
    const file = await getResource({ env, ...versionData });
    if (config.useR2) {
      // 获取资源
      html = await file.text();
    } else {
      const response = await env.ASSETS?.fetch(request);
      html = await response.text();
    }
    const modifiedContent = await transformIndexHtml({ html, ...indexRes, ...versionData });

    // 返回修改后的响应
    return new Response(modifiedContent, {
      headers: await withHeaders({ file, x_sTime, ...indexRes, ...versionData, xFrom: 'R2' })
    });

  } catch (error) {
    return new Response(`Server Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

async function getVersionedPath({ request, env, path, config }) {
  const url = new URL(request.url);
  let realPath = path;
  let version = '';
  const isGray = url.hostname.includes('gray');
  let isDev;
  try { // 获取 isDev 配置
    isDev = url.hostname.includes('dev') || (await env.KV.get('isDev')) || 'false';
  } catch (error) {
    isDev = 'false';
  }
  if (
    config.useVersionControl &&
    !config.nonVersionedPaths.some((prefix) => path.startsWith(prefix))
  ) {

    const versionValue = (await env.KV.get('appProdVersion')) || 'latest';
    version = isGray
      ? 'latest'
      : versionValue === 'latest'
        ? versionValue
        : `v${versionValue}`;
    const versionPath = `${version}`;
    if (!path.includes('.')) {
      realPath = `${versionPath}/index.html`;
    } else {
      realPath = `${versionPath}/${path}`;
    }
  }
  return { realPath, version, isGray, isDev, url };
}

/**
 * 转换 index.html 内容
 */
async function transformIndexHtml({ html, ...args }) {
  try {
    // 获取需要注入的配置
    const config = await getAppConfig(args);

    // 注入配置到 HTML
    const configScript = `
      <script>
        window.__APP_CONFIG__ = ${JSON.stringify(config)};
      </script>
    `;

    // 在 </head> 标签前注入脚本
    return html.replace('</head>', `${configScript}</head>`);
  } catch (error) {
    console.error('Error transforming HTML:', error);
    return html;
  }
}

/**
 * 当前域名缓存配置
 * @domaininfo  域名配置映射
 * @tenantInfo  租户配置映射
 * @channelInfo 渠道配置映射
 * @agencyConfig 代理商配置映射
 * @apiUrl 接口地址
 */
const CONFIG_CACHE = {
  cacheKey: (domain, version) => `cfg:${domain}:${version}`, // 缓存 key
  expirationTtl: 300, // 缓存过期时间
  fileCacheTtl: 60, // 文件缓存时间
};
async function getAppConfig(args) {
  const { env, request, version, isDev, isGray } = args;
  const { domain, searchParams, basePath, apiUrl } = await getAppPath(env, request);
  const id = searchParams.get('ch');
  const cacheKey = CONFIG_CACHE.cacheKey(`${domain.replace(/\http(s)?:\/\//g, '_')}_${id}`, version);
  let config = {};
  const result = (res) => res?.[0] ? res[1] : null;
  try {
    // 尝试从缓存获取
    const cachedConfig = await env.KV_API.get(cacheKey, 'json');
    if (cachedConfig) {
      return cachedConfig;
    }
    // 获取请求头
    const headers = asyncHeaders({ domain, id, isDev, isGray });

    const [domainInfo, channelInfo, tenantInfo, agencyConfig] = await Promise.all([
      // 获取域名信息
      getFetch(`${basePath}tenant.domainInfo`, { domain }),
      // 获取渠道信息
      getFetch(`${basePath}channel.info`, { domain, id }, headers),
      // 获取租户信息
      getFetch(`${basePath}tenant.info`, {}, headers),
      // 获取代理商配置
      getFetch(`${basePath}agency.config`, {}, headers)
    ]);

    config = {
      domainInfo: result(domainInfo),
      channelInfo: result(channelInfo),
      tenantInfo: result(tenantInfo),
      agencyConfig: result(agencyConfig),
      apiUrl,
      from: 'origin_config',
      version
    }
    try {
      // 缓存配置
      await env.KV_API.put(cacheKey,
        JSON.stringify({ ...config, from: 'kv_config' }), // 缓存配置
        { expirationTtl: CONFIG_CACHE.expirationTtl } // 缓存过期时间
      )
    } catch (error) {
      console.error('Error caching app config:', error);
    }
    return config;
  } catch (error) {
    return config;
  }
}
async function getAppPath(env, request) {
  const apiUrl = await env.KV.get('apiUrl');
  const domain = new URL(request.url).hostname;
  const searchParams = new URLSearchParams(new URL(request.url).search);
  const basePath = `${apiUrl}/api/frontend/trpc/`;
  return {
    apiUrl,
    domain,
    basePath,
    searchParams
  };
}

/**
 * 加密数据
 */
function encryptData(data) {
  try {
    // 确保数据不为空
    if (!data) return null;

    // 转换数据为字符串
    const jsonStr = JSON.stringify(data);
    if (!jsonStr) return null;

    // Base64 编码
    const base64 = btoa(encodeURIComponent(jsonStr));
    // 反转字符串
    return base64.split('').reverse().join('');
  } catch (error) {
    console.error('Encrypt error:', error);
    return null;
  }
}

function superJson(data = {}) {// 返回 tRPC 请求参数
  return { input: { "json": data } };
}
function asyncHeaders({ domain, channelId, isDev, isGray }) {
  const types = {
    'X-Dev': isDev,
    'X-Gray': isGray,
  }
  return {
    'domain': domain,
    'channelId': channelId,
    ...Object.fromEntries(Object.entries(types).filter(([key, value]) => value === true || value === 'true')),
  };
}

async function getFetch(url, params = {}, headers = {}) {
  params = superJson(params);
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 50;

  while (retryCount < maxRetries) {
    // 1. 构建请求 URL
    const urlObj = new URL(url);
    if (params.input) urlObj.searchParams.append('input', JSON.stringify(params.input));

    // 2. 发起请求
    const response = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    if (!response.ok) {
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        continue;
      }
      throw new Error(`API error: ${response.status}`);
    }

    // 3. 处理响应
    const data = await response.json();
    const encryptedData = encryptData(data);
    return [true, encryptedData];
  }

  throw new Error('Max retries reached');
}

async function getResource({ env, realPath, version }) {
  const file = await env.R2_ASSETS?.get(realPath) || await env.R2_ASSETS_FALL_BACK?.get(realPath);
  if (!file) {
    return new Response(null, {
      status: 404,
      headers: {
        'X-R2-Path': realPath,
        'X-Version': version,
      },
    });
  }
  return file;
}

function matchPath(path, config) {
  const isApi = config.apiPaths.some((apiPath) => path.includes(apiPath));
  const isIndex = config.noCachePaths.includes(path) || (!path.includes('.'));
  return {
    isApi,
    isIndex,
  };
}
async function withHeaders({
  file, // R2 文件
  realPath, // 真实路径
  path, // 请求路径
  config, // 资源配置
  version, // 版本
  request, // 请求体
  x_sTime, // 记录worker转发开始时间
  xFrom, // 记录来源
}) {
  const headers = {
    'Content-Type': file?.httpMetadata?.contentType,
    'CF-Cache-Status': file?.httpMetadata?.['cf-cache-status'],
    'R2-Cache-Control': file?.httpMetadata?.['cache-control'],
    'X-R2-Path': realPath,
    'Cache-Control': getCacheControlHeader(path, config, request),
    'X-From': xFrom || 'cache',
  };

  if (config.useVersionControl) {
    headers['X-Version'] = version;
  }
  // ETag handling logic
  const fileName = getFileNameFromPath(realPath);
  if (config.etagFiles.includes(fileName)) {
    const etag = file?.httpEtag || (await computeETag(file?.body));
    const ifNoneMatch = request.headers.get('If-None-Match');

    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers });
    }

    headers['ETag'] = etag;
  }
  const x_e_Time = Date.now(); // 记录worker转发结束时间
  return {
    ...headers,
    ...headerDataTime(x_sTime, x_e_Time),
  };
}
function headerDataTime(x_sTime, x_e_Time) {
  return {
    'X-Data-Time': `${(x_e_Time - x_sTime)}ms`,
  };
}

function parseSMaxAge(cacheControl) {
  const sMaxAgeMatch = cacheControl && cacheControl.match(/s-maxage=(\d+)/);
  return sMaxAgeMatch ? parseInt(sMaxAgeMatch[1], 10) : 0;
}
