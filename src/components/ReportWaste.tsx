import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Camera, MapPin, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submitWasteReport } from '../lib/cleanup';

interface ReportWasteProps {
  onBack: () => void;
}

const wasteTypeOptions = ['plastic', 'mixed', 'construction', 'organic', 'electronic'];

export default function ReportWaste({ onBack }: ReportWasteProps) {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    location: '',
    description: '',
    density: 'medium',
    wasteTypes: ['mixed'],
    image: null as File | null,
    geoLocation: null as { lat: number; lng: number } | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setReportData((current) => ({ ...current, image: event.target.files?.[0] ?? null }));
    }
  };

  const handleGetLocation = () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setReportData((current) => ({
          ...current,
          geoLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }));
      },
      () => {
        setError('Unable to capture your browser location. Please allow location access and try again.');
      },
    );
  };

  const toggleWasteType = (type: string) => {
    setReportData((current) => {
      const exists = current.wasteTypes.includes(type);

      if (exists && current.wasteTypes.length === 1) {
        return current;
      }

      return {
        ...current,
        wasteTypes: exists
          ? current.wasteTypes.filter((item) => item !== type)
          : [...current.wasteTypes, type],
      };
    });
  };

  const handleSubmitReport = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setError('You need to be logged in to submit a report.');
      return;
    }

    if (!reportData.image) {
      setError('Please upload a photo.');
      return;
    }

    if (!reportData.geoLocation) {
      setError('Please capture your current browser location before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const result = await submitWasteReport({
        reporterId: user.id,
        address: reportData.location,
        description: reportData.description,
        density: reportData.density,
        wasteTypes: reportData.wasteTypes,
        browserLocation: reportData.geoLocation,
        imageFile: reportData.image,
      });

      setMessage(result.verificationMessage);
      setReportData({
        location: '',
        description: '',
        density: 'medium',
        wasteTypes: ['mixed'],
        image: null,
        geoLocation: null,
      });
    } catch (submitError: any) {
      setError(submitError.message ?? 'Unable to submit the report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Report Land Waste</h1>
        <p className="text-slate-600 mt-2">
          Upload a geo-tagged photo of roadside, market, residential, or public-space waste.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-md p-6">
        <form onSubmit={handleSubmitReport} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location Address</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={reportData.location}
                  onChange={(event) =>
                    setReportData((current) => ({ ...current, location: event.target.value }))
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter the land location or landmark"
                  required
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 flex items-center justify-center"
                >
                  <MapPin size={16} className="mr-2" />
                  Capture Browser Location
                </button>
                {reportData.geoLocation && (
                  <p className="text-sm text-emerald-700">
                    Captured location: {reportData.geoLocation.lat.toFixed(6)},{' '}
                    {reportData.geoLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Geo-tagged Photo
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  required
                />
                <label htmlFor="image-upload" className="flex flex-col items-center cursor-pointer">
                  <Camera className="w-12 h-12 text-slate-400 mb-4" />
                  <span className="text-sm text-slate-600 text-center">
                    {reportData.image
                      ? reportData.image.name
                      : 'Click to upload a photo with camera GPS metadata enabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Waste Density</label>
              <select
                value={reportData.density}
                onChange={(event) =>
                  setReportData((current) => ({ ...current, density: event.target.value }))
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Waste Types</label>
              <div className="flex flex-wrap gap-2">
                {wasteTypeOptions.map((type) => {
                  const active = reportData.wasteTypes.includes(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleWasteType(type)}
                      className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Description</label>
            <textarea
              value={reportData.description}
              onChange={(event) =>
                setReportData((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describe the waste pile, how severe it is, the surrounding landmark, and whether access is easy for cleanup teams."
              required
            />
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <h3 className="font-medium text-emerald-900 mb-2">Submission Checks</h3>
            <ul className="text-sm text-emerald-800 space-y-1">
              <li>• Browser location is stored with every submitted report.</li>
              <li>• Photo GPS metadata is compared against that browser location.</li>
              <li>• Matching photos become pending reports for the municipal admin.</li>
              <li>• Non-matching or metadata-missing photos are marked rejected.</li>
              <li>• Points are awarded only after the cleanup event is completed.</li>
            </ul>
          </div>

          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-60 flex items-center"
            >
              <Send size={16} className="mr-2" />
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
