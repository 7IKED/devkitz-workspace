const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3040;

// Middleware
app.use(cors()); // Allow UI to call this API
app.use(express.json());

// API Endpoint to trigger Git Sync
app.post('/api/sync', (req, res) => {
    console.log('Sync request received. Executing git commands...');

    // Commands to run in the current directory (which should be CODE_CONVERTER)
    const repoPath = path.resolve(__dirname);
    const gitCommand = `git add . && git commit -m "Auto-sync from UI: ${new Date().toISOString()}"`;

    exec(gitCommand, { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
            // It's common for git commit to fail if there's nothing to commit
            if (stdout.includes('nothing to commit') || stderr.includes('nothing to commit')) {
                console.log('Git Sync: Nothing new to commit.');
                return res.status(200).json({ success: true, message: 'Up to date. No new changes to commit.', log: stdout });
            }

            console.error(`Git Sync Error: ${error.message}`);
            return res.status(500).json({ success: false, error: 'Git commit failed.', log: stderr || error.message });
        }

        console.log(`Git Sync Success: ${stdout}`);

        // Optional: If you had a remote repo configured (like GitHub), we'd run 'git push' here as well.
        // E.g., const pushError = execSync(`git push`, {cwd: repoPath});

        res.status(200).json({ success: true, message: 'Successfully committed changes to local repo.', log: stdout });
    });
});

app.listen(port, () => {
    console.log(`[DkZ Sync Server] running at http://localhost:${port}`);
    console.log(`Monitoring directory: ${__dirname}`);
    console.log(`Use the 'Auto-Update Repo' button in the UI to trigger a git commit.`);
});
