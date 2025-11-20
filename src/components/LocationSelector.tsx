import { MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LocationSelectorProps {
  location: string;
  onLocationChange: (location: string) => void;
}

export default function LocationSelector({ location, onLocationChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const locations = [
    'North Delhi',
    'South Delhi',
    'East Delhi',
    'West Delhi',
    'Central Delhi',
    'New Delhi (NDMC)'
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-lg"
      >
        <MapPin className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-gray-900">{location}</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  onLocationChange(loc);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  loc === location ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
