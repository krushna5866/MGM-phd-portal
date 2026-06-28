import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, FileCheck, AlertCircle, TrendingUp, Search, Check, X, MoreVertical,
  ClipboardList, Presentation, Share2, BookOpen, Clock
} from 'lucide-react';

export default function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState('admission');
  const [applications, setApplications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [fwcDate, setFwcDate] = useState('');
  const [fwcTime, setFwcTime] = useState('');
  const [fwcLocation, setFwcLocation] = useState('');
  const [fwcMarks, setFwcMarks] = useState<Record<string, string>>({});

  // RAC MoM State
  const [momForm, setMomForm] = useState({
    student_id: '',
    department: '',
    subject: '',
    faculty: '',
    meeting_date: '',
    meeting_time: '',
    chairperson: '',
    external_expert_1: '',
    external_expert_2: '',
    bos_chair: '',
    supervisor: '',
    secretary: '',
    item_1_decision: '',
    item_2_decision: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, usersRes] = await Promise.all([
          api.get('/applications/'),
          api.get('/users/')
        ]);
        setApplications(appRes.data);
        setStudents(usersRes.data.filter((u: any) => u.role === 'STUDENT'));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchData();
  }, [activeTab]);

  const stats = [
    { label: 'Total Applicants', value: '124', icon: <Users className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Pending Approvals', value: '18', icon: <AlertCircle className="text-yellow-500" />, color: 'bg-yellow-50' },
    { label: 'Enrolled Scholars', value: '86', icon: <FileCheck className="text-green-500" />, color: 'bg-green-50' },
    { label: 'Pending RAC MoM', value: '12', icon: <TrendingUp className="text-purple-500" />, color: 'bg-purple-50' },
  ];

  const handleMomChange = (e: any) => {
    setMomForm({ ...momForm, [e.target.name]: e.target.value });
  };

  const submitRACMoM = async () => {
    if (!momForm.student_id) return alert("Please select a student.");
    try {
      await api.post('/moms/', momForm);
      alert('RAC MoM submitted successfully to BUTR for approval!');
      setMomForm({
        student_id: '', department: '', subject: '', faculty: '', meeting_date: '', meeting_time: '',
        chairperson: '', external_expert_1: '', external_expert_2: '', bos_chair: '', supervisor: '', secretary: '',
        item_1_decision: '', item_2_decision: ''
      });
    } catch (e) {
      console.error(e);
      alert('Failed to submit RAC MoM.');
    }
  };

  const renderAdmission = () => (
    <div className="card overflow-hidden mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-bold text-mgmu-blue">Document Verification & Admission</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search applicant..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <th className="px-6 py-4">Applicant</th>
              <th className="px-6 py-4">Documents</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Approve for PET</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No pending admissions to verify.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const scheduleFWC = async (appId: string) => {
    if (!fwcDate || !fwcTime || !fwcLocation) return alert("Fill all meeting details first.");
    try {
      const timeSlot = `${fwcDate}T${fwcTime}`;
      const formData = new FormData();
      formData.append("time_slot", timeSlot);
      formData.append("venue", fwcLocation);

      await api.put(`/applications/${appId}/schedule-fwc`, formData);
      alert('FWC Meeting scheduled successfully!');
      const appRes = await api.get('/applications/');
      setApplications(appRes.data);
    } catch (e) {
       console.error(e);
       alert("Failed to schedule.");
    }
  };

  const completeFWC = async (appId: string) => {
    const marksStr = fwcMarks[appId];
    if (!marksStr) return alert("Please enter FWC marks (out of 100) to proceed.");
    const marks = parseFloat(marksStr);

    try {
      const formData = new FormData();
      formData.append('fwc_marks', marks.toString());

      await api.put(`/applications/${appId}/complete-fwc`, formData);
      const isEligible = marks >= 30;
      alert(isEligible ? 'Admission Complete! Application Enrolled.' : 'Application Rejected: Failed to meet 30% FWC criteria.');
      
      const appRes = await api.get('/applications/');
      setApplications(appRes.data);
    } catch (e) {
       console.error(e);
       alert("Failed to complete FWC.");
    }
  };

  const renderFWC = () => {
    const pendingFWC = applications.filter(app => app.current_level === 'LEVEL_5_FWC_INTERVIEW' && app.status === 'PENDING');
    const scheduledFWC = applications.filter(app => app.current_level === 'LEVEL_5_FWC_INTERVIEW' && app.status === 'APPROVED');

    return (
      <div className="space-y-6 mt-6">
        <div className="card border-l-4 border-mgmu-gold">
          <h3 className="text-lg font-bold text-mgmu-blue mb-4">Level 5: Schedule FWC Meeting</h3>
          <p className="text-sm text-gray-500 mb-4">Schedule FWC presentations for students who have uploaded their presentation documents.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Meeting Date</label>
              <input type="date" value={fwcDate} onChange={e=>setFwcDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-mgmu-blue focus:border-mgmu-blue" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Meeting Time</label>
              <input type="time" value={fwcTime} onChange={e=>setFwcTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-mgmu-blue focus:border-mgmu-blue" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
              <input type="text" value={fwcLocation} onChange={e=>setFwcLocation(e.target.value)} placeholder="e.g. Dean's Office" className="w-full px-3 py-2 border rounded-lg focus:ring-mgmu-blue focus:border-mgmu-blue" />
            </div>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Presentation PDF</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingFWC.length > 0 ? pendingFWC.map(app => {
                const student = students.find(s => s._id === app.studentId);
                if (!student) return null;
                return (
                  <tr key={app._id} className="border-b">
                     <td className="p-3 font-bold text-sm text-mgmu-blue">{student.name}</td>
                     <td className="p-3">
                       <a href={app.fwc_presentation_url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm font-bold">View Presentation</a>
                     </td>
                     <td className="p-3 flex space-x-2">
                       <button onClick={() => scheduleFWC(app._id)} className="bg-mgmu-blue text-white px-4 py-1 text-xs font-bold rounded hover:bg-mgmu-gold transition-colors">Notify & Schedule</button>
                     </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500 text-sm">No applicants pending FWC scheduling.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card mt-6">
          <h3 className="text-lg font-bold text-mgmu-blue mb-4">Complete FWC & Admission</h3>
          <p className="text-sm text-gray-500 mb-4">Mark the FWC as completed to formalize the Ph.D. Admission.</p>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Scheduled Time</th>
                <th className="p-3">Venue</th>
                <th className="p-3">FWC Marks (Out of 100)</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {scheduledFWC.length > 0 ? scheduledFWC.map(app => {
                const student = students.find(s => s._id === app.studentId);
                if (!student) return null;
                return (
                  <tr key={app._id} className="border-b">
                     <td className="p-3 font-bold text-sm text-mgmu-blue">{student.name}</td>
                     <td className="p-3 text-sm">{new Date(app.fwc_time_slot).toLocaleString()}</td>
                     <td className="p-3 text-sm">{app.fwc_venue}</td>
                     <td className="p-3">
                       <input 
                         type="number" max="100" min="0"
                         value={fwcMarks[app._id] || ''} 
                         onChange={e => setFwcMarks({...fwcMarks, [app._id]: e.target.value})}
                         className="p-1 border rounded w-24 text-sm" placeholder="e.g. 85" 
                       />
                       {fwcMarks[app._id] && (
                         <span className={`ml-2 text-xs font-bold ${parseFloat(fwcMarks[app._id]) >= 30 ? 'text-green-600' : 'text-red-600'}`}>
                           {parseFloat(fwcMarks[app._id]) >= 30 ? 'ELIGIBLE' : 'FAIL (< 30)'}
                         </span>
                       )}
                     </td>
                     <td className="p-3 flex space-x-2">
                       <button onClick={() => completeFWC(app._id)} className="bg-green-600 text-white px-4 py-1 text-xs font-bold rounded hover:bg-green-700 transition-colors">Mark Completed</button>
                     </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No scheduled FWCs pending completion.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRACMoM = () => {
    const enrolledStudents = students; // we should filter by ADMISSION_COMPLETE ideally

    return (
    <div className="space-y-6 mt-6">
      <div className="card">
        <h3 className="text-lg font-bold text-mgmu-blue mb-4">Digital RAC Minutes of Meeting (MoM)</h3>
        <p className="text-sm text-gray-500 mb-6">Fill out the Annexure II format. This will be sent to the BUTR for final approval.</p>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Scholar</label>
              <select name="student_id" value={momForm.student_id} onChange={handleMomChange} className="w-full p-2 border rounded text-sm">
                <option value="">-- Select Scholar --</option>
                {enrolledStudents.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Department / Institute</label>
              <input type="text" name="department" value={momForm.department} onChange={handleMomChange} className="w-full p-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
              <input type="text" name="subject" value={momForm.subject} onChange={handleMomChange} className="w-full p-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Faculty</label>
              <input type="text" name="faculty" value={momForm.faculty} onChange={handleMomChange} className="w-full p-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Meeting Date</label>
              <input type="date" name="meeting_date" value={momForm.meeting_date} onChange={handleMomChange} className="w-full p-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Meeting Time</label>
              <input type="time" name="meeting_time" value={momForm.meeting_time} onChange={handleMomChange} className="w-full p-2 border rounded text-sm" />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-bold text-gray-800 mb-4">Committee Members Present</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="chairperson" value={momForm.chairperson} onChange={handleMomChange} placeholder="1. Chairperson of RAC" className="w-full p-2 border rounded text-sm" />
              <input type="text" name="external_expert_1" value={momForm.external_expert_1} onChange={handleMomChange} placeholder="2. Member (External Subject Expert 1)" className="w-full p-2 border rounded text-sm" />
              <input type="text" name="external_expert_2" value={momForm.external_expert_2} onChange={handleMomChange} placeholder="3. Member (External Subject Expert 2)" className="w-full p-2 border rounded text-sm" />
              <input type="text" name="bos_chair" value={momForm.bos_chair} onChange={handleMomChange} placeholder="4. Member (Chairperson of BoS)" className="w-full p-2 border rounded text-sm" />
              <input type="text" name="supervisor" value={momForm.supervisor} onChange={handleMomChange} placeholder="5. Invitee (Supervisor)" className="w-full p-2 border rounded text-sm" />
              <input type="text" name="secretary" value={momForm.secretary} onChange={handleMomChange} placeholder="6. Secretary" className="w-full p-2 border rounded text-sm" />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-bold text-gray-800 mb-4">Discussions and Decisions</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item 1: Review research proposal and finalize topic & supervisor</label>
                <textarea name="item_1_decision" value={momForm.item_1_decision} onChange={handleMomChange} rows={3} className="w-full p-2 border rounded text-sm" placeholder="Decisions regarding Item 1..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item 2: Periodically review and assist in progress</label>
                <textarea name="item_2_decision" value={momForm.item_2_decision} onChange={handleMomChange} rows={3} className="w-full p-2 border rounded text-sm" placeholder="Decisions regarding Item 2..."></textarea>
              </div>
            </div>
          </div>

          <button onClick={submitRACMoM} className="btn-primary w-full py-3">Submit RAC MoM to BUTR</button>
        </div>
      </div>
    </div>
    );
  };

  const renderPeriodicRAC = () => (
    <div className="card mt-6">
      <h3 className="text-lg font-bold text-mgmu-blue mb-4">Periodic RAC Reviews</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
            <th className="p-3">Scholar</th>
            <th className="p-3">Meeting #</th>
            <th className="p-3">Attendance</th>
            <th className="p-3">Remarks</th>
            <th className="p-3">Submit MoM</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={5} className="p-4 text-center text-gray-500 text-sm">No periodic RAC meetings scheduled for review.</td></tr>
        </tbody>
      </table>
    </div>
  );

  const tabs = [
    { id: 'admission', label: 'Admissions', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'fwc', label: 'Level 5: FWC', icon: <Presentation className="h-4 w-4" /> },
    { id: 'rac_comp', label: 'RAC MoM', icon: <Share2 className="h-4 w-4" /> },
    { id: 'coursework', label: 'Course Work', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'periodic', label: 'Periodic RAC', icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-mgmu-blue">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-lg p-2 shadow-sm border flex space-x-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-bold text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-mgmu-blue text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === 'admission' && renderAdmission()}
          {activeTab === 'fwc' && renderFWC()}
          {activeTab === 'rac_comp' && renderRACMoM()}
          {activeTab === 'coursework' && (
            <div className="card mt-6 flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-mgmu-blue text-lg">Arrange Course Work Schedule</h3>
                  <p className="text-sm text-gray-500">Initiate mandatory coursework classes for newly allocated scholars.</p>
               </div>
               <button className="btn-primary">Generate Schedule</button>
            </div>
          )}
          {activeTab === 'periodic' && renderPeriodicRAC()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
