import React, { useState } from 'react';
import { MessageSquare, Send, Trash2, Calendar, User, MessageCircle } from 'lucide-react';

export default function DiscussionForum({
  currentRole,
  users,
  activeCourseId,
  courses,
  discussionPosts,
  discussionReplies,
  onAddPost,
  onDeletePost,
  onAddReply,
  onDeleteReply
}) {
  const user = users.find(u => u.id === currentRole) || users[0];
  const activeCourse = courses.find(c => c.id === activeCourseId);

  // Form states
  const [postContent, setPostContent] = useState('');
  const [replyContents, setReplyContents] = useState({}); // { [postId]: string }

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost = {
      id: 'post_' + Date.now().toString(),
      courseId: activeCourseId,
      course_id: activeCourseId,
      userId: user.id,
      user_id: user.id,
      content: postContent.trim(),
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    onAddPost(newPost);
    setPostContent('');
  };

  const handleReplySubmit = (e, postId) => {
    e.preventDefault();
    const content = replyContents[postId];
    if (!content || !content.trim()) return;

    const newReply = {
      id: 'reply_' + Date.now().toString(),
      postId: postId,
      post_id: postId,
      userId: user.id,
      user_id: user.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    onAddReply(newReply);
    setReplyContents(prev => ({ ...prev, [postId]: '' }));
  };

  const handleReplyChange = (postId, value) => {
    setReplyContents(prev => ({ ...prev, [postId]: value }));
  };

  // Date formatter helper
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

  // Filter posts and replies for the current course
  const coursePosts = discussionPosts
    .filter(p => p.courseId === activeCourseId || p.course_id === activeCourseId)
    .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Intro Banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(10, 92, 54, 0.03) 0%, rgba(223, 177, 25, 0.03) 100%)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-title)', marginBottom: '6px' }}>
              Interactive Discussion Circle: {activeCourse ? `${activeCourse.code} - ${activeCourse.name}` : 'Course Forum'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Ask questions, discuss topics, collaborate, and receive direct feedback from classmates and lecturers.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Post Composer */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', color: 'var(--primary)' }}>
            <MessageCircle size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Start a Conversation</h3>
          </div>

          <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Posting as: <strong>{user.name}</strong> ({user.role.toUpperCase()})
              </label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Ask a question or share a thought about this course..."
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                required
                style={{ resize: 'none', padding: '12px', fontSize: '0.85rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '4px' }}>
              <Send size={16} />
              Share Discussion
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Discussion Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {coursePosts.map(post => {
            const author = users.find(u => u.id === post.userId || u.id === post.user_id) || { name: 'Unknown User', role: 'student', avatar: 'U' };
            const postReplies = discussionReplies.filter(r => r.postId === post.id || r.post_id === post.id)
              .sort((a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at));
            const canDeletePost = user.role === 'lecturer' || user.id === post.userId || user.id === post.user_id;

            return (
              <div key={post.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Post Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="user-avatar" style={{ margin: 0, width: '38px', height: '38px', fontSize: '0.9rem', backgroundColor: author.role === 'lecturer' ? 'var(--secondary)' : 'var(--primary)', color: author.role === 'lecturer' ? 'black' : 'white' }}>
                      {author.avatar || author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-title)' }}>{author.name}</span>
                        <span className={`badge ${author.role === 'lecturer' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                          {author.role.toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={12} />
                        {formatDate(post.createdAt || post.created_at)}
                      </span>
                    </div>
                  </div>

                  {canDeletePost && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this discussion thread?')) {
                          onDeletePost(post.id);
                        }
                      }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '4px' }}
                      title="Delete Post"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-title)', margin: '0 4px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>

                {/* Replies Divider */}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                    Comments & Replies ({postReplies.length})
                  </span>

                  {/* Replies List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {postReplies.map(reply => {
                      const replier = users.find(u => u.id === reply.userId || u.id === reply.user_id) || { name: 'Unknown User', role: 'student', avatar: 'U' };
                      const canDeleteReply = user.role === 'lecturer' || user.id === reply.userId || user.id === reply.user_id;

                      return (
                        <div key={reply.id} style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--bg-app)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                          <div className="user-avatar" style={{ margin: 0, width: '28px', height: '28px', fontSize: '0.7rem', backgroundColor: replier.role === 'lecturer' ? 'var(--secondary)' : 'var(--primary)', color: replier.role === 'lecturer' ? 'black' : 'white' }}>
                            {replier.avatar || replier.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-title)' }}>{replier.name}</span>
                                <span className={`badge ${replier.role === 'lecturer' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                                  {replier.role.toUpperCase()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {formatDate(reply.createdAt || reply.created_at)}
                                </span>
                                {canDeleteReply && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm('Delete this comment?')) {
                                        onDeleteReply(reply.id);
                                      }
                                    }}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '2px' }}
                                    title="Delete Comment"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-title)', marginTop: '4px', margin: 0, lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Reply Input */}
                  <form onSubmit={e => handleReplySubmit(e, post.id)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      placeholder="Write a comment..."
                      value={replyContents[post.id] || ''}
                      onChange={e => handleReplyChange(post.id, e.target.value)}
                      style={{ fontSize: '0.8rem', height: '36px' }}
                      required
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ height: '36px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Send size={12} />
                      Reply
                    </button>
                  </form>

                </div>

              </div>
            );
          })}

          {coursePosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <MessageSquare size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px', opacity: 0.7 }} />
              <h4 style={{ fontSize: '1rem', margin: '0 0 4px 0', color: 'var(--text-title)' }}>No Discussions Yet</h4>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Be the first to ask a question or start a topic!</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
