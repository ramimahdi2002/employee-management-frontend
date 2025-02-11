import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const TimesheetDetails = () => {
  const { timesheetId } = useParams();
  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    start_time: "",
    end_time: "",
    summary: "",
  });

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const response = await api.get(`/timesheets/${timesheetId}`);
        const data = response.data;

        setTimesheet(data);
        setForm({
          id: data.id,
          start_time: data.start_time.split("T")[0],
          end_time: data.end_time.split("T")[0],
          summary: data.summary,
        });
      } catch (err) {
        setError("Failed to fetch timesheet details");
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheet();
  }, [timesheetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/timesheets/${form.id}`, {
          employee_id: timesheet.employee_id,
          start_time: form.start_time,
          end_time: form.end_time,
          summary: form.summary,
        });

        const updatedResponse = await api.get(`/timesheets/${form.id}`);
        setTimesheet(updatedResponse.data);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save timesheet:", error);
    }
  };

  const openModal = (timesheet = null) => {
    if (timesheet) {
      setForm({
        id: timesheet.id,
        start_time: timesheet.start_time,
        end_time: timesheet.end_time,
        summary: timesheet.summary,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({
      id: null,
      start_time: "",
      end_time: "",
      summary: "",
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Timesheet Details</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : timesheet ? (
        <div className="card p-4 shadow-sm">
          <p><strong>ID:</strong> {timesheet.id}</p>
          <p><strong>Employee ID:</strong> {timesheet.employee_id}</p>
          <p><strong>Start Time:</strong> {new Date(timesheet.start_time).toLocaleString()}</p>
          <p><strong>End Time:</strong> {new Date(timesheet.end_time).toLocaleString()}</p>
          <p><strong>Summary:</strong> {timesheet.summary}</p>
          <p><strong>Created At:</strong> {new Date(timesheet.created_at).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(timesheet.updated_at).toLocaleString()}</p>
        </div>
      ) : (
        <p className="text-warning">No timesheet found.</p>
      )}

      <button className="btn btn-primary mt-3" onClick={() => openModal(timesheet)}>
        Edit Timesheet
      </button>

      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Timesheet</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">End Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Summary</label>
                    <textarea
                      className="form-control"
                      value={form.summary}
                      onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-success"> Update</button>
                  <button type="button" className="btn btn-secondary ms-2" onClick={closeModal}>Cancel</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default TimesheetDetails;
