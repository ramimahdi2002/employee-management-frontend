import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EmployeeForm from './EmployeeForm';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [pagination, setPagination] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const fetchEmployees = async (page = 1) => {
    try {
      const response = await api.get(`/employees?page=${page}`);
      setEmployees(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
      });
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getFileLink = (file) => {
    if (!file) return '';
    return `http://localhost:8000/storage/${file}`;
  };

  const openModal = (id = null) => {
    setSelectedEmployeeId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeId(null);
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    setDeletingEmployee(id);

    setTimeout(async () => {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (error) {
        console.error("Failed to delete employee:", error);
      } finally {
        setDeletingEmployee(null);
      }
    }, 500); // Delay for animation
  };

  return (
    <div className="container mt-4">
      <h2>Employee List</h2>
      <div className="mb-3">
        <button className="btn btn-primary" onClick={() => openModal()}>
          Create New Employee
        </button>
      </div>
      <table className="table table-bordered table-striped">
        <thead className="bg-primary text-white">
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Job Title</th>
            <th>Salary</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Documents</th>
            <th>Identity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map(emp => (
              <tr key={emp.id} className={deletingEmployee === emp.id ? 'vanish' : ''}>
                <td>
                  {emp.photo ? (
                    <img 
                      src={getFileLink(emp.photo)} 
                      alt={emp.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                    />
                  ) : 'N/A'}
                </td>
                <td>
                <a href={`/employees/details/${emp.id}`} className="text-primary">
                  {emp.name}
                </a>
                </td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>
                <td>{emp.department}</td>
                <td>{emp.job_title}</td>
                <td>${emp.salary}</td>
                <td>{formatDate(emp.start_date)}</td>
                <td>{formatDate(emp.end_date)}</td>
                <td>
                  {emp.documents?.length > 0 ? (
                    emp.documents.map((doc, index) => (
                      <div key={index}>
                        <a href={getFileLink(doc)} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </div>
                    ))
                  ) : 'N/A'}
                </td>
                <td>
                  {emp.identities?.length > 0 ? (
                    emp.identities.map((idDoc, index) => (
                      <div key={index}>
                        <a href={getFileLink(idDoc)} target="_blank" rel="noopener noreferrer">
                          View Identity
                        </a>
                      </div>
                    ))
                  ) : 'N/A'}
                </td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => openModal(emp.id)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDelete(emp.id)}>
                    Delete
                  </button>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className="text-center">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-between">
        {pagination.current_page > 1 && (
          <button className="btn btn-secondary" onClick={() => fetchEmployees(pagination.current_page - 1)}>
            Previous
          </button>
        )}
        {pagination.current_page < pagination.last_page && (
          <button className="btn btn-secondary" onClick={() => fetchEmployees(pagination.current_page + 1)}>
            Next
          </button>
        )}
      </div>

      {/* Employee Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>×</button>
            <EmployeeForm id={selectedEmployeeId} onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Modal & Animation Styling */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 5px;
          width: 600px;
          max-width: 90%;
          position: relative;
        }
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
        .vanish {
          animation: fadeOut 0.5s forwards;
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeList;
