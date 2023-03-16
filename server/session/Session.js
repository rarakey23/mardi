import WASocket, { Browsers, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, useMultiFileAuthState } from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode";
import fs from "fs";
import { modules } from "../../lib/index.js";
import { socket, moment } from "../config/index.js";
import SessionDatabase from "../database/db/device.db.js";
import Message from "./Client/handler/Message.js";
import Cron from "./Cron.js";
const { SESSION_PATH, LOG_PATH } = process.env;
let sessionMap = new Map();

class ConnectionSession extends SessionDatabase {
    constructor() {
        super();
        this.sessionPath = SESSION_PATH;
        this.logPath = LOG_PATH;
        this.count = 0;
    }

    async getSession(session_name) {
        return sessionMap.get(session_name) ?? null;
    }

    async deleteSession(session_name) {
        if (fs.existsSync(`${this.sessionPath}/${session_name}`)) fs.rmSync(`${this.sessionPath}/${session_name}`, { force: true, recursive: true });
        if (fs.existsSync(`${this.sessionPath}/store/${session_name}.json`)) fs.unlinkSync(`${this.sessionPath}/store/${session_name}.json`);
        if (fs.existsSync(`${this.logPath}/${session_name}.txt`)) fs.unlinkSync(`${this.logPath}/${session_name}.txt`);
        // await this.deleteSessionDB(session_name);
        await this.updateStatusSessionDB(session_name, 'STOPPED');
        sessionMap.delete(session_name);
    }

    async generateQr(input, session_name) {
        let rawData = await qrcode.toDataURL(input, { scale: 8 });
        await modules.sleep(3000);
        socket.emit(`update-qr`, { buffer: rawData, session_name });
        this.count++;
        console.log(this.count);
    }

    async autoStart() {
        let sessions = await this.findAllSessionDB();
        if (sessions) {
            for (let i = 0; i < sessions.length; i++) {
                const session = sessions[i];
                if (session.status == 'CONNECTED') {
                    await this.createSession(session.session_name);
                }
            }
        }
    }

    async createSession(session_name, user_id = 0) {
        const sessionDir = `${this.sessionPath}/${session_name}`;
        const storePath = `${this.sessionPath}/store/${session_name}.json`;
        let { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        const options = {
            printQRInTerminal: false,
            auth: state,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Safari"),
            version,
        };

        const store = makeInMemoryStore({});
        store.readFromFile(storePath);

        const client = WASocket.default(options);

        store.readFromFile(storePath);
        setInterval(() => {
            store.writeToFile(storePath);
        }, 10_000);
        store.bind(client.ev);
        sessionMap.set(session_name, { ...client, isStop: false });

        client.ev.on("creds.update", saveCreds);
        client.ev.on("connection.update", async (update) => {
            if (this.count >= 3) {
                this.deleteSession(session_name);
                socket.emit("connection-close", { session_name, result: "No Response, QR Scan Canceled", button_reset: true });
                console.log(`count : `, this.count);
                client.ev.removeAllListeners("connection.update");
                return;
            }

            if (update.qr) this.generateQr(update.qr, session_name);

            if (update.isNewLogin) {
                if (await this.findOneSessionDB(session_name)) {
                    await this.updateSessionNumberDB(session_name, client.authState.creds.me.id.split(":")[0]);
                } else {
                    await this.createSessionDB(user_id, session_name, client.authState.creds.me.id.split(":")[0]);
                }
                let files = `${this.logPath}/${session_name}.txt`;
                if (fs.existsSync(files)) {
                    var readLog = fs.readFileSync(files, "utf8");
                } else {
                    fs.writeFileSync(files, `Success Create new Session : ${session_name}, ${client.authState.creds.me.id.split(":")[0]}\n`);
                    var readLog = fs.readFileSync(files, "utf8");
                }
                return socket.emit("logger", { session_name, result: readLog, files, session_number: client.authState.creds.me.id.split(":")[0], status: "CONNECTED" });
            }
            try {
                const { lastDisconnect, connection } = update;
                if (connection === "close") {
                    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                    if (reason === DisconnectReason.badSession) {
                        console.log(modules.color("[SYS]", "#EB6112"), modules.color(`Bad Session File, Please Delete [Session: ${session_name}] and Scan Again`, "#E6B0AA"));
                        this.deleteSession(session_name);
                        client.logout();
                        return socket.emit("connection-close", { session_name, result: "Bad Session File, Please Create QR Again", button_reset: true });
                    } else if (reason === DisconnectReason.connectionClosed) {
                        const checked = this.getSession(session_name);
                        if (checked.isStop == false) {
                            console.log(modules.color("[SYS]", "#EB6112"), modules.color(`[Session: ${session_name}] Connection closed, reconnecting....`, "#E6B0AA"));
                            this.createSession(session_name);
                        } else if (checked.isStop == true) {
                            await this.updateStatusSessionDB(session_name, "STOPPED");
                            console.log(modules.color("[SYS]", "#EB6112"), modules.color(`[Session: ${session_name}] Connection close Success`, "#E6B0AA"));
                            socket.emit("session-status", { session_name, status: "STOPPED", button_reset: true });
                        }
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log(modules.color("[SYS]", "#EB6112"), modules.color(`[Session: ${session_name}] Connection Lost from Server, reconnecting...`, "#E6B0AA"));
                        this.createSession(session_name);
                    } else if (reason === DisconnectReason.connectionReplaced) {
                        console.log(modules.color("[SYS]", "#EB6112"), modules.color(`[Session: ${session_name}] Connection Replaced, Another New Session Opened, Please Close Current Session First`, "#E6B0AA"));
                        // client.logout();
                        this.deleteSession(session_name);
                        return socket.emit("connection-close", { session_name, result: `[Session: ${session_name}] Connection Replaced, Another New Session Opened, Please Create QR Again`, button_reset: true });
                    } else if (reason === DisconnectReason.loggedOut) {
                        console.log(modules.color("[SYS]", "#EB6112"), modules.color(`Device Logged Out, Please Delete [Session: ${session_name}] and Scan Again.`, "#E6B0AA"));
                        client.logout();
                        this.deleteSession(session_name);
                        return socket.emit("connection-close", { session_name, result: `[Session: ${session_name}] Device Logged Out, Please Create QR Again`, button_reset: true });
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log(modules.color("[SYS]", "#EB6112"), modules.color(`[Session: ${session_name}] Restart Required, Restarting...`, "#E6B0AA"));
                        this.createSession(session_name);
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log(modules.color("[SYS]", "#EB6112"), modules.color(`[Session: ${session_name}] Connection TimedOut, Reconnecting...`, "#E6B0AA"));
                        this.createSession(session_name);
                    } else {
                        client.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
                    }
                } else if (connection == "open") {
                    await this.updateStatusSessionDB(session_name, "CONNECTED");
                    // socket.emit("session-status", { session_name, status: "CONNECTED" });
                    socket.emit("session-status", {
                        session_name,
                        status: 'CONNECTED',
                        client: {
                            number: client.authState.creds.me.id.split(":")[0],
                            platform: client.authState.creds.platform,
                            name: client.user.name,
                        }
                    });
                    console.log(
                        modules.color("[SYS]", "#EB6112"),
                        modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"),
                        modules.color(`[Session: ${session_name}] Session is Now Connected - Baileys Version ${version}, isLatest : ${isLatest}`, "#82E0AA")
                    );
                }
            } catch (e) {

            }
        });

        client.ev.on("messages.upsert", async ({ messages, type }) => {
            if (type !== "notify") return;
            const message = new Message(client, { messages, type }, session_name);
            message.mainHandler();
        });

        // cronjob
        const cron = new Cron(client, { session_name });
        cron.main();

    }
}

export default ConnectionSession;
