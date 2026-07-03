import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Award, 
  Users, 
  CheckCircle, 
  LayoutDashboard, 
  FileText, 
  FolderLock, 
  ChevronDown, 
  LogOut,
  Sparkles,
  Library,
  Megaphone,
  Video,
  MapPin,
  Menu,
  Bell,
  X,
  MessageSquare
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import QuizManager from './components/QuizManager';
import AssignmentManager from './components/AssignmentManager';
import QuizTaker from './components/QuizTaker';
import AssignmentSubmitter from './components/AssignmentSubmitter';
import Gradebook from './components/Gradebook';
import GroupManager from './components/GroupManager';
import LoginPage from './components/LoginPage';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import AdminDashboard from './components/AdminDashboard';
import ClassRosterManager from './components/ClassRosterManager';
import LecturerCourseManager from './components/LecturerCourseManager';
import MaterialsManager from './components/MaterialsManager';
import AnnouncementsForum from './components/AnnouncementsForum';
import VirtualClassManager from './components/VirtualClassManager';
import AttendanceManager from './components/AttendanceManager';
import DiscussionForum from './components/DiscussionForum';

// --- INITIAL SEED DATA FOR OFFLINE FALLBACK ---
const INITIAL_COURSES = [
  { id: 'cosc_301', code: 'COSC 301', name: 'Software Engineering', semester: 'First Semester', department: 'Computer Science', lecturerId: 'lecturer_bello', lecturer_id: 'lecturer_bello' },
  { id: 'cosc_305', code: 'COSC 305', name: 'Database Systems Design', semester: 'First Semester', department: 'Computer Science', lecturerId: 'lecturer_bello', lecturer_id: 'lecturer_bello' }
];

const INITIAL_USERS = [
  { id: 'admin_fud', name: 'System Administrator', email: 'admin@fud.edu.ng', role: 'admin', avatar: 'AD', password: 'password123', is_first_login: false },
  { id: 'lecturer_bello', name: 'Dr. Bello', email: 'bello@fud.edu.ng', role: 'lecturer', avatar: 'DB', password: 'password123', is_first_login: false },
  { id: 'student_aliyu', name: 'Aliyu Ibrahim', email: 'FUD/CSC/22/1001', role: 'student', avatar: 'AI', password: 'password123', is_first_login: false },
  { id: 'student_fatima', name: 'Fatima Abubakar', email: 'FUD/CSC/22/1002', role: 'student', avatar: 'FA', password: 'password123', is_first_login: false },
  { id: 'student_chidi', name: 'Chidi Okafor', email: 'FUD/CSC/22/1003', role: 'student', avatar: 'CO', password: 'password123', is_first_login: false }
];

const INITIAL_GROUPS = [
  { id: 'group_alpha', name: 'Group Alpha', courseId: 'cosc_301', leaderId: 'student_aliyu', memberIds: ['student_aliyu', 'student_fatima'] },
  { id: 'group_beta', name: 'Group Beta', courseId: 'cosc_301', leaderId: 'student_chidi', memberIds: ['student_chidi'] }
];

const INITIAL_QUIZZES = [
  {
    id: 'quiz_seed_1',
    courseId: 'cosc_301',
    title: 'Software Development Methodologies',
    description: 'Covers agile methodologies, scrum practices, waterfall models, and spiral lifecycle development.',
    timeLimit: 5,
    questions: [
      {
        id: 'q1',
        text: 'Which methodology is characterized by iterative cycles called Sprints?',
        type: 'mcq',
        options: ['Waterfall', 'Scrum / Agile', 'V-Model', 'Spiral Model'],
        correctOptionIndex: 1
      },
      {
        id: 'q2',
        text: 'The Waterfall model is highly adaptive and suitable for requirements that change rapidly.',
        type: 'tf',
        options: ['True', 'False'],
        correctOptionIndex: 1
      }
    ]
  }
];

const INITIAL_ASSIGNMENTS = [
  {
    id: 'assign_seed_1',
    courseId: 'cosc_305',
    title: 'Entity Relationship Diagram (ERD)',
    description: 'Design a comprehensive ERD diagram representing an online university registry. Detail attributes, primary keys, and relationships.',
    maxScore: 100,
    dueDate: '2026-06-01',
    isGroup: false
  },
  {
    id: 'assign_seed_2',
    courseId: 'cosc_301',
    title: 'Software Requirement Specifications (SRS)',
    description: 'In your assigned student groups, write an IEEE Standard 830 compliant SRS document for an automated student clinic reservation portal.',
    maxScore: 100,
    dueDate: '2026-06-15',
    isGroup: true
  }
];

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub_seed_1',
    taskId: 'quiz_seed_1',
    studentId: 'student_chidi',
    type: 'quiz',
    score: 100,
    maxScore: 100,
    submittedAt: '2026-05-20'
  }
];

const INITIAL_ENROLLMENTS = [
  { id: 'e1', student_id: 'student_aliyu', studentId: 'student_aliyu', course_id: 'cosc_301', courseId: 'cosc_301' },
  { id: 'e2', student_id: 'student_fatima', studentId: 'student_fatima', course_id: 'cosc_301', courseId: 'cosc_301' },
  { id: 'e3', student_id: 'student_chidi', studentId: 'student_chidi', course_id: 'cosc_301', courseId: 'cosc_301' },
  { id: 'e4', student_id: 'student_aliyu', studentId: 'student_aliyu', course_id: 'cosc_305', courseId: 'cosc_305' },
  { id: 'e5', student_id: 'student_fatima', studentId: 'student_fatima', course_id: 'cosc_305', courseId: 'cosc_305' }
];

export default function App() {
  const loadOffline = (key, seed) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : seed;
  };

  const formatDbError = (context, error) => {
    if (!error) return '';
    const message = error.message || String(error);
    if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror') || message.toLowerCase().includes('typeerror')) {
      return `⚠️ Network Connection Error: Could not connect to the Supabase database.
      
Possible Solutions:
1. Check your internet connection.
2. Disable any ad-blockers, tracker blockers, or VPNs/Shields on this site (e.g. Brave Shields, uBlock Origin) which may block supabase.co endpoints.
3. Reload the portal and try again.`;
    }
    return `${context}: ${message}`;
  };

  // State caches
  const [courses, setCourses] = useState(() => loadOffline('fud_assessment_courses', INITIAL_COURSES));
  const [users, setUsers] = useState(() => loadOffline('fud_assessment_users', INITIAL_USERS));
  const [quizzes, setQuizzes] = useState(() => loadOffline('fud_assessment_quizzes', INITIAL_QUIZZES));
  const [assignments, setAssignments] = useState(() => loadOffline('fud_assessment_assignments', INITIAL_ASSIGNMENTS));
  const [submissions, setSubmissions] = useState(() => loadOffline('fud_assessment_submissions', INITIAL_SUBMISSIONS));
  const [groups, setGroups] = useState(() => loadOffline('fud_assessment_groups', INITIAL_GROUPS));
  const [materials, setMaterials] = useState(() => loadOffline('fud_assessment_materials', []));
  const [announcements, setAnnouncements] = useState(() => loadOffline('fud_assessment_announcements', []));
  const [virtualClasses, setVirtualClasses] = useState(() => loadOffline('fud_assessment_virtual_classes', []));
  const [attendanceSessions, setAttendanceSessions] = useState(() => loadOffline('fud_assessment_attendance_sessions', []));
  const [attendanceRecords, setAttendanceRecords] = useState(() => loadOffline('fud_assessment_attendance_records', []));
  const [enrollments, setEnrollments] = useState(() => loadOffline('fud_assessment_enrollments', INITIAL_ENROLLMENTS));
  const [discussionPosts, setDiscussionPosts] = useState(() => loadOffline('fud_assessment_discussion_posts', []));
  const [discussionReplies, setDiscussionReplies] = useState(() => loadOffline('fud_assessment_discussion_replies', []));
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(() => loadOffline('fud_dismissed_anns', []));
  const [dismissedDiscussions, setDismissedDiscussions] = useState(() => loadOffline('fud_dismissed_discussions', []));
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('fud_assessment_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fud_assessment_user_obj');
    return saved ? JSON.parse(saved) : null;
  });

  // State controls
  const [currentRole, setCurrentRole] = useState(() => {
    const savedUser = localStorage.getItem('fud_assessment_user_obj');
    return savedUser ? JSON.parse(savedUser).id : 'lecturer_bello';
  });

  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard, quizzes, assignments, gradebook, groups
  const [selectedCourseId, setSelectedCourseId] = useState(INITIAL_COURSES[0].id);
  const [toast, setToast] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- 1. OFFLINE STORAGE SYNC EFFECTS ---
  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_courses', JSON.stringify(courses));
    localStorage.setItem('fud_assessment_users', JSON.stringify(users));
  }, [courses, users]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_virtual_classes', JSON.stringify(virtualClasses));
  }, [virtualClasses]);

  useEffect(() => {
    localStorage.setItem('fud_dismissed_anns', JSON.stringify(dismissedAnnouncements));
  }, [dismissedAnnouncements]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_attendance_sessions', JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_discussion_posts', JSON.stringify(discussionPosts));
  }, [discussionPosts]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('fud_assessment_discussion_replies', JSON.stringify(discussionReplies));
  }, [discussionReplies]);

  useEffect(() => {
    localStorage.setItem('fud_dismissed_discussions', JSON.stringify(dismissedDiscussions));
  }, [dismissedDiscussions]);

  // Auth local caching
  useEffect(() => {
    localStorage.setItem('fud_assessment_auth', isAuthenticated);
    if (currentUser) {
      localStorage.setItem('fud_assessment_user_obj', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fud_assessment_user_obj');
    }
  }, [isAuthenticated, currentUser]);

  // --- 2. SUPABASE BACKEND FETCH EFFECTS ---
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchAllData = async () => {
      try {
        setDbError(null);

        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
        if (coursesError) throw coursesError;
        if (coursesData) {
          const mappedCourses = coursesData.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            semester: c.semester,
            department: c.department,
            lecturerId: c.lecturer_id,
            lecturer_id: c.lecturer_id
          }));
          setCourses(mappedCourses);
        }

        // Fetch users
        const { data: usersData, error: usersError } = await supabase.from('users').select('*');
        if (usersError) throw usersError;
        if (usersData) {
          const mappedUsers = usersData.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar,
            password: u.password,
            is_first_login: u.is_first_login,
            isFirstLogin: u.is_first_login,
            department: u.department,
            level: u.level
          }));
          setUsers(mappedUsers);
        }

        // Fetch quizzes
        const { data: quizzesData, error: quizzesError } = await supabase.from('quizzes').select('*');
        if (quizzesError) throw quizzesError;
        if (quizzesData) {
          const mapped = quizzesData.map(q => ({
            id: q.id,
            courseId: q.course_id,
            title: q.title,
            description: q.description,
            timeLimit: q.time_limit !== undefined ? q.time_limit : 10,
            time_limit: q.time_limit !== undefined ? q.time_limit : 10,
            questions: q.questions
          }));
          setQuizzes(mapped);
        }

        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase.from('assignments').select('*');
        if (assignmentsError) throw assignmentsError;
        if (assignmentsData) {
          const mapped = assignmentsData.map(a => ({
            id: a.id,
            courseId: a.course_id,
            title: a.title,
            description: a.description,
            maxScore: a.max_score,
            dueDate: a.due_date,
            isGroup: a.is_group
          }));
          setAssignments(mapped);
        }

        // Fetch submissions and map to camelCase structure
        const { data: submissionsData, error: submissionsError } = await supabase.from('submissions').select('*');
        if (submissionsError) throw submissionsError;
        if (submissionsData) {
          const mapped = submissionsData.map(s => ({
            id: s.id,
            taskId: s.task_id,
            studentId: s.student_id,
            type: s.type,
            isGroupSubmission: s.is_group_submission,
            groupId: s.group_id,
            groupName: s.group_name,
            attachmentName: s.attachment_name,
            submissionText: s.submission_text,
            score: s.score,
            feedback: s.feedback,
            isReleased: s.is_released,
            is_released: s.is_released,
            submittedAt: s.submitted_at
          }));
          setSubmissions(mapped);
        }

        // Fetch groups and members list from junction
        const { data: groupsData, error: groupsError } = await supabase.from('groups').select('*');
        if (groupsError) throw groupsError;
        const { data: membersData, error: membersError } = await supabase.from('group_members').select('*');
        if (membersError) throw membersError;

        if (groupsData && membersData) {
          const assembledGroups = groupsData.map(g => {
            const memberIds = membersData
              .filter(m => m.group_id === g.id)
              .map(m => m.student_id);
            return {
              id: g.id,
              name: g.name,
              courseId: g.course_id,
              leaderId: g.leader_id,
              memberIds
            };
          });
          setGroups(assembledGroups);
        }

        // Fetch materials
        const { data: materialsData, error: materialsError } = await supabase.from('lecture_materials').select('*');
        if (materialsError) throw materialsError;
        if (materialsData) setMaterials(materialsData);

        // Fetch announcements
        const { data: announcementsData, error: announcementsError } = await supabase.from('announcements').select('*');
        if (announcementsError) throw announcementsError;
        if (announcementsData) setAnnouncements(announcementsData);

        // Fetch virtual classes
        const { data: virtualData, error: virtualError } = await supabase.from('virtual_classes').select('*');
        if (virtualError) throw virtualError;
        if (virtualData) setVirtualClasses(virtualData);

        // Fetch attendance sessions
        const { data: sessionsData, error: sessionsError } = await supabase.from('attendance_sessions').select('*');
        if (sessionsError) throw sessionsError;
        if (sessionsData) setAttendanceSessions(sessionsData);

        // Fetch attendance records
        const { data: recordsData, error: recordsError } = await supabase.from('attendance_records').select('*');
        if (recordsError) throw recordsError;
        if (recordsData) setAttendanceRecords(recordsData);

        // Fetch enrollments
        const { data: enrollmentsData, error: enrollmentsError } = await supabase.from('enrollments').select('*');
        if (enrollmentsError) {
          console.warn('Enrollments table could not be fetched:', enrollmentsError.message);
        } else if (enrollmentsData) {
          const mappedEnrollments = enrollmentsData.map(e => ({
            id: e.id,
            student_id: e.student_id,
            studentId: e.student_id,
            course_id: e.course_id,
            courseId: e.course_id,
            enrolled_at: e.enrolled_at,
            enrolledAt: e.enrolled_at
          }));
          setEnrollments(mappedEnrollments);
        }

        // Fetch discussion posts
        const { data: postsData, error: postsError } = await supabase.from('discussion_posts').select('*');
        if (postsError) {
          console.warn('discussion_posts table could not be fetched:', postsError.message);
        } else if (postsData) {
          const mappedPosts = postsData.map(p => ({
            id: p.id,
            courseId: p.course_id,
            course_id: p.course_id,
            userId: p.user_id,
            user_id: p.user_id,
            content: p.content,
            createdAt: p.created_at,
            created_at: p.created_at
          }));
          setDiscussionPosts(mappedPosts);
        }

        // Fetch discussion replies
        const { data: repliesData, error: repliesError } = await supabase.from('discussion_replies').select('*');
        if (repliesError) {
          console.warn('discussion_replies table could not be fetched:', repliesError.message);
        } else if (repliesData) {
          const mappedReplies = repliesData.map(r => ({
            id: r.id,
            postId: r.post_id,
            post_id: r.post_id,
            userId: r.user_id,
            user_id: r.user_id,
            content: r.content,
            createdAt: r.created_at,
            created_at: r.created_at
          }));
          setDiscussionReplies(mappedReplies);
        }
      } catch (err) {
        console.error('Error fetching Supabase data, utilizing offline caches instead:', err);
        setDbError(err.message || JSON.stringify(err));
      }
    };

    fetchAllData();
  }, [isAuthenticated]);

  // Show status toasts
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Login event
  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    setCurrentRole(userObj.id);
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
    triggerToast(`Welcome back, ${userObj.name}!`);
  };

  // Logout event
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    triggerToast(`Successfully signed out.`);
  };

  // Switch simulation role dropdown
  const handleRoleChange = (e) => {
    const newRoleId = e.target.value;
    const match = users.find(u => u.id === newRoleId);
    if (match) {
      setCurrentUser(match);
      setCurrentRole(newRoleId);
      setCurrentTab('dashboard');
      triggerToast(`Switched simulation role to ${match.name}!`);
    }
  };

  // Find active user
  const activeUser = currentUser || users.find(u => u.id === currentRole) || users[0] || { id: 'unknown', role: 'student', name: 'User', avatar: 'U' };
  const isLecturer = activeUser?.role === 'lecturer';

  const lecturerCourses = courses.filter(c => c.lecturerId === activeUser?.id || c.lecturer_id === activeUser?.id);
  const studentEnrolledCourses = courses.filter(c => 
    enrollments.some(e => (e.student_id === activeUser?.id || e.studentId === activeUser?.id) && (e.course_id === c.id || e.courseId === c.id))
  );
  const visibleCourses = isLecturer ? lecturerCourses : studentEnrolledCourses;

  // Sync selectedCourseId for lecturers and students
  useEffect(() => {
    if (visibleCourses.length > 0) {
      const hasSelected = visibleCourses.some(c => c.id === selectedCourseId);
      if (!hasSelected) {
        setSelectedCourseId(visibleCourses[0].id);
      }
    }
  }, [currentUser, courses, enrollments, visibleCourses]);

  // --- DYNAMICALLY RESOLVE GROUP MEMBERSHIP FOR GENERAL COMPATIBILITY ---
  const enrichedUsers = users.map(u => {
    if (u.role === 'student') {
      const studentGroup = groups.find(g => g.memberIds.includes(u.id) && g.courseId === selectedCourseId);
      return {
        ...u,
        groupId: studentGroup ? studentGroup.id : null,
        groupName: studentGroup ? studentGroup.name : 'No Group'
      };
    }
    return u;
  });

  const activeUserEnriched = (activeUser && enrichedUsers.find(u => u.id === activeUser.id)) || enrichedUsers[0] || { id: 'unknown', role: 'student', name: 'User', avatar: 'U' };

  // --- ACTIONS FOR STATE ENGINE (SUPABASE POSTGRES WRITER) ---
  
  // 1. Add Quiz (Lecturer)
  const handleAddQuiz = async (newQuiz) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('quizzes').insert([{
        id: newQuiz.id,
        course_id: newQuiz.courseId,
        title: newQuiz.title,
        description: newQuiz.description,
        time_limit: newQuiz.timeLimit,
        questions: newQuiz.questions
      }]);
      if (error) {
        alert(formatDbError("Supabase SQL Write Error", error));
        return;
      }
    }
    setQuizzes([...quizzes, newQuiz]);
    triggerToast(`Quiz "${newQuiz.title}" published successfully!`);
  };

  // 2. Add Assignment (Lecturer)
  const handleAddAssignment = async (newAssign) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('assignments').insert([{
        id: newAssign.id,
        course_id: newAssign.courseId,
        title: newAssign.title,
        description: newAssign.description,
        max_score: newAssign.maxScore,
        due_date: newAssign.dueDate,
        is_group: newAssign.isGroup
      }]);
      if (error) {
        alert(formatDbError("Supabase SQL Write Error", error));
        return;
      }
    }
    setAssignments([...assignments, newAssign]);
    triggerToast(`Assignment "${newAssign.title}" published successfully!`);
  };

  const handleUpdateAssignment = async (updatedAssign) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('assignments')
        .update({
          course_id: updatedAssign.courseId,
          title: updatedAssign.title,
          description: updatedAssign.description,
          max_score: updatedAssign.maxScore,
          due_date: updatedAssign.dueDate,
          is_group: updatedAssign.isGroup
        })
        .eq('id', updatedAssign.id);
      if (error) {
        alert(formatDbError("Supabase SQL Update Error", error));
        return;
      }
    }
    setAssignments(assignments.map(a => a.id === updatedAssign.id ? updatedAssign : a));
    triggerToast(`Assignment "${updatedAssign.title}" updated successfully!`);
  };

  // 3. Submit Quiz (Student)
  const handleSubmitQuiz = async (quizId, scorePercent) => {
    const newSubId = 'sub_' + Date.now().toString();
    const subAt = new Date().toLocaleDateString();

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('submissions').insert([{
        id: newSubId,
        task_id: quizId,
        student_id: activeUser.id,
        type: 'quiz',
        is_group_submission: false,
        is_released: false,
        score: scorePercent,
        submitted_at: subAt
      }]);
      if (error) {
        alert("Supabase SQL Write Error: " + error.message);
        return;
      }
    }

    const localSub = {
      id: newSubId,
      taskId: quizId,
      studentId: activeUser.id,
      type: 'quiz',
      isGroupSubmission: false,
      isReleased: false,
      is_released: false,
      score: scorePercent,
      maxScore: 100,
      submittedAt: subAt
    };

    setSubmissions([...submissions, localSub]);
    triggerToast(`Quiz submitted successfully!`);
  };

  const handleReleaseQuizScore = async (subId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('submissions')
        .update({ is_released: true })
        .eq('id', subId);
      if (error) {
        alert("Supabase Update Error: " + error.message);
        return;
      }
    }
    setSubmissions(submissions.map(s => s.id === subId ? { ...s, isReleased: true, is_released: true } : s));
    triggerToast("Quiz score released successfully!");
  };

  const handleReleaseAllQuizScores = async (quizId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('submissions')
        .update({ is_released: true })
        .eq('task_id', quizId)
        .eq('type', 'quiz');
      if (error) {
        alert("Supabase Update Error: " + error.message);
        return;
      }
    }
    setSubmissions(submissions.map(s => (s.taskId === quizId && s.type === 'quiz') ? { ...s, isReleased: true, is_released: true } : s));
    triggerToast("All quiz scores released successfully!");
  };

  // 4. Submit Assignment (Student)
  const handleSubmitAssignment = async (assignId, isGroup, groupId, groupName, file, notes, fileObject) => {
    const isGroupSubmissionBool = !!isGroup;
    const existingIndex = submissions.findIndex(s => 
      s.taskId === assignId && 
      (isGroupSubmissionBool ? ((s.isGroupSubmission || s.is_group_submission) && s.groupId === groupId) : (s.studentId === activeUser.id))
    );

    const subId = existingIndex >= 0 ? submissions[existingIndex].id : 'sub_' + Date.now().toString();
    const subAt = new Date().toLocaleDateString();

    if (isSupabaseConfigured) {
      const sqlData = {
        id: subId,
        task_id: assignId,
        student_id: activeUser.id,
        type: 'assignment',
        is_group_submission: isGroupSubmissionBool,
        group_id: isGroupSubmissionBool ? groupId : null,
        group_name: isGroupSubmissionBool ? groupName : null,
        attachment_name: file,
        submission_text: notes,
        submitted_at: subAt
      };

      if (existingIndex >= 0) {
        const { error } = await supabase
          .from('submissions')
          .update({
            attachment_name: file,
            submission_text: notes,
            submitted_at: subAt
          })
          .eq('id', subId);
        if (error) {
          alert("Supabase Update Error: " + error.message);
          return;
        }
      } else {
        const { error } = await supabase.from('submissions').insert([sqlData]);
        if (error) {
          alert("Supabase Insert Error: " + error.message);
          return;
        }
      }

      // Upload file to Supabase storage bucket 'submissions' if fileObject is present
      if (fileObject) {
        try {
          const fileExt = fileObject.name.split('.').pop();
          const storagePath = `${subId}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('submissions')
            .upload(storagePath, fileObject, { upsert: true });
          
          if (uploadError) {
            console.warn("Supabase Storage Upload: " + uploadError.message + ". Database record created, but verify a public bucket named 'submissions' exists in Supabase Storage settings.");
          }
        } catch (err) {
          console.warn("Supabase Storage Upload Exception:", err);
        }
      }
    }

    const localData = {
      id: subId,
      taskId: assignId,
      studentId: activeUser.id,
      type: 'assignment',
      isGroupSubmission: isGroupSubmissionBool,
      groupId: isGroupSubmissionBool ? groupId : null,
      groupName: isGroupSubmissionBool ? groupName : null,
      attachmentName: file,
      submissionText: notes,
      maxScore: assignments.find(a => a.id === assignId)?.maxScore || assignments.find(a => a.id === assignId)?.max_score || 100,
      score: existingIndex >= 0 ? submissions[existingIndex].score : null,
      feedback: existingIndex >= 0 ? submissions[existingIndex].feedback : null,
      submittedAt: subAt
    };

    if (existingIndex >= 0) {
      const updated = [...submissions];
      updated[existingIndex] = localData;
      setSubmissions(updated);
      triggerToast(`Assignment submission updated!`);
    } else {
      setSubmissions([...submissions, localData]);
      triggerToast(`Assignment submitted successfully!`);
    }
  };

  // 5. Grade Submission (Lecturer)
  const handleGradeSubmission = async (subId, score, feedback) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('submissions')
        .update({ score, feedback })
        .eq('id', subId);

      if (error) {
        alert("Supabase Grading Error: " + error.message);
        return;
      }
    }

    setSubmissions(submissions.map(sub => {
      if (sub.id === subId) {
        return { ...sub, score, feedback };
      }
      return sub;
    }));
    const subToGrade = submissions.find(s => s.id === subId);
    triggerToast(`Grade recorded for ${subToGrade?.isGroupSubmission ? subToGrade.groupName : 'student'}!`);
  };

  // 6. Group CRUD Handlers (Lecturer)
  const handleAddGroup = async (newGroup) => {
    if (isSupabaseConfigured) {
      const { error: groupError } = await supabase.from('groups').insert([{
        id: newGroup.id,
        name: newGroup.name,
        course_id: newGroup.courseId,
        leader_id: newGroup.leaderId
      }]);
      if (groupError) {
        alert("Group Save Error: " + groupError.message);
        return;
      }

      const memberRecords = newGroup.memberIds.map(studentId => ({
        group_id: newGroup.id,
        student_id: studentId
      }));
      const { error: memberError } = await supabase.from('group_members').insert(memberRecords);
      if (memberError) {
        alert("Member Sync Error: " + memberError.message);
        return;
      }
    }

    setGroups([...groups, newGroup]);
    triggerToast(`Group Circle "${newGroup.name}" created!`);
  };

  const handleUpdateGroup = async (updatedGroup) => {
    if (isSupabaseConfigured) {
      const { error: groupError } = await supabase
        .from('groups')
        .update({
          name: updatedGroup.name,
          leader_id: updatedGroup.leaderId
        })
        .eq('id', updatedGroup.id);

      if (groupError) {
        alert("Group Details Update Error: " + groupError.message);
        return;
      }

      await supabase.from('group_members').delete().eq('group_id', updatedGroup.id);
      
      const memberRecords = updatedGroup.memberIds.map(studentId => ({
        group_id: updatedGroup.id,
        student_id: studentId
      }));
      const { error: memberError } = await supabase.from('group_members').insert(memberRecords);
      if (memberError) {
        alert("Member Roster Sync Error: " + memberError.message);
        return;
      }
    }

    setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    triggerToast(`Group details updated!`);
  };

  const handleDeleteGroup = async (groupId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      if (error) {
        alert("Group Delete Error: " + error.message);
        return;
      }
    }

    setGroups(groups.filter(g => g.id !== groupId));
    triggerToast(`Group circle removed.`);
  };

  const handleAddCourse = async (newCourse) => {
    if (isSupabaseConfigured) {
      const dbCourse = {
        id: newCourse.id,
        code: newCourse.code,
        name: newCourse.name,
        semester: newCourse.semester,
        department: newCourse.department,
        lecturer_id: newCourse.lecturer_id || newCourse.lecturerId
      };
      const { error } = await supabase.from('courses').insert([dbCourse]);
      if (error) {
        alert("Supabase Add Course Error: " + error.message);
        return;
      }
    }
    setCourses([...courses, newCourse]);
    triggerToast(`Course "${newCourse.code}" added successfully!`);
  };

  const handleDeleteCourse = async (courseId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) {
        alert("Supabase Delete Course Error: " + error.message);
        return;
      }
    }
    setCourses(courses.filter(c => c.id !== courseId));
    triggerToast(`Course removed.`);
  };

  const handleAddUser = async (newUser) => {
    if (isSupabaseConfigured) {
      const dbUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        password: newUser.password,
        is_first_login: newUser.is_first_login
      };
      const { error } = await supabase.from('users').insert([dbUser]);
      if (error) {
        alert("Supabase Add User Error: " + error.message);
        return;
      }
    }
    setUsers([...users, newUser]);
    triggerToast(`User "${newUser.name}" added successfully!`);
  };

  const handleDeleteUser = async (userId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) {
        alert("Supabase Delete User Error: " + error.message);
        return;
      }
    }
    setUsers(users.filter(u => u.id !== userId));
    triggerToast(`User account removed.`);
  };

  const handleImportStudents = async (newStudents, targetCourseId) => {
    const newEnrollments = newStudents.map(student => ({
      id: `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      student_id: student.id,
      studentId: student.id,
      course_id: targetCourseId,
      courseId: targetCourseId,
      enrolled_at: new Date().toISOString(),
      enrolledAt: new Date().toISOString()
    }));

    if (isSupabaseConfigured) {
      const { error: usersError } = await supabase.from('users').insert(newStudents);
      if (usersError) {
        throw new Error(usersError.message);
      }
      
      const { error: enrollError } = await supabase.from('enrollments').insert(newEnrollments.map(e => ({
        id: e.id,
        student_id: e.student_id,
        course_id: e.course_id
      })));
      if (enrollError) {
        console.error("Enrollment insert warning:", enrollError.message);
      }
    }
    
    setUsers([...users, ...newStudents]);
    setEnrollments([...enrollments, ...newEnrollments]);
    triggerToast(`Imported ${newStudents.length} students and enrolled them successfully!`);
  };

  const handleEnrollStudent = async (studentId, courseId) => {
    const newEnrollment = {
      id: `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      student_id: studentId,
      studentId: studentId,
      course_id: courseId,
      courseId: courseId,
      enrolled_at: new Date().toISOString(),
      enrolledAt: new Date().toISOString()
    };
    
    if (isSupabaseConfigured) {
      const dbRecord = {
        id: newEnrollment.id,
        student_id: newEnrollment.student_id,
        course_id: newEnrollment.course_id
      };
      const { error } = await supabase.from('enrollments').insert([dbRecord]);
      if (error) {
        alert("Supabase Enrollment Error: " + error.message);
        return;
      }
    }
    
    setEnrollments([...enrollments, newEnrollment]);
    triggerToast("Enrolled in course successfully!");
  };

  const handleChangePassword = async (userId, newPassword) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('users')
        .update({
          password: newPassword,
          is_first_login: false
        })
        .eq('id', userId);
      if (error) {
        throw new Error("Supabase Password Update Error: " + error.message);
      }
    }
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, password: newPassword, is_first_login: false, isFirstLogin: false } 
        : u
    ));
    triggerToast('Password changed successfully!');
  };

  const handleAddMaterial = async (newMaterial) => {
    if (isSupabaseConfigured) {
      const dbMaterial = {
        id: newMaterial.id,
        course_id: newMaterial.course_id,
        title: newMaterial.title,
        type: newMaterial.type,
        url: newMaterial.url,
        description: newMaterial.description
      };
      const { error } = await supabase.from('lecture_materials').insert([dbMaterial]);
      if (error) {
        alert("Supabase Add Material Error: " + error.message);
        return;
      }
    }
    setMaterials([...materials, newMaterial]);
    triggerToast("Material published successfully!");
  };

  const handleDeleteMaterial = async (materialId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('lecture_materials').delete().eq('id', materialId);
      if (error) {
        alert("Supabase Delete Material Error: " + error.message);
        return;
      }
    }
    setMaterials(materials.filter(m => m.id !== materialId));
    triggerToast("Material deleted.");
  };

  const handleAddAnnouncement = async (newAnnouncement) => {
    if (isSupabaseConfigured) {
      const dbAnn = {
        id: newAnnouncement.id,
        course_id: newAnnouncement.course_id,
        title: newAnnouncement.title,
        content: newAnnouncement.content
      };
      const { error } = await supabase.from('announcements').insert([dbAnn]);
      if (error) {
        alert(formatDbError("Supabase Add Announcement Error", error));
        return;
      }
    }
    setAnnouncements([...announcements, newAnnouncement]);
    triggerToast("Announcement posted successfully!");
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('announcements').delete().eq('id', annId);
      if (error) {
        alert(formatDbError("Supabase Delete Announcement Error", error));
        return;
      }
    }
    setAnnouncements(announcements.filter(a => a.id !== annId));
    triggerToast("Announcement removed.");
  };

  const handleAddDiscussionPost = async (newPost) => {
    if (isSupabaseConfigured) {
      const dbRecord = {
        id: newPost.id,
        course_id: newPost.courseId,
        user_id: newPost.userId,
        content: newPost.content
      };
      const { error } = await supabase.from('discussion_posts').insert([dbRecord]);
      if (error) {
        let msg = `Supabase Add Post Error: ${error.message}`;
        if (error.message.includes('row-level security') || error.code === '42501') {
          msg += `\n\n💡 Action Required: Please run this in your Supabase SQL Editor to disable RLS:\nALTER TABLE discussion_posts DISABLE ROW LEVEL SECURITY;`;
        }
        alert(msg);
        return;
      }
    }
    setDiscussionPosts(prev => [...prev, newPost]);
    triggerToast("Discussion post shared!");
  };

  const handleDeleteDiscussionPost = async (postId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('discussion_posts').delete().eq('id', postId);
      if (error) {
        alert(`Supabase Delete Post Error: ${error.message}`);
        return;
      }
    }
    setDiscussionPosts(prev => prev.filter(p => p.id !== postId));
    setDiscussionReplies(prev => prev.filter(r => r.postId !== postId && r.post_id !== postId));
    triggerToast("Discussion thread deleted.");
  };

  const handleAddDiscussionReply = async (newReply) => {
    if (isSupabaseConfigured) {
      const dbRecord = {
        id: newReply.id,
        post_id: newReply.postId,
        user_id: newReply.userId,
        content: newReply.content
      };
      const { error } = await supabase.from('discussion_replies').insert([dbRecord]);
      if (error) {
        let msg = `Supabase Add Reply Error: ${error.message}`;
        if (error.message.includes('row-level security') || error.code === '42501') {
          msg += `\n\n💡 Action Required: Please run this in your Supabase SQL Editor to disable RLS:\nALTER TABLE discussion_replies DISABLE ROW LEVEL SECURITY;`;
        }
        alert(msg);
        return;
      }
    }
    setDiscussionReplies(prev => [...prev, newReply]);
    triggerToast("Comment added!");
  };

  const handleDeleteDiscussionReply = async (replyId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('discussion_replies').delete().eq('id', replyId);
      if (error) {
        alert(`Supabase Delete Reply Error: ${error.message}`);
        return;
      }
    }
    setDiscussionReplies(prev => prev.filter(r => r.id !== replyId));
    triggerToast("Comment removed.");
  };

  const handleAddVirtualClass = async (newClass) => {
    if (isSupabaseConfigured) {
      const dbClass = {
        id: newClass.id,
        course_id: newClass.course_id,
        title: newClass.title,
        meet_url: newClass.meet_url,
        class_date: newClass.class_date,
        class_time: newClass.class_time
      };
      const { error } = await supabase.from('virtual_classes').insert([dbClass]);
      if (error) {
        alert("Supabase Schedule Class Error: " + error.message);
        return;
      }
    }
    setVirtualClasses([...virtualClasses, newClass]);
    triggerToast("Virtual class scheduled!");
  };

  const handleDeleteVirtualClass = async (classId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('virtual_classes').delete().eq('id', classId);
      if (error) {
        alert("Supabase Cancel Class Error: " + error.message);
        return;
      }
    }
    setVirtualClasses(virtualClasses.filter(c => c.id !== classId));
    triggerToast("Virtual class cancelled.");
  };

  const handleAddAttendanceSession = async (newSession) => {
    if (isSupabaseConfigured) {
      const dbSession = {
        id: newSession.id,
        course_id: newSession.course_id,
        title: newSession.title,
        is_active: newSession.is_active
      };
      const { error } = await supabase.from('attendance_sessions').insert([dbSession]);
      if (error) {
        alert(formatDbError("Supabase Add Attendance Session Error", error));
        return;
      }
    }
    setAttendanceSessions([...attendanceSessions, newSession]);
    triggerToast("Attendance register initiated!");
  };

  const handleToggleAttendanceSession = async (sessionId, isActive) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('attendance_sessions')
        .update({ is_active: isActive })
        .eq('id', sessionId);
      if (error) {
        alert(formatDbError("Supabase Toggle Attendance Error", error));
        return;
      }
    }
    setAttendanceSessions(attendanceSessions.map(s => 
      s.id === sessionId ? { ...s, is_active: isActive, isActive } : s
    ));
    triggerToast(isActive ? "Attendance session opened." : "Attendance session closed.");
  };

  const handleDeleteAttendanceSession = async (sessionId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('attendance_sessions').delete().eq('id', sessionId);
      if (error) {
        alert(formatDbError("Supabase Delete Attendance Session Error", error));
        return;
      }
    }
    setAttendanceSessions(attendanceSessions.filter(s => s.id !== sessionId));
    setAttendanceRecords(attendanceRecords.filter(r => r.session_id !== sessionId && r.sessionId !== sessionId));
    triggerToast("Attendance session deleted.");
  };

  const handleMarkAttendance = async (newRecord) => {
    if (isSupabaseConfigured) {
      const dbRecord = {
        id: newRecord.id,
        session_id: newRecord.session_id,
        student_id: newRecord.student_id,
        student_name: newRecord.student_name,
        reg_no: newRecord.reg_no,
        gps_lat: newRecord.gps_lat,
        gps_lng: newRecord.gps_lng,
        ip_address: newRecord.ip_address || newRecord.ipAddress || null
      };
      const { error } = await supabase.from('attendance_records').insert([dbRecord]);
      if (error) {
        alert(formatDbError("Supabase Submit Attendance Error", error));
        return;
      }
    }
    setAttendanceRecords([...attendanceRecords, newRecord]);
    triggerToast("Attendance successfully checked in!");
  };

  // Gatekeeper: Render LoginPage if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <LoginPage users={users} onLogin={handleLoginSuccess} onChangePassword={handleChangePassword} dbError={dbError} />;
  }

  // Calculate student notification alert items
  const isStudent = currentUser && currentUser.role === 'student';
  const studentAnns = isStudent ? announcements.filter(a => visibleCourses.some(c => c.id === a.course_id || c.id === a.courseId)) : [];
  const unreadAnns = isStudent ? studentAnns.filter(a => !dismissedAnnouncements.includes(a.id)) : [];

  const activeSessions = isStudent ? attendanceSessions.filter(s => (s.is_active !== false && s.isActive !== false) && visibleCourses.some(c => c.id === s.course_id || c.id === s.courseId)) : [];
  const unmarkedSessions = isStudent ? activeSessions.filter(s => !attendanceRecords.some(r => (r.session_id === s.id || r.sessionId === s.id) && (r.student_id === currentUser.id || r.studentId === currentUser.id))) : [];

  const courseQuizzes = isStudent ? quizzes.filter(q => visibleCourses.some(c => c.id === q.courseId || c.id === q.course_id)) : [];
  const untakenQuizzes = isStudent ? courseQuizzes.filter(q => !submissions.some(sub => sub.taskId === q.id && sub.type === 'quiz' && (sub.studentId === currentUser.id || sub.student_id === currentUser.id))) : [];

  const courseAssigns = isStudent ? assignments.filter(a => visibleCourses.some(c => c.id === a.courseId || c.id === a.course_id)) : [];
  const unsubmittedAssigns = isStudent ? courseAssigns.filter(a => {
    const studentGroup = activeUserEnriched?.groupId;
    return !submissions.some(sub => {
      if (sub.taskId !== a.id || sub.type !== 'assignment') return false;
      if (sub.isGroupSubmission) return sub.groupId === studentGroup;
      return sub.studentId === currentUser.id;
    });
  }) : [];

  const studentDiscussions = isStudent ? discussionPosts.filter(p => visibleCourses.some(c => c.id === p.courseId || c.id === p.course_id)) : [];
  const unreadDiscussions = isStudent ? studentDiscussions.filter(p => p.userId !== currentUser.id && p.user_id !== currentUser.id && !dismissedDiscussions.includes(p.id)) : [];

  const notificationsList = [];

  unreadAnns.forEach(a => {
    notificationsList.push({
      id: a.id,
      type: 'announcement',
      title: 'New Announcement',
      text: a.title,
      tab: 'forum',
      icon: 'Megaphone',
      color: 'rgba(10, 92, 54, 0.08)',
      iconColor: 'var(--primary)',
      courseId: a.course_id || a.courseId
    });
  });

  unmarkedSessions.forEach(s => {
    notificationsList.push({
      id: s.id,
      type: 'attendance',
      title: 'Attendance Open',
      text: `Mark register for ${s.title}`,
      tab: 'attendance',
      icon: 'MapPin',
      color: 'rgba(234, 88, 12, 0.1)',
      iconColor: 'var(--color-warning)',
      courseId: s.course_id || s.courseId
    });
  });

  untakenQuizzes.forEach(q => {
    notificationsList.push({
      id: q.id,
      type: 'quiz',
      title: 'Pending Quiz',
      text: `Complete quiz: "${q.title}"`,
      tab: 'quizzes',
      icon: 'Award',
      color: 'rgba(22, 163, 74, 0.1)',
      iconColor: 'var(--primary)',
      courseId: q.courseId || q.course_id
    });
  });

  unsubmittedAssigns.forEach(a => {
    notificationsList.push({
      id: a.id,
      type: 'assignment',
      title: 'Pending Assignment',
      text: `Submit task: "${a.title}"`,
      tab: 'assignments',
      icon: 'FileText',
      color: 'rgba(59, 130, 246, 0.1)',
      iconColor: 'var(--color-info)',
      courseId: a.courseId || a.course_id
    });
  });

  unreadDiscussions.forEach(p => {
    const course = visibleCourses.find(c => c.id === p.courseId || c.id === p.course_id);
    notificationsList.push({
      id: p.id,
      type: 'discussion',
      title: 'New Discussion Post',
      text: `Discussion in ${course ? course.code : 'Course'}: "${p.content.substring(0, 30)}${p.content.length > 30 ? '...' : ''}"`,
      tab: 'discussion',
      icon: 'MessageSquare',
      color: 'rgba(59, 130, 246, 0.1)',
      iconColor: 'var(--color-info)',
      courseId: p.courseId || p.course_id
    });
  });

  const handleDismissAnnNotif = (annId) => {
    setDismissedAnnouncements([...dismissedAnnouncements, annId]);
  };

  const handleDismissDiscussionNotif = (postId) => {
    if (!dismissedDiscussions.includes(postId)) {
      setDismissedDiscussions([...dismissedDiscussions, postId]);
    }
  };

  // Admin Dashboard Workspace
  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard 
        courses={courses}
        users={users}
        onAddCourse={handleAddCourse}
        onDeleteCourse={handleDeleteCourse}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onSignOut={handleLogout}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Overlay (Mobile backdrop) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="portal-brand">
          <div className="portal-logo">F</div>
          <div className="portal-brand-text">
            <span className="portal-name">FUD System</span>
            <span className="portal-subtitle">Assessment Portal</span>
          </div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li>
              <a 
                className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('dashboard'); setSidebarOpen(false); }}
              >
                <LayoutDashboard className="nav-icon" />
                Dashboard
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${currentTab === 'groups' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('groups'); setSidebarOpen(false); }}
              >
                <Users className="nav-icon" />
                {isLecturer ? 'Group Circles' : 'My Group'}
              </a>
            </li>
            {isLecturer && (
              <li>
                <a 
                  className={`nav-item ${currentTab === 'my_courses' ? 'active' : ''}`}
                  onClick={() => { setCurrentTab('my_courses'); setSidebarOpen(false); }}
                >
                  <BookOpen className="nav-icon" />
                  My Courses
                </a>
              </li>
            )}
            {isLecturer && (
              <li>
                <a 
                  className={`nav-item ${currentTab === 'roster' ? 'active' : ''}`}
                  onClick={() => { setCurrentTab('roster'); setSidebarOpen(false); }}
                >
                  <Users className="nav-icon" />
                  Class Roster
                </a>
              </li>
            )}
            <li>
              <a 
                className={`nav-item ${currentTab === 'forum' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('forum'); setSidebarOpen(false); }}
              >
                <Megaphone className="nav-icon" />
                Announcements Forum
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${currentTab === 'discussion' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('discussion'); setSidebarOpen(false); }}
              >
                <MessageSquare className="nav-icon" />
                Discussion Forum
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${currentTab === 'materials' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('materials'); setSidebarOpen(false); }}
              >
                <Library className="nav-icon" />
                Lecture Materials
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${currentTab === 'quizzes' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('quizzes'); setSidebarOpen(false); }}
              >
                <Award className="nav-icon" />
                {isLecturer ? 'Quiz Manager' : 'Quizzes'}
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${currentTab === 'assignments' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('assignments'); setSidebarOpen(false); }}
              >
                <FileText className="nav-icon" />
                {isLecturer ? 'Assignment Editor' : 'Assignments'}
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${currentTab === 'gradebook' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('gradebook'); setSidebarOpen(false); }}
              >
                <BookOpen className="nav-icon" />
                {isLecturer ? 'Gradebook Roster' : 'My Grades'}
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${currentTab === 'virtual' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('virtual'); setSidebarOpen(false); }}
              >
                <Video className="nav-icon" />
                Virtual Class
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${currentTab === 'attendance' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('attendance'); setSidebarOpen(false); }}
              >
                <MapPin className="nav-icon" />
                {isLecturer ? 'Attendance Logs' : 'Mark Attendance'}
              </a>
            </li>
          </ul>
        </nav>

        {/* User Info Section at bottom with Sign Out */}
        <div className="user-panel">
          <div className="user-panel-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-avatar">
                {activeUserEnriched.avatar}
              </div>
              <div className="user-details">
                <span className="user-name">{activeUserEnriched.name}</span>
                <span className="user-role">{isLecturer ? 'Lecturer' : 'Student (FUD)'}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-on-sidebar)',
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Sign Out of Portal"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="sidebar-toggle" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle Menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="page-title" style={{ textTransform: 'capitalize' }}>
              {currentTab === 'groups' ? (isLecturer ? 'Group Roster' : 'My Group Circle') : currentTab}
            </h1>
          </div>

          {/* Student Notification Center Dropdown */}
          {isStudent && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-title)',
                  position: 'relative',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color var(--transition-fast)'
                }}
                className="btn-outline"
                title="Notifications"
              >
                <Bell size={22} />
                {notificationsList.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {notificationsList.length}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <>
                  {/* Click outside backdrop */}
                  <div 
                    onClick={() => setNotifDropdownOpen(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 99
                    }}
                  />
                  
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '45px',
                    width: '340px',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-title)' }}>
                        Notifications ({notificationsList.length})
                      </span>
                      {unreadAnns.length > 0 && (
                        <button 
                          onClick={() => {
                            setDismissedAnnouncements([...dismissedAnnouncements, ...unreadAnns.map(a => a.id)]);
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          Clear Announcements
                        </button>
                      )}
                    </div>

                    {/* Scrollable list */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {notificationsList.map(item => {
                        return (
                          <div 
                            key={item.id}
                            onClick={() => {
                              setCurrentTab(item.tab);
                              if (item.courseId) {
                                setSelectedCourseId(item.courseId);
                              }
                              if (item.type === 'discussion') {
                                handleDismissDiscussionNotif(item.id);
                              }
                              setNotifDropdownOpen(false);
                            }}
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid var(--border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              backgroundColor: 'transparent',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: item.color,
                                color: item.iconColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {item.icon === 'Megaphone' && <Megaphone size={16} />}
                                {item.icon === 'MapPin' && <MapPin size={16} />}
                                {item.icon === 'Award' && <Award size={16} />}
                                {item.icon === 'FileText' && <FileText size={16} />}
                                {item.icon === 'MessageSquare' && <MessageSquare size={16} />}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-title)' }}>
                                  {item.title}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                                  {item.text}
                                </span>
                              </div>
                            </div>

                            {(item.type === 'announcement' || item.type === 'discussion') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.type === 'announcement') {
                                    handleDismissAnnNotif(item.id);
                                  } else if (item.type === 'discussion') {
                                    handleDismissDiscussionNotif(item.id);
                                  }
                                }}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--text-muted)',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '50%'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {notificationsList.length === 0 && (
                        <div style={{
                          padding: '40px 20px',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem'
                        }}>
                          No new notifications. You are all caught up!
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* Content Body Router */}
        <div className="content-body">
          {/* Active Course View Bar */}
          {currentTab !== 'dashboard' && currentTab !== 'my_courses' && currentTab !== 'roster' && (
            <div className="card" style={{ 
              padding: '12px 20px', 
              marginBottom: '20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  Active Course: <span style={{ color: 'var(--primary)' }}>
                    {courses.find(c => c.id === selectedCourseId)?.code || 'General'} - {courses.find(c => c.id === selectedCourseId)?.name || 'General'}
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Switch Course View:</span>
                <select 
                  className="form-select" 
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  style={{ width: '180px', height: '32px', fontSize: '0.8rem', padding: '0 8px' }}
                >
                  {visibleCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.code}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentTab === 'dashboard' && (
            <Dashboard 
              currentRole={activeUser.id}
              users={enrichedUsers}
              courses={visibleCourses}
              quizzes={quizzes}
              assignments={assignments}
              submissions={submissions}
              attendanceSessions={attendanceSessions}
              attendanceRecords={attendanceRecords}
              announcements={announcements}
              setCurrentTab={setCurrentTab}
              setSelectedCourseId={setSelectedCourseId}
              allCourses={courses}
              enrolledCourseIds={studentEnrolledCourses.map(c => c.id)}
              onEnrollStudent={handleEnrollStudent}
            />
          )}

          {currentTab === 'groups' && (
            <GroupManager 
              currentRole={activeUser.id}
              users={users}
              courses={visibleCourses}
              groups={groups.filter(g => g.courseId === selectedCourseId || g.course_id === selectedCourseId)}
              onAddGroup={handleAddGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
              enrollments={enrollments}
            />
          )}

          {currentTab === 'quizzes' && (
            isLecturer ? (
              <QuizManager 
                courses={visibleCourses}
                quizzes={quizzes.filter(q => q.courseId === selectedCourseId || q.course_id === selectedCourseId)}
                submissions={submissions}
                users={enrichedUsers}
                onAddQuiz={handleAddQuiz}
                onReleaseQuizScore={handleReleaseQuizScore}
                onReleaseAllQuizScores={handleReleaseAllQuizScores}
                activeCourseId={selectedCourseId}
              />
            ) : (
              <QuizTaker 
                quizzes={quizzes.filter(q => q.courseId === selectedCourseId || q.course_id === selectedCourseId)}
                submissions={submissions}
                courses={courses}
                currentStudentId={activeUserEnriched.id}
                onSubmitQuiz={handleSubmitQuiz}
              />
            )
          )}

          {currentTab === 'assignments' && (
            isLecturer ? (
              <AssignmentManager 
                courses={visibleCourses}
                assignments={assignments.filter(a => a.courseId === selectedCourseId || a.course_id === selectedCourseId)}
                submissions={submissions}
                users={enrichedUsers}
                onAddAssignment={handleAddAssignment}
                onUpdateAssignment={handleUpdateAssignment}
                onGradeSubmission={handleGradeSubmission}
                activeCourseId={selectedCourseId}
              />
            ) : (
              <AssignmentSubmitter 
                assignments={assignments.filter(a => a.courseId === selectedCourseId || a.course_id === selectedCourseId)}
                submissions={submissions}
                courses={courses}
                users={enrichedUsers}
                currentStudentId={activeUserEnriched.id}
                onSubmitAssignment={handleSubmitAssignment}
              />
            )
          )}

          {currentTab === 'gradebook' && (
            <Gradebook 
              currentRole={activeUser.id}
              users={enrichedUsers}
              courses={visibleCourses}
              quizzes={quizzes}
              assignments={assignments}
              submissions={submissions}
              initialCourseId={selectedCourseId}
            />
          )}

          {currentTab === 'my_courses' && isLecturer && (
            <LecturerCourseManager 
              currentLecturerId={activeUser.id}
              courses={courses}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          )}

          {currentTab === 'roster' && isLecturer && (
            <ClassRosterManager 
              users={users} 
              courses={visibleCourses}
              onImportStudents={handleImportStudents} 
            />
          )}

          {currentTab === 'materials' && (
            <MaterialsManager 
              currentRole={activeUser.id}
              users={enrichedUsers}
              courses={visibleCourses}
              materials={materials.filter(m => m.course_id === selectedCourseId || m.courseId === selectedCourseId)}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              activeCourseId={selectedCourseId}
            />
          )}

          {currentTab === 'forum' && (
            <AnnouncementsForum 
              currentRole={activeUser.id}
              users={enrichedUsers}
              courses={visibleCourses}
              announcements={announcements.filter(a => a.course_id === selectedCourseId || a.courseId === selectedCourseId)}
              onAddAnnouncement={handleAddAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              activeCourseId={selectedCourseId}
            />
          )}

          {currentTab === 'discussion' && (
            <DiscussionForum 
              currentRole={activeUser.id}
              users={enrichedUsers}
              activeCourseId={selectedCourseId}
              courses={visibleCourses}
              discussionPosts={discussionPosts}
              discussionReplies={discussionReplies}
              onAddPost={handleAddDiscussionPost}
              onDeletePost={handleDeleteDiscussionPost}
              onAddReply={handleAddDiscussionReply}
              onDeleteReply={handleDeleteDiscussionReply}
            />
          )}

          {currentTab === 'virtual' && (
            <VirtualClassManager 
              currentRole={activeUser.id}
              users={enrichedUsers}
              courses={visibleCourses}
              virtualClasses={virtualClasses.filter(vc => vc.course_id === selectedCourseId || vc.courseId === selectedCourseId)}
              onAddVirtualClass={handleAddVirtualClass}
              onDeleteVirtualClass={handleDeleteVirtualClass}
              activeCourseId={selectedCourseId}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceManager 
              currentRole={activeUser.id}
              users={enrichedUsers}
              courses={visibleCourses}
              attendanceSessions={attendanceSessions.filter(s => s.course_id === selectedCourseId || s.courseId === selectedCourseId)}
              attendanceRecords={attendanceRecords}
              onAddAttendanceSession={handleAddAttendanceSession}
              onToggleAttendanceSession={handleToggleAttendanceSession}
              onDeleteAttendanceSession={handleDeleteAttendanceSession}
              onMarkAttendance={handleMarkAttendance}
              activeCourseId={selectedCourseId}
            />
          )}
        </div>
      </main>

      {/* Floating Status Toast Notifications */}
      {toast && (
        <div className="toast-msg">
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
