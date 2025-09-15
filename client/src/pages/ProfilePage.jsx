import { useState, useEffect } from "react";

import { Camera, Mail, User } from "lucide-react";
import useStore from "../store/useStore";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [firstName, setFirstName] = useState(authUser?.firstName || '');
  const [lastName, setLastName] = useState(authUser?.lastName || '');

  useEffect(() => {
    if (authUser) {
      setFirstName(authUser.firstName || '');
      setLastName(authUser.lastName || '');
    }
  }, [authUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImg(URL.createObjectURL(file)); // Hiển thị ảnh được chọn trước khi gửi

    const formData = new FormData();
    formData.append("imageFile", file); // Gửi ảnh dưới dạng file

    updateProfile(formData); // Gọi API để update ảnh
  };

  const handleUpdateProfile = async () => {
    const profileData = { firstName, lastName };
    await updateProfile(profileData); // Gửi dữ liệu name lên server
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.imageURL || "./defaultProfile.jpg"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Name update section */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                First Name
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
              />
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Last Name
              </div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            {isUpdatingProfile ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
