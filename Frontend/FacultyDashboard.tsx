import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { 
  Briefcase, CheckCircle, CreditCard, Download, FileText, Upload, User, Save
} from 'lucide-react';

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [applicationStatus, setApplicationStatus] = useState<'not_applied' | 'pending' | 'approved'>('not_applied');
  const [profileData, setProfileData] = useState({
    name: '', department: '', research_area: '', google_scholar: '', linkedin: '', contact_email: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data) {
          setProfileData({
            name: response.data.name || '',
            department: response.data.department || '',
            research_area: response.data.research_area || '',
            google_scholar: response.data.google_scholar || '',
            linkedin: response.data.linkedin || '',
            contact_email: response.data.contact_email || response.data.email || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/users/me/profile', profileData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const renderApplication = () => (
    <div className="space-y-6 mt-6">
      <div className="card">
        <h3 className="text-lg font-bold text-mgmu-blue mb-4">Application for Research Supervisor</h3>
        
        {applicationStatus === 'not_applied' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-6">Upload your academic documents and pay the registration fee to apply for BUTR approval as an official Research Supervisor.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-dashed rounded text-center">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-mgmu-blue">Upload Academic CV</p>
                <input type="file" className="mt-2 text-xs mx-auto" />
              </div>
              <div className="p-4 border-2 border-dashed rounded text-center">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-mgmu-blue">Upload PhD Certificate</p>
                <input type="file" className="mt-2 text-xs mx-auto" />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setApplicationStatus('pending')}
                className="flex items-center space-x-2 bg-mgmu-blue text-white font-bold px-6 py-2 rounded-lg hover:bg-mgmu-gold transition-colors"
              >
                <CheckCircle className="h-4 w-4" /><span>Submit Application</span>
              </button>
            </div>
          </div>
        )}

        {applicationStatus === 'pending' && (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <CheckCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-bold text-yellow-800 text-lg">Application Submitted</h4>
            <p className="text-sm text-yellow-700 mt-2">Your application is currently pending approval by the Academic Authority (BUTR).</p>
            <button onClick={() => setApplicationStatus('approved')} className="text-xs font-bold text-gray-400 mt-6 underline">Simulate BUTR Approval</button>
          </div>
        )}

        {applicationStatus === 'approved' && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h4 className="font-bold text-green-800 text-lg">Supervisor Approved!</h4>
            <p className="text-sm text-green-700 mt-2">You are officially recognized as a Research Supervisor at MGMU.</p>
            
            <button className="flex items-center space-x-2 mx-auto mt-6 bg-mgmu-blue text-white font-bold px-6 py-2 rounded-lg hover:bg-mgmu-gold transition-colors">
              <Download className="h-5 w-5" /><span>Download Research Supervisor Letter</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderThesisEvaluation = () => (
    <div className="card mt-6">
      <h3 className="text-lg font-bold text-mgmu-blue mb-4">Thesis Approvals</h3>
      <p className="text-sm text-gray-500 mb-6">Review and officially approve the final thesis documents submitted by your assigned scholars.</p>
      
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
            <th className="p-3">Scholar Name</th>
            <th className="p-3">Thesis Document</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No thesis documents pending evaluation.</td></tr>
        </tbody>
      </table>
    </div>
  );

  const renderProfile = () => (
    <div className="card mt-6">
      <h3 className="text-lg font-bold text-mgmu-blue mb-4">Research Supervisor Profile</h3>
      <p className="text-sm text-gray-500 mb-6">Build your public academic profile. Students will see this information when searching for a Research Supervisor.</p>
      
      <form onSubmit={handleProfileSave} className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Faculty Name</label>
            <input type="text" name="name" value={profileData.name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-mgmu-blue focus:border-mgmu-blue" placeholder="Dr. Jane Doe" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
            <input type="text" name="department" value={profileData.department} onChange={handleChange} className="w-full p-2 border rounded focus:ring-mgmu-blue focus:border-mgmu-blue" placeholder="Computer Science & Engineering" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Research Area (Personal Choice)</label>
          <input type="text" name="research_area" value={profileData.research_area} onChange={handleChange} className="w-full p-2 border rounded focus:ring-mgmu-blue focus:border-mgmu-blue" placeholder="e.g. Artificial Intelligence, Machine Learning..." required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Google Scholar Link</label>
            <input type="url" name="google_scholar" value={profileData.google_scholar} onChange={handleChange} className="w-full p-2 border rounded focus:ring-mgmu-blue focus:border-mgmu-blue" placeholder="https://scholar.google.com/..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn Profile</label>
            <input type="url" name="linkedin" value={profileData.linkedin} onChange={handleChange} className="w-full p-2 border rounded focus:ring-mgmu-blue focus:border-mgmu-blue" placeholder="https://linkedin.com/in/..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Public Contact Email</label>
          <input type="email" name="contact_email" value={profileData.contact_email} onChange={handleChange} className="w-full p-2 border rounded focus:ring-mgmu-blue focus:border-mgmu-blue" placeholder="contact@mgmu.ac.in" required />
        </div>

        <div className="pt-4 border-t mt-6">
          <button type="submit" disabled={saving} className="bg-mgmu-blue text-white font-bold px-6 py-2 rounded shadow hover:opacity-90 flex items-center space-x-2 disabled:opacity-50">
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User className="h-4 w-4" /> },
    { id: 'apply', label: 'Supervisor Application', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'thesis', label: 'Thesis Evaluation', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
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
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'apply' && renderApplication()}
          {activeTab === 'thesis' && renderThesisEvaluation()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
