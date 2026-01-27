import { Award, Users, Target, Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

const About = () => {
  const { getWhatsAppLink } = useSettings();

  const values = [
    {
      icon: Users,
      title: 'Customer First',
      description: 'We prioritize our customers\' needs and build lasting relationships through exceptional service and support.'
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'We source only genuine products from trusted manufacturers and authorized distributors.'
    },
    {
      icon: Target,
      title: 'Fair Pricing',
      description: 'We believe in transparent, competitive pricing without compromising on product quality.'
    },
    {
      icon: Heart,
      title: 'Community Focus',
      description: 'As a local business, we\'re committed to serving and growing with our community in Karur.'
    }
  ];

  const milestones = [
    { year: '2009', event: 'Garuda Electricals & Hardwares established in Gandhigramam, Karur' },
    { year: '2012', event: 'Expanded product range to include hardware and plumbing supplies' },
    { year: '2015', event: 'Reached 1000+ satisfied customer milestone' },
    { year: '2018', event: 'Partnered with major electrical brands as authorized dealer' },
    { year: '2021', event: 'Launched digital presence and WhatsApp ordering service' },
    { year: '2024', event: 'Serving 5000+ customers across Karur district' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="gradient-primary py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
              <span className="text-sm text-white/90">About Us</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powering Karur<br />
              <span className="text-amber-400">Since 2009</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              For over 15 years, Garuda Electricals & Hardwares has been the trusted name 
              for quality electrical and hardware supplies in Karur and surrounding areas.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Garuda Electricals & Hardwares was founded in 2009 with a simple mission: 
                  to provide quality electrical and hardware products at fair prices with 
                  excellent customer service.
                </p>
                <p>
                  Located near Trichy Main Road in Gandhigramam, Karur, we started as a 
                  small electrical shop and have grown to become one of the most trusted 
                  names in the region for electrical and hardware supplies.
                </p>
                <p>
                  Our journey has been guided by strong values of honesty, quality, and 
                  customer-centricity. We believe in building long-term relationships with 
                  our customers, understanding their needs, and providing solutions that 
                  truly help them.
                </p>
                <p>
                  Today, we serve thousands of customers including homeowners, electricians, 
                  contractors, and businesses. Our extensive product range, competitive 
                  pricing, and knowledgeable staff make us the go-to destination for all 
                  electrical and hardware needs in Karur.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <img src="/logo.png" alt="Garuda Electricals" className="w-42 h-42 mx-auto mb-6 object-contain" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">15+ Years</h3>
                  <p className="text-gray-600">of Excellence in Service</p>
                </div>
              </div>
              
              {/* Stats Card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">5000+</div>
                    <div className="text-xs text-gray-500">Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">50+</div>
                    <div className="text-xs text-gray-500">Brands</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="card p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Key milestones in our growth story
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-gray-700 mt-3">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="section bg-gray-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What We <span className="text-amber-400">Offer</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive electrical and hardware solutions for all your needs
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Wires & Cables from top brands',
              'Switches, Sockets & Modular accessories',
              'LED Lights & Ceiling Fans',
              'PVC Pipes & Plumbing Fittings',
              'Professional Tools & Equipment',
              'Motors, Pumps & Submersibles',
              'MCBs, Distribution Boards & Panels',
              'Conduit Pipes & Accessories',
              'Exhaust Fans & Ventilation',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Experience Quality Service?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Visit our store or contact us today. We're here to help you find 
            the right products for your electrical and hardware needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-success btn-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
            <Link to="/contact" className="btn-primary btn-lg">
              Contact Us
            </Link>
            <Link to="/products" className="btn-outline btn-lg">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
