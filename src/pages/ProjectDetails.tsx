import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageCircle,
  FileText,
  Plus,
  Edit,
  Share2,
  Download,
  Star,
  Target,
  BarChart3,
  Settings,
  Play,
  Pause,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Award
} from 'lucide-react';
import { getProjectById, getProjectStudents, getProjectTasks, getAllTeachers, getTeachersBySchoolId } from '../lib/firebase';
import { EvaluationForm } from '../components/ProjectEvaluation/EvaluationForm';
import { EvaluationSummary } from '../components/ProjectEvaluation/EvaluationSummary';
import { useProjectEvaluation } from '../hooks/useProjectEvaluation';
import { useAuth } from '../contexts/AuthContext';
import { ProjectChat } from '../components/ProjectChat/ProjectChat';
import { AddTeamMemberModal } from '../components/ProjectTeam/AddTeamMemberModal';
import { AddTaskModal } from '../components/ProjectTasks/AddTaskModal';
import { formatDate, formatDateTime, getDaysRemaining } from '../utils/dateUtils';
import { useProjects } from '../hooks/useProjects';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTranslation } from 'react-i18next';

export const ProjectDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { evaluations, loading: evaluationsLoading } = useProjectEvaluation(id);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const { fetchProjects, updateProject } = useProjects();

  // New state variables for project approval
  const [assignedSupervisorTeacherId, setAssignedSupervisorTeacherId] = useState<string | null>(null);
  const [teachersForSelection, setTeachersForSelection] = useState<{ id: string; name: string }[]>([]);
  const [showSupervisorSelection, setShowSupervisorSelection] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [isApprovingProject, setIsApprovingProject] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isSchool = user?.role === 'school';
  const isAdmin = user?.role === 'admin';
  const isProjectTeacher = user?.id === project?.teacher_id;
  const canApprove = (isTeacher || isSchool || isAdmin) && project?.status === 'draft';

  const fetchProjectDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch project details
      const projectData = await getProjectById(id);
      if (!projectData) {
        setError('المشروع غير موجود');
        setLoading(false);
        return;
      }
      
      // Fetch project students
      const studentsData = await getProjectStudents(id);
      console.log('Students data received in ProjectDetails:', studentsData);
      
      // Fetch project tasks
      const tasksData = await getProjectTasks(id);
      
      // Fetch the project evaluation to get the completion score
      let progress = 0; // Default progress value
      
      try {
        // Query the project_evaluations collection for this project
        const evaluationsRef = collection(db, 'project_evaluations');
        const q = query(evaluationsRef, where('projectId', '==', id));
        const evaluationsSnapshot = await getDocs(q);
        
        if (!evaluationsSnapshot.empty) {
          // Get the first evaluation document
          const evaluationDoc = evaluationsSnapshot.docs[0];
          const evaluationData = evaluationDoc.data();
          
          // Find the completion criterion (first criterion)
          if (evaluationData.criteria && evaluationData.criteria.length > 0) {
            // Get the score from the first criterion (completion criterion)
            progress = evaluationData.criteria[0].score || 0;
            console.log(`Found evaluation for project ${id}, completion score:`, progress);
          }
        } else {
          console.log(`No evaluation found for project ${id}, using default progress:`, progress);
        }
      } catch (evalError) {
        console.error(`Error fetching evaluation for project ${id}:`, evalError);
      }
      
      // Log the original due_date for debugging
      console.log("Original due_date:", projectData.due_date);
      
      setProject({
        ...projectData,
        progress,
        due_date: projectData.due_date
      });
      setStudents(studentsData);
      setTasks(tasksData);

      // Set up teacher selection based on user role
      if (projectData.status === 'draft') {
        if (isTeacher) {
          // For teachers, auto-assign themselves
          setAssignedSupervisorTeacherId(user.id);
          setShowSupervisorSelection(false);
        } else if (isSchool) {
          // For schools, fetch teachers from their school
          const schoolTeachers = await getTeachersBySchoolId(user.id);
          setTeachersForSelection(schoolTeachers);
          setShowSupervisorSelection(true);
          setAssignedSupervisorTeacherId(projectData.teacher_id || null);
        } else if (isAdmin) {
          // For admins, fetch all teachers
          const allTeachers = await getAllTeachers();
          setTeachersForSelection(allTeachers);
          setShowSupervisorSelection(true);
          setAssignedSupervisorTeacherId(projectData.teacher_id || null);
        }
      } else {
        // For non-draft projects, just set the teacher ID
        setAssignedSupervisorTeacherId(projectData.teacher_id || null);
        setShowSupervisorSelection(false);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل تفاصيل المشروع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id, user]);

  const handleAddMemberSuccess = async () => {
    if (!id) return;
    
    try {
      // Refresh students list
      const studentsData = await getProjectStudents(id);
      setStudents(studentsData);
    } catch (err) {
      console.error('Error refreshing students:', err);
    }
  };

  const handleAddTaskSuccess = async () => {
    if (!id) return;
    
    try {
      // Refresh tasks list
      const tasksData = await getProjectTasks(id);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
    }
  };

  const handleEvaluationSaved = async () => {
    // Refresh project details to get updated progress
    await fetchProjectDetails();
    // Also refresh the projects list to update the project card in the projects page
    await fetchProjects();
  };

  const handleApproveProject = async () => {
    // Validation
    if ((isSchool || isAdmin) && !assignedSupervisorTeacherId) {
      setApprovalError(t('projectDetails.errors.selectTeacherRequired'));
      return;
    }

    setIsApprovingProject(true);
    setApprovalError(null);
    setApprovalSuccess(false);

    try {
      // Update project status to active and set teacher_id
      await updateProject(id || '', {
        status: 'active',
        teacher_id: assignedSupervisorTeacherId
      });

      // Show success message
      setApprovalSuccess(true);
      
      // Refresh project details
      await fetchProjectDetails();
      
      // Refresh projects list
      await fetchProjects();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setApprovalSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error approving project:', err);
      setApprovalError(err instanceof Error ? err.message : 'حدث خطأ في اعتماد المشروع');
    } finally {
      setIsApprovingProject(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'في الانتظار';
      default: return status;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'link': return <LinkIcon className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">حدث خطأ</h2>
          <p className="text-gray-600">{error || 'لم يتم العثور على المشروع'}</p>
          <Link to="/projects" className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
            العودة إلى المشاريع
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  
  // Calculate days remaining based on due_date
  const daysRemaining = project.due_date ? getDaysRemaining(project.due_date) : null;
  
  // Log the due_date and days remaining for debugging
  console.log("Project due_date:", project.due_date);
  console.log("Days remaining:", daysRemaining);

  // Check if the current user can edit/delete this project
  const canEditDelete = 
    isAdmin || 
    isSchool || 
    isProjectTeacher || 
    (isTeacher && project.status === 'draft' && project.school_id === user?.school_id) ||
    (isStudent && project.status === 'draft' && students.some(s => s.student_id === user?.id));

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
            to="/projects"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.title}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            {canEditDelete && (
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{project.progress.toFixed(1)}/10</div>
            <div className="text-sm text-gray-600">درجة الإنجاز</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{completedTasks}/{totalTasks}</div>
            <div className="text-sm text-gray-600">المهام</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{students.length}</div>
            <div className="text-sm text-gray-600">الطلاب</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <div className={`text-2xl font-bold ${
              daysRemaining !== null ? (
                daysRemaining < 0 ? 'text-red-600' :
                daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'
              ) : 'text-gray-600'
            }`}>
              {daysRemaining !== null ? (
                daysRemaining < 0 ? 'متأخر' : `${daysRemaining} يوم`
              ) : '--'}
            </div>
            <div className="text-sm text-gray-600">يوم متبقي</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">درجة الإنجاز</span>
            <span className="text-sm font-medium text-gray-700">{project.progress.toFixed(1)}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${(project.progress / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Project Approval Section */}
        {project.status === 'draft' && canApprove && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('projectDetails.approveProject')}</h3>
                
                {/* Success message */}
                {approvalSuccess && (
                  <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{t('projectDetails.projectApproved')}</span>
                  </div>
                )}
                
                {/* Error message */}
                {approvalError && (
                  <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{approvalError}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Teacher selection for school and admin */}
                  {showSupervisorSelection && (
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        {t('projectDetails.supervisorTeacher')}
                      </label>
                      <select
                        value={assignedSupervisorTeacherId || ''}
                        onChange={(e) => setAssignedSupervisorTeacherId(e.target.value || null)}
                        className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{t('projectDetails.selectTeacher')}</option>
                        {teachersForSelection.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name} {teacher.subject ? `(${teacher.subject})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Auto-assignment message for teachers */}
                  {isTeacher && !showSupervisorSelection && (
                    <p className="text-blue-700 mb-4">
                      {t('projectDetails.assignedToYou')}
                    </p>
                  )}
                  
                  {/* Approve button */}
                  <button
                    onClick={handleApproveProject}
                    disabled={isApprovingProject || (!assignedSupervisorTeacherId && (isSchool || isAdmin))}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApprovingProject ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {t('projectDetails.approving')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t('projectDetails.approveProject')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
              { id: 'tasks', name: 'المهام', icon: CheckCircle },
              { id: 'team', name: 'الفريق', icon: Users },
              { id: 'resources', name: 'الموارد', icon: FileText },
              { id: 'chat', name: 'المحادثة', icon: MessageCircle },
              { id: 'evaluation', name: 'التقييم', icon: Award },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Project Objectives */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">أهداف المشروع</h3>
                <div className="space-y-3">
                  {project.objectives && project.objectives.map((objective: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{objective}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">النشاط الأخير</h3>
                {tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          task.status === 'completed' ? 'bg-green-100' : 
                          task.status === 'in_progress' ? 'bg-blue-100' : 'bg-yellow-100'
                        }`}>
                          {task.status === 'completed' ? 
                            <CheckCircle className="w-5 h-5 text-green-600" /> : 
                            <Clock className="w-5 h-5 text-blue-600" />
                          }
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{task.title}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {getStatusText(task.status)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            تاريخ الاستحقاق: {formatDate(task.due_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">لا يوجد نشاط حديث</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">المهام</h3>
                {canEditDelete && (
                  <button 
                    onClick={() => setShowAddTaskModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    مهمة جديدة
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800">{task.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {getStatusText(task.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>المسؤول: {
                              students.find(s => s.student_id === task.assigned_to)?.student?.name || 
                              "غير محدد"
                            }</span>
                            <span>الموعد النهائي: {formatDate(task.due_date)}</span>
                          </div>
                        </div>
                        {canEditDelete && (
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                      
                      {task.status === 'in_progress' && task.progress && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">التقدم</span>
                            <span className="text-xs text-gray-600">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد مهام</h3>
                    <p className="text-gray-600">لم يتم إضافة مهام لهذا المشروع بعد</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">فريق العمل</h3>
                {canEditDelete && (
                  <button 
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة عضو
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {students.length > 0 ? (
                  students.map((student) => (
                    <div key={student.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                      <img
                        src={student.student?.avatar_url || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"}
                        alt={student.student?.name || "طالب"}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{student.student?.name || "طالب غير معروف"}</h4>
                          {student.role === 'leader' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              قائد الفريق
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{student.student?.email || "بريد إلكتروني غير متوفر"}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>المهام المكتملة: {tasks.filter(t => t.assigned_to === student.student_id && t.status === 'completed').length}</span>
                          <span>المهام النشطة: {tasks.filter(t => t.assigned_to === student.student_id && t.status === 'in_progress').length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <MessageCircle className="w-4 h-4 text-gray-400" />
                        </button>
                        {canEditDelete && (
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">لا يوجد طلاب</h3>
                    <p className="text-gray-600">لم يتم إضافة طلاب لهذا المشروع بعد</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">الموارد</h3>
                {canEditDelete && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    رفع ملف
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {project.resources && project.resources.length > 0 ? (
                  project.resources.map((resource: any) => (
                    <div key={resource.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{resource.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>رفع بواسطة: {
                            students.find(s => s.student_id === resource.uploaded_by)?.student?.name || 
                            "غير معروف"
                          }</span>
                          <span>{formatDate(resource.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <Share2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد موارد</h3>
                    <p className="text-gray-600">لم يتم إضافة موارد لهذا المشروع بعد</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">محادثة الفريق</h3>
              <ProjectChat projectId={id || ''} />
            </motion.div>
          )}

          {/* Evaluation Tab */}
          {activeTab === 'evaluation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {isTeacher && isProjectTeacher ? (
                <EvaluationForm 
                  projectId={id || ''} 
                  onSaved={handleEvaluationSaved}
                />
              ) : (
                <>
                  {evaluationsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : evaluations.length > 0 ? (
                    <EvaluationSummary 
                      evaluation={evaluations[0]}
                      teacherName={project.teacher_name || 'المعلم'}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">لا يوجد تقييم</h3>
                      <p className="text-gray-600">لم يتم تقييم المشروع بعد من قبل المعلم</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات المشروع</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1">الحالة</label>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <Play className="w-4 h-4" />
                    {getStatusText(project.status)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1">الفئة</label>
                <p className="mt-1 text-gray-800">{
                  project.category === 'stem' ? 'العلوم والتقنية' :
                  project.category === 'entrepreneurship' ? 'ريادة الأعمال' :
                  project.category === 'volunteer' ? 'التطوع' :
                  project.category === 'ethics' ? 'الأخلاق' :
                  project.category
                }</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1">الموضوع</label>
                <p className="mt-1 text-gray-800">{project.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1">تاريخ البداية</label>
                <p className="mt-1 text-gray-800">{formatDate(project.created_at)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1">الموعد النهائي</label>
                <p className="mt-1 text-gray-800">{formatDate(project.due_date)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1">{t('projectDetails.supervisorTeacher')}</label>
                <p className="mt-1 text-gray-800">
                  {project.teacher_id ? (
                    teachersForSelection.find(t => t.id === project.teacher_id)?.name || 'معلم غير معروف'
                  ) : (
                    'غير محدد'
                  )}
                </p>
              </div>

              {project.rating && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1">التقييم</label>
                  <div className="mt-1 flex items-center gap-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-5 h-5 ${star <= project.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">({project.rating.toFixed(1)})</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          {canEditDelete && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">إجراءات سريعة</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddTaskModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-right bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  إضافة مهمة جديدة
                </button>
                <button 
                  onClick={() => setShowAddMemberModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-right bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  دعوة عضو جديد
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-right bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">
                  <Upload className="w-5 h-5" />
                  رفع ملف
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-right bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors">
                  <Share2 className="w-5 h-5" />
                  مشاركة المشروع
                </button>
                {isTeacher && isProjectTeacher && (
                  <button 
                    onClick={() => setActiveTab('evaluation')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors"
                  >
                    <Award className="w-5 h-5" />
                    تقييم المشروع
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Team Members */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">أعضاء الفريق</h3>
            <div className="space-y-3">
              {students.length > 0 ? (
                students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <img
                      src={student.student?.avatar_url || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"}
                      alt={student.student?.name || "طالب"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{student.student?.name || "طالب غير معروف"}</p>
                      <p className="text-xs text-gray-500">
                        {student.role === 'leader' ? 'قائد الفريق' : 'عضو'}
                      </p>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-2">لا يوجد أعضاء في الفريق</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <AddTeamMemberModal
          projectId={id || ''}
          maxStudents={project.max_students || 5}
          currentStudents={students}
          onClose={() => setShowAddMemberModal(false)}
          onSuccess={handleAddMemberSuccess}
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          projectId={id || ''}
          students={students}
          onClose={() => setShowAddTaskModal(false)}
          onSuccess={handleAddTaskSuccess}
        />
      )}
    </div>
  );
};