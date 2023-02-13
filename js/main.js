/* Copyright 2020 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

// Public Suffix List: https://publicsuffix.org/list/
import pslEntries from './psl.js';
// https://data.iana.org/TLD/tlds-alpha-by-domain.txt
import tldEntries from './tld.js';

const urlInput = document.querySelector('input#url');
const urlPartsDiv = document.querySelector('div#url-parts');

if (!isSecureContext) location.protocol = 'https:';

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
  // Also want to avoid URLs like `//foo` or `foo.co.`, or `@` without a username.
  // URLs like `tv.tv` are valid.
  if (!urlText || !urlText.match(/\w{2,}\.\w{2,}/) || urlText.match(/$\./ ) ||
      urlText.match(/\/\/@/)) {
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
  const password = url.password;
  let pathname = url.pathname;
  const port = url.port;
  const search = url.search;
  const username = url.username;

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
  // Avoid a few common mistakes, such as a single `/` or missing `:`.
  if (scheme === '' &&
      (urlText.match(/^https?:\/\w/) || urlText.match(/^https?:\w/) ||
      urlText.match(/^https?\/\w/) || urlText.match(/^https?\//) || urlText.match(/\:\//))) {
    urlPartsDiv.innerHTML = 'Scheme format not valid.';
    return;
  }

  let etldRegExp;
  // Get the eTLD and eTLD+1.
  const etld = pslEntries.find((el) => {
    etldRegExp = new RegExp(`\\w+.${el}$`);
    if (el === 'co.uk') {
    }
    return hostname.match(etldRegExp);
  });
  let etld1;
  if (etld) {
    const etld1RegExp = new RegExp(`[^\/\.]+\.${etld}`);
    etld1 = urlText.match(etld1RegExp) && urlText.match(etld1RegExp)[0];
  }

  // The spans need to wrap the URL from the outside in:
  // origin > originWithoutPort > hostname > site > eTLD+1 > eTLD > TLD.

  // If the URL includes a username and/or password, the origin needs to be labelled with a
  // dotted line between the scheme and the rest of the origin.
  console.log('before', urlText, 'origin', origin);
  if (origin) {
    if (username || password) {
      const originDottedRegExp = new RegExp(`${scheme}.+${hostname}(:${port})?`);
      console.log(originDottedRegExp);
      urlPartsDiv.innerHTML = urlText.
        replace(originDottedRegExp, '<span id="origin-dotted">$&</span>');
      // Add border to part of origin after scheme.
      const originWithoutScheme = origin.split('://')[1];
      urlPartsDiv.innerHTML = urlText.
        replace(originWithoutScheme, `<span id="origin">${originWithoutScheme}</span>`);
    } else {
      urlPartsDiv.innerHTML = urlText.
        replace(origin, `<span id="origin">${origin}</span>`);
    }
    console.log('after', urlPartsDiv.innerHTML);
  }

  // Site now includes scheme, so add a dotted border between the
  // TLD+1 or eTLD+1 and the scheme.
  if (scheme) {
    const siteDottedRegExp = new RegExp(`${scheme}.+${hostname}`);
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.
      replace(siteDottedRegExp, '<span id="site-dotted">$&</span>');
  }

  // If the URL has a scheme, add a span to add a dashed border for site
  // between the scheme and the rest of the site.
  urlPartsDiv.innerHTML =
    urlPartsDiv.innerHTML.replace(hostname, `<span id="hostname">${hostname}</span>`);

  // Although the URL standard now mandates that a site must include a scheme,
  // span#site only wraps the eTLD+1 or TLD+1.
  // The scheme border is connected with the span#site border by a dotted border,
  // by wrapping the whole origin (except the port) in span#site-dotted.

  // If the URL uses an eTLD, add spans for eTLD+1 and eTLD.
  if (etld) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(etld1,
      `<span id="etld1">${etld1}</span>`);
    // Site now requires scheme (according to the URL standard).
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
  const tld = hostname.split('.').pop();
  // Check if tld is in the list at js/tld.js from the Root Zone Database.
  if (tldEntries.includes(tld.toUpperCase())) {
    const partBeforeTld = hostname.split('.').slice(-2, -1);
    const tldRegExp = new RegExp(`${partBeforeTld}.(${tld})`);
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(tldRegExp,
      partBeforeTld + '.<span id="tld">$1</span>');
  } else {
    urlPartsDiv.innerHTML = 'TLD not found in the ' +
      '<a href="https://www.iana.org/domains/root/db">Root Zone Database</a>.';
    return;
  }

  // TODO: check TLD against https://www.iana.org/domains/root/db

  // Hack: if the pathname is / then highlight the / after the origin(not a / after the scheme).
  if (pathname === '/') {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(/\/$/,
      `<span id="pathname">/</span>`);
  } else if (pathname) {
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
  if (password) {
    console.log('password:', password);
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(`:${password}@`,
      `:<span id="password">${password}</span>@`);
  }
  if (port) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(`:${port}`,
      `:<span id="port">${port}</span>`);
  }
  if (scheme) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(scheme,
      // `<span id="scheme">${scheme}</span>`);
      `<span id="scheme"><span id="origin-scheme"><span id="site-scheme">` +
          `${scheme}</span></span></span>`);
  }
  // If the URL has a hash value *and* a search string,
  // the URL API (for hash) returns the hash and the search string.
  if (search) {
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(search,
      `<span id="search">${search}</span>`);
  }
  if (username) {
    const usernameRegExp = new RegExp(`${username}([@:])`);
    urlPartsDiv.innerHTML = urlPartsDiv.innerHTML.replace(usernameRegExp,
      `<span id="username">${username}</span>$1`);
  }
};

