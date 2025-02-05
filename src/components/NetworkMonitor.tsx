import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';

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

const NetworkMonitor: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const result = await browser.runtime.sendMessage({ type: 'GET_NETWORK_REQUESTS' });
        setRequests(Array.isArray(result) ? result : []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch network requests');
        console.error('Error fetching requests:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' 
      || (filter === 'trackers' && request.trackers.length > 0)
      || (filter === 'cookies' && request.cookies.length > 0);
    
    return matchesSearch && matchesFilter;
  });

  if (error) {
    return (
      <div className="w-[600px] h-[400px] p-4 bg-white">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-[600px] h-[400px] p-4 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Network Monitor</h1>
        <div className="flex gap-2">
          <select 
            className="px-2 py-1 border rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="trackers">Trackers Only</option>
            <option value="cookies">With Cookies</option>
          </select>
          <input
            type="text"
            placeholder="Search URLs..."
            className="px-2 py-1 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-100 p-3 rounded">
          <p className="text-sm text-blue-800">Total Requests</p>
          <p className="text-2xl font-bold text-blue-900">{requests.length}</p>
        </div>
        <div className="bg-red-100 p-3 rounded">
          <p className="text-sm text-red-800">Trackers Detected</p>
          <p className="text-2xl font-bold text-red-900">
            {requests.filter(r => r.trackers.length > 0).length}
          </p>
        </div>
        <div className="bg-green-100 p-3 rounded">
          <p className="text-sm text-green-800">Cookies Found</p>
          <p className="text-2xl font-bold text-green-900">
            {requests.filter(r => r.cookies.length > 0).length}
          </p>
        </div>
      </div>

      {/* Request List */}
      <div className="overflow-y-auto h-[280px] border rounded">
        {isLoading && requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No requests found</div>
        ) : (
          filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className="p-2 border-b hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 truncate">{request.url}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {request.method}
                    </span>
                    {request.status && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        request.status < 400 ? 'bg-green-200' : 'bg-red-200'
                      }`}>
                        {request.status}
                      </span>
                    )}
                    {request.trackers.length > 0 && (
                      <span className="text-xs bg-red-200 px-2 py-1 rounded">
                        {request.trackers.length} Trackers
                      </span>
                    )}
                    {request.cookies.length > 0 && (
                      <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                        {request.cookies.length} Cookies
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NetworkMonitor;