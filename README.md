# 诛仙3战力计算系统 (New ZX Calc)

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![Tech Stack](https://img.shields.io/badge/tech-React%20%7C%20Vite%20%7C%20Tailwind-blue)

这是一个为《诛仙3》玩家设计的现代化战力评估与伤害计算工具。它可以帮助玩家精确模拟在不同副本、针对不同怪物时，使用各种技能的预期伤害输出，并给出综合战力评分。

## ✨ 核心功能

- **精密伤害模拟**：基于游戏核心公式，计算角色最大/最小攻击、气血、真气、爆伤等属性对最终伤害的影响。
- **职业与阵营支持**：支持多职业切换，并细化到仙、佛、魔三大阵营的技能差异。
- **动态副本评估**：内置多个经典副本（如劫起空桑、兽神降临、T16-T18等）及怪物数据，实时反馈击杀效率。
- **战斗增益系统**：可自由配置专注、巫咒、绿点等常见战斗 Buff，模拟最真实的输出环境。
- **现代化视觉体验**：采用“游戏暗黑风”+“毛玻璃特效”设计，支持响应式布局，完美适配手机与电脑。
- **数据可视化**：通过多维雷达图和战力等级评级（SSS/S/A等），直观展示角色强项与短板。

## 🚀 技术栈

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS (暗黑模式优化)
- **Build Tool**: Vite
- **Charts**: Recharts (用于属性分布雷达图)
- **Icons**: Lucide React

## 📂 项目结构

```text
.
├── web_app/            # 前端 React 应用代码
│   ├── src/            # 源代码（包含计算逻辑与 UI 组件）
│   └── public/         # 静态资源
├── doc/                # 项目设计文档与调试说明
│   └── 诛仙3战力计算系统设计文档.md
└── README.md           # 项目自述文件
```

## 🛠️ 本地开发

1. **进入前端目录**:
   ```bash
   cd web_app
   ```

2. **安装依赖**:
   ```bash
   npm install
   ```

3. **启动开发服务器**:
   ```bash
   npm run dev
   ```

4. **构建部署**:
   ```bash
   npm run build
   ```

## 📈 路线图 (Roadmap)

- [x] 核心伤害计算引擎
- [x] 基础职业技能数据库
- [x] 暗黑风格 UI 实现
- [ ] 更多四代技能 (赤乌/玄烛) 数据完善
- [ ] 装备系统自动配装模拟
- [ ] 导入/导出角色配置功能

## 📝 免责声明

本系统仅供游戏爱好者交流学习使用，所有计算结果均为基于公式的模拟值，实际数值以游戏内表现为准。

---
*制作：[myonlystarWang](https://github.com/myonlystarWang)*
