import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  GraduationCap,
  Building,
  Shield,
  Eye,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';

const userRoles = [
  { id: 'all', name: 'جميع المستخدمين' },
  { id: 'student', name: 'طلاب', icon: GraduationCap, color: 'bg-blue-500' },
  { id: 'teacher', name: 'معلمين', icon: BookOpen, color: 'bg-green-500' },
  { id: 'school', name: 'مدارس', icon: Building, color: 'bg-purple-500' },
  { id: 'admin', name: 'مديرين', icon: Shield, color: 'bg-red-500' },
];

export const Users: React.FC = () => {
  const { users, loading, error } = useUsers();
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.school && user.school.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesRole && matchesSearch;
  });

  const getRoleInfo = (role: string) => {
    const roleInfo = userRoles.find(r => r.id === role);
    return roleInfo || { name: role, icon: UsersIcon, color: 'bg-gray-500' };
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'student': return 'طالب';
      case 'teacher': return 'معلم';
      case 'school': return 'مدرسة';
      case 'admin': return 'مدير';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'suspended': return 'موقوف';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
              <p className="opacity-90">إدارة ومتابعة جميع مستخدمي المنصة</p>
            </div>
          </div>
          
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة مستخدم
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm opacity-80">إجمالي المستخدمين</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'student').length}</div>
            <div className="text-sm opacity-80">طلاب</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'teacher').length}</div>
            <div className="text-sm opacity-80">معلمين</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
            <div className="text-sm opacity-80">نشط</div>
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
              placeholder="البحث في المستخدمين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            الفلاتر
          </button>
        </div>

        {/* Role Filters */}
        <div className={`mt-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <h3 className="font-medium text-gray-700 mb-3">نوع المستخدم</h3>
          <div className="flex flex-wrap gap-2">
            {userRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  selectedRole === role.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role.icon && <role.icon className="w-4 h-4" />}
                {role.name}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          عرض {filteredUsers.length} من أصل {users.length} مستخدم
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => {
          const roleInfo = getRoleInfo(user.role);
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
            >
              {/* User Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${roleInfo.color} rounded-full flex items-center justify-center`}>
                      <roleInfo.icon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600">{getRoleText(user.role)}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
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
                        عرض الملف الشخصي
                      </button>
                      <button className="flex items-center gap-2 w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                      <button className="flex items-center gap-2 w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Mail className="w-4 h-4" />
                        إرسال رسالة
                      </button>
                      <hr className="my-1" />
                      <button className="flex items-center gap-2 w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {/* Role-specific Info */}
              {user.role === 'student' && (
                <div className="space-y-2 mb-4">
                  {user.school && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{user.school}</span>
                    </div>
                  )}
                  {user.grade && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <span>{user.grade}</span>
                    </div>
                  )}
                </div>
              )}

              {user.role === 'teacher' && (
                <div className="space-y-2 mb-4">
                  {user.school && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{user.school}</span>
                    </div>
                  )}
                  {user.subject && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{user.subject}</span>
                    </div>
                  )}
                  {user.experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{user.experience}</span>
                    </div>
                  )}
                </div>
              )}

              {user.role === 'school' && (
                <div className="space-y-2 mb-4">
                  {user.type && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{user.type}</span>
                    </div>
                  )}
                  {user.establishedYear && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>تأسست عام {user.establishedYear}</span>
                    </div>
                  )}
                </div>
              )}

              {user.role === 'admin' && user.department && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>{user.department}</span>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {user.role === 'student' && (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{user.projectsCount || 0}</div>
                      <div className="text-xs text-gray-500">مشاريع</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{user.completedProjects || 0}</div>
                      <div className="text-xs text-gray-500">مكتملة</div>
                    </div>
                  </>
                )}

                {user.role === 'teacher' && (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{user.projectsCount || 0}</div>
                      <div className="text-xs text-gray-500">مشاريع</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{user.studentsCount || 0}</div>
                      <div className="text-xs text-gray-500">طلاب</div>
                    </div>
                  </>
                )}

                {user.role === 'school' && (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{user.studentsCount || 0}</div>
                      <div className="text-xs text-gray-500">طلاب</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{user.teachersCount || 0}</div>
                      <div className="text-xs text-gray-500">معلمين</div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  انضم: {formatDate(user.joinedAt)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatRelativeTime(user.lastActive)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">لا يوجد مستخدمين</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على مستخدمين يطابقون معايير البحث</p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              إضافة مستخدم جديد
            </button>
            <button
              onClick={() => {
                setSelectedRole('all');
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