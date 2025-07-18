import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDoc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp, updateDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sankey } from 'recharts';
// PapaParse is now loaded dynamically via a script tag

// --- IMPORTANT: REPLACE THIS with the firebaseConfig object from your own Firebase project settings. ---
const firebaseConfig = {
  apiKey: "AIzaSyDGQozcym3Af40v8E8b2tSAjqph_2y455Y",
  authDomain: "job-application-tracker-248a6.firebaseapp.com",
  projectId: "job-application-tracker-248a6",
  storageBucket: "job-application-tracker-248a6.firebasestorage.app",
  messagingSenderId: "537204034923",
  appId: "1:537204034923:web:b007972c8a980add72902e",
  measurementId: "G-44GC43NFEB"
};
const appId = 'default-app-id'; // This can remain as is

// ====================================================================================
// --- FILE: src/components/Icons.js ---
// ====================================================================================

const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const AlertIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);
const ChartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>);
const ListIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>);
const BackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V6zM17.66 17.66l-1.42-1.42m1.42 0l-1.42 1.42m0-1.42l1.42 1.42m1.42-1.42l-1.42-1.42" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);

// ====================================================================================
// --- FILE: src/components/ApplicationList.js ---
// ====================================================================================

const ApplicationList = ({ applications, isLoading, onSelectApp, onEdit, onDelete }) => {
    if (isLoading) return <p className="text-center py-8">Loading applications...</p>;
    
    const upcomingDeadlines = applications.filter(app => {
        if (!app.deadline || app.status !== 'Pending') return false;
        const deadlineDate = new Date(app.deadline);
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        return deadlineDate > now && deadlineDate <= twoDaysFromNow;
    });

    const totalApps = applications.length;

    return (
        <>
            {upcomingDeadlines.length > 0 && (
                <div className="mb-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-md">
                    <div className="flex items-center"><AlertIcon /><h2 className="text-xl font-semibold">Upcoming Deadlines (Next 48 Hours)</h2></div>
                    <ul className="mt-2 list-disc list-inside">{upcomingDeadlines.map(app => <li key={app.id} className="mt-1"><span className="font-bold">{app.company} - {app.title}</span>: <span className="ml-2">{new Date(app.deadline).toLocaleString()}</span></li>)}</ul>
                </div>
            )}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.length === 0 ? (<tr><td colSpan="6" className="text-center py-12"><div className="text-lg font-medium text-gray-600">No applications yet!</div></td></tr>) : (
                                applications.map((app, index) => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{totalApps - index}</td>
                                        <td onClick={() => onSelectApp(app.id)} className="px-6 py-4 whitespace-nowrap cursor-pointer"><div className="text-sm font-medium text-gray-900">{app.company}</div><div className="text-sm text-gray-500">{app.source}</div></td>
                                        <td onClick={() => onSelectApp(app.id)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 cursor-pointer">{app.title}</td>
                                        <td onClick={() => onSelectApp(app.id)} className="px-6 py-4 whitespace-nowrap cursor-pointer"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'Applied' ? 'bg-blue-100 text-blue-800' : app.status.includes('Test') || app.status.includes('FGD') || app.status.includes('Interviewing') ? 'bg-green-100 text-green-800' : app.status === 'Offer' ? 'bg-purple-100 text-purple-800' : app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{app.status}</span></td>
                                        <td onClick={() => onSelectApp(app.id)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer">{app.deadline ? new Date(app.deadline).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-4"><button onClick={() => onEdit(app)} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button><button onClick={() => onDelete(app.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button></div></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};


// ====================================================================================
// --- FILE: src/components/ApplicationDetail.js ---
// ====================================================================================

const ApplicationDetail = ({ appId, db, userId, setView, onEdit, onDelete }) => {
    const [app, setApp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [detailView, setDetailView] = useState('info'); // info, tasks, ai

    useEffect(() => {
        setIsLoading(true);
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/applications`, appId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setApp({ id: doc.id, ...doc.data() });
            } else {
                setView('list');
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [appId, db, userId, setView]);

    const handleAddToCalendar = () => {
        if (!app || !app.deadline) return;
        const title = encodeURIComponent(`Application Deadline: ${app.company} - ${app.title}`);
        const details = encodeURIComponent(`Job Link: ${app.jobLink || 'N/A'}\nNotes: ${app.notes || 'N/A'}`);
        const deadlineDate = new Date(app.deadline);
        const startDate = deadlineDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const endDate = new Date(deadlineDate.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
        window.open(calendarUrl, '_blank');
    };

    if (isLoading) return <p className="text-center py-8">Loading application details...</p>;
    if (!app) return null;

    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-start">
                <div>
                    <button onClick={() => setView('list')} className="flex items-center text-sm text-blue-600 hover:underline mb-4"><BackIcon /> Back to List</button>
                    <h2 className="text-2xl font-bold text-gray-900">{app.company} - <span className="font-normal">{app.title}</span></h2>
                    <p className="text-gray-600 mt-1">Status: {app.status}</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onEdit(app)} className="p-2 text-gray-500 hover:text-blue-600"><EditIcon /></button>
                    <button onClick={() => onDelete(app.id)} className="p-2 text-gray-500 hover:text-red-600"><DeleteIcon /></button>
                </div>
            </div>
            <div className="p-6">
                <div className="flex border-b mb-4">
                    <button onClick={() => setDetailView('info')} className={`py-2 px-4 font-medium ${detailView === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Details</button>
                    <button onClick={() => setDetailView('tasks')} className={`py-2 px-4 font-medium ${detailView === 'tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Tasks ({app.tasks?.length || 0})</button>
                    <button onClick={() => setDetailView('ai')} className={`flex items-center py-2 px-4 font-medium ${detailView === 'ai' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><SparklesIcon/> AI Assistant</button>
                </div>

                {detailView === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div><strong>Deadline:</strong> {app.deadline ? new Date(app.deadline).toLocaleDateString() : 'N/A'}</div>
                        <div><strong>Follow-up On:</strong> {app.followUpDate ? new Date(app.followUpDate).toLocaleDateString() : 'N/A'}</div>
                        <div><strong>Source:</strong> {app.source}</div>
                        <div><strong>Salary:</strong> {app.salary || 'N/A'}</div>
                        <div className="col-span-1 md:col-span-2"><strong>Job Link:</strong> <a href={app.jobLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{app.jobLink}</a></div>
                        <div className="col-span-1 md:col-span-2"><strong>Contact:</strong> {app.contactName || 'N/A'} ({app.contactEmail || 'N/A'})</div>
                        <div className="col-span-1 md:col-span-2"><strong>Notes:</strong><p className="whitespace-pre-wrap mt-1 p-2 bg-gray-50 rounded">{app.notes || 'None'}</p></div>
                        <div className="col-span-1 md:col-span-2"><strong>Job Description:</strong><p className="whitespace-pre-wrap mt-1 p-2 bg-gray-50 rounded h-40 overflow-y-auto">{app.jobDescription || 'None'}</p></div>
                        <div className="col-span-1 md:col-span-2 pt-4">
                            <button onClick={handleAddToCalendar} className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors"><CalendarIcon/> Add Deadline to Calendar</button>
                        </div>
                    </div>
                )}
                {detailView === 'tasks' && <TasksManager app={app} db={db} userId={userId} />}
                {detailView === 'ai' && <AIAssistant app={app} />}
            </div>
        </div>
    );
};

// ====================================================================================
// --- FILE: src/components/TasksManager.js ---
// ====================================================================================

const TasksManager = ({ app, db, userId }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/applications`, app.id);
    const handleAddTask = async (e) => { e.preventDefault(); if (newTaskText.trim() === '') return; await updateDoc(docRef, { tasks: arrayUnion({ id: crypto.randomUUID(), text: newTaskText, completed: false }) }); setNewTaskText(''); };
    const handleToggleTask = async (task) => { await updateDoc(docRef, { tasks: arrayRemove(task) }); await updateDoc(docRef, { tasks: arrayUnion({ ...task, completed: !task.completed }) }); };
    const handleDeleteTask = async (task) => { await updateDoc(docRef, { tasks: arrayRemove(task) }); };
    return (
        <div>
            <form onSubmit={handleAddTask} className="flex space-x-2 mb-4"><input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Add a new task..." className="flex-grow border-gray-300 rounded-md shadow-sm sm:text-sm"/><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Add</button></form>
            <ul className="space-y-2">
                {app.tasks && app.tasks.sort((a,b) => a.completed - b.completed).map(task => (<li key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md"><div className="flex items-center"><input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task)} className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"/><span className={task.completed ? 'line-through text-gray-500' : ''}>{task.text}</span></div><button onClick={() => handleDeleteTask(task)} className="text-red-500 hover:text-red-700 p-1"><DeleteIcon/></button></li>))}
                {(!app.tasks || app.tasks.length === 0) && <p className="text-gray-500">No tasks yet.</p>}
            </ul>
        </div>
    );
};

// ====================================================================================
// --- FILE: src/components/AIAssistant.js ---
// ====================================================================================

const AIAssistant = ({ app }) => {
    const [isLoading, setIsLoading] = useState({ match: false, questions: false, email: false });
    const [error, setError] = useState(null);
    const [result, setResult] = useState({ match: '', questions: '', email: '' });

    const callGeminiAPI = async (prompt, type) => {
        setIsLoading(prev => ({ ...prev, [type]: true }));
        setError(null);
        setResult(prev => ({ ...prev, [type]: '' }));
        try {
            const apiKey = ""; // Provided by environment
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("No content received from API.");
            setResult(prev => ({ ...prev, [type]: text }));
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleAnalyzeMatch = () => {
        if (!app.resumeText || !app.jobDescription) {
            setError("Please ensure 'My Master Resume' and 'Job Description' are filled out for this application.");
            return;
        }
        const prompt = `Analyze the following resume against the job description. Provide a percentage match score. Then, list the top 5 most important keywords and skills from the job description that are missing from the resume. Format the output clearly with headings.
        \n\n--- RESUME ---\n${app.resumeText}\n\n--- JOB DESCRIPTION ---\n${app.jobDescription}`;
        callGeminiAPI(prompt, 'match');
    };

    const handleGenerateQuestions = () => {
        const prompt = `Based on the job title "${app.title}" and the following job description, generate a list of 10 likely interview questions. Include a mix of behavioral, situational, and technical questions.
        \n\n--- JOB DESCRIPTION ---\n${app.jobDescription}`;
        callGeminiAPI(prompt, 'questions');
    };

    const handleDraftEmail = () => {
        const prompt = `Draft a professional and concise follow-up email for a job application. The role is "${app.title}" at "${app.company}". My name is [Your Name]. Keep it brief, express continued interest, and thank them for their time. Provide a placeholder for when the interview was.`;
        callGeminiAPI(prompt, 'email');
    };

    const renderResult = (text) => <p className="whitespace-pre-wrap p-4 bg-gray-50 rounded-md text-sm">{text}</p>;

    return (
        <div className="space-y-6">
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
            
            <div className="p-4 border rounded-lg"><h3 className="font-bold text-lg mb-2">Resume Matcher</h3><p className="text-sm text-gray-600 mb-4">Analyze your resume against the job description. Ensure you have saved your master resume in the application form.</p><button onClick={handleAnalyzeMatch} disabled={isLoading.match} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{isLoading.match ? 'Analyzing...' : 'Analyze Match'}</button>{result.match && <div className="mt-4">{renderResult(result.match)}</div>}</div>
            <div className="p-4 border rounded-lg"><h3 className="font-bold text-lg mb-2">Interview Prep</h3><p className="text-sm text-gray-600 mb-4">Generate potential interview questions based on the job details.</p><button onClick={handleGenerateQuestions} disabled={isLoading.questions} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{isLoading.questions ? 'Generating...' : 'Generate Questions'}</button>{result.questions && <div className="mt-4">{renderResult(result.questions)}</div>}</div>
            <div className="p-4 border rounded-lg"><h3 className="font-bold text-lg mb-2">Communication Helper</h3><p className="text-sm text-gray-600 mb-4">Draft a professional follow-up email.</p><button onClick={handleDraftEmail} disabled={isLoading.email} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{isLoading.email ? 'Drafting...' : 'Draft Follow-up Email'}</button>{result.email && <div className="mt-4">{renderResult(result.email)}</div>}</div>
        </div>
    );
};

// ====================================================================================
// --- FILE: src/components/Dashboard.js ---
// ====================================================================================

const Dashboard = ({ applications, statusHistory, isLoading }) => {
    if (isLoading) return <p className="text-center py-8">Loading dashboard...</p>;
    if (applications.length === 0) return <div className="text-center py-12 bg-white rounded-lg shadow-md"><h3 className="text-lg font-medium text-gray-600">No data for dashboard yet.</h3><p className="text-gray-500 mt-1">Add some applications to see your stats.</p></div>;
    const totalApps = applications.length;
    const interviewingApps = applications.filter(a => ['Interviewing', 'Offer', 'Aptitude Test(Online)', 'Aptitude Test(Offline)', 'FGD', 'Presentation'].includes(a.status)).length;
    const offerApps = applications.filter(a => a.status === 'Offer').length;
    const interviewRate = totalApps > 0 ? ((interviewingApps / totalApps) * 100).toFixed(1) : 0;
    const offerRate = totalApps > 0 ? ((offerApps / totalApps) * 100).toFixed(1) : 0;
    const sourceData = Object.values(applications.reduce((acc, app) => {
        const source = app.source || 'Other';
        if (!acc[source]) { acc[source] = { name: source, applications: 0, interviews: 0 }; }
        acc[source].applications++;
        if (['Interviewing', 'Offer', 'Aptitude Test(Online)', 'Aptitude Test(Offline)', 'FGD', 'Presentation'].includes(app.status)) { acc[source].interviews++; }
        return acc;
    }, {}));
    const { nodes, links } = statusHistory.reduce((acc, history) => {
        const { fromStatus, toStatus } = history;
        if (!acc.nodeSet.has(fromStatus)) { acc.nodeSet.add(fromStatus); acc.nodes.push({ name: fromStatus }); }
        if (!acc.nodeSet.has(toStatus)) { acc.nodeSet.add(toStatus); acc.nodes.push({ name: toStatus }); }
        const linkKey = `${fromStatus}->${toStatus}`;
        if (!acc.linkMap.has(linkKey)) { acc.linkMap.set(linkKey, { source: acc.nodes.findIndex(n => n.name === fromStatus), target: acc.nodes.findIndex(n => n.name === toStatus), value: 0 }); }
        acc.linkMap.get(linkKey).value++;
        return acc;
    }, { nodes: [], links: [], nodeSet: new Set(), linkMap: new Map() });
    const sankeyData = { nodes, links: Array.from(links.values()) };
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white p-6 rounded-lg shadow-md text-center"><h3 className="text-gray-500 uppercase text-sm font-bold">Total Applications</h3><p className="text-4xl font-bold mt-2">{totalApps}</p></div><div className="bg-white p-6 rounded-lg shadow-md text-center"><h3 className="text-gray-500 uppercase text-sm font-bold">Interview Stage Rate</h3><p className="text-4xl font-bold mt-2">{interviewRate}%</p></div><div className="bg-white p-6 rounded-lg shadow-md text-center"><h3 className="text-gray-500 uppercase text-sm font-bold">Offer Rate</h3><p className="text-4xl font-bold mt-2">{offerRate}%</p></div></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-lg shadow-md"><h3 className="font-bold mb-4">Source Effectiveness</h3><ResponsiveContainer width="100%" height={300}><BarChart data={sourceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="applications" fill="#8884d8" name="Total Apps" /><Bar dataKey="interviews" fill="#82ca9d" name="Interviews" /></BarChart></ResponsiveContainer></div><div className="bg-white p-6 rounded-lg shadow-md"><h3 className="font-bold mb-4">Application Funnel</h3>{sankeyData.nodes.length > 0 && sankeyData.links.length > 0 ? (<ResponsiveContainer width="100%" height={300}><Sankey data={sankeyData} node={{stroke: '#777', strokeWidth: 1}} nodePadding={50} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}><Tooltip /></Sankey></ResponsiveContainer>) : <p className="text-gray-500 text-center pt-16">Not enough status history. Update job statuses to see the funnel.</p>}</div></div>
        </div>
    );
};

// ====================================================================================
// --- FILE: src/components/ApplicationForm.js ---
// ====================================================================================

const ApplicationForm = ({ application, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        company: application?.company || '', title: application?.title || '', status: application?.status || 'Applied',
        deadline: application?.deadline ? application.deadline.split('T')[0] : '',
        followUpDate: application?.followUpDate ? application.followUpDate.split('T')[0] : '',
        jobLink: application?.jobLink || '', source: application?.source || 'LinkedIn', salary: application?.salary || '',
        notes: application?.notes || '', jobDescription: application?.jobDescription || '', resumeVersion: application?.resumeVersion || '',
        contactName: application?.contactName || '', contactEmail: application?.contactEmail || '',
        resumeText: application?.resumeText || ''
    });
    const modalRef = useRef();
    useEffect(() => { const handleClickOutside = (event) => { if (modalRef.current && !modalRef.current.contains(event.target)) { onClose(); } }; document.addEventListener("mousedown", handleClickOutside); return () => { document.removeEventListener("mousedown", handleClickOutside); }; }, [onClose]);
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); const deadlineISO = formData.deadline ? new Date(formData.deadline).toISOString() : ''; const followUpISO = formData.followUpDate ? new Date(formData.followUpDate).toISOString() : ''; onSave({ ...formData, deadline: deadlineISO, followUpDate: followUpISO }); };
    const statusOptions = ['Pending', 'Applied', 'Recruiter Screen', 'Aptitude Test(Online)', 'Aptitude Test(Offline)', 'FGD', 'Presentation', 'Interviewing', 'Offer', 'Rejected', 'Ghosted'];
    const sourceOptions = ['LinkedIn', 'Company Website', 'Referral', 'Job Board', 'Recruiter', 'Other'];
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"><div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-full overflow-y-auto"><form onSubmit={handleSubmit}><div className="p-6"><h2 className="text-2xl font-bold mb-6">{application ? 'Edit Application' : 'Add New Application'}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label><input type="text" name="company" id="company" value={formData.company} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/></div><div><label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label><input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/></div><div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label><select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">{statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div><div><label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Application Deadline</label><input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/></div><div><label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700">Follow-up On</label><input type="date" name="followUpDate" id="followUpDate" value={formData.followUpDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/></div><div><label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label><select name="source" id="source" value={formData.source} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">{sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div><div className="md:col-span-2"><label htmlFor="jobLink" className="block text-sm font-medium text-gray-700">Job Posting Link</label><input type="url" name="jobLink" id="jobLink" value={formData.jobLink} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/></div><div><label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Contact Name</label><input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/></div><div><label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label><input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/></div><div className="md:col-span-2"><label htmlFor="resumeVersion" className="block text-sm font-medium text-gray-700">Resume/Cover Letter Version</label><input type="text" name="resumeVersion" id="resumeVersion" value={formData.resumeVersion} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/></div><div className="md:col-span-2"><label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label><textarea name="notes" id="notes" rows="3" value={formData.notes} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea></div><div className="md:col-span-2"><label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">Job Description</label><textarea name="jobDescription" id="jobDescription" rows="5" value={formData.jobDescription} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea></div><div className="md:col-span-2"><label htmlFor="resumeText" className="block text-sm font-medium text-gray-700">My Master Resume</label><textarea name="resumeText" id="resumeText" rows="5" value={formData.resumeText} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Paste your master resume here for AI analysis..."></textarea></div></div></div><div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3"><button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Save Application</button></div></form></div></div>
    );
};

// ====================================================================================
// --- FILE: src/components/ConfirmDeleteModal.js ---
// ====================================================================================

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold">Confirm Deletion</h3>
                <p className="text-gray-600 mt-2">Are you sure you want to delete this application? This action cannot be undone.</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
};

// ====================================================================================
// --- FILE: src/components/ImportModal.js ---
// ====================================================================================

const ImportModal = ({ onImport, onClose }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!window.Papa) {
            setError("Parsing library not loaded. Please wait a moment and try again.");
            return;
        }
        if (selectedFile && selectedFile.type === 'text/csv') {
            setError('');
            window.Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        setError("Error parsing CSV file. Please check the file format.");
                        setData([]);
                        return;
                    }
                    try {
                        const mappedData = results.data.map(row => {
                            const dateString = row['Application Date'];
                            let formattedDate = '';
                            if (dateString) {
                                const parts = dateString.split('/');
                                if (parts.length === 3) {
                                    // Convert D/M/YYYY or DD/MM/YYYY to a format JS Date constructor can handle reliably
                                    // YYYY-MM-DD is the most reliable format
                                    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                }
                            }
                            const dateObj = new Date(formattedDate);
                            if (isNaN(dateObj.getTime())) {
                                // Handle invalid date case for this row
                                console.warn("Invalid date found for row:", row);
                            }
                            return {
                                company: row['Company'] || '',
                                title: row['Title'] || '',
                                status: row['Status'] || 'Pending',
                                deadline: formattedDate && !isNaN(dateObj.getTime()) ? dateObj.toISOString() : '',
                                jobLink: '', // Leave blank as it's not a URL in the sheet
                                contactName: row['Contact'] || '',
                                notes: row['Notes'] || '',
                                salary: row['Salary (est/posted)'] || '',
                                source: row['Job Posting Link'] || 'CSV Import' // Use this column for source
                            };
                        });
                        setData(mappedData);
                    } catch (err) {
                        setError("Failed to process rows. Please check data format, especially dates.");
                        setData([]);
                    }
                }
            });
        } else {
            setError('Please select a valid .csv file.');
            setData([]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-4">Import Applications from CSV</h3>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    {data.length > 0 && (
                        <div className="mt-4">
                            <p className="font-medium">Found {data.length} applications to import. Here's a preview of the first few:</p>
                            <div className="max-h-60 overflow-y-auto mt-2 border rounded-md p-2 bg-gray-50 text-xs">
                                <pre>{JSON.stringify(data.slice(0, 3), null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={() => onImport(data)} disabled={data.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">Import Applications</button>
                </div>
            </div>
        </div>
    );
};

// ====================================================================================
// --- FILE: src/App.js ---
// ====================================================================================

export default function App() {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [user, setUser] = useState(null);
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
                setAuth(authInstance);
                onAuthStateChanged(authInstance, (user) => {
                    setUser(user);
                    setIsAuthReady(true);
                    setIsLoading(false);
                });
            } else { setIsLoading(false); setError("Firebase config missing or invalid. Please update it in src/App.js."); }
        } catch (e) { setIsLoading(false); setError("DB connection failed: " + e.message); }
    }, []);

    // Set up Firestore listeners
    useEffect(() => {
        if (!isAuthReady || !db || !user) {
            setApplications([]);
            setStatusHistory([]);
            return;
        };
        
        const appsPath = `artifacts/${appId}/users/${user.uid}/applications`;
        const qApps = query(collection(db, appsPath));
        const unsubApps = onSnapshot(qApps, snap => {
            const appsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by creation date, newest first
            appsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setApplications(appsData);
            if (view !== 'detail') setIsLoading(false);
        }, err => { setError("Fetch failed."); setIsLoading(false); });

        const historyPath = `artifacts/${appId}/users/${user.uid}/statusHistory`;
        const qHistory = query(collection(db, historyPath));
        const unsubHistory = onSnapshot(qHistory, snap => {
            setStatusHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, err => { setError("History fetch failed."); });

        return () => { unsubApps(); unsubHistory(); };
    }, [isAuthReady, db, user]);

    // --- Data Handlers ---
    const handleSaveApplication = async (appData) => {
        if (!db || !user) { setError("DB not ready."); return; }
        const appsPath = `artifacts/${appId}/users/${user.uid}/applications`;
        const historyPath = `artifacts/${appId}/users/${user.uid}/statusHistory`;
        try {
            const dataToSave = { ...appData };
            if (editingApplication) {
                const docRef = doc(db, appsPath, editingApplication.id);
                const oldStatus = (await getDoc(docRef)).data()?.status;
                dataToSave.tasks = editingApplication.tasks || [];
                // Don't overwrite createdAt on edit
                dataToSave.createdAt = editingApplication.createdAt || serverTimestamp();
                await setDoc(docRef, dataToSave);
                if (oldStatus && oldStatus !== appData.status) {
                    await addDoc(collection(db, historyPath), { fromStatus: oldStatus, toStatus: appData.status, timestamp: serverTimestamp() });
                }
            } else {
                dataToSave.tasks = [];
                dataToSave.createdAt = serverTimestamp();
                await addDoc(collection(db, appsPath), dataToSave);
                await addDoc(collection(db, historyPath), { fromStatus: 'Created', toStatus: appData.status, timestamp: serverTimestamp() });
            }
            closeModal();
        } catch (e) { setError("Save failed: " + e.message); }
    };

    const requestDelete = (id) => { setItemToDelete(id); setShowDeleteConfirm(true); };
    const confirmDelete = async () => {
        if (!db || !user || !itemToDelete) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/applications`, itemToDelete));
            if (selectedAppId === itemToDelete) setView('list');
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        } catch (e) { setError("Delete failed: " + e.message); }
    };

    const handleBulkImport = async (data) => {
        if (!db || !user) {
            setError("Database not connected. Cannot import.");
            return;
        }
        const batch = writeBatch(db);
        const appsPath = `artifacts/${appId}/users/${user.uid}/applications`;
        const historyPath = `artifacts/${appId}/users/${user.uid}/statusHistory`;

        data.forEach(item => {
            const newAppRef = doc(collection(db, appsPath));
            batch.set(newAppRef, { ...item, tasks: [], createdAt: serverTimestamp() });
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
    const handleSignOut = () => {
        signOut(auth).catch(err => setError("Sign out failed: " + err.message));
    }

    if (!isAuthReady) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <AuthScreen auth={auth} setError={setError} error={error} />;
    }

    const CurrentView = () => {
        if (isLoading && view !== 'detail') return <p className="text-center py-8">Loading...</p>;
        switch (view) {
            case 'dashboard': return <Dashboard applications={applications} statusHistory={statusHistory} isLoading={isLoading} />;
            case 'detail': return <ApplicationDetail appId={selectedAppId} db={db} userId={user.uid} setView={handleSetView} onEdit={openModal} onDelete={requestDelete} />;
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
                            <button onClick={handleSignOut} className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-full shadow transition-transform transform hover:scale-105" title="Sign Out">
                                <LogoutIcon />
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

// ====================================================================================
// --- FILE: src/components/AuthScreen.js ---
// ====================================================================================

const AuthScreen = ({ auth, error, setError }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                </div>
                <div className="mt-8 bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                {isLogin ? 'Sign in' : 'Sign up'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button onClick={() => setIsLogin(!isLogin)} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                {isLogin ? 'Create a new account' : 'Sign in to an existing account'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
