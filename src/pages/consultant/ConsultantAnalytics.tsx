import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  Download 
} from 'lucide-react';
import { useConsultations } from '../../hooks/useConsultations';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const ConsultantAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { consultations, loading, error } = useConsultations();
  const [timeRange, setTimeRange] = useState('month');

  // Filter consultations for this consultant
  const myConsultations = consultations.filter(c => c.consultant_id === user?.id);
  
  // Calculate stats
  const completedConsultations = myConsultations.filter(c => c.status === 'completed');
  const totalEarnings = completedConsultations.reduce((total, c) => 
    total + (c.duration / 60) * (user?.hourlyRate || 150), 0
  );
  const averageRating = completedConsultations.length > 0 
    ? completedConsultations.reduce((sum, c) => sum + (c.rating || 0), 0) / completedConsultations.length 
    : 0;
  
  // Mock data for charts
  const monthlyConsultationsData = [
    { name: 'يناير', عدد_الاستشارات: 5 },
    { name: 'فبراير', عدد_الاستشارات: 8 },
    { name: 'مارس', عدد_الاستشارات: 12 },
    { name: 'أبريل', عدد_الاستشارات: 10 },
    { name: 'مايو', عدد_الاستشارات: 15 },
    { name: 'يونيو', عدد_الاستشارات: 20 },
  ];

  const earningsData = [
    { name: 'يناير', الإيرادات: 750 },
    { name: 'فبراير', الإيرادات: 1200 },
    { name: 'مارس', الإيرادات: 1800 },
    { name: 'أبريل', الإيرادات: 1500 },
    { name: 'مايو', الإيرادات: 2250 },
    { name: 'يونيو', الإيرادات: 3000 },
  ];

  const consultationTypesData = [
    { name: 'تقنية', value: 40, color: '#10B981' },
    { name: 'أكاديمية', value: 30, color: '#3B82F6' },
    { name: 'مهنية', value: 20, color: '#F59E0B' },
    { name: 'مشاريع', value: 10, color: '#8B5CF6' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">حدث خطأ</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">الإحصائيات</h1>
              <p className="opacity-90">تحليل أداء الاستشارات والإيرادات</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-xl border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <option value="week" className="text-gray-800">الأسبوع الماضي</option>
              <option value="month" className="text-gray-800">الشهر الماضي</option>
              <option value="quarter" className="text-gray-800">الربع الماضي</option>
              <option value="year" className="text-gray-800">السنة الماضية</option>
            </select>
            <button className="bg-white text-emerald-600 px-6 py-2 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2">
              <Download className="w-5 h-5" />
              تصدير
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{myConsultations.length}</div>
            <div className="text-sm opacity-80">إجمالي الاستشارات</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{completedConsultations.length}</div>
            <div className="text-sm opacity-80">استشارات مكتملة</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="text-sm opacity-80">متوسط التقييم</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalEarnings.toFixed(0)} ر.س</div>
            <div className="text-sm opacity-80">إجمالي الإيرادات</div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{myConsultations.length}</h3>
          <p className="text-gray-600 text-sm">إجمالي الاستشارات</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>+5%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{averageRating.toFixed(1)}</h3>
          <p className="text-gray-600 text-sm">متوسط التقييم</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>+8%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {completedConsultations.reduce((total, c) => total + c.duration, 0)} دقيقة
          </h3>
          <p className="text-gray-600 text-sm">إجمالي وقت الاستشارات</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span>+15%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{totalEarnings.toFixed(0)} ر.س</h3>
          <p className="text-gray-600 text-sm">إجمالي الإيرادات</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">عدد الاستشارات الشهرية</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyConsultationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="عدد_الاستشارات" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">الإيرادات الشهرية</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="الإيرادات" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* More Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">توزيع أنواع الاستشارات</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={consultationTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {consultationTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">أوقات الاستشارات الأكثر طلباً</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { time: '9-10 ص', count: 5 },
                  { time: '10-11 ص', count: 8 },
                  { time: '11-12 ظ', count: 12 },
                  { time: '12-1 ظ', count: 10 },
                  { time: '1-2 م', count: 7 },
                  { time: '2-3 م', count: 9 },
                  { time: '3-4 م', count: 15 },
                  { time: '4-5 م', count: 18 },
                  { time: '5-6 م', count: 14 },
                  { time: '6-7 م', count: 10 },
                  { time: '7-8 م', count: 6 },
                  { time: '8-9 م', count: 3 },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="time" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Import missing components
import { AlertCircle } from 'lucide-react';