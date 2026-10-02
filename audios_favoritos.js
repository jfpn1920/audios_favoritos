//------------------------------------//
//--|funcionalidad_audios_favoritos|--//
//------------------------------------//
const audios = document.querySelectorAll(".audio");
const botonRestablecer = document.getElementById("boton_restablecer");
const mensajeGeneral = document.getElementById("mensaje_general");
const datosIniciales = {
    1: {
        titulo: "Mi canción favorita",
        artista: "Artista 1",
        categoria: "Música",
        audio: ""
    },
    2: {
        titulo: "Podcast favorito",
        artista: "Creador 2",
        categoria: "Podcast",
        audio: ""
    },
    3: {
        titulo: "Audio relajante",
        artista: "Artista 3",
        categoria: "Relajación",
        audio: ""
    }
};
//----------------------------------------//
//--|obtener_los_datos_con_localstorage|--//
//----------------------------------------//
function obtenerDatos(id) {
    const datosGuardados = localStorage.getItem(`audio_favorito_${id}`);
    if (datosGuardados) {
        return JSON.parse(datosGuardados);
    }
    return datosIniciales[id];
}
//-----------------------//
//--|mostrar_los_datos|--//
//-----------------------//
function mostrarDatos(audio) {
    const id = audio.dataset.id;
    const datos = obtenerDatos(id);
    const campoTitulo = audio.querySelector(".campo_titulo");
    const campoArtista = audio.querySelector(".campo_artista");
    const campoCategoria = audio.querySelector(".campo_categoria");
    const reproductor = audio.querySelector(".reproductor");
    campoTitulo.value = datos.titulo;
    campoArtista.value = datos.artista;
    campoCategoria.value = datos.categoria;
    audio.querySelector(".titulo_audio").textContent = datos.titulo;
    if (datos.audio) {
        reproductor.src = datos.audio;
        reproductor.load();
    } else {
        reproductor.removeAttribute("src");
        reproductor.load();
    }
}
//----------------------------//
//--|seleccionar_archivo|-----//
//----------------------------//
function seleccionarArchivo(audio) {
    const campoAudio = audio.querySelector(".campo_audio");
    const reproductor = audio.querySelector(".reproductor");
    campoAudio.addEventListener("change", () => {
        const archivo = campoAudio.files[0];
        if (!archivo) {
            return;
        }
        if (!archivo.type.startsWith("audio/")) {
            mostrarMensaje(audio, "Selecciona un archivo de audio válido.");
            campoAudio.value = "";
            return;
        }
        const urlAudio = URL.createObjectURL(archivo);
        reproductor.src = urlAudio;
        reproductor.load();
        mostrarMensaje(audio, `Audio seleccionado: ${archivo.name}`);
    });
}
//---------------------------------------------------//
//--|guardar_y_restaurar_datos_usando_localstorage|--//
//---------------------------------------------------//
function guardarDatos(audio) {
    const id = audio.dataset.id;
    const campoTitulo = audio.querySelector(".campo_titulo");
    const campoArtista = audio.querySelector(".campo_artista");
    const campoCategoria = audio.querySelector(".campo_categoria");
    const campoAudio = audio.querySelector(".campo_audio");
    const reproductor = audio.querySelector(".reproductor");
    const titulo = campoTitulo.value;
    const artista = campoArtista.value;
    const categoria = campoCategoria.value;
    const archivo = campoAudio.files[0];
    let datosGuardados = obtenerDatos(id);
    if (archivo) {
        const urlAudio = URL.createObjectURL(archivo);
        reproductor.src = urlAudio;
        reproductor.load();
        datosGuardados.audio = urlAudio;
        datosGuardados.nombreArchivo = archivo.name;
    }
    datosGuardados.titulo = titulo;
    datosGuardados.artista = artista;
    datosGuardados.categoria = categoria;
    localStorage.setItem(`audio_favorito_${id}`, JSON.stringify(datosGuardados));
    audio.querySelector(".titulo_audio").textContent = titulo;
    mostrarMensaje(audio, "Audio guardado correctamente.");
}
function restaurarDatos(audio) {
    const id = audio.dataset.id;
    localStorage.removeItem(`audio_favorito_${id}`);
    localStorage.removeItem(`posicion_audio_${id}`);
    const campoAudio = audio.querySelector(".campo_audio");
    campoAudio.value = "";
    mostrarDatos(audio);
    mostrarMensaje(audio, "Información restaurada.");
}
//-------------------------//
//--|mostrar_los_mensaje|--//
//-------------------------//
function mostrarMensaje(audio, texto) {
    const mensaje = audio.querySelector(".mensaje_audio");
    mensaje.textContent = texto;
    setTimeout(() => {
        mensaje.textContent = "";
    }, 3000);
}
//----------------------------------------------------------//
//--|guardar_y_restaurar_las_posicion_usando_localstorage|--//
//----------------------------------------------------------//
function guardarPosicion(audio) {
    const id = audio.dataset.id;
    const reproductor = audio.querySelector(".reproductor");
    if (!reproductor.src) {
        return;
    }
    localStorage.setItem(`posicion_audio_${id}`, reproductor.currentTime);
}
function restaurarPosicion(audio) {
    const id = audio.dataset.id;
    const posicion = localStorage.getItem(`posicion_audio_${id}`);
    const reproductor = audio.querySelector(".reproductor");
    if (!posicion) {
        return;
    }
    reproductor.addEventListener(
        "loadedmetadata",() => {
            reproductor.currentTime = Number(posicion);
        },
        { once: true }
    );
}
//----------------------------------------//
//--|restablecer_todos_con_localstorage|--//
//----------------------------------------//
function restablecerTodos() {
    const confirmacion = confirm("¿Deseas restablecer todos los audios?");
    if (!confirmacion) {
        return;
    }
    audios.forEach((audio) => {
        const id = audio.dataset.id;
        localStorage.removeItem(`audio_favorito_${id}`);
        localStorage.removeItem(`posicion_audio_${id}`);
        audio.querySelector(".campo_audio").value = "";
        mostrarDatos(audio);
    });
    mensajeGeneral.textContent = "Todos los audios fueron restablecidos.";
    setTimeout(() => {
        mensajeGeneral.textContent = "";
    }, 2000);
}
//---------------------------//
//--|eventos_de_los_audios|--//
//---------------------------//
audios.forEach((audio) => {
    const botonGuardar = audio.querySelector(".boton_guardar");
    const botonRestaurar = audio.querySelector(".boton_restaurar");
    const reproductor = audio.querySelector(".reproductor");
    seleccionarArchivo(audio);
    botonGuardar.addEventListener("click", () => {
        guardarDatos(audio);
    });
    botonRestaurar.addEventListener("click", () => {
        restaurarDatos(audio);
    });
    reproductor.addEventListener("timeupdate", () => {
        guardarPosicion(audio);
    });
    restaurarPosicion(audio);
});
//-----------------------------------------//
//--|evento_restablecer_todos_a_un_click|--//
//-----------------------------------------//
botonRestablecer.addEventListener("click", restablecerTodos);
//------------------------//
//--|cargando_los_datos|--//
//------------------------//
function cargarDatos() {
    audios.forEach((audio) => {
        mostrarDatos(audio);
        restaurarPosicion(audio);
    });
}
cargarDatos();