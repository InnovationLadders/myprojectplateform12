import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export interface EvaluationCriteria {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  comments?: string;
}

export interface ProjectEvaluation {
  id: string;
  projectId: string;
  teacherId: string;
  criteria: EvaluationCriteria[];
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

const defaultCriteria: EvaluationCriteria[] = [
  { name: 'درجة الإنجاز', score: 0, maxScore: 10, weight: 0.2, comments: '' },
  { name: 'جودة العمل', score: 0, maxScore: 10, weight: 0.25, comments: '' },
  { name: 'التواصل والتعاون', score: 0, maxScore: 10, weight: 0.15, comments: '' },
  { name: 'الإبداع والابتكار', score: 0, maxScore: 10, weight: 0.2, comments: '' },
  { name: 'جودة العرض والتوثيق', score: 0, maxScore: 10, weight: 0.2, comments: '' }
];

export const useProjectEvaluation = (projectId?: string) => {
  const [evaluations, setEvaluations] = useState<ProjectEvaluation[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<ProjectEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProjectEvaluations = async (projectId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const evaluationsRef = collection(db, 'project_evaluations');
      const q = query(evaluationsRef, where('projectId', '==', projectId));
      const snapshot = await getDocs(q);
      
      const evaluationsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          projectId: data.projectId,
          teacherId: data.teacherId,
          criteria: data.criteria || [],
          totalScore: data.totalScore || 0,
          maxTotalScore: data.maxTotalScore || 0,
          percentage: data.percentage || 0,
          feedback: data.feedback || '',
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()).toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()).toISOString() : new Date().toISOString()
        };
      });
      
      setEvaluations(evaluationsData);
      
      // If there's an existing evaluation by this teacher, set it as current
      const teacherEvaluation = evaluationsData.find(e => e.teacherId === user.id);
      if (teacherEvaluation) {
        setCurrentEvaluation(teacherEvaluation);
      } else {
        // Initialize a new evaluation
        setCurrentEvaluation({
          id: '',
          projectId,
          teacherId: user.id,
          criteria: [...defaultCriteria],
          totalScore: 0,
          maxTotalScore: 50, // 5 criteria * 10 max score
          percentage: 0,
          feedback: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error fetching project evaluations:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل تقييمات المشروع');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (criteria: EvaluationCriteria[]): { total: number, percentage: number } => {
    let weightedTotal = 0;
    let maxWeightedTotal = 0;
    
    criteria.forEach(criterion => {
      weightedTotal += criterion.score * criterion.weight;
      maxWeightedTotal += criterion.maxScore * criterion.weight;
    });
    
    const percentage = maxWeightedTotal > 0 ? (weightedTotal / maxWeightedTotal) * 100 : 0;
    
    return {
      total: weightedTotal,
      percentage: Math.round(percentage)
    };
  };

  // Function to get the completion score from the "درجة الإنجاز" criterion
  const getCompletionScore = (criteria: EvaluationCriteria[]): number => {
    // Find the criterion with name "درجة الإنجاز"
    const completionCriterion = criteria.find(c => c.name === 'درجة الإنجاز');
    
    console.log('Completion criterion found:', completionCriterion);
    
    if (completionCriterion) {
      // Return the raw score (not percentage)
      console.log('Completion criterion score:', completionCriterion.score);
      console.log('Completion criterion maxScore:', completionCriterion.maxScore);
      return completionCriterion.score;
    }
    
    console.log('No completion criterion found, returning 0');
    return 0;
  };

  const updateCriterionScore = (index: number, score: number, comments?: string) => {
    if (!currentEvaluation) return;
    
    const updatedCriteria = [...currentEvaluation.criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      score: Math.min(Math.max(0, score), updatedCriteria[index].maxScore),
      comments: comments || updatedCriteria[index].comments
    };
    
    const { total, percentage } = calculateTotalScore(updatedCriteria);
    
    setCurrentEvaluation({
      ...currentEvaluation,
      criteria: updatedCriteria,
      totalScore: total,
      percentage
    });
  };

  const updateFeedback = (feedback: string) => {
    if (!currentEvaluation) return;
    
    setCurrentEvaluation({
      ...currentEvaluation,
      feedback
    });
  };

  const saveEvaluation = async () => {
    if (!user || !currentEvaluation || !projectId) {
      throw new Error('بيانات غير كافية لحفظ التقييم');
    }

    try {
      console.log('Submitting evaluation with currentEvaluation:', currentEvaluation);
      
      // Find the completion criterion for logging
      const completionCriterion = currentEvaluation?.criteria.find(c => c.name === 'درجة الإنجاز');
      console.log('Completion criterion before save:', completionCriterion);
      
      const { total, percentage } = calculateTotalScore(currentEvaluation.criteria);
      
      // Get the completion score from the "درجة الإنجاز" criterion
      const completionScore = getCompletionScore(currentEvaluation.criteria);
      
      console.log('Final completion score to be saved:', completionScore);
      
      const evaluationData = {
        projectId,
        teacherId: user.id,
        criteria: currentEvaluation.criteria,
        totalScore: total,
        maxTotalScore: currentEvaluation.maxTotalScore,
        percentage,
        feedback: currentEvaluation.feedback,
        updatedAt: serverTimestamp()
      };
      
      if (currentEvaluation.id) {
        // Update existing evaluation
        const evaluationRef = doc(db, 'project_evaluations', currentEvaluation.id);
        await updateDoc(evaluationRef, evaluationData);
        
        // Also update the project's rating (but not progress anymore)
        const projectRef = doc(db, 'projects', projectId);
        
        console.log('Updating project with ID:', projectId);
        console.log('Setting rating to:', percentage / 20);
        
        await updateDoc(projectRef, {
          rating: percentage / 20, // Convert to 0-5 scale
          updatedAt: serverTimestamp()
        });
        
        return { ...currentEvaluation, ...evaluationData, id: currentEvaluation.id };
      } else {
        // Create new evaluation
        evaluationData.createdAt = serverTimestamp();
        const evaluationRef = collection(db, 'project_evaluations');
        const docRef = await addDoc(evaluationRef, evaluationData);
        
        // Also update the project's rating (but not progress anymore)
        const projectRef = doc(db, 'projects', projectId);
        
        console.log('Updating project with ID:', projectId);
        console.log('Setting rating to:', percentage / 20);
        
        await updateDoc(projectRef, {
          rating: percentage / 20, // Convert to 0-5 scale
          updatedAt: serverTimestamp()
        });
        
        return { ...currentEvaluation, ...evaluationData, id: docRef.id };
      }
    } catch (err) {
      console.error('Error saving evaluation:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (projectId && user) {
      fetchProjectEvaluations(projectId);
    }
  }, [projectId, user]);

  return {
    evaluations,
    currentEvaluation,
    loading,
    error,
    fetchProjectEvaluations,
    updateCriterionScore,
    updateFeedback,
    saveEvaluation
  };
};