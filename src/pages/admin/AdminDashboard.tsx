import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  BookOpen, 
  Settings, 
  Shield, 
  Bell, 
  Search, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  BarChart3,
  FileText,
  MessageCircle,
  ShoppingCart,
  Database,
  AlertTriangle,
  Lightbulb,
  Video,
  Calendar,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDate } from '../../utils/dateUtils';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Summer program stats
  const [summerProgramStats, setSummerProgramStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchSummerProgramStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching users from Firestore...');

      // Fetch all users
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      console.log(`Found ${usersSnapshot.docs.length} users in Firestore`);
      
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          name: data.name || 'مستخدم بدون اسم',
          email: data.email || 'بدون بريد إلكتروني',
          role: data.role || 'student',
          status: data.status || 'active',
          avatar_url: data.avatar_url || data.avatar
        };
      });
      
      console.log('Processed user data:', usersData);
      setAllUsers(usersData);
      
      // Filter pending users (schools and consultants with pending status)
      const pendingUsersData = usersData.filter(user => 
        (user.role === 'school' || user.role === 'consultant') && 
        user.status === 'pending'
      );
      
      console.log(`Found ${pendingUsersData.length} pending users`);
      setPendingUsers(pendingUsersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummerProgramStats = async () => {
    try {
      // Fetch summer program registrations
      const registrationsRef = collection(db, 'summer_program_registrations');
      const registrationsSnapshot = await getDocs(registrationsRef);
      
      // Calculate stats
      const total = registrationsSnapshot.size;
      const pending = registrationsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
      const approved = registrationsSnapshot.docs.filter(doc => doc.data().status === 'approved').length;
      const rejected = registrationsSnapshot.docs.filter(doc => doc.data().status === 'rejected').length;
      
      setSummerProgramStats({
        total,
        pending,
        approved,
        rejected
      });
      
    } catch (err) {
      console.error('Error fetching summer program stats:', err);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      setActionLoading(true);
      
      // Update user status to active
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'active',
        approved_at: serverTimestamp(),
        approved_by: user?.id
      });
      
      console.log(`User ${userId} approved successfully`);
      
      // Refresh users list
      await fetchUsers();
      
      // Show success message
      alert('تم تفعيل الحساب بنجاح');
    } catch (err) {
      console.error('Error approving user:', err);
      alert('حدث خطأ أثناء تفعيل الحساب');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      setActionLoading(true);
      
      // Update user status to rejected
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'rejected',
        rejected_at: serverTimestamp(),
        rejected_by: user?.id
      });
      
      console.log(`User ${userId} rejected successfully`);
      
      // Refresh users list
      await fetchUsers();
      
      // Show success message
      alert('تم رفض الحساب بنجاح');
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('حدث خطأ أثناء رفض الحساب');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      // Delete user document
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      console.log(`User ${userId} deleted successfully`);
      
      // Refresh users list
      await fetchUsers();
      
      // Show success message
      alert('تم حذف المستخدم بنجاح');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('حدث خطأ أثناء حذف المستخدم');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter users based on search term, role, and status
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role text
  const getRoleText = (role: string) => {
    switch (role) {
      case 'student': return 'طالب';
      case 'teacher': return 'معلم';
      case 'school': return 'مدرسة';
      case 'consultant': return 'مستشار';
      case 'admin': return 'مدير';
      default: return role;
    }
  };

  // Get status text and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'نشط', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'pending':
        return { text: 'في انتظار التفعيل', color: 'bg-yellow-100 text-yellow-800', icon: Bell };
      case 'rejected':
        return { text: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'suspended':
        return { text: 'موقوف', color: 'bg-gray-100 text-gray-800', icon: XCircle };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
        className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
            <p className="opacity-90">مرحباً {user?.name}، إدارة المنصة والمستخدمين</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <div className="text-sm opacity-80">إجمالي المستخدمين</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <div className="text-sm opacity-80">في انتظار التفعيل</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{allUsers.filter(u => u.role === 'school').length}</div>
            <div className="text-sm opacity-80">مدرسة</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{allUsers.filter(u => u.role === 'consultant').length}</div>
            <div className="text-sm opacity-80">مستشار</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                نظرة عامة
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pending-approvals')}
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'pending-approvals'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                طلبات التفعيل
                {pendingUsers.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingUsers.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users-management')}
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'users-management'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                إدارة المستخدمين
              </div>
            </button>
            <button
              onClick={() => setActiveTab('schools-management')}
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'schools-management'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <School className="w-4 h-4" />
                إدارة المدارس
              </div>
            </button>
            <button
              onClick={() => setActiveTab('content-management')}
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'content-management'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                إدارة المحتوى
              </div>
            </button>
            <button
              onClick={() => setActiveTab('summer-program')}
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'summer-program'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                البرنامج الصيفي
                {summerProgramStats.pending > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {summerProgramStats.pending}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('system-settings')}
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'system-settings'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                إعدادات النظام
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">نظرة عامة على المنصة</h2>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المستخدمين</p>
                      <p className="text-xl font-bold text-gray-800">{allUsers.length}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>نشط: {allUsers.filter(u => u.status === 'active').length}</span>
                    <span>جديد: +{allUsers.filter(u => {
                      const createdAt = new Date(u.createdAt);
                      const now = new Date();
                      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 7;
                    }).length} هذا الأسبوع</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <School className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المدارس</p>
                      <p className="text-xl font-bold text-gray-800">{allUsers.filter(u => u.role === 'school').length}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>نشط: {allUsers.filter(u => u.role === 'school' && u.status === 'active').length}</span>
                    <span>في الانتظار: {allUsers.filter(u => u.role === 'school' && u.status === 'pending').length}</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المستشارين</p>
                      <p className="text-xl font-bold text-gray-800">{allUsers.filter(u => u.role === 'consultant').length}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>نشط: {allUsers.filter(u => u.role === 'consultant' && u.status === 'active').length}</span>
                    <span>في الانتظار: {allUsers.filter(u => u.role === 'consultant' && u.status === 'pending').length}</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">البرنامج الصيفي</p>
                      <p className="text-xl font-bold text-gray-800">{summerProgramStats.total}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>مقبول: {summerProgramStats.approved}</span>
                    <span>في الانتظار: {summerProgramStats.pending}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">النشاط الأخير</h3>
                
                <div className="space-y-4">
                  {pendingUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        user.role === 'school' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {user.role === 'school' ? (
                          <School className={`w-5 h-5 ${user.role === 'school' ? 'text-green-600' : 'text-purple-600'}`} />
                        ) : (
                          <Briefcase className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            في انتظار التفعيل
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {getRoleText(user.role)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => approveUser(user.id)}
                          disabled={actionLoading}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => rejectUser(user.id)}
                          disabled={actionLoading}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingUsers.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-gray-500">لا توجد طلبات تفعيل جديدة</p>
                    </div>
                  )}
                </div>
                
                {pendingUsers.length > 5 && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => setActiveTab('pending-approvals')}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      عرض كل الطلبات ({pendingUsers.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Summer Program Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                    البرنامج الصيفي "صيفي تك"
                  </h3>
                  <Link 
                    to="/admin/summer-program-registrations"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                  >
                    إدارة التسجيلات
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                  </Link>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-800">{summerProgramStats.total}</div>
                    <div className="text-xs text-gray-500">إجمالي التسجيلات</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-yellow-600">{summerProgramStats.pending}</div>
                    <div className="text-xs text-gray-500">قيد المراجعة</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-600">{summerProgramStats.approved}</div>
                    <div className="text-xs text-gray-500">تمت الموافقة</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-red-600">{summerProgramStats.rejected}</div>
                    <div className="text-xs text-gray-500">مرفوض</div>
                  </div>
                </div>
                
                {summerProgramStats.pending > 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <Bell className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">يوجد {summerProgramStats.pending} طلب تسجيل في انتظار المراجعة</p>
                      <p className="text-sm text-yellow-700 mt-1">يرجى مراجعة طلبات التسجيل في البرنامج الصيفي واتخاذ الإجراء المناسب.</p>
                      <Link 
                        to="/admin/summer-program-registrations"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                      >
                        عرض الطلبات
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">لا توجد طلبات تسجيل في انتظار المراجعة</p>
                      <p className="text-sm text-green-700 mt-1">جميع طلبات التسجيل في البرنامج الصيفي تمت مراجعتها.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">إضافة مستخدم</h3>
                      <p className="text-sm text-gray-500">إنشاء حساب جديد</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    إضافة مستخدم
                  </button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">التقارير</h3>
                      <p className="text-sm text-gray-500">إحصائيات وتحليلات</p>
                    </div>
                  </div>
                  <Link to="/reports" className="block w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center">
                    عرض التقارير
                  </Link>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">النسخ الاحتياطي</h3>
                      <p className="text-sm text-gray-500">حماية بيانات المنصة</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                    إنشاء نسخة احتياطية
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'pending-approvals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">طلبات التفعيل</h2>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">جميع الأنواع</option>
                    <option value="school">المدارس</option>
                    <option value="consultant">المستشارين</option>
                  </select>
                </div>
              </div>

              {pendingUsers.length > 0 ? (
                <div className="space-y-4">
                  {pendingUsers
                    .filter(user => selectedRole === 'all' || user.role === selectedRole)
                    .map((user) => (
                      <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <img
                            src={user.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150`}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                                <p className="text-gray-600">{user.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  في انتظار التفعيل
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                  {getRoleText(user.role)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">تاريخ التسجيل:</p>
                                <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                              </div>
                              
                              {user.phone && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">رقم الهاتف:</p>
                                  <p className="text-sm font-medium">{user.phone}</p>
                                </div>
                              )}
                              
                              {user.role === 'school' && (
                                <>
                                  {user.type && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-1">نوع المدرسة:</p>
                                      <p className="text-sm font-medium">{user.type}</p>
                                    </div>
                                  )}
                                  {user.location && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-1">الموقع:</p>
                                      <p className="text-sm font-medium">{user.location}</p>
                                    </div>
                                  )}
                                </>
                              )}
                              
                              {user.role === 'consultant' && (
                                <>
                                  {user.subject && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-1">التخصص:</p>
                                      <p className="text-sm font-medium">{user.subject}</p>
                                    </div>
                                  )}
                                  {user.experience_years && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-1">سنوات الخبرة:</p>
                                      <p className="text-sm font-medium">{user.experience_years} سنوات</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {user.bio && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">نبذة:</p>
                                <p className="text-sm text-gray-700">{user.bio}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => approveUser(user.id)}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle className="w-4 h-4" />
                                تفعيل الحساب
                              </button>
                              <button 
                                onClick={() => rejectUser(user.id)}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-4 h-4" />
                                رفض
                              </button>
                              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                عرض التفاصيل
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد طلبات تفعيل</h3>
                  <p className="text-gray-600">جميع طلبات التفعيل تمت معالجتها</p>
                </div>
              )}
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users-management' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">إدارة المستخدمين</h2>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  إضافة مستخدم
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث في المستخدمين..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="student">طلاب</option>
                  <option value="teacher">معلمين</option>
                  <option value="school">مدارس</option>
                  <option value="consultant">مستشارين</option>
                  <option value="admin">مديرين</option>
                </select>
                
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="pending">في الانتظار</option>
                  <option value="rejected">مرفوض</option>
                  <option value="suspended">موقوف</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المستخدم
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        النوع
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ التسجيل
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const statusInfo = getStatusInfo(user.status);
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img 
                                src={user.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150`}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {getRoleText(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 ${statusInfo.color} rounded-full text-xs font-medium flex items-center gap-1 w-fit`}>
                              <statusInfo.icon className="w-3 h-3" />
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-green-600 hover:text-green-800 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteUser(user.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">لا يوجد مستخدمين</h3>
                  <p className="text-gray-600">لم يتم العثور على مستخدمين يطابقون معايير البحث</p>
                </div>
              )}
            </div>
          )}

          {/* Summer Program Tab */}
          {activeTab === 'summer-program' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                  إدارة البرنامج الصيفي "صيفي تك"
                </h2>
                <Link 
                  to="/admin/summer-program-registrations"
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  عرض جميع التسجيلات
                </Link>
              </div>

              {/* Summer Program Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">إجمالي التسجيلات</p>
                      <p className="text-xl font-bold text-gray-800">{summerProgramStats.total}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">قيد المراجعة</p>
                      <p className="text-xl font-bold text-gray-800">{summerProgramStats.pending}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تمت الموافقة</p>
                      <p className="text-xl font-bold text-gray-800">{summerProgramStats.approved}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">مرفوض</p>
                      <p className="text-xl font-bold text-gray-800">{summerProgramStats.rejected}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summer Program Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات البرنامج الصيفي</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">البرنامج الصيفي "صيفي تك"</p>
                      <p className="text-sm text-blue-700 mt-1">برنامج تدريبي صيفي للطلاب في مجالات التكنولوجيا والابتكار</p>
                      <p className="text-sm text-blue-700 mt-1">الفترة: 15 يونيو - 15 أغسطس 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">رابط التسجيل في البرنامج</p>
                      <p className="text-sm text-green-700 mt-1">يمكن للطلاب التسجيل في البرنامج من خلال الرابط التالي:</p>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="px-3 py-1 bg-green-100 rounded-lg text-green-800 text-sm">
                          /summer-program-enrollment
                        </code>
                        <button className="p-1 bg-green-200 text-green-700 rounded-lg hover:bg-green-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-800">إدارة التسجيلات</p>
                      <p className="text-sm text-purple-700 mt-1">يمكنك إدارة جميع طلبات التسجيل في البرنامج الصيفي من خلال لوحة التحكم الخاصة بالبرنامج.</p>
                      <Link 
                        to="/admin/summer-program-registrations"
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-300 transition-colors text-sm"
                      >
                        الانتقال إلى لوحة التحكم
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schools Management Tab */}
          {activeTab === 'schools-management' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">إدارة المدارس</h2>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                  <School className="w-4 h-4" />
                  إضافة مدرسة
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <p className="text-center text-gray-600">قريباً - سيتم إضافة واجهة إدارة المدارس</p>
              </div>
            </div>
          )}

          {/* Content Management Tab */}
          {activeTab === 'content-management' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">إدارة المحتوى</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">أفكار المشاريع</h3>
                      <p className="text-sm text-gray-500">إدارة مكتبة أفكار المشاريع</p>
                    </div>
                  </div>
                  <Link to="/admin/manage-project-ideas" className="block w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center">
                    إدارة الأفكار
                  </Link>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">المصادر التعليمية</h3>
                      <p className="text-sm text-gray-500">إدارة المصادر والمواد التعليمية</p>
                    </div>
                  </div>
                  <Link to="/resources" className="block w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center">
                    إدارة المصادر
                  </Link>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Video className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">الفيديوهات التعليمية</h3>
                      <p className="text-sm text-gray-500">إدارة الفيديوهات التعليمية</p>
                    </div>
                  </div>
                  <Link to="/admin/manage-videos" className="block w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-center">
                    إدارة الفيديوهات
                  </Link>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">المتجر</h3>
                      <p className="text-sm text-gray-500">إدارة منتجات المتجر</p>
                    </div>
                  </div>
                  <Link to="/store" className="block w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-center">
                    إدارة المتجر
                  </Link>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">البرنامج الصيفي</h3>
                      <p className="text-sm text-gray-500">إدارة تسجيلات البرنامج الصيفي</p>
                    </div>
                  </div>
                  <Link to="/admin/summer-program-registrations" className="block w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-center">
                    إدارة التسجيلات
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system-settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">إعدادات النظام</h2>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <p className="text-center text-gray-600">قريباً - سيتم إضافة واجهة إعدادات النظام</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Import missing components
import { Briefcase, Info } from 'lucide-react';