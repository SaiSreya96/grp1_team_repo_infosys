import { Info } from 'lucide-react';

interface RegionInfoProps {
  region: string;
}

export default function RegionInfo({ region }: RegionInfoProps) {
  const regionDetails: Record<string, { description: string; characteristics: string[] }> = {
    'North Delhi': {
      description: 'Industrial and densely populated area with major commercial hubs.',
      characteristics: ['High vehicle density', 'Industrial emissions', 'Residential congestion', 'Construction activity']
    },
    'South Delhi': {
      description: 'Mostly residential with upscale neighborhoods and lower pollution zones.',
      characteristics: ['Residential areas', 'Green spaces', 'Lower traffic congestion', 'Commercial zones']
    },
    'East Delhi': {
      description: 'Mix of residential and industrial areas with significant population.',
      characteristics: ['Industrial clusters', 'Residential zones', 'Busy highways', 'Water pollution sources']
    },
    'West Delhi': {
      description: 'Industrial heartland with heavy manufacturing and transport activities.',
      characteristics: ['Major industries', 'High vehicle traffic', 'Manufacturing units', 'Construction sites']
    },
    'Central Delhi': {
      description: 'Historic and commercial core with government buildings and tourism.',
      characteristics: ['Government offices', 'Market areas', 'Tourist attractions', 'Mixed traffic']
    },
    'New Delhi (NDMC)': {
      description: 'Well-planned modern area with better infrastructure and regulated development.',
      characteristics: ['Planned layout', 'Better infrastructure', 'Lower pollution levels', 'Green areas']
    }
  };

  const details = regionDetails[region] || regionDetails['North Delhi'];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">{region}</h3>
          <p className="text-sm text-blue-800 mb-3">{details.description}</p>
          <div>
            <p className="text-xs font-medium text-blue-700 mb-2">Key Characteristics:</p>
            <div className="flex flex-wrap gap-2">
              {details.characteristics.map((char) => (
                <span
                  key={char}
                  className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
