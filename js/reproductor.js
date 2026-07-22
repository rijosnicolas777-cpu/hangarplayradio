/* =========================================
   HANGAR PLAY RADIO
   REPRODUCTOR A BORDO
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTOS DEL REPRODUCTOR
    ====================================== */

    const radioPlayer =
        document.getElementById("radioPlayer");

    const playButton =
        document.getElementById("playButton");

    const status =
        document.getElementById("status");
const cockpit = document.querySelector(".cockpit");
    const systemMessage =
        document.querySelector(".radio-status");

    const loader =
        document.getElementById("loader");


    /* =====================================
       ELEMENTOS VISUALES
    ====================================== */

    const vuLeft =
        document.getElementById("vuLeft");

    const vuRight =
        document.getElementById("vuRight");

    const radarSweep =
        document.querySelector(".radar-sweep");

    const powerLight =
        document.querySelector(".power-light");


    /* =====================================
       TRANSMISIÓN
    ====================================== */

    const streamURL =
        "https://stream.zeno.fm/1fv4rwglthgtv";


    /* =====================================
       CONFIGURACIÓN DEL AUDIO
    ====================================== */

    if (radioPlayer) {

        radioPlayer.src =
            streamURL;

        radioPlayer.preload =
            "none";

    }


    /* =====================================
       PANTALLA DE INICIO
    ====================================== */

    setTimeout(() => {

        if (loader) {

            loader.classList.add(
                "loader-hidden"
            );

        }

    }, 2500);


    /* =====================================
       ESTADO ONLINE
    ====================================== */

    function setOnlineState() {

        if (status) {

            status.textContent =
                "ONLINE";

            status.classList.add(
                "online"
            );

        }


        if (systemMessage) {

            systemMessage.textContent =
                "TRANSMITIENDO EN VIVO";

        }


        if (powerLight) {

            powerLight.classList.add(
                "active"
            );

        }


        if (playButton) {

            playButton.classList.add(
                "playing"
            );

        }

    }


    /* =====================================
       ESTADO EN ESPERA
    ====================================== */

    function setStandbyState() {

        if (status) {

            status.textContent =
                "READY";

            status.classList.remove(
                "online"
            );

        }


        if (systemMessage) {

            systemMessage.textContent =
                "SISTEMA EN ESPERA";

        }


        if (powerLight) {

            powerLight.classList.remove(
                "active"
            );

        }


        if (playButton) {

            playButton.classList.remove(
                "playing"
            );

        }


        if (vuLeft) {

            vuLeft.style.height =
                "8%";

        }


        if (vuRight) {

            vuRight.style.height =
                "8%";

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

                        await radioPlayer.play();

                        setOnlineState();


                        playButton.innerHTML =
                            "<span>⏸</span> DETENER TRANSMISIÓN";


                        startVisualMeters();


                    } catch (error) {

                        console.error(
                            "Error de reproducción:",
                            error
                        );


                        if (status) {

                            status.textContent =
                                "SIN SEÑAL";

                        }


                        if (systemMessage) {

                            systemMessage.textContent =
                                "NO SE PUDO INICIAR LA TRANSMISIÓN";

                        }

                    }

                }

                else {

                    radioPlayer.pause();

                    playButton.innerHTML =
                        "<span>▶</span> ESCUCHAR EN VIVO";

                    setStandbyState();

                }

            }
        );

    }


    /* =====================================
       EVENTO: AUDIO REPRODUCIENDO
    ====================================== */

    if (radioPlayer) {

        radioPlayer.addEventListener(
            "playing",
            () => {

                setOnlineState();

            }
        );


        /* =================================
           EVENTO: AUDIO DETENIDO
        ================================== */

        radioPlayer.addEventListener(
            "pause",
            () => {

                setStandbyState();

            }
        );


        /* =================================
           EVENTO: ERROR
        ================================== */

        radioPlayer.addEventListener(
            "error",
            () => {

                if (status) {

                    status.textContent =
                        "SIN SEÑAL";

                }


                if (systemMessage) {

                    systemMessage.textContent =
                        "TRANSMISIÓN NO DISPONIBLE";

                }


                console.error(
                    "No fue posible reproducir la transmisión."
                );

            }
        );

    }


    /* =====================================
       VÚMETROS VISUALES
    ====================================== */

    function startVisualMeters() {

        if (
            !vuLeft ||
            !vuRight
        ) {

            return;

        }


        function animateMeters() {

            if (
                radioPlayer.paused
            ) {

                return;

            }


            const leftLevel =
                20 +
                Math.random() *
                75;


            const rightLevel =
                20 +
                Math.random() *
                75;


            vuLeft.style.height =
                leftLevel +
                "%";


            vuRight.style.height =
                rightLevel +
                "%";


            setTimeout(
                animateMeters,
                100
            );

        }


        animateMeters();

    }


    /* =====================================
       INICIAR ESTADO
    ====================================== */

    setStandbyState();


});

