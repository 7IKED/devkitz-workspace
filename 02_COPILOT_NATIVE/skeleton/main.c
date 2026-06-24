#include <stdio.h>
#include <stdlib.h>
#include <windows.h>

// DEVKiTZ Native Copilot - C Skeleton Daemon
// Orchestrates the Go Gateway, Python ML Tools, and Mojo Engine

void StartProcess(LPCSTR lpCommandLine, PROCESS_INFORMATION *pi) {
    STARTUPINFO si;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(pi, sizeof(*pi));

    if (!CreateProcess(
            NULL,           
            (LPSTR)lpCommandLine, 
            NULL,           
            NULL,           
            FALSE,          
            CREATE_NEW_CONSOLE, 
            NULL,           
            NULL,           
            &si,            
            pi)             
    ) {
        printf("[ERROR] CreateProcess failed for '%s' (Error: %lu).\n", lpCommandLine, GetLastError());
    } else {
        printf("[SUCCESS] Started: %s (PID: %lu)\n", lpCommandLine, pi->dwProcessId);
    }
}

int main() {
    printf("==================================================\n");
    printf(" 🤖 DEVKiTZ Native Copilot Daemon (C-Core) \n");
    printf("==================================================\n\n");

    PROCESS_INFORMATION pi_go;
    PROCESS_INFORMATION pi_py;

    // Start Go Gateway
    printf("[1] Booting Go API Gateway...\n");
    StartProcess("cmd.exe /c cd ..\\gateway && go run main.go", &pi_go);

    // Start Python ML Hub
    printf("[2] Booting Python ML Agents...\n");
    StartProcess("cmd.exe /c cd ..\\agents && python agent_hub.py", &pi_py);

    printf("\n[INFO] Native Copilot is running. Press CTRL+C to kill all processes.\n");

    // Wait for the processes (runs indefinitely)
    HANDLE hEvents[2] = { pi_go.hProcess, pi_py.hProcess };
    WaitForMultipleObjects(2, hEvents, FALSE, INFINITE);

    CloseHandle(pi_go.hProcess);
    CloseHandle(pi_go.hThread);
    CloseHandle(pi_py.hProcess);
    CloseHandle(pi_py.hThread);

    return 0;
}
