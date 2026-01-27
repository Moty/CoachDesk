"use client";

import { motion } from "framer-motion";
import { useState, FormEvent } from "react";

export default function ConciergeForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    startDate: "",
    endDate: "",
    travelers: "1",
    interests: [] as string[],
    budget: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);

  const interestOptions = [
    "Multi-channel Support",
    "SLA Monitoring",
    "Incident Management",
    "Knowledge Base",
    "Automation",
    "Analytics & Insights"
  ];

  const budgetOptions = [
    "Silver Tier",
    "Black Tier",
    "Obsidian Tier",
    "Custom Enterprise"
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.budget) {
      newErrors.budget = "Please select a tier";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Form submitted:", formData);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        startDate: "",
        endDate: "",
        travelers: "1",
        interests: [],
        budget: "",
        notes: "",
      });
    }
  };

  return (
    <section id="concierge" className="py-24 px-6 bg-[rgb(var(--bg-glass)_/_0.2)]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Request Your Itinerary
          </h2>
          <p className="text-xl text-[rgb(var(--text-secondary))]">
            Tell us about your needs and we'll craft the perfect solution
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl bg-[rgb(var(--bg-glass)_/_0.5)] border border-[rgb(var(--border-glass)_/_0.1)]"
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-glass)_/_0.2)] focus:border-[rgb(var(--accent-primary))] outline-none transition-colors"
                aria-describedby={errors.name ? "name-error" : undefined}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-glass)_/_0.2)] focus:border-[rgb(var(--accent-primary))] outline-none transition-colors"
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                Preferred Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-glass)_/_0.2)] focus:border-[rgb(var(--accent-primary))] outline-none transition-colors"
                aria-describedby={errors.startDate ? "startDate-error" : undefined}
                aria-invalid={!!errors.startDate}
              />
              {errors.startDate && (
                <p id="startDate-error" className="mt-1 text-sm text-red-400">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                Preferred End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-glass)_/_0.2)] focus:border-[rgb(var(--accent-primary))] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Travelers */}
          <div className="mb-6">
            <label htmlFor="travelers" className="block text-sm font-medium mb-2">
              Number of Team Members
            </label>
            <input
              type="number"
              id="travelers"
              min="1"
              value={formData.travelers}
              onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-glass)_/_0.2)] focus:border-[rgb(var(--accent-primary))] outline-none transition-colors"
            />
          </div>

          {/* Interests */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Areas of Interest
            </label>
            <div className="flex flex-wrap gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white"
                      : "bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-glass)_/_0.2)] hover:border-[rgb(var(--accent-primary)_/_0.5)]"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="mb-6">
            <label htmlFor="budget" className="block text-sm font-medium mb-2">
              Tier Selection *
            </label>
            <select
              id="budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-glass)_/_0.2)] focus:border-[rgb(var(--accent-primary))] outline-none transition-colors"
              aria-describedby={errors.budget ? "budget-error" : undefined}
              aria-invalid={!!errors.budget}
            >
              <option value="">Select a tier</option>
              {budgetOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.budget && (
              <p id="budget-error" className="mt-1 text-sm text-red-400">{errors.budget}</p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-glass)_/_0.2)] focus:border-[rgb(var(--accent-primary))] outline-none transition-colors resize-none"
              placeholder="Tell us more about your specific needs..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-full bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white font-semibold hover:scale-[1.02] transition-transform"
          >
            Submit Request
          </button>
        </motion.form>

        {/* Toast notification */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 px-6 py-4 rounded-lg bg-[rgb(var(--accent-primary))] text-white shadow-lg z-50"
          >
            ✓ Request received! We'll be in touch soon.
          </motion.div>
        )}
      </div>
    </section>
  );
}
