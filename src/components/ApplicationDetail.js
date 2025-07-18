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
