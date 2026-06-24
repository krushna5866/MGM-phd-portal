import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { 
  ClipboardList, Award, Users, Download, Database, BookOpen, GraduationCap, FileCheck
} from 'lucide-react';

export default function CoEDashboard() {
  const [activeTab, setActiveTab] = useState('cet');
  const [documents, setDocuments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const hallTicketRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [examMarks, setExamMarks] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents/');
        setDocuments(response.data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };
    
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
    
    fetchDocuments();
    fetchData();
  }, [activeTab]);

  const issueHallTicket = async (appId: string, file: File) => {
    try {
      setUploading(appId);
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/applications/${appId}/hall-ticket`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Hall ticket uploaded successfully!');
      const appRes = await api.get('/applications/');
      setApplications(appRes.data);
    } catch (e) {
      console.error(e);
      alert('Failed to upload Hall Ticket.');
    } finally {
      setUploading(null);
    }
  };

  const publishResult = async (appId: string, resultFile: File | null) => {
    const marksStr = examMarks[appId];
    if (!marksStr) return alert("Enter marks first");
    const marks = parseFloat(marksStr);
    const isPassed = marks >= 50; 

    try {
      setUploading(appId);
      const formData = new FormData();
      formData.append('raw_marks', marks.toString());
      if (resultFile) {
        formData.append('file', resultFile);
      }
      
      await api.post(`/applications/${appId}/pet-result`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const isPassed = (marks / 2) >= 70;
      alert(`Result published! Student ${isPassed ? 'Qualified' : 'Failed'} with normalized score ${marks / 2}.`);
      const appRes = await api.get('/applications/');
      setApplications(appRes.data);
    } catch (e) {
      console.error(e);
      alert('Failed to publish result');
    } finally {
      setUploading(null);
    }
  };

  const stats = [
    { label: 'Exams Conducted', value: '02', icon: <ClipboardList className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Certificates Issued', value: '45', icon: <Award className="text-yellow-500" />, color: 'bg-yellow-50' },
    { label: 'Total Scholars', value: '256', icon: <Users className="text-mgmu-gold" />, color: 'bg-mgmu-gold/10' },
  ];

  const renderCET = () => {
    const pendingExams = applications.filter(app => app.current_level === 'LEVEL_2_VERIFICATION' && app.status === 'APPROVED');

    return (
      <div className="space-y-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-bold text-mgmu-blue mb-4">Level 2: Upload Hall Tickets</h3>
          <p className="text-sm text-gray-500 mb-4">Upload the official Hall Ticket PDF for verified applicants.</p>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Upload Hall Ticket</th>
              </tr>
            </thead>
            <tbody>
              {pendingExams.length > 0 ? pendingExams.map(app => {
                const student = students.find(s => s._id === app.studentId);
                if (!student) return null;
                return (
                  <tr key={app._id} className="border-b">
                     <td className="p-3 font-bold text-sm text-mgmu-blue">{student.name}</td>
                     <td className="p-3 text-sm">{student.email}</td>
                     <td className="p-3">
                        <input 
                           type="file" 
                           accept=".pdf"
                           onChange={(e) => {
                             if(e.target.files?.[0]) issueHallTicket(app._id, e.target.files[0]);
                           }}
                           className="text-sm"
                           disabled={uploading === app._id}
                        />
                        {uploading === app._id && <span className="text-xs text-blue-500 ml-2">Uploading...</span>}
                     </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500 text-sm">No verified applicants require Hall Tickets.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPETResult = () => {
    const pendingResults = applications.filter(app => app.current_level === 'LEVEL_3_PET_RESULT');

    return (
      <div className="card mt-6 border-l-4 border-mgmu-gold">
        <h3 className="text-lg font-bold text-mgmu-blue mb-4">Level 3: Declare PET Results</h3>
        <p className="text-sm text-gray-500 mb-6">Input marks and upload the result PDF to declare PET exam outcomes.</p>
        
         <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <th className="p-3">Applicant Name</th>
              <th className="p-3">Raw Marks (Out of 200)</th>
              <th className="p-3">Normalized (Out of 100)</th>
              <th className="p-3">Result PDF (Optional)</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingResults.length > 0 ? pendingResults.map(app => {
              const student = students.find(s => s._id === app.studentId);
              if (!student) return null;
              return (
                <tr key={app._id} className="border-b">
                   <td className="p-3 font-bold text-sm text-mgmu-blue">{student.name}</td>
                   <td className="p-3">
                     <input 
                       type="number" max="200" min="0"
                       value={examMarks[app._id] || ''} 
                       onChange={e => setExamMarks({...examMarks, [app._id]: e.target.value})}
                       className="p-1 border rounded w-24" placeholder="e.g. 150" 
                     />
                   </td>
                   <td className="p-3">
                     {examMarks[app._id] ? (
                       <div>
                         <span className="font-bold">{parseFloat(examMarks[app._id]) / 2}</span>
                         {(parseFloat(examMarks[app._id]) / 2) >= 70 ? (
                           <span className="ml-2 text-xs font-bold text-green-600">PASS (&ge; 70)</span>
                         ) : (
                           <span className="ml-2 text-xs font-bold text-red-600">FAIL</span>
                         )}
                       </div>
                     ) : <span className="text-gray-400">-</span>}
                   </td>
                   <td className="p-3">
                     <input type="file" id={`file-${app._id}`} accept=".pdf" className="text-sm w-48" />
                   </td>
                   <td className="p-3">
                      <button 
                        disabled={uploading === app._id}
                        onClick={() => {
                          const fileInput = document.getElementById(`file-${app._id}`) as HTMLInputElement;
                          publishResult(app._id, fileInput?.files?.[0] || null);
                        }} 
                        className="bg-mgmu-blue text-white font-bold px-4 py-1 text-xs rounded hover:bg-mgmu-gold disabled:opacity-50"
                      >
                        {uploading === app._id ? 'Publishing...' : 'Publish Result'}
                      </button>
                   </td>
                </tr>
              )
            }) : (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No applicants awaiting results.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCertificates = () => (
    <div className="card mt-6">
      <h3 className="text-lg font-bold text-mgmu-blue mb-4">Generate Course Work Certificate</h3>
      <p className="text-sm text-gray-500 mb-6">Issue completion certificates for scholars who have passed the Ph.D. Coursework.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <select className="p-2 border rounded"><option>No Scholars Eligible...</option></select>
        <input type="date" className="p-2 border rounded text-sm" title="Completion Date" />
      </div>
      <button className="btn-primary mt-4">Generate Certificate File</button>
    </div>
  );

  const renderNotification = () => (
    <div className="card mt-6">
      <h3 className="text-lg font-bold text-mgmu-blue mb-4">Final Ph.D. Notification</h3>
      <p className="text-sm text-gray-500 mb-6">Generate official Ph.D. award notifications for scholars whose thesis has been approved.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <select className="p-2 border rounded" disabled><option>No Approved Scholars...</option></select>
      </div>
      <button className="bg-mgmu-gold text-white font-bold px-4 py-2 rounded mt-4 opacity-50 cursor-not-allowed">Generate Ph.D. Notification</button>
    </div>
  );

  const renderVault = () => (
    <div className="card mt-6">
      <h3 className="text-lg font-bold text-mgmu-blue mb-6">Recent Student Document Submissions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Document Type</th>
              <th className="px-6 py-4">File Name</th>
              <th className="px-6 py-4">Upload Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.length > 0 ? documents.map((doc, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 font-bold text-mgmu-blue">{doc.student_name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-yellow-50 text-mgmu-gold font-bold text-xs rounded border border-yellow-100">
                    {doc.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{doc.original_name}</td>
                <td className="px-6 py-4 text-sm font-mono">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-sm text-mgmu-blue font-bold hover:text-mgmu-gold">
                    <Download className="h-4 w-4" /><span>Download PDF</span>
                  </a>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No documents have been uploaded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'cet', label: 'L2: Hall Tickets', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'results', label: 'L3: PET Results', icon: <Award className="h-4 w-4" /> },
    { id: 'cert', label: 'Course Certificates', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'award', label: 'Ph.D. Awards', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'vault', label: 'Document Vault', icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-mgmu-blue">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-xl ${stat.color}`}>{stat.icon}</div>
          </div>
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
          {activeTab === 'cet' && renderCET()}
          {activeTab === 'results' && renderPETResult()}
          {activeTab === 'cert' && renderCertificates()}
          {activeTab === 'award' && renderNotification()}
          {activeTab === 'vault' && renderVault()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
