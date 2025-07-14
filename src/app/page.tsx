'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Tab-Based Workflow",
      description: "Seamlessly switch between Problem, Code, and Diagram views with organized tabs",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      details: "Clean separation of concerns with persistent state across tabs"
    },
    {
      title: "AI Voice Tutor",
      description: "Natural voice conversations with pause/resume and live transcription",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      details: "Voice-to-text with contextual understanding of your code"
    },
    {
      title: "Dual Code Editor",
      description: "Side-by-side pseudocode planning and Python implementation",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="7" y1="7" x2="7" y2="13" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="11" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="11" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      details: "Plan your approach before coding with visual separation"
    },
    {
      title: "AI Diagram Generation",
      description: "Generate visual diagrams from your code and conversation context",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      details: "Multiple diagram modes: draw, text, SVG, and AI-generated"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="font-[family-name:var(--font-geist-mono)] text-xl font-bold tracking-tight">
              CODEJITSU
            </div>
            <div className="flex items-center gap-12">
              <div className="hidden md:flex gap-12 font-[family-name:var(--font-geist-mono)] text-sm tracking-wider text-gray-400">
                <a href="#features" className="hover:text-cyan-400 transition-colors duration-300">FEATURES</a>
                <a href="#workflow" className="hover:text-cyan-400 transition-colors duration-300">WORKFLOW</a>
                <a href="#interface" className="hover:text-cyan-400 transition-colors duration-300">INTERFACE</a>
              </div>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-none px-6 py-2 text-sm font-medium">
                  Launch Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(55,65,81,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,65,81,0.3)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8 py-32 text-center">
          {/* Main Headlines */}
          <div className="mb-24">
            <div className="font-[family-name:var(--font-geist-mono)] text-sm tracking-[0.3em] text-cyan-400 mb-8">
              NEXT GENERATION LEARNING
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9]">
              <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                MASTER
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                PYTHON
              </span>
            </h1>
            <div className="max-w-2xl mx-auto">
              <p className="text-xl text-gray-300 leading-relaxed mb-12">
                Experience the future of coding education with voice-enabled AI tutoring, 
                intelligent diagram generation, and a workflow designed for mastery.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-8 py-4 text-lg font-medium border-none">
                    Start Learning
                  </Button>
                </Link>
                <Button variant="outline" className="px-8 py-4 text-lg border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-800/80 border-b border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="font-[family-name:var(--font-geist-mono)] text-sm text-gray-400">
                    dashboard.codejitsu.com
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-2">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Two Sum Problem</h3>
                          <p className="text-sm text-gray-400">Arrays • Easy</p>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="font-[family-name:var(--font-geist-mono)] text-sm text-gray-300">
                          def twoSum(nums, target):<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;seen = {}<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;for i, num in enumerate(nums):<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;complement = target - num
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-400">AI Active</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                          &quot;What&apos;s the optimal approach here?&quot;
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg p-3 ml-4">
                        <p className="text-sm text-white">
                          &quot;Use a hash map for O(n) time&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Title */}
            <div className="col-span-4">
              <div className="sticky top-32">
                <div className="font-[family-name:var(--font-geist-mono)] text-sm tracking-[0.3em] text-cyan-400 mb-6">
                  FEATURES
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Revolutionary<br/>
                  Learning<br/>
                  Experience
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 mb-6"></div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Every interface element is designed to accelerate your learning 
                  with intelligent, context-aware interactions.
                </p>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="col-span-8">
              <div className="space-y-24">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="group cursor-pointer"
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start space-x-8">
                      <div className={`transition-all duration-300 ${
                        activeFeature === index ? 'text-cyan-400' : 'text-gray-600'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="font-[family-name:var(--font-geist-mono)] text-sm text-cyan-400">
                          {feature.details}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-32 bg-gray-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <div className="font-[family-name:var(--font-geist-mono)] text-sm tracking-[0.3em] text-cyan-400 mb-6">
              WORKFLOW
            </div>
            <h2 className="text-5xl font-bold text-white mb-8">
              Your Learning Journey
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Optimized for focus, retention, and rapid skill development
            </p>
          </div>

          <div className="grid grid-cols-3 gap-16">
            {[
              {
                number: "01",
                title: "Problem Analysis",
                description: "Start with comprehensive problem understanding using our clean tab interface. View examples, constraints, and hints in an organized layout.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                number: "02",
                title: "AI-Guided Planning",
                description: "Use voice chat with our AI tutor to discuss approaches. Plan your solution in pseudocode before implementing.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                number: "03",
                title: "Visual Implementation",
                description: "Code in Python with real-time feedback. Generate diagrams to visualize your solution and solidify understanding.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-cyan-400 mb-6 flex justify-center">
                  {step.icon}
                </div>
                <div className="font-[family-name:var(--font-geist-mono)] text-6xl font-bold text-gray-700 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Benefits Section */}
      <section id="interface" className="py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 gap-20 items-center">
            <div>
              <div className="font-[family-name:var(--font-geist-mono)] text-sm tracking-[0.3em] text-cyan-400 mb-6">
                INTERFACE DESIGN
              </div>
              <h2 className="text-5xl font-bold text-white mb-12">
                Why Our<br/>
                Interface<br/>
                Works
              </h2>
              
              <div className="space-y-12">
                {[
                  {
                    title: "Cognitive Load Reduction",
                    description: "Tab-based interface eliminates context switching. Focus on one aspect at a time."
                  },
                  {
                    title: "Natural Conversation",
                    description: "Voice chat with pause/resume creates natural learning dialogue with context retention."
                  },
                  {
                    title: "Visual Learning",
                    description: "Multi-modal diagram editor matches different learning styles."
                  },
                  {
                    title: "Persistent State",
                    description: "Your work is preserved across tabs and sessions. Never lose progress."
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className="w-1 h-12 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl"></div>
              <div className="relative p-12 text-center">
                <h3 className="text-3xl font-bold text-white mb-12">
                  Learning Accelerated
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { value: "3x", label: "Faster Problem Solving", color: "text-cyan-400" },
                    { value: "85%", label: "Better Code Quality", color: "text-purple-400" },
                    { value: "90%", label: "Concept Retention", color: "text-green-400" },
                    { value: "2x", label: "Interview Success", color: "text-orange-400" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-300">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ready to Transform<br/>
            Your Python Skills?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of developers who&apos;ve mastered technical interviews 
            with our AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-12 py-4 text-lg font-semibold border-none">
                Launch Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 px-12 py-4 text-lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-4 gap-12">
            <div>
              <div className="font-[family-name:var(--font-geist-mono)] text-xl font-bold mb-6">
                CODEJITSU
              </div>
              <p className="text-gray-400 mb-6">
                AI-powered Python learning platform designed for mastery
              </p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            </div>
            {[
              {
                title: "Features",
                links: ["Voice AI Tutor", "Visual Diagrams", "Dual Code Editor", "Problem Generator"]
              },
              {
                title: "Learning",
                links: ["Algorithm Practice", "Data Structures", "System Design", "Interview Prep"]
              },
              {
                title: "Support",
                links: ["Documentation", "Community", "Contact", "Help Center"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-white mb-6">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-gray-500 text-sm tracking-wider">
              © 2024 CODEJITSU. FORGE YOUR CODING DESTINY.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
