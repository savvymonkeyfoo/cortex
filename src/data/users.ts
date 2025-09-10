// Users data for assignment reviewers
export interface User {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  email?: string;
  department?: string;
}

// Predefined list of users for testing
export const users: User[] = [
  {
    id: "user-1",
    name: "Sarah Chen",
    role: "Senior DevOps Engineer",
    avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    email: "sarah.chen@company.com",
    department: "Engineering"
  },
  {
    id: "user-2", 
    name: "Marcus Rodriguez",
    role: "Security Lead",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    email: "marcus.rodriguez@company.com",
    department: "Security"
  },
  {
    id: "user-3",
    name: "Emily Johnson",
    role: "Database Administrator",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    email: "emily.johnson@company.com",
    department: "Infrastructure"
  },
  {
    id: "user-4",
    name: "David Kim",
    role: "Platform Engineer",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    email: "david.kim@company.com",
    department: "Platform"
  },
  {
    id: "user-5",
    name: "Lisa Wang",
    role: "Network Specialist",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    email: "lisa.wang@company.com",
    department: "Network Operations"
  },
  {
    id: "user-6",
    name: "Alex Thompson",
    role: "Site Reliability Engineer",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    email: "alex.thompson@company.com",
    department: "SRE"
  }
];

// Helper function to get a user by ID
export function getUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}

// Helper function to get a random user (for testing)
export function getRandomUser(): User {
  return users[Math.floor(Math.random() * users.length)];
}

// Helper function to get users by department
export function getUsersByDepartment(department: string): User[] {
  return users.filter(user => user.department === department);
}