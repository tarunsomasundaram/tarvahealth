import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { conditions } from '@/data/conditions';

export interface ForumPost {
  id: string;
  groupId: string;
  authorUserId: string;
  authorDisplayName: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean;
  sharedProfile: boolean;
  sharedAge?: number;
  sharedConditions?: string[];
  likes: number;
  commentCount: number;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorUserId: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
}

export interface ForumGroup {
  id: string;
  conditionId: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
}

export interface ForumReport {
  id: string;
  contentType: 'post' | 'comment';
  contentId: string;
  reporterUserId: string;
  reason: string;
  createdAt: string;
}

interface ForumContextType {
  hasAcknowledgedGuidelines: boolean;
  acknowledgeGuidelines: () => void;
  groups: ForumGroup[];
  posts: ForumPost[];
  comments: ForumComment[];
  reports: ForumReport[];
  userPosts: string[];
  getGroupsForConditions: (conditionIds: string[]) => ForumGroup[];
  getSuggestedGroups: (conditionIds: string[]) => ForumGroup[];
  getPostsForGroup: (groupId: string) => ForumPost[];
  getCommentsForPost: (postId: string) => ForumComment[];
  createPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'commentCount'>) => string;
  createComment: (comment: Omit<ForumComment, 'id' | 'createdAt'>, onNotify?: (postTitle: string, commenterName: string) => void) => void;
  reportContent: (report: Omit<ForumReport, 'id' | 'createdAt'>) => void;
  likePost: (postId: string, onNotify?: (postTitle: string) => void) => void;
  generateAnonymousHandle: () => string;
  getPostById: (postId: string) => ForumPost | undefined;
}

const ForumContext = createContext<ForumContextType | undefined>(undefined);

// Generate mock groups based on conditions
const generateMockGroups = (): ForumGroup[] => {
  return conditions.slice(0, 30).map((condition) => ({
    id: `group-${condition.id}`,
    conditionId: condition.id,
    name: condition.name,
    description: `A supportive community for people managing ${condition.name.toLowerCase()}. Share experiences, tips, and connect with others.`,
    memberCount: Math.floor(Math.random() * 500) + 50,
    postCount: Math.floor(Math.random() * 100) + 10,
  }));
};

// Generate mock posts
const generateMockPosts = (groups: ForumGroup[]): ForumPost[] => {
  const mockPosts: ForumPost[] = [];
  const topics = [
    { title: 'First time here - looking for support', body: 'Hi everyone! I was recently diagnosed and trying to understand what to expect. Would love to hear about your experiences and any tips for managing day-to-day.' },
    { title: 'What helps you on bad days?', body: 'Having a rough week and looking for some encouragement. What strategies or habits help you get through the harder times?' },
    { title: 'Medication questions', body: 'Started a new treatment plan and wondering if others have had similar experiences. Not looking for medical advice, just personal stories.' },
    { title: 'Small win today!', body: 'Just wanted to share a positive update. It\'s been a journey but I\'m seeing some improvement. Keep going everyone!' },
    { title: 'Tips for talking to family', body: 'How do you explain your condition to loved ones? Looking for ways to help them understand without overwhelming them.' },
  ];

  groups.slice(0, 10).forEach((group, groupIndex) => {
    topics.forEach((topic, topicIndex) => {
      mockPosts.push({
        id: `post-${groupIndex}-${topicIndex}`,
        groupId: group.id,
        authorUserId: `user-${Math.floor(Math.random() * 1000)}`,
        authorDisplayName: `User ${Math.floor(Math.random() * 9000) + 1000}`,
        title: topic.title,
        body: topic.body,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        isAnonymous: true,
        sharedProfile: false,
        likes: Math.floor(Math.random() * 50),
        commentCount: Math.floor(Math.random() * 20),
      });
    });
  });

  return mockPosts;
};

// Generate mock comments
const generateMockComments = (posts: ForumPost[]): ForumComment[] => {
  const mockComments: ForumComment[] = [];
  const replies = [
    'Thank you for sharing! You\'re not alone in this.',
    'I\'ve had a similar experience. Feel free to reach out anytime.',
    'Sending support your way! 💜',
    'This really resonated with me. Thanks for posting.',
    'Great advice here. I\'ll try this!',
  ];

  posts.slice(0, 20).forEach((post, postIndex) => {
    const numComments = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numComments; i++) {
      mockComments.push({
        id: `comment-${postIndex}-${i}`,
        postId: post.id,
        authorUserId: `user-${Math.floor(Math.random() * 1000)}`,
        authorDisplayName: `User ${Math.floor(Math.random() * 9000) + 1000}`,
        body: replies[Math.floor(Math.random() * replies.length)],
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  return mockComments;
};

export function ForumProvider({ children }: { children: ReactNode }) {
  const [hasAcknowledgedGuidelines, setHasAcknowledgedGuidelines] = useState(() => {
    return localStorage.getItem('tarva-forum-guidelines-acknowledged') === 'true';
  });

  const [groups] = useState<ForumGroup[]>(() => generateMockGroups());
  const [posts, setPosts] = useState<ForumPost[]>(() => generateMockPosts(groups));
  const [comments, setComments] = useState<ForumComment[]>(() => generateMockComments(posts));
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [userPosts, setUserPosts] = useState<string[]>(() => {
    const saved = localStorage.getItem('tarva-forum-user-posts');
    return saved ? JSON.parse(saved) : [];
  });

  // Save user posts to localStorage
  useEffect(() => {
    localStorage.setItem('tarva-forum-user-posts', JSON.stringify(userPosts));
  }, [userPosts]);

  const acknowledgeGuidelines = () => {
    setHasAcknowledgedGuidelines(true);
    localStorage.setItem('tarva-forum-guidelines-acknowledged', 'true');
  };

  const getGroupsForConditions = (conditionIds: string[]): ForumGroup[] => {
    return groups.filter(group => conditionIds.includes(group.conditionId));
  };

  const getSuggestedGroups = (conditionIds: string[]): ForumGroup[] => {
    const userCategories = new Set(
      conditionIds
        .map(id => conditions.find(c => c.id === id)?.category)
        .filter(Boolean)
    );

    return groups
      .filter(group => {
        const condition = conditions.find(c => c.id === group.conditionId);
        return condition && userCategories.has(condition.category) && !conditionIds.includes(group.conditionId);
      })
      .slice(0, 5);
  };

  const getPostsForGroup = (groupId: string): ForumPost[] => {
    return posts
      .filter(post => post.groupId === groupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getCommentsForPost = (postId: string): ForumComment[] => {
    return comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const getPostById = (postId: string): ForumPost | undefined => {
    return posts.find(p => p.id === postId);
  };

  const createPost = (post: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'commentCount'>): string => {
    const postId = `post-${Date.now()}`;
    const newPost: ForumPost = {
      ...post,
      id: postId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      commentCount: 0,
    };
    setPosts(prev => [newPost, ...prev]);
    setUserPosts(prev => [...prev, postId]);
    return postId;
  };

  const createComment = (
    comment: Omit<ForumComment, 'id' | 'createdAt'>,
    onNotify?: (postTitle: string, commenterName: string) => void
  ) => {
    const newComment: ForumComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    
    // Update post comment count
    setPosts(prev => prev.map(post => 
      post.id === comment.postId 
        ? { ...post, commentCount: post.commentCount + 1 }
        : post
    ));

    // Trigger notification if this is on user's own post
    const post = posts.find(p => p.id === comment.postId);
    if (post && userPosts.includes(comment.postId) && onNotify) {
      onNotify(post.title, comment.authorDisplayName);
    }
  };

  const reportContent = (report: Omit<ForumReport, 'id' | 'createdAt'>) => {
    const newReport: ForumReport = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReports(prev => [...prev, newReport]);
  };

  const likePost = (postId: string, onNotify?: (postTitle: string) => void) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));

    // Trigger notification if this is user's own post
    const post = posts.find(p => p.id === postId);
    if (post && userPosts.includes(postId) && onNotify) {
      onNotify(post.title);
    }
  };

  const generateAnonymousHandle = (): string => {
    return `User ${Math.floor(Math.random() * 9000) + 1000}`;
  };

  return (
    <ForumContext.Provider
      value={{
        hasAcknowledgedGuidelines,
        acknowledgeGuidelines,
        groups,
        posts,
        comments,
        reports,
        userPosts,
        getGroupsForConditions,
        getSuggestedGroups,
        getPostsForGroup,
        getCommentsForPost,
        createPost,
        createComment,
        reportContent,
        likePost,
        generateAnonymousHandle,
        getPostById,
      }}
    >
      {children}
    </ForumContext.Provider>
  );
}

export function useForum() {
  const context = useContext(ForumContext);
  if (context === undefined) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
}
