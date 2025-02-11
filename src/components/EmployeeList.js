import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EmployeeForm from './EmployeeForm';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [pagination, setPagination] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    department: '',
    job_title: '',
    salary_sort: '',
  });
  const fetchEmployees = async (page = 1) => {
    try {
      const response = await api.get(`/employees?page=${page}`);
      setEmployees(response.data.data);
      setFilteredEmployees(response.data.data);
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
        setFilteredEmployees(filteredEmployees.filter(emp => emp.id !== id));      
      } catch (error) {
        console.error("Failed to delete employee:", error);
      } finally {
        setDeletingEmployee(null);
      }
    }, 500); 
  };
  useEffect(() => {
    let filtered = employees;

    if (searchQuery) {
      filtered = filtered.filter(emp =>
        Object.values(emp).some(value =>
          value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (filters.name) {
      filtered = filtered.filter(emp => emp.name.toLowerCase().includes(filters.name.toLowerCase()));
    }

    if (filters.department) {
      filtered = filtered.filter(emp => emp.department.toLowerCase().includes(filters.department.toLowerCase()));
    }

    if (filters.job_title) {
      filtered = filtered.filter(emp => emp.job_title.toLowerCase().includes(filters.job_title.toLowerCase()));
    }

    if (filters.sort === 'salary_asc') {
      filtered = [...filtered].sort((a, b) => a.salary - b.salary);
    } else if (filters.sort === 'salary_desc') {
      filtered = [...filtered].sort((a, b) => b.salary - a.salary);
    } else if (filters.sort === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === 'name_desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (filters.sort === 'email_asc') {
      filtered.sort((a, b) => a.email.localeCompare(b.email));
    } else if (filters.sort === 'email_desc') {
      filtered.sort((a, b) => b.email.localeCompare(a.email));
    } 
    setFilteredEmployees(filtered);
  }, [searchQuery, filters, employees]);

  return (
    <div className="container mt-4">
      <h2>Employee List</h2>
      <div className="mb-3 d-flex gap-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Filter by name..."
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Filter by department..."
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Filter by job title..."
          value={filters.job_title}
          onChange={(e) => setFilters({ ...filters, job_title: e.target.value })}
        />

        <select className="form-control" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="">Sort By</option>
          <option value="salary_asc">Salary Low to High</option>
          <option value="salary_desc">Salary High to Low</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
          <option value="email_asc">Email A-Z</option>
          <option value="email_desc">Email Z-A</option>

        </select>
      </div>
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
            
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {filteredEmployees.length > 0 ? (
            filteredEmployees.map(emp => (
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>×</button>
            <EmployeeForm id={selectedEmployeeId} onClose={closeModal} />
          </div>
        </div>
      )}

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
