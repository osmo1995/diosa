
import React, { useState } from 'react';
import { CheckCircle, Calendar, Sparkles, User, Scissors } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { services } from '../data/salonContent';
import { FormData } from '../types';

export const Contact: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [formData, setFormData] = useState<FormData>({
    service: '',
    length: '',
    date: '',
    name: '',
    email: '',
    phone: ''
  });

  const validateStep = (s: number) => {
    const nextErrors: Partial<Record<keyof FormData, string>> = {};

    if (s === 1 && !formData.service) nextErrors.service = 'Please choose a service.';
    if (s === 2 && !formData.length) nextErrors.length = 'Please choose a desired length.';
    if (s === 3 && !formData.date) nextErrors.date = 'Please pick a preferred date.';

    if (s === 4) {
      if (!formData.name.trim()) nextErrors.name = 'Name is required.';
      if (!formData.email.trim()) nextErrors.email = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) nextErrors.email = 'Enter a valid email.';
      if (!formData.phone.trim()) nextErrors.phone = 'Phone is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    const ok = validateStep(step);
    if (!ok) {
      // Best-effort: focus first invalid field
      const firstKey = Object.keys(errors)[0] as keyof FormData | undefined;
      if (firstKey) {
        const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
        el?.focus?.();
      }
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const updateForm = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const steps = [
    { name: 'Service', icon: Scissors },
    { name: 'Style', icon: Sparkles },
    { name: 'Date', icon: Calendar },
    { name: 'Details', icon: User },
    { name: 'Confirm', icon: CheckCircle },
  ];

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-serif uppercase tracking-widest mb-8">Select Your Transformation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Service selection">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => updateForm('service', s.title)}
                  className={`p-6 border-2 text-left transition-all ${
                    formData.service === s.title 
                    ? 'border-divine-gold bg-soft-champagne' 
                    : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <p className="font-serif text-lg uppercase tracking-wider">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.price}</p>
                </button>
              ))}
              <button
                onClick={() => updateForm('service', 'Other / Consultation')}
                className={`p-6 border-2 text-left transition-all ${
                  formData.service === 'Other / Consultation' 
                  ? 'border-divine-gold bg-soft-champagne' 
                  : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <p className="font-serif text-lg uppercase tracking-wider">Other / Consultation</p>
                <p className="text-xs text-gray-500 mt-1">Free 15-min discovery</p>
              </button>
            </div>
            {errors.service && <p className="text-sm text-red-600">{errors.service}</p>}
            <div className="flex justify-end pt-8">
              <Button disabled={!formData.service} onClick={nextStep} size="lg">Continue</Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-serif uppercase tracking-widest mb-8">Desired Length & Volume</h3>
            <div className="grid grid-cols-1 gap-4">
              {['Natural Volume (18")', 'Hollywood Length (22")', 'Mermaid Dreams (24"+)'].map(l => (
                <button
                  key={l}
                  onClick={() => updateForm('length', l)}
                  className={`p-6 border-2 text-left transition-all ${
                    formData.length === l 
                    ? 'border-divine-gold bg-soft-champagne' 
                    : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <p className="font-serif text-lg uppercase tracking-wider">{l}</p>
                </button>
              ))}
            </div>
            {errors.length && <p className="text-sm text-red-600">{errors.length}</p>}
            <div className="flex justify-between pt-8">
              <Button variant="outline" onClick={prevStep} size="lg">Back</Button>
              <Button disabled={!formData.length} onClick={nextStep} size="lg">Continue</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-serif uppercase tracking-widest mb-8">Preferred Date</h3>
            <div className="space-y-4">
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => updateForm('date', e.target.value)}
                className="w-full p-6 border-2 border-gray-100 focus:border-divine-gold outline-none text-lg transition-all"
              />
              <p className="text-xs text-gray-400 italic">Please note: This is a request, not a confirmed appointment.</p>
            </div>
            {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
            <div className="flex justify-between pt-8">
              <Button variant="outline" onClick={prevStep} size="lg">Back</Button>
              <Button disabled={!formData.date} onClick={nextStep} size="lg">Continue</Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-serif uppercase tracking-widest mb-8">Contact Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <input 
                  name="name"
                  type="text" 
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="w-full p-4 border-b-2 border-gray-100 focus:border-divine-gold outline-none text-base transition-all"
                />
                {errors.name && <p className="text-sm text-red-600 mt-2">{errors.name}</p>}
              </div>
              <div>
                <input 
                  name="email"
                  type="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="w-full p-4 border-b-2 border-gray-100 focus:border-divine-gold outline-none text-base transition-all"
                />
                {errors.email && <p className="text-sm text-red-600 mt-2">{errors.email}</p>}
              </div>
              <div>
                <input 
                  name="phone"
                  type="tel" 
                  placeholder="Phone Number" 
                  value={formData.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="w-full p-4 border-b-2 border-gray-100 focus:border-divine-gold outline-none text-base transition-all"
                />
                {errors.phone && <p className="text-sm text-red-600 mt-2">{errors.phone}</p>}
              </div>
            </div>
            <div className="flex justify-between pt-8">
              <Button variant="outline" onClick={prevStep} size="lg">Back</Button>
              <Button
                disabled={isSubmitting || submitted}
                onClick={async () => {
                  if (!validateStep(4)) return;
                  setIsSubmitting(true);
                  await new Promise((r) => setTimeout(r, 600));
                  setSubmitted(true);
                  setIsSubmitting(false);
                  setStep(5);
                }}
                size="lg"
              >
                {isSubmitting ? 'Submitting…' : 'Confirm Reservation'}
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center py-12 space-y-6">
            <div className="flex justify-center mb-8">
              <CheckCircle size={80} className="text-divine-gold animate-bounce" />
            </div>
            <h3 className="text-4xl font-serif uppercase tracking-widest">Appointment Requested</h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              Thank you, {formData.name}. Our studio coordinator will contact you within 24 hours to finalize your {formData.service} transformation.
            </p>
            <div className="pt-8">
              <Button size="lg" onClick={() => window.location.hash = '/'}>Return Home</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pt-40 pb-24 bg-goddess-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <p className="font-accent text-3xl text-divine-gold mb-2">Reserve Your Experience</p>
          <h1 className="text-5xl font-serif uppercase tracking-widest">Booking</h1>
        </AnimatedSection>

        {/* Stepper */}
        {step < 5 && (
          <div className="mb-12 flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-200 -z-10" />
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step > idx;
              const isCurrent = step === idx + 1;
              return (
                <div key={s.name} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive ? 'bg-divine-gold text-deep-charcoal' : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-divine-gold/20 scale-110' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-bold mt-2 hidden md:block ${
                    isActive ? 'text-divine-gold' : 'text-gray-400'
                  }`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Form Container */}
        <AnimatedSection className="bg-white p-8 md:p-12 shadow-2xl rounded-sm">
          {renderStep()}
        </AnimatedSection>
      </div>
    </div>
  );
};
