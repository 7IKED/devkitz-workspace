const fs = require('fs');

const wizardComponent = `
const AppCreatorWizard = ({ isOpen, onClose, onAppCreated }) => {
    const [mode, setMode] = React.useState('panel');
    const [youtubeLink, setYoutubeLink] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState([]);
    const availableTags = ['text', 'speak', 'code', 'converter', 'analyser', 'etc', 'new', 'fav'];
    
    const [appPurpose, setAppPurpose] = React.useState('');
    const [appResult, setAppResult] = React.useState('');
    const [exampleLink, setExampleLink] = React.useState('');
    
    const [step, setStep] = React.useState(1); // 1: input, 2: analyzing, 3: questions, 4: building
    const [answers, setAnswers] = React.useState({ q1: '', q2: '', q3: '' });
    
    // reset on open
    React.useEffect(() => {
        if (isOpen) {
            setStep(1); setMode('panel'); setYoutubeLink(''); setNotes('');
            setSelectedTags([]); setAppPurpose(''); setAppResult(''); setExampleLink('');
            setAnswers({ q1: '', q2: '', q3: '' });
        }
    }, [isOpen]);
    
    if (!isOpen) return null;
    
    const handleAnalyze = () => {
        setStep(2);
        setTimeout(() => setStep(3), 2000);
    };
    
    const handleBuild = () => {
        setStep(4);
        setTimeout(() => {
            onAppCreated({
                id: 'new_app_' + Date.now(),
                name: mode === 'smart' ? 'Smart Generated App' : 'New Panel App',
                desc: mode === 'smart' ? (appPurpose.substring(0, 40) + '...') : ((notes.substring(0, 40) || 'Custom Panel')),
                icon: 'magic-wand',
                color: '#ec4899', colorRgb: '236, 72, 153',
                path: '#'
            });
            onClose();
        }, 3000);
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll flex flex-col shadow-2xl">
                <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#18181b]/95 backdrop-blur z-10">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2 text-white">
                        <Icon name="magic-wand" className="text-brand" weight="duotone" /> 
                        App Generation Wizard
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><Icon name="x" size={24} /></button>
                </div>
                
                <div className="p-6 flex-1">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex bg-black/50 p-1 rounded-lg border border-white/5 mx-auto max-w-xs transition-opacity duration-300">
                                <button className={\`flex-1 py-1.5 text-xs font-bold rounded-md transition-all \${mode === 'panel' ? 'bg-[#ff0033] text-white shadow' : 'text-gray-500 hover:text-gray-300'}\`} onClick={() => setMode('panel')}>Panel Mode</button>
                                <button className={\`flex-1 py-1.5 text-xs font-bold rounded-md transition-all \${mode === 'smart' ? 'bg-indigo-500 text-white shadow' : 'text-gray-500 hover:text-gray-300'}\`} onClick={() => setMode('smart')}>Smart Mode</button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">YouTube Link (Reference)</label>
                                    <input type="text" value={youtubeLink} onChange={e => setYoutubeLink(e.target.value)} className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff0033] transition-colors" placeholder="https://youtube.com/watch?v=..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Anmerkungen (Notes/Improvements)</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2" className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff0033] transition-colors resize-none" placeholder="Was soll verbessert / angepasst werden?"></textarea>
                                </div>
                            </div>
                            
                            {mode === 'panel' ? (
                                <div className="space-y-3 pt-4 border-t border-white/5 transition-opacity duration-300">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tags (Multiple Select)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map(tag => (
                                            <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} 
                                                className={\`px-3 py-1 rounded-full text-xs font-bold border transition-all \${selectedTags.includes(tag) ? 'bg-[#ff0033]/20 border-[#ff0033] text-[#ff0033]' : 'bg-[#09090b] border-white/10 text-gray-400 hover:border-white/30'}\`}>
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-4 border-t border-white/5 transition-opacity duration-300">
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-400 mb-1 uppercase tracking-wider">1. Was soll die App machen?</label>
                                        <textarea value={appPurpose} onChange={e => setAppPurpose(e.target.value)} rows="2" className="w-full bg-[#09090b] border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-gray-600" placeholder="Beschreibe die Kernfunktion..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-400 mb-1 uppercase tracking-wider">2. Was soll als Endergebnis rauskommen?</label>
                                        <textarea value={appResult} onChange={e => setAppResult(e.target.value)} rows="2" className="w-full bg-[#09090b] border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-gray-600" placeholder="Z.B. Eine formatierte MD Datei, Ein Panel..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-400 mb-1 uppercase tracking-wider">3. Beispiel Upload (Foto/Code/MD) oder Link (Repo/Web)</label>
                                        <div className="flex items-center gap-2">
                                            <input type="text" value={exampleLink} onChange={e => setExampleLink(e.target.value)} className="flex-1 bg-[#09090b] border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600" placeholder="https://github.com/... oder click Upload ->" />
                                            <button className="bg-[#09090b] border border-indigo-500/30 rounded-lg p-2 text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Icon name="upload-simple" size={20} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <i className="ph-duotone ph-brain text-4xl text-[#ff0033] animate-pulse"></i>
                            <h3 className="text-lg font-bold text-white">Analysiere Anforderungen...</h3>
                            <p className="text-sm text-gray-500">DKZ AI Core wertet Repos und Links aus.</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-[#ff0033]/10 border border-[#ff0033]/30 rounded-lg p-4 text-sm text-[#ff0033] mb-4 shadow-[0_0_10px_rgba(255,0,51,0.2)]">
                                Analyse abgeschlossen. Bitte kläre folgende 3 Fragen, bevor der Build startet:
                            </div>
                            
                            {[1, 2, 3].map(qNum => (
                                <div key={qNum} className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-200">
                                        {qNum === 1 ? 'Welches UI Framework soll priorisiert werden?' : qNum === 2 ? 'Soll die App in der Sidebar oder als Fullscreen-Panel laufen?' : 'Gibt es eine bevorzugte Datenbank/Speicher-Methode?'}
                                    </label>
                                    <div className="flex gap-2 text-sm font-bold">
                                        {['A', 'B', 'C'].map(opt => (
                                            <label key={opt} className={\`flex-1 flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all \${answers['q'+qNum] === opt ? 'bg-white/10 border-white text-white shadow-lg' : 'bg-[#09090b] border-white/10 text-gray-400 hover:border-white/30'}\`}>
                                                <input type="radio" name={'q'+qNum} value={opt} checked={answers['q'+qNum] === opt} onChange={() => setAnswers({...answers, ['q'+qNum]: opt})} className="hidden" />
                                                <div className={\`w-4 h-4 rounded-full border flex items-center justify-center \${answers['q'+qNum] === opt ? 'border-[#ff0033]' : 'border-gray-500'}\`}>
                                                    {answers['q'+qNum] === opt && <div className="w-2 h-2 rounded-full bg-[#ff0033]"></div>}
                                                </div>
                                                Opt {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <i className="ph-duotone ph-gear-fine text-4xl text-indigo-400 animate-spin"></i>
                            <h3 className="text-lg font-bold text-white">Application wird kompiliert & getestet...</h3>
                            <div className="w-full max-w-sm h-1.5 bg-[#09090b] rounded-full overflow-hidden mt-4">
                                <div className="h-full w-full bg-indigo-500 animate-pulse origin-left"></div>
                            </div>
                        </div>
                    )}
                </div>
                
                {step !== 2 && step !== 4 && (
                    <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-[#09090b] rounded-b-2xl">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors">Abbrechen</button>
                        {step === 1 ? (
                            <button onClick={handleAnalyze} className="px-5 py-2 rounded-lg text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors shadow-lg">Analysieren & Setup</button>
                        ) : (
                            <button onClick={handleBuild} disabled={!answers.q1 || !answers.q2 || !answers.q3} className="px-5 py-2 rounded-lg text-sm font-bold bg-[#ff0033] text-white hover:bg-[#cc0029] transition-colors shadow-[0_0_15px_rgba(255,0,51,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                <Icon name="rocket-launch" weight="fill" /> Build & Release
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
`;

function patchIndexHTML() {
    const path = 'c:/DEVKiTZ/DEVKiTZ/CODE_CONVERTER/dashboard/hub/index.html';
    let code = fs.readFileSync(path, 'utf8');

    if (code.includes('AppCreatorWizard')) {
        console.log('index.html already patched.');
        return;
    }

    code = code.replace('const App = () => {', wizardComponent + '\n\n        const App = () => {');
    code = code.replace('const modules = [', 'const initialModules = [');
    code = code.replace(
        "const [serverStatus, setServerStatus] = useState('checking');",
        "const [installedModules, setInstalledModules] = useState(initialModules);\n            const [isCreatorOpen, setCreatorOpen] = useState(false);\n            const [serverStatus, setServerStatus] = useState('checking');"
    );

    code = code.replace(
        "Installed Modules ({modules.length})",
        `Installed Modules ({installedModules.length})
        <button onClick={() => setCreatorOpen(true)} className="ml-2 w-8 h-8 rounded shrink-0 bg-[#18181b] border border-white/10 flex items-center justify-center text-gray-300 hover:text-brand hover:border-brand hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all">
            <Icon name="plus" size={16} weight="bold" />
        </button>`
    );

    code = code.replace(/{modules.map\(mod => \(/g, "{installedModules.map(mod => (");

    code = code.replace(
        /<\/div>\s*\);\s*};\s*const root/g,
        `
                    <AppCreatorWizard isOpen={isCreatorOpen} onClose={() => setCreatorOpen(false)} onAppCreated={(newApp) => setInstalledModules(prev => [...prev, newApp])} />
                </div>
            );
        };
        const root`
    );

    fs.writeFileSync(path, code);
    console.log('patched index.html');
}

function patchIndexPanelHTML() {
    const path = 'c:/DEVKiTZ/DEVKiTZ/CODE_CONVERTER/dashboard/hub/index_panel.html';
    let code = fs.readFileSync(path, 'utf8');

    if (code.includes('AppCreatorWizard')) {
        console.log('index_panel.html already patched.');
        return;
    }

    code = code.replace(
        /className=\{`text-\[\\?\$\{mod\.color\}\\?\]`\}/g,
        "style={{ color: mod.color }}"
    );

    code = code.replace('const App = () => {', wizardComponent + '\n\n        const App = () => {');
    code = code.replace('const modules = [', 'const initialModules = [');

    code = code.replace(
        "const [activeModule, setActiveModule] = useState(modules[0]);",
        "const [installedModules, setInstalledModules] = useState(initialModules);\n            const [isCreatorOpen, setCreatorOpen] = useState(false);\n            const [activeModule, setActiveModule] = useState(initialModules[0]);"
    );

    const rxBtn = /(<button[\s\S]*?onClick=\{\(\) => setIsNavOpen[\s\S]*?<\/button>)/;
    code = code.replace(
        rxBtn,
        `<div className="flex items-center gap-2">
            <button onClick={() => setCreatorOpen(true)} className="w-8 h-8 rounded shrink-0 bg-[#18181b] border border-brand/50 flex items-center justify-center text-brand shadow-[0_0_8px_rgba(255,0,51,0.2)] hover:bg-[#ff0033]/10 transition-all">
                <Icon name="plus" size={18} weight="bold" />
            </button>
            $1
        </div>`
    );

    code = code.replace(/{modules.map\(mod => \(/g, "{installedModules.map(mod => (");

    code = code.replace(
        /<\/div >\s*\);\s*};\s*const root/g,
        `
                    <AppCreatorWizard isOpen={isCreatorOpen} onClose={() => setCreatorOpen(false)} onAppCreated={(newApp) => { setInstalledModules(prev => [...prev, newApp]); setActiveModule(newApp); }} />
                </div >
            );
        };
        const root`
    );

    fs.writeFileSync(path, code);
    console.log('patched index_panel.html');
}

patchIndexHTML();
patchIndexPanelHTML();
