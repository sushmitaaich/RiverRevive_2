import React, { useState } from 'react';
import { MapPin, Camera, Send, ArrowLeft } from 'lucide-react';

interface ReportWasteProps {
  onBack: () => void;
}

export default function ReportWaste({ onBack }: ReportWasteProps) {
  const [reportData, setReportData] = useState({
    location: '',
    description: '',
    image: null as File | null,
    geoLocation: null as { lat: number; lng: number } | null
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReportData({ ...reportData, image: e.target.files[0] });
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setReportData({
            ...reportData,
            geoLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        (error) => {
          alert('Unable to get location. Please enter manually.');
        }
      );
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Waste report submitted successfully! Our team will verify and process it.');
    setReportData({ location: '', description: '', image: null, geoLocation: null });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Report Waste Location</h1>
        <p className="text-gray-600 mt-2">Upload geo-tagged photos of water bodies containing garbage</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmitReport} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Address
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={reportData.location}
                  onChange={(e) => setReportData({ ...reportData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the location address"
                  required
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <MapPin size={16} className="mr-2" />
                  Get Current Location
                </button>
                {reportData.geoLocation && (
                  <p className="text-sm text-green-600">
                    Location captured: {reportData.geoLocation.lat.toFixed(6)}, {reportData.geoLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Geo-tagged Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  required
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Camera className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-sm text-gray-600 text-center">
                    {reportData.image ? reportData.image.name : 'Click to upload geo-tagged photo of water body with garbage'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description
            </label>
            <textarea
              value={reportData.description}
              onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the type and amount of garbage, water body condition, accessibility, etc..."
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Reporting Guidelines:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure photos are geo-tagged with accurate location</li>
              <li>• Include clear images of the water body and garbage</li>
              <li>• Provide detailed description of waste type and quantity</li>
              <li>• Reports will be verified before processing</li>
              <li>• You'll earn points once the location is successfully cleaned</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Send size={16} className="mr-2" />
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}