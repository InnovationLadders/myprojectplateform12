import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageCircle,
  User,
  Video,
  Phone,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConsultations } from '../../hooks/useConsultations';
import { formatDate } from '../../utils/dateUtils';

export const MyRequests: React.FC = () => {
  const { consultations, loading, error } = useConsultations();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter consultations
  const filteredConsultations = consultations.filter(consultation => {
    const matchesStatus = selectedStatus === 'all' || consultation.status === selectedStatus;
    const matchesSearch = consultation.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'scheduled': return 'مجدولة';
      case 'completed': return 'مكتملة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'video': return 'مكالمة فيديو';
      case 'phone': return 'مكالمة صوتية';
      case 'chat': return 'محادثة نصية';
      default: return method;
    }
  };

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
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">طلباتي</h1>
              <p className="opacity-90">إدارة طلبات الاستشارة الخاصة بك</p>
            </div>
          </div>
          
          <Link
            to="/create-request"
            className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            طلب جديد
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{consultations.length}</div>
            <div className="text-sm opacity-80">إجمالي الطلبات</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{consultations.filter(c => c.status === 'pending').length}</div>
            <div className="text-sm opacity-80">في الانتظار</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{consultations.filter(c => c.status === 'scheduled').length}</div>
            <div className="text-sm opacity-80">مجدولة</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{consultations.filter(c => c.status === 'completed').length}</div>
            <div className="text-sm opacity-80">مكتملة</div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="scheduled">مجدولة</option>
            <option value="completed">مكتملة</option>
            <option value="cancelled">ملغية</option>
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          عرض {filteredConsultations.length} من أصل {consultations.length} طلب
        </p>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.map((consultation, index) => (
          <motion.div
            key={consultation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <img
                  src={consultation.consultant?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"}
                  alt={consultation.consultant?.name || "مستشار"}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{consultation.topic}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                      {getStatusText(consultation.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{consultation.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>المستشار: {consultation.consultant?.name || "غير محدد"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {getMethodIcon(consultation.method)}
                      {getMethodText(consultation.method)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {consultation.duration} دقيقة
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative group/menu">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                
                <div className="absolute left-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
                  <div className="p-2">
                    <button className="flex items-center gap-2 w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                      <Eye className="w-4 h-4" />
                      عرض التفاصيل
                    </button>
                    {consultation.status === 'pending' && (
                      <button className="flex items-center gap-2 w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Edit className="w-4 h-4" />
                        تعديل الطلب
                      </button>
                    )}
                    {consultation.status !== 'completed' && consultation.status !== 'cancelled' && (
                      <button className="flex items-center gap-2 w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                        <XCircle className="w-4 h-4" />
                        إلغاء الطلب
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                تاريخ الإنشاء: {formatDate(consultation.createdAt)}
              </div>
              <div className="flex gap-2">
                {consultation.status === 'scheduled' && consultation.scheduledDate && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-800">موعد الاستشارة:</span>{' '}
                    <span className="text-emerald-600">{formatDate(consultation.scheduledDate, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      calendar: 'gregory'
                    })}</span>
                  </div>
                )}
                {consultation.status === 'scheduled' && (
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    انضمام للاستشارة
                  </button>
                )}
                {consultation.status === 'completed' && !consultation.rating && (
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                    تقييم الاستشارة
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredConsultations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على طلبات استشارة تطابق معايير البحث</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/create-request"
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              طلب جديد
            </Link>
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSearchTerm('');
              }}
              className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};