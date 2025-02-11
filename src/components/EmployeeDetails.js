import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import EmployeeForm from "./EmployeeForm"; 
import { useNavigate } from "react-router-dom";
const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    start_time: "",
    end_time: "",
    summary: "",
  });
  useEffect(() => {
    fetchEmployee();
    fetchTimesheets();
  }, [id]);    
    
    const fetchEmployee = async () => {
      try {
        const response = await api.get(`/employees/${id}`);
        setEmployee(response.data);
      } catch (error) {
        console.error("Failed to fetch employee:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };
    const fetchTimesheets = async (page = 1) => {
        try {
          const response = await api.get(`/timesheets?employee_id=${id}&page=${page}`);
          setTimesheets(response.data.data);
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
          });
        } catch (error) {
          console.error("Failed to fetch timesheets:", error);
        }
      };
      
      useEffect(() => {
        fetchTimesheets(pagination.currentPage);
      }, [pagination.currentPage]);
      
      const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
          setPagination((prev) => ({ ...prev, currentPage: newPage }));
        }
      };
    
      const handleDelete = async (timesheetId) => {
        if (!window.confirm("Are you sure you want to delete this timesheet?")) return;
        try {
          await api.delete(`/timesheets/${timesheetId}`);
          setTimesheets(timesheets.filter((t) => t.id !== timesheetId));
        } catch (error) {
          console.error("Failed to delete timesheet:", error);
        }
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          if (form.id) {
            await api.put(`/timesheets/${form.id}`, {
              employee_id: id,
              start_time: form.start_time,
              end_time: form.end_time,
              summary: form.summary,
            });
          } else {
            await api.post("/timesheets", {
              employee_id: id,
              start_time: form.start_time,
              end_time: form.end_time,
              summary: form.summary,
            });
          }
          fetchTimesheets();
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
        } else {
          setForm({
            id: null,
            start_time: "",
            end_time: "",
            summary: "",
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
      if (loading) return <p>Loading employee details...</p>;
      if (!employee) return <p>Employee not found.</p>;
    
  return (
    <div className="container mt-4">
      <div className="card p-4 position-relative">
  <div className="row">
    <div className="col-md-4 text-center">
      {employee.photo ? (
        <img
          src={`http://localhost:8000/storage/${employee.photo}`}
          alt={employee.name}
          className="img-fluid rounded"
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          className="bg-secondary text-white d-flex justify-content-center align-items-center rounded"
          style={{ width: "150px", height: "150px" }}
        >
          No Photo
        </div>
      )}
      <h4 className="mt-3">{employee.name}</h4>
      <p><strong>Email:</strong> {employee.email}</p>
      <p><strong>Phone:</strong> {employee.phone}</p>
    </div>

    <div className="col-md-8">
      <p><strong>Department:</strong> {employee.department}</p>
      <p><strong>Job Title:</strong> {employee.job_title}</p>
      <p><strong>Salary:</strong> ${employee.salary}</p>
      <p><strong>Start Date:</strong> {employee.start_date}</p>
      <p><strong>End Date:</strong> {employee.end_date || "N/A"}</p>

      <div className="mt-3">
        <h5>Documents</h5>
        {employee.documents && employee.documents.length > 0 ? (
          employee.documents.map((doc, index) => (
            <p key={index}>
              <a
                href={`http://localhost:8000/storage/${doc}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
               View File
              </a>
            </p>
          ))
        ) : (
          <p className="text-muted">No Documents</p>
        )}
      </div>

      <div className="mt-3">
        <h5>Identity Files</h5>
        {employee.identities && employee.identities.length > 0 ? (
          employee.identities.map((idFile, index) => (
            <p key={index}>
              <a
                href={`http://localhost:8000/storage/${idFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                View File
              </a>
            </p>
          ))
        ) : (
          <p className="text-muted">No Identity Files</p>
        )}
      </div>
    </div>
  </div>

  <button
    className="btn btn-warning position-absolute"
    style={{ bottom: "20px", right: "20px" }}
    onClick={() => setShowModal(true)}
  >
    Edit Employee
  </button>
</div>


      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Employee</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <EmployeeForm id={id} onClose={() => setShowModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-4" style={{ marginBottom: "100px" }}>
      <h3>Timesheets</h3>
      <button className="btn btn-primary mb-3" onClick={() => openModal()}>
        Add Timesheet
      </button>
      
      <table className="table table-bordered">
        <thead className="bg-primary text-white">
          <tr>
            <th>ID</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Summary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.length > 0 ? (
            timesheets.map((ts) => (
              <tr key={ts.id}>
                <td>{ts.id}</td>
                <td>{ts.start_time}</td>
                <td>{ts.end_time}</td>
                <td>{ts.summary || "N/A"}</td>
                <td>
                <Link to={`/timesheet/${ts.id}`} className="btn-sm me-2 btn-primary ">
                View Details
                </Link>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => openModal(ts)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ts.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No timesheets found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>
          Page {pagination.currentPage} of {pagination.lastPage}
        </span>
        <div>
          <button
            className="btn btn-secondary btn-sm me-2"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </button>

          <button
            className="btn btn-secondary btn-sm"
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>

      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{form.id ? "Edit Timesheet" : "Add Timesheet"}</h5>
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
                  <button type="submit" className="btn btn-success">{form.id ? "Update" : "Save"}</button>
                  <button type="button" className="btn btn-secondary ms-2" onClick={closeModal}>Cancel</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDetails;
