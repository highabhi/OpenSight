import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/Tabs";
import { Alert, AlertTitle, AlertDescription } from "./ui/Alert";
import {
  BarChart,
  Activity,
  Shield,
  Cookie,
  Download,
  AlertTriangle,
} from "lucide-react";
import browser from "webextension-polyfill";
import { Image } from "lucide-react";
import { FileQuestion } from "lucide-react";

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
  direction: "upload" | "download";
  downloadType?: 'file' | 'media' | 'script' | 'stylesheet' | 'font' | 'other';
}

interface TrackerAnalysis {
  type: "data-collection" | "analytics" | "advertising" | "social" | "unknown";
  risk: "high" | "medium" | "low";
  description: string;
}

const NetworkMonitor: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [totalBandwidth, setTotalBandwidth] = useState({ up: 0, down: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response: { success: boolean; data: RequestData[] } =
          await browser.runtime.sendMessage({ type: "GET_NETWORK_REQUESTS" });
        if (response?.success && Array.isArray(response.data)) {
          setRequests(response.data);
          calculateBandwidth(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateBandwidth = (data: RequestData[]) => {
    const bandwidth = data.reduce(
      (acc, req) => ({
        up: acc.up + (req.direction === "upload" ? req.contentLength || 0 : 0),
        down:
          acc.down +
          (req.direction === "download" ? req.contentLength || 0 : 0),
      }),
      { up: 0, down: 0 }
    );

    setTotalBandwidth(bandwidth);
  };

  const analyzeTracker = (tracker: string): TrackerAnalysis => {
    // This would contain logic to analyze tracker behavior
    if (tracker.includes("analytics")) {
      return {
        type: "analytics",
        risk: "medium",
        description: "Collects user behavior data for analytics purposes",
      };
    }
    return {
      type: "unknown",
      risk: "low",
      description: "Unknown tracker type",
    };
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="w-full h-full bg-white">
      {/* Stats Banner */}
      <div className="bg-gray-900 text-white p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <div>
              <div className="text-sm opacity-75">Total Requests</div>
              <div className="text-lg font-bold">{requests.length}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <div>
              <div className="text-sm opacity-75">Bandwidth</div>
              <div className="text-lg font-bold">
                ↓{formatBytes(totalBandwidth.down)} ↑
                {formatBytes(totalBandwidth.up)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-sm opacity-75">Active Trackers</div>
              <div className="text-lg font-bold">
                {requests.filter((r) => r.trackers.length > 0).length}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Cookie className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-sm opacity-75">Cookies</div>
              <div className="text-lg font-bold">
                {requests.filter((r) => r.cookies.length > 0).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trackers">
            <Shield className="w-4 h-4 mr-2" />
            Trackers
          </TabsTrigger>
          <TabsTrigger value="cookies">
            <Cookie className="w-4 h-4 mr-2" />
            Cookies
          </TabsTrigger>
          <TabsTrigger value="downloads">
            <Download className="w-4 h-4 mr-2" />
            Downloads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {request.url}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {request.method}
                      </span>
                      {request.status && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            request.status < 400 ? "bg-green-200" : "bg-red-200"
                          }`}
                        >
                          {request.status}
                        </span>
                      )}
                      {request.contentLength && (
                        <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                          {formatBytes(request.contentLength)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trackers" className="space-y-4">
          {requests
            .filter((r) => r.trackers.length > 0)
            .map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{request.url}</h3>
                  <span className="text-xs bg-red-200 px-2 py-1 rounded">
                    {request.trackers.length} Trackers
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {request.trackers.map((tracker, idx) => {
                    const analysis = analyzeTracker(tracker);
                    return (
                      <Alert
                        key={idx}
                        variant={
                          analysis.risk === "high" ? "destructive" : "default"
                        }
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <AlertTitle className="text-sm">
                          {tracker} ({analysis.type})
                        </AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                          {analysis.description}
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="cookies" className="space-y-4">
          {requests
            .filter((r) => r.cookies.length > 0)
            .map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{request.url}</h3>
                  <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                    {request.cookies.length} Cookies
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {request.cookies.map((cookie, idx) => (
                    <div key={idx} className="text-xs bg-gray-100 p-2 rounded">
                      {cookie}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="downloads" className="space-y-6">
          {/* File Downloads */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              File Downloads (
              {requests.filter((r) => r.downloadType === "file").length})
            </h2>
            <div className="space-y-4">
              {requests
                .filter((r) => r.downloadType === "file" && r.contentLength)
                .map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 bg-blue-50"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">
                        {request.url}
                      </h3>
                      <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                        {formatBytes(request.contentLength || 0)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Type:</span>
                        <span className="bg-blue-200 px-2 py-1 rounded">
                          {request.contentType || "Unknown"}
                        </span>
                      </div>
                      {request.contentType?.startsWith("application/") && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Category:</span>
                          <span className="bg-purple-200 px-2 py-1 rounded">
                            Document/File
                          </span>
                        </div>
                      )}
                      <p className="text-gray-600">
                        Status: {request.status || "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Media Files */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Media Files (
              {requests.filter((r) => r.downloadType === "media").length})
            </h2>
            <div className="space-y-4">
              {requests
                .filter((r) => r.downloadType === "media" && r.contentLength)
                .map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 bg-green-50"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">
                        {request.url}
                      </h3>
                      <span className="text-xs bg-green-200 px-2 py-1 rounded">
                        {formatBytes(request.contentLength || 0)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>Type: {request.contentType || "Unknown"}</p>
                      <p>Status: {request.status || "Pending"}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Other Downloads */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FileQuestion className="w-5 h-5 mr-2" />
              Other Downloads (
              {requests.filter((r) => r.downloadType === "other").length})
            </h2>
            <div className="space-y-4">
              {requests
                .filter((r) => r.downloadType === "other" && r.contentLength)
                .map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 bg-yellow-50"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">
                        {request.url}
                      </h3>
                      <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                        {formatBytes(request.contentLength || 0)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>Type: {request.contentType || "Unknown"}</p>
                      <p>Status: {request.status || "Pending"}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkMonitor;
