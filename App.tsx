
import React, { useState, useEffect } from 'react';
import { User, Student, Professor, Project, Application, UserRole, ApplicationStatus } from './types';
import { IcarusLogo, UploadIcon, CheckIcon, XIcon, Spinner, ProfessorIcon, LoginIcon, MenuIcon, StudentIcon } from './components/icons';
import Modal from './components/Modal';

// Firebase Imports
import { auth, db } from './services/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    getDoc, 
    setDoc, 
    onSnapshot,
    query, 
    where,
    deleteDoc
} from 'firebase/firestore';


// --- Helper Components defined outside App to prevent re-renders ---

const NavLink: React.FC<{onClick: () => void, children: React.ReactNode, hasNotification?: boolean}> = ({ onClick, children, hasNotification }) => (
    <button onClick={onClick} className="relative text-white font-medium group flex items-center">
        {children}
        {hasNotification && (
            <span className="absolute -top-1 -right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
        )}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
    </button>
);

const MobileNavLink: React.FC<{onClick: () => void, children: React.ReactNode, hasNotification?: boolean}> = ({ onClick, children, hasNotification }) => (
    <button onClick={onClick} className="block w-full text-left px-6 py-4 text-text-primary font-medium hover:bg-gray-50 border-l-4 border-transparent hover:border-primary transition-all relative flex items-center justify-between">
        <span className="text-base">{children}</span>
        {hasNotification && (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
        )}
    </button>
);


const Header: React.FC<{
  currentUser: User | null;
  onLogout: () => void;
  setView: (view: string, data?: any) => void;
  notifications: { student: boolean, professor: boolean };
}> = ({ currentUser, onLogout, setView, notifications }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleMobileNav = (viewName: string) => {
        setView(viewName);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        onLogout();
        setIsMobileMenuOpen(false);
    }

    return (
        <header className="bg-primary shadow-lg sticky top-0 z-40">
            <div className="p-4 flex justify-between items-center max-w-7xl mx-auto relative z-50 bg-primary">
                <button onClick={() => { setView(currentUser ? 'dashboard' : 'login'); setIsMobileMenuOpen(false); }}>
                    <IcarusLogo textColor="text-white"/>
                </button>
                
                {/* Desktop Navigation - Hidden on Mobile/Small Tablet */}
                <nav className="hidden md:flex items-center space-x-8">
                    {currentUser ? (
                        <>
                            {currentUser.role === UserRole.PROFESSOR && (
                                <>
                                    <NavLink onClick={() => setView('myProjects')}>Meus Projetos</NavLink>
                                    <NavLink onClick={() => setView('candidatures')} hasNotification={notifications.professor}>Candidaturas</NavLink>
                                </>
                            )}
                            {currentUser.role === UserRole.STUDENT && (
                                <>
                                    <NavLink onClick={() => setView('availableProjects')}>Mural de IC's</NavLink>
                                    <NavLink onClick={() => setView('myApplications')} hasNotification={notifications.student}>Minhas Inscrições</NavLink>
                                    <NavLink onClick={() => setView('myCurriculum')}>Meu Currículo</NavLink>
                                </>
                            )}
                            <button onClick={() => setView('profile')} className="flex items-center space-x-3 pl-4 border-l border-blue-400 group focus:outline-none">
                                 <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-primary group-hover:bg-blue-50 transition-colors">
                                    {currentUser.role === UserRole.PROFESSOR ? 
                                        <ProfessorIcon className="w-7 h-7" /> : 
                                        <StudentIcon className="w-7 h-7" />
                                    }
                                </div>
                                <div className="text-white text-left">
                                    <div className="font-semibold text-sm group-hover:underline">{currentUser.name}</div>
                                    <span className="text-xs text-blue-100">Meus Dados</span>
                                </div>
                            </button>
                            <button onClick={onLogout} className="text-sm text-blue-100 hover:text-white hover:underline ml-2">Sair</button>
                        </>
                    ) : (
                         <button onClick={() => setView('login')} className="flex items-center space-x-2 text-white font-medium hover:text-gray-200 transition-colors">
                            <span>Login</span>
                            <LoginIcon className="w-6 h-6" />
                        </button>
                    )}
                </nav>

                {/* Mobile Menu Button - Visible only on Mobile/Small Tablet */}
                {currentUser && (
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className="md:hidden text-white focus:outline-none p-2"
                    >
                        {isMobileMenuOpen ? <XIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                    </button>
                )}
            </div>

            {/* Mobile Dropdown Menu */}
            {currentUser && isMobileMenuOpen && (
                <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-xl border-t border-gray-100 animate-fadeIn z-40 flex flex-col pb-4">
                    <div className="bg-gray-50 p-6 flex items-center space-x-4 border-b border-gray-200 mb-2">
                         <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                            {currentUser.role === UserRole.PROFESSOR ? 
                                <ProfessorIcon className="w-8 h-8" /> : 
                                <StudentIcon className="w-8 h-8" />
                            }
                        </div>
                        <div>
                            <p className="font-bold text-text-primary text-lg">{currentUser.name}</p>
                            <p className="text-text-secondary text-sm">{currentUser.email}</p>
                        </div>
                    </div>

                    <MobileNavLink onClick={() => handleMobileNav('profile')}>Meus Dados</MobileNavLink>

                    {currentUser.role === UserRole.PROFESSOR && (
                        <>
                            <MobileNavLink onClick={() => handleMobileNav('myProjects')}>Meus Projetos</MobileNavLink>
                            <MobileNavLink onClick={() => handleMobileNav('candidatures')} hasNotification={notifications.professor}>Candidaturas</MobileNavLink>
                        </>
                    )}
                    {currentUser.role === UserRole.STUDENT && (
                        <>
                            <MobileNavLink onClick={() => handleMobileNav('availableProjects')}>Mural de IC's</MobileNavLink>
                            <MobileNavLink onClick={() => handleMobileNav('myApplications')} hasNotification={notifications.student}>Minhas Inscrições</MobileNavLink>
                            <MobileNavLink onClick={() => handleMobileNav('myCurriculum')}>Meu Currículo</MobileNavLink>
                        </>
                    )}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                        <button 
                            onClick={handleLogout} 
                            className="w-full text-left px-6 py-4 text-red-600 font-medium hover:bg-red-50 flex items-center space-x-2"
                        >
                            <LoginIcon className="w-5 h-5 rotate-180" />
                            <span>Sair da conta</span>
                        </button>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </header>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<{ name: string; data: any }>({ name: 'login', data: null });
    
    // Application Data State
    const [projects, setProjects] = useState<Project[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [usersCache, setUsersCache] = useState<User[]>([]); // Cache for displaying names in tables
    
    // UI State
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: <></> });
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // --- Firebase Listeners ---

    // 1. Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch user details from Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUser(userDoc.data() as User);
                    if (view.name === 'login' || view.name === 'signup') {
                        setView({ name: 'dashboard', data: null });
                    }
                } else {
                    // Fallback if auth exists but no doc (shouldn't happen with correct signup)
                    setError("Erro: Usuário não encontrado no banco de dados.");
                    signOut(auth);
                }
            } else {
                setCurrentUser(null);
                setView({ name: 'login', data: null });
            }
            setIsAuthChecking(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Data Listeners (Real-time updates)
    useEffect(() => {
        if (!currentUser) {
            setProjects([]);
            setApplications([]);
            return;
        }

        const qProjects = query(collection(db, "projects"));
        const unsubProjects = onSnapshot(qProjects, (snapshot) => {
            const projs: Project[] = [];
            snapshot.forEach((doc) => projs.push({ ...doc.data(), id: doc.id } as Project));
            setProjects(projs);
        });

        const qApps = query(collection(db, "applications"));
        const unsubApps = onSnapshot(qApps, (snapshot) => {
            const apps: Application[] = [];
            snapshot.forEach((doc) => apps.push({ ...doc.data(), id: doc.id } as Application));
            setApplications(apps);
        });

        // Also fetch all users to display names in tables (simple caching)
        const qUsers = query(collection(db, "users"));
        const unsubUsers = onSnapshot(qUsers, (snapshot) => {
            const u: User[] = [];
            snapshot.forEach((doc) => u.push({ ...doc.data(), id: doc.id } as User));
            setUsersCache(u);
        });

        return () => {
            unsubProjects();
            unsubApps();
            unsubUsers();
        };
    }, [currentUser]);


    // Notifications Logic
    const hasStudentNotification = !!currentUser && currentUser.role === UserRole.STUDENT && 
        applications.some(a => a.studentId === currentUser.id && (a.status === ApplicationStatus.SELECTED || a.status === ApplicationStatus.NOT_SELECTED) && !a.viewedByStudent);

    const hasProfessorNotification = !!currentUser && currentUser.role === UserRole.PROFESSOR && 
        applications.some(a => a.professorId === currentUser.id && (a.status === ApplicationStatus.PENDING || a.status === ApplicationStatus.ACCEPTED) && !a.viewedByProfessor);


    // --- Actions ---

    const handleLogin = async (emailInput: string, pass: string) => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, emailInput, pass);
            // Auth listener will handle the rest
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') {
                setError('E-mail ou senha incorretos.');
            } else {
                setError('Erro ao fazer login. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSignup = async (userData: any) => {
        setIsLoading(true);
        setError('');
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const uid = userCredential.user.uid;

            // 2. Create Firestore Doc
            const { password, ...firestoreData } = userData; // Don't store password in Firestore
            const newUser = { ...firestoreData, id: uid };
            
            await setDoc(doc(db, "users", uid), newUser);
            
            // Auth listener will catch the login and redirect
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está cadastrado.');
            } else {
                setError('Erro ao criar conta: ' + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleUpdateProfile = async (updatedData: Partial<Student | Professor>) => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const userRef = doc(db, "users", currentUser.id);
            await updateDoc(userRef, updatedData);
            
            // Manually update local state for immediate feedback if needed, 
            // though the auth listener might trigger a refresh
            setCurrentUser({ ...currentUser, ...updatedData } as User);

            openModal(
                'Sucesso',
                <div>
                    <p>Seus dados foram atualizados com sucesso!</p>
                    <div className="flex justify-end mt-6">
                        <button onClick={closeModal} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">OK</button>
                    </div>
                </div>
            );
        } catch (err) {
            console.error(err);
            setError('Falha ao atualizar perfil.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        signOut(auth);
        setCurrentUser(null);
    };
    
    const handleNavigate = async (viewName: string, data: any = null) => {
        setError('');
        
        // Mark notifications as read in Firestore
        if (currentUser) {
            if (currentUser.role === UserRole.STUDENT && viewName === 'myApplications') {
                const unreadApps = applications.filter(a => 
                    a.studentId === currentUser.id && (a.status === ApplicationStatus.SELECTED || a.status === ApplicationStatus.NOT_SELECTED) && !a.viewedByStudent
                );
                unreadApps.forEach(async (app) => {
                    await updateDoc(doc(db, "applications", app.id), { viewedByStudent: true });
                });
            }
            if (currentUser.role === UserRole.PROFESSOR && viewName === 'candidatures') {
                const unreadApps = applications.filter(a => 
                    a.professorId === currentUser.id && (a.status === ApplicationStatus.PENDING || a.status === ApplicationStatus.ACCEPTED) && !a.viewedByProfessor
                );
                unreadApps.forEach(async (app) => {
                     await updateDoc(doc(db, "applications", app.id), { viewedByProfessor: true });
                });
            }
        }

        setView({ name: viewName, data });
    };

    const handleCreateProject = async (projectData: Omit<Project, 'id' | 'professorId' | 'professorName' | 'postedDate' | 'faculty' | 'department'>) => {
        if (!currentUser || currentUser.role !== UserRole.PROFESSOR) return;
        
        setIsLoading(true);
        try {
            const professor = currentUser as Professor;
            const newProject = {
                ...projectData,
                professorId: currentUser.id,
                professorName: currentUser.name,
                faculty: professor.faculty,
                department: professor.department,
                postedDate: new Date().toLocaleDateString('pt-BR'),
            };
            
            await addDoc(collection(db, "projects"), newProject);
            handleNavigate('myProjects');
        } catch (err) {
            console.error(err);
            setError("Erro ao criar projeto.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProject = async (project: Project) => {
        setIsLoading(true);
        try {
            const projectRef = doc(db, "projects", project.id);
            // Remove id from the data being updated
            const { id, ...dataToUpdate } = project;
            await updateDoc(projectRef, dataToUpdate);
            handleNavigate('myProjects');
        } catch (err) {
            console.error(err);
            setError("Erro ao atualizar projeto.");
        } finally {
             setIsLoading(false);
        }
    };

    const handleApply = async (projectId: string, motivation: string) => {
        if (!currentUser || currentUser.role !== UserRole.STUDENT) return;

        setIsLoading(true);
        try {
            const project = projects.find(p => p.id === projectId);
            if (!project) throw new Error("Projeto não encontrado");
    
            const newApp = {
                studentId: currentUser.id,
                projectId,
                professorId: project.professorId,
                applicationDate: new Date().toLocaleDateString('pt-BR'),
                motivation,
                status: ApplicationStatus.PENDING,
                viewedByProfessor: false,
                viewedByStudent: true,
            };
            
            await addDoc(collection(db, "applications"), newApp);
            handleNavigate('myApplications');
        } catch (err) {
            console.error(err);
            setError("Erro ao realizar inscrição.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // File upload is simulated by converting to Base64 to store in Firestore for simplicity
    const handleUpdateCurriculum = (file: File) => {
        if (!currentUser || currentUser.role !== UserRole.STUDENT) return;
        
        // Firestore limit check (approx 900KB safe margin for 1MB limit)
        if (file.size > 900 * 1024) { 
            openModal(
                'Arquivo muito grande',
                <div>
                    <p className="text-red-600 font-medium">O arquivo excede o limite permitido.</p>
                    <p className="mt-2 text-sm text-text-secondary">Para manter o serviço gratuito e rápido, limitamos os currículos a <strong>900KB</strong>.</p>
                    <p className="mt-1 text-sm text-text-secondary">Por favor, comprima seu PDF ou tente outro arquivo.</p>
                    <div className="flex justify-end mt-6">
                        <button onClick={closeModal} className="px-5 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors">Fechar</button>
                    </div>
                </div>
            );
            return;
        }

        setIsLoading(true);
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64 = reader.result as string;
                const userRef = doc(db, "users", currentUser.id);
                
                await updateDoc(userRef, {
                    curriculumBase64: base64,
                    curriculumFileName: file.name
                });
                
                // Update local user state immediately
                setCurrentUser({ ...currentUser, curriculumBase64: base64, curriculumFileName: file.name } as Student);

                openModal(
                    'Sucesso',
                    <div>
                        <p>Seu currículo foi atualizado com sucesso!</p>
                        <div className="flex justify-end mt-6">
                            <button onClick={closeModal} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">OK</button>
                        </div>
                    </div>
                );
            } catch (err) {
                console.error(err);
                setError("Erro ao salvar currículo.");
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setIsLoading(false);
            setError("Erro ao processar arquivo.");
        }
    };

    const openModal = (title: string, body: React.ReactElement) => {
        setModalContent({ title, body });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };
    
    const handleConfirmSelection = (appId: string, studentId: string, projectId: string) => {
        const confirmAction = async () => {
            try {
                // 1. Update Application Status
                await updateDoc(doc(db, "applications", appId), {
                    status: ApplicationStatus.SELECTED,
                    viewedByStudent: false
                });

                // 2. Decrease Project Vacancies
                const project = projects.find(p => p.id === projectId);
                if (project) {
                    await updateDoc(doc(db, "projects", projectId), {
                        vacancies: Math.max(0, project.vacancies - 1)
                    });
                }
                
                closeModal();
                handleNavigate('candidatures');
            } catch (err) {
                console.error(err);
                alert("Erro ao selecionar candidato.");
            }
        };

        openModal(
            'Confirmar Seleção',
            <div>
                <p>Tem certeza que deseja selecionar este aluno? Uma vaga será reservada.</p>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={closeModal} className="px-5 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button onClick={confirmAction} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Confirmar</button>
                </div>
            </div>
        );
    };

    const handleRejectCandidate = (appId: string) => {
        const rejectAction = async () => {
            try {
                await updateDoc(doc(db, "applications", appId), {
                    status: ApplicationStatus.NOT_SELECTED,
                    viewedByStudent: false
                });
                closeModal();
                handleNavigate('candidatures');
            } catch (err) {
                console.error(err);
                alert("Erro ao rejeitar candidato.");
            }
        };

        openModal(
            'Rejeitar Candidato',
            <div>
                <p>Tem certeza que deseja rejeitar esta candidatura? O aluno verá o status como "Não selecionado".</p>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={closeModal} className="px-5 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    <button onClick={rejectAction} className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Confirmar Rejeição</button>
                </div>
            </div>
        );
    };

    const handleChangeAppStatus = async (appId: string, newStatus: ApplicationStatus) => {
        try {
            const app = applications.find(a => a.id === appId);
            if (!app) return;

            const updateData: any = { 
                status: newStatus,
                viewedByProfessor: newStatus === ApplicationStatus.ACCEPTED ? false : app.viewedByProfessor
            };
            
            await updateDoc(doc(db, "applications", appId), updateData);

            if(newStatus === ApplicationStatus.DECLINED) {
                const project = projects.find(p => p.id === app.projectId);
                if (project) {
                    await updateDoc(doc(db, "projects", project.id), {
                         vacancies: project.vacancies + 1
                    });
                }
            }
            handleNavigate('myApplications');
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar status.");
        }
    }
    
    const handleCancelApplication = (applicationId: string) => {
        const confirmAction = async () => {
            try {
                const appToCancel = applications.find(a => a.id === applicationId);
                if (!appToCancel) return;

                await deleteDoc(doc(db, "applications", applicationId));

                if (appToCancel.status === ApplicationStatus.SELECTED) {
                    const project = projects.find(p => p.id === appToCancel.projectId);
                    if (project) {
                        await updateDoc(doc(db, "projects", project.id), {
                            vacancies: project.vacancies + 1
                        });
                    }
                }
                
                closeModal();
            } catch (err) {
                console.error(err);
                alert("Erro ao cancelar candidatura.");
            }
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
        if (isAuthChecking) {
            return (
                <div className="flex h-screen w-full items-center justify-center">
                    <Spinner className="w-12 h-12 text-primary" />
                </div>
            );
        }

        // Security Guard
        if (!currentUser && view.name !== 'login' && view.name !== 'signup') {
             return <LoginView onLogin={handleLogin} onNavigate={handleNavigate} error={error} isLoading={isLoading} />;
        }

        switch (view.name) {
            case 'login': return <LoginView onLogin={handleLogin} onNavigate={handleNavigate} error={error} isLoading={isLoading} />;
            case 'signup': return <SignupView onSignup={handleSignup} onNavigate={handleNavigate} error={error} isLoading={isLoading} />;
            case 'myProjects': return <MyProjectsView projects={projects.filter(p => p.professorId === currentUser?.id)} onNavigate={handleNavigate} onEdit={(project) => handleNavigate('editProject', project)} />;
            case 'createProject': return <ProjectFormView onSubmit={handleCreateProject} isLoading={isLoading} onNavigate={handleNavigate} />;
            case 'editProject': return <ProjectFormView onSubmit={handleUpdateProject} projectToEdit={view.data} isLoading={isLoading} onNavigate={handleNavigate} />;
            case 'candidatures': 
                const profApps = applications.filter(a => a.professorId === currentUser?.id);
                return <CandidaturesView applications={profApps} projects={projects} users={usersCache} onNavigate={handleNavigate} onSelect={handleConfirmSelection} onReject={handleRejectCandidate}/>;
            case 'availableProjects': return <AvailableProjectsView projects={projects} onNavigate={handleNavigate}/>;
            case 'projectDetails': return <ProjectDetailsView project={view.data} currentUser={currentUser} applications={applications} onApply={handleApply} onNavigate={handleNavigate} isLoading={isLoading} />;
            case 'myApplications': return <MyApplicationsView applications={applications.filter(a => a.studentId === currentUser?.id)} projects={projects} onStatusChange={handleChangeAppStatus} onCancel={handleCancelApplication} />;
            case 'myCurriculum': return <MyCurriculumView currentUser={currentUser as Student} onUpdate={handleUpdateCurriculum} isLoading={isLoading} />;
            case 'profile': return <ProfileView currentUser={currentUser!} onUpdate={handleUpdateProfile} isLoading={isLoading} />;
            case 'dashboard':
                return currentUser?.role === UserRole.PROFESSOR 
                    ? <MyProjectsView projects={projects.filter(p => p.professorId === currentUser.id)} onNavigate={handleNavigate} onEdit={(project) => handleNavigate('editProject', project)} />
                    : <AvailableProjectsView projects={projects} onNavigate={handleNavigate}/>;
            default: return <LoginView onLogin={handleLogin} onNavigate={handleNavigate} error={error} isLoading={isLoading} />;
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <Header currentUser={currentUser} onLogout={handleLogout} setView={handleNavigate} notifications={{ student: hasStudentNotification, professor: hasProfessorNotification }} />
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
const inputStyles = "w-full px-4 py-2 bg-light border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all";

const LoginView = ({ onLogin, onNavigate, error, isLoading }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
        <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 mt-16 border border-gray-100">
            <div className="text-center mb-8">
                 <div className="inline-block">
                    <IcarusLogo />
                 </div>
                <h2 className="text-3xl font-bold text-text-primary mt-4">Bem-vindo</h2>
                <p className="text-text-secondary mt-1">Faça login para continuar</p>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            <form onSubmit={e => { e.preventDefault(); onLogin(email, password); }} className="space-y-6">
                <div>
                    <label className="block text-text-secondary mb-2 font-medium" htmlFor="email">E-mail</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} placeholder="seu.email@usp.br" required/>
                </div>
                <div>
                    <label className="block text-text-secondary mb-2 font-medium" htmlFor="password">Senha</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyles} required/>
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
                <input type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required />
                <input type="text" placeholder="NUSP" value={nusp} onChange={e => setNusp(e.target.value)} className={inputStyles} required />
                <input type="email" placeholder="E-mail USP" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} required />
                <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className={inputStyles} required />
                 
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className={`${inputStyles} bg-light`}>
                    <option value={UserRole.STUDENT}>Sou Aluno</option>
                    <option value={UserRole.PROFESSOR}>Sou Professor</option>
                </select>
                
                {role === UserRole.STUDENT && (
                    <>
                        <input type="text" placeholder="Curso" value={course} onChange={e => setCourse(e.target.value)} className={inputStyles} required />
                        <input type="number" placeholder="Período Ideal" value={idealPeriod} onChange={e => setIdealPeriod(e.target.value)} className={inputStyles} required />
                    </>
                )}
                
                {role === UserRole.PROFESSOR && (
                    <>
                        <input type="text" placeholder="Faculdade (Ex: EP, FEA)" value={faculty} onChange={e => setFaculty(e.target.value)} className={inputStyles} required />
                        <input type="text" placeholder="Departamento (Ex: PMR, PCS)" value={department} onChange={e => setDepartment(e.target.value)} className={inputStyles} required />
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

const ProfileView = ({ currentUser, onUpdate, isLoading }: { currentUser: User, onUpdate: (data: any) => void, isLoading: boolean }) => {
    const isStudent = currentUser.role === UserRole.STUDENT;
    const [formData, setFormData] = useState({
        name: currentUser.name,
        nusp: currentUser.nusp,
        email: currentUser.email,
        // Student fields
        course: isStudent ? (currentUser as Student).course : '',
        idealPeriod: isStudent ? (currentUser as Student).idealPeriod : '',
        // Professor fields
        faculty: !isStudent ? (currentUser as Professor).faculty : '',
        department: !isStudent ? (currentUser as Professor).department : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData: any = {
            name: formData.name,
            nusp: formData.nusp,
            email: formData.email,
        };

        if (isStudent) {
            updatedData.course = formData.course;
            updatedData.idealPeriod = Number(formData.idealPeriod);
        } else {
            updatedData.faculty = formData.faculty;
            updatedData.department = formData.department;
        }

        onUpdate(updatedData);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4 mb-6 border-b border-gray-200 pb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                    {isStudent ? <StudentIcon className="w-10 h-10" /> : <ProfessorIcon className="w-10 h-10" />}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Meus Dados</h1>
                    <p className="text-text-secondary">Atualize suas informações cadastrais</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                         <label className="block text-text-secondary font-medium mb-1">Nome Completo</label>
                         <input name="name" value={formData.name} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">NUSP</label>
                        <input name="nusp" value={formData.nusp} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                         <label className="block text-text-secondary font-medium mb-1">E-mail</label>
                         <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputStyles} disabled title="Email não pode ser alterado diretamente" required />
                    </div>
                    
                    {isStudent && (
                        <>
                            <div className="md:col-span-2">
                                <label className="block text-text-secondary font-medium mb-1">Curso</label>
                                <input name="course" value={formData.course} onChange={handleChange} className={inputStyles} required />
                            </div>
                             <div>
                                <label className="block text-text-secondary font-medium mb-1">Período Ideal</label>
                                <input name="idealPeriod" type="number" value={formData.idealPeriod} onChange={handleChange} className={inputStyles} required />
                            </div>
                        </>
                    )}

                    {!isStudent && (
                        <>
                             <div>
                                <label className="block text-text-secondary font-medium mb-1">Faculdade (Ex: EP, FEA)</label>
                                <input name="faculty" value={formData.faculty} onChange={handleChange} className={inputStyles} required />
                            </div>
                             <div>
                                <label className="block text-text-secondary font-medium mb-1">Departamento</label>
                                <input name="department" value={formData.department} onChange={handleChange} className={inputStyles} required />
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover font-semibold transition-all duration-300 flex items-center justify-center disabled:bg-gray-400">
                        {isLoading ? <Spinner className="w-6 h-6 text-white"/> : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const MyProjectsView = ({ projects, onNavigate, onEdit }: { projects: Project[], onNavigate: (view: string, data?: any) => void, onEdit: (project: Project) => void }) => (
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
                            <th className="p-4 font-semibold text-text-secondary uppercase text-sm hidden lg:table-cell">Vagas</th>
                            <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-light transition-colors">
                                <td className="p-4 font-semibold text-primary">{p.title}</td>
                                <td className="p-4 text-text-primary hidden md:table-cell">{p.area}</td>
                                <td className="p-4 text-text-primary hidden lg:table-cell">{p.vacancies}</td>
                                <td className="p-4">
                                    <button onClick={() => onEdit(p)} className="text-primary hover:underline font-medium">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const ProjectFormView = ({ onSubmit, projectToEdit, isLoading, onNavigate }: any) => {
    const isEditing = !!projectToEdit;
    
    const [formData, setFormData] = useState({
        title: projectToEdit?.title || '',
        area: projectToEdit?.area || '',
        theme: projectToEdit?.theme || '',
        duration: projectToEdit?.duration || '',
        scholarshipDetails: projectToEdit?.scholarshipDetails || '',
        keywords: projectToEdit?.keywords.join(', ') || '',
        vacancies: projectToEdit?.vacancies || 1,
        description: projectToEdit?.description || ''
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const projectData = {
            ...formData,
            keywords: formData.keywords.split(',').map((k: string) => k.trim()),
            vacancies: Number(formData.vacancies),
            hasScholarship: !!formData.scholarshipDetails,
        };
        
        if (isEditing) {
            onSubmit({ ...projectToEdit, ...projectData });
        } else {
            onSubmit(projectData);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h1 className="text-3xl font-bold text-text-primary mb-6 border-b border-gray-200 pb-4">{isEditing ? 'Editar Projeto' : 'Incluir Novo Projeto'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">Título*</label>
                        <input name="title" value={formData.title} onChange={handleChange} className={inputStyles} required />
                    </div>
                     <div>
                        <label className="block text-text-secondary font-medium mb-1">Área de pesquisa*</label>
                        <input name="area" value={formData.area} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">Tema*</label>
                        <input name="theme" value={formData.theme} onChange={handleChange} className={inputStyles} required />
                    </div>
                     <div>
                        <label className="block text-text-secondary font-medium mb-1">Duração*</label>
                        <input name="duration" value={formData.duration} onChange={handleChange} className={inputStyles} required />
                    </div>
                </div>
                 <div>
                    <label className="block text-text-secondary font-medium mb-1">Bolsa (Ex: CNPq - R$2.200, deixe em branco se não houver)</label>
                    <input name="scholarshipDetails" value={formData.scholarshipDetails} onChange={handleChange} className={inputStyles} />
                </div>
                <div>
                    <label className="block text-text-secondary font-medium mb-1">Breve descrição*</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className={`${inputStyles} h-auto`} required />
                </div>
                 <div>
                    <label className="block text-text-secondary font-medium mb-1">Palavras-chave* (separadas por vírgula)</label>
                    <input name="keywords" value={formData.keywords} onChange={handleChange} className={inputStyles} required />
                </div>
                <div>
                    <label className="block text-text-secondary font-medium mb-1">Quantidade de Vagas*</label>
                    <input name="vacancies" type="number" min="0" value={formData.vacancies} onChange={handleChange} className={inputStyles} required />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 space-x-3">
                     <button type="button" onClick={() => onNavigate('myProjects')} className="bg-gray-200 text-text-secondary px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                        Cancelar
                     </button>
                     <button type="submit" disabled={isLoading} className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-hover transition-all duration-300 shadow hover:shadow-lg font-semibold flex items-center justify-center disabled:bg-gray-400">
                        {isLoading ? <Spinner className="w-6 h-6 text-white"/> : (isEditing ? 'Atualizar Projeto' : 'Salvar Projeto')}
                     </button>
                </div>
            </form>
        </div>
    );
};

const CandidaturesView = ({ applications, projects, users, onNavigate, onSelect, onReject }: any) => {
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
                                    // Handle base64 display
                                    const curriculumUrl = student?.curriculumBase64 || '#';
                                    const hasCurriculum = !!student?.curriculumBase64;
                                    
                                    const statusBadgeStyles: {[key: string]: string} = {
                                        [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
                                        [ApplicationStatus.SELECTED]: 'bg-green-100 text-green-800',
                                        [ApplicationStatus.NOT_SELECTED]: 'bg-red-100 text-red-800',
                                        [ApplicationStatus.ACCEPTED]: 'bg-blue-100 text-blue-800',
                                        [ApplicationStatus.DECLINED]: 'bg-gray-100 text-gray-800',
                                    };

                                    return (
                                        <tr key={app.id} className="border-b border-gray-100 last:border-0 hover:bg-light transition-colors">
                                            <td className="p-4 font-semibold text-text-primary">{student?.name || 'Carregando...'}</td>
                                            <td className="p-4 text-text-primary hidden md:table-cell">{student?.nusp}</td>
                                            <td className="p-4 text-text-primary hidden lg:table-cell">{student?.course}</td>
                                            <td className="p-4">
                                                {hasCurriculum ? (
                                                    <a href={curriculumUrl} download={student?.curriculumFileName || 'curriculo.pdf'} className="text-primary hover:underline font-medium">
                                                        Baixar
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">Não enviado</span>
                                                )}
                                            </td>
                                            <td className="p-4"><span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${statusBadgeStyles[app.status] || 'bg-gray-100 text-gray-800'}`}>{app.status}</span></td>
                                            <td className="p-4">
                                                {app.status === ApplicationStatus.PENDING && student && (
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => onSelect(app.id, student.id, selectedProject.id)} className="bg-green-500 text-white px-4 py-1.5 text-sm rounded-md hover:bg-green-600 transition-colors">Selecionar</button>
                                                        <button onClick={() => onReject(app.id)} className="bg-red-500 text-white px-4 py-1.5 text-sm rounded-md hover:bg-red-600 transition-colors">Rejeitar</button>
                                                    </div>
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
        {projects.length === 0 ? (
            <p className="text-text-secondary text-lg">Não há projetos disponíveis no momento.</p>
        ) : (
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
        )}
    </div>
);

const ProjectDetailsView = ({ project, currentUser, applications, onApply, onNavigate, isLoading }: any) => {
    const [motivation, setMotivation] = useState('');
    const hasApplied = applications.some((a: Application) => a.projectId === project.id && a.studentId === currentUser?.id);
    const studentProfile = currentUser as Student;
    const canApply = studentProfile && studentProfile.curriculumBase64;

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
                                    <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={5} className={`${inputStyles} h-auto`} required />
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

    const hasActions = applications.some((app: Application) => app.status === ApplicationStatus.PENDING || app.status === ApplicationStatus.SELECTED);
    
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
                                {hasActions && <th className="p-4 font-semibold text-text-secondary uppercase text-sm">Ação</th>}
                            </tr>
                        </thead>
                         <tbody>
                            {applications.map((app: Application) => {
                                const project = projects.find((p: Project) => p.id === app.projectId);
                                return (
                                    <tr key={app.id} className="border-b border-gray-100 last:border-0 hover:bg-light transition-colors">
                                        <td className="p-4 font-semibold text-text-primary">{project?.title || 'Projeto removido'}</td>
                                        <td className="p-4 text-text-primary hidden md:table-cell">{project?.professorName || '-'}</td>
                                        <td className="p-4 text-text-primary hidden lg:table-cell">{app.applicationDate}</td>
                                        <td className="p-4">{renderStatusBadge(app.status)}</td>
                                        {hasActions && (
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
                                        )}
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
                        <p className="text-xs text-gray-500">{selectedFile ? selectedFile.name : 'PDF, DOCX até 1MB'}</p>
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
