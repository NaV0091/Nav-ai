import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { getAICoachInsight } from '../services/apiClient';

export default function AICoachModal({ onClose, currentMeals, dailyGoals, nutrition }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(() => {
    // Generate initial intelligent greeting based on real data
    const proteinDiff = dailyGoals.protein_target_g - nutrition.protein;
    const remainingCals = Math.max(0, dailyGoals.calorie_target - nutrition.calories);

    let initialTip = `You've recorded ${nutrition.calories} Cal so far with ${remainingCals} Cal left for today.`;
    if (proteinDiff > 25) {
      initialTip += ` You need about ${Math.round(proteinDiff)}g more protein to hit your ${dailyGoals.protein_target_g}g target. Consider grilled chicken, Greek yogurt, or paneer!`;
    } else {
      initialTip += ` Your protein intake is right on track (${nutrition.protein}g / ${dailyGoals.protein_target_g}g).`;
    }

    return [
      {
        sender: 'ai',
        text: `Hello! I'm your Nav AI Nutrition Coach. ${initialTip} What would you like to optimize today?`,
      },
    ];
  });

  const quickPrompts = [
    'What does this app do?',
    'Recommend high-protein Indian food',
    'How do I reach my protein goal today?',
    'What healthy dinner fits my calories?',
  ];

  const handleSend = async (userText) => {
    const textToSend = userText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user', text: textToSend };
    setConversation((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await getAICoachInsight({
        question: textToSend,
        meals: currentMeals,
        goals: dailyGoals,
        nutrition,
      });

      setConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.insight || response.message || 'Keep nourishing your body with balanced whole foods!',
        },
      ]);
    } catch (err) {
      const q = textToSend.toLowerCase();
      let fallback = '';
      if (['hello', 'hi', 'hey', 'namaste'].some((g) => q === g || q.startsWith(g + ' '))) {
        fallback = `Hello! 👋 I'm your Nav AI Nutrition Coach. How can I help you today? You can ask me what this app does, check your daily macros, get healthy Indian food ideas, or ask for diet and fitness advice!`;
      } else if (
        q.includes('what app this do') ||
        q.includes('what does this app do') ||
        q.includes('what is this app') ||
        q.includes('how to use') ||
        q.includes('about')
      ) {
        fallback = `✨ **Welcome to Nav AI!** Here is what you can do:\n\n• **📸 AI Food Vision**: Snap or upload a photo of any meal (breakfast, lunch, dinner) to detect foods, portion weights, and estimate calories & macros.\n• **📖 Food Diary**: Log meals manually or search our extensive Indian & global food database.\n• **❤️ Heart Health**: Real-time tracking of Saturated Fat (<20g), Sodium (<2300mg), and Cholesterol (<300mg) based on what you eat.\n• **🥗 Smart Recipes**: Scalable healthy recipes with portion controls.\n• **📊 Fitness & Weight**: Track weight trends, water intake, and daily burn goals.\n• **🔒 100% Offline & Cloud Sync**: Works in Guest Mode without login, and syncs across devices when signed in!`;
      } else if (q.includes('protein')) {
        const gap = Math.max(0, dailyGoals.protein_target_g - nutrition.protein);
        fallback = `Based on your recorded logs, you have a ${gap}g protein deficit. Try a 150g portion of grilled chicken (46g protein), 150g Greek yogurt (15g protein), 100g fresh paneer (18g protein), or 2 boiled eggs (12g protein).`;
      } else if (q.includes('dinner') || q.includes('lunch') || q.includes('meal') || q.includes('eat')) {
        const cals = Math.max(0, dailyGoals.calorie_target - nutrition.calories);
        fallback = `You have ${cals} Cal remaining. Great options include Dal Tadka with 2 Phulkas (340 Cal), Paneer Bhurji with Salad (310 Cal), or Herb Grilled Chicken (280 Cal). Check out the Recipes tab!`;
      } else {
        fallback = `Today's check-in: ${nutrition.calories} Cal consumed, ${nutrition.protein}g Protein, ${nutrition.carbs}g Carbs, and ${nutrition.fat}g Fat against your ${dailyGoals.calorie_target} Cal target. Ask me anything about foods, recipes, or health tips!`;
      }

      setConversation((prev) => [...prev, { sender: 'ai', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D5E7DD] flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E0F2E8] flex items-center justify-between bg-[#ECFEF4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#006C4D] to-[#34C795] flex items-center justify-center text-white shadow-md shadow-[#34C795]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#101E19] text-base">Nav AI Nutrition Coach</h3>
              <p className="text-xs text-[#006C4D] font-semibold">Active data-driven coaching</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6C7A72] hover:text-[#101E19]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5 bg-[#F8FCF9]">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 max-w-[88%] ${
                msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-[#101E19] text-white' : 'bg-[#006C4D] text-[#72FBC5]'
                }`}
              >
                {msg.sender === 'user' ? (
                  <span className="text-[11px] font-bold">You</span>
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#101E19] text-white rounded-tr-none'
                    : 'bg-white text-[#101E19] border border-[#D5E7DD] rounded-tl-none shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="self-start flex items-center gap-2 text-xs text-[#6C7A72] bg-white p-3 rounded-2xl border border-[#D5E7DD]">
              <Sparkles className="w-3.5 h-3.5 text-[#006C4D] animate-spin" />
              <span>Analyzing your food diary...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-white border-t border-[#E0F2E8] flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="text-[11px] font-semibold text-[#006C4D] bg-[#E6F8EE] px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#D5E7DD] transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E0F2E8] flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about today's calories, macros, or meals..."
            className="flex-1 px-4 py-2.5 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] text-xs sm:text-sm text-[#101E19] placeholder:text-[#6C7A72] focus:outline-none focus:border-[#006C4D]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!prompt.trim() || loading}
            className="w-10 h-10 rounded-full bg-[#006C4D] text-white flex items-center justify-center hover:bg-[#004E37] disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-[#F8FCF9] text-center border-t border-[#E0F2E8]">
          <p className="text-[10px] text-[#6C7A72]">
            For nutritional information and wellness awareness only. Not medical or clinical dietary advice.
          </p>
        </div>
      </div>
    </div>
  );
}

