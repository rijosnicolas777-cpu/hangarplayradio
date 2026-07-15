/*
HANGAR PLAY RADIO ONLINE
Sistema de control de cabina
reproductor.js
*/


// ELEMENTOS PRINCIPALES

const player = document.getElementById("radioPlayer");

const playButton = document.getElementById("playButton");

const stopButton = document.getElementById("stopButton");

const volumeSlider = document.getElementById("volumeSlider");

const powerButton = document.getElementById("powerButton");

const liveIndicator = document.getElementById("liveIndicator");

const systemMessage = document.getElementById("systemMessage");

const needleOne = document.getElementById("needleOne");

const needleTwo = document.getElementById("needleTwo");



let systemActive = false;



// VOLUMEN INICIAL

player.volume = 0.7;



// ENCENDIDO DE CABINA


powerButton.addEventListener("click", function(){


    systemActive = !systemActive;



    if(systemActive){


        powerButton.innerHTML = "SISTEMA ACTIVO";


        liveIndicator.classList.remove("offline");

        liveIndicator.classList.add("online");


        liveIndicator.innerHTML = "EN VIVO";


        systemMessage.innerHTML =
        "SISTEMAS ONLINE - TRANSMISIÓN PREPARADA";


    }else{


        powerButton.innerHTML = "A BORDO";


        liveIndicator.classList.remove("online");

        liveIndicator.classList.add("offline");


        liveIndicator.innerHTML = "OFFLINE";


        systemMessage.innerHTML =
        "SISTEMA EN ESPERA";


    }


});




// BOTÓN PLAY


playButton.addEventListener("click", function(){


    if(systemActive){


        player.play();


        systemMessage.innerHTML =
        "RECEPCIÓN DE SEÑAL ACTIVA";


    }else{


        systemMessage.innerHTML =
        "ACTIVE EL SISTEMA A BORDO";


    }


});




// BOTÓN STOP


stopButton.addEventListener("click", function(){


    player.pause();


    systemMessage.innerHTML =
    "TRANSMISIÓN EN PAUSA";


});




// CONTROL DE VOLUMEN


volumeSlider.addEventListener("input", function(){


    player.volume = this.value / 100;


});
//////////////////////////////////////////////////
// INSTRUMENTOS DE CABINA
//////////////////////////////////////////////////


function moveInstruments(){


    if(systemActive){


        let audioMovement =
        Math.floor(Math.random() * 70) - 35;


        let signalMovement =
        Math.floor(Math.random() * 90) - 45;



        needleOne.style.transform =
        "rotate(" + audioMovement + "deg)";


        needleTwo.style.transform =
        "rotate(" + signalMovement + "deg)";


    }


}



setInterval(moveInstruments,800);





//////////////////////////////////////////////////
// ESTADO DEL REPRODUCTOR
//////////////////////////////////////////////////


player.addEventListener("play",function(){


    if(systemActive){


        liveIndicator.innerHTML =
        "TRANSMITIENDO";


        systemMessage.innerHTML =
        "HANGAR PLAY RADIO ONLINE - AL AIRE";


    }


});



player.addEventListener("pause",function(){


    if(systemActive){


        liveIndicator.innerHTML =
        "EN ESPERA";


        systemMessage.innerHTML =
        "SEÑAL DETENIDA";


    }


});





//////////////////////////////////////////////////
// PROTECCIÓN DE CARGA
//////////////////////////////////////////////////


window.addEventListener("load",function(){


    systemMessage.innerHTML =
    "CABINA LISTA - ESPERANDO AUTORIZACIÓN";


});
//////////////////////////////////////////////////
// SECUENCIA DE INICIO DE CABINA
//////////////////////////////////////////////////


function cabinStartup(){


    systemMessage.innerHTML =
    "INICIALIZANDO SISTEMAS DE HANGAR PLAY...";


    setTimeout(function(){


        systemMessage.innerHTML =
        "SISTEMA DE AUDIO DISPONIBLE";


    },2000);



    setTimeout(function(){


        systemMessage.innerHTML =
        "LISTO PARA TRANSMISIÓN";


    },4000);



}



//////////////////////////////////////////////////
// INICIO AUTOMÁTICO DE INTERFAZ
//////////////////////////////////////////////////


cabinStartup();





//////////////////////////////////////////////////
// CONTROL DE TECLADO
//////////////////////////////////////////////////


document.addEventListener("keydown",function(event){


    if(event.code === "Space"){


        if(systemActive){


            player.paused ?
            player.play() :
            player.pause();


        }


    }


});
