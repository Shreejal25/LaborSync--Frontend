import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from './routes/Workers/login';
import UserDashboard from './routes/Workers/menu';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './routes/Workers/UserProfilePage';
import ManagerProfilePage from './routes/Manager Routes/ManagerProfile';
import Register from './routes/Workers/register';
import AssignTaskComponent from './routes/Manager Routes/AssignTaskComponent';
import RegisterManager from './routes/Manager Routes/ManagerRegister';
import ManagerLogin from './routes/Manager Routes/ManagerLogin';
import ForgotPassword from './routes/Workers/ForgotPassword';
import ResetPassword from './routes/Workers/ResetPassword';
import ManagerDashboard from './routes/Manager Routes/ManagerDashboard';
import UserTasksComponent from './routes/Workers/UserTasksComponent';
import RoleProtectedRoute from './routes/Components/RoleProtectedRoute';
import Unauthorized from './routes/Components/unauthorized';
import CreateProject from './routes/Manager Routes/Project';


import WorkerProjectsPage from './routes/Workers/WorkerProjectsPage';

import ProjectStatus from './routes/Manager Routes/ProjectStatus';
import ReportDashboard from './routes/Manager Routes/ReportsDashboard';
import AwardPoints from './routes/Manager Routes/AwardPoints';
import CreateReward from './routes/Manager Routes/Rewards';
import ManagerRewardsView from './routes/Manager Routes/ManagerRewardsView';
import WorkerRewards from './routes/Workers/WorkerRewards';
import WorkersPointsHistory from './routes/Workers/WorkersPointsHistory';
import ManagerPointsHistory from './routes/Manager Routes/ManagerPointsHistory';
import Timesheet from './routes/Workers/Timesheet';




import Home from './routes/Homepage/Home';
import { AuthProvider } from './context/useAuth';


function App() {
  return (
   <div>
    <title>LaborSync</title>
    <helmet></helmet>
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes (Not wrapped with PrivateRoute) */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register/' element={<Register />} />
          <Route path='/register-manager' element={<RegisterManager />} />
          <Route path='/login-manager' element={<ManagerLogin />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

          {/* Private Routes (Wrapped with PrivateRoute) */}
          {/* <Route path='/user-profile' element={<PrivateRoute><UserProfile /></PrivateRoute>} /> */}
          
          
          <Route path='/view-task' element={<PrivateRoute><UserTasksComponent /></PrivateRoute>} />
          <Route path='/view-project' element={<PrivateRoute><WorkerProjectsPage /></PrivateRoute>} />

          
          {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
          <Route 
          path="/menu" 
          element={
            <RoleProtectedRoute role="user">
              <UserDashboard />
            </RoleProtectedRoute>
          } 
        />
         
        <Route 
          path="/user-profile" 
          element={

            <RoleProtectedRoute role="user">
              <UserProfile />
            </RoleProtectedRoute>
          } 
        />

        <Route 
          path="/timesheets" 
          element={

            <RoleProtectedRoute role="user">
              <Timesheet/>
            </RoleProtectedRoute>
          } 
        />

       
        <Route 
          path="/manager-dashboard" 
          element={
            <PrivateRoute>
            <RoleProtectedRoute role="manager">
              < ManagerDashboard />
            </RoleProtectedRoute>
          </PrivateRoute>

          } 
        />
         <Route 
          path="/assign-task" 
          element={
            <RoleProtectedRoute role="manager">
              < AssignTaskComponent />
            </RoleProtectedRoute>
          } 
        />
         <Route 
          path="/create-project" 
          element={
            <RoleProtectedRoute role="manager">
              < CreateProject />
            </RoleProtectedRoute>
          } 
        />

          



          <Route 
          path="/manager-profile" 
          element={
            <RoleProtectedRoute role="manager">
              < ManagerProfilePage />
            </RoleProtectedRoute>
          } 
        />

        <Route 
          path="/project-status" 
          element={
            <RoleProtectedRoute role="manager">
              < ProjectStatus />
            </RoleProtectedRoute>
          } 
        />

      < Route 
          path="/reports" 
          element={
            <RoleProtectedRoute role="manager">
              < ReportDashboard />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/award-points" 
          element={
            <RoleProtectedRoute role="manager">
              < AwardPoints />
            </RoleProtectedRoute>
          }
        />

      <Route 
          path="/create-reward" 
          element={
            <RoleProtectedRoute role="manager">
              < CreateReward />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/manager-rewards"
          element={
            <RoleProtectedRoute role="manager">
              <ManagerRewardsView />
            </RoleProtectedRoute>
          }
        />
         <Route
          path="/manager-points-history"
          element={
            <RoleProtectedRoute role="manager">
              <ManagerPointsHistory />
            </RoleProtectedRoute>
          }
        />
        
        <Route
          path="/worker-rewards"
          element={
            <RoleProtectedRoute role="user">
              <WorkerRewards />
            </RoleProtectedRoute>
          }
        />  

        <Route
          path="/worker-points-history"
          element={
            <RoleProtectedRoute role="user">
              <WorkersPointsHistory />
            </RoleProtectedRoute>
          }
        /> 

          {/* Add more routes as needed */}
        
        </Routes>

        

        
        
      </AuthProvider>
    </Router>
    </div>
  );
}

export default App;