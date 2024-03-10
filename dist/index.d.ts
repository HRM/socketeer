interface Config {
    authUrl: string;
    socketPort: number;
    socketPath: string;
    backendPort: number;
}
declare function startServer(config: Config): void;

export { type Config, startServer };
