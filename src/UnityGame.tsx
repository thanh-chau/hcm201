import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Html, Sphere, Box, Float, Text, Edges, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

type Vec3 = [number, number, number];
type BoxArgs = [number, number, number];
type KeyState = { w: boolean; a: boolean; s: boolean; d: boolean; jump: boolean };

type Question = {
  id: number;
  force: string;
  color: string;
  q: string;
  options: string[];
  ans: number | number[];
  pos: Vec3;
};

type UiState =
  | { type: 'START' }
  | { type: 'PLAYING' }
  | { type: 'QUESTION'; question: Question }
  | { type: 'GAMEOVER' }
  | { type: 'VICTORY' };

// QUESTIONS DATA (CHAPTER 5)
const CHAPTER_5_QUESTIONS: Question[] = [
  {
    id: 1, force: 'Nông Dân', color: '#22c55e',
    q: 'Theo Hồ Chí Minh, nền tảng của khối đại đoàn kết toàn dân tộc gồm những lực lượng nào?',
    options: ['Liên minh Công - Nông', 'Liên minh Công - Nông - Trí thức', 'Tầng lớp tư sản và công nhân', 'Tất cả mọi người Việt Nam'],
    ans: 1, pos: [0, 0.5, -10]
  },
  {
    id: 2, force: 'Công Nhân', color: '#3b82f6',
    q: 'Đại đoàn kết toàn dân tộc mang tính chất gì đối với cách mạng Việt Nam?',
    options: ['Là sách lược tạm thời', 'Là vấn đề có ý nghĩa chiến lược', 'Là một chính sách ngoại giao', 'Chỉ áp dụng trong thời chiến'],
    ans: 1, pos: [15, 0.5, -10]
  },
  {
    id: 3, force: 'Trí Thức', color: '#eab308',
    q: 'Mặt trận dân tộc thống nhất phải hoạt động theo nguyên tắc cốt lõi nào?',
    options: ['Tập trung dân chủ', 'Hiệp thương dân chủ', 'Cấp dưới phục tùng cấp trên', 'Đa số phục tùng thiểu số'],
    ans: 1, pos: [15, 0.5, -25]
  },
  {
    id: 4, force: 'Doanh Nhân & Tôn Giáo', color: '#f97316',
    q: 'Trong tư tưởng Bác, điều kiện tiên quyết để xây dựng khối đại đoàn kết là gì?',
    options: ['Lấy lợi ích chung làm điểm quy tụ', 'Phải dựa vào viện trợ quốc tế', 'Phải dùng vũ lực răn đe', 'Phải cào bằng mọi lợi ích'],
    ans: 0, pos: [0, 0.5, -25]
  },
  {
    id: 5, force: 'Quốc Tế', color: '#a855f7',
    q: 'Mục đích tối thượng của việc thực hiện đoàn kết quốc tế là gì?',
    options: ['Mở rộng ranh giới lãnh thổ', 'Kết hợp sức mạnh dân tộc và sức mạnh thời đại', 'Kêu gọi đầu tư nước ngoài', 'Chuyển giao quyền lực'],
    ans: 1, pos: [0, 0.5, -40]
  },
  {
    id: 6, force: 'Thanh Niên', color: '#ef4444',
    q: 'Bác Hồ đã ví lực lượng nào là "người chủ tương lai của nước nhà"?',
    options: ['Phụ nữ', 'Thanh niên', 'Trí thức', 'Lực lượng vũ trang'],
    ans: 1, pos: [-15, 0.5, -40]
  },
  {
    id: 7, force: 'Phụ Nữ', color: '#ec4899',
    q: 'Quan điểm của Bác về vai trò của phụ nữ trong đại đoàn kết là gì?',
    options: ['Chỉ phụ trách hậu phương', 'Công dân hạng hai', 'Không có phụ nữ thì không có cách mạng', 'Không cần thiết'],
    ans: 2, pos: [-15, 0.5, -55]
  },
  {
    id: 8, force: 'Kiều Bào', color: '#14b8a6',
    q: 'Đối với đồng bào Việt Nam sinh sống ở nước ngoài, tư tưởng Hồ Chí Minh khẳng định điều gì?',
    options: ['Là người nước ngoài', 'Là bộ phận không thể tách rời của dân tộc', 'Không có vai trò gì', 'Chỉ cần gửi ngoại tệ về nước'],
    ans: 1, pos: [0, 0.5, -55]
  },
  {
    id: 9, force: 'Dân Tộc Thiểu Số', color: '#8b5cf6',
    q: 'Nguyên tắc nào được Bác đặt ra để giải quyết vấn đề dân tộc thiểu số?',
    options: ['Đồng hóa văn hóa', 'Các dân tộc bình đẳng, đoàn kết, tương trợ', 'Dân tộc đa số áp đặt thiểu số', 'Phân chia lãnh thổ'],
    ans: 1, pos: [0, 0.5, -70]
  },
  {
    id: 10, force: 'Tình Hữu Nghị', color: '#fbbf24',
    q: 'Để đoàn kết quốc tế vững bền, chính sách ngoại giao của Việt Nam theo tư tưởng Bác luôn nhấn mạnh điều gì?',
    options: ['Xung đột quân sự', 'Cạnh tranh kinh tế', 'Hòa bình, hữu nghị, hợp tác', 'Phụ thuộc cường quốc'],
    ans: 2, pos: [15, 0.5, -70]
  }
];

// QUESTION BANK (35 questions). Each playthrough randomly uses 10 of these.
type QuestionBankItem = Omit<Question, 'force' | 'color' | 'pos'>;

const QUESTION_NODE_SLOTS: Array<Pick<Question, 'force' | 'color' | 'pos'>> = [
  { force: 'Câu 1', color: '#22c55e', pos: [0, 0.5, -10] },
  { force: 'Câu 2', color: '#3b82f6', pos: [15, 0.5, -10] },
  { force: 'Câu 3', color: '#eab308', pos: [15, 0.5, -25] },
  { force: 'Câu 4', color: '#f97316', pos: [0, 0.5, -25] },
  { force: 'Câu 5', color: '#a855f7', pos: [0, 0.5, -40] },
  { force: 'Câu 6', color: '#ef4444', pos: [-15, 0.5, -40] },
  { force: 'Câu 7', color: '#ec4899', pos: [-15, 0.5, -55] },
  { force: 'Câu 8', color: '#14b8a6', pos: [0, 0.5, -55] },
  { force: 'Câu 9', color: '#8b5cf6', pos: [0, 0.5, -70] },
  { force: 'Câu 10', color: '#fbbf24', pos: [15, 0.5, -70] },
];

const QUESTION_BANK: QuestionBankItem[] = [
  { id: 1, q: 'Theo Hồ Chí Minh, độc lập và tự do là gì đối với mỗi dân tộc?', options: ['Quyền có thể trao đổi', 'Quyền thiêng liêng, bất khả xâm phạm', 'Quyền do các nước lớn quyết định', 'Quyền chỉ dành cho các nước phát triển'], ans: 1 },
  { id: 2, q: 'Khát vọng lớn nhất của nhân dân Việt Nam theo Hồ Chí Minh là gì?', options: ['Trở thành cường quốc quân sự', 'Có nền kinh tế giàu mạnh', 'Được sống trong độc lập, tự do và hạnh phúc', 'Mở rộng lãnh thổ'], ans: 2 },
  { id: 3, q: 'Câu nói nào thể hiện rõ khát vọng độc lập của Hồ Chí Minh?', options: ['“Không có gì quý hơn độc lập, tự do.”', '“Nước Việt Nam là một, dân tộc Việt Nam là một.”', '“Cái mà tôi cần nhất trên đời là đồng bào tôi được tự do, Tổ quốc tôi được độc lập.”', '“Dân ta phải biết sử ta.”'], ans: 2 },
  { id: 4, q: 'Năm 1919, Hồ Chí Minh gửi bản “Yêu sách của nhân dân An Nam” tới Hội nghị nào?', options: ['Hội nghị Ianta', 'Hội nghị Giơnevơ', 'Hội nghị Vécxây', 'Hội nghị Bandung'], ans: 2 },
  { id: 5, q: 'Mục đích của “Yêu sách của nhân dân An Nam” là gì?', options: ['Đòi quyền tự do, dân chủ cho nhân dân Việt Nam', 'Xin viện trợ quân sự', 'Thành lập chính phủ mới', 'Mở rộng quan hệ ngoại giao'], ans: 0 },
  { id: 6, q: 'Hồ Chí Minh đã dựa vào tinh thần của bản Tuyên ngôn nào để khẳng định quyền dân tộc? (Chọn nhiều đáp án)', options: ['Tuyên ngôn Độc lập Mỹ 1776', 'Tuyên ngôn Nhân quyền và Dân quyền Pháp 1791', 'Tuyên ngôn của Đảng Cộng sản', 'Hiến chương Liên Hợp Quốc'], ans: [0, 1] },
  { id: 7, q: '“Tất cả các dân tộc trên thế giới đều sinh ra bình đẳng…” khẳng định điều gì?', options: ['Quyền xâm lược của các nước lớn', 'Mọi dân tộc đều có quyền độc lập, tự do', 'Chỉ các nước phương Tây mới có quyền tự do', 'Quyền lực thuộc về thực dân'], ans: 1 },
  { id: 8, q: 'Trong “Chánh cương vắn tắt” năm 1930, Hồ Chí Minh xác định nhiệm vụ hàng đầu là gì?', options: ['Phát triển công nghiệp', 'Đánh đổ đế quốc và phong kiến', 'Mở rộng thương mại', 'Liên minh với các nước lớn'], ans: 1 },
  { id: 9, q: 'Câu nói “Không có gì quý hơn độc lập, tự do” ra đời năm nào?', options: ['1945', '1954', '1965', '1975'], ans: 2 },
  { id: 10, q: 'Lời kêu gọi toàn quốc kháng chiến năm 1946 thể hiện điều gì?', options: ['Mong muốn hòa bình bằng mọi giá', 'Quyết tâm bảo vệ độc lập dân tộc', 'Chính sách đối ngoại mềm dẻo', 'Mục tiêu phát triển kinh tế'], ans: 1 },
  { id: 11, q: 'Theo Hồ Chí Minh, độc lập dân tộc phải gắn liền với điều gì?', options: ['Chủ nghĩa tư bản', 'Tự do và hạnh phúc của nhân dân', 'Mở rộng lãnh thổ', 'Phát triển quân sự'], ans: 1 },
  { id: 12, q: 'Hồ Chí Minh đánh giá cao học thuyết nào của Tôn Trung Sơn?', options: ['Tam quyền phân lập', 'Tam dân', 'Chủ nghĩa dân tộc cực đoan', 'Chủ nghĩa tự do'], ans: 1 },
  { id: 13, q: 'Theo Hồ Chí Minh, nếu nước độc lập mà dân không được hưởng hạnh phúc tự do thì:', options: ['Độc lập chưa hoàn toàn', 'Độc lập không có nghĩa lý gì', 'Cần tăng cường quân đội', 'Phải mở rộng ngoại giao'], ans: 1 },
  { id: 14, q: 'Trong “Chánh cương vắn tắt”, Hồ Chí Minh đề ra việc nào để chăm lo đời sống nhân dân?', options: ['Chia ruộng đất cho dân cày nghèo', 'Bỏ sưu thuế', 'Thi hành ngày làm 8 giờ', 'Tất cả các đáp án trên'], ans: 3 },
  { id: 15, q: 'Ngay sau khi giành độc lập, Hồ Chí Minh đề ra nhiệm vụ nào sau đây? (Chọn nhiều đáp án)', options: ['Làm cho dân có ăn', 'Làm cho dân có mặc', 'Làm cho dân có chỗ ở', 'Làm cho dân được học hành'], ans: [0, 1, 2, 3] },
  { id: 16, q: 'Mong muốn lớn nhất của Hồ Chí Minh là gì?', options: ['Việt Nam giàu mạnh quân sự', 'Nhân dân được học hành, ấm no, tự do', 'Việt Nam mở rộng lãnh thổ', 'Trở thành nước phát triển nhanh nhất châu Á'], ans: 1 },
  { id: 17, q: 'Trong đại dịch COVID-19, phương châm “không để ai bị bỏ lại phía sau” thể hiện điều gì?', options: ['Đặt nhân dân ở vị trí trung tâm', 'Chính sách đối ngoại', 'Tăng cường quân sự', 'Phát triển công nghiệp'], ans: 0 },
  { id: 18, q: 'Theo Hồ Chí Minh, độc lập thật sự phải bảo đảm trên những lĩnh vực nào?', options: ['Chính trị', 'Kinh tế', 'Quân sự và ngoại giao', 'Tất cả các đáp án trên'], ans: 3 },
  { id: 19, q: 'Thực dân và đế quốc thường dùng chiêu bài gì để che giấu bản chất xâm lược?', options: ['Dân chủ', 'Độc lập tự do', 'Bình đẳng giới', 'Công nghệ hiện đại'], ans: 1 },
  { id: 20, q: 'Theo Hồ Chí Minh, một quốc gia thật sự độc lập phải có:', options: ['Quyền tự quyết về ngoại giao', 'Quân đội riêng', 'Nền tài chính riêng', 'Tất cả các đáp án trên'], ans: 3 },
  { id: 21, q: 'Sau Cách mạng Tháng Tám, Hồ Chí Minh sử dụng biện pháp nào để bảo vệ nền độc lập?', options: ['Ngoại giao', 'Đầu hàng thực dân', 'Phụ thuộc nước ngoài', 'Đóng cửa đất nước'], ans: 0 },
  { id: 22, q: '“Ngoại giao cây tre” của Việt Nam hiện nay thể hiện điều gì?', options: ['Độc lập, tự chủ, mềm dẻo nhưng kiên định', 'Phụ thuộc vào nước lớn', 'Chỉ hợp tác với châu Á', 'Tham gia liên minh quân sự'], ans: 0 },
  { id: 23, q: 'Việt Nam hiện nay thực hiện chính sách đối ngoại nào?', options: ['Chỉ hợp tác với các nước xã hội chủ nghĩa', 'Là bạn, là đối tác tin cậy của tất cả các nước', 'Không quan hệ với phương Tây', 'Chỉ tập trung phát triển quân sự'], ans: 1 },
  { id: 24, q: 'Việt Nam không tham gia liên minh quân sự nhằm mục đích gì?', options: ['Giữ vững độc lập, tự chủ', 'Tăng cường chiến tranh', 'Phụ thuộc nước ngoài', 'Mở rộng lãnh thổ'], ans: 0 },
  { id: 25, q: 'Việc phát triển sản phẩm “Make in Vietnam” thể hiện điều gì?', options: ['Độc lập về công nghệ và kinh tế', 'Phụ thuộc nước ngoài', 'Giảm phát triển khoa học', 'Mở rộng chiến tranh công nghệ'], ans: 0 },
  { id: 26, q: 'Theo Hồ Chí Minh, độc lập dân tộc phải gắn liền với điều gì?', options: ['Thống nhất và toàn vẹn lãnh thổ', 'Phát triển công nghiệp nặng', 'Tăng cường thương mại', 'Liên minh quân sự'], ans: 0 },
  { id: 27, q: 'Thực dân Pháp chia Việt Nam thành ba kỳ nhằm mục đích gì?', options: ['Phát triển kinh tế', 'Chia rẽ dân tộc Việt Nam', 'Tăng cường giáo dục', 'Phát triển ngoại giao'], ans: 1 },
  { id: 28, q: '“Nam Kỳ tự trị” là âm mưu của ai?', options: ['Mỹ', 'Nhật', 'Pháp', 'Trung Quốc'], ans: 2 },
  { id: 29, q: 'Câu nói “Sông có thể cạn, núi có thể mòn…” khẳng định điều gì?', options: ['Việt Nam là quốc gia thống nhất', 'Vai trò của kinh tế', 'Tầm quan trọng của quân đội', 'Chính sách đối ngoại'], ans: 0 },
  { id: 30, q: 'Sau Hiệp định Giơnevơ năm 1954, Hồ Chí Minh vẫn kiên trì mục tiêu nào?', options: ['Công nghiệp hóa', 'Thống nhất đất nước', 'Mở rộng lãnh thổ', 'Liên minh quân sự'], ans: 1 },
  { id: 31, q: 'Trong Di chúc, Hồ Chí Minh tin tưởng điều gì?', options: ['Việt Nam sẽ trở thành cường quốc quân sự', 'Tổ quốc nhất định sẽ thống nhất', 'Việt Nam sẽ phát triển tư bản chủ nghĩa', 'Việt Nam sẽ mở rộng lãnh thổ'], ans: 1 },
  { id: 32, q: 'Hiện nay, Việt Nam bảo vệ chủ quyền biển đảo bằng biện pháp nào?', options: ['Hòa bình dựa trên luật pháp quốc tế', 'Chiến tranh quân sự', 'Nhờ nước ngoài bảo vệ', 'Từ bỏ tranh chấp'], ans: 0 },
  { id: 33, q: 'UNCLOS 1982 là:', options: ['Hiệp định thương mại', 'Công ước Liên Hợp Quốc về Luật Biển', 'Liên minh quân sự', 'Tổ chức tài chính quốc tế'], ans: 1 },
  { id: 34, q: 'Lực lượng nào ngày đêm bảo vệ biển đảo của Tổ quốc?', options: ['Hải quân và cảnh sát biển', 'Doanh nghiệp tư nhân', 'Học sinh sinh viên', 'Các tổ chức quốc tế'], ans: 0 },
  { id: 35, q: 'Hoạt động tuyên truyền về Hoàng Sa - Trường Sa hiện nay nhằm mục đích gì?', options: ['Nâng cao ý thức bảo vệ chủ quyền quốc gia', 'Phát triển du lịch', 'Tăng xuất khẩu', 'Thu hút đầu tư nước ngoài'], ans: 0 },
];

const createRandomGameQuestions = (): Question[] => {
  const shuffled = [...QUESTION_BANK];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, QUESTION_NODE_SLOTS.length).map((question, index) => ({
    ...question,
    ...QUESTION_NODE_SLOTS[index],
    force: `Câu ${index + 1}/10`,
  }));
};

// MAP DATA
const PATHS = [
  { id: 0, box: { minX: -2, maxX: 2, minZ: -12, maxZ: 2 } },
  { id: 1, box: { minX: -2, maxX: 17, minZ: -12, maxZ: -8 } },
  { id: 2, box: { minX: 13, maxX: 17, minZ: -27, maxZ: -8 } },
  { id: 3, box: { minX: -2, maxX: 17, minZ: -27, maxZ: -23 } },
  { id: 4, box: { minX: -2, maxX: 2, minZ: -42, maxZ: -23 } },
  { id: 5, box: { minX: -17, maxX: 2, minZ: -42, maxZ: -38 } },
  { id: 6, box: { minX: -17, maxX: -13, minZ: -57, maxZ: -38 } },
  { id: 7, box: { minX: -17, maxX: 2, minZ: -57, maxZ: -53 } },
  { id: 8, box: { minX: -2, maxX: 2, minZ: -72, maxZ: -53 } },
  { id: 9, box: { minX: -2, maxX: 17, minZ: -72, maxZ: -68 } },
  { id: 10, box: { minX: 5, maxX: 25, minZ: -90, maxZ: -72 } }, // Arena at [15, 0, -81]
];

const PATH_VISUALS: Array<{ pos: Vec3; args: BoxArgs }> = [
  { pos: [0, -0.5, -5], args: [4, 1, 14] },
  { pos: [7.5, -0.5, -10], args: [19, 1, 4] },
  { pos: [15, -0.5, -17.5], args: [4, 1, 19] },
  { pos: [7.5, -0.5, -25], args: [19, 1, 4] },
  { pos: [0, -0.5, -32.5], args: [4, 1, 19] },
  { pos: [-7.5, -0.5, -40], args: [19, 1, 4] },
  { pos: [-15, -0.5, -47.5], args: [4, 1, 19] },
  { pos: [-7.5, -0.5, -55], args: [19, 1, 4] },
  { pos: [0, -0.5, -62.5], args: [4, 1, 19] },
  { pos: [7.5, -0.5, -70], args: [19, 1, 4] },
  { pos: [15, -0.5, -81], args: [20, 1, 18] },
];

const OBSTACLES: Array<{ pos: Vec3; args: BoxArgs; color: string; rotate?: number }> = [
  { pos: [0, 0.25, -6], args: [3.1, 1.3, 0.45], color: '#fb7185' },
  { pos: [8, 0.25, -10], args: [0.45, 1.3, 3.1], color: '#38bdf8' },
  { pos: [15, 0.25, -18], args: [3.1, 1.3, 0.45], color: '#a78bfa' },
  { pos: [6, 0.25, -25], args: [0.45, 1.3, 3.1], color: '#f97316' },
  { pos: [0, 0.25, -34], args: [3.1, 1.3, 0.45], color: '#22c55e' },
  { pos: [-8, 0.25, -40], args: [0.45, 1.3, 3.1], color: '#ec4899' },
  { pos: [-15, 0.25, -49], args: [3.1, 1.3, 0.45], color: '#facc15' },
  { pos: [-7, 0.25, -55], args: [0.45, 1.3, 3.1], color: '#14b8a6' },
  { pos: [0, 0.25, -64], args: [3.1, 1.3, 0.45], color: '#60a5fa' },
  { pos: [8, 0.25, -70], args: [0.45, 1.3, 3.1], color: '#fb923c' },
];

function usePlayerControls(): KeyState {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, jump: false });
  useEffect(() => {
    const getMovementKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return "";
      }

      return typeof event.key === "string" ? event.key.toLowerCase() : "";
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = getMovementKey(e);
      if (!key) return;

      if (key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, w: true }));
      if (key === 'a' || key === 'arrowleft') setKeys(k => ({ ...k, a: true }));
      if (key === 's' || key === 'arrowdown') setKeys(k => ({ ...k, s: true }));
      if (key === 'd' || key === 'arrowright') setKeys(k => ({ ...k, d: true }));
      if (key === ' ' || key === 'spacebar') {
        e.preventDefault();
        setKeys(k => ({ ...k, jump: true }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = getMovementKey(e);
      if (!key) return;

      if (key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, w: false }));
      if (key === 'a' || key === 'arrowleft') setKeys(k => ({ ...k, a: false }));
      if (key === 's' || key === 'arrowdown') setKeys(k => ({ ...k, s: false }));
      if (key === 'd' || key === 'arrowright') setKeys(k => ({ ...k, d: false }));
      if (key === ' ' || key === 'spacebar') setKeys(k => ({ ...k, jump: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return keys;
}

function PlayerCharacter({ keys }: { keys: KeyState }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
     const isMoving = keys.w || keys.s || keys.a || keys.d;
     if (isMoving) {
        time.current += delta * 15;
     } else {
        time.current = 0;
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.2);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.2);
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.2);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.2);
     }

     if (isMoving && groupRef.current) {
        const swing = Math.sin(time.current) * 0.6;
        if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = swing;
        
        const dx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
        const dz = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
        if (dx !== 0 || dz !== 0) {
           const targetRotation = Math.atan2(dx, dz);
           let currentRot = groupRef.current.rotation.y;
           // Handle rotation wrap around
           const diff = targetRotation - currentRot;
           const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
           groupRef.current.rotation.y += normalizedDiff * 0.15;
        }
     }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
       <Sparkles count={18} scale={[2, 2.2, 2]} size={2.2} color="#facc15" speed={1.5} />
       {/* Head */}
       <Box args={[0.4, 0.4, 0.4]} position={[0, 1.4, 0]}>
         <meshStandardMaterial color="#fcd34d" roughness={0.5} />
       </Box>
       {/* Body */}
       <Box args={[0.5, 0.6, 0.3]} position={[0, 0.9, 0]}>
         <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.35} roughness={0.55} />
         {/* Gold Star on Chest */}
         <Box args={[0.15, 0.15, 0.05]} position={[0, 0, 0.16]}>
            <meshStandardMaterial color="#fcd34d" />
         </Box>
       </Box>
       {/* Left Arm */}
       <group ref={leftArmRef} position={[-0.35, 1.1, 0]}>
         <Box args={[0.15, 0.5, 0.15]} position={[0, -0.2, 0]}>
           <meshStandardMaterial color="#fcd34d" roughness={0.5} />
         </Box>
       </group>
       {/* Right Arm */}
       <group ref={rightArmRef} position={[0.35, 1.1, 0]}>
         <Box args={[0.15, 0.5, 0.15]} position={[0, -0.2, 0]}>
           <meshStandardMaterial color="#fcd34d" roughness={0.5} />
         </Box>
       </group>
       {/* Left Leg */}
       <group ref={leftLegRef} position={[-0.15, 0.6, 0]}>
         <Box args={[0.18, 0.6, 0.18]} position={[0, -0.3, 0]}>
           <meshStandardMaterial color="#1e293b" />
         </Box>
       </group>
       {/* Right Leg */}
       <group ref={rightLegRef} position={[0.15, 0.6, 0]}>
         <Box args={[0.18, 0.6, 0.18]} position={[0, -0.3, 0]}>
           <meshStandardMaterial color="#1e293b" />
         </Box>
       </group>
    </group>
  );
}

function Orbiter({ index, total, color }: { index: number; total: number; color: string }) {
   const ref = useRef<THREE.Mesh>(null);
   useFrame((s, d) => {
      const time = s.clock.elapsedTime;
      const angle = (index / total) * Math.PI * 2 + time * 1.5;
      // Orbit around the body at Y = 0.5
      ref.current?.position.set(Math.cos(angle) * 1.5, 0.5 + Math.sin(time * 3 + index) * 0.3, Math.sin(angle) * 1.5);
   });
   return (
     <mesh ref={ref}>
       <Sphere args={[0.2]}>
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
       </Sphere>
       <Sparkles count={5} scale={1} size={1} color={color} />
     </mesh>
    )
}

function NeonObstacle({ obstacle, visible }: { obstacle: (typeof OBSTACLES)[number]; visible: boolean }) {
   const ref = useRef<THREE.Group>(null);
   useFrame((state) => {
      if (!ref.current || !visible) return;
      ref.current.position.y = obstacle.pos[1] + Math.sin(state.clock.elapsedTime * 3 + obstacle.pos[2]) * 0.08;
      ref.current.rotation.y += 0.01;
   });

   return (
     <group ref={ref} position={obstacle.pos} visible={visible}>
       <Box args={obstacle.args}>
         <meshStandardMaterial color={obstacle.color} emissive={obstacle.color} emissiveIntensity={1.3} roughness={0.28} metalness={0.25} />
         <Edges color="#ffffff" opacity={0.65} transparent />
       </Box>
       <Sparkles count={18} scale={[3, 2, 3]} size={2} color={obstacle.color} speed={1.2} />
       <Html center position={[0, 1.05, 0]}>
         <div className="rounded-full border border-white/30 bg-black/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
           Space
         </div>
       </Html>
     </group>
   );
}

function GameEngine({
  setUiState,
  currentLevel,
  isPaused,
  questions,
}: {
  setUiState: React.Dispatch<React.SetStateAction<UiState>>;
  currentLevel: number;
  isPaused: boolean;
  questions: Question[];
}) {
  const keys = usePlayerControls();
  const playerRef = useRef<THREE.Group>(null);
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const jumpHeight = useRef(0);
  const jumpVelocity = useRef(0);
  const jumpWasPressed = useRef(false);

  // Reset player pos if game resets
  useEffect(() => {
    if (currentLevel === 0 && !isPaused) {
      playerPos.current.set(0, 0, 0);
      jumpHeight.current = 0;
      jumpVelocity.current = 0;
      jumpWasPressed.current = false;
    }
  }, [currentLevel, isPaused]);

  useFrame((state, delta) => {
    if (isPaused) return;

    if (keys.jump && !jumpWasPressed.current && jumpHeight.current <= 0.02) {
      jumpVelocity.current = 8.8;
    }
    jumpWasPressed.current = keys.jump;

    if (jumpHeight.current > 0 || jumpVelocity.current > 0) {
      jumpVelocity.current -= 22 * delta;
      jumpHeight.current = Math.max(0, jumpHeight.current + jumpVelocity.current * delta);
      if (jumpHeight.current === 0) jumpVelocity.current = 0;
    }

    // Movement logic
    const speed = 12;
    const newPos = playerPos.current.clone();
    if (keys.w) newPos.z -= speed * delta;
    if (keys.s) newPos.z += speed * delta;
    if (keys.a) newPos.x -= speed * delta;
    if (keys.d) newPos.x += speed * delta;

    let canMove = false;
    for (let i = 0; i <= currentLevel && i < PATHS.length; i++) {
       const box = PATHS[i].box;
       if (newPos.x >= box.minX && newPos.x <= box.maxX && newPos.z >= box.minZ && newPos.z <= box.maxZ) {
         canMove = true;
         break;
       }
    }

    const blockedByObstacle = OBSTACLES.slice(0, currentLevel + 1).some((obstacle) => {
      const halfX = obstacle.args[0] / 2 + 0.42;
      const halfZ = obstacle.args[2] / 2 + 0.42;
      const nearX = Math.abs(newPos.x - obstacle.pos[0]) < halfX;
      const nearZ = Math.abs(newPos.z - obstacle.pos[2]) < halfZ;
      return nearX && nearZ && jumpHeight.current < 0.95;
    });

    if (canMove && !blockedByObstacle) {
      playerPos.current.copy(newPos);
    }

    // Trigger Challenge Logic
    if (currentLevel < questions.length) {
      const qNode = questions[currentLevel];
      const dist = playerPos.current.distanceTo(new THREE.Vector3(qNode.pos[0], 0, qNode.pos[2]));
      if (dist < 1.5) {
        setUiState({ type: 'QUESTION', question: qNode });
      }
    } else {
      // Victory check
      if (playerPos.current.z < -78) {
        setUiState({ type: 'VICTORY' });
      }
    }

    // Update Player Visuals
    if (playerRef.current) {
      const visualTarget = playerPos.current.clone();
      visualTarget.y = jumpHeight.current;
      playerRef.current.position.lerp(visualTarget, 0.3);
    }

    // Camera follow (isometric view)
    const desiredCamPos = new THREE.Vector3(playerPos.current.x, 15, playerPos.current.z + 15);
    state.camera.position.lerp(desiredCamPos, 0.05);
    cameraTarget.current.lerp(playerPos.current, 0.05);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group>
       {/* Player Avatar */}
       <group ref={playerRef}>
         <PlayerCharacter keys={keys} />
         {questions.slice(0, currentLevel).map((q, i) => {
            return <Orbiter key={i} index={i} total={currentLevel} color={q.color} />
         })}
       </group>
       
       {/* Maze Paths */}
       {PATH_VISUALS.map((pv, i) => (
          <Box key={i} position={pv.pos} args={pv.args} visible={i <= currentLevel}>
             <meshStandardMaterial color={i === 10 ? '#facc15' : '#67e8f9'} emissive={i === 10 ? '#f97316' : '#0ea5e9'} emissiveIntensity={i <= currentLevel ? 0.22 : 0} roughness={0.55} metalness={0.18} />
             {i <= currentLevel && <Edges color={i === 10 ? "#ef4444" : "#ffffff"} opacity={0.65} transparent />}
          </Box>
       ))}

       {/* Jump Obstacles */}
       {OBSTACLES.map((obstacle, i) => (
         <NeonObstacle key={i} obstacle={obstacle} visible={i <= currentLevel} />
       ))}

       {/* Challenge Nodes */}
       {questions.map((q, i) => (
         i === currentLevel && (
           <Float key={i} speed={3} rotationIntensity={2} floatIntensity={2}>
             <mesh position={q.pos}>
               <octahedronGeometry args={[0.8]} />
                <meshStandardMaterial color={q.color} emissive={q.color} emissiveIntensity={2.2} roughness={0.22} metalness={0.35} />
                <Edges color="#ffffff" opacity={0.8} transparent />
                <Sparkles count={28} scale={3} size={3} color={q.color} speed={1.4} />
               <Html center position={[0, -1.5, 0]}>
                 <div className="bg-black/80 px-3 py-1 rounded border border-white/30 text-white text-xs font-bold whitespace-nowrap shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                   Thử thách: {q.force}
                 </div>
               </Html>
             </mesh>
           </Float>
         )
       ))}

       {/* Final Goal Monument */}
       {currentLevel === questions.length && (
         <Float speed={2} rotationIntensity={0} floatIntensity={1}>
           <group position={[15, 2, -81]}>
             <Text fontSize={3} color="#ef4444" anchorY="bottom" position={[0, 3, 0]} outlineWidth={0.1} outlineColor="#facc15">
               ĐẠI ĐOÀN KẾT
             </Text>
             <Sphere args={[2, 32, 32]}>
               <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
             </Sphere>
             <Sparkles count={300} scale={10} size={4} color="#facc15" speed={2} />
           </group>
         </Float>
       )}
    </group>
  )
}

export default function UnityGame() {
  const [gameQuestions, setGameQuestions] = useState<Question[]>(() => createRandomGameQuestions());
  const [uiState, setUiState] = useState<UiState>({ type: 'START' }); 
  const [currentLevel, setCurrentLevel] = useState(0);
  const [health, setHealth] = useState(3);
  const [errorMsg, setErrorMsg] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  const isMultiAnswerQuestion = uiState.type === 'QUESTION' && Array.isArray(uiState.question.ans);

  const answerQuestion = (selected: number[]) => {
    if (uiState.type !== 'QUESTION') return;

    const correctAnswers = Array.isArray(uiState.question.ans) ? uiState.question.ans : [uiState.question.ans];
    const normalizedSelected = [...selected].sort((a, b) => a - b);
    const normalizedCorrect = [...correctAnswers].sort((a, b) => a - b);
    const isCorrect =
      normalizedSelected.length === normalizedCorrect.length &&
      normalizedSelected.every((answer, index) => answer === normalizedCorrect[index]);

    if (isCorrect) {
      setCurrentLevel(l => l + 1);
      setUiState({ type: 'PLAYING' });
      setErrorMsg(false);
      setSelectedAnswers([]);
    } else {
      setErrorMsg(true);
      setHealth(h => {
        const nextHealth = h - 1;
        if (nextHealth <= 0) {
          setUiState({ type: 'GAMEOVER' });
        }
        return nextHealth;
      });
      setTimeout(() => setErrorMsg(false), 1000);
    }
  };

  const handleAnswer = (index: number) => {
    if (uiState.type !== 'QUESTION') return;

    if (Array.isArray(uiState.question.ans)) {
      setSelectedAnswers(prev =>
        prev.includes(index) ? prev.filter(item => item !== index) : [...prev, index]
      );
      return;
    }

    answerQuestion([index]);
  };

  const handleSubmitMultiAnswer = () => {
    if (selectedAnswers.length === 0) return;
    answerQuestion(selectedAnswers);
  };

  const resetGame = () => {
    setGameQuestions(createRandomGameQuestions());
    setCurrentLevel(0);
    setHealth(3);
    setSelectedAnswers([]);
    setErrorMsg(false);
    setUiState({ type: 'PLAYING' });
  };

  return (
    <div className="w-full h-[640px] relative bg-[radial-gradient(circle_at_20%_0%,#1d4ed8_0%,#0f172a_34%,#020617_100%)] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(20,184,166,0.32)] focus:outline-none ring-1 ring-cyan-300/20" tabIndex={0}>
      
      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-black text-cyan-200 mb-2 drop-shadow-[0_0_12px_rgba(103,232,249,0.8)] uppercase tracking-wider">Hành Trình Vượt Chướng Ngại</h2>
        
        {uiState.type === 'PLAYING' && (
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-2 items-center">
              <span className="text-white font-bold text-sm drop-shadow-md">Tiến độ:</span>
              <div className="flex gap-1 flex-wrap max-w-[200px]">
                {gameQuestions.slice(0, currentLevel).map((q, i) => (
                  <div key={i} className="w-3 h-3 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" style={{ backgroundColor: q.color }}></div>
                ))}
                {Array.from({ length: gameQuestions.length - currentLevel }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full border border-white/50 bg-black/20"></div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-white font-bold text-sm drop-shadow-md">Máu:</span>
              <div className="flex gap-1 text-red-500 text-sm drop-shadow-md">
                {Array.from({ length: health }).map((_, i) => <span key={i}>❤️</span>)}
              </div>
            </div>
            <div className="text-white text-xs mt-2 drop-shadow-md font-medium bg-black/45 w-fit px-3 py-1.5 rounded-full border border-cyan-300/30">W A S D / Mũi Tên để di chuyển, Space để nhảy</div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {uiState.type === 'QUESTION' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-30 pointer-events-auto p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-slate-900 border-2 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] transition-colors ${errorMsg ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'border-amber-500'}`}
            >
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: uiState.question.color }}></div>
                 <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">Mở Khóa: {uiState.question.force}</h3>
              </div>
              <p className="text-2xl md:text-3xl text-amber-500 font-serif mb-8 leading-snug">{uiState.question.q}</p>
              {isMultiAnswerQuestion && (
                <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200">
                  Câu này có nhiều đáp án đúng. Chọn đủ các đáp án rồi bấm xác nhận.
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uiState.question.options.map((opt, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleAnswer(idx)}
                    className={`p-4 md:p-5 rounded-xl text-left transition-all font-medium border text-sm md:text-base hover:scale-105 ${
                      selectedAnswers.includes(idx)
                        ? 'bg-amber-500 text-black border-amber-300'
                        : 'bg-slate-800 hover:bg-amber-500 hover:text-black text-white border-white/10 hover:border-transparent'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                ))}
              </div>
              {errorMsg && <p className="text-red-500 mt-4 font-bold text-center animate-pulse">Sai rồi! Bạn vừa mất 1 ❤️</p>}
              {isMultiAnswerQuestion && (
                <button
                  onClick={handleSubmitMultiAnswer}
                  disabled={selectedAnswers.length === 0}
                  className="mt-5 w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-black transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Xác nhận đáp án
                </button>
              )}
            </motion.div>
          </div>
        )}

        {(uiState.type === 'START' || uiState.type === 'GAMEOVER' || uiState.type === 'VICTORY') && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 pointer-events-auto">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-950/95 border-2 border-cyan-300 p-8 md:p-10 rounded-2xl max-w-xl text-center shadow-[0_0_55px_rgba(34,211,238,0.34)]">
              {uiState.type === 'START' && (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-cyan-200 mb-6 uppercase drop-shadow-[0_0_18px_rgba(103,232,249,0.75)]">Hành Trình Vượt Chướng Ngại</h1>
                  <p className="text-white/90 mb-8 text-base md:text-lg leading-relaxed text-left">
                    Đây là một tựa game nhập vai giải đố 3D có 1-0-2!<br/><br/>
                    🎮 <strong>Cách chơi:</strong><br/>
                    - Nhấp chuột vào màn hình game. Dùng <strong>W, A, S, D</strong> hoặc <strong>Mũi Tên</strong> để di chuyển, bấm <strong>Space</strong> để nhảy qua chướng ngại vật.<br/>
                    - Đi đến các khối Thử Thách để trả lời <strong>10 câu hỏi</strong> về Tư tưởng Hồ Chí Minh .<br/>
                    - Trả lời đúng để mở đường đi tiếp và thu thập lực lượng.<br/>
                    - Trả lời sai sẽ bị trừ máu. Hết 3 ❤️ bạn sẽ Game Over!<br/>
                  </p>
                </>
              )}
              {uiState.type === 'GAMEOVER' && (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-6 uppercase">Thất Bại</h1>
                  <p className="text-white/90 mb-8 text-lg">Bạn đã cạn kiệt sinh lực. Khối đại đoàn kết không thể hình thành nếu thiếu đi kiến thức vững chắc.</p>
                </>
              )}
              {uiState.type === 'VICTORY' && (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-amber-500 mb-6 uppercase">Thành Công Vang Dội!</h1>
                  <p className="text-white/90 mb-8 text-lg">Bạn đã xuất sắc vượt qua cả 10 thử thách, tập hợp đủ mọi tầng lớp nhân dân và thấu hiểu triết lý Đại đoàn kết của Bác Hồ!</p>
                </>
              )}
              <button 
                onClick={resetGame}
                className="px-8 py-3 md:px-10 md:py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xl md:text-2xl transition-transform hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              >
                {uiState.type === 'START' ? 'Bắt Đầu Hành Trình' : 'Chơi Lại'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Canvas camera={{ position: [0, 15, 15], fov: 40 }}>
        {/* Sky Background */}
        <Sky sunPosition={[100, 20, 100]} inclination={0.32} azimuth={0.25} turbidity={1.2} rayleigh={2.2} />
        <Stars radius={100} depth={50} count={2600} factor={5} saturation={0.3} fade speed={1.4} />

        <ambientLight intensity={0.9} />
        <pointLight position={[0, 10, 0]} intensity={2.2} color="#67e8f9" />
        <pointLight position={[12, 8, -35]} intensity={1.5} color="#f472b6" />
        
        <GameEngine setUiState={setUiState} currentLevel={currentLevel} isPaused={uiState.type !== 'PLAYING'} questions={gameQuestions} />
        
        <Sparkles count={520} scale={58} size={2.6} color="#67e8f9" opacity={0.45} speed={0.45} />
      </Canvas>
    </div>
  );
}
