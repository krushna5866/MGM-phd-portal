import { motion } from 'motion/react';
import { GraduationCap, Award, BookOpen, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-mgmu-blue text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            About Ph.D. Research at MGMU
          </motion.h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Fostering a culture of innovation, critical thinking, and academic excellence through advanced research.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-mgmu-blue mb-6">Our Research Vision</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              MGM University is committed to becoming a global hub for research and innovation. Our Ph.D. programs are designed to challenge scholars to push the boundaries of knowledge and solve real-world problems.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With state-of-the-art laboratories, a vast digital library, and a community of renowned supervisors, we provide the perfect environment for your doctoral journey.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1523050853064-80357588728b?auto=format&fit=crop&q=80&w=2070" 
              alt="Research Lab" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <GraduationCap />, title: "Excellence", desc: "Highest standards of academic rigor and integrity." },
            { icon: <Award />, title: "Recognition", desc: "Globally recognized doctoral degrees." },
            { icon: <BookOpen />, title: "Resources", desc: "Access to premium journals and research tools." },
            { icon: <Users />, title: "Mentorship", desc: "Guidance from industry and academic experts." }
          ].map((item, idx) => (
            <div key={idx} className="text-center p-8 bg-mgmu-light rounded-2xl">
              <div className="inline-block p-4 bg-white rounded-full text-mgmu-gold shadow-sm mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-mgmu-blue mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
