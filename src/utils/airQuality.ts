export interface AQIInfo {
  value: number;
  category: string;
  color: string;
  textColor: string;
  description: string;
}

export function getAQICategory(aqi: number): AQIInfo {
  if (aqi <= 50) {
    return {
      value: aqi,
      category: 'Good',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk'
    };
  } else if (aqi <= 100) {
    return {
      value: aqi,
      category: 'Moderate',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      description: 'Air quality is acceptable for most people'
    };
  } else if (aqi <= 150) {
    return {
      value: aqi,
      category: 'Unhealthy for Sensitive Groups',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      description: 'Members of sensitive groups may experience health effects'
    };
  } else if (aqi <= 200) {
    return {
      value: aqi,
      category: 'Unhealthy',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      description: 'Everyone may begin to experience health effects'
    };
  } else if (aqi <= 300) {
    return {
      value: aqi,
      category: 'Very Unhealthy',
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      description: 'Health alert: everyone may experience more serious health effects'
    };
  } else {
    return {
      value: aqi,
      category: 'Hazardous',
      color: 'bg-gray-800',
      textColor: 'text-gray-900',
      description: 'Health warnings of emergency conditions'
    };
  }
}

export function calculateTrend(value: number): 'up' | 'down' | 'stable' {
  const randomValue = Math.random();
  if (randomValue < 0.33) return 'down';
  if (randomValue < 0.66) return 'stable';
  return 'up';
}

export function formatDate(date: string): string {
  const d = new Date(date);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
}
