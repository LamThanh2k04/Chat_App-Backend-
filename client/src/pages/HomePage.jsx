import { ContactRound, MessageCircleMore } from 'lucide-react';
import React, { useState } from 'react';

const Homepage = () => {
  const [activeTab, setActiveTab] = useState('message'); // 'message' | 'contact'

  return (
    <div className="grid grid-cols-[80px_300px_1fr] h-screen">
      {/* Cột 1: Sidebar */}
      <div className="bg-gray-800 text-white flex flex-col items-center py-4 space-y-6">
        {/* Tab Message */}
        <button
          onClick={() => setActiveTab('message')}
          className={`p-2 rounded-lg hover:bg-gray-700 ${
            activeTab === 'message' ? 'bg-gray-700' : ''
          }`}
        >
          <MessageCircleMore size={28} />
        </button>

        {/* Tab Contact */}
        <button
          onClick={() => setActiveTab('contact')}
          className={`p-2 rounded-lg hover:bg-gray-700 ${
            activeTab === 'contact' ? 'bg-gray-700' : ''
          }`}
        >
          <ContactRound size={28} />
        </button>
      </div>

      {/* Cột 2: Sidebar nội dung */}
      <div className="bg-gray-700 text-white p-4 overflow-y-auto">
        {activeTab === 'message' ? (
          <div>📨 Danh sách tin nhắn</div>
        ) : (
          <div>👥 Danh sách bạn bè</div>
        )}
      </div>

      {/* Cột 3: Nội dung chính */}
      <div className="bg-gray-600 text-white p-4">
        {activeTab === 'message' ? (
          <div>🗨️ Nội dung cuộc trò chuyện</div>
        ) : (
          <div>📋 Thông tin chi tiết liên hệ</div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
