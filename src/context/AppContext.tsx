// ==========================================
// アプリケーション状態管理
// ==========================================

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
    AppData,
    Client,
    Project,
    Activity,
    MeetingNote,
    ProjectStatus,
} from '../types';
import {
    loadAllData,
    saveClients,
    saveProjects,
    saveActivities,
    saveMeetingNotes,
    generateId,
    nowISO,
    seedData,
} from '../utils/storage';

// ==========================================
// State
// ==========================================
interface AppState {
    data: AppData;
    loading: boolean;
    error: string | null;
    initialized: boolean;
}

const initialState: AppState = {
    data: { clients: [], projects: [], activities: [], meetingNotes: [] },
    loading: false,
    error: null,
    initialized: false,
};

// ==========================================
// Actions
// ==========================================
type Action =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_DATA'; payload: AppData }
    | { type: 'SET_CLIENTS'; payload: Client[] }
    | { type: 'SET_PROJECTS'; payload: Project[] }
    | { type: 'SET_ACTIVITIES'; payload: Activity[] }
    | { type: 'SET_MEETING_NOTES'; payload: MeetingNote[] };

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_DATA':
            return { ...state, data: action.payload, initialized: true, loading: false, error: null };
        case 'SET_CLIENTS':
            return { ...state, data: { ...state.data, clients: action.payload } };
        case 'SET_PROJECTS':
            return { ...state, data: { ...state.data, projects: action.payload } };
        case 'SET_ACTIVITIES':
            return { ...state, data: { ...state.data, activities: action.payload } };
        case 'SET_MEETING_NOTES':
            return { ...state, data: { ...state.data, meetingNotes: action.payload } };
        default:
            return state;
    }
}

// ==========================================
// Context
// ==========================================
interface AppContextValue {
    state: AppState;
    // データ読込
    refreshData: () => Promise<void>;
    initSeedData: () => Promise<void>;
    // 顧客
    addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateClient: (client: Client) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    // 案件
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateProject: (project: Project) => Promise<void>;
    updateProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    // 活動
    addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
    deleteActivity: (id: string) => Promise<void>;
    // 議事メモ
    addMeetingNote: (note: Omit<MeetingNote, 'id' | 'uploadedAt'>) => Promise<void>;
    deleteMeetingNote: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const refreshData = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        try {
            const data = await loadAllData();
            dispatch({ type: 'SET_DATA', payload: data });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const initSeedData = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await seedData();
            const data = await loadAllData();
            dispatch({ type: 'SET_DATA', payload: data });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    // ---- 顧客 CRUD ----
    const addClient = useCallback(async (clientInput: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = nowISO();
        const newClient: Client = { ...clientInput, id: generateId(), createdAt: now, updatedAt: now };
        const updated = [...state.data.clients, newClient];
        await saveClients(updated);
        dispatch({ type: 'SET_CLIENTS', payload: updated });
    }, [state.data.clients]);

    const updateClient = useCallback(async (client: Client) => {
        const updated = state.data.clients.map((c) => (c.id === client.id ? { ...client, updatedAt: nowISO() } : c));
        await saveClients(updated);
        dispatch({ type: 'SET_CLIENTS', payload: updated });
    }, [state.data.clients]);

    const deleteClient = useCallback(async (id: string) => {
        const updated = state.data.clients.filter((c) => c.id !== id);
        await saveClients(updated);
        dispatch({ type: 'SET_CLIENTS', payload: updated });
    }, [state.data.clients]);

    // ---- 案件 CRUD ----
    const addProject = useCallback(async (input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = nowISO();
        const newProject: Project = { ...input, id: generateId(), createdAt: now, updatedAt: now };
        const updated = [...state.data.projects, newProject];
        await saveProjects(updated);
        dispatch({ type: 'SET_PROJECTS', payload: updated });
    }, [state.data.projects]);

    const updateProject = useCallback(async (project: Project) => {
        const updated = state.data.projects.map((p) => (p.id === project.id ? { ...project, updatedAt: nowISO() } : p));
        await saveProjects(updated);
        dispatch({ type: 'SET_PROJECTS', payload: updated });
    }, [state.data.projects]);

    const updateProjectStatus = useCallback(async (id: string, status: ProjectStatus) => {
        const updated = state.data.projects.map((p) =>
            p.id === id ? { ...p, status, updatedAt: nowISO() } : p
        );
        await saveProjects(updated);
        dispatch({ type: 'SET_PROJECTS', payload: updated });
    }, [state.data.projects]);

    const deleteProject = useCallback(async (id: string) => {
        const updated = state.data.projects.filter((p) => p.id !== id);
        await saveProjects(updated);
        dispatch({ type: 'SET_PROJECTS', payload: updated });
    }, [state.data.projects]);

    // ---- 活動ログ CRUD ----
    const addActivity = useCallback(async (input: Omit<Activity, 'id' | 'createdAt'>) => {
        const newActivity: Activity = { ...input, id: generateId(), createdAt: nowISO() };
        const updated = [...state.data.activities, newActivity];
        await saveActivities(updated);
        dispatch({ type: 'SET_ACTIVITIES', payload: updated });
    }, [state.data.activities]);

    const deleteActivity = useCallback(async (id: string) => {
        const updated = state.data.activities.filter((a) => a.id !== id);
        await saveActivities(updated);
        dispatch({ type: 'SET_ACTIVITIES', payload: updated });
    }, [state.data.activities]);

    // ---- 議事メモ CRUD ----
    const addMeetingNote = useCallback(async (input: Omit<MeetingNote, 'id' | 'uploadedAt'>) => {
        const newNote: MeetingNote = { ...input, id: generateId(), uploadedAt: nowISO() };
        const updated = [...state.data.meetingNotes, newNote];
        await saveMeetingNotes(updated);
        dispatch({ type: 'SET_MEETING_NOTES', payload: updated });
    }, [state.data.meetingNotes]);

    const deleteMeetingNote = useCallback(async (id: string) => {
        const updated = state.data.meetingNotes.filter((n) => n.id !== id);
        await saveMeetingNotes(updated);
        dispatch({ type: 'SET_MEETING_NOTES', payload: updated });
    }, [state.data.meetingNotes]);

    const value: AppContextValue = {
        state,
        refreshData,
        initSeedData,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        updateProjectStatus,
        deleteProject,
        addActivity,
        deleteActivity,
        addMeetingNote,
        deleteMeetingNote,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
