/* =========================================
   HANGAR PLAY RADIO v2.0
   SISTEMA DE REPRODUCCIÓN
========================================= */


document.addEventListener("DOMContentLoaded", () => {


    const playButton = document.getElementById("playButton");

    const status = document.getElementById("status");

    const radioPlayer = document.getElementById("radioPlayer");



    /*
       URL DEL STREAMING

       Aquí colocaremos la dirección
       definitiva de Zeno cuando hagamos
       la conexión final.
    */


    const streamURL = "";



    if (radioPlayer) {

        radioPlayer.src = streamURL;

    }




    /*
       BOTÓN PRINCIPAL
    */


    if (playButton) {


        playButton.addEventListener("click", () => {



            if (radioPlayer.paused) {


                radioPlayer.play();



                playButton.innerHTML =
                "⏸ DETENER TRANSMISIÓN";



                if (status) {

                    status.innerHTML =
                    "ONLINE";

                }



            } else {


                radioPlayer.pause();



                playButton.innerHTML =
                "▶ ESCUCHAR EN VIVO";



                if (status) {

                    status.innerHTML =
                    "READY";

                }


            }



        });


    }



});

/* =========================================
   SISTEMA DE CABINA
   SECUENCIA DE ENCENDIDO
========================================= */


const systemMessage = document.querySelector(".radio-status");



function systemOnline() {


    if (systemMessage) {


        systemMessage.innerHTML =
        "CONECTANDO TRANSMISIÓN...";



        setTimeout(() => {


            systemMessage.innerHTML =
            "HANGAR PLAY RADIO ONLINE";


        }, 2000);



        setTimeout(() => {


            systemMessage.innerHTML =
            "TRANSMITIENDO EN VIVO";


        }, 4000);



    }



}



/*
   ACTIVAR MENSAJE AL INICIAR
*/


const startButton =
document.getElementById("playButton");



if (startButton) {


    startButton.addEventListener(
        "click",
        systemOnline
    );


}

/* =========================================
   CONTROL DE ERRORES Y ESTADO DEL AUDIO
========================================= */


if (radioPlayer) {


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



    radioPlayer.addEventListener(
        "playing",
        () => {


            if (status) {

                status.innerHTML =
                "ONLINE";

            }


            if (systemMessage) {

                systemMessage.innerHTML =
                "TRANSMITIENDO EN VIVO";

            }


        }
    );



    radioPlayer.addEventListener(
        "pause",
        () => {


            if (status) {

                status.innerHTML =
                "READY";

            }


        }
    );



}
