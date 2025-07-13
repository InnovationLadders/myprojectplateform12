import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award,
  Calendar,
  Download,
  Filter,
  Eye,
  PieChart,
  LineChart,
  Activity,
  School
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, LineChart as RechartsLineChart, Line, Area, AreaChart } from 'recharts';
import { SchoolProjectsQuery } from '../components/SchoolProjectsQuery';

const reportTypes = [
  { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
  { id: 'projects', name: 'تقارير المشاريع', icon: BookOpen },
  { id: 'users', name: 'تقارير المستخدمين', icon: Users },
  { id: 'performance', name: 'تقارير الأداء', icon: TrendingUp },
  { id: 'school-query', name: 'استعلام المدارس', icon: School },
];

const timeRanges = [
  { id: 'week', name: 'الأسبوع الماضي' },
  { id: 'month', name: 'الشهر الماضي' },
  { id: 'quarter', name: 'الربع الماضي' },
  { id: 'year', name: 'السنة الماضية' },
];

// Mock data for charts
const projectsData = [
  { name: 'يناير', مكتملة: 12, نشطة: 8, مسودة: 3 },
  { name: 'فبراير', مكتملة: 15, نشطة: 12, مسودة: 5 },
  { name: 'مارس', مكتملة: 18, نشطة: 15, مسودة: 4 },
  { name: 'أبريل', مكتملة: 22, نشطة: 18, مسودة: 6 },
  { name: 'مايو', مكتملة: 25, نشطة: 20, مسودة: 7 },
  { name: 'يونيو', مكتملة: 28, نشطة: 22, مسودة: 5 },
];

const categoriesData = [
  { name: 'العلوم والتقنية', value: 45, color: '#3B82F6' },
  { name: 'ريادة الأعمال', value: 25, color: '#10B981' },
  { name: 'التطوع', value: 20, color: '#F59E0B' },
  { name: 'الأخلاق', value: 10, color: '#EF4444' },
];

const usersGrowthData = [
  { name: 'يناير', طلاب: 120, معلمين: 15, مدارس: 3 },
  { name: 'فبراير', طلاب: 145, معلمين: 18, مدارس: 4 },
  { name: 'مارس', طلاب: 180, معلمين: 22, مدارس: 5 },
  { name: 'أبريل', طلاب: 220, معلمين: 28, مدارس: 6 },
  { name: 'مايو', طلاب: 265, معلمين: 32, مدارس: 7 },
  { name: 'يونيو', طلاب: 310, معلمين: 38, مدارس: 8 },
];

const performanceData = [
  { name: 'الأسبوع 1', معدل_الإنجاز: 85, رضا_المستخدمين: 92, نشاط_المنصة: 78 },
  { name: 'الأسبوع 2', معدل_الإنجاز: 88, رضا_المستخدمين: 94, نشاط_المنصة: 82 },
  { name: 'الأسبوع 3', معدل_الإنجاز: 92, رضا_المستخدمين: 96, نشاط_المنصة: 85 },
  { name: 'الأسبوع 4', معدل_الإنجاز: 89, رضا_المستخدمين: 93, نشاط_المنصة: 88 },
];

const keyMetrics = [
  {
    title: 'إجمالي المشاريع',
    value: '156',
    change: '+12%',
    trend: 'up',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'المستخدمون النشطون',
    value: '2,847',
    change: '+8%',
    trend: 'up',
    icon: Users,
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'معدل الإنجاز',
    value: '89%',
    change: '+5%',
    trend: 'up',
    icon: Award,
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'متوسط التقييم',
    value: '4.8',
    change: '+0.2',
    trend: 'up',
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600'
  },
];

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('school-query');
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [schoolEmail, setSchoolEmail] = useState('muo4sa@gmail.com');

  useEffect(() => {
    // Set the default report to school-query when the component mounts
    setSelectedReport('school-query');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
              <p className="opacity-90">تحليل شامل لأداء المنصة والمشاريع</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedReport !== 'school-query' && (
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-xl border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                {timeRanges.map(range => (
                  <option key={range.id} value={range.id} className="text-gray-800">
                    {range.name}
                  </option>
                ))}
              </select>
            )}
            <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2">
              <Download className="w-5 h-5" />
              تصدير
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm opacity-80">مشروع نشط</div>
          </div>
          <div>
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-sm opacity-80">مستخدم</div>
          </div>
          <div>
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm opacity-80">معدل النجاح</div>
          </div>
          <div>
            <div className="text-2xl font-bold">4.8</div>
            <div className="text-sm opacity-80">متوسط التقييم</div>
          </div>
        </div>
      </motion.div>

      {/* Report Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedReport === type.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.name}
              </button>
            ))}
          </nav>
        </div>

        {/* School Query Report */}
        {selectedReport === 'school-query' && (
          <div className="space-y-6">
            <SchoolProjectsQuery defaultEmail={schoolEmail} />
          </div>
        )}

        {/* Overview Report */}
        {selectedReport === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {keyMetrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      {metric.change}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</h3>
                  <p className="text-gray-600 text-sm">{metric.title}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Projects Chart */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">تطور المشاريع</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="مكتملة" fill="#10B981" />
                    <Bar dataKey="نشطة" fill="#3B82F6" />
                    <Bar dataKey="مسودة" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Categories Pie Chart */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">توزيع المشاريع حسب الفئة</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoriesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Projects Report */}
        {selectedReport === 'projects' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">إحصائيات المشاريع الشهرية</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={projectsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="مكتملة" stackId="1" stroke="#10B981" fill="#10B981" />
                  <Area type="monotone" dataKey="نشطة" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="مسودة" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">89</h3>
                <p className="text-gray-600">مشاريع مكتملة</p>
                <p className="text-green-600 text-sm mt-1">+15% من الشهر الماضي</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">67</h3>
                <p className="text-gray-600">مشاريع نشطة</p>
                <p className="text-blue-600 text-sm mt-1">+8% من الشهر الماضي</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">23</h3>
                <p className="text-gray-600">مشاريع في المسودة</p>
                <p className="text-yellow-600 text-sm mt-1">-5% من الشهر الماضي</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Report */}
        {selectedReport === 'users' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">نمو المستخدمين</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={usersGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="طلاب" stroke="#3B82F6" strokeWidth={3} />
                  <Line type="monotone" dataKey="معلمين" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="مدارس" stroke="#F59E0B" strokeWidth={3} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">2,456</h3>
                <p className="text-gray-600">إجمالي الطلاب</p>
                <p className="text-blue-600 text-sm mt-1">+18% من الشهر الماضي</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">312</h3>
                <p className="text-gray-600">إجمالي المعلمين</p>
                <p className="text-green-600 text-sm mt-1">+12% من الشهر الماضي</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">79</h3>
                <p className="text-gray-600">إجمالي المدارس</p>
                <p className="text-yellow-600 text-sm mt-1">+25% من الشهر الماضي</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Report */}
        {selectedReport === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">مؤشرات الأداء الأسبوعية</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="معدل_الإنجاز" stroke="#3B82F6" strokeWidth={3} />
                  <Line type="monotone" dataKey="رضا_المستخدمين" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="نشاط_المنصة" stroke="#F59E0B" strokeWidth={3} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">89%</h3>
                <p className="text-gray-600">معدل الإنجاز</p>
                <p className="text-blue-600 text-sm mt-1">+3% من الأسبوع الماضي</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">94%</h3>
                <p className="text-gray-600">رضا المستخدمين</p>
                <p className="text-green-600 text-sm mt-1">+1% من الأسبوع الماضي</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">85%</h3>
                <p className="text-gray-600">نشاط المنصة</p>
                <p className="text-yellow-600 text-sm mt-1">+7% من الأسبوع الماضي</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Export Options */}
      {selectedReport !== 'school-query' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">خيارات التصدير</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-blue-600" />
              <div className="text-right">
                <p className="font-medium text-gray-800">تصدير PDF</p>
                <p className="text-sm text-gray-600">تقرير شامل</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-green-600" />
              <div className="text-right">
                <p className="font-medium text-gray-800">تصدير Excel</p>
                <p className="text-sm text-gray-600">بيانات خام</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Eye className="w-5 h-5 text-purple-600" />
              <div className="text-right">
                <p className="font-medium text-gray-800">عرض مفصل</p>
                <p className="text-sm text-gray-600">تحليل متقدم</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div className="text-right">
                <p className="font-medium text-gray-800">تقرير مجدول</p>
                <p className="text-sm text-gray-600">إرسال دوري</p>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};