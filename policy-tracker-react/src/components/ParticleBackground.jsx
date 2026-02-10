import { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const ParticleBackground = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                background: {
                    color: {
                        value: 'transparent',
                    },
                },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: ['grab', 'bubble'],
                        },
                        onClick: {
                            enable: true,
                            mode: 'push',
                        },
                        resize: true,
                    },
                    modes: {
                        grab: {
                            distance: 140,
                            links: {
                                opacity: 0.8,
                                color: '#ffffff',
                            },
                        },
                        bubble: {
                            distance: 200,
                            size: 6,
                            duration: 2,
                            opacity: 0.8,
                        },
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 100,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: ['#ffffff', '#e0effe', '#b9ddfe', '#f0f7ff'],
                    },
                    links: {
                        color: '#ffffff',
                        distance: 150,
                        enable: true,
                        opacity: 0.4,
                        width: 2,
                        triangles: {
                            enable: true,
                            opacity: 0.1,
                        },
                    },
                    move: {
                        direction: 'none',
                        enable: true,
                        outModes: {
                            default: 'bounce',
                        },
                        random: true,
                        speed: 1.5,
                        straight: false,
                        attract: {
                            enable: true,
                            rotateX: 600,
                            rotateY: 1200,
                        },
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 100,
                    },
                    opacity: {
                        value: { min: 0.3, max: 0.8 },
                        animation: {
                            enable: true,
                            speed: 1,
                            minimumValue: 0.3,
                            sync: false,
                        },
                    },
                    shape: {
                        type: ['circle', 'triangle'],
                    },
                    size: {
                        value: { min: 1, max: 4 },
                        animation: {
                            enable: true,
                            speed: 2,
                            minimumValue: 0.5,
                            sync: false,
                        },
                    },
                },
                detectRetina: true,
                smooth: true,
                fullScreen: {
                    enable: false,
                    zIndex: -1,
                },
            }}
            className="absolute inset-0 z-0 pointer-events-auto"
        />
    );
};

export default ParticleBackground;
