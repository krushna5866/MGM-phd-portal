import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Users, Award, FileText, CheckCircle, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Home() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements/');
        setAnnouncements(res.data);
      } catch (e) {
        console.error("Could not fetch announcements", e);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2070" 
            alt="University Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-mgmu-blue/80"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Empowering Research, <br />
              <span className="text-mgmu-gold">Envisioning Future.</span>
            </h1>
            <p className="text-xl mb-8 text-gray-200 leading-relaxed">
              Welcome to the MGM University Ph.D. Management System. A unified platform for scholars, supervisors, and academic authorities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="btn-secondary flex items-center space-x-2 text-lg px-8 py-3">
                <span>Apply for Ph.D.</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/about" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-md hover:bg-white/20 transition-all text-lg">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="py-12 bg-mgmu-light border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3 mb-8">
              <Bell className="h-8 w-8 text-mgmu-gold" />
              <h2 className="text-3xl font-bold text-mgmu-blue">Official Announcements & Notices</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((ann) => (
                <div key={ann._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {ann.media_type === 'image' && ann.media_url && (
                    <div className="w-full bg-gray-50 border-b border-gray-100 flex justify-center p-4">
                      <img src={ann.media_url} alt={ann.title} className="max-w-full max-h-96 object-contain rounded" />
                    </div>
                  )}
                  {ann.media_type === 'video' && ann.media_url && (
                    <div className="h-48 w-full bg-gray-900">
                      <video src={ann.media_url} controls className="w-full h-full" />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">{new Date(ann.created_at).toLocaleDateString()}</p>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{ann.title}</h3>
                    {ann.notes && (
                      <p className="text-gray-600 text-sm whitespace-pre-line">{ann.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-mgmu-blue mb-2">500+</div>
              <div className="text-gray-500 uppercase tracking-wider text-xs font-bold">Research Scholars</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-mgmu-blue mb-2">150+</div>
              <div className="text-gray-500 uppercase tracking-wider text-xs font-bold">Approved Supervisors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-mgmu-blue mb-2">25+</div>
              <div className="text-gray-500 uppercase tracking-wider text-xs font-bold">Departments</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-mgmu-blue mb-2">100%</div>
              <div className="text-gray-500 uppercase tracking-wider text-xs font-bold">Digital Workflow</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-mgmu-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-mgmu-blue mb-4">Comprehensive Research Ecosystem</h2>
            <div className="w-24 h-1 bg-mgmu-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Admission & CET",
                desc: "Seamless online application, CET examination management, and merit-based selection process."
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Supervisor Allocation",
                desc: "Transparent allocation of research supervisors and RAC formation based on expertise."
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Progress Tracking",
                desc: "Regular RAC meetings, progress report submissions, and continuous academic monitoring."
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Coursework",
                desc: "Structured coursework management, examination, and automated certificate generation."
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Thesis Submission",
                desc: "Digital submission of thesis, supervisor approvals, and final Ph.D. notification workflow."
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Academic Authority",
                desc: "BUTR meeting approvals and high-level academic oversight for all research activities."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="text-mgmu-gold mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-mgmu-blue mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-mgmu-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Start Your Research Journey?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join our vibrant research community and contribute to the world of knowledge.
          </p>
          <Link to="/login" className="btn-secondary text-lg px-10 py-4">
            Login to Portal
          </Link>
        </div>
      </section>
    </div>
  );
}
