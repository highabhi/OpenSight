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
}

interface StorageData {
  networkRequests: RequestData[];
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
  ];

  private constructor() {
    this.initializeListeners();
    this.loadStoredRequests();
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
  
      // 'data' is of the expected type and contains the 'networkRequests' property
      if (data && typeof data === 'object' && 'networkRequests' in data) {
        // Type assertion after confirming structure
        this.networkRequests = (data as { networkRequests: RequestData[] }).networkRequests || [];
      } else {
        this.networkRequests = [];
      }
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
      async (details: WebRequest.OnBeforeRequestDetailsType) => {
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
          };
      
          await this.storeRequest(request);
        } catch (error) {
          console.error('Error processing request:', error);
        }
        return { cancel: false };
      },
      { urls: ["<all_urls>"] },
      ["requestBody"]
    );

    // Listen for completed requests
    browser.webRequest.onCompleted.addListener(
      async (details: WebRequest.OnCompletedDetailsType) => {
        try {
          const requestIndex = this.networkRequests.findIndex(r => r.url === details.url);
          if (requestIndex !== -1) {
            this.networkRequests[requestIndex].status = details.statusCode;
            await this.saveRequests();
          }
        } catch (error) {
          console.error('Error updating request status:', error);
        }
      },
      { urls: ["<all_urls>"] }
    );

    // Handle messages from popup
    browser.runtime.onMessage.addListener(
        (message: unknown, sender, sendResponse) => {
          if (typeof message === 'object' && message !== null && 'type' in message && (message as { type: string }).type === 'GET_NETWORK_REQUESTS') {
            //handle the message type properly before sending the response
            sendResponse(this.networkRequests);
          }
          return true; // Keep the message channel open for async response
        }
      );
  }

  public getRequests(): RequestData[] {
    return this.networkRequests;
  }
}

// Initialize the manager
const manager = NetworkRequestManager.getInstance();

export default manager;