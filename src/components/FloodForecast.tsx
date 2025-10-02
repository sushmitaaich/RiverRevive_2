import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Droplets, TrendingUp, MapPin, Calendar } from 'lucide-react';

interface FloodForecastProps {
  onBack: () => void;
}

export default function FloodForecast({ onBack }: FloodForecastProps) {
  const [selectedLocation, setSelectedLocation] = useState('delhi');

  const locations = [
    { id: 'delhi', name: 'Delhi - Yamuna River', risk: 'medium' },
    { id: 'varanasi', name: 'Varanasi - Ganges River', risk: 'low' },
    { id: 'ahmedabad', name: 'Ahmedabad - Sabarmati River', risk: 'high' },
    { id: 'vijayawada', name: 'Vijayawada - Krishna River', risk: 'medium' }
  ];

  const forecastData = {
    delhi: {
      currentLevel: 204.5,
      warningLevel: 205.33,
      dangerLevel: 206.0,
      trend: 'rising',
      prediction: 'Water level expected to rise by 0.3m in next 24 hours',
      riskLevel: 'medium',
      lastUpdated: '2024-01-18 14:30'
    },
    varanasi: {
      currentLevel: 58.2,
      warningLevel: 60.0,
      dangerLevel: 61.5,
      trend: 'stable',
      prediction: 'Water level stable, no significant change expected',
      riskLevel: 'low',
      lastUpdated: '2024-01-18 14:25'
    },
    ahmedabad: {
      currentLevel: 87.8,
      warningLevel: 88.0,
      dangerLevel: 89.5,
      trend: 'rising',
      prediction: 'Critical: Water level approaching warning threshold',
      riskLevel: 'high',
      lastUpdated: '2024-01-18 14:35'
    },
    vijayawada: {
      currentLevel: 12.4,
      warningLevel: 14.0,
      dangerLevel: 15.5,
      trend: 'falling',
      prediction: 'Water level decreasing, flood risk reducing',
      riskLevel: 'medium',
      lastUpdated: '2024-01-18 14:20'
    }
  };

  const currentData = forecastData[selectedLocation as keyof typeof forecastData];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'falling': return <TrendingUp className="w-5 h-5 text-green-500 transform rotate-180" />;
      case 'stable': return <div className="w-5 h-5 bg-blue-500 rounded-full"></div>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Flood Forecast & Water Level Monitoring</h1>
        <p className="text-gray-600 mt-2">AI-based forecasting models integrated with weather and hydrological data</p>
      </div>

      {/* Location Selector */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedLocation === location.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <MapPin size={16} className="text-gray-600" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(location.risk)}`}>
                  {location.risk.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{location.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Current Water Level</h3>
            {getTrendIcon(currentData.trend)}
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{currentData.currentLevel}m</div>
          <p className="text-sm text-gray-600">Last updated: {currentData.lastUpdated}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Warning Level</h3>
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">{currentData.warningLevel}m</div>
          <p className="text-sm text-gray-600">Danger Level: {currentData.dangerLevel}m</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Droplets className="w-6 h-6 text-red-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Flood Risk</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${
            currentData.riskLevel === 'high' ? 'text-red-600' :
            currentData.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {currentData.riskLevel.toUpperCase()}
          </div>
          <p className="text-sm text-gray-600">Based on AI prediction models</p>
        </div>
      </div>

      {/* Prediction & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">24-Hour Prediction</h3>
          <div className={`p-4 rounded-lg mb-4 ${
            currentData.riskLevel === 'high' ? 'bg-red-50 border border-red-200' :
            currentData.riskLevel === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <p className="text-gray-800">{currentData.prediction}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Level</span>
              <span className="font-medium">{currentData.currentLevel}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Predicted Peak</span>
              <span className="font-medium">{(currentData.currentLevel + 0.3).toFixed(1)}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time to Peak</span>
              <span className="font-medium">18-24 hours</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Weather Integration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-600 mr-2" />
                <span className="text-gray-700">Today</span>
              </div>
              <div className="text-right">
                <p className="font-medium">Heavy Rain</p>
                <p className="text-sm text-gray-600">45mm expected</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-600 mr-2" />
                <span className="text-gray-700">Tomorrow</span>
              </div>
              <div className="text-right">
                <p className="font-medium">Moderate Rain</p>
                <p className="text-sm text-gray-600">25mm expected</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-600 mr-2" />
                <span className="text-gray-700">Day 3</span>
              </div>
              <div className="text-right">
                <p className="font-medium">Light Rain</p>
                <p className="text-sm text-gray-600">10mm expected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}