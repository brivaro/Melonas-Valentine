import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, Heart, Check, Lock, CalendarClock, Share2 } from 'lucide-react';
import { DateTicket } from '../types';

interface DateCardProps {
  ticket: DateTicket;
  isCollected: boolean;
  isLocked: boolean;
  unlockDate: string;
  onReveal: () => void;
}

const DateCard: React.FC<DateCardProps> = ({ ticket, isCollected, isLocked, unlockDate, onReveal }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setIsRevealed(false);
  }, [ticket.id]);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLocked) return; // Prevent reveal if locked

    // Call parent to mark as collected
    onReveal();

    // Confetti explosion centered on the click
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    const scalar = 3;
    const heartShape = confetti.shapeFromText({ text: '❤️', scalar });
    const kissShape = confetti.shapeFromText({ text: '💋', scalar });
    const roseShape = confetti.shapeFromText({ text: '🌹', scalar });

    // Burst 1: Particles
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { x, y },
      colors: ['#f43f5e', '#ffe4e6', '#ffffff', '#fb7185'],
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    // Burst 2: Emojis
    confetti({
      particleCount: 15,
      spread: 60,
      origin: { x, y },
      shapes: [heartShape, kissShape, roseShape],
      scalar: 2,
      startVelocity: 30,
      gravity: 0.6,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    setIsRevealed(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Extra Confetti for sharing (Green/Pink mix)
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#25D366', '#f43f5e', '#ffffff'], // Whatsapp green + Valentine Red
      zIndex: 9999,
    });

    const text = `¡Mira nuestro plan! 🍉❤️\n\n${ticket.emoji} ${ticket.title}\n${ticket.description}`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: 'Para mi Melona 🍉',
        text: text,
        url: url
      }).catch(console.error);
    } else {
      // Fallback to direct WhatsApp link
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Determine border/shadow color based on category
  const getGlowColor = () => {
    switch (ticket.category) {
      case 'Picante': return 'hover:shadow-red-500/50 border-red-300 bg-red-50/50';
      case 'Aventura': return 'hover:shadow-orange-400/50 border-orange-300 bg-orange-50/50';
      case 'Pareja': return 'hover:shadow-purple-400/50 border-purple-300 bg-purple-50/50';
      default: return 'hover:shadow-pink-400/50 border-pink-300 bg-pink-50/50';
    }
  };

  const getCategoryBadgeColor = () => {
    switch (ticket.category) {
      case 'Picante': return 'bg-red-100 text-red-600';
      case 'Aventura': return 'bg-orange-100 text-orange-600';
      case 'Pareja': return 'bg-purple-100 text-purple-600';
      default: return 'bg-pink-100 text-pink-600';
    }
  }

  return (
    <div className="relative w-[90vw] max-w-[22rem] h-[65vh] max-h-[36rem] sm:w-96 sm:h-[34rem] cursor-pointer perspective-1000 group mx-auto" onClick={handleFlip}>
      <motion.div
        className={`w-full h-full relative preserve-3d transition-all duration-500`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* --- FRONT FACE --- */}
        {/* --- FRONT FACE --- */}
        <div className={`absolute w-full h-full backface-hidden rounded-3xl shadow-xl overflow-hidden flex flex-col ${getGlowColor()} !bg-white transition-colors duration-300`}>

          {/* Top Image Section */}
          <div className="relative w-full h-[60%] bg-pink-50 overflow-hidden rounded-b-[5rem] group-hover:h-[65%] transition-all duration-500 ease-in-out">
            {ticket.image ? (
              <img
                src={ticket.image}
                alt={ticket.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-valentine-100/50">
                <span className="text-9xl filter drop-shadow-md animate-bounce-slow">{ticket.emoji}</span>
              </div>
            )}

            {/* Gradient Overlay for texture */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />

            {/* Indicators aligned to top-left */}
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              {isCollected && (
                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-green-200 shadow-sm" title="¡Ya descubierto!">
                  <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                </div>
              )}
              {isLocked && !isCollected && (
                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-gray-200 shadow-sm" title="Bloqueado">
                  <Lock className="w-5 h-5 text-gray-500" strokeWidth={2} />
                </div>
              )}
            </div>

            {/* Heart Stamp top-right */}
            <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm p-2 rounded-full z-20">
              <Heart className="w-6 h-6 text-white fill-white/80" />
            </div>
          </div>

          {/* Bottom Text Section */}
          <div className="relative h-[40%] bg-transparent flex flex-col items-center justify-center p-4 group-hover:h-[35%] transition-all duration-500">
            {/* Floating Emoji Badge */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10 group-hover:scale-110 transition-transform">
              <span className="text-3xl">{ticket.emoji}</span>
            </div>

            <div className="text-center mt-6">
              <h3 className="font-handwritten text-4xl sm:text-5xl text-slate-800 tracking-wide rotate-[-2deg]">
                {ticket.category === 'Picante' ? 'Solo para ti...' : 'Vale por...'}
              </h3>
              <div className="mt-3 w-24 h-1.5 bg-valentine-400 mx-auto rounded-full opacity-60"></div>
            </div>

            <div className="absolute bottom-4 font-sans text-[10px] uppercase tracking-widest opacity-40 text-slate-500">
              Tap to Flip
            </div>
          </div>
        </div>

        {/* --- BACK FACE --- */}
        <div
          className="absolute w-full h-full backface-hidden rounded-3xl bg-white border-2 border-valentine-200 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 rotate-y-180"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {isLocked ? (
            <div className="z-10 flex flex-col items-center justify-center text-center p-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gray-100 p-6 rounded-full shadow-inner mb-6"
              >
                <Lock size={48} className="text-gray-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-600 font-handwritten mb-2">Paciencia...</h3>
              <p className="text-sm text-gray-500 mb-4 px-4">Esta carta estará disponible el:</p>
              <div className="flex items-center gap-2 bg-valentine-50 px-4 py-2 rounded-lg border border-valentine-100">
                <CalendarClock className="text-valentine-400" size={20} />
                <span className="font-bold text-valentine-600">{unlockDate}</span>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!isRevealed ? (
                <motion.button
                  key="gift-button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    transition: { delay: 0.2 }
                  }}
                  exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.3 } }}
                  onClick={handleReveal}
                  className="relative group/btn z-10 flex flex-col items-center"
                >
                  <motion.div
                    animate={{
                      rotate: [0, -8, 8, -8, 8, 0],
                      scale: [1, 1.05, 1],
                      y: [0, -2, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1, // Pause between shakes
                      ease: "easeInOut"
                    }}
                    className="bg-gradient-to-tr from-valentine-500 to-pink-400 p-8 rounded-full shadow-lg shadow-pink-500/40 text-white relative"
                  >
                    <Gift size={56} strokeWidth={1.5} />
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2.5 }}
                      className="absolute -right-2 -top-2 text-xl"
                    >✨</motion.div>
                  </motion.div>
                  <p className="mt-6 text-valentine-600 font-bold text-base animate-pulse text-center">
                    {isCollected ? '¡Ver de nuevo!' : '¡Ábrelo!'} 🎁
                  </p>
                </motion.button>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1, type: 'spring' }}
                  className="text-center w-full h-full flex flex-col justify-between z-10 py-4 relative"
                >
                  {/* Share Button - Absolute top right of the content area */}
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="absolute -top-1 -right-1 p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors shadow-sm border border-green-200 z-50"
                    title="Enviar por WhatsApp"
                  >
                    <Share2 size={16} />
                  </motion.button>

                  <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <span className="text-6xl mb-6 block drop-shadow-sm">{ticket.emoji}</span>
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 font-handwritten leading-tight">
                      {ticket.title}
                    </h3>
                    <p className="text-gray-600 text-lg sm:text-xl leading-relaxed font-medium px-4">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-pink-100 w-full flex justify-between items-center text-xs">
                    <span className="text-valentine-300">#{ticket.id}</span>
                    <span className={`px-2 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${getCategoryBadgeColor()}`}>
                      {ticket.category}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DateCard;