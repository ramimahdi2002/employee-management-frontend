import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api"; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const getEmployees = (page = 1) => api.get(`api/employees?page=${page}`);
export const getEmployeeById = (id) => api.get(`api/employees/${id}`);
export const createEmployee = (data) => api.post("api/employees", data);
export const updateEmployee = (id, data) => api.put(`api/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`api/employees/${id}`);

export const getTimesheets = (employeeId, page = 1) =>
  api.get(`/timesheets`, { params: { employee_id: employeeId, page } });
export const getTimesheetById = (id) => api.get(`api/timesheets/${id}`);
export const createTimesheet = (data) => api.post("api/timesheets", data);
export const updateTimesheet = (id, data) => api.put(`api/timesheets/${id}`, data);
export const deleteTimesheet = (id) => api.delete(`api/timesheets/${id}`);

export default api;
