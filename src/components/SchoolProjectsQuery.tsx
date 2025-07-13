import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  School, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { getSchoolProjectsCountByEmail } from '../lib/firebase';
import { formatDate } from '../utils/dateUtils';

interface SchoolProjectsQueryProps {
  defaultEmail?: string;
}

export const SchoolProjectsQuery: React.FC<SchoolProjectsQueryProps> = ({ defaultEmail = '' }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [searchEmail, setSearchEmail] = useState(defaultEmail);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني للمدرسة');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const projectsData = await getSchoolProjectsCountByEmail(searchEmail);
      setResult(projectsData);
      
      if (!projectsData.found) {
        setError(projectsData.message);
      }
    } catch (err) {
      console.error('Error fetching school projects:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء البحث عن المدرسة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultEmail) {
      handleSearch();
    }
  }, [defaultEmail]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <School className="w-6 h-6 text-indigo-600" />
        استعلام عن مشاريع المدرسة
      </h2>

      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني للمدرسة"
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setSearchEmail(email);
              handleSearch();
            }}
            disabled={loading}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري البحث...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                بحث
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && result.found && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                <School className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{result.school.name}</h3>
                <p className="text-gray-600">{result.school.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">{result.count}</div>
                <div className="text-sm text-gray-600">إجمالي المشاريع</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {result.projects.filter((p: any) => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">مشاريع مكتملة</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {result.projects.filter((p: any) => p.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">مشاريع نشطة</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-yellow-600">
                  {result.projects.filter((p: any) => p.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">مشاريع في المسودة</div>
              </div>
            </div>
          </div>

          {result.projects.length > 0 ? (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">قائمة المشاريع</h3>
              <div className="space-y-4">
                {result.projects.map((project: any) => (
                  <div key={project.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          project.status === 'completed' ? 'bg-green-100 text-green-600' : 
                          project.status === 'active' ? 'bg-blue-100 text-blue-600' : 
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800">{project.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              project.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {project.status === 'completed' ? 'مكتمل' : 
                               project.status === 'active' ? 'نشط' : 'مسودة'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(project.created_at)}
                            </div>
                            {project.due_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                تاريخ الاستحقاق: {formatDate(project.due_date)}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              الحد الأقصى: {project.max_students} طلاب
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800">درجة الإنجاز</div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-indigo-600"
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{project.progress || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">تم العثور على المدرسة</h3>
              <p className="text-gray-600">لا توجد مشاريع مسجلة لهذه المدرسة حتى الآن</p>
            </div>
          )}
        </motion.div>
      )}

      {!loading && !result && !error && (
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">استعلام عن مشاريع المدرسة</h3>
          <p className="text-gray-600">أدخل البريد الإلكتروني للمدرسة للبحث عن المشاريع المرتبطة بها</p>
        </div>
      )}
    </div>
  );
};