import React from 'react';

const Popup: React.FC = () => {
  return (
    <div className="w-[300px] p-4 bg-white">
      <h1 className="text-xl font-bold text-gray-800">OpenSight</h1>
      <div className="mt-4">
        <button className="px-4 py-2 bg-blue-500 text-black text-2xl rounded hover:bg-blue-600">
          Hola
        </button>
      </div>
    </div>
  );
};

export default Popup;