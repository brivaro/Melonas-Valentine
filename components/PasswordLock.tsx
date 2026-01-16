import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Lock, Heart, X } from 'lucide-react';

interface PasswordLockProps {
    onSuccess: () => void;
}

const PasswordLock: React.FC<PasswordLockProps> = ({ onSuccess }) => {
    const [input, setInput] = useState('');
    const [showPichiModal, setShowPichiModal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input automatically on mount and keep proper focus
    useEffect(() => {
        inputRef.current?.focus();

        const handleFocus = () => inputRef.current?.focus();
        window.addEventListener('click', handleFocus);
        return () => window.removeEventListener('click', handleFocus);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow letters
        const val = e.target.value.replace(/[^a-zA-Z]/g, '');
        if (val.length <= 6) { // Limit to 6 chars (length of 'viento')
            setInput(val);
        }
    };

    useEffect(() => {
        const lowerInput = input.toLowerCase();

        if (lowerInput === 'viento') {
            // Success!
            // Add a small delay for visual feedback
            setTimeout(() => {
                onSuccess();
            }, 300);
        } else if (lowerInput === 'pichi') {
            // Special easter egg
            setShowPichiModal(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f43f5e', '#ec4899', '#ffffff']
            });
        }
    }, [input, onSuccess]);

    // Determine how many slots to show.
    // We'll show 6 slots as a hint for "viento".
    const SLOTS = 6;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4">

            {/* Main Password UI */}
            {!showPichiModal && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-8 w-full max-w-md relative overflow-hidden"
                    onClick={() => inputRef.current?.focus()}
                >
                    {/* Header */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-valentine-100 rounded-full flex items-center justify-center mb-2">
                            <Lock className="text-valentine-500" size={32} />
                        </div>
                        <h2 className="font-handwritten text-3xl text-valentine-600">Palabra Mágica</h2>
                        <p className="text-slate-500 text-sm text-center">
                            Escribe la contraseña para entrar 🍉
                        </p>
                    </div>

                    {/* Input & Squares */}
                    <div className="relative w-full flex justify-center">
                        {/* Hidden Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={handleChange}
                            className="absolute opacity-0 inset-0 w-full h-full cursor-pointer caret-transparent"
                            autoComplete="off"
                            autoFocus
                        />

                        {/* Visual Squares */}
                        <div className="flex gap-2 sm:gap-3">
                            {[...Array(SLOTS)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: i === input.length ? 1.1 : 1,
                                        borderColor: i === input.length ? '#e11d48' : (input[i] ? '#fb7185' : '#e2e8f0')
                                    }}
                                    className={`
                    w-10 h-12 sm:w-12 sm:h-14 
                    rounded-xl border-2 flex items-center justify-center 
                    text-2xl font-bold text-valentine-600 shadow-sm
                    bg-white
                    ${i === input.length ? 'border-valentine-600 shadow-valentine-100 ring-4 ring-valentine-50' : 'border-slate-200'}
                  `}
                                >
                                    {input[i] || ''}
                                    {/* Cursor effect for active slot */}
                                    {i === input.length && (
                                        <motion.div
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                            className="absolute w-0.5 h-6 bg-valentine-400 rounded-full"
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </motion.div>
            )}

            {/* Pichi Easter Egg Modal */}
            <AnimatePresence>
                {showPichiModal && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl">

                            {/* Close button */}
                            <button
                                onClick={() => {
                                    setShowPichiModal(false);
                                    setInput(''); // Reset input
                                    inputRef.current?.focus();
                                }}
                                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex justify-center mb-4">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}
                                >
                                    <Heart className="text-valentine-500 fill-valentine-500" size={64} />
                                </motion.div>
                            </div>

                            <h3 className="font-handwritten text-4xl text-valentine-600 mb-4">
                                ¡Te quiero morogollón!
                            </h3>

                            <p className="text-slate-600 mb-6 font-medium">
                                Eres la mejor 💖
                            </p>

                            <button
                                onClick={() => {
                                    setShowPichiModal(false);
                                    setInput('');
                                    inputRef.current?.focus();
                                }}
                                className="w-full py-3 bg-valentine-500 hover:bg-valentine-600 text-white rounded-xl font-bold shadow-lg shadow-valentine-200 transition-all active:scale-95"
                            >
                                Yo también 😍
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PasswordLock;
