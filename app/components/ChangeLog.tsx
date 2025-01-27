'use client';
import { useState } from 'react';

const changes = [
  {
    date: '2025-01-26',
    version: '1.0.0',
    changes: [
      'Initial release of Crypto Crumbs'
    ]
  },
  {
    date: '2025-01-27',
    version: '1.0.1',
    changes: [
      'Enhanced response cleaning for better readability',
      'Added Change Log for transparency'
    ]
  }
];

export default function ChangeLog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        Change Log
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-lg font-semibold text-white">Change Log</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-6">
              {changes.map((change, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{change.date}</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">v{change.version}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {change.changes.map((item, i) => (
                      <li key={i} className="text-gray-700 text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 