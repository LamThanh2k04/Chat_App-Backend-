import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8080"; // port backend bạn đang chạy
const API_BASE_URL = "http://localhost:8080/api";

const socketEvent = {
  ADD_USER: "addUser",
  GET_ONLINE_USERS: "getOnlineUsers",
  SEND_MESSAGE: "sendMessage",
  RECEIVE_MESSAGE: "receiveMessage",
  SEND_FRIEND_REQUEST: "sendFriendRequest",
  NEW_FRIEND_REQUEST: "newFriendRequest",
  ACCEPT_FRIEND_REQUEST: "acceptFriendRequest",
  FRIEND_REQUEST_ACCEPTED: "friendRequestAccepted",
  REJECT_FRIEND_REQUEST: "rejectFriendRequest",
  FRIEND_REQUEST_REJECTED: "friendRequestRejected",
  REMOVE_FRIEND: "removeFriend",
  FRIEND_REMOVED: "friendRemoved",
};

const socket = io(SOCKET_URL);

export default function App() {
  // State chính
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestFriends, setSuggestFriends] = useState([]);
  const [isLogin, setIsLogin] = useState(true); // chuyển giữa login/register

  // Axios config
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Đăng nhập
  async function login(email, password) {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (error) {
      alert("Đăng nhập thất bại: " + (error.response?.data?.message || error.message));
    }
  }

  // Đăng ký
  async function register(data) {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      const res = await axios.post(`${API_BASE_URL}/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setIsLogin(true);
    } catch (error) {
      alert("Đăng ký thất bại: " + (error.response?.data?.message || error.message));
    }
  }

  // Đăng xuất
  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setFriends([]);
    setSelectedFriend(null);
    setMessages([]);
    setAllUsers([]);
    setFriendRequests([]);
    setSuggestFriends([]);
  }

  // Load thông tin user, bạn bè, lời mời, gợi ý bạn bè
  async function loadUserData() {
    try {
      const { data: userData } = await api.get("/auth/check");
      setUser(userData.user);
      socket.emit(socketEvent.ADD_USER, userData.user._id);
      fetchFriends();
      fetchFriendRequests();
      fetchSuggestFriends();
    } catch {
      logout();
    }
  }

  // Lấy danh sách bạn bè
  async function fetchFriends() {
    try {
      const res = await api.get("/users/getFriend");
      setFriends(res.data);
    } catch {}
  }

  // Lấy lời mời kết bạn
  async function fetchFriendRequests() {
    try {
      const res = await api.get("/users/getFriendRequests");
      setFriendRequests(res.data);
    } catch {}
  }

  // Lấy gợi ý bạn bè
  async function fetchSuggestFriends() {
    try {
      const res = await api.get("/users/suggestFriends");
      setSuggestFriends(res.data);
    } catch {}
  }

  // Lấy tin nhắn với bạn đang chat
  async function fetchMessages(friend) {
    setSelectedFriend(friend);
    try {
      const res = await api.get(`/messages/${friend._id}`);
      setMessages(res.data);
    } catch {}
  }

  // Gửi tin nhắn text
  async function sendMessage() {
    if (!text.trim()) return;
    try {
      await api.post(`/messages/send/${selectedFriend._id}`, { text });
      socket.emit(socketEvent.SEND_MESSAGE, {
        senderId: user._id,
        receiverId: selectedFriend._id,
        text,
      });
      setMessages((prev) => [...prev, { sender: user._id, text }]);
      setText("");
    } catch {}
  }

  // Tìm người dùng để gửi lời mời
  async function searchUser() {
    const query = prompt("Nhập tên tìm kiếm:");
    if (!query) return;
    try {
      const res = await api.get(`/users/searchUser?query=${query}`);
      setAllUsers(res.data);
    } catch {}
  }

  // Gửi lời mời kết bạn
  async function sendFriendRequest(id) {
    try {
      await api.post("/users/sendFriendRequest", { receiveId: id });
      socket.emit(socketEvent.SEND_FRIEND_REQUEST, { senderId: user._id, receiverId: id });
      alert("Đã gửi lời mời kết bạn");
      fetchFriendRequests();
    } catch (error) {
      alert("Lỗi gửi lời mời: " + (error.response?.data?.message || error.message));
    }
  }

  // Chấp nhận lời mời kết bạn
  async function acceptFriendRequest(id) {
    try {
      await api.put(`/users/acceptFriendRequest/${id}`);
        socket.emit("acceptFriendRequest", {
      senderId: friendRequests.find((r) => r._id === id).sender._id,
      receiverId: user._id,
    });
      fetchFriends();
      fetchFriendRequests();
    } catch {}
  }

  // Từ chối lời mời kết bạn
  async function rejectFriendRequest(id) {
    try {
      await api.put(`/users/rejectFriendRequest/${id}`);
      fetchFriendRequests();
    } catch {}
  }

  // Xóa bạn bè
 async function removeFriend(id) {
  try {
    await api.delete(`/users/deleteFriend/${id}`);
    socket.emit(socketEvent.REMOVE_FRIEND, { userId: user._id, friendId: id }); // phát realtime
    fetchFriends();
    if (selectedFriend?._id === id) {
      setSelectedFriend(null);
      setMessages([]);
    }
    alert("Đã xóa bạn");
  } catch {
    alert("Xóa bạn thất bại");
  }
}

  // Lắng nghe các sự kiện realtime
  useEffect(() => {
    if (token) loadUserData();
  }, [token]);

useEffect(() => {
  if (!token) return;

  socket.on(socketEvent.GET_ONLINE_USERS, (users) => {
    setOnlineUsers(users);
  });

  socket.on(socketEvent.RECEIVE_MESSAGE, (msg) => {
    if (msg.senderId === selectedFriend?._id) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  socket.on(socketEvent.NEW_FRIEND_REQUEST, () => {
    fetchFriends()
    fetchFriendRequests();
  });

  socket.on(socketEvent.FRIEND_REQUEST_ACCEPTED, () => {
    fetchFriends();     
    fetchFriendRequests();
  });

  socket.on(socketEvent.FRIEND_REQUEST_REJECTED, () => {
    fetchFriendRequests();
  });

  socket.on(socketEvent.FRIEND_REMOVED, () => {
    fetchFriends();
    if (selectedFriend && !friends.find(f => f._id === selectedFriend._id)) {
      setSelectedFriend(null);
      setMessages([]);
    }
  });

  return () => {
    socket.off(socketEvent.GET_ONLINE_USERS);
    socket.off(socketEvent.RECEIVE_MESSAGE);
    socket.off(socketEvent.NEW_FRIEND_REQUEST);
    socket.off(socketEvent.FRIEND_REQUEST_ACCEPTED);
    socket.off(socketEvent.FRIEND_REQUEST_REJECTED);
    socket.off(socketEvent.FRIEND_REMOVED);
  };
}, [selectedFriend, friends, token]);


  // Giao diện đăng nhập/đăng ký
  if (!token || !user) {
    if (isLogin) {
      return <LoginForm onLogin={login} onSwitch={() => setIsLogin(false)} />;
    } else {
      return <RegisterForm onRegister={register} onSwitch={() => setIsLogin(true)} />;
    }
  }

  // UI chính
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar bạn bè */}
      <div className="w-1/4 border-r overflow-y-auto p-3 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bạn bè</h2>
          <button
            onClick={logout}
            className="text-red-600 hover:underline text-sm"
            title="Đăng xuất"
          >
            Đăng xuất
          </button>
        </div>
        {friends.length === 0 && <p className="text-gray-500">Chưa có bạn bè</p>}
        {friends.map((f) => (
          <div
            key={f._id}
            className={`flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${
              selectedFriend?._id === f._id ? "bg-gray-200" : ""
            }`}
          >
            <div
              onClick={() => fetchMessages(f)}
              className={`${onlineUsers.includes(f._id) ? "text-green-600" : "text-black"} flex-1`}
            >
              {f.firstName} {f.lastName}
            </div>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  window.confirm(`Bạn có chắc muốn xóa bạn ${f.firstName} ${f.lastName}?`)
                ) {
                  await removeFriend(f._id);
                }
              }}
              className="ml-2 text-red-600 hover:underline text-sm"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      {/* Chat chính */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {!selectedFriend && <p className="text-gray-600">Chọn bạn để chat</p>}
          {selectedFriend &&
            messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 max-w-xs p-3 rounded shadow ${
                  m.sender === user._id ? "ml-auto bg-blue-300" : "bg-gray-100"
                }`}
              >
                {m.text}
              </div>
            ))}
        </div>
        {selectedFriend && (
          <div className="p-3 border-t flex gap-3 bg-white">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 border rounded p-2"
              placeholder="Nhập tin nhắn..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-5 rounded hover:bg-blue-700"
            >
              Gửi
            </button>
          </div>
        )}
      </div>

      {/* Sidebar phải: tìm bạn, lời mời, gợi ý */}
      <div className="w-1/4 border-l p-3 overflow-y-auto bg-white">
        <button
          onClick={searchUser}
          className="w-full bg-gray-200 p-2 rounded mb-4 hover:bg-gray-300"
        >
          Tìm người dùng
        </button>

        <h3 className="font-bold mb-2">Kết quả tìm kiếm</h3>
        {allUsers.length === 0 && <p className="text-gray-500">Không có kết quả</p>}
        {allUsers.map((u) => (
          <div key={u._id} className="mb-2 flex justify-between items-center">
            <div>{u.firstName} {u.lastName}</div>
            <button
              onClick={() => sendFriendRequest(u._id)}
              className="text-blue-600 hover:underline text-sm"
            >
              Kết bạn
            </button>
          </div>
        ))}

        <h3 className="font-bold mt-6 mb-2">Lời mời kết bạn</h3>
        {friendRequests.length === 0 && <p className="text-gray-500">Không có lời mời</p>}
        {friendRequests.map((r) => (
          <div key={r._id} className="mb-2 flex justify-between items-center">
            <div>{r.sender.firstName} {r.sender.lastName}</div>
            <div className="flex gap-3">
              <button
                onClick={() => acceptFriendRequest(r._id)}
                className="text-green-600 hover:underline text-sm"
              >
                Chấp nhận
              </button>
              <button
                onClick={() => rejectFriendRequest(r._id)}
                className="text-red-600 hover:underline text-sm"
              >
                Từ chối
              </button>
            </div>
          </div>
        ))}

        <h3 className="font-bold mt-6 mb-2">Gợi ý kết bạn</h3>
        {suggestFriends.length === 0 && <p className="text-gray-500">Không có gợi ý</p>}
        {suggestFriends.map((s) => (
          <div key={s._id} className="mb-2 flex justify-between items-center">
            <div>{s.firstName} {s.lastName}</div>
            <button
              onClick={() => sendFriendRequest(s._id)}
              className="text-blue-600 hover:underline text-sm"
            >
              Kết bạn
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Form đăng nhập
function LoginForm({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Nhập đủ thông tin");
    onLogin(email, password);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={submit} className="border p-8 rounded shadow-md w-96 bg-white">
        <h2 className="text-3xl mb-6 font-bold text-center">Đăng nhập</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-5 border rounded focus:outline-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 mb-6 border rounded focus:outline-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Đăng nhập
        </button>
        <p className="mt-6 text-center text-gray-600">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-blue-600 underline hover:text-blue-700"
          >
            Đăng ký ngay
          </button>
        </p>
      </form>
    </div>
  );
}

// Form đăng ký
function RegisterForm({ onRegister, onSwitch }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return alert("Nhập đủ thông tin");
    }
    if (password !== confirmPassword) {
      return alert("Mật khẩu không khớp");
    }
    onRegister({ firstName, lastName, email, password, confirmPassword });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={submit} className="border p-8 rounded shadow-md w-96 bg-white">
        <h2 className="text-3xl mb-6 font-bold text-center">Đăng ký</h2>
        <input
          type="text"
          placeholder="Họ"
          className="w-full p-3 mb-4 border rounded focus:outline-green-500"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tên"
          className="w-full p-3 mb-4 border rounded focus:outline-green-500"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded focus:outline-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 mb-4 border rounded focus:outline-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="w-full p-3 mb-6 border rounded focus:outline-green-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
        >
          Đăng ký
        </button>
        <p className="mt-6 text-center text-gray-600">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-blue-600 underline hover:text-blue-700"
          >
            Đăng nhập
          </button>
        </p>
      </form>
    </div>
  );
}
