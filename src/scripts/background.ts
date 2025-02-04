import browser from 'webextension-polyfill';

browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for downloads
browser.downloads.onCreated.addListener((downloadItem) => {
  console.log('Download started:', downloadItem);
});