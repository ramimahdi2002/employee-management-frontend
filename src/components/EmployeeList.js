import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({});

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
    const backendUrl = "http://localhost:8000";
    return `${backendUrl}/storage/${file}`;
  };
  

  return (
    <div className="container mt-4">
      <h2>Employee List</h2>
      <div className="mb-3">
        <Link to="/employees/new" className="btn btn-primary">
          Create New Employee
        </Link>
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
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map(emp => (
              <tr key={emp.id}>
                <td>
                  {emp.photo ? (
                    <>
                      <img 
                        src={getFileLink(emp.photo)} 
                        alt={emp.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                      />
                    </>
                  ) : (
                    'N/A'
                  )}
                </td>

                <td>
                  <Link to={`/employees/${emp.id}`}>{emp.name}</Link>
                </td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>
                <td>{emp.department}</td>
                <td>{emp.job_title}</td>
                <td>${emp.salary}</td>
                <td>{formatDate(emp.start_date)}</td>
                <td>{formatDate(emp.end_date)}</td>
                <td>
                  {emp.documents && emp.documents.length > 0 ? (
                    emp.documents.map((doc, index) => (
                      <div key={index}>
                        <a href={getFileLink(doc)} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {emp.identities && emp.identities.length > 0 ? (
                    emp.identities.map((idDoc, index) => (
                      <div key={index}>
                        <a href={getFileLink(idDoc)} target="_blank" rel="noopener noreferrer">
                          View Identity
                        </a>
                      </div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="text-center">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="d-flex justify-content-between">
        {pagination.current_page > 1 && (
          <button
            className="btn btn-secondary"
            onClick={() => fetchEmployees(pagination.current_page - 1)}
          >
            Previous
          </button>
        )}
        {pagination.current_page < pagination.last_page && (
          <button
            className="btn btn-secondary"
            onClick={() => fetchEmployees(pagination.current_page + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
