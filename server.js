const express = require('express');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Distinct colors for players
const PLAYER_COLORS = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#008000', // Dark Green
    '#FFC0CB', // Pink
    '#FFD700', // Gold
    '#4B0082', // Indigo
    '#FF4500'  // Orange Red
];

// Store active sessions, their drawings and used colors
const sessions = new Map();
// Store drawings per map for each session
const sessionDrawings = new Map();

function getNextAvailableColor(sessionId) {
    const session = sessions.get(sessionId);
    const usedColors = new Set([...session.values()].map(client => client.userColor));
    return PLAYER_COLORS.find(color => !usedColors.has(color)) || PLAYER_COLORS[0];
}

wss.on('connection', (ws, req) => {
    const sessionId = req.url.split('/')[1];
    
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, new Map());
        sessionDrawings.set(sessionId, new Map()); // Initialize drawings for new session
    }
    
    const sessionClients = sessions.get(sessionId);
    const userColor = getNextAvailableColor(sessionId);
    
    // Add client to session with their color
    sessionClients.set(ws, { userColor });
    
    // Send current user their color and existing drawings
    ws.send(JSON.stringify({
        type: 'color',
        color: userColor
    }));

    // Send existing drawings for all maps to the new user
    const drawings = sessionDrawings.get(sessionId);
    if (drawings) {
        drawings.forEach((drawingData, mapName) => {
            ws.send(JSON.stringify({
                type: 'load_drawing',
                mapName: mapName,
                drawingData: drawingData
            }));
        });
    }

    // Broadcast new user joined with their color
    sessionClients.forEach((clientData, client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'user_joined',
                color: userColor
            }));
        }
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        const clientData = sessionClients.get(ws);
        
        // Always use the assigned color for the client
        message.color = clientData.userColor;
        
        // Handle drawing storage
        if (message.type === 'draw' || message.type === 'clear') {
            const drawings = sessionDrawings.get(sessionId);
            if (message.type === 'clear') {
                drawings.delete(message.mapName);
            } else {
                const currentDrawing = drawings.get(message.mapName) || [];
                currentDrawing.push({
                    type: 'draw',
                    ...message
                });
                drawings.set(message.mapName, currentDrawing);
            }
        }

        // Broadcast to all clients in the same session
        sessionClients.forEach((_, client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    });

    ws.on('close', () => {
        const sessionClients = sessions.get(sessionId);
        const clientData = sessionClients.get(ws);
        sessionClients.delete(ws);
        
        // Remove session if empty
        if (sessionClients.size === 0) {
            sessions.delete(sessionId);
            sessionDrawings.delete(sessionId);
        } else {
            // Notify others that user left
            sessionClients.forEach((_, client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'user_left',
                        color: clientData.userColor
                    }));
                }
            });
        }
    });
});

// Generate unique session
app.get('/new', (req, res) => {
    const sessionId = uuidv4();
    res.redirect(`/${sessionId}`);
});

// Serve the main page for all routes
app.get('/:sessionId', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});