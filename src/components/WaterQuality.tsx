import { useState } from 'react';
import { ArrowLeft, Droplets, Activity, Thermometer, Eye, Calendar, MapPin } from 'lucide-react';

interface WaterQualityProps {
  onBack: () => void;
}

export default function WaterQuality({ onBack }: WaterQualityProps) {
  const [selectedLocation, setSelectedLocation] = useState('yamuna-delhi');

  const waterQualityReports = [
    {
      id: 'yamuna-delhi',
      location: 'Yamuna River, Delhi',
      date: '2024-01-15',
      time: '10:30 AM',
      status: 'Poor',
      parameters: {
        ph: 7.8,
        dissolvedOxygen: 3.2,
        temperature: 18.5,
        turbidity: 45,
        conductivity: 850,
        totalSolids: 420,
        biochemicalOxygen: 8.5,
        chemicalOxygen: 28
      },
      overallScore: 35,
      recommendations: [
        'Immediate waste treatment required',
        'Restrict direct discharge of untreated water',
        'Monitor industrial effluents'
      ]
    },
    {
      id: 'ganges-varanasi',
      location: 'Ganges River, Varanasi',
      date: '2024-01-14',
      time: '09:15 AM',
      status: 'Moderate',
      parameters: {
        ph: 7.4,
        dissolvedOxygen: 5.8,
        temperature: 16.2,
        turbidity: 25,
        conductivity: 420,
        totalSolids: 280,
        biochemicalOxygen: 4.2,
        chemicalOxygen: 15
      },
      overallScore: 62,
      recommendations: [
        'Continue regular monitoring',
        'Reduce organic pollution sources',
        'Maintain current treatment levels'
      ]
    },
    {
      id: 'sabarmati-ahmedabad',
      location: 'Sabarmati River, Ahmedabad',
      date: '2024-01-13',
      time: '11:45 AM',
      status: 'Good',
      parameters: {
        ph: 7.2,
        dissolvedOxygen: 7.5,
        temperature: 22.1,
        turbidity: 12,
        conductivity: 320,
        totalSolids: 180,
        biochemicalOxygen: 2.8,
        chemicalOxygen: 8
      },
      overallScore: 78,
      recommendations: [
        'Maintain current water quality standards',
        'Continue pollution prevention measures',
        'Regular community awareness programs'
      ]
    }
  ];

  const currentReport = waterQualityReports.find(report => report.id === selectedLocation) || waterQualityReports[0];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getParameterStatus = (parameter: string, value: number) => {
    const standards: { [key: string]: { good: number; moderate: number } } = {
      ph: { good: 7.5, moderate: 8.0 },
      dissolvedOxygen: { good: 6.0, moderate: 4.0 },
      turbidity: { good: 10, moderate: 25 },
      biochemicalOxygen: { good: 3.0, moderate: 6.0 }
    };

    if (!standards[parameter]) return 'moderate';
    
    if (parameter === 'ph') {
      if (value >= 6.5 && value <= standards[parameter].good) return 'good';
      if (value >= 6.0 && value <= standards[parameter].moderate) return 'moderate';
      return 'poor';
    } else if (parameter === 'dissolvedOxygen') {
      if (value >= standards[parameter].good) return 'good';
      if (value >= standards[parameter].moderate) return 'moderate';
      return 'poor';
    } else {
      if (value <= standards[parameter].good) return 'good';
      if (value <= standards[parameter].moderate) return 'moderate';
      return 'poor';
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
        <h1 className="text-3xl font-bold text-gray-900">Water Quality Monitoring</h1>
        <p className="text-gray-600 mt-2">Verified reports of water quality monitoring across river systems</p>
      </div>

      {/* Location Selector */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {waterQualityReports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedLocation(report.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedLocation === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <MapPin size={16} className="text-gray-600" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{report.location}</p>
              <p className="text-xs text-gray-600">{report.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Report Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Overall Score</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${
            currentReport.overallScore >= 70 ? 'text-green-600' :
            currentReport.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {currentReport.overallScore}/100
          </div>
          <p className="text-sm text-gray-600">Water Quality Index</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Droplets className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">pH Level</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{currentReport.parameters.ph}</div>
          <p className="text-sm text-gray-600">Optimal: 6.5-8.5</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-6 h-6 text-green-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Dissolved O₂</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">{currentReport.parameters.dissolvedOxygen}</div>
          <p className="text-sm text-gray-600">mg/L</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Thermometer className="w-6 h-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Temperature</h3>
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-2">{currentReport.parameters.temperature}°C</div>
          <p className="text-sm text-gray-600">Water Temperature</p>
        </div>
      </div>

      {/* Detailed Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Parameters</h3>
          <div className="space-y-4">
            {[
              { key: 'ph', label: 'pH Level', value: currentReport.parameters.ph, unit: '' },
              { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', value: currentReport.parameters.dissolvedOxygen, unit: 'mg/L' },
              { key: 'turbidity', label: 'Turbidity', value: currentReport.parameters.turbidity, unit: 'NTU' },
              { key: 'conductivity', label: 'Conductivity', value: currentReport.parameters.conductivity, unit: 'μS/cm' },
              { key: 'totalSolids', label: 'Total Dissolved Solids', value: currentReport.parameters.totalSolids, unit: 'mg/L' },
              { key: 'biochemicalOxygen', label: 'BOD', value: currentReport.parameters.biochemicalOxygen, unit: 'mg/L' },
              { key: 'chemicalOxygen', label: 'COD', value: currentReport.parameters.chemicalOxygen, unit: 'mg/L' }
            ].map((param) => (
              <div key={param.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{param.label}</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{param.value} {param.unit}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    getParameterStatus(param.key, param.value) === 'good' ? 'bg-green-500' :
                    getParameterStatus(param.key, param.value) === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3 mb-6">
            {currentReport.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar size={16} className="mr-2" />
              <span className="text-sm">Last Updated: {currentReport.date} at {currentReport.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Eye size={16} className="mr-2" />
              <span className="text-sm">Verified by Environmental Monitoring Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}