import React, { useState } from 'react';
import { ArrowLeft, Activity, Droplets, Plus, Save, Calendar, MapPin, CheckCircle } from 'lucide-react';

interface AdminWaterQualityProps {
  onBack: () => void;
}

export default function AdminWaterQuality({ onBack }: AdminWaterQualityProps) {
  const [selectedLocation, setSelectedLocation] = useState('yamuna-delhi');
  const [showAddReport, setShowAddReport] = useState(false);
  const [newReport, setNewReport] = useState({
    location: '',
    ph: '',
    dissolvedOxygen: '',
    temperature: '',
    turbidity: '',
    conductivity: '',
    totalSolids: '',
    biochemicalOxygen: '',
    chemicalOxygen: ''
  });

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
      testedBy: 'Dr. Rajesh Kumar'
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
      testedBy: 'Dr. Priya Singh'
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

  const handleSaveReport = () => {
    if (newReport.location && newReport.ph) {
      alert('New water quality report saved successfully!');
      setShowAddReport(false);
      setNewReport({
        location: '',
        ph: '',
        dissolvedOxygen: '',
        temperature: '',
        turbidity: '',
        conductivity: '',
        totalSolids: '',
        biochemicalOxygen: '',
        chemicalOxygen: ''
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Admin Water Quality Control</h1>
        <p className="text-gray-600 mt-2">Conduct and manage water quality assessments</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Quality Assessment Control</h2>
          <button
            onClick={() => setShowAddReport(!showAddReport)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add New Report
          </button>
        </div>

        {showAddReport && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Water Quality Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Location (e.g., Yamuna River, Delhi)"
                value={newReport.location}
                onChange={(e) => setNewReport({...newReport, location: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="pH Level"
                value={newReport.ph}
                onChange={(e) => setNewReport({...newReport, ph: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Dissolved Oxygen (mg/L)"
                value={newReport.dissolvedOxygen}
                onChange={(e) => setNewReport({...newReport, dissolvedOxygen: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Temperature (°C)"
                value={newReport.temperature}
                onChange={(e) => setNewReport({...newReport, temperature: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Turbidity (NTU)"
                value={newReport.turbidity}
                onChange={(e) => setNewReport({...newReport, turbidity: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Conductivity (μS/cm)"
                value={newReport.conductivity}
                onChange={(e) => setNewReport({...newReport, conductivity: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowAddReport(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Save size={16} className="mr-2" />
                Save Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location Selector */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Assessments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {waterQualityReports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedLocation(report.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
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
              <p className="text-xs text-gray-600">{report.date} • Score: {report.overallScore}/100</p>
              <p className="text-xs text-gray-500">By {report.testedBy}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Report View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Current Assessment Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Overall Score</span>
              <span className={`font-bold text-lg ${
                currentReport.overallScore >= 70 ? 'text-green-600' :
                currentReport.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {currentReport.overallScore}/100
              </span>
            </div>
            
            {[
              { key: 'ph', label: 'pH Level', value: currentReport.parameters.ph, unit: '' },
              { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', value: currentReport.parameters.dissolvedOxygen, unit: 'mg/L' },
              { key: 'temperature', label: 'Temperature', value: currentReport.parameters.temperature, unit: '°C' },
              { key: 'turbidity', label: 'Turbidity', value: currentReport.parameters.turbidity, unit: 'NTU' },
              { key: 'conductivity', label: 'Conductivity', value: currentReport.parameters.conductivity, unit: 'μS/cm' }
            ].map((param) => (
              <div key={param.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{param.label}</span>
                <span className="font-medium">{param.value} {param.unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Actions</h3>
          <div className="space-y-3 mb-6">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
              Schedule Follow-up Assessment
            </button>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
              Publish Report to Citizens
            </button>
            <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">
              Generate Detailed Report
            </button>
            <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700">
              Send to Environmental Board
            </button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Assessment History</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-500 mr-2" />
                <span>Assessment completed - {currentReport.date}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="text-blue-500 mr-2" />
                <span>Next scheduled - Jan 22, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}