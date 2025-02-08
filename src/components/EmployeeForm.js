import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (id) {
      api.get(`/employees/${id}`)
        .then(response => {
          const data = response.data;
          setFormData({
            ...data,
            photo: null,
            documents: [],
            identities: []
          });

          if (data.photo) {
            setPhotoPreview(`http://localhost:8000/storage/${data.photo}`);
          }

          if (data.documents && data.documents.length > 0) {
            setDocumentPreviews(
              data.documents.map(doc => `http://localhost:8000/storage/${doc}`)
            );
          }

          if (data.identities && data.identities.length > 0) {
            setIdentityPreviews(
              data.identities.map(idDoc => `http://localhost:8000/storage/${idDoc}`)
            );
          }
        })
        .catch(err => console.error(err));
    }
  }, [id]);

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
    setFormData(prev => ({ ...prev, documents: e.target.files }));
  };

  const handleIdentityChange = (e) => {
    setFormData(prev => ({ ...prev, identities: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "documents" && key !== "identities" && value) {
        data.append(key, value);
      }
    });

    if (formData.photo) {
      data.append("photo", formData.photo);
    }

    if (formData.documents.length > 0) {
      Array.from(formData.documents).forEach(file => {
        data.append("documents[]", file);
      });
    }

    if (formData.identities.length > 0) {
      Array.from(formData.identities).forEach(file => {
        data.append("identities[]", file);
      });
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

      navigate('/employees');
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name *</label>
        <input name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div>
        <label>Email *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div>
        <label>Phone</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
      </div>

      <div>
        <label>Date of Birth</label>
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
      </div>

      <div>
        <label>Job Title</label>
        <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} />
      </div>

      <div>
        <label>Department</label>
        <input type="text" name="department" value={formData.department} onChange={handleChange} />
      </div>

      <div>
        <label>Salary</label>
        <input type="number" name="salary" value={formData.salary} onChange={handleChange} />
      </div>

      <div>
        <label>Start Date</label>
        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
      </div>

      <div>
        <label>End Date</label>
        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
      </div>

      <div>
        <label>Photo</label>
        <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
      </div>

      {photoPreview && (
        <div>
          <img src={photoPreview} alt="Employee" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
        </div>
      )}

      <div>
        <label>Documents</label>
        <input type="file" name="documents" multiple onChange={handleDocumentsChange} />
      </div>

      {documentPreviews.length > 0 && (
        <div>
          <h4>Existing Documents</h4>
          {documentPreviews.map((doc, index) => (
            <div key={index}>
              {doc.endsWith('.pdf') ? (
                <a href={doc} target="_blank" rel="noopener noreferrer">View Document {index + 1}</a>
              ) : (
                <img src={doc} alt={`Document ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <label>Identity Document</label>
        <input type="file" name="identities" accept=".pdf,.jpg,.png" multiple onChange={handleIdentityChange} />
      </div>

      {identityPreviews.length > 0 && (
        <div>
          <h4>Existing Identity Documents</h4>
          {identityPreviews.map((idDoc, index) => (
            <div key={index}>
              {idDoc.endsWith('.pdf') ? (
                <a href={idDoc} target="_blank" rel="noopener noreferrer">View Identity {index + 1}</a>
              ) : (
                <img src={idDoc} alt={`Identity ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <button type="submit">{id ? 'Update' : 'Create'} Employee</button>
    </form>
  );
};

export default EmployeeForm;
