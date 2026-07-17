import React, { useState } from 'react';
import { Users, PlusCircle, X, ShieldAlert, Award, Star, Edit, Trash, Plus, UserMinus, UserCheck } from 'lucide-react';

export default function GroupManager({ 
  currentRole, 
  users, 
  courses, 
  groups, 
  onAddGroup, 
  onUpdateGroup, 
  onDeleteGroup,
  enrollments = []
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Form State (Create Group)
  const [groupName, setGroupName] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // Array of studentIds

  // Form State (Edit Group)
  const [editGroupName, setEditGroupName] = useState('');
  const [editLeaderId, setEditLeaderId] = useState('');
  const [editMembers, setEditMembers] = useState([]);

  const user = users.find(u => u.id === currentRole) || users[0];
  const isLecturer = user.role === 'lecturer';

  // Filter students enrolled in this course
  const students = users.filter(u => {
    if (u.role !== 'student') return false;
    return enrollments.some(e => 
      e.studentId === u.id && 
      (e.courseId === selectedCourseId || e.course_id === selectedCourseId)
    );
  });

  // Find students not assigned to any group in this course
  const getUnassignedStudents = (excludeGroupId = null) => {
    return students.filter(student => {
      // Check if student is in any group for this course
      const isInGroup = groups.some(g => 
        g.courseId === selectedCourseId && 
        g.id !== excludeGroupId && 
        g.memberIds.includes(student.id)
      );
      return !isInGroup;
    });
  };

  // Handle Create Group Submission
  const handleCreateGroup = (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert("Group name is required.");
      return;
    }

    if (!leaderId) {
      alert("Please select a group leader.");
      return;
    }

    // Leader must be part of members
    const finalMembers = selectedMembers.includes(leaderId) 
      ? selectedMembers 
      : [...selectedMembers, leaderId];

    const newGroup = {
      id: 'group_' + Date.now().toString(),
      courseId: selectedCourseId,
      name: groupName,
      leaderId,
      memberIds: finalMembers
    };

    onAddGroup(newGroup);

    // Reset Form
    setGroupName('');
    setLeaderId('');
    setSelectedMembers([]);
    setShowCreateModal(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (group) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditLeaderId(group.leaderId);
    setEditMembers([...group.memberIds]);
  };

  // Save Edit Changes
  const handleSaveEdit = (e) => {
    e.preventDefault();

    if (!editGroupName.trim()) {
      alert("Group name is required.");
      return;
    }

    if (!editLeaderId) {
      alert("Please select a group leader.");
      return;
    }

    // Leader must be in members
    let finalMembers = [...editMembers];
    if (!finalMembers.includes(editLeaderId)) {
      finalMembers.push(editLeaderId);
    }

    const updatedGroup = {
      ...editingGroup,
      name: editGroupName,
      leaderId: editLeaderId,
      memberIds: finalMembers
    };

    onUpdateGroup(updatedGroup);
    setEditingGroup(null);
  };

  // Get active student group details (for student view)
  const getStudentGroup = () => {
    return groups.find(g => g.courseId === selectedCourseId && g.memberIds.includes(user.id));
  };

  // --- RENDERING LECTURER VIEW ---
  const renderLecturerView = () => {
    const courseGroups = groups.filter(g => g.courseId === selectedCourseId);
    const unassigned = getUnassignedStudents();

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Manage Student Groups</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Organize student circles, delegate group leaders, and manage team assignments.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              className="form-select" 
              value={selectedCourseId} 
              onChange={e => setSelectedCourseId(e.target.value)}
              style={{ width: '220px' }}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <PlusCircle size={18} />
              Add Group Circle
            </button>
          </div>
        </div>

        {/* Unassigned Students Info Banner */}
        {unassigned.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', backgroundColor: 'rgba(223, 177, 25, 0.15)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(223, 177, 25, 0.25)', marginBottom: '24px', fontSize: '0.85rem', alignItems: 'center' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-warning)' }} />
            <span>
              There are <strong>{unassigned.length}</strong> students not assigned to any group in this course: {unassigned.map(s => s.name.split(' ')[0]).join(', ')}
            </span>
          </div>
        )}

        {/* Groups Cards Grid */}
        <div className="grid-container">
          {courseGroups.map(group => {
            const leader = students.find(s => s.id === group.leaderId);
            const members = students.filter(s => group.memberIds.includes(s.id) && s.id !== group.leaderId);

            return (
              <div key={group.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{group.name}</h3>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{group.memberIds.length} Members</span>
                  </div>

                  {/* Leader Row */}
                  <div style={{ padding: '10px 14px', backgroundColor: 'rgba(223, 177, 25, 0.08)', border: '1px solid rgba(223, 177, 25, 0.15)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Star size={16} style={{ color: 'var(--secondary-hover)', fill: 'var(--secondary)' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary-hover)' }}>GROUP LEADER</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-title)' }}>{leader ? leader.name : 'Unassigned'}</div>
                    </div>
                  </div>

                  {/* Members list */}
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Teammates:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                      {members.map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-title)' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                          {m.name}
                        </div>
                      ))}
                      {members.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>No other members.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '14px' }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flexGrow: 1 }}
                    onClick={() => handleOpenEdit(group)}
                  >
                    <Edit size={14} />
                    Modify Group
                  </button>
                  <button 
                    className="btn btn-outline btn-sm btn-danger" 
                    style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', background: 'none' }}
                    onClick={() => {
                      if (window.confirm(`Delete ${group.name}? Students will become unassigned.`)) {
                        onDeleteGroup(group.id);
                      }
                    }}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {courseGroups.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
              <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>No Group Circles Created</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create group structures for student assignments.</p>
            </div>
          )}
        </div>

        {/* Modal: Create Group Circle */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.2rem' }}>Create Student Group Circle</h3>
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup}>
                <div className="form-group">
                  <label className="form-label">Group Circle Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Group Gamma" 
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Appoint Group Leader</label>
                  <select 
                    className="form-select" 
                    value={leaderId}
                    onChange={e => {
                      const val = e.target.value;
                      setLeaderId(val);
                      // Auto-check the leader as selected member
                      if (val && !selectedMembers.includes(val)) {
                        setSelectedMembers([...selectedMembers, val]);
                      }
                    }}
                    required
                  >
                    <option value="">-- Choose a Student --</option>
                    {unassigned.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Add Students to Group</label>
                  <div style={{ 
                    maxHeight: '180px', 
                    overflowY: 'auto', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    backgroundColor: 'var(--bg-app)' 
                  }}>
                    {unassigned.map(s => {
                      const isLeader = leaderId === s.id;
                      const isChecked = selectedMembers.includes(s.id);
                      return (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="checkbox" 
                            id={`chk-create-${s.id}`} 
                            checked={isChecked}
                            disabled={isLeader} // leader is forced selected
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedMembers([...selectedMembers, s.id]);
                              } else {
                                setSelectedMembers(selectedMembers.filter(id => id !== s.id));
                              }
                            }}
                            style={{ width: '18px', height: '18px', cursor: isLeader ? 'not-allowed' : 'pointer' }}
                          />
                          <label htmlFor={`chk-create-${s.id}`} style={{ fontSize: '0.85rem', cursor: isLeader ? 'not-allowed' : 'pointer', fontWeight: isLeader ? 'bold' : 'normal' }}>
                            {s.name} {isLeader && <span style={{ color: 'var(--secondary-hover)' }}>(LEADER)</span>}
                          </label>
                        </div>
                      );
                    })}
                    {unassigned.length === 0 && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
                        No unassigned students available in this course.
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Group Circle */}
        {editingGroup && (() => {
          const unassigned = getUnassignedStudents(editingGroup.id);
          
          return (
            <div className="modal-overlay" onClick={() => setEditingGroup(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 style={{ fontSize: '1.2rem' }}>Modify: {editingGroup.name}</h3>
                  <button className="modal-close" onClick={() => setEditingGroup(null)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit}>
                  <div className="form-group">
                    <label className="form-label">Rename Group</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editGroupName}
                      onChange={e => setEditGroupName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Change Leader Option */}
                  <div className="form-group" style={{ backgroundColor: 'rgba(223, 177, 25, 0.05)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(223, 177, 25, 0.1)' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={16} style={{ color: 'var(--secondary-hover)', fill: 'var(--secondary)' }} />
                      Change Group Leader
                    </label>
                    <select 
                      className="form-select" 
                      value={editLeaderId}
                      onChange={e => {
                        const newLeaderId = e.target.value;
                        setEditLeaderId(newLeaderId);
                        // Make sure new leader is inside member list
                        if (newLeaderId && !editMembers.includes(newLeaderId)) {
                          setEditMembers([...editMembers, newLeaderId]);
                        }
                      }}
                      required
                      style={{ marginTop: '6px' }}
                    >
                      {/* Leader can only be chosen from active members in this group */}
                      {students.filter(s => editMembers.includes(s.id)).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Note: You must first add a student to the group members below if they are not listed here.
                    </span>
                  </div>

                  {/* Modify members (add unassigned, remove existing) */}
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Group Members List</label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--bg-app)' }}>
                      
                      {/* Active Members list with REMOVE button */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: editMembers.length > 1 && unassigned.length > 0 ? '1px dashed var(--border)' : 'none', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>Active Group Members</span>
                        {students.filter(s => editMembers.includes(s.id)).map(s => {
                          const isLeader = editLeaderId === s.id;
                          return (
                            <div key={s.id} style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', width: '100%', padding: '4px 0' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: isLeader ? 'bold' : 'normal' }}>
                                {s.name} {isLeader && <span style={{ color: 'var(--secondary-hover)' }}>(LEADER)</span>}
                              </span>
                              {!isLeader && (
                                <button
                                  type="button"
                                  onClick={() => setEditMembers(editMembers.filter(id => id !== s.id))}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-danger)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    fontSize: '0.75rem'
                                  }}
                                  title="Remove student from group"
                                >
                                  <UserMinus size={14} />
                                  Remove
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Unassigned members with ADD button */}
                      {unassigned.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-warning)', textTransform: 'uppercase' }}>Add Unassigned Students</span>
                          {unassigned.map(s => (
                            <div key={s.id} style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', width: '100%', padding: '4px 0' }}>
                              <span style={{ fontSize: '0.85rem' }}>{s.name}</span>
                              <button
                                type="button"
                                onClick={() => setEditMembers([...editMembers, s.id])}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                <Plus size={14} />
                                Add Student
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setEditingGroup(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // --- RENDERING STUDENT VIEW ---
  const renderStudentView = () => {
    const studentGroup = getStudentGroup();

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>My Group Circle</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Check your collaborative group assignment circles and contact your group leader.
            </p>
          </div>
          
          <select 
            className="form-select" 
            value={selectedCourseId} 
            onChange={e => setSelectedCourseId(e.target.value)}
            style={{ width: '220px' }}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
            ))}
          </select>
        </div>

        {studentGroup ? (() => {
          const leader = students.find(s => s.id === studentGroup.leaderId);
          const teammates = students.filter(s => studentGroup.memberIds.includes(s.id) && s.id !== studentGroup.leaderId);
          const isUserLeader = studentGroup.leaderId === user.id;

          return (
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
              <div className="card" style={{ borderLeft: '5px solid var(--secondary)', padding: '30px' }}>
                <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <span className="badge badge-warning" style={{ marginBottom: '6px' }}>Group Enrolled</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{studentGroup.name}</h3>
                  </div>
                  <Users size={40} style={{ color: 'var(--secondary-hover)' }} />
                </div>

                {/* Leader block */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '16px', 
                  backgroundColor: 'rgba(223, 177, 25, 0.08)', 
                  border: '1px solid rgba(223, 177, 25, 0.15)', 
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px'
                }}>
                  <Star size={20} style={{ color: 'var(--secondary-hover)', fill: 'var(--secondary)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary-hover)' }}>GROUP LEADER</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-title)' }}>
                      {leader ? leader.name : 'Unknown'} {isUserLeader && ' (You)'}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {leader?.email ? (leader.email.includes('@') ? `Email: ${leader.email}` : `Reg No: ${leader.email}`) : ''}
                    </p>
                  </div>
                </div>

                {/* Teammates List */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Group Members ({studentGroup.memberIds.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Leader item */}
                  <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)' }}>
                    <span style={{ fontWeight: 'bold' }}>{leader?.name}</span>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Leader</span>
                  </div>

                  {/* Member items */}
                  {teammates.map(member => (
                    <div key={member.id} style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                      <span>{member.name} {member.id === user.id && <strong>(You)</strong>}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teammate</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  For group assignments, any member can upload files. The grade applied by Dr. Bello will synchronize to all members.
                </div>
              </div>
            </div>
          );
        })() : (
          <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
            <ShieldAlert size={48} style={{ color: 'var(--color-warning)', marginBottom: '12px', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Not Assigned to a Group</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              You are currently not enrolled in any student project group for this course.
            </p>
            <div style={{ fontSize: '0.8rem', padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
              Please contact your course lecturer (Dr. Bello) to add you to a group circle.
            </div>
          </div>
        )}
      </div>
    );
  };

  return isLecturer ? renderLecturerView() : renderStudentView();
}
