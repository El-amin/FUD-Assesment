import React, { useState } from 'react';
import { PlusCircle, MapPin, Activity, Clock, UserCheck, CheckCircle, XCircle, Calendar, ShieldAlert } from 'lucide-react';

export default function AttendanceManager({
  currentRole,
  users,
  courses,
  attendanceSessions,
  attendanceRecords,
  onAddAttendanceSession,
  onToggleAttendanceSession,
  onDeleteAttendanceSession,
  onMarkAttendance
}) {
  const user = users.find(u => u.id === currentRole) || users[0];
  const isLecturer = user.role === 'lecturer';

  // Lecturer Form & Selection States
  const [topic, setTopic] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [activeSessionIdForLogs, setActiveSessionIdForLogs] = useState(null);

  // Student Location Retrieval States
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [manualGpsInput, setManualGpsInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  // Start Session (Lecturer)
  const handleInitiateSession = (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please write a session topic or title.');
      return;
    }

    const newSession = {
      id: 'session_' + Date.now().toString(),
      course_id: selectedCourseId,
      courseId: selectedCourseId,
      title: topic.trim(),
      is_active: true,
      isActive: true,
      created_at: new Date().toISOString()
    };

    onAddAttendanceSession(newSession);
    setTopic('');
  };

  // Toggle active status
  const handleToggleActive = (sessionId, currentStatus) => {
    onToggleAttendanceSession(sessionId, !currentStatus);
  };

  // Export roster as CSV (opens in Excel)
  const handleExportCSV = (session, records) => {
    if (!session || records.length === 0) return;
    
    // Define headers
    const headers = ['Student Name', 'Reg Number', 'Check-in Timestamp', 'Latitude', 'Longitude', 'Device IP Address'];
    
    // Map records to CSV rows
    const rows = records.map(r => {
      const studentName = r.student_name || r.studentName || '';
      const regNo = r.reg_no || r.regNo || '';
      const timestamp = r.marked_at || r.markedAt || '';
      const lat = r.gps_lat || r.gpsLat || 'Bypassed';
      const lng = r.gps_lng || r.gpsLng || 'Bypassed';
      const ip = r.ip_address || r.ipAddress || 'Unknown';
      
      return [
        `"${studentName.replace(/"/g, '""')}"`,
        `"${regNo.replace(/"/g, '""')}"`,
        `"${timestamp}"`,
        `"${lat}"`,
        `"${lng}"`,
        `"${ip}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Filename formatting
    const safeTitle = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `Attendance_${safeTitle || 'roster'}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mark Attendance (Student)
  const handleMarkPresent = (session) => {
    setIsGettingLocation(true);
    setGpsError('');
    setManualGpsInput(false);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsGettingLocation(false);
      setManualGpsInput(true);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        submitAttendance(session.id, lat, lng);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let errorMsg = 'Failed to retrieve location. ';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg += 'Location permission denied by browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg += 'Location details are currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg += 'Location request timed out.';
        } else {
          errorMsg += error.message;
        }
        setGpsError(errorMsg);
        setIsGettingLocation(false);
        setManualGpsInput(true); // Open manual coordinates input as a fallback
      },
      options
    );
  };

  // Final submission execution
  const submitAttendance = async (sessionId, lat, lng) => {
    let clientIp = 'Unknown';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      clientIp = data.ip || 'Unknown';
    } catch (err) {
      console.warn('IP retrieval failed:', err);
    }

    const newRecord = {
      id: 'record_' + Date.now().toString(),
      session_id: sessionId,
      sessionId: sessionId,
      student_id: user.id,
      studentId: user.id,
      student_name: user.name,
      studentName: user.name,
      reg_no: user.email, // email contains registration number
      regNo: user.email,
      marked_at: new Date().toISOString(),
      markedAt: new Date().toISOString(),
      gps_lat: lat ? parseFloat(lat) : null,
      gpsLat: lat ? parseFloat(lat) : null,
      gps_lng: lng ? parseFloat(lng) : null,
      gpsLng: lng ? parseFloat(lng) : null,
      ip_address: clientIp,
      ipAddress: clientIp
    };

    onMarkAttendance(newRecord);
    setIsGettingLocation(false);
    setGpsError('');
    setManualGpsInput(false);
    alert(`Attendance marked present successfully! Verified IP: ${clientIp}`);
  };

  const handleManualSubmit = (e, sessionId) => {
    e.preventDefault();
    if (!manualLat || !manualLng) {
      alert('Please fill out coordinates or select Skip.');
      return;
    }
    submitAttendance(sessionId, manualLat, manualLng);
  };

  // Helper date formatter
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (err) {
      return isoString || 'Just now';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Introduction Banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(10, 92, 54, 0.03) 0%, rgba(223, 177, 25, 0.03) 100%)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <MapPin size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '6px' }}>
              GPS Location-Verified Attendance Register
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {isLecturer 
                ? 'Initiate digital attendance registers for your live classes. Monitor student attendance and cross-check physical presence with automatic GPS coordinate mapping.' 
                : 'Mark your presence during active lectures. Geolocation verification is required to confirm your presence in the classroom.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isLecturer ? '1fr 2.1fr' : '1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* ==================== LECTURER CONTROLS ==================== */}
        {isLecturer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Start attendance session */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--primary)' }}>
                <PlusCircle size={20} />
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Initiate Register</h3>
              </div>

              <form onSubmit={handleInitiateSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Associated Course</label>
                  <select 
                    className="form-select"
                    value={selectedCourseId}
                    onChange={e => setSelectedCourseId(e.target.value)}
                    required
                  >
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Session Topic / Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Week 4: Software Lifecycles"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Open Attendance Session
                </button>
              </form>
            </div>

            {/* List of active/closed sessions */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Activity size={18} style={{ color: 'var(--secondary)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>Session Logs History</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {attendanceSessions.filter(s => {
                  return courses.some(c => c.id === s.course_id || c.id === s.courseId);
                }).map(s => {
                  const course = courses.find(c => c.id === s.course_id || c.id === s.courseId);
                  const isActive = s.is_active !== false && s.isActive !== false;
                  
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => setActiveSessionIdForLogs(s.id)}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: activeSessionIdForLogs === s.id ? 'rgba(10, 92, 54, 0.04)' : 'var(--bg-app)',
                        borderColor: activeSessionIdForLogs === s.id ? 'var(--primary)' : 'var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>{course ? course.code : 'General'}</span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          backgroundColor: isActive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                          color: isActive ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                          {isActive ? 'Active' : 'Closed'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-title)' }}>
                        {s.title}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>{formatDate(s.created_at)}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(s.id, isActive);
                            }}
                            className="btn btn-outline"
                            style={{ padding: '2px 6px', height: '20px', fontSize: '0.65rem' }}
                          >
                            {isActive ? 'Close' : 'Open'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this session and all its records?')) {
                                onDeleteAttendanceSession(s.id);
                                if (activeSessionIdForLogs === s.id) setActiveSessionIdForLogs(null);
                              }
                            }}
                            className="btn btn-outline btn-danger"
                            style={{ padding: '2px 6px', height: '20px', fontSize: '0.65rem', color: 'var(--color-danger)', borderColor: 'rgba(220, 38, 38, 0.15)' }}
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {attendanceSessions.length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '20px' }}>
                    No registers opened yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* LECTURER RIGHT COLUMN: Student Logs for selected session */}
        {isLecturer && (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-title)' }}>
                  Roster Logs Roster Summary
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  {activeSessionIdForLogs 
                    ? `Viewing entries for: "${attendanceSessions.find(s => s.id === activeSessionIdForLogs)?.title}"`
                    : 'Select an attendance session from the left column to audit student check-in details.'}
                </p>
              </div>

              {activeSessionIdForLogs && (() => {
                const currentSession = attendanceSessions.find(s => s.id === activeSessionIdForLogs);
                const isSessionActive = currentSession ? (currentSession.is_active !== false && currentSession.isActive !== false) : false;
                const records = attendanceRecords.filter(r => r.session_id === activeSessionIdForLogs || r.sessionId === activeSessionIdForLogs);
                
                if (!isSessionActive && records.length > 0) {
                  return (
                    <button
                      onClick={() => handleExportCSV(currentSession, records)}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        height: '32px', 
                        backgroundColor: '#107c41', 
                        color: 'white',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      📥 Export to Excel
                    </button>
                  );
                }
                return null;
              })()}
            </div>

            {activeSessionIdForLogs ? (() => {
              const records = attendanceRecords.filter(r => r.session_id === activeSessionIdForLogs || r.sessionId === activeSessionIdForLogs);
              return (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Student Name</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Reg Number</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Timestamp</th>
                        <th style={{ textAlign: 'center', padding: '10px' }}>Location coordinates (GPS)</th>
                        <th style={{ textAlign: 'center', padding: '10px' }}>Logged IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.student_name || r.studentName}</td>
                          <td style={{ padding: '10px', fontSize: '0.85rem' }}>{r.reg_no || r.regNo}</td>
                          <td style={{ padding: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatDate(r.marked_at || r.markedAt)}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {((r.gps_lat || r.gpsLat) && (r.gps_lng || r.gpsLng)) ? (
                              <a 
                                href={`https://www.google.com/maps?q=${r.gps_lat || r.gpsLat},${r.gps_lng || r.gpsLng}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="badge badge-primary"
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  fontSize: '0.7rem', 
                                  cursor: 'pointer',
                                  textDecoration: 'none'
                                }}
                              >
                                <MapPin size={12} />
                                {parseFloat(r.gps_lat || r.gpsLat).toFixed(4)}, {parseFloat(r.gps_lng || r.gpsLng).toFixed(4)}
                              </a>
                            ) : (
                              <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '10px', 
                                fontSize: '0.7rem', 
                                backgroundColor: 'rgba(100, 116, 139, 0.1)', 
                                color: 'var(--text-muted)' 
                              }}>
                                Location Bypassed
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {r.ip_address || r.ipAddress || 'Unknown'}
                          </td>
                        </tr>
                      ))}

                      {records.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            No student has marked attendance for this session yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })() : (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                Please select a session to view logs.
              </div>
            )}
          </div>
        )}

        {/* ==================== STUDENT VIEW ==================== */}
        {!isLecturer && (() => {
          const visibleSessionList = attendanceSessions.filter(s => {
            const isActive = s.is_active !== false && s.isActive !== false;
            // Only show active sessions
            if (!isActive) return false;
            // Enrolled courses check
            return courses.some(c => c.id === s.course_id || c.id === s.courseId);
          });

          return (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Active Registers for Your Courses</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  If your lecturer has initiated attendance for your current class, click present. You must authorize geolocation requests to confirm presence.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {visibleSessionList.map(session => {
                  const course = courses.find(c => c.id === session.course_id || c.id === session.courseId);
                  
                  // Check if student has already marked attendance for this session
                  const alreadyMarked = attendanceRecords.some(r => 
                    (r.session_id === session.id || r.sessionId === session.id) && 
                    (r.student_id === user.id || r.studentId === user.id)
                  );

                  return (
                    <div key={session.id} style={{
                      padding: '20px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '20px'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span className="badge badge-primary">{course ? course.code : 'General'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            Opened {formatDate(session.created_at)}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-title)', margin: 0 }}>
                          {session.title}
                        </h4>
                      </div>

                      <div>
                        {alreadyMarked ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            <CheckCircle size={18} />
                            <span>Present Marked</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleMarkPresent(session)}
                              disabled={isGettingLocation}
                              className="btn btn-primary"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              {isGettingLocation ? 'Acquiring GPS...' : 'Mark Present'}
                              <UserCheck size={16} />
                            </button>
                            
                            {/* Geolocation permissions warning banner */}
                            {gpsError && (
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: 'var(--color-danger)', fontSize: '0.7rem' }}>
                                <ShieldAlert size={12} />
                                <span>GPS blocked or failed.</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}

                {visibleSessionList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <XCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                    <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>No Active Registers</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>There are no active attendance sessions open for your enrolled classes at this moment.</p>
                  </div>
                )}

                {/* Manual GPS fallback modal or block */}
                {manualGpsInput && !isGettingLocation && (
                  <div className="card" style={{
                    padding: '16px',
                    backgroundColor: 'rgba(234, 88, 12, 0.05)',
                    border: '1px solid rgba(234, 88, 12, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '16px'
                  }}>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--color-warning)', fontWeight: 'bold' }}>
                      ⚠️ Geolocation Access Required
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                      We could not fetch your coordinates automatically ({gpsError}). Please fill your coordinates manually if permitted by your lecturer, or skip location verification.
                    </p>
                    
                    {visibleSessionList.map(s => {
                      const marked = attendanceRecords.some(r => 
                        (r.session_id === s.id || r.sessionId === s.id) && 
                        (r.student_id === user.id || r.studentId === user.id)
                      );
                      if (marked) return null;

                      return (
                        <form key={s.id} onSubmit={(e) => handleManualSubmit(e, s.id)} style={{ display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.65rem' }}>Latitude</label>
                            <input 
                              type="number" 
                              step="0.000001" 
                              className="form-input form-input-sm" 
                              placeholder="e.g. 11.7013" 
                              value={manualLat}
                              onChange={e => setManualLat(e.target.value)}
                              style={{ width: '120px', height: '32px', fontSize: '0.75rem' }}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.65rem' }}>Longitude</label>
                            <input 
                              type="number" 
                              step="0.000001" 
                              className="form-input form-input-sm" 
                              placeholder="e.g. 9.3301" 
                              value={manualLng}
                              onChange={e => setManualLng(e.target.value)}
                              style={{ width: '120px', height: '32px', fontSize: '0.75rem' }}
                            />
                          </div>
                          <button type="submit" className="btn btn-outline btn-sm" style={{ height: '32px', fontSize: '0.75rem' }}>
                            Submit Coordinates
                          </button>
                          <button 
                            type="button" 
                            onClick={() => submitAttendance(s.id, null, null)}
                            className="btn btn-outline btn-sm" 
                            style={{ height: '32px', fontSize: '0.75rem', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                          >
                            Skip Location & Submit
                          </button>
                        </form>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
