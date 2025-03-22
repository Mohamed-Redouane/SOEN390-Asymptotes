"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/use-intersection-observer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Mail, MapPin, ExternalLink, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function ContactSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: "", email: "", message: "" });
      toast.success("Message sent successfully! We'll get back to you soon.");
    }, 1500);
  };

  return (
    <section id="contact" ref={ref} className="py-16 md:py-24 relative">
      {/* Section Header */}
      <motion.div
        className="text-center mb-12"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white inline-block relative" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          <span className="relative z-10">Get In Touch</span>
        </h2>
        <div className="w-16 h-1 bg-white mx-auto rounded-full mb-6" />
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Have questions about ONCampus? Want to provide feedback or join our team? We'd love to hear from you!
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Contact Information Card */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-full bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/10 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Email</h4>
                    <a
                      href="mailto:contact@oncampus.concordia.ca"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      contact@oncampus.concordia.ca
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/10 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Location</h4>
                    <p className="text-gray-300">
                      1455 De Maisonneuve Blvd. W.
                      <br />
                      Montreal, Quebec, Canada
                      <br />
                      H3G 1M8
                    </p>
                  </div>
                </div>
              </div>

              {/* Campus Maps */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Campus Maps</h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.a
                    href="https://www.concordia.ca/maps/sgw-campus.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <span>SGW Campus</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    href="https://www.concordia.ca/maps/loyola-campus.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <span>Loyola Campus</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Message Form Card */}
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative h-full bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-6">Send Us a Message</h3>

              {isSubmitted ? (
                <SuccessMessage onReset={() => setIsSubmitted(false)} />
              ) : (
                <ContactForm
                  formState={formState}
                  isSubmitting={isSubmitting}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


const SuccessMessage = ({ onReset }: { onReset: () => void }) => (
  <motion.div
    className="text-center py-8"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="bg-white/10 p-4 rounded-full inline-flex mb-4"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
    >
      <CheckCircle className="w-8 h-8 text-white" />
    </motion.div>
    <h4 className="text-xl font-semibold text-white mb-2">Message Sent!</h4>
    <p className="text-gray-300">
      Thank you for reaching out. We'll get back to you as soon as possible.
    </p>
    <Button
      className="mt-6 bg-white/10 hover:bg-white/20 text-white shadow-lg"
      onClick={onReset}
    >
      Send Another Message
    </Button>
  </motion.div>
);

const ContactForm = ({
  formState,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  formState: { name: string; email: string; message: string };
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <FormField
      label="Name"
      id="name"
      name="name"
      value={formState.name}
      onChange={onChange}
      placeholder="Your name"
    />
    
    <FormField
      label="Email"
      id="email"
      type="email"
      name="email"
      value={formState.email}
      onChange={onChange}
      placeholder="your.email@example.com"
    />
    
    <div>
      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
        Message
      </label>
      <Textarea
        id="message"
        name="message"
        value={formState.message}
        onChange={onChange}
        placeholder="Your message"
        required
        rows={5}
        className="bg-white/10 border-white/10 text-white placeholder:text-white focus:border-white/20 focus:ring-white/20"
        aria-required="true"
      />
    </div>

    <SubmitButton isSubmitting={isSubmitting} />
  </form>
);

const FormField = ({
  label,
  id,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <Input
      id={id}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="bg-white/10 border-white/10 text-white placeholder:text-white focus:border-white/20 focus:ring-white/20"
      aria-required="true"
    />
  </div>
);

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => (
  <Button
    type="submit"
    className="w-full bg-white/10 hover:bg-white/20 text-white shadow-lg"
    disabled={isSubmitting}
  >
    {isSubmitting ? (
      <div className="flex items-center justify-center" aria-hidden="true">
        <Spinner />
        <span>Sending...</span>
      </div>
    ) : (
      <div className="flex items-center justify-center">
        <Send className="mr-2 h-4 w-4" />
        <span>Send Message</span>
      </div>
    )}
  </Button>
);

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);