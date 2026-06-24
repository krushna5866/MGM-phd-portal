import React, { useState, useRef } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

export default function AdmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDocType, setCurrentDocType] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentDocType) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', currentDocType);

    try {
      setUploading(currentDocType);
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedDocs(prev => ({ ...prev, [currentDocType]: true }));
      alert(`${currentDocType} uploaded successfully!`);
    } catch (error) {
      console.error(error);
      alert(`Failed to upload ${currentDocType}.`);
    } finally {
      setUploading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (submitted) {
    return (
      <div className="card text-center py-12">
        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-mgmu-blue mb-2">Application Submitted!</h2>
        <p className="text-gray-500 mb-6">Your application is under review by the Ph.D. Coordinator.</p>
        <button onClick={() => setSubmitted(false)} className="btn-primary">View Application Status</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-mgmu-blue mb-8">Ph.D. Admission Form 2026</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Full Name (as per SSC)</label>
            <input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mgmu-blue/20" placeholder="Enter your full name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Department / Faculty</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mgmu-blue/20">
              <option>Computer Science & Engineering</option>
              <option>Mechanical Engineering</option>
              <option>Management Science</option>
              <option>Biotechnology</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Master's Degree Percentage/CGPA</label>
            <input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mgmu-blue/20" placeholder="e.g. 85% or 9.2 CGPA" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">GATE/NET/SET Qualified?</label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center space-x-2">
                <input type="radio" name="qualified" /> <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="qualified" /> <span>No</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-mgmu-blue border-b pb-2">Document Upload</h3>
          <input 
            type="file" 
            accept=".pdf,.jpg,.png" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['SSC Marksheet', 'HSC Marksheet', 'Master Degree', 'Photo ID', 'Research Proposal'].map((doc) => {
              const isUploaded = uploadedDocs[doc];
              const isUploading = uploading === doc;
              
              return (
                <div 
                  key={doc} 
                  onClick={() => {
                    setCurrentDocType(doc);
                    fileInputRef.current?.click();
                  }}
                  className={`p-4 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer ${
                    isUploaded 
                      ? 'border-green-500 bg-green-50' 
                      : isUploading 
                        ? 'border-mgmu-gold bg-yellow-50' 
                        : 'border-gray-200 hover:border-mgmu-gold'
                  }`}
                >
                  {isUploaded ? (
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  ) : (
                    <Upload className={`h-6 w-6 mx-auto mb-2 ${isUploading ? 'text-mgmu-gold animate-pulse' : 'text-gray-400'}`} />
                  )}
                  <p className={`text-xs font-bold ${isUploaded ? 'text-green-700' : 'text-gray-600'}`}>
                    {isUploading ? 'Uploading...' : doc}
                  </p>
                  {!isUploaded && !isUploading && (
                    <p className="text-[10px] text-gray-400">PDF, JPG (Max 2MB)</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>



        <div className="flex justify-end space-x-4">
          <button type="button" className="px-6 py-2 text-gray-600 font-bold">Save Draft</button>
          <button type="submit" className="btn-primary">Submit Application</button>
        </div>
      </form>
    </div>
  );
}
