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
import { downloadBlob } from '../lib/auth';

export default function AdminExportsPanel() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [trainingMap, setTrainingMap] = useState({});

  const fetchTrainingStatuses = async (filesData) => {
    const nextMap = {};
    await Promise.all(
      filesData.map(async (file) => {
        try {
          const { data } = await getRecommenderTrainStatus(file.filename);
          if (data.status === 'NOT_TRAINED') return;
          nextMap[file.filename] = {
            status: data.status,
            version: data.version,
          };
        } catch (error) {
          console.error(error);
        }
      }),
    );
    setTrainingMap(nextMap);
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data } = await listRatingFiles();
      const filesData = data.files || [];
      setFiles(filesData);
      await fetchTrainingStatuses(filesData);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách file');
    } finally {
      setLoading(false);
    }
  };

  const handleExportNow = async () => {
    try {
      setExporting(true);
      const { data } = await exportRatingsCsv();
      toast.success(`Đã export: ${data.filename}`);
      fetchFiles();
    } catch (error) {
      console.error(error);
      toast.error('Export thất bại');
    } finally {
      setExporting(false);
    }
  };

  const handleTrain = async (filename) => {
    try {
      const { data } = await trainRecommender(filename);
      setTrainingMap((prev) => ({
        ...prev,
        [filename]: { status: 'TRAINING', version: data.version },
      }));
      toast.success(`Bắt đầu train ${data.version}`);
    } catch (error) {
      console.error(error);
      toast.error('Train thất bại');
    }
  };

  const downloadFile = async (filename) => {
    try {
      const { data } = await downloadRatingFile(filename);
      downloadBlob(data, filename);
    } catch (error) {
      console.error(error);
      toast.error('Download thất bại');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-muted m-0">
          Export rating của user ra CSV để training và nghiên cứu.
        </p>
        <button
          type="button"
          onClick={handleExportNow}
          disabled={exporting}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 border-none"
        >
          {exporting ? 'Đang export…' : '⬇ Export CSV ngay'}
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text m-0">File CSV đã export</h2>
          <button
            type="button"
            onClick={fetchFiles}
            disabled={loading}
            className="text-sm text-muted hover:text-text bg-transparent border-none cursor-pointer disabled:opacity-50"
          >
            ↻ Làm mới
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted">Đang tải…</div>
        ) : files.length === 0 ? (
          <div className="p-10 text-center text-muted">Chưa có file CSV nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted">Tên file</th>
                  <th className="px-4 py-3 font-semibold text-muted">Kích thước</th>
                  <th className="px-4 py-3 font-semibold text-muted">Ngày tạo</th>
                  <th className="px-4 py-3 font-semibold text-muted">Training</th>
                  <th className="px-4 py-3 font-semibold text-muted text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const training = trainingMap[file.filename];
                  return (
                    <tr key={file.filename} className="border-t border-border">
                      <td className="px-4 py-3 font-medium text-text">{file.filename}</td>
                      <td className="px-4 py-3 text-muted">
                        {(file.size_bytes / 1024).toFixed(2)} KB
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(file.created_at * 1000).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        {training?.status === 'TRAINING' ? (
                          <span className="text-orange-500 font-semibold text-xs">TRAINING…</span>
                        ) : training?.status === 'DONE' ? (
                          <div>
                            <div className="text-green-600 font-semibold text-xs">TRAINED</div>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/recommender/${training.version}`)}
                              className="text-xs text-primary hover:underline bg-transparent border-none cursor-pointer p-0 mt-0.5"
                            >
                              v{training.version}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTrain(file.filename)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border-none cursor-pointer"
                          >
                            Train
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => downloadFile(file.filename)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:opacity-90 border-none cursor-pointer"
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
  );
}
