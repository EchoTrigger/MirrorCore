import vm from 'vm';

// Light-weight code execution sandbox for agent-generated JavaScript code.
// Exposes a whitelisted toolset (e.g., search) and enforces a timeout.

export interface Toolset {
  // The unified search tool signature
  search: (query: string, opts?: any) => Promise<any>;
}

export interface ExecOptions {
  timeoutMs?: number; // default 8000
}

export async function executeCode(
  code: string,
  params: any,
  tools: Toolset,
  options: ExecOptions = {}
): Promise<any> {
  const timeoutMs = options.timeoutMs ?? 8000;

  // Wrap code into an async IIFE form so user can write plain JS body with return
  const wrapped = `async (tools, params) => {\n${code}\n}`;

  // Create a restricted context
  const sandbox: Record<string, any> = {
    console: {
      log: (..._args: any[]) => {},
      warn: (..._args: any[]) => {},
      error: (..._args: any[]) => {},
      debug: (..._args: any[]) => {},
      info: (..._args: any[]) => {},
    },
    // No access to process/require/global
  };
  const context = vm.createContext(sandbox, { name: 'agent-sandbox' });

  let fn: (tools: Toolset, params: any) => Promise<any>;
  try {
    const script = new vm.Script(wrapped);
    const compiled = script.runInContext(context, { timeout: timeoutMs });
    fn = compiled as (tools: Toolset, params: any) => Promise<any>;
  } catch (err) {
    throw new Error(`Code compilation error: ${(err as Error)?.message || String(err)}`);
  }

  // Enforce runtime timeout with Promise.race
  const execution = fn(tools, params);
  const timeoutPromise = new Promise((_, reject) => {
    const t = setTimeout(() => {
      clearTimeout(t);
      reject(new Error('Execution timeout'));
    }, timeoutMs);
  });

  return Promise.race([execution, timeoutPromise]);
}