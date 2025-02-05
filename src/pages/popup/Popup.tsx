import React from 'react';
import NetworkMonitor from '../../components/NetworkMonitor';
import '../../styles/global.css'

const Popup: React.FC = () => {
  return (
    <div className="bg-gray-100">
      <NetworkMonitor />
    </div>
  );
};

export default Popup;