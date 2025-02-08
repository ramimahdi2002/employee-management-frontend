import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
