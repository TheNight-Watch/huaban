import React from 'react';
import { Star, Clock, Users } from 'lucide-react';
import { Course, CourseCardProps } from '../types/course';

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const handleClick = () => {
    onSelect?.(course);
  };

  const getDifficultyColor = (difficulty: Course['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: Course['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return '入门';
      case 'intermediate':
        return '进阶';
      case 'advanced':
        return '高级';
      default:
        return '未知';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
      onClick={handleClick}
    >
      {/* 课程封面图 */}
      <div className="aspect-[16/10] overflow-hidden">
        <img 
          src={course.coverImage}
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // 图片加载失败时显示占位符
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDIwMCAxMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA1NUw5NSA0NUwxMDUgNTVMOTUgNjVMODUgNTVaIiBmaWxsPSIjOUI5Qjk4Ii8+Cjwvdmc+';
          }}
        />
      </div>

      {/* 课程信息 */}
      <div className="p-4">
        {/* 标题和难度 */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-[#464646] leading-5 flex-1 mr-2">
            {course.title}
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(course.difficulty)}`}>
            {getDifficultyText(course.difficulty)}
          </span>
        </div>

        {/* 描述 */}
        <p className="text-xs text-[#8B8B8B] leading-4 mb-3 overflow-hidden" 
           style={{
             display: '-webkit-box',
             WebkitLineClamp: 2,
             WebkitBoxOrient: 'vertical',
             textOverflow: 'ellipsis'
           }}>
          {course.description}
        </p>

        {/* 年龄范围和分类 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[#2489FF] bg-blue-50 px-2 py-1 rounded">
            {course.ageRange}
          </span>
          <span className="text-xs text-[#8B8B8B]">
            {course.category}
          </span>
        </div>

        {/* 技能标签 */}
        {course.skills && course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {course.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="text-xs text-[#464646] bg-[#F9F7F3] px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
            {course.skills.length > 3 && (
              <span className="text-xs text-[#8B8B8B]">
                +{course.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-xs text-[#8B8B8B]">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{course.enrollmentCount}人</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
