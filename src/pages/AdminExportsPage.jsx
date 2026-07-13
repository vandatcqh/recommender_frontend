import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  listRatingFiles,
  exportRatingsCsv,
  getRecommenderTrainStatus,
  trainRecommender,
  downloadRatingFile,
} from '../api';

export default function AdminExportsPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  /**
   * {
   *   [filename]: {
   *      status: 'TRAINING' | 'DONE',
   *      version: '05211855'
   *   }
   * }
   */
  const [trainingMap, setTrainingMap] =
    useState({});

  /**
   * lấy status của từng file
   *
   * logic:
   * - không có row => không set => hiện nút Train
   * - is_active=false => TRAINING
   * - is_active=true => DONE
   */
  const fetchTrainingStatuses = async (
    filesData
  ) => {

    const nextMap = {};

    await Promise.all(

      filesData.map(async (file) => {

        try {

          const { data } = await getRecommenderTrainStatus(file.filename);

          if (
            data.status === 'NOT_TRAINED'
          ) {
            return;
          }

          nextMap[file.filename] = {
            status: data.status,
            version: data.version,
          };

        } catch (error) {

          console.error(error);
        }
      })
    );

    setTrainingMap(nextMap);
  };

  /**
   * load files
   */
  const fetchFiles = async () => {

    try {

      setLoading(true);

      const { data } = await listRatingFiles();

      const filesData =
        data.files || [];

      setFiles(filesData);

      /**
       * mỗi lần refresh
       * thì re-check status
       */
      await fetchTrainingStatuses(
        filesData
      );

    } catch (error) {

      console.error(error);

      toast.error(
        'Không thể tải danh sách file'
      );

    } finally {

      setLoading(false);
    }
  };

  /**
   * export csv
   */
  const handleExportNow = async () => {

    try {

      setExporting(true);

      const { data } = await exportRatingsCsv();

      toast.success(
        `Đã export: ${data.filename}`
      );

      fetchFiles();

    } catch (error) {

      console.error(error);

      toast.error('Export thất bại');

    } finally {

      setExporting(false);
    }
  };

  /**
   * train model
   */
  const handleTrain = async (
    filename
  ) => {

    try {

      const { data } = await trainRecommender(filename);

      setTrainingMap((prev) => ({
        ...prev,
        [filename]: {
          status: 'TRAINING',
          version: data.version,
        },
      }));

      toast.success(
        `Started training ${data.version}`
      );

    } catch (error) {

      console.error(error);

      toast.error('Train thất bại');
    }
  };

  /**
   * download csv
   */
  const downloadFile = async (filename) => {
    try {
      const { data } = await downloadRatingFile(filename);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Download thất bại');
    }
  };

  /**
   * first load
   */
  useEffect(() => {

    fetchFiles();

  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Ratings CSV Admin
            </h1>

            <p className="text-gray-500 mt-1">
              Quản lý dataset export cho
              training và research
            </p>

          </div>

          <button
            onClick={handleExportNow}
            disabled={exporting}
            className="bg-black text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
          >
            {exporting
              ? 'Exporting...'
              : 'Export CSV Now'}
          </button>

        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">

            <h2 className="text-lg font-semibold text-gray-900">
              CSV Files
            </h2>

            <button
              onClick={fetchFiles}
              className="text-sm text-gray-600 hover:text-black"
            >
              Refresh
            </button>

          </div>

          {loading ? (

            <div className="p-10 text-center text-gray-500">
              Loading files...
            </div>

          ) : files.length === 0 ? (

            <div className="p-10 text-center text-gray-500">
              Chưa có file CSV nào
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 text-left">

                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      File Name
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Size
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Created
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Training
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {files.map((file) => {

                    const training =
                      trainingMap[
                        file.filename
                      ];

                    return (
                      <tr
                        key={file.filename}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {file.filename}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {(
                            file.size_bytes / 1024
                          ).toFixed(2)} KB
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {new Date(
                            file.created_at * 1000
                          ).toLocaleString()}
                        </td>

                        {/* Training Status */}
                        <td className="px-6 py-4">

                          {training?.status ===
                          'TRAINING' ? (

                            <span className="text-orange-500 font-semibold">
                              TRAINING...
                            </span>

                          ) : training?.status ===
                            'DONE' ? (

                            <div>

                              <div className="text-green-600 font-semibold">
                                TRAINED
                              </div>

                              <div className="mt-1">

                                <button
                                  onClick={() =>
                                    navigate(
                                      `/admin/recommender/${training.version}`
                                    )
                                  }
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  v{training.version}
                                </button>

                              </div>

                            </div>

                          ) : (

                            <button
                              onClick={() =>
                                handleTrain(
                                  file.filename
                                )
                              }
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
                            >
                              Train
                            </button>

                          )}

                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">

                          <button
                            onClick={() =>
                              downloadFile(
                                file.filename
                              )
                            }
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
                          >
                            Download
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}