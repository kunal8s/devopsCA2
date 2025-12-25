
Project Title
Branching, Merging & Conflict Resolution Using Git Bash

📌 Project Description
This project demonstrates the practical usage of Git Bash and GitHub for version control through the development of a full-stack Online Examination and AI-based Proctoring Application. The project is built using the MERN stack (MongoDB, Express.js, React, Node.js) for scalable web application development, with Grafana integrated to visualize system performance and monitoring metrics.

Git is used extensively to understand and apply core version-control concepts such as repository initialization, staging, committing, branching, merging, merge conflict resolution, and remote repository management using GitHub. The project follows a structured Git workflow with feature branches for frontend, backend, AI-proctoring modules, and monitoring configurations.

The application includes online exam management, real-time proctoring, user authentication, and performance monitoring, with multiple frontend components, backend APIs, database schemas, and monitoring configurations tracked and maintained using Git. Grafana dashboards are used to visualize metrics such as server performance, API response time, and resource usage, enabling better observability during development and testing.

Overall, this project showcases real-world collaborative development practices using Git Bash and GitHub while building a production-oriented MERN-based online exam and proctoring system with performance visualization and proper version control best practices.

 📁 Project Structure
exam-proctoring-system/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── monitoring/
│   │   ├── prometheus.yml
│   │   └── grafana/
│   │
│   ├── scripts/
│   ├── logs/
│   ├── app.js
│   ├── server.js
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   ├── package-lock.json
│   ├── eslint.config.js
│   ├── jest.config.js
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── styles/
│   │   └── App.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── eslint.config.js
│   └── README.md
│
├── session-auth/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   └── middlewares/
│   │
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── dummy/
│   └── (testing / experimental files)
│
├── structure.txt
├── folders.txt
└── README.md



 🛠️ Tools & Technologies Used
- Git Bash
- Git
- GitHub
- Node
- Express
- React
- MongoDB
- Grafana
- Windows OS

🎯 Objectives
- To understand version control using Git
- To perform Git operations using Git Bash
- To create and manage multiple branches
- To perform merge and resolve merge conflicts
- To push local repository to GitHub
- To document the complete workflow using README.md
- To monitor and visualize application performance metrics using Grafana for system observability

⚙️ Git Commands Used
- `git init`
- `git status`
- `git add`
- `git commit`
- `git branch`
- `git checkout`
- `git merge`
- `git log`
- `git remote`
- `git push`


🌿 Branches Created
The following branches were created and used in this project:
- `main`
- `feature`
- `test`
- `bugfix`
- `experiment`

## 📸 Screenshots
1. Git Repository Initialization
<img width="1920" height="945" alt="image" src="https://github.com/user-attachments/assets/481fcb77-d058-43b1-a711-9169f6d1fbd4" />

2. Git Repository First Commit
<img width="1375" height="508" alt="Screenshot (2407)" src="https://github.com/user-attachments/assets/4bcaa0b6-6360-43bd-bcbd-ea10d65212f5" />

3. Branch Creation
<img width="701" height="363" alt="Screenshot (2408)" src="https://github.com/user-attachments/assets/e8eadca1-da0d-40c1-b46e-a03ce6d008eb" />

4. Merge Operation
<img width="1920" height="1080" alt="Screenshot (2411)" src="https://github.com/user-attachments/assets/dac4ad5e-a525-426c-a381-a6e0b6c0e994" />

<img width="1920" height="1080" alt="Screenshot (2412)" src="https://github.com/user-attachments/assets/9338a03e-b855-4235-b53b-5bc0b5473347" />


5. Merge Conflict
<img width="997" height="683" alt="Screenshot 2025-12-22 151658" src="https://github.com/user-attachments/assets/2dc5e1bf-73d5-4dff-9d6e-84a55caf014c" />

6. Commit Graph
<img width="1920" height="1080" alt="Screenshot (2413)" src="https://github.com/user-attachments/assets/ac9715c2-4f37-4f7b-95f3-1dc9eba96eda" />

7. GitHub Repository
<img width="1920" height="1080" alt="Screenshot (2414)" src="https://github.com/user-attachments/assets/7ce55d7f-844c-4219-9e57-016f5b08c9c9" />

<img width="1920" height="1080" alt="Screenshot (2416)" src="https://github.com/user-attachments/assets/9325f198-038c-4c8b-ae5c-926ec22d45f1" />


8. Commit history on GitHub
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/41fc3b8d-cdce-49d7-93c3-6f04ba2c7c53" />

9. Branch history
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c3afd1f0-b105-43e3-af72-7603d7d84640" />

10. Metrics endpoints readings
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b52e479c-99fd-4b0c-9068-4d1889e200c2" />

11. Docker startup
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/aab0bebd-7268-44c2-886a-44ff1fa456ef" />

12. Grafana Dashboard
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5088b0e7-17bf-4f2c-97b7-15da22553a21" />


🚧 Challenges Faced
- Understanding merge conflicts
- Resolving conflicts manually
- Working with Vim editor during merge commits
- Managing multiple branches

✅ Learning Outcomes
- Gained hands-on experience with Git Bash
- Learned proper Git workflow
- Understood branching and merging
- Learned conflict resolution techniques
- Learned how to use GitHub as a remote repository

 🏁 Conclusion
This project provided practical exposure to Git and GitHub operations.
It helped in understanding how version control systems work in real-world
projects and improved confidence in using Git Bash for collaborative development.
