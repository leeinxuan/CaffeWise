import React, { useState } from 'react';
import { 
  Search, Bookmark, Clock, ChevronRight, 
  ThumbsUp, AlertCircle, HeartPulse, Brain, 
  Zap, CheckCircle, XCircle 
} from 'lucide-react';

const WikiView: React.FC = () => {
  const [mythAnswered, setMythAnswered] = useState<'correct' | 'wrong' | null>(null);

  const handleMythAnswer = (answer: boolean) => {
    // Question: Does dark roast have more caffeine? Answer: No (False)
    const correctAnswer = false;
    setMythAnswered(answer === correctAnswer ? 'correct' : 'wrong');
  };

  const today = new Date();
  const dateString = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <div className="pb-24 space-y-6 animate-fade-in">
      {/* Header & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="搜尋：頭痛、心悸、好處..." 
            className="w-full bg-white border border-stone-200 rounded-full py-3 pl-10 pr-4 text-sm text-stone-700 focus:outline-none focus:border-[#8D6E63] shadow-sm"
          />
        </div>
        <button className="bg-white p-3 rounded-full border border-stone-200 text-stone-500 shadow-sm hover:text-[#6F4E37] transition">
          <Bookmark size={20} />
        </button>
      </div>

      {/* Daily Brew Card */}
      <div>
        <div className="flex justify-between items-end px-1 mb-2">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Daily Brew • 每日一萃</h3>
            <span className="text-xs text-stone-400">{dateString}</span>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-200 relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:scale-110 transition duration-700">
               <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h1a4 4 0 0 1 0 8h-1v2H2v-2h1V8H2V6h14.5c.83 0 1.5.67 1.5 1.5v.5zM4 8v10h12V8H4zm14 2v6h1a2 2 0 0 0 0-4h-1z"/></svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium border border-white/30">#生理時鐘</span>
                    <span className="flex items-center gap-1 text-[10px] opacity-80"><Clock size={10} /> 1 min read</span>
                </div>
                <h2 className="text-xl font-bold mb-3 leading-tight">早晨的第一杯，請等等！</h2>
                <p className="text-sm text-orange-50 opacity-90 leading-relaxed mb-4">
                    起床後體內的皮質醇 (Cortisol) 正處於高峰，這時喝咖啡效果最差且容易焦慮。科學建議：起床後 90 分鐘再喝第一杯。
                </p>
                <button className="flex items-center gap-1 text-xs font-bold hover:underline opacity-90 hover:opacity-100">
                    閱讀完整內容 <ChevronRight size={14} />
                </button>
            </div>
        </div>
      </div>

      {/* Knowledge Capsules (Categories) */}
      <div className="grid grid-cols-4 gap-3">
          <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-stone-100 shadow-sm active:scale-95 transition">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ThumbsUp size={20} />
              </div>
              <span className="text-[10px] font-medium text-stone-600">益處</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-stone-100 shadow-sm active:scale-95 transition">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertCircle size={20} />
              </div>
              <span className="text-[10px] font-medium text-stone-600">壞處/副作用</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-stone-100 shadow-sm active:scale-95 transition">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <HeartPulse size={20} />
              </div>
              <span className="text-[10px] font-medium text-stone-600">急救緩解</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-stone-100 shadow-sm active:scale-95 transition">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Brain size={20} />
              </div>
              <span className="text-[10px] font-medium text-stone-600">專注力</span>
          </button>
      </div>

      {/* Myth Buster */}
      <div className="bg-[#292524] rounded-3xl p-6 text-stone-200 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-amber-400 font-bold text-sm flex items-center gap-2">
                  <Zap size={16} /> 謠言粉碎機
              </h3>
              <span className="text-[10px] text-stone-500">True or False?</span>
          </div>

          <div className="relative z-10">
              <h4 className="text-lg font-bold text-white mb-6 text-center">
                  深焙咖啡的咖啡因比淺焙更高？
              </h4>

              {mythAnswered === null ? (
                  <div className="flex gap-4">
                      <button 
                        onClick={() => handleMythAnswer(true)}
                        className="flex-1 py-3 rounded-xl border border-stone-600 hover:bg-stone-700 transition font-bold text-stone-300"
                      >
                          O 是的
                      </button>
                      <button 
                        onClick={() => handleMythAnswer(false)}
                        className="flex-1 py-3 rounded-xl border border-stone-600 hover:bg-stone-700 transition font-bold text-stone-300"
                      >
                          X 錯！
                      </button>
                  </div>
              ) : (
                  <div className={`p-4 rounded-xl text-center border ${mythAnswered === 'correct' ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
                      {mythAnswered === 'correct' ? (
                          <>
                            <div className="flex items-center justify-center gap-2 font-bold mb-1"><CheckCircle size={18}/> 答對了！</div>
                            <p className="text-xs text-stone-300">淺焙咖啡豆保留了更多原始物質，依體積計算，淺焙的咖啡因其實略高或差不多！</p>
                          </>
                      ) : (
                          <>
                             <div className="flex items-center justify-center gap-2 font-bold mb-1"><XCircle size={18}/> 答錯囉！</div>
                             <p className="text-xs text-stone-300">別被焦苦味騙了！深焙過程會使部分咖啡因昇華，實際含量通常較低。</p>
                          </>
                      )}
                      <button onClick={() => setMythAnswered(null)} className="mt-3 text-[10px] underline opacity-70">重玩一次</button>
                  </div>
              )}
          </div>
      </div>

      {/* Global News Feed */}
      <div>
         <div className="flex justify-between items-center px-1 mb-3">
            <h3 className="text-lg font-bold text-[#6F4E37]">全球快訊</h3>
            <button className="text-xs text-stone-400">查看更多</button>
        </div>
        
        <div className="space-y-3">
            {[
                { 
                  title: "適量咖啡因可能有助於降低肝臟疾病風險", 
                  source: "HealthLine", 
                  time: "2小時前", 
                  color: "bg-emerald-100 text-emerald-600",
                  icon: <HeartPulse size={20} />
                },
                { 
                  title: "燕麥奶拿鐵的咖啡因吸收率比牛奶慢？", 
                  source: "CoffeeScience", 
                  time: "5小時前", 
                  color: "bg-amber-100 text-amber-600",
                  icon: <Clock size={20} />
                },
                { 
                  title: "為什麼你的「下午茶」會毀了你的「深眠」？", 
                  source: "Sleep Foundation", 
                  time: "昨天", 
                  color: "bg-indigo-100 text-indigo-600",
                  icon: <Brain size={20} />
                }
            ].map((news, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex gap-4 hover:shadow-md transition cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${news.color}`}>
                        {news.icon}
                    </div>
                    <div className="flex flex-col justify-between py-0.5">
                        <h4 className="text-sm font-bold text-stone-700 leading-snug line-clamp-2">{news.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-stone-400">{news.source}</span>
                            <span className="text-[10px] text-stone-300">•</span>
                            <span className="text-[10px] text-stone-400">{news.time}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WikiView;