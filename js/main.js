/* Copyright 2020 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

// Public Suffix List: https://publicsuffix.org/list/
import psl from './psl.js';

const urlInput = document.querySelector('input#url');
const urlPartsDiv = document.querySelector('div#url-parts');


// const searchParams = new URLSearchParams(window.location.search);
// const urlParam = searchParams.get('url');
// Get the value 'manually' to allow for hash values.
const urlParam = location.href.split('?url=')[1];
if (urlParam) {
  urlInput.value = urlParam;
  handleUrl();
}

urlInput.oninput = handleUrl;

function handleUrl() {
  const urlText = urlInput.value;
  // location.href = `${location.host}/?url=${urlText}`;

  // URL API allows URLs such as `https://foo` or `https://f`.
  // Also want to avoid URLs like `//foo` or `foo.co.`.
  // URLs like `tv.tv` are valid.
  if (!urlText || !urlText.match(/\w{2,}\.\w{2,}/) || urlText.match(/$\./ )) {
    urlPartsDiv.innerHTML = '';
    return;
  }

  if (urlText.match(/\s/)) {
    urlPartsDiv.innerHTML = 'URL includes a space.';
    return;
  }

  let url;

  try {
    // Hack to allow URLs without scheme.
    url = urlText.match(/^https?:\/\//) ? new URL(urlText) :
      new URL(`https://${urlText}`);
  } catch {
    console.log(`${urlText} is not a valid URL`);
    urlPartsDiv.innerHTML = '';
    return;
  }

  console.log('url', url);

  const hash = url.hash;
  const hostname = url.hostname;
  const origin = url.origin;
  let pathname = url.pathname;
  const port = url.port;
  const search = url.search;

  // Get filename.
  // Need to handle `example.com/foo` as opposed to `example.com/foo.html`
  const endPart = urlText.split('#').shift().
    split('?').shift().split('/').pop();
  // Need to handle URLs like `web.dev`: URL must have a `/` to have a filename.
  const filename = urlText.match(/\w\/\w/) && endPart.match(/\w+\.\w+/) ?
    endPart : '';

  // The URL API returns / for URLs without a pathname specified.
  // Only highlight / if it's at the end of a URL.
  if (pathname === '/' && !urlText.match(/\/$/)) {
    pathname = '';
  }
  const scheme =
    urlText.match(/^https:\/\//) ? 'https' :
      urlText.match(/^http:\/\//) ? 'http' : '';
  // Avoid a couple of common mistakes: single / or missing :
  if (scheme === '' &&
      urlText.match(/^https?:\/\w/) || urlText.match(/^https?:\w/) || urlText.match(/^https?\/\w/)) {
    urlPartsDiv.innerHTML = 'Scheme format not valid.';
    return;
  }

  let etldRegExp;
  // Get the eTLD and eTLD+1.
  const etld = psl.find((el) => {
    etldRegExp = new RegExp(`\\w+.${el}$`);
    if (el === 'co.uk') {
      // console.log(etldRegExp);
      // console.log('hostname', hostname);
    }
    return hostname.match(etldRegExp);
  });
  let etld1;
  if (etld) {
    const etld1RegExp = new RegExp(`[^\/\.]+\.${etld}`);
    etld1 = urlText.match(etld1RegExp) && urlText.match(etld1RegExp)[0];
  }

  // The spans need to wrap the URL from the outside in:
  // origin > hostname > site > eTLD+1 > eTLD > TLD.
  urlPartsDiv.innerHTML = urlText.replace(origin,
    `<span id="origin"><span id="site-origin">${origin}</span></span>`);

  urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(hostname,
    `<span id="hostname">${hostname}</span>`);

  // If the URL uses an eTLD, add spans for eTLD+1 and eTLD.
  if (etld) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(etld1,
      `<span id="etld1">${etld1}</span>`);
    // Site now requires scheme.
    // TODO: move down origin and hostname spans if there is no site span.
    if (scheme) {
      urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(`<span id="etld1">${etld1}</span>`,
        `<span id="etld1"><span id="site">${etld1}</span></span>`);
    }
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(etld,
      `<span id="etld">${etld}</span>`);
  // Site now requires scheme.
  } else if (scheme) {
    // Not eTLD, so site is TLD+1.
    const site = hostname.split('.').slice(-2).join('.');
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(site, `<span id="site">${site}</span>`);
  }

  // Wrap TLD in a span.
  // If the hostname includes an eTLD, urlPartsDiv.innerHTML will be wrapped in a span.
  // Otherwise, the whole hostname will be wrapped in a span.
  const domainParts = etld ? etld.split('.') : hostname.split('.');
  const tld = domainParts.pop();
  // tld may be empty in some scenarios
  if (tld.match(/\w{2,}/)) {
    const otherParts = domainParts.join('.');
    const tldRegExp = new RegExp(`${otherParts}.(${tld})`);
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(tldRegExp,
      otherParts + '.<span id="tld">$1</span>');
  }

  // Hack: if the pathname is / then highlight the / after the origin(not a / after the scheme).
  if (pathname === '/') {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(/\/$/,
      `<span id="pathname">/</span>`);
  } else if (pathname) {
    console.log('pathname found:', pathname);
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(pathname,
      `<span id="pathname">${pathname}</span>`);
  }

  if (filename) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(filename,
      `<span id="filename">${filename}</span>`);
  }
  if (hash) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(hash,
      `<span id="hash">${hash}</span>`);
  }
  if (port) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(`:${port}`,
      `:<span id="port">${port}</span>`);
  }
  if (scheme) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(scheme,
      // `<span id="scheme">${scheme}</span>`);
      `<span id="scheme"><span id="site-scheme">${scheme}</span></span>`);
  }
  // If the URL has a hash value *and* a search string,
  // the URL API (for hash) returns the hash and the search string.
  if (search && !hash) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(search,
      `<span id="search">${search}</span>`);
  }
};

