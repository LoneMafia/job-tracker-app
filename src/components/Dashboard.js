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
