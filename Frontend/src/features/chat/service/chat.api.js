import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
});

export const sendMessage = async ({ message, chatId }) => {
    const response = await api.post("/chats/message", {
        message,
        chat: chatId,
    });
    return response.data;
};

export const getChats = async () => {
    const response = await api.get("/chats");
    return response.data;
};

export const getMessages = async (chatId) => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
};

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/chats/delete/${chatId}`);
    return response.data;
};