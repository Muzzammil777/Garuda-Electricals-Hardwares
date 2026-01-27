import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext({});

// Default settings fallback
const DEFAULT_SETTINGS = {
  business_name: "Garuda Electricals & Hardwares",
  business_email: "Garudaelectrical@gmail.com",
  business_phone: "919489114403",
  business_whatsapp: "919489114403",
  business_gst: "33BLPPS4603G1Z0",
  business_address: "No 51/1, Near Trichy Main Road, Gandhigramam",
  business_city: "Karur",
  business_pincode: "639004",
  google_maps_url: "https://maps.google.com/?q=Garuda+Electricals+Karur",
  google_maps_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.2649762374414!2d78.0766399!3d11.0168445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAxJzAwLjYiTiA3OMKwMDQnMzYuMCJF!5e0!3m2!1sen!2sin!4v1234567890",
  working_hours: "9:00 AM - 8:00 PM",
  working_days: "Monday - Saturday",
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  youtube_url: "",
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings on error
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Format phone for display (add spaces/dashes)
  const formatPhone = (phone) => {
    if (!phone) return '';
    // If starts with 91 and has 12 digits, format as +91 XXXXX XXXXX
    if (phone.startsWith('91') && phone.length === 12) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  // Get WhatsApp link
  const getWhatsAppLink = (message = '') => {
    const phone = settings.business_whatsapp || settings.business_phone;
    if (!phone) return '#';
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
  };

  // Get call link
  const getCallLink = () => {
    const phone = settings.business_phone;
    if (!phone) return '#';
    return `tel:+${phone.replace(/[^\d]/g, '')}`;
  };

  // Get email link
  const getEmailLink = (subject = '') => {
    const email = settings.business_email;
    if (!email) return '#';
    return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
  };

  // Get full address
  const getFullAddress = () => {
    const parts = [
      settings.business_address,
      settings.business_city,
      settings.business_pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const value = {
    settings,
    loading,
    refreshSettings,
    formatPhone,
    getWhatsAppLink,
    getCallLink,
    getEmailLink,
    getFullAddress,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
