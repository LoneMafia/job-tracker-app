import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDoc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';

// NOTE: All component imports would be from separate files in a real project.
// For this environment, they are defined in the full code artifact.
// We are assuming the following components are defined elsewhere in the project:
// - ApplicationList, ApplicationDetail, Dashboard
// - ApplicationForm, ConfirmDeleteModal, ImportModal
// - PlusIcon, UploadIcon, ListIcon, ChartIcon

// --- Helper Functions & Constants ---
const firebaseConfig = {
  apiKey: "AIzaSyDGQozcym3Af40v8E8b2tSAjqph_2y455Y",
  authDomain: "job-application-tracker-248a6.firebaseapp.com",
  projectId: "job-application-tracker-248a6",
  storageBucket: "job-application-tracker-248a6.firebasestorage.app",
  messagingSenderId: "537204034923",
  appId: "1:537204034923:web:b007972c8a980add72902e",
  measurementId: "G-44GC43NFEB"
};
const appId = 'default-app-id';

// ====================================================================================
// --- FILE: src/App.js ---
// ====================================================================================

export default function App() {
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [applications, setApplications] = useState([]);
    const [statusHistory, setStatusHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState(null);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list'); // 'list', 'dashboard', 'detail'
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isPapaReady, setIsPapaReady] = useState(false);

    // Dynamically load PapaParse CSV library
    useEffect(() => {
        if (window.Papa) {
            setIsPapaReady(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/papaparse@5.3.2/papaparse.min.js';
        script.async = true;
        script.onload = () => setIsPapaReady(true);
        script.onerror = () => setError("Failed to load CSV parsing library. Please refresh.");
        document.body.appendChild(script);
        return () => {
            const scriptElement = document.querySelector('script[src="https://unpkg.com/papaparse@5.3.2/papaparse.min.js"]');
            if (scriptElement) document.body.removeChild(scriptElement);
        };
    }, []);

    // Initialize Firebase
    useEffect(() => {
        try {
            if (Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey !== "YOUR_API_KEY") {
                const app = initializeApp(firebaseConfig);
                const authInstance = getAuth(app);
                const dbInstance = getFirestore(app);
                setDb(dbInstance);
                onAuthStateChanged(authInstance, user => {
                    if (user) setUserId(user.uid);
                    else signInAnonymously(authInstance).catch(err => setError("Sign-in failed: " + err.message));
                    setIsAuthReady(true);
                });
            } else { setIsLoading(false); setError("Firebase config missing or invalid. Please update it in src/App.js."); }
        } catch (e) { setIsLoading(false); setError("DB connection failed: " + e.message); }
    }, []);

    // Set up Firestore listeners
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;
        setIsLoading(true);
        const appsPath = `artifacts/${appId}/users/${userId}/applications`;
        const qApps = query(collection(db, appsPath));
        const unsubApps = onSnapshot(qApps, snap => {
            const appsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            appsData.sort((a, b) => (new Date(b.deadline) || 0) - (new Date(a.deadline) || 0));
            setApplications(appsData);
            if (view !== 'detail') setIsLoading(false);
        }, err => { setError("Fetch failed."); setIsLoading(false); });

        const historyPath = `artifacts/${appId}/users/${userId}/statusHistory`;
        const qHistory = query(collection(db, historyPath));
        const unsubHistory = onSnapshot(qHistory, snap => {
            setStatusHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, err => { setError("History fetch failed."); });

        return () => { unsubApps(); unsubHistory(); };
    }, [isAuthReady, db, userId]);

    // --- Data Handlers ---
    const handleSaveApplication = async (appData) => {
        if (!db || !userId) { setError("DB not ready."); return; }
        const appsPath = `artifacts/${appId}/users/${userId}/applications`;
        const historyPath = `artifacts/${appId}/users/${userId}/statusHistory`;
        try {
            const dataToSave = { ...appData };
            if (editingApplication) {
                const docRef = doc(db, appsPath, editingApplication.id);
                const oldStatus = (await getDoc(docRef)).data()?.status;
                dataToSave.tasks = editingApplication.tasks || [];
                await setDoc(docRef, dataToSave);
                if (oldStatus && oldStatus !== appData.status) {
                    await addDoc(collection(db, historyPath), { fromStatus: oldStatus, toStatus: appData.status, timestamp: serverTimestamp() });
                }
            } else {
                dataToSave.tasks = [];
                await addDoc(collection(db, appsPath), dataToSave);
                await addDoc(collection(db, historyPath), { fromStatus: 'Created', toStatus: appData.status, timestamp: serverTimestamp() });
            }
            closeModal();
        } catch (e) { setError("Save failed: " + e.message); }
    };

    const requestDelete = (id) => { setItemToDelete(id); setShowDeleteConfirm(true); };
    const confirmDelete = async () => {
        if (!db || !userId || !itemToDelete) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/applications`, itemToDelete));
            if (selectedAppId === itemToDelete) setView('list');
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        } catch (e) { setError("Delete failed: " + e.message); }
    };

    const handleBulkImport = async (data) => {
        if (!db || !userId) {
            setError("Database not connected. Cannot import.");
            return;
        }
        const batch = writeBatch(db);
        const appsPath = `artifacts/${appId}/users/${userId}/applications`;
        const historyPath = `artifacts/${appId}/users/${userId}/statusHistory`;

        data.forEach(item => {
            const newAppRef = doc(collection(db, appsPath));
            batch.set(newAppRef, { ...item, tasks: [] });
            // Create initial history event for Sankey diagram
            const newHistoryRef = doc(collection(db, historyPath));
            batch.set(newHistoryRef, { fromStatus: 'Imported', toStatus: item.status, timestamp: serverTimestamp() });
        });

        try {
            await batch.commit();
            setIsImportModalOpen(false);
        } catch (e) {
            setError("Bulk import failed: " + e.message);
        }
    };
    
    // --- UI Handlers ---
    const openModal = (app = null) => { setEditingApplication(app); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingApplication(null); };
    const handleSetView = (viewName, appId = null) => { setSelectedAppId(appId); setView(viewName); }

    const CurrentView = () => {
        if (isLoading && view !== 'detail') return <p className="text-center py-8">Loading...</p>;
        switch (view) {
            case 'dashboard': return <Dashboard applications={applications} statusHistory={statusHistory} isLoading={isLoading} />;
            case 'detail': return <ApplicationDetail appId={selectedAppId} db={db} userId={userId} setView={handleSetView} onEdit={openModal} onDelete={requestDelete} />;
            default: return <ApplicationList applications={applications} isLoading={isLoading} onSelectApp={id => handleSetView('detail', id)} onEdit={openModal} onDelete={requestDelete} />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setIsImportModalOpen(true)} disabled={!isPapaReady} className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <UploadIcon/> <span className="ml-2 hidden sm:inline">Import CSV</span>
                            </button>
                            <button onClick={() => openModal()} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105">
                                <PlusIcon /> <span className="ml-2 hidden sm:inline">Add Application</span>
                            </button>
                        </div>
                    </div>
                    <nav className="flex space-x-4">
                        <button onClick={() => handleSetView('list')} className={`flex items-center py-2 px-3 font-medium rounded-t-lg ${view === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}><ListIcon /> All Applications</button>
                        <button onClick={() => handleSetView('dashboard')} className={`flex items-center py-2 px-3 font-medium rounded-t-lg ${view === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}><ChartIcon /> Dashboard</button>
                    </nav>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert"><p>{error}</p></div>}
                <CurrentView />
            </main>
            {isModalOpen && <ApplicationForm application={editingApplication} onSave={handleSaveApplication} onClose={closeModal} />}
            {isImportModalOpen && <ImportModal onImport={handleBulkImport} onClose={() => setIsImportModalOpen(false)} />}
            {showDeleteConfirm && <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={() => setShowDeleteConfirm(false)} />}
        </div>
    );
}
