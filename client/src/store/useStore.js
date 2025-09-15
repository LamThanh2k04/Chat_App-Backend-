import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";   

const useStore = create((set) => ({
    authUser: null,
     isUpdatingProfile: false,
    isCheckingAuth: true,


    checkAuth : async () =>{
        const token = localStorage.getItem("token");
        try {
         const res = await axios.get("/api/auth/check", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ authUser: res.data.user });   
        } catch (error) {
            
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    logout : () => {
        localStorage.removeItem("token");
        set({ authUser: null });
    },
     updateProfile: async (profileData) => {
        set({ isUpdatingProfile: true });

        const token = localStorage.getItem("token");
        try {
            const res = await axios.put("/api/auth/update", profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            set({ authUser: res.data.user });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
}));
export default useStore;
