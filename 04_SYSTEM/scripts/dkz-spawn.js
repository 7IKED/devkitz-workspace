#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const agentName = args[0];

if (!agentName) {
    console.error(`\x1b[31m[OPENNEXUZ]\x1b[0m Error: Missing agent name. Usage: dkz-spawn <agent-name> [args...]`);
    process.exit(1);
}

console.log(`\x1b[36m[OPENNEXUZ]\x1b[0m Spawning ${agentName} in a new tmux window...`);

// Determine command based on agent
let command = '';
if (agentName === 'pi-agent') {
    // Assuming pi-agent has a script or we run it directly
    command = `node ${path.join(process.cwd(), '.opencode', 'agent', 'pi-agent.js')} ${args.slice(1).join(' ')}`;
} else if (agentName === 'nanochat') {
    command = `node ${path.join(__dirname, 'nanochat.js')}`;
} else {
    // Fallback: assume it's an executable or node script in current dir
    command = `${agentName} ${args.slice(1).join(' ')}`;
}

// Wrap in zsh, ensure atuin is loaded, and start the command.
// We keep the window open after the command finishes by dropping into zsh, or just exit.
// Using 'zsh -c' to ensure ghosty and atuin hooks are fired (usually loaded in .zshrc).
const tmuxCmd = `tmux new-window -n "${agentName}" "zsh -i -c '${command}; exec zsh'"`;

try {
    // We execute the tmux command
    // If not inside tmux, this will fail unless we use 'tmux new-session'
    // But OPENNEXUZ assumes we are already inside a tmux multiplexer environment
    execSync(tmuxCmd, { stdio: 'inherit' });
    console.log(`\x1b[32m[OPENNEXUZ]\x1b[0m Successfully spawned ${agentName}.`);
} catch (error) {
    console.error(`\x1b[31m[OPENNEXUZ]\x1b[0m Failed to spawn tmux window. Are you running inside tmux?`);
    console.error(error.message);
}
