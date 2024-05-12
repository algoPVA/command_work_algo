export const getChat = async (id) => {
    const response = await fetch(`/api/v1/chats/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }});
    const data = await response.json();

    return data.response;
}
export async function getChatMessages(chatId) {
    const response = await fetch(`/api/v1/chats/${chatId}/messages`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }});
    const data = await response.json();
    return data.response;
}
export const getJoinedChats = async () => {
    const response = await fetch(`/api/v1/chats/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }});
    const data = await response.json();
    return data.response;
}

export const joinChat = async (chatId) => {
    const response = await fetch(`/api/v1/chats/${chatId}/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }});
    const data = await response.json();
    return data.response;
}

export const createChat = async (name) => {
    const response = await fetch(`/api/v1/chats/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({name: name})
    });
    const data = await response.json();
    return data.response;
}
