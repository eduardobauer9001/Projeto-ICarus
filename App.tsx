
import React, { useState, useEffect } from 'react';
import { User, Student, Professor, Project, Application, UserRole, ApplicationStatus } from './types';
import { IcarusLogo, UserIcon, UploadIcon, CheckIcon, XIcon, Spinner, ProfessorIcon } from './components/icons';
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
];

const MOCK_APPLICATIONS: Application[] = [];


// --- Helper Components defined outside App to prevent re-renders ---

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  setView: (view: string, data?: any) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, setView }) => {
    return (
        <header className="bg-brand-blue shadow-md p-4 flex justify-between items-center">
            <button onClick={() => setView(currentUser ? 'dashboard' : 'login')}>
                <IcarusLogo />
            </button>
            <nav className="flex items-center space-x-6">
                {currentUser ? (
                    <>
                        {currentUser.role === UserRole.PROFESSOR && (
                            <>
                                <button onClick={() => setView('myProjects')} className="text-white hover:text-gray-200">Meus Projetos</button>
                                <button onClick={() => setView('candidatures')} className="text-white hover:text-gray-200">Candidaturas</button>
                            </>
                        )}
                        {currentUser.role === UserRole.STUDENT && (
                            <>
                                <button onClick={() => setView('availableProjects')} className="text-white hover:text-gray-200">Mural de IC's</button>
                                <button onClick={() => setView('myApplications')} className="text-white hover:text-gray-200">Minhas Inscrições</button>
                                <button onClick={() => setView('myCurriculum')} className="text-white hover:text-gray-200">Meu Currículo</button>
                            </>
                        )}
                        <div className="flex items-center space-x-2">
                             <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center">
                                {currentUser.role === UserRole.PROFESSOR ? 
                                    <ProfessorIcon className="w-8 h-8 text-brand-blue" /> : 
                                    <UserIcon className="w-8 h-8 text-brand-blue" />
                                }
                            </div>
                            <div className="text-white">
                                <div>{currentUser.name}</div>
                                <button onClick={onLogout} className="text-sm text-gray-300 hover:underline">Sair</button>
                            </div>
                        </div>
                    </>
                ) : (
                     <button onClick={() => setView('login')} className="flex items-center space-x-2 text-white hover:text-gray-200">
                        <span>Login</span>
                        <UserIcon className="w-6 h-6" />
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

    useEffect(() => {
        if (!currentUser) {
            setView({ name: 'login', data: null });
        } else {
            setView({ name: 'dashboard', data: null });
        }
    }, [currentUser]);

    const handleLogin = (nusp: string, pass: string) => {
        const user = users.find(u => u.nusp === nusp && u.password === pass);
        if (user) {
            setCurrentUser(user);
            setError('');
        } else {
            setError('NUSP ou senha inválidos.');
        }
    };
    
    const handleSignup = (userData: Omit<Student & Professor, 'id'>) => {
        if(users.some(u => u.nusp === userData.nusp || u.email === userData.email)) {
             setError('NUSP ou E-mail já cadastrado.');
             return;
        }
        const newUser = { ...userData, id: users.length + 1 };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser as User);
        setError('');
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
        handleNavigate('myProjects');
    };

    const handleApply = (projectId: number, motivation: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!currentUser || currentUser.role !== UserRole.STUDENT || !project) return;

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
        handleNavigate('myApplications');
    };
    
    const handleUpdateCurriculum = (file: File) => {
        if (!currentUser || currentUser.role !== UserRole.STUDENT) return;

        const updatedUser = {
            ...currentUser,
            curriculum: file,
            curriculumFileName: file.name,
        } as Student;

        setCurrentUser(updatedUser);
        setUsers(users => users.map(u => u.id === currentUser.id ? updatedUser : u));

        openModal(
            'Sucesso',
            <div>
                <p>Seu currículo foi atualizado com sucesso!</p>
                <div className="flex justify-end mt-4">
                    <button onClick={closeModal} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark">OK</button>
                </div>
            </div>
        );
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
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={confirmAction} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Confirmar</button>
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
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Não</button>
                    <button onClick={confirmAction} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Sim, Cancelar</button>
                </div>
            </div>
        );
    };

    const renderView = () => {
        switch (view.name) {
            case 'login': return <LoginView onLogin={handleLogin} onNavigate={handleNavigate} error={error} />;
            case 'signup': return <SignupView onSignup={handleSignup} onNavigate={handleNavigate} error={error} />;
            case 'myProjects': return <MyProjectsView projects={projects.filter(p => p.professorId === currentUser?.id)} onNavigate={handleNavigate} />;
            case 'createProject': return <ProjectFormView onSubmit={handleCreateProject} />;
            case 'candidatures': 
                const profApps = applications.filter(a => a.professorId === currentUser?.id);
                return <CandidaturesView applications={profApps} projects={projects} users={users} onNavigate={handleNavigate} onSelect={handleConfirmSelection}/>;
            case 'availableProjects': return <AvailableProjectsView projects={projects} onNavigate={handleNavigate}/>;
            case 'projectDetails': return <ProjectDetailsView project={view.data} currentUser={currentUser} applications={applications} onApply={handleApply} onNavigate={handleNavigate} />;
            case 'myApplications': return <MyApplicationsView applications={applications.filter(a => a.studentId === currentUser?.id)} projects={projects} onStatusChange={handleChangeAppStatus} onCancel={handleCancelApplication} />;
            case 'myCurriculum': return <MyCurriculumView currentUser={currentUser as Student} onUpdate={handleUpdateCurriculum} />;
            case 'dashboard':
                return currentUser?.role === UserRole.PROFESSOR 
                    ? <MyProjectsView projects={projects.filter(p => p.professorId === currentUser.id)} onNavigate={handleNavigate} />
                    : <AvailableProjectsView projects={projects} onNavigate={handleNavigate}/>;
            default: return <LoginView onLogin={handleLogin} onNavigate={handleNavigate} error={error} />;
        }
    };

    return (
        <div className="min-h-screen bg-brand-gray">
            <Header currentUser={currentUser} onLogout={handleLogout} setView={handleNavigate} />
            <main className="p-4 sm:p-6 md:p-8">
                {renderView()}
            </main>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={modalContent.title}>
                {modalContent.body}
            </Modal>
        </div>
    );
};

// --- View Components ---

const LoginView = ({ onLogin, onNavigate, error }: any) => {
    const [nusp, setNusp] = useState('');
    const [password, setPassword] = useState('');
    return (
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8 mt-10">
            <div className="text-center mb-6">
                 <div className="inline-block">
                    <IcarusLogo textColor="text-brand-blue" />
                 </div>
                <h2 className="text-2xl font-bold text-gray-700 mt-4">Login</h2>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={e => { e.preventDefault(); onLogin(nusp, password); }}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="nusp">NUSP ou email USP</label>
                    <input type="text" id="nusp" value={nusp} onChange={e => setNusp(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="password">Senha</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <button type="submit" className="w-full bg-brand-blue text-white py-2 rounded-lg hover:bg-brand-blue-dark transition duration-200">Acessar</button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-600">
                Não tem uma conta? <button onClick={() => onNavigate('signup')} className="text-brand-blue hover:underline">Crie uma aqui</button>
            </p>
        </div>
    );
};

const SignupView = ({ onSignup, onNavigate, error }: any) => {
    const [name, setName] = useState('');
    const [nusp, setNusp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
    
    // Role specific fields
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
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8 mt-10">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Criar Conta</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Nome Completo</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">NUSP</label>
                    <input type="text" value={nusp} onChange={e => setNusp(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">E-mail USP</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                </div>
                 <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Eu sou</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue">
                        <option value={UserRole.STUDENT}>Aluno</option>
                        <option value={UserRole.PROFESSOR}>Professor</option>
                    </select>
                </div>
                
                {role === UserRole.STUDENT && (
                    <>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Curso</label>
                            <input type="text" value={course} onChange={e => setCourse(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Período Ideal</label>
                            <input type="number" value={idealPeriod} onChange={e => setIdealPeriod(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                        </div>
                    </>
                )}
                
                {role === UserRole.PROFESSOR && (
                    <>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Faculdade</label>
                            <input type="text" value={faculty} onChange={e => setFaculty(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Departamento</label>
                            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                        </div>
                    </>
                )}
                
                <button type="submit" className="w-full bg-brand-blue text-white py-2 rounded-lg hover:bg-brand-blue-dark transition duration-200 mt-4">Criar Conta</button>
            </form>
             <p className="text-center mt-4 text-sm text-gray-600">
                Já tem uma conta? <button onClick={() => onNavigate('login')} className="text-brand-blue hover:underline">Faça login</button>
            </p>
        </div>
    );
}

const MyProjectsView = ({ projects, onNavigate }: { projects: Project[], onNavigate: (view: string, data?: any) => void }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Meus Projetos</h1>
            <button onClick={() => onNavigate('createProject')} className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-blue-dark transition">Nova IC</button>
        </div>
        {projects.length === 0 ? <p className="text-gray-600">Você ainda não publicou nenhum projeto.</p> : (
            <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3 font-semibold text-gray-600 uppercase">Título</th>
                            <th className="p-3 font-semibold text-gray-600 uppercase hidden md:table-cell">Área</th>
                            <th className="p-3 font-semibold text-gray-600 uppercase hidden lg:table-cell">Duração</th>
                            <th className="p-3 font-semibold text-gray-600 uppercase hidden md:table-cell">Bolsa</th>
                            <th className="p-3 font-semibold text-gray-600 uppercase hidden lg:table-cell">Faculdade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-3 font-semibold text-brand-blue">{p.title}</td>
                                <td className="p-3 text-gray-700 hidden md:table-cell">{p.area}</td>
                                <td className="p-3 text-gray-700 hidden lg:table-cell">{p.duration}</td>
                                <td className="p-3 text-gray-700 hidden md:table-cell">{p.scholarshipDetails || 'Nenhuma'}</td>
                                <td className="p-3 text-gray-700 hidden lg:table-cell">{p.faculty}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const ProjectFormView = ({ onSubmit }: any) => {
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
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Incluir Novo Projeto</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Título*</label>
                        <input name="title" onChange={handleChange} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>
                     <div>
                        <label className="block text-gray-700 font-medium mb-1">Área de pesquisa*</label>
                        <input name="area" onChange={handleChange} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Tema*</label>
                        <input name="theme" onChange={handleChange} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>
                     <div>
                        <label className="block text-gray-700 font-medium mb-1">Duração*</label>
                        <input name="duration" onChange={handleChange} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>
                </div>
                 <div>
                    <label className="block text-gray-700 font-medium mb-1">Bolsa (Ex: CNPq - R$2.200, deixe em branco se não houver)</label>
                    <input name="scholarshipDetails" onChange={handleChange} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Breve descrição*</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                </div>
                 <div>
                    <label className="block text-gray-700 font-medium mb-1">Palavras-chave* (separadas por vírgula)</label>
                    <input name="keywords" onChange={handleChange} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Quantidade de Vagas*</label>
                    <input name="vacancies" type="number" min="1" value={formData.vacancies} onChange={handleChange} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                </div>

                <div className="flex justify-end">
                     <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">Salvar projeto</button>
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
                 <button onClick={() => setSelectedProject(null)} className="mb-4 text-brand-blue hover:underline">&larr; Voltar para a lista de projetos</button>
                 <h1 className="text-2xl font-bold text-gray-800 mb-4">Candidatos para: {selectedProject.title}</h1>
                 <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                    {projectApps.length > 0 ? (
                        <table className="w-full text-left">
                           <thead>
                                <tr className="border-b">
                                    <th className="p-3">Nome</th>
                                    <th className="p-3 hidden md:table-cell">NUSP</th>
                                    <th className="p-3 hidden lg:table-cell">Curso</th>
                                    <th className="p-3">Currículo</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectApps.map((app: Application) => {
                                    const student = users.find((s: User) => s.id === app.studentId) as Student | undefined;
                                    const curriculumUrl = student?.curriculum ? URL.createObjectURL(student.curriculum) : '#';

                                    return (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-3 font-semibold text-gray-800">{student?.name}</td>
                                            <td className="p-3 text-gray-700 hidden md:table-cell">{student?.nusp}</td>
                                            <td className="p-3 text-gray-700 hidden lg:table-cell">{student?.course}</td>
                                            <td className="p-3">
                                                {student?.curriculum ? (
                                                    <a href={curriculumUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                                                        Abrir arquivo
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">Não enviado</span>
                                                )}
                                            </td>
                                            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${app.status === ApplicationStatus.SELECTED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{app.status}</span></td>
                                            <td className="p-3">
                                                {app.status === ApplicationStatus.PENDING && student && (
                                                    <button onClick={() => onSelect(app.id, student.id, selectedProject.id)} className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600">Selecionar</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : <p className="text-gray-600 p-4">Nenhum candidato para este projeto ainda.</p>}
                 </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Visualizar Candidaturas</h1>
            <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                {projects.some((p: Project) => applications.some((a: Application) => a.projectId === p.id)) ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 font-semibold text-gray-600 uppercase">Projeto</th>
                                <th className="p-3 font-semibold text-gray-600 uppercase hidden md:table-cell">Data de publicação</th>
                                <th className="p-3 font-semibold text-gray-600 uppercase">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.filter((p: Project) => applications.some((a: Application) => a.projectId === p.id)).map((p: Project) => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-3 font-semibold text-gray-800">{p.title}</td>
                                    <td className="p-3 text-gray-700 hidden md:table-cell">{p.postedDate}</td>
                                    <td className="p-3">
                                        <button onClick={() => setSelectedProject(p)} className="bg-brand-blue text-white px-3 py-1 text-sm rounded-md hover:bg-brand-blue-dark">Visualizar Candidaturas</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-600 p-4">Nenhuma candidatura recebida ainda.</p>}
            </div>
        </div>
    );
};

const AvailableProjectsView = ({ projects, onNavigate }: any) => (
     <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Mural de IC's</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: Project) => (
                <div key={p.id} className={`bg-white rounded-lg shadow p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 ${p.vacancies === 0 ? 'opacity-60' : ''}`}>
                    <div>
                        <h2 className="text-xl font-bold text-brand-blue mb-2">{p.title}</h2>
                        <p className="text-gray-600 text-sm mb-1">Prof. {p.professorName}</p>
                        <p className="text-gray-500 text-sm mb-4">{p.faculty} - {p.department}</p>
                        <p className="text-gray-700 line-clamp-3 mb-4">{p.description}</p>
                         <p className="text-sm font-medium text-gray-800">Vagas disponíveis: {p.vacancies}</p>
                    </div>
                    {p.vacancies > 0 ? (
                        <button onClick={() => onNavigate('projectDetails', p)} className="w-full bg-brand-blue text-white py-2 rounded-lg hover:bg-brand-blue-dark transition mt-4">Ver Detalhes</button>
                    ) : (
                        <div className="w-full bg-gray-300 text-gray-600 text-center py-2 rounded-lg mt-4 cursor-not-allowed">Vagas preenchidas</div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const ProjectDetailsView = ({ project, currentUser, applications, onApply, onNavigate }: any) => {
    const [motivation, setMotivation] = useState('');
    const hasApplied = applications.some((a: Application) => a.projectId === project.id && a.studentId === currentUser?.id);
    const studentProfile = currentUser as Student;
    const canApply = studentProfile && studentProfile.curriculum;

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <button onClick={() => onNavigate('availableProjects')} className="mb-6 text-brand-blue hover:underline">&larr; Voltar para a lista</button>
            <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
            <p className="text-lg text-gray-600 mt-1">Prof. {project.professorName}</p>
            <div className="mt-4 text-sm text-gray-500 space-x-4">
                <span>Duração: {project.duration}</span>
                <span>Bolsa: {project.scholarshipDetails || 'Não'}</span>
                 <span>Vagas: {project.vacancies}</span>
            </div>
            <div className="my-6 border-t pt-6">
                <h3 className="font-semibold text-lg mb-2">Descrição do projeto</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </div>
            
            {currentUser?.role === UserRole.STUDENT && (
                <div className="border-t pt-6">
                    {hasApplied ? <p className="text-green-600 font-semibold text-center">Você já se candidatou para este projeto.</p> : (
                         !canApply ? (
                            <div className="text-center p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md">
                                <p>Você precisa enviar seu currículo na aba "Meu Currículo" antes de se candidatar a um projeto.</p>
                                <button onClick={() => onNavigate('myCurriculum')} className="mt-2 font-semibold underline">Ir para Meu Currículo</button>
                            </div>
                        ) : (
                        <form onSubmit={e => {e.preventDefault(); onApply(project.id, motivation)}}>
                            <h3 className="font-semibold text-lg mb-2">Candidatar-se</h3>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Motivação*</label>
                                <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={5} className="w-full p-2 border rounded-md" required />
                            </div>
                            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">Salvar Inscrição</button>
                        </form>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

const MyApplicationsView = ({ applications, projects, onStatusChange, onCancel }: any) => {
    
    const renderStatusBadge = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING: return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Em avaliação</span>;
            case ApplicationStatus.SELECTED: return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Selecionado</span>;
            case ApplicationStatus.NOT_SELECTED: return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Não Selecionado</span>;
            case ApplicationStatus.ACCEPTED: return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Aceito</span>;
            case ApplicationStatus.DECLINED: return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Recusado</span>;
            default: return null;
        }
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Minhas Inscrições</h1>
            {applications.length === 0 ? <p className="text-gray-600">Você ainda não se candidatou a nenhum projeto.</p> : (
                 <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 font-semibold text-gray-600 uppercase">Título</th>
                                <th className="p-3 font-semibold text-gray-600 uppercase hidden md:table-cell">Professor</th>
                                <th className="p-3 font-semibold text-gray-600 uppercase hidden lg:table-cell">Data de Inscrição</th>
                                <th className="p-3 font-semibold text-gray-600 uppercase">Situação</th>
                                <th className="p-3 font-semibold text-gray-600 uppercase">Ação</th>
                            </tr>
                        </thead>
                         <tbody>
                            {applications.map((app: Application) => {
                                const project = projects.find((p: Project) => p.id === app.projectId);
                                return (
                                    <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-800">{project?.title}</td>
                                        <td className="p-3 text-gray-700 hidden md:table-cell">{project?.professorName}</td>
                                        <td className="p-3 text-gray-700 hidden lg:table-cell">{app.applicationDate}</td>
                                        <td className="p-3">{renderStatusBadge(app.status)}</td>
                                        <td className="p-3">
                                            {app.status === ApplicationStatus.SELECTED && (
                                                <div className="flex space-x-2">
                                                    <button onClick={() => onStatusChange(app.id, ApplicationStatus.ACCEPTED)} className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600"><CheckIcon className="w-4 h-4" /> <span>Aceitar</span></button>
                                                    <button onClick={() => onStatusChange(app.id, ApplicationStatus.DECLINED)} className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600"><XIcon className="w-4 h-4" /> <span>Recusar</span></button>
                                                </div>
                                            )}
                                            {app.status === ApplicationStatus.PENDING && (
                                                <button onClick={() => onCancel(app.id)} className="text-sm text-red-600 hover:underline">
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

const MyCurriculumView = ({ currentUser, onUpdate }: { currentUser: Student, onUpdate: (file: File) => void }) => {
    const [selectedFile, setSelectedFile] = useState<File | undefined>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            onUpdate(selectedFile);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Meu Currículo</h1>
            {currentUser.curriculumFileName && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-gray-700">Currículo atual: <span className="font-semibold text-green-800">{currentUser.curriculumFileName}</span></p>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <label className="block text-gray-700 font-medium mb-2">
                    {currentUser.curriculumFileName ? 'Substituir currículo' : 'Enviar currículo'}
                </label>
                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-blue hover:text-brand-blue-dark focus-within:outline-none">
                                <span>Carregar um arquivo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setSelectedFile(e.target.files?.[0])} required accept=".pdf,.doc,.docx"/>
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                        </div>
                        <p className="text-xs text-gray-500">{selectedFile ? selectedFile.name : 'PDF, DOCX até 10MB'}</p>
                    </div>
                </div>
                <button type="submit" disabled={!selectedFile} className="mt-6 w-full bg-brand-blue text-white py-2 rounded-lg hover:bg-brand-blue-dark transition disabled:bg-gray-400">
                    {currentUser.curriculumFileName ? 'Atualizar Currículo' : 'Salvar Currículo'}
                </button>
            </form>
        </div>
    );
};


export default App;