import { useParams } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { predictRecommender, getRecommenderResult } from '../api';
const CATEGORY_OPTIONS = [
  { value: 'áo', label: 'Áo' },
  { value: 'quần', label: 'Quần' },
  { value: 'đầm', label: 'Đầm' },
  { value: 'chân váy', label: 'Chân Váy' },
];

const OCCASION_OPTIONS = [
  { value: 'outing', label: 'Đi chơi' },
  { value: 'work', label: 'Đi làm' },
  { value: 'party', label: 'Tiệc' },
];

const WEATHER_OPTIONS = [
  { value: 'hot', label: 'Nóng' },
  { value: 'cool', label: 'Mát' },
  { value: 'cold', label: 'Lạnh' },
];


function ContextChips({
  label,
  options,
  value,
  onChange,
}) {
  return (
    <div className="space-y-2">

      <p className="text-sm font-medium text-gray-800">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">

        {options.map((opt) => {

          const active =
            value === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange(opt.value)
              }
              className={`px-4 py-2 rounded-full text-sm transition-all border ${
                active
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-black'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

      </div>

    </div>
  );
}

export default function AdminRecommenderPage() {

  const { version } = useParams();

  // ======================
  // STATES
  // ======================

  const [userId, setUserId] =
    useState('');

  const [category, setCategory] =
    useState('');

  const [occasion, setOccasion] =
    useState('');

  const [weather, setWeather] =
    useState('');

  const [k, setK] =
    useState(10);

  const [loading, setLoading] =
    useState(false);

  const [results, setResults] =
    useState([]);

  const [jobId, setJobId] =
    useState(null);

  const [jobStatus, setJobStatus] =
    useState(null);

  // ======================
  // VALIDATION
  // ======================

  const isComplete =
    userId &&
    category &&
    occasion &&
    weather;

  // ======================
  // POLLING
  // ======================

  const pollRecommendationResult =
    (currentJobId) => {

      const interval =
        setInterval(
          async () => {

            try {

              const { data } = await getRecommenderResult(currentJobId);

              // ======================
              // PROCESSING
              // ======================

              if (
                data.status ===
                'processing'
              ) {

                setJobStatus(
                  'processing'
                );

                return;
              }

              // ======================
              // DONE
              // ======================

              if (
                data.status ===
                'done'
              ) {

                setJobStatus(
                  'done'
                );

                setResults(
                  data.items || []
                );

                setLoading(false);

                clearInterval(
                  interval
                );

                toast.success(
                  'Predict success'
                );

                return;
              }

              // ======================
              // FAILED
              // ======================

              if (
                data.status ===
                'failed'
              ) {

                setJobStatus(
                  'failed'
                );

                setLoading(false);

                clearInterval(
                  interval
                );

                toast.error(
                  data.error ||
                  'Predict failed'
                );
              }

            } catch (error) {

              console.error(error);

              setLoading(false);

              clearInterval(
                interval
              );

              toast.error(
                'Polling failed'
              );
            }

          },

          2000
        );
    };

  // ======================
  // PREDICT
  // ======================

  const handlePredict = async () => {

    if (!isComplete) {

      toast.error(
        'Vui lòng chọn đầy đủ thông tin'
      );

      return;
    }

    try {

      setLoading(true);

      setResults([]);

      const { data } = await predictRecommender({
        user_id: Number(userId),
        category,
        occasion,
        weather,
        version,
        k: Number(k),
      });

      // ======================
      // SAVE JOB INFO
      // ======================

      setJobId(
        data.job_id
      );

      setJobStatus(
        data.status
      );

      // ======================
      // EXISTING DONE RESULT
      // ======================

      if (
        data.status === 'done'
        && data.items
      ) {

        setResults(
          data.items
        );

        setLoading(false);

        toast.success(
          'Loaded cached result'
        );

        return;
      }

      // ======================
      // START POLLING
      // ======================

      pollRecommendationResult(
        data.job_id
      );

      toast.success(
        data.reused
          ? 'Using existing job'
          : 'Recommendation started'
      );

    } catch (error) {

      console.error(error);

      setLoading(false);

      toast.error(
        'Predict thất bại'
      );
    }
  };

  return (

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-900">
              Recommender Predict
            </h1>

            <p className="text-gray-500 mt-2">

              Model version:{' '}

              <span className="font-semibold text-black">
                {version}
              </span>

            </p>

          </div>

          {/* User ID + K */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <div className="space-y-2">

              <label className="text-sm font-medium text-gray-800">
                User ID
              </label>

              <input
                type="number"
                placeholder="Nhập user id..."
                value={userId}
                onChange={(e) =>
                  setUserId(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10"
              />

            </div>

            <div className="space-y-2">

              <label className="text-sm font-medium text-gray-800">
                Top K
              </label>

              <input
                type="number"
                value={k}
                onChange={(e) =>
                  setK(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10"
              />

            </div>

          </div>

          {/* Category */}
          <div className="space-y-2 mb-6">

            <label className="text-sm font-medium text-gray-800">
              Danh mục
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            >

              <option value="">
                Chọn danh mục...
              </option>

              {CATEGORY_OPTIONS.map(
                (opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                )
              )}

            </select>

          </div>

          {/* Context */}
          <div className="space-y-6">

            <ContextChips
              label="Bạn mặc để đi đâu?"
              options={
                OCCASION_OPTIONS
              }
              value={occasion}
              onChange={setOccasion}
            />

            <ContextChips
              label="Điều kiện thời tiết?"
              options={
                WEATHER_OPTIONS
              }
              value={weather}
              onChange={setWeather}
            />

          </div>

          {/* Button */}
          <button
            onClick={handlePredict}
            disabled={
              loading || !isComplete
            }
            className={`mt-8 w-full py-4 rounded-2xl text-sm font-semibold transition-all ${
              loading || !isComplete
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:opacity-90'
            }`}
          >

            {loading
              ? 'Predicting...'
              : '✨ Predict'}

          </button>

          {/* Job Info */}
          {jobId && (

            <div className="mt-4 text-sm text-gray-500">

              <span className="font-medium">
                Job ID:
              </span>{' '}

              {jobId}

              {' • '}

              <span className="capitalize">
                {jobStatus}
              </span>

            </div>

          )}

        </div>

        {/* Results */}
        <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-gray-900">
              Results
            </h2>

            <p className="text-sm text-gray-500 mt-1">

              {results.length}{' '}
              items predicted

            </p>

          </div>

          {results.length === 0 ? (

            <div className="p-10 text-center text-gray-500">
              Chưa có kết quả
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 text-left">

                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Item ID
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Score
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {results.map((item) => (

                    <tr
                      key={item.item_id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.item_id}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {Number(
                          item.score
                        ).toFixed(4)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}