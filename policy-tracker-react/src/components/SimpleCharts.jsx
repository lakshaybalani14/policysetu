import { motion } from 'framer-motion';

// Simple CSS/SVG Bar Chart
export const BarChart = ({ data, color = 'bg-blue', height = 200 }) => {
    // Determine max value for scaling
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="w-full h-full pt-6">
            <div className="flex items-end justify-between space-x-2 h-full">
                {data.map((item, index) => {
                    const percentage = (item.value / maxValue) * 100;
                    return (
                        <div key={index} className="flex-1 min-w-0 flex flex-col items-center group relative h-full justify-end">
                            {/* Bar Container - limited width to prevent huge bars */}
                            <div className="w-full max-w-[4rem] bg-slate-100 dark:bg-slate-800 rounded-t-md relative flex items-end" style={{ height: '100%' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${percentage}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className={`w-full ${item.color || color} group-hover:opacity-90 transition-opacity absolute bottom-0 left-0 right-0 rounded-t-md`}
                                >
                                    {/* Tooltip on hover */}
                                    <div className={`opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg ${index === 0 ? 'left-0 translate-x-0' : index === data.length - 1 ? 'right-0 left-auto translate-x-0' : ''}`}>
                                        <span className="font-semibold">{item.label}</span>: {item.value}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Label */}
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center block px-1" title={item.label}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Simple Donut Chart using CSS Conic Gradient
export const PieChart = ({ data }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    // Create conic-gradient string
    let currentPercentage = 0;
    const gradientParts = data.map(item => {
        const start = currentPercentage;
        const percentage = (item.value / total) * 100;
        currentPercentage += percentage;
        // Check if color is hex or tailwind class. If tailwind class, we need hex mapping.
        // For simplicity, let's assume `item.color` is a valid CSS color (hex, rgb, or name).
        return `${item.color} ${start}% ${currentPercentage}%`;
    });

    const gradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-8 space-y-6 sm:space-y-0 p-4">
            <div className="relative w-48 h-48 rounded-full shadow-lg flex-shrink-0"
                style={{ background: gradientParts.length > 0 ? gradient : '#f1f5f9' }}>
                {/* Inner white circle for Donut effect */}
                <div className="absolute inset-8 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 w-full max-w-xs">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                            {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
