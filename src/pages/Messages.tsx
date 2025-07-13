import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Edit, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    name: 'د. محمد العتيبي',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    lastMessage: 'شكراً لك على الاستشارة، سأكون متاحاً غداً للمتابعة',
    timestamp: '10:30 ص',
    unread: 2,
    online: true,
    role: 'مستشار تقني'
  },
  {
    id: '2',
    name: 'أ. سارة الشمري',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    lastMessage: 'تم إرسال المستندات المطلوبة، يرجى مراجعتها',
    timestamp: 'أمس',
    unread: 0,
    online: false,
    role: 'مستشارة أكاديمية'
  },
  {
    id: '3',
    name: 'م. خالد الدوسري',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    lastMessage: 'موعدنا غداً الساعة 3 عصراً للاستشارة الهندسية',
    timestamp: 'أمس',
    unread: 0,
    online: true,
    role: 'مستشار هندسي'
  },
  {
    id: '4',
    name: 'د. نورة القحطاني',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    lastMessage: 'أتمنى أن تكون الاستشارة مفيدة لك',
    timestamp: 'الأحد',
    unread: 0,
    online: false,
    role: 'مستشارة تعليمية'
  },
  {
    id: '5',
    name: 'أ. فهد العنزي',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    lastMessage: 'سأرسل لك بعض المصادر المفيدة حول الموضوع',
    timestamp: 'الأحد',
    unread: 1,
    online: true,
    role: 'مستشار مالي'
  }
];

// Mock messages for a conversation
const mockMessages = [
  {
    id: '1',
    sender: 'other',
    text: 'مرحباً، كيف يمكنني مساعدتك اليوم؟',
    timestamp: '10:00 ص'
  },
  {
    id: '2',
    sender: 'me',
    text: 'مرحباً دكتور محمد، أحتاج استشارة حول مشروع الذكاء الاصطناعي الذي أعمل عليه',
    timestamp: '10:05 ص'
  },
  {
    id: '3',
    sender: 'other',
    text: 'بالتأكيد، يسعدني مساعدتك. هل يمكنك إخباري بمزيد من التفاصيل عن المشروع والتحديات التي تواجهها؟',
    timestamp: '10:10 ص'
  },
  {
    id: '4',
    sender: 'me',
    text: 'أعمل على تطوير نموذج للتعرف على الصور باستخدام التعلم العميق، لكنني أواجه مشكلة في دقة النموذج. النموذج يعمل بشكل جيد مع بعض الصور ولكن أداؤه ضعيف مع صور أخرى.',
    timestamp: '10:15 ص'
  },
  {
    id: '5',
    sender: 'other',
    text: 'هذه مشكلة شائعة في نماذج التعلم العميق. هناك عدة أسباب محتملة:\n\n1. عدم توازن في بيانات التدريب\n2. قلة تنوع البيانات\n3. مشكلة في معمارية النموذج\n4. فرط التخصيص (Overfitting)\n\nهل يمكنك مشاركة بعض المعلومات عن مجموعة البيانات التي تستخدمها للتدريب؟',
    timestamp: '10:25 ص'
  },
  {
    id: '6',
    sender: 'me',
    text: 'أستخدم مجموعة بيانات تحتوي على حوالي 5000 صورة مقسمة إلى 10 فئات. لاحظت أن بعض الفئات تحتوي على عدد أقل من الصور مقارنة بالفئات الأخرى.',
    timestamp: '10:30 ص'
  },
  {
    id: '7',
    sender: 'other',
    text: 'هذا قد يكون سبب المشكلة. عدم توازن الفئات يمكن أن يؤثر بشكل كبير على أداء النموذج. إليك بعض الاقتراحات:\n\n1. زيادة حجم البيانات للفئات ذات العدد الأقل باستخدام تقنيات زيادة البيانات (Data Augmentation)\n2. استخدام تقنيات أخذ العينات (Sampling) مثل Over-sampling أو Under-sampling\n3. استخدام أوزان للفئات في دالة الخسارة\n4. تجربة تقنيات مثل Transfer Learning\n\nهل جربت أياً من هذه الحلول؟',
    timestamp: '10:35 ص'
  }
];

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conversation => 
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Simulate reply after 1 second
    setTimeout(() => {
      const replyMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'other',
        text: 'شكراً لمشاركة هذه المعلومات. سأقوم بدراسة الموضوع وسأعود إليك قريباً بمزيد من التفاصيل.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">الرسائل</h1>
            <p className="opacity-90">تواصل مع المستشارين والطلاب</p>
          </div>
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-1/3 border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المحادثات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedConversation.id === conversation.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-800 truncate">{conversation.name}</h3>
                      <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-500">{conversation.role}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="w-6 h-6 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="w-2/3 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{selectedConversation.name}</h3>
                  <p className="text-xs text-gray-500">{selectedConversation.online ? 'متصل الآن' : 'غير متصل'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      message.sender === 'me'
                        ? 'bg-emerald-500 text-white rounded-t-xl rounded-r-none rounded-bl-xl'
                        : 'bg-white text-gray-800 rounded-t-xl rounded-l-none rounded-br-xl shadow-sm'
                    } p-4`}>
                      <p className="whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 text-right ${
                        message.sender === 'me' ? 'text-emerald-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};