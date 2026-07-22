/* =========================================
   HANGAR PLAY RADIO
   REPRODUCTOR A BORDO v3.0
   STREAMING ZENO + CABINA + VÚMETROS
========================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================
           ELEMENTOS PRINCIPALES
        ====================================== */


        const loader =
            document.getElementById(
                "loader"
            );


        const radioPlayer =
            document.getElementById(
                "radioPlayer"
            );


        const playButton =
            document.getElementById(
                "playButton"
            );


        const playIcon =
            document.querySelector(
                ".play-icon"
            );


        const playText =
            document.querySelector(
                ".play-text"
            );


        const status =
            document.getElementById(
                "status"
            );


        const statusLight =
            document.getElementById(
                "statusLight"
            );


        const systemMessage =
            document.querySelector(
                ".system-message p"
            );


        const vuLeft =
            document.getElementById(
                "vuLeft"
            );


        const vuRight =
            document.getElementById(
                "vuRight"
            );


        /* =====================================
           STREAMING OFICIAL ZENO
        ====================================== */


        const streamURL =
            "https://stream.zeno.fm/1fv4rwglthgtv";


        if (
            radioPlayer
        ) {

            radioPlayer.src =
                streamURL;

        }


        /* =====================================
           VARIABLES DE AUDIO
        ====================================== */


        let audioContext =
            null;


        let analyser =
            null;


        let sourceNode =
            null;


        let animationFrame =
            null;


        let audioInitialized =
            false;


        /* =====================================
           PANTALLA DE ARRANQUE
        ====================================== */


        window.setTimeout(
            () => {


                if (
                    loader
                ) {

                    loader.style.opacity =
                        "0";

                    loader.style.visibility =
                        "hidden";

                    loader.style.pointerEvents =
                        "none";

                }


            },
            3000
        );


        /* =====================================
           CREAR SISTEMA DE ANÁLISIS DE AUDIO
        ====================================== */


        function initializeAudioAnalysis() {


            if (
                audioInitialized
            ) {

                return;

            }


            if (
                !radioPlayer
            ) {

                return;

            }


            try {


                const AudioContext =
                    window.AudioContext ||
                    window.webkitAudioContext;


                if (
                    !AudioContext
                ) {

                    console.log(
                        "AudioContext no disponible."
                    );

                    return;

                }


                audioContext =
                    new AudioContext();


                analyser =
                    audioContext.createAnalyser();


                analyser.fftSize =
                    256;


                analyser.smoothingTimeConstant =
                    0.75;


                /*
                   IMPORTANTE:

                   El navegador puede bloquear
                   el análisis de un streaming
                   externo si el servidor no
                   permite CORS.

                   Intentamos conectar el
                   reproductor al analizador.
                */


                sourceNode =
                    audioContext.createMediaElementSource(
                        radioPlayer
                    );


                sourceNode.connect(
                    analyser
                );


                analyser.connect(
                    audioContext.destination
                );


                audioInitialized =
                    true;


                startVUMeters();


            } catch (
                error
            ) {


                console.log(
                    "No fue posible analizar el audio:",
                    error
                );


                /*
                   Si el navegador bloquea
                   el análisis del streaming,
                   mantenemos una animación
                   visual de respaldo.
                */


                startFallbackVUMeters();


            }

        }


        /* =====================================
           VÚMETROS REALES
        ====================================== */


        function startVUMeters() {


            if (
                !analyser
            ) {

                return;

            }


            const dataArray =
                new Uint8Array(
                    analyser.frequencyBinCount
                );


            function animate() {


                analyser.getByteFrequencyData(
                    dataArray
                );


                let total =
                    0;


                for (
                    let i = 0;
                    i < dataArray.length;
                    i++
                ) {


                    total +=
                        dataArray[i];


                }


                const average =
                    total /
                    dataArray.length;


                const level =
                    Math.max(
                        5,
                        Math.min(
                            100,
                            average *
                            1.5
                        )
                    );


                const variation =
                    Math.random() *
                    12;


                if (
                    vuLeft
                ) {

                    vuLeft.style.width =
                        Math.min(
                            100,
                            level +
                            variation
                        ) +
                        "%";

                }


                if (
                    vuRight
                ) {

                    vuRight.style.width =
                        Math.min(
                            100,
                            level +
                            variation *
                            0.8
                        ) +
                        "%";

                }


                animationFrame =
                    requestAnimationFrame(
                        animate
                    );


            }


            animate();


        }


        /* =====================================
           ANIMACIÓN DE RESPALDO
        ====================================== */


        function startFallbackVUMeters() {


            function animateFallback() {


                const leftLevel =
                    15 +
                    Math.random() *
                    70;


                const rightLevel =
                    15 +
                    Math.random() *
                    70;


                if (
                    vuLeft
                ) {

                    vuLeft.style.width =
                        leftLevel +
                        "%";

                }


                if (
                    vuRight
                ) {

                    vuRight.style.width =
                        rightLevel +
                        "%";

                }


                animationFrame =
                    requestAnimationFrame(
                        () => {

                            setTimeout(
                                animateFallback,
                                120
                            );

                        }
                    );


            }


            animateFallback();


        }


        /* =====================================
           ACTUALIZAR ESTADO VISUAL
        ====================================== */


        function setOnlineState() {


            if (
                status
            ) {

                status.textContent =
                    "TRANSMISIÓN ONLINE";

            }


            if (
                statusLight
            ) {

                statusLight.classList.add(
                    "online"
                );

            }


            if (
                systemMessage
            ) {

                systemMessage.textContent =
                    "TRANSMITIENDO EN VIVO";

            }


        }


        /* =====================================
           ACTUALIZAR ESTADO DE ESPERA
        ====================================== */


        function setStandbyState() {


            if (
                status
            ) {

                status.textContent =
                    "SISTEMA EN ESPERA";

            }


            if (
                statusLight
            ) {

                statusLight.classList.remove(
                    "online"
                );

            }


            if (
                systemMessage
            ) {

                systemMessage.textContent =
                    "Listos para despegar";

            }


            if (
                vuLeft
            ) {

                vuLeft.style.width =
                    "5%";

            }


            if (
                vuRight
            ) {

                vuRight.style.width =
                    "5%";

            }


        }


        /* =====================================
           BOTÓN PRINCIPAL
        ====================================== */


        if (
            playButton &&
            radioPlayer
        ) {


            playButton.addEventListener(
                "click",
                async () => {


                    if (
                        radioPlayer.paused
                    ) {


                        try {


                            /*
                               Inicializamos el
                               análisis de audio
                               después de la
                               interacción del
                               usuario.
                            */


                            initializeAudioAnalysis();


                            if (
                                audioContext &&
                                audioContext.state ===
                                "suspended"
                            ) {

                                await audioContext.resume();

                            }


                            await radioPlayer.play();


                            playButton.classList.add(
                                "playing"
                            );


                            if (
                                playIcon
                            ) {

                                playIcon.textContent =
                                    "⏸";

                            }


                            if (
                                playText
                            ) {

                                playText.textContent =
                                    "DETENER TRANSMISIÓN";

                            }


                            setOnlineState();


                        } catch (
                            error
                        ) {


                            console.error(
                                "Error al iniciar la transmisión:",
                                error
                            );


                            if (
                                status
                            ) {

                                status.textContent =
                                    "ERROR DE CONEXIÓN";

                            }


                            if (
                                systemMessage
                            ) {

                                systemMessage.textContent =
                                    "NO SE PUDO INICIAR LA TRANSMISIÓN";

                            }


                        }


                    } else {


                        radioPlayer.pause();


                        playButton.classList.remove(
                            "playing"
                        );


                        if (
                            playIcon
                        ) {

                            playIcon.textContent =
                                "▶";

                        }


                        if (
                            playText
                        ) {

                            playText.textContent =
                                "ESCUCHAR EN VIVO";

                        }


                        setStandbyState();


                    }


                }
            );


        }


        /* =====================================
           EVENTO: TRANSMISIÓN INICIADA
        ====================================== */


        if (
            radioPlayer
        ) {


            radioPlayer.addEventListener(
                "playing",
                () => {


                    setOnlineState();


                }
            );


            /* =================================
               EVENTO: PAUSA
            ================================= */


            radioPlayer.addEventListener(
                "pause",
                () => {


                    if (
                        radioPlayer.currentTime >
                        0
                    ) {

                        setStandbyState();

                    }


                }
            );


            /* =================================
               EVENTO: ERROR
            ================================= */


            radioPlayer.addEventListener(
                "error",
                () => {


                    if (
                        status
                    ) {

                        status.textContent =
                            "SIN SEÑAL";

                    }


                    if (
                        statusLight
                    ) {

                        statusLight.classList.remove(
                            "online"
                        );

                    }


                    if (
                        systemMessage
                    ) {

                        systemMessage.textContent =
                            "ERROR DE TRANSMISIÓN";

                    }


                }
            );


        }


    }

);

