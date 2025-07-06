'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-8 border-b border-gray-200">
        <div className="font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-[0.2em]">
          CODEJITSU
        </div>
        <div className="flex gap-8 font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em]">
          <a href="#about" className="hover:text-gray-600 transition-colors">ABOUT</a>
          <a href="#features" className="hover:text-gray-600 transition-colors">FEATURES</a>
          <a href="#contact" className="hover:text-gray-600 transition-colors">CONTACT</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-8 py-20 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="mb-32">
          <div className="grid grid-cols-12 gap-8">
            {/* Main Title Area */}
            <div className="col-span-12 lg:col-span-8">
              <div className="mb-12">
                <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-bold leading-[0.9] tracking-[-0.02em] font-[family-name:var(--font-geist-sans)] mb-6">
                  CODEJITSU
                </h1>
                <div className="w-24 h-[1px] bg-black mb-6"></div>
                <p className="text-xl sm:text-2xl font-light leading-[1.3] tracking-[-0.01em] text-gray-700 max-w-xl">
                  Master Python programming with AI-powered guidance for technical interviews and competitive coding
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <button className="bg-black text-white px-8 py-4 font-medium tracking-wide hover:bg-gray-900 transition-colors">
                  START LEARNING
                </button>
                <button className="border border-black text-black px-8 py-4 font-medium tracking-wide hover:bg-black hover:text-white transition-colors">
                  VIEW DEMO
                </button>
              </div>
            </div>
            
            {/* Right Side Info */}
            <div className="col-span-12 lg:col-span-4">
              <div className="lg:pl-8 pt-8">
                <div className="space-y-8">
                  <div>
                    <h2 className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase mb-6">
                      Core Features
                    </h2>
                    <div className="space-y-4 text-base">
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <span>Real-time code analysis and optimization</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <span>LeetCode-style problem solving</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <span>Technical interview preparation</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-1 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <span>Personalized learning paths</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-[family-name:var(--font-geist-mono)] text-lg font-bold mb-1">1000+</div>
                        <div className="text-gray-600">Problems</div>
                      </div>
                      <div>
                        <div className="font-[family-name:var(--font-geist-mono)] text-lg font-bold mb-1">95%</div>
                        <div className="text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-24">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 sm:col-span-2">
              <h2 className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase">
                How It Works
              </h2>
            </div>
            <div className="col-span-12 sm:col-span-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 tracking-tight">
                    Adaptive Learning
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Personalized curriculum that adjusts to your skill level and pace.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 tracking-tight">
                    Code Analysis
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Real-time feedback with optimization suggestions and complexity analysis.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 tracking-tight">
                    Interview Prep
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Practice with curated problems from top tech companies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500">
            © 2024 CODEJITSU
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500">
            FORGE YOUR CODING DESTINY
          </p>
        </div>
      </footer>
    </div>
  );
}
