import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EmployeeForm = ({ id, onClose }) => {
  const MINIMUM_WAGE = 800;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    job_title: '',
    department: '',
    salary: '',
    start_date: '',
    end_date: '',
    photo: null,
    documents: [],
    identities: []
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [identityPreviews, setIdentityPreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      api.get(`/employees/${id}`)
        .then(response => {
          const data = response.data;
          setFormData({
            ...data,
            start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
            end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : '',
            date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
            photo: null,
            documents: [],
            identities: []
          });

          if (data.photo) {
            setPhotoPreview(`http://localhost:8000/storage/${data.photo}`);
          }

          if (data.documents?.length > 0) {
            setDocumentPreviews(data.documents.map(doc => `http://localhost:8000/storage/${doc}`));
          }

          if (data.identities?.length > 0) {
            setIdentityPreviews(data.identities.map(idDoc => `http://localhost:8000/storage/${idDoc}`));
          }
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required.";
    if (!formData.salary) newErrors.salary = "Salary is required.";
    if (!formData.job_title.trim()) newErrors.job_title = "Job title is required.";
    if (!formData.department.trim()) newErrors.department = "Department is required.";

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.date_of_birth = "Employee must be at least 18 years old.";
      }
    }

    const salary = parseFloat(formData.salary);
    if (salary < MINIMUM_WAGE) {
      newErrors.salary = `Salary must be at least $${MINIMUM_WAGE}.`;
    }

    if (formData.identities.length === 0) {
      newErrors.identities = "At least one identity document is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, photo: file }));
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDocumentsChange = (e) => {
    setFormData(prev => ({ ...prev, documents: Array.from(e.target.files) }));
  };

  const handleIdentityChange = (e) => {
    setFormData(prev => ({ ...prev, identities: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "documents" && key !== "identities" && value) {
        data.append(key, value);
      }
    });

    if (formData.documents.length > 0) {
      formData.documents.forEach(doc => data.append('documents[]', doc));
    }

    if (formData.identities.length > 0) {
      formData.identities.forEach(idDoc => data.append('identities[]', idDoc));
    }

    try {
      if (id) {
        await api.post(`/employees/${id}?_method=PUT`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/employees`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onClose();
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error);
    }
  };

  return (
    <div>
      <h3>{id ? 'Edit Employee' : 'Create Employee'}</h3>
      <form onSubmit={handleSubmit}>
        {["name", "email", "date_of_birth", "salary", "phone", "department", "job_title", "start_date", "end_date"].map(field => (
          <div key={field}>
            <label>{field.replace('_', ' ').toUpperCase()} {["name", "email", "date_of_birth", "salary"].includes(field) && '*'}</label>
            <input 
              type={field === "salary" ? "number" : field.includes("date") ? "date" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required={["name", "email", "date_of_birth", "salary"].includes(field)}
            />
            {errors[field] && <p className="text-danger">{errors[field]}</p>}
          </div>
        ))}

        <div>
          <label>Photo</label>
          <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
          {photoPreview && <img src={photoPreview} alt="Employee" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />}
        </div>

        <div>
          <label>Documents</label>
          <input type="file" name="documents" multiple onChange={handleDocumentsChange} />
        </div>

        <div>
          <label>Identity Document *</label>
          <input type="file" name="identities" accept=".pdf,.jpg,.png" multiple onChange={handleIdentityChange} required />
          {errors.identities && <p className="text-danger">{errors.identities}</p>}
        </div>

        <button type="submit">{id ? 'Update' : 'Create'} Employee</button>
      </form>
    </div>
  );
};

export default EmployeeForm;
