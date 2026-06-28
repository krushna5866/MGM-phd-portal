import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  ClipboardList, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Bell,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Award
} from 'lucide-react';
import StudentDashboard from '../components/Dashboard/StudentDashboard';
import CoordinatorDashboard from '../components/Dashboard/CoordinatorDashboard';
import CoEDashboard from '../components/Dashboard/CoEDashboard';
import FacultyDashboard from '../components/Dashboard/FacultyDashboard';
import BUTRDashboard from '../components/Dashboard/BUTRDashboard';

import AdmissionForm from '../components/Modules/AdmissionForm';
import MeritList from '../components/Modules/MeritList';

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      api.get('/applications/')
        .then(res => {
          if (res.data && res.data.length > 0) {
            setApplication(res.data[0]);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  if (!user) return null;

  let studentLinks = [
    { to: '/dashboard', icon: <LayoutDashboard />, label: 'Overview' },
    { to: '/dashboard/admission', icon: <FileText />, label: 'Admission' },
    { to: '/dashboard/exam', icon: <ClipboardList />, label: 'PET Exam' },
  ];

  if (application?.current_level === 'ADMISSION_COMPLETE') {
    studentLinks.push(
      { to: '/dashboard/supervisor', icon: <Users />, label: 'Supervisor' },
      { to: '/dashboard/coursework', icon: <BookOpen />, label: 'Coursework' },
      { to: '/dashboard/progress', icon: <Clock />, label: 'Progress' },
      { to: '/dashboard/thesis', icon: <GraduationCap />, label: 'Thesis' }
    );
  }

  const sidebarLinks = {
    STUDENT: studentLinks,
    COORDINATOR: [
      { to: '/dashboard', icon: <LayoutDashboard />, label: 'Overview' },
      { to: '/dashboard/applications', icon: <FileText />, label: 'Applications' },
      { to: '/dashboard/merit-list', icon: <Award />, label: 'Merit List' },
      { to: '/dashboard/rac-allocation', icon: <Users />, label: 'RAC Allocation' },
    ],
    COE: [
      { to: '/dashboard', icon: <LayoutDashboard />, label: 'Overview' },
      { to: '/dashboard/exam-management', icon: <ClipboardList />, label: 'Exam Mgmt' },
      { to: '/dashboard/results', icon: <Award />, label: 'Results' },
    ],
    FACULTY: [
      { to: '/dashboard', icon: <LayoutDashboard />, label: 'Overview' },
      { to: '/dashboard/scholars', icon: <Users />, label: 'My Scholars' },
      { to: '/dashboard/approvals', icon: <CheckCircle />, label: 'Approvals' },
    ],
    BUTR: [
      { to: '/dashboard', icon: <LayoutDashboard />, label: 'Overview' },
      { to: '/dashboard/meetings', icon: <Users />, label: 'Meetings' },
      { to: '/dashboard/final-approvals', icon: <CheckCircle />, label: 'Final Approvals' },
    ],
  };

  const links = sidebarLinks[user.role] || [];

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-mgmu-blue flex items-center justify-center text-white font-bold">
              {user.name[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-mgmu-blue truncate w-32">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === link.to
                    ? 'bg-mgmu-blue text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="h-5 w-5">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-mgmu-blue">Welcome back, {user.name}</h1>
            <p className="text-gray-500">Here's what's happening with your Ph.D. portal today.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mgmu-blue/20 text-sm"
              />
            </div>
            <button className="relative p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <Routes>
          <Route path="/admission" element={<AdmissionForm />} />
          <Route path="/merit-list" element={<MeritList />} />
          <Route path="/*" element={
            user.role === 'STUDENT' ? <StudentDashboard /> :
            user.role === 'COORDINATOR' ? <CoordinatorDashboard /> :
            user.role === 'COE' ? <CoEDashboard /> :
            user.role === 'FACULTY' ? <FacultyDashboard /> :
            <BUTRDashboard />
          } />
        </Routes>
      </main>
    </div>
  );
}


