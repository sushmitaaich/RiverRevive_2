import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Droplets, TrendingUp, MapPin, Calendar } from 'lucide-react';

interface FloodForecastProps {
  onBack: () => void;
}

export default function FloodForecast({ onBack }: FloodForecastProps) {
  const [selectedLocation, setSelectedLocation] = useState('delhi');

  const locations = [
    { id: 'delhi', name: 'Delhi - Industrial Ward 12', risk: 'medium' },
    { id: 'varanasi', name: 'Varanasi - Market Cluster B', risk: 'low' },
    { id: 'ahmedabad', name: 'Ahmedabad - Transfer Station East', risk: 'high' },
    { id: 'vijayawada', name: 'Vijayawada - Peri-urban Dump Zone', risk: 'medium' },
  ];

  const forecastData = {
    delhi: {
      currentLevel: 204.5,
      warningLevel: 205.33,
      dangerLevel: 206.0,
      trend: 'rising',
      prediction: 'Heavy rainfall may disrupt access to cleanup routes over the next 24 hours',
      riskLevel: 'medium',
      lastUpdated: '2024-01-18 14:30',
    },
    varanasi: {
      currentLevel: 58.2,
      warningLevel: 60.0,
      dangerLevel: 61.5,
      trend: 'stable',
      prediction: 'Weather conditions remain stable for scheduled cleanup operations',
      riskLevel: 'low',
      lastUpdated: '2024-01-18 14:25',
    },
    ahmedabad: {
      currentLevel: 87.8,
      warningLevel: 88.0,
      dangerLevel: 89.5,
      trend: 'rising',
      prediction: 'Critical: flooding may affect access roads near the waste hotspot',
      riskLevel: 'high',
      lastUpdated: '2024-01-18 14:35',
    },
    vijayawada: {
      currentLevel: 12.4,
      warningLevel: 14.0,
      dangerLevel: 15.5,
      trend: 'falling',
      prediction: 'Flood risk is easing and transport access is improving',
      riskLevel: 'medium',
      lastUpdated: '2024-01-18 14:20',
    },
  };

  const currentData = forecastData[selectedLocation as keyof typeof forecastData];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'falling':
        return <TrendingUp className="h-5 w-5 rotate-180 text-green-500" />;
      case 'stable':
        return <div className="h-5 w-5 rounded-full bg-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="rr-page">
      <div className="rr-page-hero mb-8">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <p className="rr-page-kicker">Environmental Monitoring</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Flood Forecast & Route Risk Monitoring</h1>
        <p className="mt-4 max-w-3xl text-emerald-50/90">
          AI-assisted forecasting for weather disruption around land cleanup zones.
        </p>
      </div>

      <div className="rr-card mb-6 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Select Location</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location.id)}
              className={`rounded-[1.5rem] border-2 p-4 text-left transition-all ${
                selectedLocation === location.id
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-emerald-100/80 bg-white/80 hover:border-emerald-200'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <MapPin size={16} className="text-gray-600" />
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRiskColor(location.risk)}`}>
                  {location.risk.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{location.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rr-stat-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Current Flood Metric</h3>
            {getTrendIcon(currentData.trend)}
          </div>
          <div className="mb-2 text-3xl font-bold text-blue-600">{currentData.currentLevel}m</div>
          <p className="text-sm text-gray-600">Last updated: {currentData.lastUpdated}</p>
        </div>

        <div className="rr-stat-card p-6">
          <div className="mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-900">Warning Threshold</h3>
          </div>
          <div className="mb-2 text-3xl font-bold text-yellow-600">{currentData.warningLevel}m</div>
          <p className="text-sm text-gray-600">Danger Level: {currentData.dangerLevel}m</p>
        </div>

        <div className="rr-stat-card p-6">
          <div className="mb-4 flex items-center">
            <Droplets className="mr-2 h-6 w-6 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900">Site Risk</h3>
          </div>
          <div
            className={`mb-2 text-3xl font-bold ${
              currentData.riskLevel === 'high'
                ? 'text-red-600'
                : currentData.riskLevel === 'medium'
                  ? 'text-yellow-600'
                  : 'text-green-600'
            }`}
          >
            {currentData.riskLevel.toUpperCase()}
          </div>
          <p className="text-sm text-gray-600">Based on AI prediction models</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rr-card p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-900">24-Hour Site Outlook</h3>
          <div
            className={`mb-4 rounded-[1.5rem] p-4 ${
              currentData.riskLevel === 'high'
                ? 'border border-red-200 bg-red-50'
                : currentData.riskLevel === 'medium'
                  ? 'border border-yellow-200 bg-yellow-50'
                  : 'border border-green-200 bg-green-50'
            }`}
          >
            <p className="text-gray-800">{currentData.prediction}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Level</span>
              <span className="font-medium">{currentData.currentLevel}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Predicted Peak</span>
              <span className="font-medium">{(currentData.currentLevel + 0.3).toFixed(1)}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Time to Peak</span>
              <span className="font-medium">18-24 hours</span>
            </div>
          </div>
        </div>

        <div className="rr-card p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-900">Weather Integration</h3>
          <div className="space-y-4">
            {[
              { label: 'Today', title: 'Heavy Rain', detail: '45mm expected' },
              { label: 'Tomorrow', title: 'Moderate Rain', detail: '25mm expected' },
              { label: 'Day 3', title: 'Light Rain', detail: '10mm expected' },
            ].map((entry) => (
              <div key={entry.label} className="rr-card-muted flex items-center justify-between p-3">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-600" />
                  <span className="text-gray-700">{entry.label}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-gray-600">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
