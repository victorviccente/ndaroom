import { useState, useEffect, useRef, type JSX } from 'react';
import { 
  Clock, Music, Play, Pause, Volume2, VolumeX, Plus, Check, Trash2, 
  Calendar, Timer, Coffee, Moon, Sun, BookOpen, Settings, Code, Save,
  AlertTriangle, MessageSquare, PanelRight, X, Maximize, Minimize,
  ChevronLeft, ChevronRight, Search, Filter, Server,
  Briefcase, Laptop, Bookmark, TrendingUp, CheckCircle, FilePlus
} from 'lucide-react';

// Interfaces e tipos
interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  dueDate?: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

interface LofiStation {
  name: string;
  url: string;
  icon: JSX.Element;
}

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';
type Theme = 'dark' | 'light';
type TaskFilter = 'all' | 'active' | 'completed' | 'high' | 'medium' | 'low' | string;
type ActiveTab = 'tasks' | 'pomodoro' | 'music' | 'notes' | 'dashboard';

// Componente principal
export default function NDARoom(): JSX.Element {
  // Estados para tarefas
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('nda-room-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: 1, text: 'Concluir laboratório de React', completed: false, priority: 'high', category: 'frontend', createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 86400000).toISOString() },
      { id: 2, text: 'Implementar API com Node.js', completed: false, priority: 'medium', category: 'backend', createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 172800000).toISOString() },
      { id: 3, text: 'Estudar algoritmos de ordenação', completed: false, priority: 'low', category: 'estudos', createdAt: new Date().toISOString() },
      { id: 4, text: 'Revisar documentação do projeto', completed: true, priority: 'medium', category: 'docs', createdAt: new Date().toISOString() }
    ];
  });
  const [newTask, setNewTask] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<string>('');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');
  const [taskCategories, setTaskCategories] = useState<string[]>(['frontend', 'backend', 'estudos', 'docs', 'design', 'devops']);
  const [taskDueDate, setTaskDueDate] = useState<string>('');

  // Estados para música
  const [time, setTime] = useState<Date>(new Date());
  const [playing, setPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem('nda-room-volume');
    return savedVolume ? parseInt(savedVolume) : 50;
  });
  const [muted, setMuted] = useState<boolean>(false);
  const [currentStation, setCurrentStation] = useState<number>(0);

  // Estados para pomodoro
  const [pomodoroMinutes, setPomodoroMinutes] = useState<number>(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(0);
  const [pomodoroActive, setPomodoroActive] = useState<boolean>(false);
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('work');
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [pomodoroGoal, setPomodoroGoal] = useState<number>(8);

  // Estados para notas rápidas
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('nda-room-notes');
    return savedNotes ? JSON.parse(savedNotes) : [
      {
        id: 1,
        title: "Conceitos de API RESTful",
        content: "- API RESTful utiliza métodos HTTP padrão\n- GET: Obter recursos\n- POST: Criar recursos\n- PUT: Atualizar recursos\n- DELETE: Remover recursos\n\nLembrar de implementar autenticação JWT.",
        createdAt: new Date().toISOString(),
        tags: ["api", "backend", "http"]
      }
    ];
  });
  const [currentNote, setCurrentNote] = useState<string>('');
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteTags, setNoteTags] = useState<string>('');
  const [noteFilter, setNoteFilter] = useState<string>('');

  // Estados para UI
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('nda-room-theme');
    return (savedTheme as Theme) || 'dark';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<{id: number, message: string, type: 'info' | 'success' | 'warning' | 'error'}[]>([]);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Progresso semanal (dashboard)
  const weeklyProgress = {
    tasks: {
      completed: tasks.filter(t => t.completed).length,
      total: tasks.length,
      percentage: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
    },
    pomodoros: {
      completed: pomodoroCount,
      goal: pomodoroGoal,
      percentage: Math.min(Math.round((pomodoroCount / pomodoroGoal) * 100), 100)
    },
    streakDays: 5
  };

  const lofiStations: LofiStation[] = [
    {
      name: "Chillhop Radio",
      url: "https://stream.chillhop.com/mp3",
      icon: <Music className="h-5 w-5" />,
    },
    {
      name: "Lo-Fi Hip Hop Radio",
      url: "https://stream.zeno.fm/0r0ryv0vhrhvv",
      icon: <Laptop className="h-5 w-5" />,
    },
    {
      name: "24/7 Lo-Fi Radio",
      url: "https://stream.247lofiradio.com/listen/247_lofi_radio/radio.mp3",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Ambient Flow",
      url: "https://listen.di.fm/public3/lofihiphop.pls",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "Deep Focus",
      url: "https://stream.laut.fm/lofi",
      icon: <Code className="h-5 w-5" />,
    },
    {
      name: "Tech Vibes",
      url: "https://radio.rcast.net/stream/60066",
      icon: <Server className="h-5 w-5" />,
    },
  ];

  // Atualiza o relógio
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Controles de áudio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = muted;
      if (playing) {
        audioRef.current.play().catch(e => {
          console.log('Audio play failed:', e);
          addNotification('Não foi possível reproduzir o áudio. Verifique sua conexão.', 'warning');
        });
      } else {
        audioRef.current.pause();
      }
    }
    localStorage.setItem('nda-room-volume', volume.toString());
  }, [playing, volume, muted, currentStation]);

  // Persistência de dados
  useEffect(() => {
    localStorage.setItem('nda-room-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nda-room-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nda-room-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Lógica do Pomodoro
  useEffect(() => {
    if (pomodoroActive) {
      intervalRef.current = window.setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds(pomodoroSeconds - 1);
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes(pomodoroMinutes - 1);
          setPomodoroSeconds(59);
        } else {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
          }
          
          const notification = new Audio('/notification.mp3');
          notification.play().catch(e => console.log('Notification play failed:', e));
          
          if (pomodoroMode === 'work') {
            const newCount = pomodoroCount + 1;
            setPomodoroCount(newCount);
            addNotification('Pomodoro concluído! É hora de uma pausa.', 'success');
            
            if (newCount % 4 === 0) {
              setPomodoroMode('longBreak');
              setPomodoroMinutes(15);
              addNotification('É hora de uma pausa longa! Alongue-se e hidrate-se.', 'info');
            } else {
              setPomodoroMode('shortBreak');
              setPomodoroMinutes(5);
            }
          } else {
            setPomodoroMode('work');
            setPomodoroMinutes(25);
            addNotification('Pausa concluída! Vamos voltar ao trabalho.', 'info');
          }
          
          setPomodoroActive(false);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pomodoroActive, pomodoroMinutes, pomodoroSeconds, pomodoroMode, pomodoroCount]);

  // Funções de gerenciamento de tarefas
  const addTask = (): void => {
    if (newTask.trim()) {
      const newTaskItem: Task = { 
        id: Date.now(), 
        text: newTask, 
        completed: false,
        priority: newTaskPriority,
        category: newTaskCategory || 'outros',
        createdAt: new Date().toISOString(),
        dueDate: taskDueDate || undefined
      };
      
      setTasks([...tasks, newTaskItem]);
      setNewTask('');
      setNewTaskPriority('medium');
      setNewTaskCategory('');
      setTaskDueDate('');
      addNotification('Tarefa adicionada com sucesso!', 'success');
    }
  };

  const toggleComplete = (id: number): void => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newStatus = !task.completed;
        if (newStatus) {
          addNotification('Parabéns! Tarefa concluída.', 'success');
        }
        return { ...task, completed: newStatus };
      }
      return task;
    }));
  };

  const deleteTask = (id: number): void => {
    setTasks(tasks.filter(task => task.id !== id));
    addNotification('Tarefa removida.', 'info');
  };

  // Funções do player
  const togglePlay = (): void => setPlaying(!playing);
  const toggleMute = (): void => setMuted(!muted);
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>): void => setVolume(parseInt(e.target.value));
  const changeStation = (index: number): void => {
    setCurrentStation(index);
    if (!playing) setPlaying(true);
    addNotification(`Tocando agora: ${lofiStations[index].name}`, 'info');
  };

  // Funções do pomodoro
  const startPomodoro = (): void => {
    setPomodoroActive(true);
    addNotification(`Iniciando ${pomodoroMode === 'work' ? 'sessão de estudo' : 'pausa'}`, 'info');
  };

  const pausePomodoro = (): void => {
    setPomodoroActive(false);
  };

  const resetPomodoro = (): void => {
    setPomodoroActive(false);
    if (pomodoroMode === 'work') {
      setPomodoroMinutes(25);
    } else if (pomodoroMode === 'shortBreak') {
      setPomodoroMinutes(5);
    } else {
      setPomodoroMinutes(15);
    }
    setPomodoroSeconds(0);
  };

  const setPomodoroPeriod = (mode: PomodoroMode): void => {
    setPomodoroActive(false);
    setPomodoroMode(mode);
    
    if (mode === 'work') {
      setPomodoroMinutes(25);
    } else if (mode === 'shortBreak') {
      setPomodoroMinutes(5);
    } else {
      setPomodoroMinutes(15);
    }
    
    setPomodoroSeconds(0);
  };

  // Funções de notas
  const addNote = (): void => {
    if (currentNote.trim()) {
      const parsedTags = noteTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      const newNote: Note = {
        id: Date.now(),
        title: noteTitle || 'Sem título',
        content: currentNote,
        createdAt: new Date().toISOString(),
        tags: parsedTags
      };
      
      setNotes([...notes, newNote]);
      setCurrentNote('');
      setNoteTitle('');
      setNoteTags('');
      addNotification('Nota salva com sucesso!', 'success');
    }
  };

  const deleteNote = (id: number): void => {
    setNotes(notes.filter(note => note.id !== id));
    addNotification('Nota removida.', 'info');
  };

  // Funções de UI
  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    addNotification(`Tema alterado para ${theme === 'dark' ? 'claro' : 'escuro'}.`, 'info');
  };

  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Erro ao entrar em tela cheia: ${err.message}`);
        addNotification('Não foi possível entrar em modo de tela cheia.', 'error');
      });
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  // Sistema de notificações
  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error'): void => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };

  const removeNotification = (id: number): void => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Filtragem de tarefas
  const filteredTasks = tasks
    .filter(task => {
      if (taskFilter === 'all') return true;
      if (taskFilter === 'completed') return task.completed;
      if (taskFilter === 'active') return !task.completed;
      if (taskFilter === 'high') return task.priority === 'high';
      if (taskFilter === 'medium') return task.priority === 'medium';
      if (taskFilter === 'low') return task.priority === 'low';
      if (taskCategories.includes(taskFilter)) return task.category === taskFilter;
      return true;
    })
    .filter(task => {
      if (!taskSearchQuery) return true;
      return task.text.toLowerCase().includes(taskSearchQuery.toLowerCase()) || 
             task.category.toLowerCase().includes(taskSearchQuery.toLowerCase());
    });

  // Filtragem de notas
  const filteredNotes = notes.filter(note => {
    if (!noteFilter) return true;
    return note.title.toLowerCase().includes(noteFilter.toLowerCase()) || 
           note.content.toLowerCase().includes(noteFilter.toLowerCase()) ||
           note.tags.some(tag => tag.toLowerCase().includes(noteFilter.toLowerCase()));
  });

  // Formatação de data
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Classes de tema
  const bgMain = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const bgCardHover = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const bgInput = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const primaryBg = theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500';
  const primaryHover = theme === 'dark' ? 'hover:bg-blue-700' : 'hover:bg-blue-600';
  const primaryText = theme === 'dark' ? 'text-blue-400' : 'text-blue-500';

  // Renderização do componente principal
  return (
    <div className={`flex flex-col h-screen ${bgMain} ${textColor} transition-colors duration-200`}>
      {/* Cabeçalho */}
      <header className={`${bgCard} border-b ${borderColor} p-3 flex justify-between items-center shadow-sm z-10`}>
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className={`mr-3 p-2 rounded-full ${bgCardHover}`}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          <h1 className="text-xl font-bold flex items-center">
            <Code className={`h-6 w-6 mr-2 ${primaryText}`} />
            <span className="hidden sm:inline">NDA Room</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`hidden sm:flex items-center py-1 px-3 rounded-full ${bgCard} ${borderColor} border`}>
            <Clock className={`h-4 w-4 ${primaryText} mr-2`} />
            <span className={textMuted}>
              {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-full ${bgCardHover}`}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
          </button>
          
          <button 
            onClick={toggleFullscreen} 
            className={`p-2 rounded-full ${bgCardHover}`}
            aria-label="Tela cheia"
          >
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-2 rounded-full ${bgCardHover}`}
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Área principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Barra lateral */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} ${bgCard} border-r ${borderColor} transition-all duration-300 flex flex-col py-4 overflow-hidden`}>
          {sidebarOpen && (
            <>
              <div className="px-4 mb-6">
                <div className={`p-4 rounded-lg ${primaryBg} bg-opacity-10 border ${borderColor} flex flex-col items-center`}>
                  <div className="text-center mb-2">
                    <h3 className="font-bold text-lg">Olá, Estudante!</h3>
                    <p className={`text-sm ${textMuted}`}>Bom ver você novamente</p>
                  </div>
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso semanal</span>
                      <span className="font-medium">{weeklyProgress.tasks.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className={`${primaryBg} rounded-full h-2`} 
                        style={{ width: `${weeklyProgress.tasks.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 px-2">
                <ul className="space-y-1">
                  <li>
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        activeTab === 'dashboard' 
                          ? `${primaryBg} text-white` 
                          : `${bgCardHover}`
                      }`}
                    >
                      <TrendingUp className="h-5 w-5 mr-3" />
                      <span>Dashboard</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('tasks')}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        activeTab === 'tasks' 
                          ? `${primaryBg} text-white` 
                          : `${bgCardHover}`
                      }`}
                    >
                      <Calendar className="h-5 w-5 mr-3" />
                      <span>Tarefas</span>
                      <span className={`ml-auto ${primaryBg} text-white text-xs rounded-full px-2 py-0.5`}>
                        {tasks.filter(t => !t.completed).length}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('pomodoro')}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        activeTab === 'pomodoro' 
                          ? `${primaryBg} text-white` 
                          : `${bgCardHover}`
                      }`}
                    >
                      <Timer className="h-5 w-5 mr-3" />
                      <span>Pomodoro</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('music')}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        activeTab === 'music' 
                          ? `${primaryBg} text-white` 
                          : `${bgCardHover}`
                      }`}
                    >
                      <Music className="h-5 w-5 mr-3" />
                      <span>Música</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('notes')}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        activeTab === 'notes' 
                          ? `${primaryBg} text-white` 
                          : `${bgCardHover}`
                      }`}
                    >
                      <BookOpen className="h-5 w-5 mr-3" />
                      <span>Notas</span>
                    </button>
                  </li>
                </ul>
              </nav>
              
              <div className="mt-auto px-4">
                <div className={`p-3 rounded-lg ${bgCard} border ${borderColor} text-sm`}>
                  <p className={`${textMuted} mb-2`}>Streak de estudos:</p>
                  <div className="flex items-center">
                    <div className={`${primaryText} font-bold text-lg`}>5 dias</div>
                    <span className="ml-auto">🔥</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Sistema de notificações */}
          <div className="fixed top-5 right-5 z-50 space-y-2 max-w-sm">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 pr-8 rounded-lg shadow-lg flex items-start relative animate-slide-in ${
                  notification.type === 'success' ? 'bg-green-500 text-white' :
                  notification.type === 'warning' ? 'bg-yellow-500 text-gray-900' :
                  notification.type === 'error' ? 'bg-red-500 text-white' :
                  'bg-blue-500 text-white'
                }`}
              >
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />}
                {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />}
                {notification.type === 'error' && <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />}
                {notification.type === 'info' && <MessageSquare className="h-5 w-5 mr-2 flex-shrink-0" />}
                <p className="text-sm">{notification.message}</p>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="absolute top-1 right-1 text-white hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {/* Painel principal */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Bem-vindo ao NDA Room</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card de Progresso de Tarefas */}
                  <div className={`${bgCard} p-6 rounded-lg shadow-sm border ${borderColor}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Progresso de Tarefas</h3>
                      <Calendar className={`h-6 w-6 ${primaryText}`} />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{weeklyProgress.tasks.percentage}%</div>
                      <p className={`text-sm ${textMuted}`}>
                        {weeklyProgress.tasks.completed} de {weeklyProgress.tasks.total} tarefas concluídas
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                        <div 
                          className={`${primaryBg} rounded-full h-3`} 
                          style={{ width: `${weeklyProgress.tasks.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card de Progresso de Pomodoro */}
                  <div className={`${bgCard} p-6 rounded-lg shadow-sm border ${borderColor}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Progresso de Pomodoro</h3>
                      <Timer className={`h-6 w-6 ${primaryText}`} />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{weeklyProgress.pomodoros.percentage}%</div>
                      <p className={`text-sm ${textMuted}`}>
                        {weeklyProgress.pomodoros.completed} de {weeklyProgress.pomodoros.goal} pomodoros
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                        <div 
                          className={`${primaryBg} rounded-full h-3`} 
                          style={{ width: `${weeklyProgress.pomodoros.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card de Streak */}
                  <div className={`${bgCard} p-6 rounded-lg shadow-sm border ${borderColor}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Streak de Estudos</h3>
                      <Bookmark className={`h-6 w-6 ${primaryText}`} />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{weeklyProgress.streakDays} dias</div>
                      <p className={`text-sm ${textMuted}`}>Continue firme!</p>
                    </div>
                  </div>
                </div>

                {/* Tarefas Recentes */}
                <div className={`${bgCard} p-6 rounded-lg shadow-sm border ${borderColor}`}>
                  <h3 className="text-lg font-semibold mb-4">Tarefas Recentes</h3>
                  <ul className="space-y-3">
                    {filteredTasks.slice(0, 3).map(task => (
                      <li 
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${bgCardHover} transition-colors`}
                      >
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleComplete(task.id)}
                            className={`mr-3 p-1 rounded-full ${
                              task.completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            {task.completed && <Check className="h-4 w-4" />}
                          </button>
                          <div>
                            <span className={task.completed ? 'line-through text-gray-500' : ''}>
                              {task.text}
                            </span>
                            <div className="flex mt-1 space-x-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${bgInput}`}>
                                {task.category}
                              </span>
                              {task.dueDate && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${bgInput}`}>
                                  Prazo: {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {filteredTasks.length > 3 && (
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className={`mt-4 text-sm ${primaryText} hover:underline`}
                    >
                      Ver todas as tarefas
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tarefas */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Tarefas</h2>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={taskSearchQuery}
                        onChange={(e) => setTaskSearchQuery(e.target.value)}
                        placeholder="Pesquisar tarefas..."
                        className={`w-full pl-10 pr-3 py-2 rounded-lg ${bgInput} ${borderColor} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <select 
                      value={taskFilter}
                      onChange={(e) => setTaskFilter(e.target.value as TaskFilter)}
                      className={`px-3 py-2 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                    >
                      <option value="all">Todas</option>
                      <option value="active">Ativas</option>
                      <option value="completed">Concluídas</option>
                      <option value="high">Alta Prioridade</option>
                      <option value="medium">Média Prioridade</option>
                      <option value="low">Baixa Prioridade</option>
                      {taskCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`${bgCard} p-6 rounded-lg shadow-sm border ${borderColor}`}>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && addTask()}
                      placeholder="Adicionar nova tarefa..."
                      className={`flex-1 p-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                    />
                    <button 
                      onClick={addTask}
                      className={`${primaryBg} ${primaryHover} p-3 rounded-lg text-white flex items-center`}
                    >
                      <Plus className="h-5 w-5 mr-2" /> Adicionar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select 
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                      className={`p-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                    >
                      <option value="low">Baixa Prioridade</option>
                      <option value="medium">Média Prioridade</option>
                      <option value="high">Alta Prioridade</option>
                    </select>
                    <select 
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className={`p-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                    >
                      <option value="">Selecionar Categoria</option>
                      {taskCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className={`p-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                    />
                  </div>
                </div>

                <ul className="space-y-3">
                  {filteredTasks.map(task => (
                    <li 
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${bgCard} shadow-sm border-l-4 ${
                        task.completed ? 'border-green-500 opacity-80' : 
                        task.priority === 'high' ? 'border-red-500' :
                        task.priority === 'medium' ? 'border-yellow-500' :
                        'border-blue-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className={`mr-3 p-1 rounded-full ${
                            task.completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          {task.completed && <Check className="h-4 w-4" />}
                        </button>
                        <div>
                          <span className={task.completed ? 'line-through text-gray-500' : ''}>
                            {task.text}
                          </span>
                          <div className="flex mt-1 space-x-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${bgInput}`}>
                              {task.category}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                            {task.dueDate && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${bgInput}`}>
                                Prazo: {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pomodoro */}
            {activeTab === 'pomodoro' && (
              <div className={`${bgCard} p-6 rounded-lg shadow-sm border ${borderColor} max-w-md mx-auto`}>
                <h2 className="text-2xl font-bold mb-6 text-center">Pomodoro</h2>
                
                <div className="flex justify-center mb-8">
                  <div className={`text-5xl font-bold ${
                    pomodoroMode === 'work' ? 'text-blue-500' :
                    pomodoroMode === 'shortBreak' ? 'text-green-500' :
                    'text-purple-500'
                  }`}>
                    {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
                  </div>
                </div>
                
                <div className="flex justify-center space-x-2 mb-8">
                  <button
                    onClick={() => setPomodoroPeriod('work')}
                    className={`px-4 py-2 rounded-lg ${
                      pomodoroMode === 'work' 
                        ? `${primaryBg} text-white` 
                        : `${bgCardHover}`
                    }`}
                  >
                    <Coffee className="h-5 w-5 inline mr-1" /> Trabalho
                  </button>
                  <button
                    onClick={() => setPomodoroPeriod('shortBreak')}
                    className={`px-4 py-2 rounded-lg ${
                      pomodoroMode === 'shortBreak' 
                        ? 'bg-green-600 text-white' 
                        : `${bgCardHover}`
                    }`}
                  >
                    <Coffee className="h-5 w-5 inline mr-1" /> Pausa Curta
                  </button>
                  <button
                    onClick={() => setPomodoroPeriod('longBreak')}
                    className={`px-4 py-2 rounded-lg ${
                      pomodoroMode === 'longBreak' 
                        ? 'bg-purple-600 text-white' 
                        : `${bgCardHover}`
                    }`}
                  >
                    <Moon className="h-5 w-5 inline mr-1" /> Pausa Longa
                  </button>
                </div>
                
                <div className="flex justify-center space-x-4">
                  {!pomodoroActive ? (
                    <button
                      onClick={startPomodoro}
                      className={`${primaryBg} ${primaryHover} px-6 py-3 rounded-lg text-white flex items-center`}
                    >
                      <Play className="h-5 w-5 mr-2" /> Iniciar
                    </button>
                  ) : (
                    <button
                      onClick={pausePomodoro}
                      className={`bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg text-white flex items-center`}
                    >
                      <Pause className="h-5 w-5 mr-2" /> Pausar
                    </button>
                  )}
                  <button
                    onClick={resetPomodoro}
                    className={`${bgCardHover} px-6 py-3 rounded-lg flex items-center`}
                  >
                    <Timer className="h-5 w-5 mr-2" /> Resetar
                  </button>
                </div>
                
                <div className="mt-8 text-center">
                  <p className={textMuted}>
                    Pomodoros Completados: <span className="font-bold">{pomodoroCount}</span> / {pomodoroGoal}
                  </p>
                </div>
              </div>
            )}

            {/* Música */}
            {activeTab === 'music' && (
              <div className={`${bgCard} p-6 rounded-lg shadow-sm border ${borderColor} max-w-md mx-auto`}>
                <h2 className="text-2xl font-bold mb-6 text-center">Música Lo-Fi</h2>
                
                <div className="mb-6">
                  <audio ref={audioRef} src={lofiStations[currentStation].url} />
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2">
                      {lofiStations[currentStation].icon}
                      <p className="text-lg font-medium">{lofiStations[currentStation].name}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4 mb-4">
                    <button
                      onClick={togglePlay}
                      className={`${primaryBg} ${primaryHover} p-3 rounded-full text-white`}
                    >
                      {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className={`${bgCardHover} p-3 rounded-full`}
                    >
                      {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <Volume2 className="h-5 w-5 mr-2" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={changeVolume}
                      className="w-32"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {lofiStations.map((station, index) => (
                    <button
                      key={station.name}
                      onClick={() => changeStation(index)}
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        currentStation === index
                          ? `${primaryBg} text-white`
                          : `${bgCardHover}`
                      }`}
                    >
                      {station.icon}
                      <span className="text-sm">{station.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Notas</h2>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={noteFilter}
                      onChange={(e) => setNoteFilter(e.target.value)}
                      placeholder="Pesquisar notas..."
                      className={`w-full pl-10 pr-3 py-2 rounded-lg ${bgInput} ${borderColor} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
                
                <div className={`${bgCard} p-6 rounded-lg shadow-sm border ${borderColor}`}>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Título da nota..."
                    className={`w-full p-3 mb-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                  />
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Digite sua nota aqui..."
                    rows={5}
                    className={`w-full p-3 mb-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                  />
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="Tags (separadas por vírgula)..."
                    className={`w-full p-3 mb-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                  />
                  <button 
                    onClick={addNote}
                    className={`${primaryBg} ${primaryHover} w-full p-3 rounded-lg text-white flex items-center justify-center`}
                  >
                    <Save className="h-5 w-5 mr-2" /> Salvar Nota
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map(note => (
                    <div 
                      key={note.id}
                      className={`${bgCard} p-4 rounded-lg shadow-sm border ${borderColor}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg truncate">{note.title}</h3>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className={`text-sm ${textMuted} mb-2 whitespace-pre-wrap line-clamp-3`}>
                        {note.content}
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {note.tags.map(tag => (
                            <span 
                              key={tag}
                              className={`text-xs px-2 py-0.5 rounded-full ${bgInput}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className={`text-xs ${textMuted}`}>
                        Criado em: {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de configurações */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${bgCard} p-6 rounded-lg shadow-lg max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Configurações</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tema</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className={`w-full p-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                >
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Volume padrão</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={changeVolume}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta de Pomodoros</label>
                <input
                  type="number"
                  min="1"
                  value={pomodoroGoal}
                  onChange={(e) => setPomodoroGoal(parseInt(e.target.value))}
                  className={`w-full p-3 rounded-lg ${bgInput} ${borderColor} border focus:outline-none`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}