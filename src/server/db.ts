import fs from 'fs';
import path from 'path';
import { User, SavedResource, EducationLevel } from '../types';

interface DatabaseSchema {
  users: User[];
  resources: SavedResource[];
  version: number;
  lastUpdated: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'multigrade_store.json');

const INITIAL_USERS: User[] = [
  {
    id: 'user-btech-student',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    role: 'student',
    studentProfile: {
      educationLevel: 'btech',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering (CSE)',
      year: '2nd Year',
      semester: 'Semester 3',
      preferredLanguage: 'English',
      learningStyle: 'step-by-step',
      difficulty: 'intermediate'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-c12-student',
    name: 'Priya Sen',
    email: 'priya.sen@school.edu',
    role: 'student',
    studentProfile: {
      educationLevel: 'class12',
      degree: 'Class 12',
      branch: 'Science (PCM)',
      year: '12th Grade',
      preferredLanguage: 'Hinglish',
      learningStyle: 'example-heavy',
      difficulty: 'intermediate'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-teacher-prof',
    name: 'Prof. Rajeshwar Verma',
    email: 'r.verma@institute.edu',
    role: 'teacher',
    teacherProfile: {
      institution: 'National Institute of Engineering & Technology',
      subjectsTaught: ['Data Structures and Algorithms', 'Programming in C', 'Engineering Mathematics'],
      educationLevelsTaught: ['btech', 'undergrad'],
      preferredLanguage: 'English',
      experienceYears: 12
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-teacher-school',
    name: 'Dr. Meenakshi Sundaram',
    email: 'm.sundaram@vidyalaya.edu',
    role: 'teacher',
    teacherProfile: {
      institution: 'Apex Senior Secondary Academy',
      subjectsTaught: ['Physics', 'Mathematics', 'Engineering Physics'],
      educationLevelsTaught: ['class12', 'btech'],
      preferredLanguage: 'English',
      experienceYears: 18
    },
    createdAt: new Date().toISOString()
  }
];

const INITIAL_RESOURCES: SavedResource[] = [
  {
    id: 'res-seed-1',
    userId: 'user-btech-student',
    title: 'Data Structures: AVL Tree Rotations & Balancing Logic',
    subject: 'Data Structures and Algorithms',
    topic: 'AVL Trees & Rotations',
    educationLevel: 'btech',
    program: 'B.Tech CSE',
    semester: 'Semester 3',
    resourceType: 'notes',
    content: `# AVL Trees & Self-Balancing Binary Search Trees

### 1. Fundamental Definition
An **AVL Tree** (Adelson-Velsky and Landis) is a strictly height-balanced Binary Search Tree (BST) where the difference between heights of left and right subtrees for every node (the **Balance Factor**) is strictly within the range {-1, 0, +1}.

$$\\text{Balance Factor } (BF) = \\text{Height}(LeftSubtree) - \\text{Height}(RightSubtree)$$

### 2. Time Complexity Comparison
| Operation | Standard BST (Worst Case) | AVL Tree (Guaranteed) |
| :--- | :--- | :--- |
| Search | $O(N)$ (skewed tree) | $O(\\log N)$ |
| Insertion | $O(N)$ | $O(\\log N)$ |
| Deletion | $O(N)$ | $O(\\log N)$ |

### 3. The Four Rotation Cases
1. **Left-Left (LL) Heavy**: Node insertion in left subtree of left child. Fixed by **Single Right Rotation**.
2. **Right-Right (RR) Heavy**: Node insertion in right subtree of right child. Fixed by **Single Left Rotation**.
3. **Left-Right (LR) Heavy**: Node insertion in right subtree of left child. Fixed by **Double Rotation**: Left rotation on child, followed by Right rotation on parent.
4. **Right-Left (RL) Heavy**: Node insertion in left subtree of right child. Fixed by **Double Rotation**: Right rotation on child, followed by Left rotation on parent.

### 4. Implementation in C (Snippet)
\`\`\`c
struct Node* rightRotate(struct Node* y) {
    struct Node* x = y->left;
    struct Node* T2 = x->right;

    // Perform rotation
    x->right = y;
    y->left = T2;

    // Update heights
    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;

    // Return new root
    return x;
}
\`\`\`

### 5. Exam Tip & Common Mistake
Never recompute heights recursively from scratch after a rotation! Instead, update the affected node heights in $O(1)$ time using child pointers.`,
    metadata: {
      difficulty: 'intermediate',
      language: 'English',
      tags: ['DSA', 'Trees', 'C', 'Sem 3']
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'res-seed-2',
    userId: 'user-c12-student',
    title: 'Class 12 Physics: Kirchhoff\'s Laws & Wheatstone Bridge Summary',
    subject: 'Physics',
    topic: 'Current Electricity & Circuit Theorems',
    educationLevel: 'class12',
    program: 'Class 12',
    resourceType: 'formula_sheet',
    content: `# Current Electricity — Circuit Theorems & Formulas

### 1. Kirchhoff's First Law (Junction Rule / KCL)
- **Principle**: Conservation of Electric Charge.
- **Statement**: The algebraic sum of currents meeting at any electrical junction is zero.
$$\\sum I = 0$$
- *Sign Convention*: Current entering junction is positive (+), current leaving is negative (-).

### 2. Kirchhoff's Second Law (Loop Rule / KVL)
- **Principle**: Conservation of Energy.
- **Statement**: The algebraic sum of changes in potential around any closed loop of a network is zero.
$$\\sum \\Delta V = 0 \\implies \\sum IR = \\sum \\mathcal{E}$$

### 3. Wheatstone Bridge Principle
A balanced condition occurs when no current flows through the galvanometer ($I_g = 0$):
$$\\frac{P}{Q} = \\frac{R}{S}$$
- **Sensitivity Condition**: A Wheatstone bridge is most sensitive when all four arms have approximately equal resistance ($P \\approx Q \\approx R \\approx S$).

### 4. Worked Board Exam Problem
**Problem**: In a metre bridge experiment, the null point is found at a distance of $40\\text{ cm}$ from end A when an unknown resistor $X$ is connected in the left gap and standard resistor $R = 12\\,\\Omega$ is in the right gap. Find $X$.
**Solution**:
$$\\frac{X}{R} = \\frac{l}{100 - l} \\implies \\frac{X}{12} = \\frac{40}{100 - 40} = \\frac{40}{60} = \\frac{2}{3}$$
$$X = 12 \\times \\frac{2}{3} = 8\\,\\Omega$$`,
    metadata: {
      difficulty: 'intermediate',
      language: 'English',
      tags: ['Board Exam', 'Physics', 'Circuits', 'Class 12']
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'res-seed-3',
    userId: 'user-teacher-prof',
    title: 'MultiGrade Teaching: Rate of Change & Calculus Intuition (Class 12 vs B.Tech)',
    subject: 'Mathematics & Computer Science',
    topic: 'Rate of Change, Differentiation, and Gradient Descent',
    educationLevel: 'btech',
    program: 'MultiGrade Mitra Core',
    resourceType: 'multigrade',
    content: `# MultiGrade Differentiated Instruction Guide: Calculus & Rate of Change

## Core Domain Theme
Understanding rates of change: from geometric tangent slopes in school calculus to multivariable gradients and optimization in engineering computing.

---

### Tier 1: Class 12 Level — Geometric Intuition & Derivatives
- **Cognitive Target**: Geometric interpretation, limit definition, derivative formulas, and instantaneous rate of change.
- **Key Equation**:
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$
- **Classroom Activity**: Graphing $f(x) = x^2$ on graph paper, calculating average rate of change between secants, observing slope approaching tangent at $x = 2$ ($m = 4$).
- **Practice Problems**:
  1. Find derivative of $\\sin(x^2)$ using Chain Rule.
  2. Prove that the derivative of a constant function is zero from first principles.

---

### Tier 2: 1st Year B.Tech — Taylor Series & Partial Derivatives
- **Cognitive Target**: Multivariable functions, partial rate of change along coordinate axes, and series approximations.
- **Key Equation**:
$$\\frac{\\partial f}{\\partial x} = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x, y) - f(x, y)}{\\Delta x}$$
- **Classroom Activity**: Analyze a 3D terrain $z = x^2 + y^2$. Calculate the directional slope moving due East vs due North.
- **Practice Problems**:
  1. Given $u = \\ln(x^3 + y^3 - x^2y)$, verify Euler's theorem for homogeneous functions.
  2. Expand $f(x, y) = e^x \\cos(y)$ in powers of $x$ and $y$ up to second degree.

---

### Tier 3: 2nd/3rd Year B.Tech (CSE / Data Science) — Gradients in Machine Learning
- **Cognitive Target**: Vector calculus, the gradient vector $\\nabla f$, Jacobian matrices, and Gradient Descent optimization.
- **Key Equation**:
$$\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla L(\\mathbf{w}_t)$$
- **Classroom Activity**: Implement 10 lines of Python code using NumPy to optimize quadratic loss $L(w) = (w - 4)^2$. Plot convergence curves under different learning rates $\\eta \\in \\{0.01, 0.1, 1.2\\}$.
- **Practice Problems**:
  1. Compute gradient of Mean Squared Error loss with respect to weight vector $\\mathbf{w}$.
  2. Explain why saddle points cause standard gradient descent to stall.`,
    metadata: {
      difficulty: 'advanced',
      language: 'English',
      targetGrades: ['Class 12', '1st Year B.Tech', '2nd Year B.Tech CSE'],
      tags: ['MultiGrade', 'Pedagogy', 'Calculus', 'AI/ML']
    },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.resources)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing with defaults:', err);
    }

    const initialData: DatabaseSchema = {
      users: INITIAL_USERS,
      resources: INITIAL_RESOURCES,
      version: 1,
      lastUpdated: new Date().toISOString()
    };

    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private persist() {
    this.data.lastUpdated = new Date().toISOString();
    this.saveDataDirect(this.data);
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id' | 'createdAt'> & { id?: string }): User {
    const newUser: User = {
      id: user.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: user.name,
      email: user.email,
      role: user.role,
      studentProfile: user.studentProfile,
      teacherProfile: user.teacherProfile,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      id // preserve ID
    };
    this.persist();
    return this.data.users[idx];
  }

  // Resources
  getResources(userId?: string, filters?: { resourceType?: string; educationLevel?: string; query?: string }): SavedResource[] {
    let list = this.data.resources;
    if (userId) {
      list = list.filter((r) => r.userId === userId);
    }

    if (filters) {
      if (filters.resourceType && filters.resourceType !== 'all') {
        list = list.filter((r) => r.resourceType === filters.resourceType);
      }
      if (filters.educationLevel && filters.educationLevel !== 'all') {
        list = list.filter((r) => r.educationLevel === filters.educationLevel);
      }
      if (filters.query && filters.query.trim()) {
        const q = filters.query.toLowerCase();
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.subject.toLowerCase().includes(q) ||
            r.topic.toLowerCase().includes(q) ||
            r.content.toLowerCase().includes(q)
        );
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getResourceById(id: string): SavedResource | undefined {
    return this.data.resources.find((r) => r.id === id);
  }

  createResource(resource: Omit<SavedResource, 'id' | 'createdAt' | 'updatedAt'>): SavedResource {
    const newRes: SavedResource = {
      ...resource,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.resources.unshift(newRes);
    this.persist();
    return newRes;
  }

  updateResource(id: string, updates: Partial<SavedResource>): SavedResource | undefined {
    const idx = this.data.resources.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.data.resources[idx] = {
      ...this.data.resources[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.resources[idx];
  }

  deleteResource(id: string, userId: string): boolean {
    const idx = this.data.resources.findIndex((r) => r.id === id && r.userId === userId);
    if (idx === -1) return false;
    this.data.resources.splice(idx, 1);
    this.persist();
    return true;
  }
}

export const db = new Database();
