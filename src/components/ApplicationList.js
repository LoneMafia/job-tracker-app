const ApplicationList = ({ applications, isLoading, onSelectApp, onEdit, onDelete }) => {
    if (isLoading) return <p className="text-center py-8">Loading applications...</p>;
    const upcomingDeadlines = applications.filter(app => {
        if (!app.deadline || app.status !== 'Pending') return false;
        const deadlineDate = new Date(app.deadline);
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        return deadlineDate > now && deadlineDate <= twoDaysFromNow;
    });
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
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.length === 0 ? (<tr><td colSpan="5" className="text-center py-12"><div className="text-lg font-medium text-gray-600">No applications yet!</div></td></tr>) : (
                                applications.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
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
