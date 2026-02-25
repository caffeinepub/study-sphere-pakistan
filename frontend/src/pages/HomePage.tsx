import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, BookOpen, Microscope, FlaskConical, Zap, GraduationCap, Star, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const classButtons = [
    { label: 'Class 9', sublabel: 'Matric Part 1', classNum: '9', icon: BookOpen, color: 'bg-teal-500 dark:bg-teal-600' },
    { label: 'Class 10', sublabel: 'Matric Part 2', classNum: '10', icon: Star, color: 'bg-orange-500 dark:bg-orange-600' },
    { label: 'Class 11', sublabel: 'FSc Part 1', classNum: '11', icon: BookOpen, color: 'bg-blue-500 dark:bg-blue-600' },
    { label: 'Class 12', sublabel: 'FSc Part 2', classNum: '12', icon: GraduationCap, color: 'bg-indigo-500 dark:bg-indigo-600' },
    { label: 'MDCAT Prep', sublabel: 'Entry Test', path: '/mdcat', icon: Microscope, color: 'bg-emerald-500 dark:bg-emerald-600' },
  ];

  const features = [
    { icon: BookOpen, title: 'Comprehensive Notes', desc: 'Detailed PDF notes for every chapter', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Zap, title: 'Interactive Quizzes', desc: 'Test your knowledge with MCQs', color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { icon: FlaskConical, title: 'Flashcards', desc: 'Quick revision with flip cards', color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: Star, title: 'Favorites', desc: 'Save chapters for quick access', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { icon: Clock, title: 'Recent History', desc: 'Pick up where you left off', color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: Shield, title: 'Free Forever', desc: 'All content completely free', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/class/$classNum', params: { classNum: '11' } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/20 dark:from-blue-900/20 dark:via-gray-900 dark:to-gray-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-400 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            FSc &amp; MDCAT Study Platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Study Smarter,{' '}
            <span className="text-primary dark:text-blue-400">Score Higher</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Complete study resources for Matric, FSc, and MDCAT preparation. Notes, quizzes, flashcards, and audio lectures — all in one place.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg mx-auto mb-10">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chapters..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary dark:bg-blue-600 text-white font-medium hover:bg-primary/90 dark:hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Class buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {classButtons.map(btn => (
              <button
                key={btn.label}
                onClick={() => {
                  if ('path' in btn && btn.path) {
                    navigate({ to: btn.path as '/' });
                  } else if ('classNum' in btn && btn.classNum) {
                    navigate({ to: '/class/$classNum', params: { classNum: btn.classNum } });
                  }
                }}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl ${btn.color} text-white font-medium hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5`}
              >
                <btn.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-heading font-semibold">{btn.label}</div>
                  <div className="text-xs opacity-80">{btn.sublabel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white text-center mb-3">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-10">
            Comprehensive tools designed for Pakistani Matric, FSc and MDCAT students
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary dark:bg-blue-900/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
            Start Studying Today
          </h2>
          <p className="text-white/80 mb-8">
            Join thousands of students preparing for their exams with StudyHub.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate({ to: '/class/$classNum', params: { classNum: '9' } })}
              className="px-8 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              Class 9
            </button>
            <button
              onClick={() => navigate({ to: '/class/$classNum', params: { classNum: '10' } })}
              className="px-8 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              Class 10
            </button>
            <button
              onClick={() => navigate({ to: '/class/$classNum', params: { classNum: '11' } })}
              className="px-8 py-3 rounded-xl bg-white text-primary dark:text-blue-700 font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              Class 11
            </button>
            <button
              onClick={() => navigate({ to: '/class/$classNum', params: { classNum: '12' } })}
              className="px-8 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              Class 12
            </button>
            <button
              onClick={() => navigate({ to: '/mdcat' })}
              className="px-8 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              MDCAT
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
