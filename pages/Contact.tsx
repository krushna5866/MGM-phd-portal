import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-mgmu-light min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-mgmu-blue mb-4">Contact Research Cell</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Have questions about Ph.D. admissions, coursework, or thesis submission? Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg text-mgmu-blue">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-mgmu-blue mb-1">Our Location</h4>
                  <p className="text-sm text-gray-500">MGM Campus, CIDCO, Aurangabad - 431003, Maharashtra</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-mgmu-blue mb-1">Call Us</h4>
                  <p className="text-sm text-gray-500">+91 240 2489601</p>
                  <p className="text-sm text-gray-500">Mon-Sat, 10am - 5pm</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-mgmu-blue mb-1">Email Us</h4>
                  <p className="text-sm text-gray-500">phd@mgmu.ac.in</p>
                  <p className="text-sm text-gray-500">research@mgmu.ac.in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-2xl font-bold text-mgmu-blue mb-8">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mgmu-blue/20" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mgmu-blue/20" placeholder="john@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mgmu-blue/20" placeholder="Admission Query" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mgmu-blue/20" placeholder="Your message here..."></textarea>
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2 py-4">
                  <span>Send Message</span>
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
