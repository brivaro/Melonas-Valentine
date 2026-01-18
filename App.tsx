import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { dateTickets } from './data';
import DateCard from './components/DateCard';
import { ChevronLeft, ChevronRight, Heart, CheckCircle, Filter, CalendarHeart, X, Trophy, Trash } from 'lucide-react';
import { Category } from './types';

// --- CONFIG ---
// Set to TRUE to unlock everything immediately (for testing)
// Set to FALSE for the real experience starting Feb 14th
const DEBUG_MODE = false;
const SESSION_DURATION = 1000 * 60 * 60; // 1 hour

import PasswordLock from './components/PasswordLock';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (DEBUG_MODE) return true;
    const lastLogin = localStorage.getItem('valentine_auth_time');
    if (!lastLogin) return false;
    return Date.now() - parseInt(lastLogin) < SESSION_DURATION;
  });
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
    setRevealedIds((prev) => {
      // Prevent double counting if already present
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
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

  // Welcome Modal Logic
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const hasSeenWelcome = localStorage.getItem('valentine_welcome_seen');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated]);

  const closeWelcome = () => {
    localStorage.setItem('valentine_welcome_seen', 'true');
    setShowWelcome(false);
  };

  // Check if all cards are revealed
  const isCompleted = revealedIds.length === dateTickets.length && dateTickets.length > 0;
  const [showCelebration, setShowCelebration] = useState(false);

  // Trigger celebration timer when completed
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        setShowCelebration(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  // Handle Confetti when celebration opens
  useEffect(() => {
    if (showCelebration) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showCelebration]);

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-pink-50 selection:bg-valentine-200 flex flex-col items-center justify-center">

      <AnimatePresence>
        {!isAuthenticated && (
          <PasswordLock onSuccess={() => {
            localStorage.setItem('valentine_auth_time', Date.now().toString());
            setIsAuthenticated(true);
          }} />
        )}
      </AnimatePresence>

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-valentine-100 rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-4xl">🍉</span>
                  </motion.div>
                </div>
              </div>

              <h2 className="font-handwritten text-3xl text-valentine-600 mb-4">¡Bienvenida mi Melona!</h2>

              <div className="text-slate-600 space-y-4 text-sm md:text-base leading-relaxed mb-8">
                <p>
                  Cada tarjeta de este calendario especial guarda un <strong>plan o sorpresa romántica</strong> pensado solo para nosotros.
                </p>
                <p>
                  Tu misión es coleccionarlas todas y compartirlas con tu melón para que juntos hagamos realidad cada momento. 💖
                </p>
                <p className="font-medium text-valentine-500">
                  ¿Lista para descubrir tu regalo?
                </p>
              </div>

              <button
                onClick={closeWelcome}
                className="w-full py-3 bg-valentine-500 hover:bg-valentine-600 text-white rounded-xl font-bold shadow-lg shadow-valentine-200 transition-all active:scale-95"
              >
                ¡Empezar Aventura! 🚀
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Overlay */}
      <AnimatePresence>
        {showCelebration && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center max-w-lg w-full relative overflow-hidden"
            >
              <button
                onClick={() => setShowCelebration(false)}
                className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-slate-500"
              >
                <X size={24} />
              </button>

              {/* Confetti canvas is handled by library global */}

              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-pink-500 to-red-400" />

              <h2 className="font-handwritten text-4xl md:text-5xl text-valentine-600 mb-6 drop-shadow-sm">
                ¡Felicidades Melona! 🍉
              </h2>

              <div className="relative w-48 h-48 md:w-64 md:h-64 mb-6 rounded-2xl overflow-hidden shadow-lg transform rotate-3 border-4 border-white">
                <img
                  src="/icon/end.webp"
                  alt="Celebration"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-slate-600 text-lg md:text-xl font-medium mb-8 leading-relaxed">
                Has descubierto todas las cartas sorpresa.<br />
                ¡Prepárate para un San Valentín y Aniversario inolvidable! 💖<br />
                Compárteme las tarjetas para preparar el evento juntos.
              </p>

              <div className="flex gap-4">
                {/* Replay Button Inside Modal (Optional but nice) */}
                <button
                  onClick={() => setShowCelebration(false)} /* Close to see dashboard or maybe just re-trigger? But close is better ux */
                  className="px-6 py-3 bg-white text-valentine-600 border-2 border-valentine-100 rounded-xl font-bold shadow-sm hover:bg-valentine-50 transition-all"
                >
                  <Trash className="fill-white/20" />
                  Empezar de cero
                </button>

                <button
                  onClick={() => setRevealedIds([])}
                  className="px-8 py-3 bg-valentine-500 hover:bg-valentine-600 text-white rounded-xl font-bold shadow-lg shadow-valentine-200 transition-all active:scale-95 flex items-center gap-2"
                >
                  <CalendarHeart className="fill-white/20" />
                  <span>Ver colección</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full h-full flex flex-col items-center justify-center transition-all duration-1000 ${!isAuthenticated ? 'blur-xl scale-110 opacity-60 pointer-events-none' : ''}`}>

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
            <div className="relative mt-2 flex gap-2">
              {isCompleted && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCelebration(true)}
                  className="bg-yellow-400 text-white p-2 rounded-full shadow-md border border-yellow-500 hover:bg-yellow-500 transition-colors"
                >
                  <Trophy size={18} />
                </motion.button>
              )}
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
    </div>
  );
};

export default App;