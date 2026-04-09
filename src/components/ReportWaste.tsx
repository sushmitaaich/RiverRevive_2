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
        wasteTypes: exists ? current.wasteTypes.filter((item) => item !== type) : [...current.wasteTypes, type],
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
    <div className="rr-page">
      <div className="rr-page-hero mb-8">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <p className="rr-page-kicker">Field Report</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Report Land Waste</h1>
        <p className="mt-4 max-w-3xl text-emerald-50/90">
          Upload a geo-tagged photo of roadside, market, residential, or public-space waste.
        </p>
      </div>

      <div className="rr-card p-6">
        <form onSubmit={handleSubmitReport} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Location Address</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={reportData.location}
                  onChange={(event) => setReportData((current) => ({ ...current, location: event.target.value }))}
                  className="rr-input"
                  placeholder="Enter the land location or landmark"
                  required
                />
                <button type="button" onClick={handleGetLocation} className="rr-btn-primary w-full">
                  <MapPin size={16} />
                  Capture Browser Location
                </button>
                {reportData.geoLocation && (
                  <p className="text-sm text-emerald-700">
                    Captured location: {reportData.geoLocation.lat.toFixed(6)}, {reportData.geoLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Upload Geo-tagged Photo</label>
              <div className="rounded-[1.5rem] border-2 border-dashed border-emerald-200 bg-white/75 p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  required
                />
                <label htmlFor="image-upload" className="flex cursor-pointer flex-col items-center">
                  <Camera className="mb-4 h-12 w-12 text-slate-400" />
                  <span className="text-center text-sm text-slate-600">
                    {reportData.image ? reportData.image.name : 'Click to upload a photo with camera GPS metadata enabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Waste Density</label>
              <select
                value={reportData.density}
                onChange={(event) => setReportData((current) => ({ ...current, density: event.target.value }))}
                className="rr-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Waste Types</label>
              <div className="flex flex-wrap gap-2">
                {wasteTypeOptions.map((type) => {
                  const active = reportData.wasteTypes.includes(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleWasteType(type)}
                      className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-emerald-100 bg-white text-slate-700 hover:border-emerald-300'
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Detailed Description</label>
            <textarea
              value={reportData.description}
              onChange={(event) => setReportData((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              className="rr-input"
              placeholder="Describe the waste pile, how severe it is, the surrounding landmark, and whether access is easy for cleanup teams."
              required
            />
          </div>

          <div className="rr-card-muted p-4">
            <h3 className="mb-2 font-medium text-emerald-900">Submission Checks</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>- Browser location is stored with every submitted report.</li>
              <li>- Photo GPS metadata is compared against that browser location.</li>
              <li>- Matching photos become pending reports for the municipal admin.</li>
              <li>- Non-matching or metadata-missing photos are marked rejected.</li>
              <li>- Points are awarded only after the cleanup event is completed.</li>
            </ul>
          </div>

          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
            </div>
          )}

          {error && (
            <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onBack} className="rr-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rr-btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
