export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  ageRange: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  skills: string[];
  instructor: string;
  rating: number;
  enrollmentCount: number;
}

export interface CourseCardProps {
  course: Course;
  onSelect?: (course: Course) => void;
}


