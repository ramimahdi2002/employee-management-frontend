import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import EmployeeDetails from "./components/EmployeeDetails";
import TimesheetDetails from "./components/TimesheetDetails";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<EmployeeList />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/new" element={<EmployeeForm />} />
          <Route path="/employees/:id" element={<EmployeeForm />} />
          <Route path="/employees/details/:id" element={<EmployeeDetails />} />
          <Route path="/timesheet/:timesheetId" element={<TimesheetDetails />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
