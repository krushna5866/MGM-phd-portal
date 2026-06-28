import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { 
  Users, CheckCircle, FileText, Calendar, ShieldCheck, Download, Database, Share2, Briefcase, UserCheck, Settings, Award, Megaphone, Trash2
} from 'lucide-react';

export default function BUTRDashboard() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [documents, setDocuments] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [moms, setMoms] = useState<any[]>([]);
  const [directoryFilter, setDirectoryFilter] = useState('ALL');

  const [examMarks, setExamMarks] = useState<Record<string, string>>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annNotes, setAnnNotes] = useState('');
  const [annFile, setAnnFile] = useState<File | null>(null);

  // System Settings State
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(true);

  // Faculty Roles State
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const roleOptions = [
    "Subject Expert - Computer Science",
    "Subject Expert - Mechanical",
    "Subject Expert - Civil",
    "Subject Expert - Management",
    "Subject Expert - Physics",
    "RAC Chair",
    "RAC Member"
  ];

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/');
      setAnnouncements(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents/');
        setDocuments(response.data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };
    
    const fetchPendingUsers = async () => {
      try {
        const response = await api.get('/users/pending');
        setPendingUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch pending users", err);
      }
    };

    const fetchApprovedUsers = async () => {
      try {
        const response = await api.get('/users/approved');
        setApprovedUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch approved users", err);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const [usersRes, appsRes] = await Promise.all([
           api.get('/users/'),
           api.get('/applications/')
        ]);
        setAllUsers(usersRes.data);
        setApplications(appsRes.data);
      } catch (err) {
        console.error("Failed to fetch all users", err);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/');
        setIsAdmissionOpen(response.data.admission_window_open);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    const fetchMoms = async () => {
      try {
        const response = await api.get('/moms/');
        setMoms(response.data);
      } catch (err) {
        console.error("Failed to fetch moms", err);
      }
    };

    fetchDocuments();
    fetchPendingUsers();
    fetchApprovedUsers();
    fetchAllUsers();
    fetchAnnouncements();
    fetchSettings();
    fetchMoms();
  }, [activeTab]);

  const handleApprove = async (userId: string) => {
    try {
      await api.put(`/users/${userId}/approve`);
      const approved = pendingUsers.find(u => u._id === userId);
      if (approved) {
        setApprovedUsers([...approvedUsers, approved]);
      }
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}/reject`);
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!window.confirm("Are you sure you want to revoke this user's access?")) return;
    try {
      await api.put(`/users/${userId}/revoke`);
      const revoked = approvedUsers.find(u => u._id === userId);
      if (revoked) {
        setPendingUsers([...pendingUsers, revoked]);
      }
      setApprovedUsers(approvedUsers.filter(u => u._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignFacultyRole = async (userId: string) => {
    const roleToAdd = selectedRole[userId];
    if (!roleToAdd) return alert("Please select a role to assign.");
    
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;

    const currentRoles = user.faculty_roles || [];
    if (currentRoles.includes(roleToAdd)) return alert("Role already assigned.");

    const updatedRoles = [...currentRoles, roleToAdd];

    try {
      await api.put(`/users/${userId}/roles`, { roles: updatedRoles });
      setAllUsers(allUsers.map(u => u._id === userId ? { ...u, faculty_roles: updatedRoles } : u));
      setSelectedRole({ ...selectedRole, [userId]: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to assign role");
    }
  };

  const handleRevokeFacultyRole = async (userId: string, roleToRemove: string) => {
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;

    const currentRoles = user.faculty_roles || [];
    const updatedRoles = currentRoles.filter((r: string) => r !== roleToRemove);

    try {
      await api.put(`/users/${userId}/roles`, { roles: updatedRoles });
      setAllUsers(allUsers.map(u => u._id === userId ? { ...u, faculty_roles: updatedRoles } : u));
    } catch (err) {
      console.error(err);
      alert("Failed to revoke role");
    }
  };

  const stats = [
    { label: 'Pending BUTR Approvals', value: '12', icon: <ShieldCheck className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'RAC Formations', value: '08', icon: <Users className="text-purple-500" />, color: 'bg-purple-50' },
    { label: 'Thesis Notifications', value: '05', icon: <FileText className="text-green-500" />, color: 'bg-green-50' },
    { label: 'Next Meeting', value: '20 Apr', icon: <Calendar className="text-mgmu-gold" />, color: 'bg-mgmu-gold/10' },
  ];

  const renderAccountApprovals = () => (
    <div className="space-y-6 mt-6">
      <div className="card">
        <h3 className="text-lg font-bold text-mgmu-blue mb-4">New Account Approvals</h3>
        <p className="text-sm text-gray-500 mb-6">Review and verify newly registered accounts across the entire ecosystem before they gain internal system access.</p>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <th className="p-3">User Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Requested Role</th>
              <th className="p-3">Registration Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.length > 0 ? pendingUsers.map(user => (
              <tr key={user._id} className="border-b">
                <td className="p-3 font-bold text-sm text-mgmu-blue">{user.name}</td>
                <td className="p-3 text-sm">{user.email}</td>
                <td className="p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">{user.role}</span></td>
                <td className="p-3 text-sm text-gray-500">Pending</td>
                <td className="p-3 flex space-x-2">
                  <button onClick={() => handleApprove(user._id)} className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded text-xs hover:bg-green-200">Approve Access</button>
                  <button onClick={() => handleReject(user._id)} className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded text-xs hover:bg-red-200">Reject</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500 text-sm">No new accounts pending approval.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold text-mgmu-blue mb-4">Active Ecosystem Accounts</h3>
        <p className="text-sm text-gray-500 mb-6">Manage users who currently have active approved access to the Ph.D. portal.</p>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <th className="p-3">User Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {approvedUsers.length > 0 ? approvedUsers.map(user => (
              <tr key={user._id} className="border-b">
                <td className="p-3 font-bold text-sm text-mgmu-blue">{user.name}</td>
                <td className="p-3 text-sm">{user.email}</td>
                <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">{user.role}</span></td>
                <td className="p-3 text-sm text-green-600 font-bold">Active</td>
                <td className="p-3">
                  {user.role !== 'BUTR' ? (
                    <button onClick={() => handleRevoke(user._id)} className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded text-xs hover:bg-red-100 hover:text-red-700 transition-colors">Revoke Access</button>
                  ) : (
                    <span className="text-xs text-gray-400 font-italic">Admin Account</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500 text-sm">No active accounts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDirectory = () => {
    const filteredUsers = directoryFilter === 'ALL' 
      ? allUsers 
      : allUsers.filter(u => u.role === directoryFilter);

    return (
      <div className="card mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-mgmu-blue mb-1">System Directory</h3>
            <p className="text-sm text-gray-500">View all registered accounts separated strictly by their portal role.</p>
          </div>
          <select 
            value={directoryFilter} 
            onChange={(e) => setDirectoryFilter(e.target.value)}
            className="p-2 border rounded font-bold text-sm bg-gray-50 text-mgmu-blue focus:outline-none focus:ring-2 focus:ring-mgmu-gold"
          >
            <option value="ALL">All Categories</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty Supervisors</option>
            <option value="COORDINATOR">Ph.D. Coordinators</option>
            <option value="COE">CoE Personnel</option>
            <option value="HOD">Head of Department (HoD)</option>
            <option value="DEAN">Dean</option>
            <option value="REGISTRAR">Registrar</option>
            <option value="DEPUTY_REGISTRAR">Deputy Registrar</option>
            <option value="VICE_CHANCELLOR">Vice Chancellor</option>
          </select>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <th className="p-3">User Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Category (Role)</th>
              <th className="p-3">Approval Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold text-sm text-mgmu-blue">{user.name}</td>
                <td className="p-3 text-sm">{user.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    user.role === 'STUDENT' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'FACULTY' ? 'bg-yellow-100 text-yellow-700' :
                    user.role === 'BUTR' ? 'bg-red-100 text-red-700' :
                    user.role === 'VICE_CHANCELLOR' ? 'bg-red-200 text-red-900 border border-red-300' :
                    user.role === 'DEAN' ? 'bg-orange-100 text-orange-700' :
                    user.role === 'HOD' ? 'bg-teal-100 text-teal-700' :
                    (user.role === 'REGISTRAR' || user.role === 'DEPUTY_REGISTRAR') ? 'bg-indigo-100 text-indigo-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3">
                  {user.is_approved ? (
                    <span className="text-sm text-green-600 font-bold flex items-center space-x-1"><CheckCircle className="h-4 w-4" /><span>Approved</span></span>
                  ) : (
                    <span className="text-sm text-yellow-600 font-bold">Pending</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No accounts found in this category.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const verifyApplication = async (appId: string, action: 'APPROVE' | 'REJECT') => {
    let reason = '';
    if (action === 'REJECT') {
      const input = prompt("Enter rejection reason:");
      if (input === null) return;
      reason = input;
    }
    try {
      await api.put(`/applications/${appId}/verify?action=${action}&reason=${encodeURIComponent(reason)}`);
      alert(`Application ${action.toLowerCase()}d successfully.`);
      const appsRes = await api.get('/applications/');
      setApplications(appsRes.data);
    } catch (e) {
      console.error(e);
      alert('Failed to verify application');
    }
  };

  const grantFWCAccess = async (appId: string) => {
    try {
      await api.put(`/applications/${appId}/grant-fwc`);
      alert("FWC Access Granted.");
      const appsRes = await api.get('/applications/');
      setApplications(appsRes.data);
    } catch (e) {
      console.error(e);
      alert('Failed to grant FWC Access');
    }
  };

  const renderAdmissionVerifications = () => {
    const pendingVerifications = applications.filter(app => app.current_level === 'LEVEL_2_VERIFICATION' && app.status === 'PENDING');

    return (
      <div className="card mt-6 border-l-4 border-mgmu-gold">
        <h3 className="text-lg font-bold text-mgmu-blue mb-4">Level 2: Admission Document Verifications</h3>
        <p className="text-sm text-gray-500 mb-6">Review newly submitted applications and verify their mandatory documents. Approving will forward them to CoE for Hall Ticket generation.</p>
        
         <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <th className="p-3">Applicant Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Documents</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingVerifications.length > 0 ? pendingVerifications.map(app => {
              const student = allUsers.find(s => s._id === app.studentId);
              if (!student) return null;
              return (
                <tr key={app._id} className="border-b">
                   <td className="p-3 font-bold text-sm text-mgmu-blue">{student.name}</td>
                   <td className="p-3 text-sm">{student.email}</td>
                   <td className="p-3 text-sm flex flex-col space-y-1">
                      {app.documents?.map((doc: any, idx: number) => (
                        <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-mgmu-gold font-bold">
                          {doc.name.replace('_', ' ')}
                        </a>
                      ))}
                   </td>
                   <td className="p-3 flex space-x-2">
                      <button onClick={() => verifyApplication(app._id, 'APPROVE')} className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded text-xs hover:bg-green-200">Verify & Approve</button>
                      <button onClick={() => verifyApplication(app._id, 'REJECT')} className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded text-xs hover:bg-red-200">Reject</button>
                   </td>
                </tr>
              )
            }) : (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No applications pending verification.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFWCApprovals = () => {
    const pendingFWC = applications.filter(app => app.current_level === 'LEVEL_4_FWC_PREP' && app.status === 'PENDING');
    
    return (
      <div className="card mt-6">
        <h3 className="text-lg font-bold text-mgmu-blue mb-4">Level 4: FWC Preparation Approvals</h3>
        <p className="text-sm text-gray-500 mb-6">These students have passed the PET exam. Grant them FWC access to unlock their presentation upload portal.</p>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <th className="p-3">Scholar Name</th>
              <th className="p-3">PET Result</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingFWC.length > 0 ? pendingFWC.map(app => {
              const student = allUsers.find(s => s._id === app.studentId);
              if (!student) return null;
              return (
                <tr key={app._id} className="border-b">
                   <td className="p-3 font-bold text-sm text-mgmu-blue">{student.name}</td>
                   <td className="p-3 text-sm text-green-600 font-bold">{app.pet_result}</td>
                   <td className="p-3 flex space-x-2">
                      <button onClick={() => grantFWCAccess(app._id)} className="bg-mgmu-blue text-white font-bold px-4 py-1 text-xs rounded hover:bg-mgmu-gold">Grant FWC Access</button>
                   </td>
                </tr>
              )
            }) : (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500 text-sm">No pending FWC grants.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSupervisor = () => (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-mgmu-light">
          <h3 className="text-lg font-bold text-mgmu-blue mb-4">BUTR Schedule</h3>
          <p className="text-sm text-gray-500 mb-4">Manage BUTR meeting dates to review Faculty Supervisor Applications.</p>
          <input type="date" className="p-2 border rounded w-full mb-4" />
          <button className="btn-primary w-full py-2">Schedule Meeting</button>
        </div>
      </div>

      <div className="card">
         <h3 className="text-lg font-bold text-mgmu-blue mb-4">Faculty Supervisor Approvals</h3>
         <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <th className="p-3">Faculty Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Documents</th>
              <th className="p-3">Approval</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No Faculty Supervisor applications pending.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMoM = () => {
    const handleApprove = async (id: string) => {
      try {
        await api.put(`/moms/${id}/approve`);
        alert('RAC MoM Approved!');
        const res = await api.get('/moms/');
        setMoms(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    const handleReject = async (id: string) => {
      try {
        await api.put(`/moms/${id}/reject`);
        alert('RAC MoM Rejected!');
        const res = await api.get('/moms/');
        setMoms(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    return (
    <div className="card mt-6">
      <h3 className="text-lg font-bold text-mgmu-blue mb-4">RAC Minutes (MoM) Approvals</h3>
      <p className="text-sm text-gray-500 mb-6">Review Digital Annexure II forms submitted by the Coordinators. Approving generates the final PDF copy.</p>
      
      <div className="space-y-4">
        {moms.length > 0 ? moms.map(mom => {
          const student = allUsers.find(s => s._id === mom.student_id);
          return (
            <div key={mom._id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-mgmu-blue text-lg">Scholar: {student?.name || 'Unknown'}</h4>
                  <p className="text-sm text-gray-600">{mom.department} | {mom.subject} | {mom.faculty}</p>
                </div>
                <div>
                   <span className={`px-3 py-1 rounded text-xs font-bold ${
                     mom.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                     mom.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                     'bg-yellow-100 text-yellow-700'
                   }`}>
                     {mom.status}
                   </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 text-sm text-gray-700 mb-4 bg-white p-3 border rounded">
                <div><strong>Meeting Date:</strong> {mom.meeting_date}</div>
                <div><strong>Meeting Time:</strong> {mom.meeting_time}</div>
                <div><strong>Chairperson:</strong> {mom.chairperson}</div>
                <div><strong>Supervisor:</strong> {mom.supervisor}</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="bg-white p-3 border rounded">
                  <h5 className="text-xs font-bold text-gray-600 uppercase mb-1">Item 1: Topic Finalization</h5>
                  <p className="text-sm">{mom.item_1_decision}</p>
                </div>
                <div className="bg-white p-3 border rounded">
                  <h5 className="text-xs font-bold text-gray-600 uppercase mb-1">Item 2: Periodic Review</h5>
                  <p className="text-sm">{mom.item_2_decision}</p>
                </div>
              </div>

              {mom.status === 'PENDING' && (
                <div className="flex space-x-2 border-t pt-4">
                  <button onClick={() => handleApprove(mom._id)} className="bg-green-600 text-white font-bold px-4 py-2 text-sm rounded hover:bg-green-700">Approve MoM</button>
                  <button onClick={() => handleReject(mom._id)} className="bg-red-600 text-white font-bold px-4 py-2 text-sm rounded hover:bg-red-700">Reject MoM</button>
                </div>
              )}
            </div>
          );
        }) : (
           <p className="p-4 text-center text-gray-500 text-sm">No Minutes of Meeting (MoM) pending approval.</p>
        )}
      </div>
    </div>
    );
  };

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

  const renderAnnouncements = () => {
    const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!annTitle) return alert("Title is required");

      const formData = new FormData();
      formData.append('title', annTitle);
      if (annNotes) formData.append('notes', annNotes);
      if (annFile) formData.append('file', annFile);

      try {
        await api.post('/announcements/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Published successfully!');
        setAnnTitle(''); setAnnNotes(''); setAnnFile(null);
        fetchAnnouncements();
      } catch (err) {
        console.error(err);
        alert('Failed to publish announcement');
      }
    };

    const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this announcement?")) return;
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div className="space-y-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-bold text-mgmu-blue mb-4">Publish Public Announcement</h3>
          <p className="text-sm text-gray-500 mb-6">These will appear on the public homepage without requiring a login.</p>
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input type="text" value={annTitle} onChange={e=>setAnnTitle(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-mgmu-blue focus:border-mgmu-blue" placeholder="e.g. PET Examination Date Announced" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Notes / Description</label>
              <textarea value={annNotes} onChange={e=>setAnnNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-mgmu-blue focus:border-mgmu-blue" placeholder="Provide extra details..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Attach Media (Image / Video up to 2 mins)</label>
              <input type="file" accept="image/*,video/*" onChange={e => setAnnFile(e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-mgmu-blue hover:file:bg-blue-100" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-mgmu-blue text-white px-6 py-2 font-bold rounded-lg hover:bg-mgmu-gold transition-colors">Publish to Homepage</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-mgmu-blue mb-4">Active Announcements</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="p-3">Date</th>
                <th className="p-3">Title</th>
                <th className="p-3">Media</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {announcements.map((ann) => (
                <tr key={ann._id}>
                  <td className="p-3 text-sm text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</td>
                  <td className="p-3 font-bold text-sm text-mgmu-blue">{ann.title}</td>
                  <td className="p-3 text-sm">
                    {ann.media_type !== 'none' ? <span className="uppercase text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{ann.media_type}</span> : <span className="text-gray-400 text-xs">Text Only</span>}
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(ann._id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-sm text-gray-500">No active announcements.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const handleToggleAdmission = async () => {
      try {
        const newState = !isAdmissionOpen;
        await api.put(`/settings/admission-window?is_open=${newState}`);
        setIsAdmissionOpen(newState);
      } catch (error) {
        console.error("Failed to toggle admission window", error);
        alert("Failed to update system settings.");
      }
    };

    return (
      <div className="space-y-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-bold text-mgmu-blue mb-4">System Settings</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg">
            <div>
              <p className="font-bold text-mgmu-blue text-sm">Ph.D. Admission Window</p>
              <p className="text-xs text-gray-500 mt-1">Controls whether students can register for new Ph.D. applications.</p>
            </div>
            <button 
              onClick={handleToggleAdmission}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-mgmu-gold focus:ring-offset-2 ${isAdmissionOpen ? 'bg-mgmu-blue' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdmissionOpen ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="mt-4 p-3 bg-blue-50 text-mgmu-blue text-xs rounded border border-blue-100">
            <strong>Current Status:</strong> {isAdmissionOpen ? 'OPEN (Students can register)' : 'CLOSED (Student registrations are blocked)'}
          </div>
        </div>
      </div>
    );
  };

  const renderFacultyRoles = () => {
    const facultyUsers = allUsers.filter(u => u.role === 'FACULTY' && u.is_approved);

    return (
      <div className="space-y-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-bold text-mgmu-blue mb-4">Faculty Role Assignment</h3>
          <p className="text-sm text-gray-500 mb-6">Assign academic subjects and administrative roles to approved faculty members.</p>
          
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                <th className="p-3 w-1/4">Faculty Name</th>
                <th className="p-3 w-1/4">Department</th>
                <th className="p-3 w-1/4">Assigned Roles/Subjects</th>
                <th className="p-3 w-1/4">Assign New Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facultyUsers.length > 0 ? facultyUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-3 text-sm font-bold text-mgmu-blue">{user.name}</td>
                  <td className="p-3 text-sm text-gray-600">{user.department || 'N/A'}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {(user.faculty_roles || []).map((role: string) => (
                        <span key={role} className="inline-flex items-center space-x-1 px-2 py-1 bg-mgmu-blue/10 text-mgmu-blue text-xs rounded-full font-medium border border-mgmu-blue/20">
                          <span>{role}</span>
                          <button onClick={() => handleRevokeFacultyRole(user._id, role)} className="hover:text-red-500 transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {(!user.faculty_roles || user.faculty_roles.length === 0) && (
                        <span className="text-xs text-gray-400 italic">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <select 
                        value={selectedRole[user._id] || ''}
                        onChange={(e) => setSelectedRole({...selectedRole, [user._id]: e.target.value})}
                        className="text-sm border border-gray-200 rounded p-1 flex-1"
                      >
                        <option value="">Select Role...</option>
                        {roleOptions.map(opt => (
                          <option key={opt} value={opt} disabled={(user.faculty_roles || []).includes(opt)}>{opt}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleAssignFacultyRole(user._id)}
                        className="px-2 py-1 bg-mgmu-gold text-white text-xs font-bold rounded hover:bg-yellow-600"
                      >
                        Assign
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No approved faculty members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'directory', label: 'System Directory', icon: <Users className="h-4 w-4" /> },
    { id: 'accounts', label: 'Account Controls', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'faculty_roles', label: 'Faculty Roles', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'announcements', label: 'Public Notices', icon: <Megaphone className="h-4 w-4" /> },
    { id: 'admission_verifications', label: 'L2 Verifications', icon: <Award className="h-4 w-4" /> },
    { id: 'fwc_approvals', label: 'L4 FWC Approvals', icon: <Share2 className="h-4 w-4" /> },
    { id: 'supervisor', label: 'Supervisor Approvals', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'mom', label: 'MoM Approvals', icon: <FileText className="h-4 w-4" /> },
    { id: 'vault', label: 'Document Vault', icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card">
            <div className={`p-2 w-fit rounded-lg mb-3 ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-mgmu-blue">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
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
          {activeTab === 'directory' && renderDirectory()}
          {activeTab === 'accounts' && renderAccountApprovals()}
          {activeTab === 'faculty_roles' && renderFacultyRoles()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'admission_verifications' && renderAdmissionVerifications()}
          {activeTab === 'fwc_approvals' && renderFWCApprovals()}
          {activeTab === 'supervisor' && renderSupervisor()}
          {activeTab === 'mom' && renderMoM()}
          {activeTab === 'vault' && renderVault()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
