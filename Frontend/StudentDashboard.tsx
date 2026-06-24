import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../lib/api';
import { 
  FileText, CheckCircle, Clock, Calendar, 
  Download, Upload, User, GraduationCap, Award, BookOpen, AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const [isPhdStudent, setIsPhdStudent] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [application, setApplication] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
  const [currentDocType, setCurrentDocType] = useState<string>('');

  const fetchApplication = async () => {
    try {
      const response = await api.get('/applications/');
      if (response.data && response.data.length > 0) {
        setApplication(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch application", error);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentDocType) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', currentDocType);

    try {
      setUploading(currentDocType);
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedDocs(prev => ({ ...prev, [currentDocType]: res.data.url }));
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

  const submitApplication = async () => {
    try {
      if (!uploadedDocs['Masters_Degree'] || !uploadedDocs['ID_Proof']) {
        alert("Please upload mandatory documents first.");
        return;
      }
      
      const payload = {
        documents: [
          { name: "Masters_Degree", url: uploadedDocs['Masters_Degree'] },
          { name: "ID_Proof", url: uploadedDocs['ID_Proof'] }
        ]
      };
      
      await api.post('/applications/', payload);
      await fetchApplication();
      alert("Application submitted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to submit application.");
    }
  };

  const uploadFWCPresentation = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !application?._id) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploading("FWC");
      await api.post(`/applications/${application._id}/fwc-presentation`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchApplication();
      alert("FWC Presentation uploaded to authority.");
    } catch (e) {
      console.error(e);
      alert("Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const UploadCard = ({ title, docType, description }: { title: string, docType: string, description: string }) => {
    const isUploaded = uploadedDocs[docType];
    const isCurrentlyUploading = uploading === docType;
    
    return (
      <div className="card border-dashed border-2 bg-gray-50 flex items-center justify-between mt-4">
        <div>
          <h4 className="font-bold text-mgmu-blue">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button 
          onClick={() => {
            setCurrentDocType(docType);
            fileInputRef.current?.click();
          }}
          disabled={isCurrentlyUploading}
          className={`px-4 py-2 rounded font-bold flex items-center space-x-2 transition-all ${
            isUploaded 
              ? 'bg-green-100 text-green-700' 
              : 'bg-mgmu-gold/10 text-mgmu-gold hover:bg-mgmu-blue hover:text-white'
          }`}
        >
          {isUploaded ? <CheckCircle className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          <span>{isCurrentlyUploading ? 'Uploading...' : isUploaded ? 'Uploaded' : 'Upload'}</span>
        </button>
      </div>
    );
  };

  // APPLICANT TABS
  // APPLICANT TABS
  const renderOverview = () => {
    const levelStr = application?.current_level || 'LEVEL_1_PROFILING';
    const levels = ['LEVEL_1_PROFILING', 'LEVEL_2_VERIFICATION', 'LEVEL_3_PET_RESULT', 'LEVEL_4_FWC_PREP', 'LEVEL_5_FWC_INTERVIEW', 'ADMISSION_COMPLETE'];
    const currentStepIndex = levels.indexOf(levelStr) + 1;
    
    return (
      <div className="space-y-6">
        <div className="flex bg-blue-50 p-4 rounded-lg border border-blue-100 items-start space-x-4">
          <AlertCircle className="h-6 w-6 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-800">Your Ph.D. Applicant Stage: Level {currentStepIndex > 0 ? currentStepIndex : 1}</h4>
            <p className="text-sm text-blue-600 mt-1">Status: {application?.status || 'PENDING SUBMISSION'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAdmissionDocs = () => {
    const hasApplication = !!application;
    
    return (
      <div className="space-y-6">
        <div className={`card ${hasApplication ? 'opacity-70 bg-gray-50' : 'border-mgmu-gold'}`}>
          <h4 className="font-bold text-mgmu-blue mb-2 flex items-center justify-between">
            <span>Level 1: Registration & Profiling</span>
            {hasApplication && <CheckCircle className="h-5 w-5 text-green-500" />}
          </h4>
          {!hasApplication && (
            <>
              <p className="text-sm text-gray-500 mb-4">Please upload your Masters Degree and ID Proof to submit your application.</p>
              <UploadCard title="Masters Degree" docType="Masters_Degree" description="PDF formatting required." />
              <UploadCard title="Valid ID Proof" docType="ID_Proof" description="Aadhar / PAN / Passport." />
              <div className="mt-4 flex justify-end">
                <button onClick={submitApplication} disabled={!uploadedDocs['Masters_Degree'] || !uploadedDocs['ID_Proof']} className="bg-mgmu-blue text-white font-bold px-6 py-2 rounded disabled:opacity-50 hover:bg-mgmu-gold transition-colors">Submit Application</button>
              </div>
            </>
          )}
          {hasApplication && (
            <p className="text-sm text-green-600 font-bold mt-4">Application Submitted Successfully!</p>
          )}
        </div>
        
        {hasApplication && (
          ['LEVEL_3_PET_RESULT', 'LEVEL_4_FWC_PREP', 'LEVEL_5_FWC_INTERVIEW', 'ADMISSION_COMPLETE'].includes(application.current_level) || 
          (application.current_level === 'LEVEL_2_VERIFICATION' && application.status === 'APPROVED')
        ) ? (
          <div className="card border-green-200 bg-green-50">
             <h4 className="font-bold text-green-800 flex items-center justify-between">
               <span>Level 2: Document Verification</span>
               <CheckCircle className="h-5 w-5 text-green-600" />
             </h4>
             <p className="text-sm mt-2 text-green-700">Your documents have been successfully verified by BUTR. You can proceed to the next steps.</p>
          </div>
        ) : hasApplication && application.current_level === 'LEVEL_2_VERIFICATION' ? (
          <div className="card border-blue-200 bg-blue-50">
             <h4 className="font-bold text-blue-800">Level 2: Document Verification</h4>
             <p className="text-sm mt-2 text-blue-700">Your application is currently under review by the BUTR.</p>
             {application.rejection_reason && (
               <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                 <strong>Rejection Reason:</strong> {application.rejection_reason}
               </div>
             )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderCET = () => {
    if (!application) return null;
    
    const showLevel2 = application.current_level === 'LEVEL_2_VERIFICATION' && application.status === 'APPROVED';
    const showLevel3 = application.current_level === 'LEVEL_3_PET_RESULT' || application.pet_result !== 'PENDING';
    const showLevel4 = application.current_level === 'LEVEL_4_FWC_PREP' || application.current_level === 'LEVEL_5_FWC_INTERVIEW' || application.current_level === 'ADMISSION_COMPLETE';

    if (!showLevel2 && !showLevel3 && !showLevel4) {
      return (
        <div className="card text-center py-12">
           <AlertCircle className="mx-auto text-gray-400 h-12 w-12 mb-4" />
           <p className="text-sm text-gray-500">Level Locked. Await document verification.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="card">
          <h4 className="font-bold text-mgmu-blue mb-4">Level 2 & 3: PET Exam</h4>
          
          {!application.pet_hall_ticket_url && (
            <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
              <Clock className="mx-auto h-8 w-8 mb-2 opacity-80" />
              <p className="font-bold">Waiting for CoE to generate Hall Ticket.</p>
            </div>
          )}

          {application.pet_hall_ticket_url && (
            <div className="space-y-4">
              <div className="pt-2">
                <a href={application.pet_hall_ticket_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition-colors space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Hall Ticket</span>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className={`card ${!showLevel3 && !showLevel4 ? 'opacity-50 pointer-events-none' : ''}`}>
          <h4 className="font-bold text-mgmu-blue mb-4">PET Exam Result</h4>
          {application.pet_result !== 'PENDING' ? (
            <div className={`p-4 rounded border ${application.pet_result === 'PASSED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">Status:</span>
                <span className={`px-3 py-1 text-sm font-bold rounded uppercase ${application.pet_result === 'PASSED' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {application.pet_result}
                </span>
              </div>
              {application.pet_result_file_url && (
                <a href={application.pet_result_file_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-mgmu-blue underline text-sm">Download Official Result Document</a>
              )}
            </div>
          ) : (
             <div className="text-center p-4 text-sm text-gray-500 bg-gray-50 rounded">Results pending declaration by COE.</div>
          )}
        </div>
      </div>
    );
  };

  const renderFWC = () => {
    if (!application) return null;
    const isLevel4 = application.current_level === 'LEVEL_4_FWC_PREP';
    const isLevel5 = application.current_level === 'LEVEL_5_FWC_INTERVIEW' || application.current_level === 'ADMISSION_COMPLETE';

    if (!isLevel4 && !isLevel5) {
      return (
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto text-red-400 h-12 w-12 mb-4" />
          <h3 className="font-bold text-lg text-gray-700 mb-2">FWC Stage Locked</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">You must qualify the PET Exam and be granted approval by BUTR to access FWC.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="card">
          <h3 className="font-bold text-lg text-mgmu-blue mb-2">Level 4: FWC Preparation</h3>
          <p className="text-sm text-gray-500 mb-6">Congratulations on clearing the PET. Upload your research presentation for the upcoming FWC meeting.</p>
          
          {application.status === 'PENDING' && isLevel4 ? (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
              <Clock className="mx-auto h-6 w-6 mb-2" />
              <p className="text-sm font-bold">Waiting for BUTR to grant FWC Access.</p>
            </div>
          ) : !application.fwc_presentation_url ? (
            <div>
              <p className="text-sm font-medium mb-2">Upload PPT/PDF Presentation:</p>
              <input type="file" onChange={uploadFWCPresentation} accept=".pdf,.ppt,.pptx" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-mgmu-blue file:text-white hover:file:bg-mgmu-gold" />
              {uploading === 'FWC' && <p className="text-xs text-blue-500 mt-2">Uploading...</p>}
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>FWC Presentation Uploaded!</span>
            </div>
          )}
        </div>

        <div className={`card ${!isLevel5 ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-bold text-mgmu-blue mb-4">Level 5: FWC Meeting Schedule</h3>
          {application.fwc_time_slot ? (
             <div className="space-y-2">
               <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                 <p className="text-sm text-yellow-800 font-bold mb-1">Your meeting has been scheduled by the Ph.D. Coordinator!</p>
                 <div className="grid grid-cols-2 text-sm gap-2 mt-4">
                   <div><span className="text-gray-500 uppercase text-xs">Date/Time:</span> {new Date(application.fwc_time_slot).toLocaleString()}</div>
                   <div className="col-span-2"><span className="text-gray-500 uppercase text-xs">Location/Venue:</span> {application.fwc_venue}</div>
                 </div>
               </div>
             </div>
          ) : (
            <p className="text-sm text-gray-500 text-center p-4 bg-gray-50 rounded">Pending assignment from Ph.D. Coordinator.</p>
          )}
        </div>
      </div>
    );
  };

  // ENROLLED STUDENT TABS
  const renderRACAllocation = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-lg text-mgmu-blue mb-2">Topic & Supervisor Allocation</h3>
        <p className="text-sm text-gray-500 mb-6">Upload your final presentation and synopsis copy for official RAC topic finalization.</p>
        
        <UploadCard title="Final Presentation" docType="Allocation_Presentation" description="PPT format" />
        <UploadCard title="Synopsis Copy" docType="Allocation_Synopsis" description="Approved synopsis document (PDF)" />
        
        <div className="mt-8 pt-6 border-t">
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Registration Letter</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCourseWork = () => (
    <div className="card text-center py-12">
      <Award className="h-16 w-16 text-mgmu-gold mx-auto mb-4" />
      <h3 className="font-bold text-2xl text-mgmu-blue mb-2">Course Work Completed</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Your mandatory coursework has been successfully completed and the certificate was generated by the CoE office.</p>
      <button className="btn-primary mx-auto flex items-center space-x-2">
        <Download className="h-4 w-4" />
        <span>Download Course Work Certificate</span>
      </button>
    </div>
  );

  const renderPeriodicRAC = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-mgmu-blue">RAC Review Meeting #3</h3>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Upcoming</span>
        </div>
        
        <div className="space-y-2">
          <UploadCard title="Progress Presentation" docType="RAC_Presentation" description="PPT detailing your progress in the last 6 months" />
          <UploadCard title="Progress Synopsis" docType="RAC_Synopsis" description="Written synopsis updates" />
          <UploadCard title="Publication Proof" docType="RAC_Publication" description="Accepted paper certificates (if any)" />
        </div>
      </div>
    </div>
  );

  const renderThesis = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-lg text-mgmu-blue mb-6">Final Thesis Submission</h3>
        
        <div className="mb-8 p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-700">Official Thesis Format</h4>
            <p className="text-sm text-gray-500">Download the required structure for your thesis document.</p>
          </div>
          <button className="text-mgmu-blue font-bold flex items-center space-x-2 hover:text-mgmu-gold">
            <Download className="h-4 w-4" /><span>Format.pdf</span>
          </button>
        </div>

        <UploadCard title="Upload Final Thesis" docType="Final_Thesis" description="Your complete, formatted thesis document ready for authority approval." />
        
        <div className="mt-8 pt-6 border-t flex items-center space-x-4">
          <button className="btn-primary flex items-center space-x-2 disabled:opacity-50" disabled>
            <Download className="h-4 w-4" />
            <span>Download Ph.D. Notification</span>
          </button>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Available after CoE Generation</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hidden File Input handler */}
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          
          {/* Always Show Admission if they are an active applicant */}
          {(!application || application.current_level !== 'ADMISSION_COMPLETE') && (
            <>
              <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center space-x-3 transition-colors ${activeTab === 'overview' ? 'bg-mgmu-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <User className="h-5 w-5" /> <span>Overview</span>
              </button>
              <button onClick={() => setActiveTab('admission')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center space-x-3 transition-colors ${activeTab === 'admission' ? 'bg-mgmu-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <FileText className="h-5 w-5" /> <span>Admission</span>
              </button>
              <button onClick={() => setActiveTab('cet')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center space-x-3 transition-colors ${activeTab === 'cet' ? 'bg-mgmu-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Calendar className="h-5 w-5" /> <span>PET Exam</span>
              </button>
            </>
          )}

          {/* Show FWC only if past Level 3 */}
          {application && ['LEVEL_4_FWC_PREP', 'LEVEL_5_FWC_INTERVIEW', 'ADMISSION_COMPLETE'].includes(application.current_level) && (
            <button onClick={() => setActiveTab('fwc')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center space-x-3 transition-colors ${activeTab === 'fwc' ? 'bg-mgmu-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FileText className="h-5 w-5" /> <span>FWC Stage</span>
            </button>
          )}

          {/* Show Enrolled Ph.D. tabs only if ADMISSION_COMPLETE */}
          {application?.current_level === 'ADMISSION_COMPLETE' && (
            <>
              <button onClick={() => setActiveTab('rac_allocation')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center space-x-3 transition-colors ${activeTab === 'rac_allocation' ? 'bg-mgmu-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <GraduationCap className="h-5 w-5" /> <span>Topic Allocation</span>
              </button>
              <button onClick={() => setActiveTab('coursework')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center space-x-3 transition-colors ${activeTab === 'coursework' ? 'bg-mgmu-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <BookOpen className="h-5 w-5" /> <span>Course Work</span>
              </button>
              <button onClick={() => setActiveTab('periodic_rac')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center space-x-3 transition-colors ${activeTab === 'periodic_rac' ? 'bg-mgmu-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Clock className="h-5 w-5" /> <span>Periodic RACs</span>
              </button>
              <button onClick={() => setActiveTab('thesis')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center space-x-3 transition-colors ${activeTab === 'thesis' ? 'bg-mgmu-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Award className="h-5 w-5" /> <span>Thesis Submission</span>
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'admission' && renderAdmissionDocs()}
              {activeTab === 'cet' && renderCET()}
              {activeTab === 'fwc' && renderFWC()}
              {application?.current_level === 'ADMISSION_COMPLETE' && (
                <>
                  {activeTab === 'rac_allocation' && renderRACAllocation()}
                  {activeTab === 'coursework' && renderCourseWork()}
                  {activeTab === 'periodic_rac' && renderPeriodicRAC()}
                  {activeTab === 'thesis' && renderThesis()}
                </>
              )}
              {application?.current_level !== 'ADMISSION_COMPLETE' && ['rac_allocation', 'coursework', 'periodic_rac', 'thesis'].includes(activeTab) && (
                <div className="card text-center py-12">
                  <AlertCircle className="mx-auto text-red-400 h-12 w-12 mb-4" />
                  <h3 className="font-bold text-lg text-gray-700 mb-2">Stage Locked</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">You must complete the entire admission process to access enrolled scholar modules.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
