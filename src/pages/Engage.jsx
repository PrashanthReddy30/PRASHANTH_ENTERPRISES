import React, { useState } from 'react';
import { 
  Megaphone, 
  BarChart2, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  Send, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { engageData } from '../data/mockData';

export function Engage() {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState(engageData.announcements);
  const [polls, setPolls] = useState(engageData.polls);
  const [selectedPollOption, setSelectedPollOption] = useState({});
  const [hasVoted, setHasVoted] = useState({});

  const handleLike = (id) => {
    setAnnouncements(announcements.map(a => {
      if (a.id === id) {
        return { ...a, likes: a.likes + 1 };
      }
      return a;
    }));
  };

  const handleVote = (pollId, optionIndex) => {
    if (hasVoted[pollId]) return;
    setHasVoted({ ...hasVoted, [pollId]: true });
    
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        const updatedOptions = [...p.options];
        updatedOptions[optionIndex].votes += 1;
        const newTotal = p.totalVotes + 1;
        updatedOptions.forEach(opt => {
          opt.percentage = Math.round((opt.votes / newTotal) * 100);
        });
        return { ...p, totalVotes: newTotal, options: updatedOptions };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Engage Community & Culture</h1>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                Pulse of PE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Connect with company bulletins, take part in employee sentiment polls, and explore workplace articles.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-slate-200 gap-2 overflow-x-auto">
          {[
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
            { id: 'polls', label: 'Workplace Polls', icon: BarChart2 },
            { id: 'articles', label: 'Articles & Spotlights', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-fade-in max-w-3xl">
          {announcements.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={item.avatar} alt={item.author} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.author}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.time}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{item.content}</p>
              </div>

              {/* Likes & Comments bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                    <span>{item.likes} Likes</span>
                  </button>
                  <button 
                    onClick={() => alert("Open comment drawer...")}
                    className="flex items-center gap-1.5 hover:text-slate-800"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{item.comments} Comments</span>
                  </button>
                </div>

                <button 
                  onClick={() => alert("Post link copied to clipboard.")}
                  className="hover:text-slate-800"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Polls */}
      {activeTab === 'polls' && (
        <div className="space-y-4 animate-fade-in max-w-2xl">
          {polls.map((poll) => {
            const userVoted = hasVoted[poll.id];
            return (
              <div key={poll.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">{poll.question}</h3>
                  <span className="text-xs font-semibold text-brand-600">{poll.totalVotes} Total Votes</span>
                </div>

                <div className="mt-4 space-y-3">
                  {poll.options.map((option, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleVote(poll.id, idx)}
                      className={`relative cursor-pointer overflow-hidden rounded-xl border p-3 transition ${
                        userVoted 
                          ? 'border-slate-200 bg-slate-50' 
                          : 'border-slate-200 hover:border-brand-400 bg-white'
                      }`}
                    >
                      {/* Percentage fill bar */}
                      {userVoted && (
                        <div
                          className="absolute inset-y-0 left-0 bg-brand-100/60 transition-all duration-500 pointer-events-none"
                          style={{ width: `${option.percentage}%` }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{option.text}</span>
                        {userVoted && (
                          <span className="font-bold text-brand-700">{option.percentage}% ({option.votes})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-[11px] text-slate-400 text-right">
                  {userVoted ? '✓ Your vote has been recorded anonymously' : 'Click on any option to submit your vote'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Articles */}
      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {engageData.articles.map((art) => (
            <div key={art.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-brand-300 transition">
              <div className="flex items-center gap-2">
                {art.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {tag}
                  </span>
                ))}
                <span className="text-[11px] text-slate-400 ml-auto">{art.readTime}</span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 hover:text-brand-600 cursor-pointer">
                {art.title}
              </h3>
              <p className="mt-2 text-xs text-slate-500">By {art.author}</p>
              <button 
                onClick={() => alert(`Reading ${art.title}`)}
                className="mt-4 text-xs font-bold text-brand-600 hover:underline"
              >
                Read Full Article →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Engage;
