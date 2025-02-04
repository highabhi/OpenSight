import React from 'react';

const Options: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Extension Settings</h1>
        
        <div className="space-y-6">
          {/* Storage Settings */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Storage Settings</h2>
            <div className="flex items-center justify-between">
              <label className="text-gray-600">Clear local storage</label>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={() => {
                  // Add clear storage functionality
                  console.log('Clearing storage...');
                }}
              >
                Clear Data
              </button>
            </div>
          </div>

          {/* Permissions Status */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Permissions Status</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-32 text-gray-600">Microphone:</span>
                <span className="text-yellow-500">Not Checked</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600">Storage:</span>
                <span className="text-green-500">Granted</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600">Downloads:</span>
                <span className="text-green-500">Granted</span>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">About</h2>
            <div className="text-gray-600">
              <p>Version: 1.0.0</p>
              <p className="mt-1">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Options;