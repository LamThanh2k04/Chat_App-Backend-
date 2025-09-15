import axios from 'axios';
import { get } from 'mongoose';
import {create} from 'zustand';

const useMessageStore = create((set) => ({
    user : null,
    messages : [],
    selectUser : false,
    isUSerLoading : false,
    isMessagesLoading : false,

    getUser : async() => {
         set({isUSerLoading : true})
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
           const res=  await axios.get('/api/messages/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            set({user : res.data})
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally{
            set({isUSerLoading : false})
        }
    },

    getMessages : async(userToChatId) => {
        set({isMessagesLoading : true})
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await axios.get(`/api/messages/${userToChatId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            set({messages : res.data})
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally{
            set({isMessagesLoading : false})
        }
    },
}))