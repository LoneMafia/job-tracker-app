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
