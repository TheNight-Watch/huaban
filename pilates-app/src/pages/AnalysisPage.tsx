import React from 'react';
import CourseWaterfall from '../components/CourseWaterfall';
import { Course } from '../types/course';

interface AnalysisPageProps {
  onBack?: () => void;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({ onBack }) => {
  // 模拟课程数据
  const mockCourses: Course[] = [
    {
      id: '1',
      title: '线条与形状启蒙',
      description: '通过简单的线条练习，帮助孩子掌握基本的绘画技巧，提升画面组织与构图能力。学习如何运用不同的线条表达情感。',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDIwMCAxMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI1IiBmaWxsPSIjRkZFREQzIi8+CjxwYXRoIGQ9Ik01MCA2Mkw3NSA0MEwxMDAgNjJMNzUgODVMNTAgNjJaIiBzdHJva2U9IiM0NjQ2NDYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSI1NSIgcj0iMTUiIHN0cm9rZT0iIzI0ODlGRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxsaW5lIHgxPSIxNjAiIHkxPSI0NSIgeDI9IjE3MCIgeTI9IjY1IiBzdHJva2U9IiNGRjZBOTMiIHN0cm9rZS13aWR0aD0iMyIvPgo8L3N2Zz4=',
      ageRange: '3-6岁',
      duration: '15分钟',
      difficulty: 'beginner',
      category: '基础技法',
      skills: ['线条练习', '形状认知', '手眼协调'],
      instructor: '李老师',
      rating: 4.8,
      enrollmentCount: 156
    },
    {
      id: '2',
      title: '色彩情绪表达',
      description: '探索暖冷色与心情的关系，学习如何用色彩表达不同的情感。',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDIwMCAxMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI1IiBmaWxsPSIjRkZGNUU1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjRkY2QTkzIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjUwIiByPSIyMCIgZmlsbD0iI0ZGRUREMyIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSI2MCIgcj0iMTgiIGZpbGw9IiMyNDg5RkYiLz4KPGVsbGlwc2UgY3g9IjEyNSIgY3k9IjkwIiByeD0iNDAiIHJ5PSIxNSIgZmlsbD0iIzkzQzVGRCIgb3BhY2l0eT0iMC42Ii8+Cjwvc3ZnPg==',
      ageRange: '4-8岁',
      duration: '20分钟',
      difficulty: 'beginner',
      category: '色彩启蒙',
      skills: ['色彩认知', '情感表达'],
      instructor: '王老师',
      rating: 4.9,
      enrollmentCount: 203
    },
    {
      id: '3',
      title: '动物画像入门',
      description: '学习观察动物的基本特征，用简单的方法画出可爱的小动物。从圆形和椭圆开始，逐步添加细节。',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDIwMCAxMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI1IiBmaWxsPSIjRjlGN0YzIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSIyNSIgZmlsbD0iI0ZGRUREMyIgc3Ryb2tlPSIjNDY0NjQ2IiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iOTAiIGN5PSI1NSIgcj0iMyIgZmlsbD0iIzQ2NDY0NiIvPgo8Y2lyY2xlIGN4PSIxMTAiIGN5PSI1NSIgcj0iMyIgZmlsbD0iIzQ2NDY0NiIvPgo8ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNjgiIHJ4PSI4IiByeT0iNSIgZmlsbD0iI0ZGNkE5MyIvPgo8ZWxsaXBzZSBjeD0iODAiIGN5PSI0NSIgcng9IjEwIiByeT0iMTUiIGZpbGw9IiNGRkVERDMiIHN0cm9rZT0iIzQ2NDY0NiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxlbGxpcHNlIGN4PSIxMjAiIGN5PSI0NSIgcng9IjEwIiByeT0iMTUiIGZpbGw9IiNGRkVERDMiIHN0cm9rZT0iIzQ2NDY0NiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==',
      ageRange: '5-9岁',
      duration: '25分钟',
      difficulty: 'intermediate',
      category: '主题绘画',
      skills: ['观察能力', '形状组合', '细节刻画', '想象力'],
      instructor: '张老师',
      rating: 4.7,
      enrollmentCount: 89
    },
    {
      id: '4',
      title: '故事绘画创作',
      description: '通过绘画讲述故事，培养孩子的叙事能力和创意表达。',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDIwMCAxMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI1IiBmaWxsPSIjRkNGMkUyIi8+CjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiByeD0iNSIgZmlsbD0iIzJGOEZGRiIvPgo8cmVjdCB4PSI4MCIgeT0iNDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgcng9IjMiIGZpbGw9IiNGRjZBOTMiLz4KPGNpcmNsZSBjeD0iMTYwIiBjeT0iNzAiIHI9IjIwIiBmaWxsPSIjOTNDNUZEIi8+Cjxwb2x5Z29uIHBvaW50cz0iNTAsODAgNjUsNzAgODAsODAgNjUsOTAiIGZpbGw9IiNGRkVERDMiLz4KPGxpbmUgeDE9IjEyMCIgeTE9IjkwIiB4Mj0iMTgwIiB5Mj0iOTAiIHN0cm9rZT0iIzQ2NDY0NiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+',
      ageRange: '6-10岁',
      duration: '30分钟',
      difficulty: 'intermediate',
      category: '创意表达',
      skills: ['叙事能力', '构图设计'],
      instructor: '陈老师',
      rating: 4.6,
      enrollmentCount: 124
    },
    {
      id: '5',
      title: '水彩技法初体验',
      description: '学习水彩的基本技法，体验色彩的流动与混合之美。',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDIwMCAxMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI1IiBmaWxsPSIjRjlGN0YzIi8+CjxjaXJjbGUgY3g9IjcwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSIjMjQ4OUZGIiBvcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMTIwIiBjeT0iNjAiIHI9IjMwIiBmaWxsPSIjRkY2QTkzIiBvcGFjaXR5PSIwLjQiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSIjRkZFREQzIiBvcGFjaXR5PSIwLjUiLz4KPGVsbGlwc2UgY3g9IjE0MCIgY3k9IjgwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iIzkzQzVGRCIgb3BhY2l0eT0iMC4zIi8+Cjwvc3ZnPg==',
      ageRange: '7-12岁',
      duration: '35分钟',
      difficulty: 'advanced',
      category: '技法训练',
      skills: ['水彩技法', '色彩混合', '材料运用'],
      instructor: '刘老师',
      rating: 4.5,
      enrollmentCount: 67
    },
    {
      id: '6',
      title: '光影基础认知',
      description: '了解光影的基本原理，学习如何表现物体的立体感。',
      coverImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyNSIgdmlld0JveD0iMCAwIDIwMCAxMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSIzMCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZFREQzO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0NjQ2NDY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGVsbGlwc2UgY3g9IjEwMCIgY3k9IjkwIiByeD0iMjUiIHJ5PSI4IiBmaWxsPSIjNDY0NjQ2IiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+',
      ageRange: '8-12岁',
      duration: '40分钟',
      difficulty: 'advanced',
      category: '立体表现',
      skills: ['光影理解', '立体感'],
      instructor: '赵老师',
      rating: 4.4,
      enrollmentCount: 45
    }
  ];

  const handleCourseSelect = (course: Course) => {
    console.log('选择课程:', course.title);
    // 这里可以添加课程选择的逻辑
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F3] via-[#FCF2E2] to-[#FFEDD3] relative">
      {/* 顶部栏 */}
      <div className="relative w-full h-20 bg-[rgba(249,247,243,0.8)] shadow-[0px_4px_10px_0px_rgba(187,187,187,0.25)] flex items-end justify-between px-6 pb-4">
        <button aria-label="back" onClick={onBack} className="text-black text-sm">返回</button>
        <h1 className="text-[15px] font-medium text-black leading-[1.6] text-center flex-1">AI 分析画面</h1>
        <div className="w-10" />
      </div>

      {/* 画作缩略图区域 */}
      <div className="px-6 pt-4 pb-2">
        <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs mx-auto">
          <img 
            src={require('../assets/images/artwork-image-7d6e1b.png')}
            alt="分析中的画作"
            className="w-full aspect-[4/3] object-cover rounded-md"
          />
          <p className="text-xs text-[#8B8B8B] text-center mt-2">2024/10/3 我的自画像</p>
        </div>
      </div>

      <div className="px-6 pt-2 space-y-6">
        <section className="bg-[#F9F7F3] rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-[#454545] mb-2">分析要点</h2>
          <ul className="list-disc pl-5 text-sm text-[#464646] space-y-2">
            <li>主题元素：动物、人物、自然场景</li>
            <li>情绪倾向：开心、兴奋</li>
            <li>色彩偏好：暖色调为主，蓝色点缀</li>
            <li>构图特点：主体居中，留白较多</li>
          </ul>
        </section>

        <section className="bg-[#F9F7F3] rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-[#454545] mb-4">课程推荐</h2>
          <CourseWaterfall 
            courses={mockCourses}
            onCourseSelect={handleCourseSelect}
          />
        </section>
      </div>
    </div>
  );
};

export default AnalysisPage;

