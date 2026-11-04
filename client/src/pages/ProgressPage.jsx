import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getGuestWeightLogs,
  addGuestWeightLog,
  deleteGuestWeightLog,
  getAllGuestMeals,
  getGuestDailyGoals,
  getGuestProfile,
  saveGuestProfile,
  getTodayDateString,
} from '../services/guestStorage';
import {
  fetchWeightLogs,
  createAuthenticatedWeightLog,
  deleteAuthenticatedWeightLog,
  fetchDailyGoals,
  fetchUserProfile,
  updateUserProfile,
} from '../services/supabaseClient';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Scale,
  Calendar,
  Plus,
  Trash2,
  Droplets,
  Flame,
  Award,
  X,
  Target,
} from 'lucide-react';

export default function ProgressPage() {
  const { user, isGuest, isSupabaseConfigured } = useAuth();
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState(7); // 7, 30, 90 days
  const [weightLogs, setWeightLogs] = useState([]);
  const [meals, setMeals] = useState([]);
  const [goals, setGoals] = useState({ calorie_target: 1850, water_target_ml: 2000 });
  const [profileWeight, setProfileWeight] = useState(null);
  const [loading, setLoading] = useState(true);

  // New weight modal state
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(() => getTodayDateString());
  const [weightNotes, setWeightNotes] = useState('');

  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      if (user && isSupabaseConfigured) {
        const [weights, goalsData, prof] = await Promise.all([
          fetchWeightLogs(user.id),
          fetchDailyGoals(user.id),
          fetchUserProfile(user.id).catch(() => null),
        ]);
        let logs = (weights || []).sort(
          (a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)
        );

        const currentProfileWeight = prof?.current_weight_kg ? Number(prof.current_weight_kg) : null;
        if (currentProfileWeight) {
          setProfileWeight(currentProfileWeight);
        }

        // If no weight logs exist yet, establish initial baseline log from profile
        if (logs.length === 0 && currentProfileWeight) {
          const baseline = await createAuthenticatedWeightLog(
            user.id,
            currentProfileWeight,
            getTodayDateString(),
            'Baseline from profile'
          );
          logs = [baseline];
        }

        setWeightLogs(logs);
        if (goalsData) setGoals(goalsData);
      } else {
        const [guestWeights, guestMeals, guestGoals, guestProf] = await Promise.all([
          getGuestWeightLogs(),
          getAllGuestMeals(),
          getGuestDailyGoals(),
          getGuestProfile().catch(() => null),
        ]);
        let logs = (guestWeights || []).sort(
          (a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)
        );

        const currentProfileWeight = guestProf?.current_weight_kg ? Number(guestProf.current_weight_kg) : null;
        if (currentProfileWeight) {
          setProfileWeight(currentProfileWeight);
        }

        if (logs.length === 0 && currentProfileWeight) {
          const baseline = await addGuestWeightLog(
            currentProfileWeight,
            getTodayDateString(),
            'Baseline from profile'
          );
          logs = [baseline];
        }

        setWeightLogs(logs);
        setMeals(guestMeals || []);
        if (guestGoals) setGoals(guestGoals);
      }
    } catch (err) {
      console.error('Error loading progress data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isSupabaseConfigured]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  // Handle adding new weight log
  const handleAddWeight = async (e) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!val || val <= 0) {
      showToast('Please enter a valid weight in kg.', 'error');
      return;
    }

    try {
      if (user && isSupabaseConfigured) {
        await createAuthenticatedWeightLog(user.id, val, weightDate, weightNotes);
        const existingProf = await fetchUserProfile(user.id);
        const updatedProf = { ...(existingProf || {}), current_weight_kg: val };
        await updateUserProfile(user.id, updatedProf);
        await saveGuestProfile(updatedProf).catch(() => {});
      } else {
        await addGuestWeightLog(val, weightDate, weightNotes);
        const guestProf = await getGuestProfile();
        const updatedProf = { ...(guestProf || {}), current_weight_kg: val };
        await saveGuestProfile(updatedProf);
      }
      setProfileWeight(val);
      showToast('Weight log saved & profile updated!', 'success');
      setShowWeightModal(false);
      setNewWeight('');
      setWeightNotes('');
      await loadProgressData();
    } catch (err) {
      showToast('Failed to save weight', 'error');
    }
  };

  // Handle deleting weight log
  const handleDeleteWeight = async (id) => {
    if (!window.confirm('Delete this weight entry?')) return;
    try {
      if (user && isSupabaseConfigured) {
        await deleteAuthenticatedWeightLog(user.id, id);
      } else {
        await deleteGuestWeightLog(id);
      }
      showToast('Weight entry deleted & profile updated', 'info');
      await loadProgressData();
    } catch (err) {
      showToast('Failed to delete weight', 'error');
    }
  };

  // Prepare chart dataset for Date Range (7, 30, 90 days)
  const chartData = useMemo(() => {
    const list = [];
    const baseDate = new Date();

    for (let i = dateRange - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const str = getTodayDateString(d);
      const displayLabel = d.toLocaleDateString('en-US', {
        month: dateRange > 14 ? 'numeric' : 'short',
        day: 'numeric',
      });

      // Find logged meals on this date
      const daysMeals = meals.filter((m) => m.meal_date === str);
      let dayCals = 0;
      let dayProt = 0;
      let dayCarb = 0;
      let dayFat = 0;

      daysMeals.forEach((m) => {
        dayCals += Number(m.total_calories) || 0;
        dayProt += Number(m.total_protein_g) || 0;
        dayCarb += Number(m.total_carbs_g) || 0;
        dayFat += Number(m.total_fat_g) || 0;
      });

      // Find latest weight log on this date
      const dayWeights = weightLogs.filter((w) => (w.recorded_at || '').startsWith(str));
      const weightEntry = dayWeights.length > 0 ? dayWeights[dayWeights.length - 1] : null;

      list.push({
        date: str,
        label: displayLabel,
        calories: dayCals,
        calorieTarget: goals.calorie_target,
        protein: Math.round(dayProt),
        carbs: Math.round(dayCarb),
        fat: Math.round(dayFat),
        weight: weightEntry ? Number(weightEntry.weight_kg) : null,
      });
    }

    return list;
  }, [dateRange, meals, weightLogs, goals]);

  // Aggregate stats
  const averageCalories = useMemo(() => {
    const daysWithMeals = chartData.filter((d) => d.calories > 0);
    if (!daysWithMeals.length) return 0;
    const total = daysWithMeals.reduce((sum, d) => sum + d.calories, 0);
    return Math.round(total / daysWithMeals.length);
  }, [chartData]);

  const targetConsistency = useMemo(() => {
    const loggedDays = chartData.filter((d) => d.calories > 0);
    if (!loggedDays.length) return 0;
    const withinTarget = loggedDays.filter(
      (d) => Math.abs(d.calories - goals.calorie_target) <= 250
    );
    return Math.round((withinTarget.length / loggedDays.length) * 100);
  }, [chartData, goals]);

  const latestWeight = useMemo(() => {
    if (weightLogs.length > 0) {
      return Number(weightLogs[weightLogs.length - 1].weight_kg);
    }
    return profileWeight ? Number(profileWeight) : 64.5;
  }, [weightLogs, profileWeight]);

  const weightDelta = useMemo(() => {
    if (weightLogs.length >= 2) {
      const first = Number(weightLogs[0].weight_kg);
      const last = Number(weightLogs[weightLogs.length - 1].weight_kg);
      return Math.round((last - first) * 10) / 10;
    }
    return null;
  }, [weightLogs]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-16">
      {/* Title & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101E19]">Progress & Analytics</h1>
          <p className="text-xs sm:text-sm text-[#6C7A72] font-medium mt-0.5">
            Evaluate weight trends, calorie consistency, and macro distribution
          </p>
        </div>

        {/* 7d / 30d / 90d pills */}
        <div className="flex items-center bg-white p-1 rounded-full border border-[#D5E7DD] shadow-xs self-start sm:self-auto">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                dateRange === days
                  ? 'bg-[#101E19] text-white shadow-xs'
                  : 'text-[#6C7A72] hover:text-[#101E19]'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#D5E7DD] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6C7A72] font-semibold">Average Intake</span>
            <p className="text-2xl font-black text-[#101E19] mt-0.5">
              {averageCalories > 0 ? `${averageCalories} Cal` : '—'}
            </p>
            <span className="text-[11px] text-[#006C4D] font-bold">
              Target: {goals.calorie_target} Cal
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E6F8EE] flex items-center justify-center text-[#006C4D]">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#D5E7DD] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6C7A72] font-semibold">Goal Consistency</span>
            <p className="text-2xl font-black text-[#006C4D] mt-0.5">
              {targetConsistency}%
            </p>
            <span className="text-[11px] text-[#6C7A72] font-medium">Within ±250 Cal range</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E0F2E8] flex items-center justify-center text-[#006C4D]">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#D5E7DD] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6C7A72] font-semibold">Latest Weight</span>
            <p className="text-2xl font-black text-[#101E19] mt-0.5">
              {latestWeight ? `${latestWeight} kg` : '—'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setShowWeightModal(true)}
                className="text-[11px] text-[#225EAA] font-bold hover:underline"
              >
                + Log New Weight
              </button>
              {weightDelta !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  weightDelta > 0 ? 'bg-[#FFF3E0] text-[#E65100]' : weightDelta < 0 ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}>
                  {weightDelta > 0 ? `+${weightDelta} kg` : weightDelta < 0 ? `${weightDelta} kg` : '0 kg'}
                </span>
              )}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#D6E3FF] flex items-center justify-center text-[#225EAA]">
            <Scale className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart 1: Daily Calorie Intake vs Target Line */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#101E19]">Daily Calorie Intake</h3>
            <p className="text-xs text-[#6C7A72]">Logged calories compared against your daily ceiling</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#006C4D]">
              <span className="w-3 h-3 rounded-full bg-[#34C795]" /> Consumed
            </span>
            <span className="flex items-center gap-1.5 text-[#EA580C]">
              <span className="w-3 h-1 bg-[#EA580C]" /> Target
            </span>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34C795" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34C795" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE7" vertical={false} />
              <XAxis dataKey="label" stroke="#6C7A72" fontSize={11} tickLine={false} />
              <YAxis stroke="#6C7A72" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101E19',
                  borderRadius: '16px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="calorieTarget"
                stroke="#EA580C"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#006C4D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#calGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Macronutrient Breakdown Trend */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#101E19]">Daily Macronutrient Split (g)</h3>
            <p className="text-xs text-[#6C7A72]">Balance across Protein, Carbs, and Healthy Fats</p>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="flex items-center gap-1 text-[#006C4D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34C795]" /> Protein
            </span>
            <span className="flex items-center gap-1 text-[#225EAA]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#79ACFD]" /> Carbs
            </span>
            <span className="flex items-center gap-1 text-[#754F8A]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CDA1E2]" /> Fat
            </span>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE7" vertical={false} />
              <XAxis dataKey="label" stroke="#6C7A72" fontSize={11} tickLine={false} />
              <YAxis stroke="#6C7A72" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101E19',
                  borderRadius: '16px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="protein" fill="#34C795" radius={[4, 4, 0, 0]} />
              <Bar dataKey="carbs" fill="#79ACFD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fat" fill="#CDA1E2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Body Weight Progression Trend */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#101E19]">Body Weight Progression</h3>
            <p className="text-xs text-[#6C7A72]">
              Track weight composition changes over your selected {dateRange} days
            </p>
          </div>
          <button
            onClick={() => setShowWeightModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#E0F2E8] text-[#006C4D] text-xs font-bold hover:bg-[#D0EADB] transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Log Weight
          </button>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE7" vertical={false} />
              <XAxis dataKey="label" stroke="#6C7A72" fontSize={11} tickLine={false} />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="#6C7A72"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101E19',
                  borderRadius: '16px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
                formatter={(value) => (value !== null && value !== undefined ? [`${value} kg`, 'Weight'] : ['—', 'Weight'])}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#225EAA"
                strokeWidth={3}
                connectNulls={true}
                dot={{ r: 4, fill: '#225EAA', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#006C4D' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight History Table & Add Action */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#101E19]">Body Weight Logs</h3>
            <p className="text-xs text-[#6C7A72]">Track body composition milestones</p>
          </div>
          <button
            onClick={() => setShowWeightModal(true)}
            className="px-4 py-2 rounded-full bg-[#006C4D] text-white text-xs font-bold hover:bg-[#004E37] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Log Weight
          </button>
        </div>

        <div className="divide-y divide-[#E0F2E8]">
          {weightLogs.length === 0 ? (
            <p className="text-xs text-[#6C7A72] py-4 text-center italic">
              No weight records yet. Tap Log Weight to establish your baseline!
            </p>
          ) : (
            weightLogs.map((w) => (
              <div key={w.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-extrabold text-[#101E19]">{w.weight_kg} kg</span>
                  {w.notes && <span className="text-[#6C7A72] ml-2 italic">({w.notes})</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#6C7A72]">{w.recorded_at}</span>
                  <button
                    onClick={() => handleDeleteWeight(w.id)}
                    className="text-[#6C7A72] hover:text-[#BA1A1A] p-1 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#D5E7DD] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#101E19]">Log Body Weight</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="w-7 h-7 rounded-full bg-[#E0F2E8] flex items-center justify-center text-[#6C7A72]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWeight} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72] mb-1 block">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="e.g. 64.5"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-sm font-bold text-[#101E19] focus:outline-none focus:border-[#006C4D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72] mb-1 block">
                  Date
                </label>
                <input
                  type="date"
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-sm text-[#101E19] focus:outline-none focus:border-[#006C4D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72] mb-1 block">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  placeholder="Morning weigh-in after workout"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-sm text-[#101E19] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-full bg-[#006C4D] text-white font-bold text-sm hover:bg-[#004E37] transition-all shadow-md"
              >
                Save Weight Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

