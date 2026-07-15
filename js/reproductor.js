/* =========================================
   HANGAR PLAY RADIO
   SISTEMA DE CABINA + STREAMING ZENO
========================================= */


document.addEventListener("DOMContentLoaded", () => {


    const loader = document.getElementById("loader");

    const playButton = document.getElementById("playButton");

    const radioPlayer = document.getElementById("radioPlayer");

    const status = document.getElementById("status");

    const systemMessage = document.querySelector(".radio-status");



    /*
       STREAMING OFICIAL ZENO
    */


    const streamURL = "https://stream.zeno.fm/1fv4rwglthgtv";



    if (radioPlayer) {

        radioPlayer.src = streamURL;

    }




    /*
       APAGADO DE PANTALLA DE INICIO
    */


    setTimeout(() => {


        if (loader) {


            loader.style.opacity = "0";


            setTimeout(() => {


                loader.style.display = "none";


            }, 800);


        }


    }, 3000);






    /*
       BOTÓN ESCUCHAR
    */


    if (playButton && radioPlayer) {


        playButton.addEventListener("click", () => {



            if (radioPlayer.paused) {



                radioPlayer.play();



                playButton.innerHTML =
                "⏸ DETENER TRANSMISIÓN";



                if (status) {

                    status.innerHTML =
                    "ONLINE";

                }



                if (systemMessage) {

                    systemMessage.innerHTML =
                    "TRANSMITIENDO EN VIVO";

                }



            } else {



                radioPlayer.pause();



                playButton.innerHTML =
                "▶ ESCUCHAR EN VIVO";



                if (status) {

                    status.innerHTML =
                    "READY";

                }



                if (systemMessage) {

                    systemMessage.innerHTML =
                    "SISTEMA EN ESPERA";

                }


            }



        });



    }





    /*
       ESTADOS DEL AUDIO
    */


    if (radioPlayer) {



        radioPlayer.addEventListener(
            "playing",
            () => {


                if (status) {

                    status.innerHTML =
                    "ONLINE";

                }


            }
        );




        radioPlayer.addEventListener(
            "error",
            () => {


                if (status) {

                    status.innerHTML =
                    "SIN SEÑAL";

                }


                if (systemMessage) {

                    systemMessage.innerHTML =
                    "ERROR DE TRANSMISIÓN";

                }


            }
        );



    }



});
