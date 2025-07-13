import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  FolderOpen,
  Info,
  Save
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useConsultations } from '../../hooks/useConsultations';
import { useProjects } from '../../hooks/useProjects';

const consultationTypes = [
  { id: 'technical', name: 'استشارة تقنية', description: 'استشارة في مجال التقنية والبرمجة' },
  { id: 'academic', name: 'استشارة أكاديمية', description: 'استشارة في المجالات الأكاديمية والتعليمية' },
  { id: 'career', name: 'استشارة مهنية', description: 'استشارة في التطوير المهني والوظيفي' },
  { id: 'project', name: 'استشارة مشروع', description: 'استشارة متعلقة بمشروع محدد' },
];

const consultationMethods = [
  { id: 'video', name: 'مكالمة فيديو', icon: Video },
  { id: 'phone', name: 'مكالمة صوتية', icon: Phone },
  { id: 'chat', name: 'محادثة نصية', icon: MessageSquare },
];

const consultationDurations = [
  { value: 30, label: '30 دقيقة' },
  { value: 60, label: 'ساعة واحدة' },
  { value: 90, label: 'ساعة ونصف' },
  { value: 120, label: 'ساعتان' },
];

export const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const { createConsultation } = useConsultations();
  const { projects } = useProjects();
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    type: 'technical',
    method: 'video',
    duration: 60,
    project_id: '',
    preferredDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic || !formData.description) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createConsultation({
        ...formData,
        status: 'pending'
      });
      navigate('/my-requests');
    } catch (err) {
      console.error('Error submitting consultation request:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في إرسال طلب الاستشارة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get active projects for the current user
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/my-requests"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">طلب استشارة جديدة</h1>
            <p className="text-gray-600">قم بإنشاء طلب استشارة جديد للحصول على المساعدة من الخبراء</p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الاستشارة *
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="أدخل عنوان الاستشارة"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الاستشارة *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="اشرح تفاصيل الاستشارة واحتياجاتك بوضوح"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الاستشارة *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {consultationTypes.map((type) => (
                <label key={type.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  formData.type === type.id ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value={type.id}
                    checked={formData.type === type.id}
                    onChange={() => handleInputChange('type', type.id)}
                    className="sr-only"
                  />
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الاستشارة *
              </label>
              <div className="space-y-2">
                {consultationMethods.map((method) => (
                  <label key={method.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    formData.method === method.id ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="method"
                      value={method.id}
                      checked={formData.method === method.id}
                      onChange={() => handleInputChange('method', method.id)}
                      className="sr-only"
                    />
                    <method.icon className="w-5 h-5" />
                    <span>{method.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مدة الاستشارة *
              </label>
              <div className="space-y-2">
                {consultationDurations.map((duration) => (
                  <label key={duration.value} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    formData.duration === duration.value ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="duration"
                      value={duration.value}
                      checked={formData.duration === duration.value}
                      onChange={() => handleInputChange('duration', duration.value)}
                      className="sr-only"
                    />
                    <Clock className="w-5 h-5" />
                    <span>{duration.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المشروع المرتبط (اختياري)
              </label>
              <div className="relative">
                <FolderOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.project_id}
                  onChange={(e) => handleInputChange('project_id', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">بدون مشروع</option>
                  {activeProjects.map((project) => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التاريخ المفضل (اختياري)
              </label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <div className="text-blue-500 mt-1">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">معلومات مهمة</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• سيتم مراجعة طلبك وتعيين مستشار مناسب في أقرب وقت</li>
                <li>• يمكنك اختيار مستشار محدد من قسم "البحث عن مستشار"</li>
                <li>• سيتم إرسال رابط الاستشارة قبل الموعد بـ 15 دقيقة</li>
                <li>• يمكنك إلغاء الاستشارة قبل 24 ساعة من الموعد</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              to="/my-requests"
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  إرسال الطلب
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};