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
