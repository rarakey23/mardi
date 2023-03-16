import "dotenv/config";
import moment from "moment-timezone";
import { Server } from "socket.io";
import { modules } from "../../lib/index.js";
import SessionDatabase from "../database/db/device.db.js";
import ConnectionSession from "../session/Session.js";
import App from "./App.js";

const server = new App();

moment.tz.setDefault("Asia/Jakarta").locale("id");

const serverHttp = server.app.listen(server.PORT, async () => {
    await new ConnectionSession().autoStart();
    // await new SessionDatabase().startProgram();
    if (process.env.LOCALHOST == "true") {
        console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`App Listening at ${process.env.HOST}:${process.env.PORT}`, "#82E0AA"));
    } else {
        console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`App Listening at ${process.env.HOST}`, "#82E0AA"));
    }
    // open browser
    if (process.env.AUTO_OPEN_BROWSER == "true") {
        if (process.env.LOCALHOST == "true") {
            modules.openBrowser(`${process.env.HOST}:${process.env.PORT}`);
        }
    }
});

const io = new Server(serverHttp);
const socket = io.on("connection", (socket) => {
    socket.on("start-device", async (data) => {
        const { sessionName, user_id } = data;
        const session = await new SessionDatabase().findOneSessionDB(sessionName);
        const client = await new ConnectionSession().getSession(sessionName);
        if (session === null) {
            await new ConnectionSession().createSession(sessionName, user_id);
        } else {
            if (session.status == 'STOPPED') {
                await new ConnectionSession().createSession(sessionName, user_id);
            } else {
                if (client) {
                    socket.emit("session-status", {
                        session_name: sessionName,
                        status: 'CONNECTED',
                        client: {
                            number: client.authState.creds.me.id.split(":")[0],
                            platform: client.authState.creds.platform,
                            name: client.user.name,
                        }
                    });
                } else {
                    await new ConnectionSession().createSession(sessionName, user_id);
                }
            }
        }
    });

    socket.on('delete-session', async (data) => {
        const { sessionName } = data;
        const session = await new SessionDatabase().findOneSessionDB(sessionName);
        if (session) {
            await new ConnectionSession().deleteSession(sessionName);
            const client = await new ConnectionSession().getSession(sessionName);
            if (client) {
                client.logout();
            }
            await new SessionDatabase().deleteSessionDB(sessionName);
            socket.emit('alert', {
                session_name: sessionName,
                status: true,
                result: 'Session deleted successfully. dont forget to logout the linked device in whatsapp app too.',
                title: 'Deleted!',
                delete_session: true
            });
            console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`Session ${sessionName} deleted from database`, "#82E0AA"));
        } else {
            socket.emit('alert', {
                session_name: sessionName,
                status: false,
                result: 'This device is not fully stored in the database. so you can go straight back to the dashboard.',
                title: 'Session not found',
            });
        }
    });
    return socket;
});

export { socket, moment, io };
