import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { dateTickets } from './data';
import DateCard from './components/DateCard';
import { ChevronLeft, ChevronRight, Heart, CheckCircle, Filter, CalendarHeart, X } from 'lucide-react';
import { Category } from './types';

// --- CONFIG ---
// Set to TRUE to unlock everything immediately (for testing)
// Set to FALSE for the real experience starting Feb 14th
const DEBUG_MODE = false;

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<Category | 'Todos'>('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Logic
  const filteredTickets = useMemo(() => {
    if (filter === 'Todos') return dateTickets;
    return dateTickets.filter(t => t.category === filter);
  }, [filter]);

  // Handle index reset when filter changes
  const handleFilterChange = (newFilter: Category | 'Todos') => {
    setFilter(newFilter);
    setCurrentIndex(0);
    setDirection(0);
    setIsFilterOpen(false);
  };

  const nextCard = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1 === filteredTickets.length ? 0 : prev + 1));
  };

  const prevCard = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 < 0 ? filteredTickets.length - 1 : prev - 1));
  };

  const markAsRevealed = (id: string) => {
    if (!revealedIds.includes(id)) {
      setRevealedIds((prev) => [...prev, id]);
    }
  };

  // --- DATE UNLOCK LOGIC ---
  const isTicketLocked = (indexInFullList: number): { locked: boolean; dateStr: string } => {
    if (DEBUG_MODE) return { locked: false, dateStr: 'Ahora' };

    const today = new Date();
    const currentYear = today.getFullYear();
    // Month is 0-indexed (1 is Feb)
    const startDate = new Date(currentYear, 1, 14);

    // Calculate unlock date for this specific ticket index (0 = Feb 14, 1 = Feb 15, etc.)
    const unlockDate = new Date(startDate);
    unlockDate.setDate(startDate.getDate() + indexInFullList);

    // Format date string
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const dateStr = unlockDate.toLocaleDateString('es-ES', options);

    // If today is before unlock date, it's locked
    // Reset time to midnight for fair comparison
    today.setHours(0, 0, 0, 0);
    unlockDate.setHours(0, 0, 0, 0);

    return {
      locked: today < unlockDate,
      dateStr
    };
  };

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.5,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.5,
      rotateY: direction < 0 ? -45 : 45,
      transition: {
        duration: 0.4
      }
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const progressPercentage = (revealedIds.length / dateTickets.length) * 100;

  // Get current ticket info for lock check
  const currentTicket = filteredTickets[currentIndex];
  // Find index in original list to ensure consistent dates regardless of filter
  const originalIndex = currentTicket ? dateTickets.findIndex(t => t.id === currentTicket.id) : 0;
  const lockStatus = isTicketLocked(originalIndex);

  const categories = ['Todos', 'Romántico', 'Aventura', 'Picante', 'Pareja'];

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-pink-50 selection:bg-valentine-200 flex flex-col items-center justify-center">

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-valentine-300/30 rounded-full blur-3xl mix-blend-multiply"
        />
        <motion.div
          animate={{ x: [0, -70, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] bg-orange-200/40 rounded-full blur-3xl mix-blend-multiply"
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[20%] w-[25rem] h-[25rem] bg-red-200/30 rounded-full blur-3xl mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center h-full justify-between py-2 md:py-8">

        {/* Header */}
        <header className="text-center px-4 pt-2 w-full max-w-lg flex flex-col items-center relative z-50">
          <h1 className="font-handwritten text-4xl md:text-5xl text-valentine-600 drop-shadow-sm flex items-center justify-center gap-2">
            <span>Para mi Melona</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >🍉</motion.span>
          </h1>

          {/* Progress Bar */}
          <div className="mt-3 w-full flex flex-col items-center gap-2 mb-2">
            <div className="flex items-center gap-2 text-valentine-600 font-medium text-xs bg-white/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/50">
              <CheckCircle size={12} className={revealedIds.length === dateTickets.length ? "text-green-500" : "text-valentine-400"} />
              <span>{revealedIds.length} de {dateTickets.length} completadas</span>
            </div>
            <div className="w-full max-w-xs h-1.5 bg-white/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-valentine-400 to-valentine-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* NEW Filter Toggle Button */}
          <div className="relative mt-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-handwritten text-lg transition-all shadow-md border ${isFilterOpen || filter !== 'Todos'
                ? 'bg-valentine-500 text-white border-valentine-600'
                : 'bg-white/70 text-valentine-600 border-white hover:bg-white'
                }`}
            >
              {isFilterOpen ? <X size={18} /> : <Filter size={18} />}
              <span>{filter === 'Todos' ? 'Filtrar cartas' : filter}</span>
              {filter !== 'Todos' && <Heart size={14} className="fill-white animate-pulse" />}
            </motion.button>

            {/* Animated Dropdown / Popout */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col gap-2 min-w-[200px] p-2"
                >
                  {categories.map((cat, index) => (
                    <motion.button
                      key={cat}
                      initial={{ opacity: 0, y: -20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.8 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 400,
                        damping: 20
                      }}
                      onClick={() => handleFilterChange(cat as any)}
                      className={`
                                        flex items-center justify-between px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md transition-all
                                        ${filter === cat
                          ? 'bg-valentine-500 border-valentine-400 text-white scale-105 z-10'
                          : 'bg-white/90 border-pink-100 text-valentine-600 hover:bg-white hover:scale-105'
                        }
                                    `}
                    >
                      <span className="font-medium text-sm">{cat}</span>
                      {filter === cat ? <Heart size={16} className="fill-current" /> : null}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Carousel Container */}
        <div className="relative w-full flex-1 flex items-center justify-center min-h-0">

          {/* Prev Button */}
          <button
            onClick={prevCard}
            className="absolute left-2 md:left-10 z-20 p-3 rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-valentine-600 hover:bg-white/60 transition-all shadow-lg active:scale-95 hidden sm:block"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Carousel Content */}
          <div className="relative w-full h-full flex items-center justify-center perspective-1000">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              {filteredTickets.length > 0 ? (
                <motion.div
                  key={filteredTickets[currentIndex].id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute cursor-grab active:cursor-grabbing"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);

                    if (swipe < -swipeConfidenceThreshold) {
                      nextCard();
                    } else if (swipe > swipeConfidenceThreshold) {
                      prevCard();
                    }
                  }}
                >
                  <DateCard
                    ticket={filteredTickets[currentIndex]}
                    isCollected={revealedIds.includes(filteredTickets[currentIndex].id)}
                    isLocked={lockStatus.locked}
                    unlockDate={lockStatus.dateStr}
                    onReveal={() => markAsRevealed(filteredTickets[currentIndex].id)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-valentine-500 font-medium bg-white/50 p-6 rounded-2xl backdrop-blur-sm"
                >
                  <p className="text-xl">💔</p>
                  <p>No hay cartas de este tipo.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <button
            onClick={nextCard}
            className="absolute right-2 md:right-10 z-20 p-3 rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-valentine-600 hover:bg-white/60 transition-all shadow-lg active:scale-95 hidden sm:block"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Footer/Navigation Info */}
        <div className="flex flex-col items-center gap-4 pb-2 px-4 z-10">
          {/* Simple visual indicator of lock status if needed */}
          {lockStatus.locked && !DEBUG_MODE && (
            <div className="text-xs font-medium text-gray-500 bg-white/50 px-3 py-1 rounded-full flex items-center gap-1">
              <CalendarHeart size={12} />
              <span>Disponible el {lockStatus.dateStr}</span>
            </div>
          )}

          <div className="flex gap-8 items-center sm:hidden">
            <button
              onClick={prevCard}
              className="p-4 rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-valentine-600 shadow-md active:scale-90 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Mobile Filter Trigger (Heart) */}
            <motion.button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <Heart
                className={`transition-colors duration-300 ${isFilterOpen ? 'text-valentine-600 fill-valentine-600' : 'text-valentine-400 fill-valentine-200'}`}
                size={32}
              />
              {filter !== 'Todos' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-valentine-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-valentine-500"></span>
                </span>
              )}
            </motion.button>

            <button
              onClick={nextCard}
              className="p-4 rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-valentine-600 shadow-md active:scale-90 transition-transform"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <p className="text-[10px] text-valentine-400 opacity-60 font-handwritten">
            {DEBUG_MODE ? '🔧 Debug Mode: ON' : ''}
          </p>
        </div>

      </div>
    </div>
  );
};

export default App;