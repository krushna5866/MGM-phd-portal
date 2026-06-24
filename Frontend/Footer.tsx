import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-mgmu-blue text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap className="h-10 w-10 text-mgmu-gold" />
              <span className="text-xl font-bold">MGM UNIVERSITY</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Established with a vision to provide quality education and research opportunities in various disciplines.
            </p>
          </div>
          
          <div>
            <h4 className="text-mgmu-gold font-bold mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Ph.D. Admissions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Research Centers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Academic Calendar</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Rules & Regulations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-mgmu-gold font-bold mb-6 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-mgmu-gold flex-shrink-0" />
                <span>MGM Campus, CIDCO, Aurangabad - 431003, Maharashtra, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-mgmu-gold flex-shrink-0" />
                <span>+91 240 2489601</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-mgmu-gold flex-shrink-0" />
                <span>registrar@mgmu.ac.in</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-mgmu-gold font-bold mb-6 uppercase tracking-wider">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-900 p-2 rounded-full hover:bg-mgmu-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-blue-900 p-2 rounded-full hover:bg-mgmu-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-blue-900 p-2 rounded-full hover:bg-mgmu-gold transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="bg-blue-900 p-2 rounded-full hover:bg-mgmu-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-blue-900 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MGM University, Aurangabad. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
