export const opportunities = [
  {
    _id: "1",
    title: "HackVerse 3.0",
    description: "24 hour national hackathon for innovative ideas.",
    organization: "Google Developer Student Clubs",
    category: "Hackathon",
    domain: "Computer Science",
    mode: "Online",
    location: "Online",
    duration: "24 hours",
    deadline: "2026-04-15",
    skills: ["JavaScript", "React", "Node"],
    eligibility: {
      minYear: 1,
      maxYear: 4,
      branches: ["Computer Science", "Electronics"],
      minCGPA: 6
    },
    status: "Active",
    featured: true,
    views: 0,
    applications: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    _id: "2",
    title: "CodeSprint",
    description: "Competitive programming contest hosted by HackerEarth.",
    organization: "HackerEarth",
    category: "Hackathon",
    domain: "Computer Science",
    mode: "Online",
    location: "Online",
    duration: "12 hours",
    deadline: "2026-04-20",
    skills: ["DSA", "Algorithms"],
    eligibility: {
      minYear: 1,
      maxYear: 4,
      branches: ["Computer Science"],
      minCGPA: 0
    },
    status: "Active",
    featured: false,
    views: 0,
    applications: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    _id: "3",
    title: "Frontend Internship",
    description: "3-month internship focused on React and UI development.",
    organization: "Microsoft",
    category: "Internship",
    domain: "Computer Science",
    mode: "Online",
    location: "Remote",
    duration: "3 months",
    deadline: "2026-05-10",
    skills: ["React", "JavaScript", "Tailwind"],
    eligibility: {
      minYear: 2,
      maxYear: 4,
      branches: ["Computer Science"],
      minCGPA: 7
    },
    status: "Active",
    featured: true,
    views: 0,
    applications: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];


export const applications = [];

export const saved = [];