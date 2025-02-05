import browser, { WebRequest } from 'webextension-polyfill';

interface RequestData {
  id: string;
  url: string;
  timestamp: number;
  type: string;
  cookies: string[];
  trackers: string[];
  method: string;
  status?: number;
  contentType?: string;
  contentLength?: number;
  direction: 'upload' | 'download';
}

class NetworkRequestManager {
  private static instance: NetworkRequestManager;
  private networkRequests: RequestData[] = [];
  private readonly MAX_STORED_REQUESTS = 1000;
  
  private readonly trackerDomains = [
    'google-analytics.com',
    'doubleclick.net',
    'facebook.com',
    'analytics',
    'tracker',
    'pixel',
    'adserver',
    'tracking',
    'metrics',
  ];

  private constructor() {
    this.initializeListeners();
    void this.loadStoredRequests();
  }

  static getInstance(): NetworkRequestManager {
    if (!NetworkRequestManager.instance) {
      NetworkRequestManager.instance = new NetworkRequestManager();
    }
    return NetworkRequestManager.instance;
  }

  private async loadStoredRequests(): Promise<void> {
    try {
      const data = await browser.storage.local.get('networkRequests');
      // this.networkRequests = data.networkRequests || [];
      this.networkRequests = Array.isArray(data.networkRequests) ? data.networkRequests : [];
    } catch (error) {
      console.error('Failed to load stored requests:', error);
      this.networkRequests = [];
    }
  }

  private async saveRequests(): Promise<void> {
    try {
      await browser.storage.local.set({ networkRequests: this.networkRequests });
    } catch (error) {
      console.error('Failed to save requests:', error);
    }
  }

  private containsTracker(url: string): string[] {
    return this.trackerDomains.filter(tracker => url.toLowerCase().includes(tracker));
  }

  private determineDirection(details: WebRequest.OnBeforeRequestDetailsType): 'upload' | 'download' {
    return (details.method === 'POST' || details.method === 'PUT' || details.requestBody) 
      ? 'upload' 
      : 'download';
  }

  private async storeRequest(request: RequestData): Promise<void> {
    this.networkRequests.unshift(request);
    
    if (this.networkRequests.length > this.MAX_STORED_REQUESTS) {
      this.networkRequests = this.networkRequests.slice(0, this.MAX_STORED_REQUESTS);
    }
    
    await this.saveRequests();
  }

  private initializeListeners(): void {
    // Listen for web requests
    browser.webRequest.onBeforeRequest.addListener(
      (details: WebRequest.OnBeforeRequestDetailsType) => {
        void (async () => {
          try {
            const cookies = await browser.cookies.getAll({ url: details.url });
            
            const request: RequestData = {
              id: crypto.randomUUID(),
              url: details.url,
              timestamp: Date.now(),
              type: details.type,
              cookies: cookies.map(cookie => cookie.name),
              trackers: this.containsTracker(details.url),
              method: details.method || 'GET',
              direction: this.determineDirection(details),
            };
        
            await this.storeRequest(request);
          } catch (error) {
            console.error('Error processing request:', error);
          }
        })();
        return { cancel: false };
      },
      { urls: ["<all_urls>"] },
      ["requestBody"]
    );

    // Listen for completed requests
    browser.webRequest.onHeadersReceived.addListener(
      (details: WebRequest.OnHeadersReceivedDetailsType) => {
        void (async () => {
          try {
            const requestIndex = this.networkRequests.findIndex(r => r.url === details.url);
            if (requestIndex !== -1) {
              const contentTypeHeader = details.responseHeaders?.find(
                h => h.name.toLowerCase() === 'content-type'
              );
              const contentLengthHeader = details.responseHeaders?.find(
                h => h.name.toLowerCase() === 'content-length'
              );

              if (contentTypeHeader?.value) {
                this.networkRequests[requestIndex].contentType = contentTypeHeader.value;
              }
              
              if (contentLengthHeader?.value) {
                this.networkRequests[requestIndex].contentLength = parseInt(contentLengthHeader.value, 10);
              }
              
              this.networkRequests[requestIndex].status = details.statusCode;
              
              await this.saveRequests();
            }
          } catch (error) {
            console.error('Error updating request headers:', error);
          }
        })();
        return { cancel: false };
      },
      { urls: ["<all_urls>"] },
      ["responseHeaders"]
    );

    // Handle messages from popup
    browser.runtime.onMessage.addListener(
      (message: unknown, _sender: unknown, sendResponse: (response: any) => void) => {
        if (typeof message === 'object' && message !== null && 'type' in message) {
          const typedMessage = message as { type: string };
          if (typedMessage.type === 'GET_NETWORK_REQUESTS') {
            sendResponse({ success: true, data: this.networkRequests });
          }
        }
        return true;
      }
    );
  }
}

const manager = NetworkRequestManager.getInstance();
export default manager;