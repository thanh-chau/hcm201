import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, MapPin, Info, Shield, Landmark, Users, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ==========================================
// DỮ LIỆU LỊCH SỬ TỪNG SỰ KIỆN (FULL 4 ẢNH)
// ==========================================
const HISTORICAL_JOURNEY = [
  {
    id: 1,
    title: "Hồ Chí Minh",
    year: "1890 - 1969",
    location: "Việt Nam",
    image: "/images/ChuTichHCM.jpg", 
    desc: "Hồ Chí Minh là nhà cách mạng Việt Nam, người sáng lập Đảng Cộng sản Việt Nam và lãnh đạo cuộc đấu tranh giành độc lập dân tộc trong thế kỷ XX. Ngày 2 tháng 9 năm 1945 tại Quảng trường Ba Đình, Hà Nội, ông đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa. Ông giữ cương vị Chủ tịch nước từ năm 1945 đến năm 1969 và là biểu tượng của phong trào giải phóng dân tộc Việt Nam.",
    rotate: "-rotate-2",
    marginTop: "mt-0",
    extended: {
      subtitle: "Lãnh tụ cách mạng Việt Nam",
      basic_info: {
        full_name: "Nguyễn Sinh Cung",
        other_names: ["Nguyễn Tất Thành", "Nguyễn Ái Quốc", "Hồ Chí Minh"],
        birth: { date: "19/05/1890", place: "Nghệ An, Liên bang Đông Dương" },
        death: { date: "02/09/1969", place: "Hà Nội, Việt Nam Dân chủ Cộng hòa", age: 79 },
        nationality: "Việt Nam",
        ethnicity: "Kinh",
        religion: "Không"
      },
      family: {
        father: "Nguyễn Sinh Sắc",
        mother: "Hoàng Thị Loan",
        siblings: ["Nguyễn Thị Thanh", "Nguyễn Sinh Khiêm", "Nguyễn Sinh Nhuận"]
      },
      positions: [
        { title: "Chủ tịch nước Việt Nam Dân chủ Cộng hòa", start: "02/09/1945", end: "02/09/1969", duration: "24 năm", successor: "Tôn Đức Thắng" },
        { title: "Thủ tướng Chính phủ Việt Nam Dân chủ Cộng hòa", start: "02/09/1945", end: "20/09/1955", duration: "10 năm", successor: "Phạm Văn Đồng" },
        { title: "Chủ tịch Đảng Lao động Việt Nam", start: "19/02/1951", end: "02/09/1969", duration: "18 năm" },
        { title: "Bộ trưởng Bộ Ngoại giao Việt Nam", start: "28/08/1945", end: "02/03/1946", successor: "Nguyễn Tường Tam" },
        { title: "Ủy viên Bộ Chính trị", start: "31/03/1935", end: "02/09/1969", duration: "34 năm" }
      ],
      legacy: [
        "Lăng Chủ tịch Hồ Chí Minh được xây dựng tại Hà Nội.",
        "Hình ảnh Hồ Chí Minh xuất hiện trên tiền tệ Việt Nam.",
        "Nhiều tượng đài và công trình tưởng niệm được xây dựng trên khắp cả nước.",
        "Ông đồng thời là nhà văn, nhà thơ và nhà báo.",
        "Được tạp chí Time bình chọn là một trong 100 nhân vật ảnh hưởng nhất thế kỷ XX."
      ]
    }
  },
  {
    id: 2,
    title: "Nguyễn Ái Quốc",
    year: "1919 - 1921",
    location: "Pháp",
    image: "/images/Footer1.jpg",
    desc: "Tháng 6/1919, thay mặt Hội những người An Nam yêu nước tại Pháp, Nguyễn Tất Thành gửi tới Hội nghị Versailles bản “Yêu sách của nhân dân An Nam”. Từ đây, con đường cách mạng vô sản dần mở ra.",
    rotate: "rotate-3",
    marginTop: "mt-12 md:mt-20",
    extended: {
      subtitle: "Từ Versailles đến con đường cách mạng",
      caption: "Nguyễn Ái Quốc, đại biểu Đông Dương, chụp tại Đại hội Đảng Cộng sản Pháp ở Marseille năm 1921.",
      event_info: {
        headline: "Bản Yêu sách của nhân dân An Nam",
        description: "Tháng 6 năm 1919, thay mặt Hội những người An Nam yêu nước tại Pháp, Nguyễn Tất Thành gửi tới Hội nghị Hòa bình Versailles bản “Yêu sách của nhân dân An Nam” gồm 8 điểm, yêu cầu các quyền tự do, dân chủ và bình đẳng cho nhân dân Việt Nam.",
        details: [
          "Bản yêu sách được ký tên chung là “Nguyễn Ái Quốc”.",
          "Đây là lần đầu tiên cái tên Nguyễn Ái Quốc xuất hiện công khai trên chính trường quốc tế.",
          "Những yêu cầu của người Việt không được Hội nghị Versailles chấp nhận.",
          "Sự thất bại này khiến Nguyễn Ái Quốc nhận ra rằng các nước thực dân không tự nguyện trao quyền tự do cho các dân tộc thuộc địa.",
          "Từ đó, Người dần chuyển hướng sang con đường cách mạng vô sản và chủ nghĩa cộng sản."
        ]
      },
      significance: {
        title: "Ý nghĩa lịch sử",
        content: "Sự kiện tại Versailles đánh dấu bước chuyển biến quan trọng trong tư tưởng của Nguyễn Ái Quốc, từ chủ nghĩa yêu nước đến việc tìm kiếm con đường giải phóng dân tộc bằng cách mạng vô sản."
      }
    }
  },
  {
    id: 3,
    title: "Bến Nhà Rồng",
    year: "1911",
    location: "Sài Gòn, Việt Nam",
    image: "/images/BenNhaRong.jpg",
    desc: "Ngày 5 tháng 6 năm 1911, Nguyễn Tất Thành rời Bến Nhà Rồng trên con tàu Amiral Latouche-Tréville với vai trò phụ bếp. Từ đây, Người bắt đầu hành trình hơn 30 năm bôn ba qua nhiều quốc gia nhằm tìm con đường giải phóng dân tộc Việt Nam.",
    rotate: "-rotate-1",
    marginTop: "mt-4 md:mt-8",
    extended: {
      subtitle: "Khởi đầu hành trình tìm đường cứu nước",
      caption: "Nguyễn Tất Thành rời Bến Nhà Rồng ngày 5/6/1911 để bắt đầu hành trình tìm đường cứu nước.",
      event_info: {
        headline: "Ra đi tìm đường cứu nước",
        description: "Ngày 5 tháng 6 năm 1911, Nguyễn Tất Thành rời Bến Nhà Rồng trên con tàu Amiral Latouche-Tréville với vai trò phụ bếp. Từ đây, Người bắt đầu hành trình hơn 30 năm bôn ba qua nhiều quốc gia nhằm tìm con đường giải phóng dân tộc Việt Nam.",
        details: [
          "Bến Nhà Rồng là nơi đánh dấu bước ngoặt lớn trong cuộc đời Hồ Chí Minh.",
          "Người đã đi qua nhiều châu lục để học hỏi và tìm hiểu các phong trào cách mạng trên thế giới.",
          "Hành trình này đặt nền móng cho con đường giải phóng dân tộc Việt Nam sau này.",
          "Sự kiện năm 1911 trở thành biểu tượng của ý chí và khát vọng độc lập dân tộc."
        ]
      },
      significance: {
        title: "Ý nghĩa lịch sử",
        content: "Sự kiện rời Bến Nhà Rồng mở đầu cho hành trình tìm đường cứu nước của Hồ Chí Minh, đặt nền móng cho cuộc cách mạng giải phóng dân tộc Việt Nam trong thế kỷ XX."
      }
    }
  },
  {
    id: 4,
    title: "Tuyên ngôn Độc lập",
    year: "1945",
    location: "Quảng trường Ba Đình, Hà Nội",
    image: "/images/Footer4.jpg",
    desc: "Ngày 2 tháng 9 năm 1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập, chính thức khai sinh nước Việt Nam Dân chủ Cộng hòa.",
    rotate: "rotate-2",
    marginTop: "mt-8 md:mt-32",
    extended: {
      subtitle: "Khai sinh nước Việt Nam Dân chủ Cộng hòa",
      caption: "Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình ngày 2/9/1945.",
      event_info: {
        headline: "Ngày độc lập của dân tộc Việt Nam",
        description: "Ngày 2 tháng 9 năm 1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập, chính thức khai sinh nước Việt Nam Dân chủ Cộng hòa.",
        details: [
          "Hàng chục vạn người dân đã tập trung tại Quảng trường Ba Đình để chứng kiến thời khắc lịch sử.",
          "Bản Tuyên ngôn khẳng định quyền tự do và độc lập của dân tộc Việt Nam.",
          "Sự kiện đánh dấu sự kết thúc của chế độ thực dân phong kiến tại Việt Nam.",
          "Ngày 2/9 trở thành Quốc khánh của nước Việt Nam."
        ]
      },
      significance: {
        title: "Ý nghĩa lịch sử",
        content: "Tuyên ngôn Độc lập năm 1945 đánh dấu sự ra đời của nước Việt Nam Dân chủ Cộng hòa, mở ra kỷ nguyên độc lập và tự do cho dân tộc Việt Nam."
      }
    }
  }
];

// ==========================================
// HIỆU ỨNG BỤI ĐIỆN ẢNH (DUST PARTICLES)
// ==========================================
export function Footer() {
  const [selectedEvent, setSelectedEvent] = useState<typeof HISTORICAL_JOURNEY[0] | null>(null);

  return (
    <footer className="relative w-full overflow-hidden border-t border-[#CDEAE7] bg-[#EEF7F6] text-gray-800 selection:bg-[#67E8F9] selection:text-[#062E33] dark:border-white/10 dark:bg-[#061317] dark:text-gray-200">
      {/* Texture nền & Ánh sáng */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.07] dark:opacity-[0.12]"
          style={{ backgroundImage: `url('/images/FooterBG.png')` }}
        ></div>
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,184,166,0.13),transparent_36%,rgba(245,158,11,0.09)_72%,transparent)]"></div>
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>
      <div className="container mx-auto px-4 py-24 md:px-8 md:py-28 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <div>
          <p className="text-[#0F766E] tracking-[0.25em] text-xs font-bold uppercase mb-4 dark:text-[#A7F3D0]">
            Hành trình cứu nước
          </p>
          <h2 className="max-w-3xl text-4xl md:text-6xl font-serif font-bold text-[#062E33] uppercase tracking-wide leading-tight dark:text-white">
            Dấu Chân Lịch Sử
          </h2>
          </div>
          <div className="border-l-4 border-[#0F766E] bg-white/70 p-5 shadow-sm backdrop-blur dark:border-[#A7F3D0] dark:bg-white/[0.04]">
          <p className="font-serif italic text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            "Không có gì quý hơn độc lập tự do." Hãy cùng nhìn lại những khoảnh khắc vàng son trên chặng đường bôn ba tìm ánh sáng cho dân tộc.
          </p>
          </div>
        </motion.div>

        {/* Timeline Layout */}
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="overflow-hidden border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="relative aspect-[4/5] bg-cover bg-center" style={{ backgroundImage: `url('/images/BenNhaRong.jpg')` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#062E33]/88 via-[#062E33]/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A7F3D0]">Mốc mở đầu</p>
                  <h3 className="mt-2 text-3xl font-serif font-bold text-white">1911</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">Từ Bến Nhà Rồng, hành trình tìm đường cứu nước mở ra một bước ngoặt lịch sử.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-200 bg-[#F8FAFC] dark:divide-white/10 dark:border-white/10 dark:bg-black/25">
                <div className="p-4">
                  <p className="text-2xl font-black text-[#0F766E] dark:text-[#A7F3D0]">04</p>
                  <p className="mt-1 text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400">mốc</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-black text-[#0F766E] dark:text-[#A7F3D0]">30+</p>
                  <p className="mt-1 text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400">năm</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-black text-[#0F766E] dark:text-[#A7F3D0]">1945</p>
                  <p className="mt-1 text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400">độc lập</p>
                </div>
              </div>
            </div>
          </motion.aside>

          <div className="space-y-4">
            {HISTORICAL_JOURNEY.map((item, index) => (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
                onClick={() => setSelectedEvent(item)}
                className="group grid w-full gap-4 border border-gray-200 bg-white/82 p-4 text-left shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:border-[#0F766E]/45 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-[#A7F3D0]/45 md:grid-cols-[112px_180px_1fr]"
              >
                <div className="flex items-center gap-3 md:block">
                  <div className="grid h-12 w-12 place-items-center bg-[#0F766E] text-sm font-black text-white dark:bg-[#A7F3D0] dark:text-black md:h-16 md:w-16">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="md:mt-4">
                    <p className="text-2xl font-serif font-bold text-[#0F766E] dark:text-[#A7F3D0]">{item.year.split(" ")[0]}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">{item.location}</p>
                  </div>
                </div>

                <div className="overflow-hidden border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-black/25">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-[#062E33] dark:text-white">{item.title}</h3>
                    <p className="mt-3 max-h-20 overflow-hidden text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase text-[#0F766E] dark:text-[#A7F3D0]">
                    Xem chi tiết <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer bản quyền gốc */}
      <div className="relative z-10 border-t border-[#CDEAE7] bg-white/70 py-8 text-center backdrop-blur dark:border-white/10 dark:bg-black/20">
         <p className="text-xs text-gray-500 uppercase tracking-widest font-medium dark:text-gray-400">
            © 2026 — Kiến thức về hội nhập kinh tế quốc tế của Việt Nam.
         </p>
      </div>

      {/* ==========================================
          CINEMATIC MODAL POPUP
      ========================================== */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#061317]/76 p-4 backdrop-blur-xl md:p-8 lg:p-12"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotateX: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#07191D] md:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nút Đóng */}
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute right-4 top-4 z-50 border border-gray-200 bg-white/90 p-2 text-gray-600 shadow-sm transition-colors hover:bg-[#0F766E] hover:text-white dark:border-white/10 dark:bg-black/60 dark:text-gray-200 dark:hover:bg-[#A7F3D0] dark:hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* LEFT: Hình ảnh khổ lớn */}
                <div className="relative min-h-[30vh] w-full bg-black md:min-h-0 md:w-5/12">
                  <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 6, ease: "easeOut" }}
                    src={selectedEvent.image} 
                    alt={selectedEvent.title}
                    className="absolute inset-0 h-full w-full object-cover contrast-105"
                  />
                  <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent to-white opacity-0 dark:to-[#07191D] md:block md:opacity-100" />
                  <div className="absolute inset-0 block bg-gradient-to-t from-white to-transparent opacity-100 dark:from-[#07191D] md:hidden md:opacity-0" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A7F3D0]">{selectedEvent.year}</p>
                    <h3 className="mt-1 text-3xl font-serif font-bold text-white">{selectedEvent.title}</h3>
                  </div>
                </div>

                {/* RIGHT: Nội dung hiển thị */}
                <div className="relative flex max-h-[60vh] w-full flex-col justify-start overflow-y-auto bg-white p-6 dark:bg-[#07191D] md:max-h-[85vh] md:w-7/12 md:p-10">
                  <div className="absolute bottom-0 left-6 top-0 w-[1px] bg-gradient-to-b from-transparent via-[#0F766E]/35 to-transparent dark:via-[#A7F3D0]/35 md:left-10"></div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative space-y-6 pl-6 text-gray-700 dark:text-gray-300 md:pl-8"
                  >
                    {/* Chỉ báo dòng thời gian chính */}
                    <div className="absolute left-[-5px] top-3 h-2.5 w-2.5 bg-[#0F766E] shadow-[0_0_12px_rgba(15,118,110,0.5)] dark:bg-[#A7F3D0]"></div>

                    {/* Metadata Header */}
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#A7F3D0]" /> {selectedEvent.year}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#A7F3D0]" /> {selectedEvent.location}</span>
                      </div>
                      <h3 className="mt-1 text-2xl font-serif font-bold uppercase leading-tight tracking-wide text-[#062E33] dark:text-white md:text-4xl">
                        {selectedEvent.title}
                      </h3>
                      {selectedEvent.extended?.subtitle && (
                        <p className="mt-1 text-sm font-semibold text-[#0F766E] dark:text-[#A7F3D0]">{selectedEvent.extended.subtitle}</p>
                      )}
                    </div>
                    
                    <Separator className="w-16 bg-[#0F766E]/25 dark:bg-[#A7F3D0]/25" />

                    {/* LÔGIC PHÂN CHIA LAYOUT POPUP */}
                    {selectedEvent.extended ? (
                      <div className="space-y-6 text-sm md:text-[14px] leading-relaxed">
                        
                        {/* -------------------------------------------
                            LOẠI 1: HỒ SƠ NHÂN VẬT 
                            ------------------------------------------- */}
                        {selectedEvent.extended.basic_info && (
                          <>
                            {/* 1. Thông tin cơ bản */}
                            <div className="space-y-2">
<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#A7F3D0]">
                                <Info className="w-4 h-4" /> Thông tin cơ bản
                              </h4>
                              <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 border border-gray-200 bg-gray-50 p-3 font-sans text-gray-700 dark:border-white/10 dark:bg-black/25 dark:text-gray-300 sm:grid-cols-2">
                                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Tên khai sinh:</span> {selectedEvent.extended.basic_info.full_name}</div>
                                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Quốc tịch:</span> {selectedEvent.extended.basic_info.nationality}</div>
                                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Sinh nhật:</span> {selectedEvent.extended.basic_info.birth.date}</div>
                                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Nơi sinh:</span> {selectedEvent.extended.basic_info.birth.place}</div>
                                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Ngày mất:</span> {selectedEvent.extended.basic_info.death.date} ({selectedEvent.extended.basic_info.death.age} tuổi)</div>
                                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Nơi mất:</span> {selectedEvent.extended.basic_info.death.place}</div>
                                <div className="sm:col-span-2"><span className="font-semibold text-gray-500 dark:text-gray-400">Tên gọi khác:</span> {selectedEvent.extended.basic_info.other_names.join(", ")}</div>
                              </div>
                            </div>

                            {/* 2. Thông tin gia đình */}
                            {selectedEvent.extended.family && (
                              <div className="space-y-2">
<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#A7F3D0]">
                                  <Users className="w-4 h-4" /> Gia đình
                                </h4>
                                <div className="space-y-1 border border-gray-200 bg-gray-50 p-3 font-sans dark:border-white/10 dark:bg-black/25">
                                  <div><span className="font-semibold text-gray-500 dark:text-gray-400">Thân sinh:</span> Cụ {selectedEvent.extended.family.father} & Cụ {selectedEvent.extended.family.mother}</div>
                                  <div><span className="font-semibold text-gray-500 dark:text-gray-400">Anh chị em:</span> {selectedEvent.extended.family.siblings.join(", ")}</div>
                                </div>
                              </div>
                            )}

                            {/* 3. Chức vụ đảm nhiệm */}
                            {selectedEvent.extended.positions && (
                              <div className="space-y-2">
<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#A7F3D0]">
                                  <Shield className="w-4 h-4" /> Chức vụ chính đảm nhiệm
                                </h4>
                                <div className="space-y-2 font-sans">
                                  {selectedEvent.extended.positions.map((pos: any, idx: number) => (
                                    <div key={idx} className="border-l-2 border-[#0F766E]/35 bg-gray-50 py-1 pl-3 dark:border-[#A7F3D0]/35 dark:bg-white/[0.04]">
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white md:text-sm">{pos.title}</div>
                                      <div className="mt-0.5 flex justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <span>Nhiệm kỳ: {pos.start} — {pos.end}</span>
                                        <span className="font-medium text-[#0F766E] dark:text-[#A7F3D0]">Thời gian: {pos.duration}</span>
                                      </div>
                                      {pos.successor && (
                                        <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">Người kế nhiệm: {pos.successor}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 4. Di sản ghi nhận */}
                            {selectedEvent.extended.legacy && (
                              <div className="space-y-2">
<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#A7F3D0]">
                                  <Landmark className="w-4 h-4" /> Di sản & Ghi nhận
                                </h4>
                                <ul className="list-inside list-disc space-y-1.5 pl-2 text-justify font-sans text-xs text-gray-600 dark:text-gray-400 md:text-sm">
                                  {selectedEvent.extended.legacy.map((item: string, idx: number) => (
                                    <li key={idx} className="marker:text-[#0F766E] dark:marker:text-[#A7F3D0]">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}

                        {/* -------------------------------------------
                            LOẠI 2: HỒ SƠ SỰ KIỆN
                            ------------------------------------------- */}
                        {selectedEvent.extended.event_info && (
                          <>
                            {/* Nội dung chính sự kiện */}
                            <div className="space-y-2">
<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#A7F3D0]">
                                <Info className="w-4 h-4" /> {selectedEvent.extended.event_info.headline}
                              </h4>
                              <p className="border border-gray-200 bg-gray-50 p-3 text-justify font-sans text-sm leading-relaxed text-gray-700 dark:border-white/10 dark:bg-black/25 dark:text-gray-300 md:text-base">
                                {selectedEvent.extended.event_info.description}
                              </p>
                            </div>

                            {/* Chi tiết diễn biến */}
                            {selectedEvent.extended.event_info.details && (
                              <div className="space-y-2 pt-2">
<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#A7F3D0]">
                                  <Landmark className="w-4 h-4" /> Diễn biến & Chi tiết
                                </h4>
                                <ul className="list-inside list-disc space-y-2 pl-2 text-justify font-sans text-xs text-gray-600 dark:text-gray-400 md:text-sm">
                                  {selectedEvent.extended.event_info.details.map((item: string, idx: number) => (
                                    <li key={idx} className="marker:text-[#0F766E] dark:marker:text-[#A7F3D0]">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Ý nghĩa lịch sử */}
                            {selectedEvent.extended.significance && (
                              <div className="space-y-2 pt-2">
<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#A7F3D0]">
                                  <Shield className="w-4 h-4" /> {selectedEvent.extended.significance.title}
                                </h4>
                                <div className="border-l-2 border-[#0F766E]/40 bg-[#0F766E]/5 py-2 pl-3 dark:border-[#A7F3D0]/40 dark:bg-[#A7F3D0]/5">
                                  <p className="font-sans text-sm italic leading-relaxed text-gray-700 dark:text-gray-300 md:text-[15px]">
                                    {selectedEvent.extended.significance.content}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Tiểu sử tóm tắt (Dùng chung) */}
                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-white/10">
                          <p className="border-l-4 border-[#0F766E] pl-4 text-justify font-serif text-sm italic text-gray-600 dark:border-[#A7F3D0] dark:text-gray-400 md:text-base">
                            "{selectedEvent.desc}"
                          </p>
                          {selectedEvent.extended.caption && (
                            <p className="mt-4 text-center font-sans text-xs italic text-gray-500 dark:text-gray-400">
                              📸 {selectedEvent.extended.caption}
                            </p>
                          )}
                        </div>

                      </div>
                    ) : (
                      /* Layout hiển thị văn bản thuần túy mặc định cho các sự kiện còn lại */
                      <p className="border-l-4 border-[#0F766E] pl-6 text-justify font-serif text-base font-light italic leading-relaxed text-gray-700 dark:border-[#A7F3D0] dark:text-gray-300 md:text-lg">
                        {selectedEvent.desc}
                      </p>
                    )}
                  </motion.div>
                </div>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </footer>
  );
}
