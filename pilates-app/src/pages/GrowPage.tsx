import React from 'react';
import groundPicture from '../assets/images/groundpicture.svg';

const GrowPage: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      <img 
        src={groundPicture}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-10 px-0 pt-6 pb-28">
        {/* 头部精确布局容器（375 x ~260） */}
        <div className="relative" style={{ width: '375px', height: '260px', margin: '0 auto' }}>
          {/* 中部头像 */}
          <div className="absolute" style={{ left: '50%', top: '96px', transform: 'translateX(-50%)' }}>
            <img
              src={require('../assets/images/profile-avatar-34cbce.png')}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>

          {/* 姓名与年龄（居中，字重700，16/24） */}
          <div className="absolute w-full text-center" style={{ top: '150px' }}>
            <span
              className="text-black"
              style={{ fontFamily: 'Source Han Sans CN', fontSize: '16px', fontWeight: 700, lineHeight: '24px' }}
            >
              小苹果 5 岁
            </span>
          </div>

          {/* 稻穗装饰 左侧 */}
          <div
            className="absolute"
            style={{ width: '54px', height: '54px', left: '56px', top: '168px', transform: 'rotate(-15deg)' }}
          >
            <div
              className="w-full h-full rounded"
              style={{ background: 'linear-gradient(180deg, #F2DCC7 0%, #FFAC68 100%)' }}
            />
          </div>

          {/* 稻穗装饰 右侧（镜像） */}
          <div
            className="absolute"
            style={{ width: '54px', height: '54px', left: '252px', top: '168px', transform: 'rotate(15deg) scaleX(-1)' }}
          >
            <div
              className="w-full h-full rounded"
              style={{ background: 'linear-gradient(180deg, #F2DCC7 0%, #FFAC68 100%)' }}
            />
          </div>

          {/* 标题：好奇心满满的科学家（居中，w=180，top=189） */}
          <div
            className="absolute text-center"
            style={{ width: '180px', left: 'calc(50% - 180px/2 - 0.5px)', top: '189px' }}
          >
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '20px', lineHeight: '24px', color: '#000' }}>
              好奇心满满的科学家
            </span>
          </div>

          {/* 副标题：最近喜欢研究火箭的奇女子（top=219, left=116, w=144） */}
          <div
            className="absolute text-center"
            style={{ width: '144px', left: '116px', top: '219px' }}
          >
            <span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 400, fontSize: '12px', lineHeight: '24px', color: '#757575' }}>
              最近喜欢研究火箭的奇女子
            </span>
          </div>
        </div>

        {/* 卡片区域基于375px画布的绝对定位容器 */}
        <div className="relative" style={{ width: '375px', height: '820px', margin: '0 auto' }}>
          {/* Group 43 - 画面能力 卡片 */}
          <div className="absolute" style={{ width: '324px', height: '240px', left: '25px', top: '9px' }}>
            {/* Rectangle 46 */}
            <div
              className="absolute"
              style={{
                width: '324px', height: '240px', left: '0px', top: '0px',
                background: '#FFFBF4', border: '1px solid #FFFFFF', boxShadow: '0px 0px 13.7px rgba(98, 98, 98, 0.25)', borderRadius: '15px'
              }}
            />

            {/* Solid/Status/University icon square */}
            <div className="absolute" style={{ width: '16px', height: '16px', left: '16px', top: '14px' }}>
              <div className="absolute" style={{ left: '5.21%', right: '5.21%', top: '13.54%', bottom: '9.99%', background: 'linear-gradient(180deg, #FF9442 0%, #FF6A57 100%)' }} />
            </div>

            {/* 标题：画面能力 */}
            <div className="absolute" style={{ width: '56px', height: '24px', left: '36px', top: '11px' }}>
              <span style={{ fontFamily: 'Source Han Sans CN', fontStyle: 'normal', fontWeight: 500, fontSize: '14px', lineHeight: '24px', color: '#434343' }}>画面能力</span>
            </div>

            {/* 雷达/靶形圈层与十字线/对角线 */}
            <div className="absolute" style={{ width: '116px', height: '116px', left: '105px', top: '66px' }} />
            <div className="absolute" style={{ width: '116px', height: '116px', left: '105px', top: '66px', border: '1px solid #D6D1CD', borderRadius: '9999px' }} />
            <div className="absolute" style={{ width: '93.49px', height: '93.49px', left: '116.25px', top: '77.25px', border: '1px solid #D6D1CD', borderRadius: '9999px' }} />
            <div className="absolute" style={{ width: '70.99px', height: '70.99px', left: '127.51px', top: '88.51px', border: '1px solid #D6D1CD', borderRadius: '9999px' }} />
            <div className="absolute" style={{ width: '50.21px', height: '50.21px', left: '137.03px', top: '99.76px', border: '1px solid #D6D1CD', borderRadius: '9999px' }} />
            <div className="absolute" style={{ width: '27.7px', height: '27.7px', left: '148.28px', top: '111.02px', border: '1px solid #D6D1CD', borderRadius: '9999px' }} />

            {/* 放射线 */}
            <div className="absolute" style={{ width: '58px', height: '0px', left: '162.13px', top: '66.87px', borderTop: '1px solid #D6D1CD', transform: 'rotate(90deg)' }} />
            <div className="absolute" style={{ width: '57.32px', height: '0px', left: '107.6px', top: '109.28px', borderTop: '1px solid #D6D1CD', transform: 'rotate(-165.12deg)' }} />
            <div className="absolute" style={{ width: '56.79px', height: '0px', left: '127.51px', top: '124px', borderTop: '1px solid #D6D1CD', transform: 'rotate(127.57deg)' }} />
            <div className="absolute" style={{ width: '56.65px', height: '0px', left: '163px', top: '124.87px', borderTop: '1px solid #D6D1CD', transform: 'rotate(51.2deg)' }} />
            <div className="absolute" style={{ width: '57.55px', height: '0px', left: '163px', top: '109.28px', borderTop: '1px solid #D6D1CD', transform: 'rotate(-15.71deg)' }} />

            {/* 中心雷达多边形填充 */}
            <div className="absolute" style={{ width: '87.87px', height: '82.67px', left: '114.52px', top: '84.61px', background: 'linear-gradient(173.36deg, rgba(255, 233, 197, 0.4) 5.21%, rgba(245, 172, 89, 0.4) 89.69%)', border: '1px solid #C6BFB9', borderRadius: '12px' }} />

            {/* 画面能力解读标题+提示圆点 */}
            <div className="absolute" style={{ width: '10px', height: '10px', left: '248px', top: '17px', background: 'rgba(125, 125, 125, 0.4)', borderRadius: '50%' }} />
            <div className="absolute" style={{ left: '252px', top: '18px', width: '2px', height: '8px', color: '#FFFFFF', fontFamily: 'Source Han Sans CN', fontWeight: 700, fontSize: '6px', lineHeight: '9px' }}>i</div>
            <div className="absolute" style={{ width: '48px', height: '12px', left: '262px', top: '16px' }}>
              <span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 700, fontSize: '8px', lineHeight: '12px', color: '#A19E97' }}>画面能力解读</span>
            </div>

            {/* 能力标签 */}
            <div className="absolute" style={{ width: '36px', height: '18px', left: 'calc(50% - 36px/2 - 0.5px)', top: '35px' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#434343' }}>故事力</span></div>
            <div className="absolute" style={{ width: '36px', height: '18px', left: 'calc(50% - 36px/2 + 76.5px)', top: '93px' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#434343' }}>想象力</span></div>
            <div className="absolute" style={{ width: '48px', height: '18px', left: 'calc(50% - 48px/2 + 52.5px)', top: '171px' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#434343' }}>情感表达</span></div>
            <div className="absolute" style={{ width: '48px', height: '18px', left: 'calc(50% - 48px/2 - 49.5px)', top: '171px' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#434343' }}>逻辑结构</span></div>
            <div className="absolute" style={{ width: '36px', height: '18px', left: 'calc(50% - 36px/2 - 75.5px)', top: '93px' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#434343' }}>观察力</span></div>

            {/* 百分比标注 */}
            <div className="absolute" style={{ width: '25px', height: '18px', left: 'calc(50% - 25px/2)', top: '49px', color: '#EF762A' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px' }}>62%</span></div>
            <div className="absolute" style={{ width: '25px', height: '18px', left: 'calc(50% - 25px/2 - 75px)', top: '109px', color: '#EF762A' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px' }}>86%</span></div>
            <div className="absolute" style={{ width: '25px', height: '18px', left: 'calc(50% - 25px/2 - 49px)', top: '188px', color: '#EF762A' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px' }}>91%</span></div>
            <div className="absolute" style={{ width: '25px', height: '18px', left: 'calc(50% - 25px/2 + 53px)', top: '189px', color: '#EF762A' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px' }}>70%</span></div>
            <div className="absolute" style={{ width: '25px', height: '18px', left: 'calc(50% - 25px/2 + 77px)', top: '114px', color: '#EF762A' }}><span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '18px' }}>65%</span></div>

            {/* 信息更新时间 */}
            <div className="absolute" style={{ width: '92px', height: '15px', left: '219px', top: '215px' }}>
              <span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 400, fontSize: '10px', lineHeight: '15px', color: '#A19E97' }}>*信息更新至9月15日</span>
            </div>
          </div>

          {/* Group 44 - 周报卡片 */}
          <div className="absolute" style={{ width: '324px', height: '237px', left: '24px', top: '285px' }}>
            {/* Rectangle 47 */}
            <div className="absolute" style={{ width: '324px', height: '237px', left: '0px', top: '0px', background: '#FFFBF4', border: '1px solid #FFFFFF', boxShadow: '0px 0px 13.7px rgba(98, 98, 98, 0.25)', borderRadius: '15px' }} />

            {/* 左上角图标与标题 */}
            <div className="absolute" style={{ width: '16px', height: '16px', left: '16px', top: '15px', borderRadius: '5px', background: 'linear-gradient(180deg, #FF9442 0%, #FF6A57 100%)' }} />
            <div className="absolute" style={{ width: '56px', height: '24px', left: '38px', top: '11px' }}>
              <span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 900, fontSize: '14px', lineHeight: '24px', color: '#434343' }}>故事大王</span>
            </div>

            {/* 小标题 */}
            <div className="absolute" style={{ width: '84px', height: '24px', left: '24px', top: '54px' }}>
              <span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '24px', color: '#434343' }}>表达能力发展图</span>
            </div>
            <div className="absolute" style={{ width: '60px', height: '24px', left: '174px', top: '54px' }}>
              <span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '12px', lineHeight: '24px', color: '#434343' }}>金句库更新</span>
            </div>

            {/* 占位图区域 */}
            <div className="absolute" style={{ width: '88px', height: '76px', left: '35px', top: '102px', border: '1px solid #C6BFB9' }} />

            {/* 金句内容 */}
            <div className="absolute" style={{ width: '134px', height: '17px', left: '174px', top: '85px' }}>
              <span style={{ fontFamily: 'Source Han Sans CN', fontWeight: 500, fontSize: '8px', lineHeight: '12px', color: '#000000' }}>新增金句：“太阳下班了，月亮来替他值班。”</span>
            </div>
          </div>
        </div>
        
        {/* 成长页底色图片（来自Figma） */}
        <img
          src={require('../assets/images/grow-paper-bg.png')}
          alt="grow background paper"
          className="absolute object-cover"
          style={{
            width: '324px',
            height: '576px',
            left: '26px',
            top: '826px'
          }}
        />

        {/* 底部留白移除以避免出现白色空档，由外层 AppShell 负责底部安全间距 */}
      </div>
    </div>
  );
};

export default GrowPage;


