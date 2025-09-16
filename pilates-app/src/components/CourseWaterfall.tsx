import React from 'react';
import { Course } from '../types/course';
import CourseCard from './CourseCard';

interface CourseWaterfallProps {
  courses: Course[];
  onCourseSelect?: (course: Course) => void;
}

const CourseWaterfall: React.FC<CourseWaterfallProps> = ({ 
  courses, 
  onCourseSelect 
}) => {
  return (
    <div 
      className="columns-2 gap-3 space-y-3 sm:columns-2 md:columns-3"
      style={{
        columnFill: 'balance'
      }}
    >
      {courses.map((course) => (
        <div key={course.id} className="break-inside-avoid mb-3">
          <CourseCard 
            course={course} 
            onSelect={onCourseSelect}
          />
        </div>
      ))}
    </div>
  );
};

export default CourseWaterfall;
