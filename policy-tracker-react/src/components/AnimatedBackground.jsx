import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    // Apple-inspired sophisticated color blobs - cohesive blue/purple/slate palette
    const blobs = [
        {
            color: 'from-blue-600/40 via-indigo-600/30 to-purple-600/40',
            delay: 0,
            duration: 25,
            initialX: '20%',
            initialY: '30%',
        },
        {
            color: 'from-indigo-500/30 via-blue-500/25 to-cyan-500/30',
            delay: 3,
            duration: 30,
            initialX: '70%',
            initialY: '20%',
        },
        {
            color: 'from-purple-600/35 via-indigo-500/30 to-blue-600/35',
            delay: 6,
            duration: 28,
            initialX: '50%',
            initialY: '60%',
        },
        {
            color: 'from-slate-600/20 via-blue-600/25 to-indigo-600/30',
            delay: 9,
            duration: 32,
            initialX: '80%',
            initialY: '70%',
        },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Clean gradient base - Apple style */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />

            {/* Subtle animated mesh gradient overlay */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)',
                }}
                animate={{
                    background: [
                        'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15), transparent 50%)',
                        'radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15), transparent 50%)',
                        'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 50%)',
                        'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15), transparent 50%)',
                    ],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Elegant overlapping gradient blobs - slow, smooth movement */}
            {blobs.map((blob, index) => (
                <motion.div
                    key={index}
                    className={`absolute w-[500px] h-[500px] bg-gradient-to-br ${blob.color} rounded-full blur-3xl`}
                    style={{
                        left: blob.initialX,
                        top: blob.initialY,
                    }}
                    animate={{
                        x: ['-10%', '10%', '-5%', '-10%'],
                        y: ['-10%', '5%', '10%', '-10%'],
                        scale: [1, 1.1, 0.95, 1],
                    }}
                    transition={{
                        duration: blob.duration,
                        delay: blob.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* Subtle light rays effect */}
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Minimal floating orbs - very subtle */}
            <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-blue-400/20 rounded-full blur-sm"
                        style={{
                            left: `${15 + i * 12}%`,
                            top: `${20 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            y: [0, -50, 0],
                            opacity: [0.2, 0.5, 0.2],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{
                            duration: 8 + i * 2,
                            repeat: Infinity,
                            delay: i * 1.5,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            {/* Subtle grid overlay - barely visible */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Soft vignette effect */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(15, 23, 42, 0.05) 100%)',
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
