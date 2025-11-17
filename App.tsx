import React, { useState, useEffect } from 'react';
import { User, Student, Professor, Project, Application, UserRole, ApplicationStatus } from './types';
import { IcarusLogo, UserIcon, UploadIcon, CheckIcon, XIcon, Spinner, ProfessorIcon, LoginIcon } from './components/icons';
import Modal from './components/Modal';

// Mock Data
const MOCK_PROFESSORS: Professor[] = [
  { id: 1, nusp: '12345', name: 'Prof. Chinam', email: 'chinam@usp.br', role: UserRole.PROFESSOR, faculty: 'EP', department: 'PMR', password: '123' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 2, nusp: '54321', name: 'Aluno Fulano', email: 'fulano@usp.br', role: UserRole.STUDENT, course: 'Engenharia Mecatrônica', idealPeriod: 7, password: '123' },
];

const MOCK_PROJECTS: Project[] = [
  { id: 1, title: 'Energia Solar', professorId: 1, professorName: 'Prof. Chinam', area: 'Engenharia', theme: 'Inovação e energia', duration: '24 meses', hasScholarship: true, scholarshipDetails: 'CNPq - R$2.200', faculty: 'EP', department: 'PMR', keywords: ['Energia limpa', 'Solar'], vacancies: 2, description: 'Desenvolvimento de novas tecnologias para painéis solares.', postedDate: '21/03/2025' },
  { id: 2, title: 'Startup Biotecnologia', professorId: 1, professorName: 'Prof. Chinam', area: 'Direito', theme: 'Regulação jurídica', duration: '18 meses', hasScholarship: false, faculty: 'FEA', department: 'Direito', keywords: ['Biotecnologia', 'Startup'], vacancies: 1, description: 'Análise jurídica para startups de biotecnologia.', postedDate: '22/03/2025' },
  { id: 3, title: 'IA para Robótica', professorId: 1, professorName: 'Prof. Chinam', area: 'Computação', theme: 'Inteligência Artificial', duration: '12 meses', hasScholarship: true, scholarshipDetails: 'FAPESP - R$1.800', faculty: 'EP', department: 'PCS', keywords: ['IA', 'Robótica'], vacancies: 0, description: 'Aplicação de algoritmos de aprendizado de máquina em robôs autônomos.', postedDate: '20/03/2025' },

];

const MOCK_APPLICATIONS: Application[] = [];


// --- Helper Components defined outside App to prevent re-renders ---

const NavLink: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button onClick={onClick} className="relative text-white font-medium group">
        {children}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
    </button>
);


const Header: React.FC<{
  currentUser: User | null;
  onLogout: () => void;
  setView: (view: string, data?: any) => void;
}> = ({ currentUser, onLogout, setView }) => {
    return (
        <header className="bg-primary shadow-lg p-4 flex justify-between items-center sticky top-0 z-40">
            <button onClick={() => setView(currentUser ? 'dashboard' : 'login')}>
                <IcarusLogo textColor="text-white"/>
            </button>
            <nav className="flex items-center space-x-8">
                {currentUser ? (
                    <>
                        {currentUser.role === UserRole.PROFESSOR && (
                            <>
                                <NavLink onClick={() => setView('myProjects')}>Meus Projetos</NavLink>
                                <NavLink onClick={() => setView('candidatures')}>Candidaturas</NavLink>
                            </>
                        )}
                        {currentUser.role === UserRole.STUDENT && (
                            <>
                                <NavLink onClick={() => setView('availableProjects')}>Mural de IC's</NavLink>
                                <NavLink onClick={() => setView('myApplications')}>Minhas Inscrições</NavLink>
                                <NavLink onClick={() => setView('myCurriculum')}>Meu Currículo</NavLink>
                            </>
                        )}
                        <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-primary">
                                {currentUser.role === UserRole.PROFESSOR ? 
                                    <ProfessorIcon className="w-7 h-7" /> : 
                                    <UserIcon className="w-7 h-7" />
                                }
                            </div>
                            <div className="text-white text-left">
                                <div className="font-semibold">{currentUser.name}</div>
                                <button onClick={onLogout} className="text-sm text-gray-200 hover:underline">Sair</button>
                            </div>
                        </div>
                    </>
                ) : (
                     <button onClick={() => setView('login')} className="flex items-center space-x-2 text-white font-medium hover:text-gray-200 transition-colors">
                        <span>Login</span>
                        <LoginIcon className="w-6 h-6" />
                    </button>
                )}
            </nav>
        </header>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<{ name: string; data: any }>({ name: 'login', data: null });
    
    // Mock DB State
    const [users, setUsers] = useState<User[]>([...MOCK_PROFESSORS, ...MOCK_STUDENTS]);
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
    
    // UI State
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: <></> });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setView({ name: 'login', data: null });
        } else {
            setView({ name: 'dashboard', data: null });
        }
    }, [currentUser]);

    const handleLogin = (nusp: string, pass: string) => {
        setIsLoading(true);
        setTimeout(() => { // Simulate API call
            const user = users.find(u => u.nusp === nusp && u.password === pass);
            if (user) {
                setCurrentUser(user);
                setError('');
            } else {
                setError('NUSP ou senha inválidos.');
            }
            setIsLoading(false);
        }, 500);
    };
    
    const handleSignup = (userData: Omit<Student & Professor, 'id'>) => {
        setIsLoading(true);
        setTimeout(() => { // Simulate API call
            if(users.some(u => u.nusp === userData.nusp || u.email === userData.email)) {
                 setError('NUSP ou E-mail já cadastrado.');
                 setIsLoading(false);
                 return;
            }
            const newUser = { ...userData, id: users.length + 1 };
            setUsers(prev => [...prev, newUser]);
            setCurrentUser(newUser as User);
            setError('');
            setIsLoading(false);
        }, 500);
    }

    const handleLogout = () => {
        setCurrentUser(null);
    };
    
    const handleNavigate = (viewName: string, data: any = null) => {
        setError('');
        setView({ name: viewName, data });
    };

    const handleCreateProject = (project: Omit<Project, 'id' | 'professorId' | 'professorName' | 'postedDate' | 'faculty' | 'department'>) => {
        if (!currentUser || currentUser.role !== UserRole.PROFESSOR) return;
        
        setIsLoading(true);
        setTimeout(() => { // Simulate API call
            const professor = currentUser as Professor;
            const newProject: Project = {
                ...project,
                id: projects.length + 1,
                professorId: currentUser.id,
                professorName: currentUser.name,
                faculty: professor.faculty,
                department: professor.department,
                postedDate: new Date().toLocaleDateString('pt-BR'),
            };
            setProjects(prev => [newProject, ...prev]);
            setIsLoading(false);
            handleNavigate('myProjects');
        }, 1000);
    };

    const handleApply = (projectId: number, motivation: string) => {
        setIsLoading(true);
        setTimeout(() => { // Simulate API call
            const project = projects.find(p => p.id === projectId);
            if (!currentUser || currentUser.role !== UserRole.STUDENT || !project) {
                setIsLoading(false);
                return;
            }
    
            const newApp: Application = {
                id: applications.length + 1,
                studentId: currentUser.id,
                projectId,
                professorId: project.professorId,
                applicationDate: new Date().toLocaleDateString('pt-BR'),
                motivation,
                status: ApplicationStatus.PENDING,
            };
            setApplications(prev => [...prev, newApp]);
            setIsLoading(false);
            handleNavigate('myApplications');
        }, 1000);
    };
    
    const handleUpdateCurriculum = (file: File) => {
        if (!currentUser || currentUser.role !== UserRole.STUDENT) return;
        setIsLoading(true);
        setTimeout(() => { // Simulate API call
            const updatedUser = {
                ...currentUser,
                curriculum: file,
                curriculumFileName: file.name,
            } as Student;
    
            setCurrentUser(updatedUser);
            setUsers(users => users.map(u => u.id === currentUser.id ? updatedUser : u));
            setIsLoading(false);
    
            openModal(
                'Sucesso',
                <div>
                    <p>Seu currículo foi atualizado com sucesso!</p>
                    <div className="flex justify-end mt-6">
                        <button onClick={closeModal} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">OK</button>
                    </div>
                </div>
            );
        }, 1000);
    };

    const openModal = (title: string, body: React.ReactElement) => {
        setModalContent({ title, body });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };
    
    const handleConfirmSelection = (appId: number, studentId: number, projectId: number) => {
        const confirmAction = () => {
            setApplications(apps => apps.map(app => 
                app.id === appId ? { ...app, status: ApplicationStatus.SELECTED } : app
            ));
            
            setProjects(projs => projs.map(proj => {
                if (proj.id === projectId) {
                    return { ...proj, vacancies: Math.max(0, proj.vacancies - 1) };
                }
                return proj;
            }));
            closeModal();
            handleNavigate('candidatures');
        };

        openModal(
            'Confirmar Seleção',
            <div>
                <p>Tem certeza que deseja selecionar este aluno? Um e-mail será enviado e a vaga será reservada.</p>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={closeModal} className="px-5 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button onClick={confirmAction} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Confirmar</button>
                </div>
            </div>
        );
    };

    const handleChangeAppStatus = (appId: number, newStatus: ApplicationStatus) => {
        setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
        if(newStatus === ApplicationStatus.DECLINED) {
            const app = applications.find(a => a.id === appId);
            if (app) {
                setProjects(projs => projs.map(p => p.id === app.projectId ? {...p, vacancies: p.vacancies + 1} : p));
            }
        }
        handleNavigate('myApplications');
    }
    
    const handleCancelApplication = (applicationId: number) => {
        const confirmAction = () => {
            const appToCancel = applications.find(a => a.id === applicationId);
            if (!appToCancel) return;

            setApplications(apps => apps.filter(app => app.id !== applicationId));

            if (appToCancel.status === ApplicationStatus.SELECTED) {
                setProjects(projs => projs.map(p => 
                    p.id === appToCancel.projectId ? { ...p, vacancies: p.vacancies + 1 } : p
                ));
            }
            
            closeModal();
        };

        openModal(
            'Cancelar Candidatura',
            <div>
                <p>Tem certeza que deseja cancelar sua candidatura para este projeto?</p>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={closeModal} className="px-5 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors">Não</button>
                    <button onClick={confirmAction} className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Sim, Cancelar</button>
                </div>
            </div>
        );
    };

    const renderView = () => {
        switch (view.name) {
            case 'login': return <LoginView onLogin={handleLogin} onNavigate={handleNavigate} error={error} isLoading={isLoading} />;
            case 'signup': return <SignupView onSignup={handleSignup} onNavigate={handleNavigate} error={error} isLoading={isLoading} />;
            case 'myProjects': return <MyProjectsView projects={projects.filter(p => p.professorId === currentUser?.id)} onNavigate={handleNavigate} />;
            case 'createProject': return <ProjectFormView onSubmit={handleCreateProject} isLoading={isLoading} />;
            case 'candidatures': 
                const profApps = applications.filter(a => a.professorId === currentUser?.id);
                return <CandidaturesView applications={profApps} projects={projects} users={users} onNavigate={handleNavigate} onSelect={handleConfirmSelection}/>;
            case 'availableProjects': return <AvailableProjectsView projects={projects} onNavigate={handleNavigate}/>;
            case 'projectDetails': return <ProjectDetailsView project={view.data} currentUser={currentUser} applications={applications} onApply={handleApply} onNavigate={handleNavigate} isLoading={isLoading} />;
            case 'myApplications': return <MyApplicationsView applications={applications.filter(a => a.studentId === currentUser?.id)} projects={projects} onStatusChange={handleChangeAppStatus} onCancel={handleCancelApplication} />;
            case 'myCurriculum': return <MyCurriculumView currentUser={currentUser as Student} onUpdate={handleUpdateCurriculum} isLoading={isLoading} />;
            case 'dashboard':
                return currentUser?.role === UserRole.PROFESSOR 
                    ? <MyProjectsView projects={projects.filter(p => p.professorId === currentUser.id)} onNavigate={handleNavigate} />
                    : <AvailableProjectsView projects={projects} onNavigate={handleNavigate}/>;
            default: return <LoginView onLogin={handleLogin} onNavigate={handleNavigate} error={error} isLoading={isLoading} />;
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <Header currentUser={currentUser} onLogout={handleLogout} setView={handleNavigate} />
            <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                {renderView()}
            </main>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={modalContent.title}>
                {modalContent.body}
            </Modal>
        </div>
    );
};

// --- View Components ---

const LoginView = ({ onLogin, onNavigate, error, isLoading }: any) => {
    const [nusp, setNusp] = useState('');
    const [password, setPassword] = useState('');
    return (
        <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 mt-16 border border-gray-100">
            <div className="text-center mb-8">
                 <div className="inline-block">
                    <IcarusLogo />
                 </div>
                <h2 className="text-3xl font-bold text-text-primary mt-4">Bem-vindo de volta</h2>
                <p className="text-text-secondary mt-1">Faça login para continuar</p>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            <form onSubmit={e => { e.preventDefault(); onLogin(nusp, password); }} className="space-y-6">
                <div>
                    <label className="block text-text-secondary mb-2 font-medium" htmlFor="nusp">NUSP ou email USP</label>
                    <input type="text" id="nusp" value={nusp} onChange={e => setNusp(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
                </div>
                <div>
                    <label className="block text-text-secondary mb-2 font-medium" htmlFor="password">Senha</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover font-semibold transition-all duration-300 flex items-center justify-center disabled:bg-gray-400">
                    {isLoading ? <Spinner className="w-6 h-6 text-white"/> : 'Acessar'}
                </button>
            </form>
            <p className="text-center mt-6 text-sm text-text-secondary">
                Não tem uma conta? <button onClick={() => onNavigate('signup')} className="text-primary font-semibold hover:underline">Crie uma aqui</button>
            </p>
        </div>
    );
};

const SignupView = ({ onSignup, onNavigate, error, isLoading }: any) => {
    const [name, setName] = useState('');
    const [nusp, setNusp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
    
    const [course, setCourse] = useState('');
    const [idealPeriod, setIdealPeriod] = useState('');
    const [faculty, setFaculty] = useState('');
    const [department, setDepartment] = useState('');


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: any = { name, nusp, email, password, role };
        if (role === UserRole.STUDENT) {
            userData.course = course;
            userData.idealPeriod = Number(idealPeriod);
        } else {
            userData.faculty = faculty;
            userData.department = department;
        }
        onSignup(userData);
    }

    return (
        <div className="max-w-lg mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10 border border-gray-100">
            <h2 className="text-3xl font-bold text-center text-text-primary mb-2">Criar Conta</h2>
            <p className="text-text-secondary text-center mb-6">Comece sua jornada acadêmica no ICarus</p>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                <input type="text" placeholder="NUSP" value={nusp} onChange={e => setNusp(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                <input type="email" placeholder="E-mail USP" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                 
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                    <option value={UserRole.STUDENT}>Sou Aluno</option>
                    <option value={UserRole.PROFESSOR}>Sou Professor</option>
                </select>
                
                {role === UserRole.STUDENT && (
                    <>
                        <input type="text" placeholder="Curso" value={course} onChange={e => setCourse(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                        <input type="number" placeholder="Período Ideal" value={idealPeriod} onChange={e => setIdealPeriod(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </>
                )}
                
                {role === UserRole.PROFESSOR && (
                    <>
                        <input type="text" placeholder="Faculdade (Ex: EP, FEA)" value={faculty} onChange={e => setFaculty(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                        <input type="text" placeholder="Departamento (Ex: PMR, PCS)" value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </>
                )}
                
                <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover font-semibold transition-all duration-300 flex items-center justify-center disabled:bg-gray-400 mt-4">
                    {isLoading ? <Spinner className="w-6 h-6 text-white"/> : 'Criar Conta'}
                </button>
            </form>
             <p className="text-center mt-6 text-sm text-text-secondary">
                Já tem uma conta? <button onClick={() => onNavigate('login')} className="text-primary font-semibold hover:underline">Faça login</button>
            </p>
        </div>
    );
}

const MyProjectsView = ({ projects, onNavigate }: { projects: Project[], onNavigate: (view: string, data?: any) => void }) => (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary">Meus Projetos</h1>
            <button onClick={() => onNavigate('createProject')} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-hover transition-all duration-300 shadow hover:shadow-lg font-semibold">Nova IC</button>
        </div>
        {projects.length === 0 ? <p className="text-text-secondary">Você ainda não publicou nenhum projeto.</p> : (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="border-b-2 border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Título</th>
                            <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden md:table-cell">Área</th>
                            <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden lg:table-cell">Duração</th>
                            <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden md:table-cell">Bolsa</th>
                            <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden lg:table-cell">Vagas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-light transition-colors">
                                <td className="p-4 font-semibold text-primary">{p.title}</td>
                                <td className="p-4 text-text-primary hidden md:table-cell">{p.area}</td>
                                <td className="p-4 text-text-primary hidden lg:table-cell">{p.duration}</td>
                                <td className="p-4 text-text-primary hidden md:table-cell">{p.scholarshipDetails || 'Nenhuma'}</td>
                                <td className="p-4 text-text-primary hidden lg:table-cell">{p.vacancies}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const ProjectFormView = ({ onSubmit, isLoading }: any) => {
    const [formData, setFormData] = useState({ title: '', area: '', theme: '', duration: '', scholarshipDetails: '', keywords: '', vacancies: 1, description: '' });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const projectData = {
            ...formData,
            keywords: formData.keywords.split(',').map(k => k.trim()),
            vacancies: Number(formData.vacancies),
            hasScholarship: !!formData.scholarshipDetails,
        };
        onSubmit(projectData);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h1 className="text-3xl font-bold text-text-primary mb-6 border-b border-gray-200 pb-4">Incluir Novo Projeto</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">Título*</label>
                        <input name="title" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                     <div>
                        <label className="block text-text-secondary font-medium mb-1">Área de pesquisa*</label>
                        <input name="area" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">Tema*</label>
                        <input name="theme" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                     <div>
                        <label className="block text-text-secondary font-medium mb-1">Duração*</label>
                        <input name="duration" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                </div>
                 <div>
                    <label className="block text-text-secondary font-medium mb-1">Bolsa (Ex: CNPq - R$2.200, deixe em branco se não houver)</label>
                    <input name="scholarshipDetails" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-text-secondary font-medium mb-1">Breve descrição*</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                 <div>
                    <label className="block text-text-secondary font-medium mb-1">Palavras-chave* (separadas por vírgula)</label>
                    <input name="keywords" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                    <label className="block text-text-secondary font-medium mb-1">Quantidade de Vagas*</label>
                    <input name="vacancies" type="number" min="1" value={formData.vacancies} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                     <button type="submit" disabled={isLoading} className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-hover transition-all duration-300 shadow hover:shadow-lg font-semibold flex items-center justify-center disabled:bg-gray-400">
                        {isLoading ? <Spinner className="w-6 h-6 text-white"/> : 'Salvar Projeto'}
                     </button>
                </div>
            </form>
        </div>
    );
};

const CandidaturesView = ({ applications, projects, users, onNavigate, onSelect }: any) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    if (selectedProject) {
        const projectApps = applications.filter((a: Application) => a.projectId === selectedProject.id);
        
        return (
            <div>
                 <button onClick={() => setSelectedProject(null)} className="mb-6 text-primary hover:underline font-semibold">&larr; Voltar para a lista de projetos</button>
                 <h1 className="text-3xl font-bold text-text-primary mb-6">Candidatos: <span className="text-primary">{selectedProject.title}</span></h1>
                 <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
                    {projectApps.length > 0 ? (
                        <table className="w-full text-left">
                           <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Nome</th>
                                    <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden md:table-cell">NUSP</th>
                                    <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden lg:table-cell">Curso</th>
                                    <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Currículo</th>
                                    <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Status</th>
                                    <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectApps.map((app: Application) => {
                                    const student = users.find((s: User) => s.id === app.studentId) as Student | undefined;
                                    const curriculumUrl = student?.curriculum ? URL.createObjectURL(student.curriculum) : '#';

                                    return (
                                        <tr key={app.id} className="border-b border-gray-100 last:border-0 hover:bg-light transition-colors">
                                            <td className="p-4 font-semibold text-text-primary">{student?.name}</td>
                                            <td className="p-4 text-text-primary hidden md:table-cell">{student?.nusp}</td>
                                            <td className="p-4 text-text-primary hidden lg:table-cell">{student?.course}</td>
                                            <td className="p-4">
                                                {student?.curriculum ? (
                                                    <a href={curriculumUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                                        Abrir arquivo
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">Não enviado</span>
                                                )}
                                            </td>
                                            <td className="p-4"><span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${app.status === ApplicationStatus.SELECTED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{app.status}</span></td>
                                            <td className="p-4">
                                                {app.status === ApplicationStatus.PENDING && student && (
                                                    <button onClick={() => onSelect(app.id, student.id, selectedProject.id)} className="bg-green-500 text-white px-4 py-1.5 text-sm rounded-md hover:bg-green-600 transition-colors">Selecionar</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : <p className="text-text-secondary p-4">Nenhum candidato para este projeto ainda.</p>}
                 </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Visualizar Candidaturas</h1>
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
                {projects.some((p: Project) => applications.some((a: Application) => a.projectId === p.id)) ? (
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Projeto</th>
                                <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden md:table-cell">Data de publicação</th>
                                <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.filter((p: Project) => applications.some((a: Application) => a.projectId === p.id)).map((p: Project) => (
                                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-light transition-colors">
                                    <td className="p-4 font-semibold text-text-primary">{p.title}</td>
                                    <td className="p-4 text-text-primary hidden md:table-cell">{p.postedDate}</td>
                                    <td className="p-4">
                                        <button onClick={() => setSelectedProject(p)} className="bg-primary text-white px-4 py-1.5 text-sm rounded-md hover:bg-primary-hover transition-colors">Visualizar Candidaturas</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-text-secondary p-4">Nenhuma candidatura recebida ainda.</p>}
            </div>
        </div>
    );
};

const AvailableProjectsView = ({ projects, onNavigate }: any) => (
     <div>
        <h1 className="text-4xl font-bold text-text-primary mb-8">Mural de IC's</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p: Project) => (
                <div key={p.id} className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${p.vacancies === 0 ? 'opacity-70' : ''}`}>
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-2">{p.title}</h2>
                        <p className="text-text-secondary text-sm mb-1">Prof. {p.professorName}</p>
                        <p className="text-gray-400 text-sm mb-4">{p.faculty} - {p.department}</p>
                        <p className="text-text-secondary line-clamp-3 mb-4 h-16">{p.description}</p>
                         <p className="text-sm font-semibold text-text-primary">Vagas disponíveis: {p.vacancies}</p>
                    </div>
                    {p.vacancies > 0 ? (
                        <button onClick={() => onNavigate('projectDetails', p)} className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-hover font-semibold transition-all duration-300 mt-4">Ver Detalhes</button>
                    ) : (
                        <div className="w-full bg-gray-200 text-text-secondary text-center py-2.5 rounded-lg mt-4 cursor-not-allowed font-semibold">Vagas preenchidas</div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const ProjectDetailsView = ({ project, currentUser, applications, onApply, onNavigate, isLoading }: any) => {
    const [motivation, setMotivation] = useState('');
    const hasApplied = applications.some((a: Application) => a.projectId === project.id && a.studentId === currentUser?.id);
    const studentProfile = currentUser as Student;
    const canApply = studentProfile && studentProfile.curriculum;

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => onNavigate('availableProjects')} className="mb-6 text-primary hover:underline font-semibold">&larr; Voltar para a lista</button>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h1 className="text-4xl font-bold text-text-primary">{project.title}</h1>
                <p className="text-lg text-text-secondary mt-1">Prof. {project.professorName}</p>
                <div className="mt-4 text-sm text-text-secondary space-x-6">
                    <span><strong>Duração:</strong> {project.duration}</span>
                    <span><strong>Bolsa:</strong> {project.scholarshipDetails || 'Não'}</span>
                     <span><strong>Vagas:</strong> {project.vacancies}</span>
                </div>
                <div className="my-8 border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-xl mb-3 text-text-primary">Descrição do projeto</h3>
                    <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{project.description}</p>
                </div>
                
                {currentUser?.role === UserRole.STUDENT && (
                    <div className="border-t border-gray-200 pt-6">
                        {hasApplied ? <p className="text-green-600 font-semibold text-center text-lg">Você já se candidatou para este projeto.</p> : (
                             !canApply ? (
                                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
                                    <p>Você precisa enviar seu currículo na aba "Meu Currículo" antes de se candidatar a um projeto.</p>
                                    <button onClick={() => onNavigate('myCurriculum')} className="mt-2 font-semibold underline">Ir para Meu Currículo</button>
                                </div>
                            ) : (
                            <form onSubmit={e => {e.preventDefault(); onApply(project.id, motivation)}}>
                                <h3 className="font-semibold text-xl mb-3 text-text-primary">Candidatar-se</h3>
                                <div className="mb-4">
                                    <label className="block text-text-secondary mb-2 font-medium">Motivação*</label>
                                    <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={5} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover font-semibold transition-all duration-300 flex items-center justify-center disabled:bg-gray-400">
                                    {isLoading ? <Spinner className="w-6 h-6 text-white"/> : 'Salvar Inscrição'}
                                </button>
                            </form>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const MyApplicationsView = ({ applications, projects, onStatusChange, onCancel }: any) => {
    
    const renderStatusBadge = (status: ApplicationStatus) => {
        const styles: {[key: string]: string} = {
            [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [ApplicationStatus.SELECTED]: 'bg-blue-100 text-blue-800',
            [ApplicationStatus.NOT_SELECTED]: 'bg-red-100 text-red-800',
            [ApplicationStatus.ACCEPTED]: 'bg-green-100 text-green-800',
            [ApplicationStatus.DECLINED]: 'bg-gray-100 text-gray-800',
        }
        return <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${styles[status]}`}>{status}</span>;
    }
    
    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Minhas Inscrições</h1>
            {applications.length === 0 ? <p className="text-text-secondary">Você ainda não se candidatou a nenhum projeto.</p> : (
                 <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Título</th>
                                <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden md:table-cell">Professor</th>
                                <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden lg:table-cell">Data de Inscrição</th>
                                <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Situação</th>
                                <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Ação</th>
                            </tr>
                        </thead>
                         <tbody>
                            {applications.map((app: Application) => {
                                const project = projects.find((p: Project) => p.id === app.projectId);
                                return (
                                    <tr key={app.id} className="border-b border-gray-100 last:border-0 hover:bg-light transition-colors">
                                        <td className="p-4 font-semibold text-text-primary">{project?.title}</td>
                                        <td className="p-4 text-text-primary hidden md:table-cell">{project?.professorName}</td>
                                        <td className="p-4 text-text-primary hidden lg:table-cell">{app.applicationDate}</td>
                                        <td className="p-4">{renderStatusBadge(app.status)}</td>
                                        <td className="p-4">
                                            {app.status === ApplicationStatus.SELECTED && (
                                                <div className="flex space-x-2">
                                                    <button onClick={() => onStatusChange(app.id, ApplicationStatus.ACCEPTED)} className="flex items-center space-x-1.5 bg-green-500 text-white px-3 py-1.5 text-sm rounded-md hover:bg-green-600 transition-colors"><CheckIcon className="w-4 h-4" /> <span>Aceitar</span></button>
                                                    <button onClick={() => onStatusChange(app.id, ApplicationStatus.DECLINED)} className="flex items-center space-x-1.5 bg-red-500 text-white px-3 py-1.5 text-sm rounded-md hover:bg-red-600 transition-colors"><XIcon className="w-4 h-4" /> <span>Recusar</span></button>
                                                </div>
                                            )}
                                            {app.status === ApplicationStatus.PENDING && (
                                                <button onClick={() => onCancel(app.id)} className="text-sm text-red-600 hover:underline font-medium">
                                                    Excluir candidatura
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const MyCurriculumView = ({ currentUser, onUpdate, isLoading }: { currentUser: Student, onUpdate: (file: File) => void, isLoading: boolean }) => {
    const [selectedFile, setSelectedFile] = useState<File | undefined>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            onUpdate(selectedFile);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h1 className="text-3xl font-bold text-text-primary mb-6 border-b border-gray-200 pb-4">Meu Currículo</h1>
            {currentUser.curriculumFileName && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-text-secondary">Currículo atual: <span className="font-semibold text-green-800">{currentUser.curriculumFileName}</span></p>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <label className="block text-text-secondary font-medium mb-2">
                    {currentUser.curriculumFileName ? 'Substituir currículo (PDF ou DOCX)' : 'Enviar currículo (PDF ou DOCX)'}
                </label>
                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-text-secondary">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                                <span>Carregar um arquivo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setSelectedFile(e.target.files?.[0])} required accept=".pdf,.doc,.docx"/>
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                        </div>
                        <p className="text-xs text-gray-500">{selectedFile ? selectedFile.name : 'PDF, DOCX até 10MB'}</p>
                    </div>
                </div>
                <button type="submit" disabled={!selectedFile || isLoading} className="mt-6 w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover font-semibold transition-all duration-300 flex items-center justify-center disabled:bg-gray-400">
                    {isLoading ? <Spinner className="w-6 h-6 text-white"/> : (currentUser.curriculumFileName ? 'Atualizar Currículo' : 'Salvar Currículo')}
                </button>
            </form>
        </div>
    );
};


export default App;
