import { CurriculumSubject, EducationLevel } from '../types';

export const EDUCATION_PROGRAMS = [
  {
    id: 'class12',
    name: 'Class 12 (Senior Secondary)',
    level: 'class12' as EducationLevel,
    streams: ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Humanities / Arts'],
    description: 'CBSE, ISC, and State Board curriculum prep for Board exams and competitive entrance foundations.'
  },
  {
    id: 'btech',
    name: 'B.Tech / B.E. (Engineering)',
    level: 'btech' as EducationLevel,
    branches: [
      'Computer Science and Engineering (CSE)',
      'Information Technology (IT)',
      'Electronics & Communication Engineering (ECE)',
      'Electrical & Electronics Engineering (EEE)',
      'Mechanical Engineering (ME)',
      'Civil Engineering (CE)',
      'Artificial Intelligence & Data Science (AI & DS)'
    ],
    semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
    description: 'Autonomous, AICTE, and University Engineering curricula with code, theory, labs, and project notes.'
  },
  {
    id: 'undergrad',
    name: 'Undergraduate Degrees (B.Sc / BCA / B.Com / BBA)',
    level: 'undergrad' as EducationLevel,
    programs: ['B.Sc Computer Science', 'B.Sc Physics', 'B.Sc Mathematics', 'BCA', 'B.Com', 'BBA', 'BA Economics'],
    semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'],
    description: 'Higher education degree programs with semester-wise core subjects and revision guides.'
  },
  {
    id: 'advanced',
    name: 'Advanced & Professional Learning',
    level: 'advanced' as EducationLevel,
    domains: ['M.Tech / Postgraduate', 'Cloud Architecture & DevOps', 'Machine Learning & AI Research', 'Data Science & Analytics', 'Gate & Competitive Technical Prep'],
    description: 'Advanced research-oriented learning, system design, and specialized technical mastery.'
  }
];

export const CURRICULUM_SUBJECTS: CurriculumSubject[] = [
  // Class 12
  {
    id: 'c12-math',
    name: 'Mathematics',
    code: 'MATH-12',
    educationLevel: 'class12',
    program: 'Class 12',
    chapters: [
      'Relations and Functions',
      'Inverse Trigonometric Functions',
      'Matrices & Determinants',
      'Continuity and Differentiability',
      'Application of Derivatives',
      'Integrals & Differential Equations',
      'Vector Algebra & Three Dimensional Geometry',
      'Linear Programming & Probability'
    ]
  },
  {
    id: 'c12-phy',
    name: 'Physics',
    code: 'PHY-12',
    educationLevel: 'class12',
    program: 'Class 12',
    chapters: [
      'Electrostatics & Electric Potential',
      'Current Electricity & Kirchhoffs Laws',
      'Magnetic Effects of Current & Magnetism',
      'Electromagnetic Induction & Alternating Currents',
      'Electromagnetic Waves & Ray Optics',
      'Wave Optics & Dual Nature of Radiation',
      'Atoms and Nuclei',
      'Semiconductor Electronics & Logic Gates'
    ]
  },
  {
    id: 'c12-chem',
    name: 'Chemistry',
    code: 'CHEM-12',
    educationLevel: 'class12',
    program: 'Class 12',
    chapters: [
      'Solutions & Colligative Properties',
      'Electrochemistry & Chemical Kinetics',
      'd and f-Block Elements & Coordination Compounds',
      'Haloalkanes and Haloarenes',
      'Alcohols, Phenols and Ethers',
      'Aldehydes, Ketones and Carboxylic Acids',
      'Amines & Biomolecules'
    ]
  },
  {
    id: 'c12-cs',
    name: 'Computer Science (Python)',
    code: 'CS-12',
    educationLevel: 'class12',
    program: 'Class 12',
    chapters: [
      'Python Revision & Functions',
      'File Handling (Text, Binary, CSV)',
      'Data Structures: Stacks using Lists',
      'Computer Networks & Protocols',
      'Database Management & SQL Queries',
      'Interface Python with SQL'
    ]
  },
  {
    id: 'c12-acc',
    name: 'Accountancy',
    code: 'ACC-12',
    educationLevel: 'class12',
    program: 'Class 12',
    chapters: [
      'Accounting for Partnership Firms: Fundamentals',
      'Goodwill & Change in Profit Sharing Ratio',
      'Admission, Retirement & Death of a Partner',
      'Dissolution of Partnership Firm',
      'Accounting for Share Capital & Debentures',
      'Financial Statements of a Company & Cash Flow Statement'
    ]
  },
  {
    id: 'c12-eco',
    name: 'Economics',
    code: 'ECO-12',
    educationLevel: 'class12',
    program: 'Class 12',
    chapters: [
      'National Income Accounting',
      'Money and Banking',
      'Determination of Income and Employment',
      'Government Budget and the Economy',
      'Balance of Payments & Foreign Exchange',
      'Indian Economy on the Eve of Independence & Reforms'
    ]
  },

  // B.Tech Core - 1st Year (Common)
  {
    id: 'btech-c-prog',
    name: 'Programming in C',
    code: 'CS101',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Computer Science and Engineering (CSE)',
    semester: 'Semester 1',
    chapters: [
      'C Fundamentals, Operators & Control Flow',
      'Functions, Scope and Recursion',
      'Arrays and Strings Manipulation',
      'Pointers, Dynamic Memory Allocation (malloc, free)',
      'Structures, Unions and Bit-fields',
      'File I/O and Preprocessor Directives'
    ]
  },
  {
    id: 'btech-eng-math1',
    name: 'Engineering Mathematics I',
    code: 'MA101',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Common (All Branches)',
    semester: 'Semester 1',
    chapters: [
      'Matrices, Rank, Eigenvalues and Eigenvectors',
      'Differential Calculus: Rolles, Mean Value Theorems, Maclaurin Series',
      'Partial Differentiation & Eulers Theorem',
      'Maxima and Minima of Functions of Several Variables',
      'Multiple Integrals (Double and Triple)',
      'Vector Calculus: Gradient, Divergence, Curl, Gauss/Stokes Theorems'
    ]
  },
  {
    id: 'btech-eng-phy',
    name: 'Engineering Physics',
    code: 'PH101',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Common (All Branches)',
    semester: 'Semester 1',
    chapters: [
      'Quantum Mechanics: Wave-Particle Duality, Schrodinger Equation',
      'Lasers & Fiber Optics Principles',
      'Electrodynamics & Maxwells Equations',
      'Semiconductor Physics, Fermi Level, Hall Effect',
      'Superconductivity & Nanomaterials'
    ]
  },
  {
    id: 'btech-bee',
    name: 'Basic Electrical Engineering',
    code: 'EE101',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Common (All Branches)',
    semester: 'Semester 1',
    chapters: [
      'DC Circuits: Mesh, Nodal Analysis, Thevenin/Norton Theorems',
      'AC Circuits: Single Phase, Phasors, Resonance, Power Factor',
      'Three-Phase Balanced Systems',
      'Single Phase Transformers: Construction and Losses',
      'DC Machines and Induction Motors Basics'
    ]
  },

  // B.Tech CSE / IT - 2nd Year (Semester 3 & 4)
  {
    id: 'btech-dsa',
    name: 'Data Structures and Algorithms',
    code: 'CS201',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Computer Science and Engineering (CSE)',
    semester: 'Semester 3',
    chapters: [
      'Asymptotic Notation & Time Complexity Analysis',
      'Arrays, Linked Lists (Singly, Doubly, Circular)',
      'Stacks and Queues: Implementation & Applications',
      'Trees: Binary Trees, BST, AVL Trees, Heaps',
      'Graphs: BFS, DFS, Dijkstra, Prim & Kruskal',
      'Sorting & Searching: Quick, Merge, Binary Search, Hash Tables'
    ]
  },
  {
    id: 'btech-dbms',
    name: 'Database Management Systems',
    code: 'CS204',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Computer Science and Engineering (CSE)',
    semester: 'Semester 4',
    chapters: [
      'Relational Model, ER Diagrams, Relational Algebra',
      'SQL: DDL, DML, Subqueries, Joins, Triggers',
      'Database Normalization (1NF, 2NF, 3NF, BCNF)',
      'Transaction Management, ACID Properties',
      'Concurrency Control, Locking & Deadlocks',
      'Indexing (B-Trees, Hash Indexing) & Query Optimization'
    ]
  },
  {
    id: 'btech-os',
    name: 'Operating Systems',
    code: 'CS205',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Computer Science and Engineering (CSE)',
    semester: 'Semester 4',
    chapters: [
      'Processes, Threads, and Inter-Process Communication',
      'CPU Scheduling Algorithms (FCFS, SJF, Round Robin)',
      'Process Synchronization, Mutex, Semaphores, Classic Problems',
      'Deadlock Characterization, Prevention, Avoidance, Bankers Algorithm',
      'Memory Management, Paging, Segmentation, Virtual Memory',
      'File Systems & Disk Scheduling (SCAN, C-SCAN)'
    ]
  },

  // B.Tech CSE / IT - 3rd Year (Semester 5 & 6)
  {
    id: 'btech-cn',
    name: 'Computer Networks',
    code: 'CS301',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Computer Science and Engineering (CSE)',
    semester: 'Semester 5',
    chapters: [
      'OSI and TCP/IP Reference Models',
      'Data Link Layer: Framing, Error Detection (CRC), Sliding Window',
      'Network Layer: IP Addressing, Subnetting, Routing (Distance Vector, OSPF, BGP)',
      'Transport Layer: TCP vs UDP, Flow Control, Congestion Control',
      'Application Layer: DNS, HTTP, HTTPS, SMTP, FTP',
      'Network Security: Firewalls, Cryptography Basics, SSL/TLS'
    ]
  },
  {
    id: 'btech-ai-ml',
    name: 'Artificial Intelligence & Machine Learning',
    code: 'CS304',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Computer Science and Engineering (CSE)',
    semester: 'Semester 6',
    chapters: [
      'Intelligent Agents, Search Strategies (A*, Minimax, Alpha-Beta)',
      'Knowledge Representation and Propositional Logic',
      'Supervised Learning: Linear/Logistic Regression, Decision Trees, SVM',
      'Unsupervised Learning: K-Means Clustering, PCA',
      'Neural Networks: Perceptrons, Backpropagation, Activation Functions',
      'Model Evaluation, Bias-Variance Tradeoff, Cross-Validation'
    ]
  },
  {
    id: 'btech-web-dev',
    name: 'Web Development & Cloud Computing',
    code: 'CS305',
    educationLevel: 'btech',
    program: 'B.Tech',
    branch: 'Information Technology (IT)',
    semester: 'Semester 6',
    chapters: [
      'HTML5, Modern CSS, Responsive Design & Tailwind',
      'JavaScript ES6+, DOM Manipulation, Asynchronous Programming',
      'React Architecture, State Management, Hooks & Component Lifecycle',
      'Node.js, Express RESTful APIs & Middleware Architecture',
      'Database Integration (PostgreSQL, MongoDB) & Authentication',
      'Cloud Deployment, Containerization (Docker) & CI/CD Pipelines'
    ]
  },

  // Undergraduate Non-Engineering (B.Sc / BCA / B.Com)
  {
    id: 'bca-python',
    name: 'Python for Data Analysis',
    code: 'BCA202',
    educationLevel: 'undergrad',
    program: 'BCA',
    semester: 'Semester 3',
    chapters: [
      'Python Syntax & Object-Oriented Principles',
      'NumPy: Multidimensional Arrays and Operations',
      'Pandas: Series, DataFrames, Data Cleaning & Wrangling',
      'Matplotlib and Seaborn for Data Visualization',
      'Statistical Analysis & Exploratory Data Analysis (EDA)'
    ]
  },
  {
    id: 'bcom-fin-mgmt',
    name: 'Financial Management',
    code: 'BCOM301',
    educationLevel: 'undergrad',
    program: 'B.Com',
    semester: 'Semester 5',
    chapters: [
      'Nature and Scope of Financial Management',
      'Time Value of Money & Compounding/Discounting',
      'Capital Budgeting Techniques (NPV, IRR, Payback)',
      'Cost of Capital & Capital Structure Theories',
      'Working Capital Management & Cash Flow Analysis'
    ]
  }
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', description: 'Standard academic and technical English' },
  { code: 'hi', name: 'Hindi (हिन्दी)', description: 'Clear Hindi with standard technical terms' },
  { code: 'hinglish', name: 'Hinglish (Colloquial)', description: 'Conversational blend of English and Hindi for high retention' },
  { code: 'ta', name: 'Tamil (தமிழ்)', description: 'Accessible Tamil with engineering terminology' },
  { code: 'te', name: 'Telugu (తెలుగు)', description: 'Telugu educational instruction' },
  { code: 'mr', name: 'Marathi (मराठी)', description: 'Marathi explanations with academic clarity' },
  { code: 'bn', name: 'Bengali (বাংলা)', description: 'Bengali educational guidance' }
];
