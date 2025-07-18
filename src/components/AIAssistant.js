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
