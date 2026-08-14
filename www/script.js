// ========================================
// VOLCEX - SCRIPT PRINCIPALE
// ========================================


// ========================================
// VARIABILI
// ========================================

let giocatori = [];

let obiettivo = 0;

let turno = 0;

let primoTurno = true;

let ordineTurno = [];

let distanze = [];

let storicoPartite =
    JSON.parse(localStorage.getItem("storicoVolcex")) || [];

let storicoIntercetti =
    JSON.parse(localStorage.getItem("intercettiVolcex")) || [];


// ========================================
// NAVIGAZIONE
// ========================================

function mostra(id) {

    let schermate =
        document.querySelectorAll(".schermata");

    schermate.forEach(s => {
        s.classList.add("nascosta");
    });

    let schermata =
        document.getElementById(id);

    if (schermata) {
        schermata.classList.remove("nascosta");
    }
}


// ========================================
// SCELTA NUMERO GIOCATORI
// ========================================

function iniziaGiocatori() {

    let numero =
        parseInt(
            document.getElementById("numeroGiocatori").value
        );

    if (isNaN(numero) || numero < 1 || numero > 11) {

        alert("Inserisci un numero di giocatori da 1 a 11.");

        return;
    }


    // Determina obiettivo

    if (numero <= 5) {

        obiettivo = 31;

    } else if (numero <= 8) {

        obiettivo = 41;

    } else {

        obiettivo = 51;
    }


    // Mostra schermata nomi

    mostra("nomi");


    let spazio =
        document.getElementById("listaNomi");

    spazio.innerHTML = "";


    for (let i = 1; i <= numero; i++) {

        spazio.innerHTML += `

            <div class="scheda">

                <strong>Giocatore ${i}</strong>

                <br>

                <input
                    id="nome${i}"
                    placeholder="Nome"
                    maxlength="30"
                >

            </div>

        `;
    }
}


// ========================================
// CREAZIONE PARTITA
// ========================================

function iniziaPartita() {

    let input =
        document.querySelectorAll(
            "#listaNomi input"
        );


    giocatori = [];


    input.forEach((elemento, index) => {

        let nome =
            elemento.value.trim();


        if (nome === "") {

            nome =
                "Giocatore " + (index + 1);
        }


        giocatori.push({

            id: index,

            nome: nome,

            punti: 0,

            metriTotali: 0,

            ultimoTiro: 0,

            bonusTurno: 0,

            // Posizione nella classifica
            // del turno precedente
            posizionePrecedente: index

        });

    });


    turno = 0;

    primoTurno = true;

    ordineTurno = [];

    distanze = [];


    mostra("partita");


    document.getElementById("obiettivo").innerHTML =
        "Obiettivo: " + obiettivo + " punti";


    iniziaTurno();
}


// ========================================
// INIZIO TURNO
// ========================================

function iniziaTurno() {

    turno++;

    distanze = [];


    // Azzera bonus del turno precedente

    giocatori.forEach(g => {

        g.bonusTurno = 0;

    });


    // ====================================
    // PRIMO TURNO
    // RANDOM
    // ====================================

    if (primoTurno) {

        ordineTurno = [...giocatori];


        // Fisher-Yates shuffle
        for (
            let i = ordineTurno.length - 1;
            i > 0;
            i--
        ) {

            let j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                ordineTurno[i],
                ordineTurno[j]
            ] =
            [
                ordineTurno[j],
                ordineTurno[i]
            ];
        }


        primoTurno = false;

    }


    // ====================================
    // TURNI SUCCESSIVI
    // PUNTEGGIO CRESCENTE
    // ====================================

    else {

        ordineTurno = [...giocatori];


        ordineTurno.sort((a, b) => {

            // Prima il punteggio più basso

            if (a.punti !== b.punti) {

                return a.punti - b.punti;
            }


            // Se pari:
            // posizione precedente

            return (
                a.posizionePrecedente -
                b.posizionePrecedente
            );

        });
    }


    mostraTurno();
}


// ========================================
// MOSTRA TURNO
// ========================================

function mostraTurno() {

    let lista =
        document.getElementById(
            "listaGiocatori"
        );


    lista.innerHTML = `

        <h2>Turno ${turno}</h2>

        <p>
            Ordine di tiro
        </p>

    `;


    ordineTurno.forEach(g => {

        lista.innerHTML += `

            <div class="scheda">

                <h3>
                    ${g.nome} (${g.punti})
                </h3>

                <p>
                    Distanza dal bersaglio:
                </p>

                <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="dist${g.id}"
                    placeholder="Metri"
                >

                <br><br>

                <button
                    onclick="aggiungiBonus(${g.id}, 2)"
                >
                    +2
                </button>

                <button
                    onclick="aggiungiBonus(${g.id}, 5)"
                >
                    +5
                </button>

                <button
                    onclick="aggiungiBonus(${g.id}, -10)"
                >
                    -10
                </button>

                <button
                    onclick="intercetto(${g.id})"
                >
                    INTERCETTO
                </button>

                <p id="bonus${g.id}">
                    Bonus: 0
                </p>

            </div>

        `;
    });


    lista.innerHTML += `

        <button onclick="calcolaTurno()">
            CALCOLA PUNTI
        </button>

    `;
}


// ========================================
// BONUS
// ========================================

function aggiungiBonus(id, valore) {

    let g =
        giocatori.find(
            x => x.id === id
        );


    if (!g) {
        return;
    }


    g.bonusTurno += valore;


    let elemento =
        document.getElementById(
            "bonus" + id
        );


    if (elemento) {

        elemento.innerHTML =
            "Bonus: " + g.bonusTurno;
    }
}


// ========================================
// INTERCETTO
// ========================================

function intercetto(id) {

    let giocatore =
        giocatori.find(
            g => g.id === id
        );


    if (!giocatore) {
        return;
    }


    let record =
        storicoIntercetti.find(
            x => x.nome === giocatore.nome
        );


    if (record) {

        record.numero++;

    } else {

        storicoIntercetti.push({

            nome: giocatore.nome,

            numero: 1

        });
    }


    localStorage.setItem(
        "intercettiVolcex",
        JSON.stringify(
            storicoIntercetti
        )
    );


    alert(
        giocatore.nome +
        " ha effettuato un intercetto!"
    );
}


// ========================================
// CALCOLO TURNO
// ========================================

function calcolaTurno() {

    distanze = [];


    // ====================================
    // LEGGE LE DISTANZE
    // ====================================

    for (let g of ordineTurno) {

        let campo =
            document.getElementById(
                "dist" + g.id
            );


        let metri =
            parseFloat(campo.value);


        if (
            isNaN(metri) ||
            metri < 0
        ) {

            alert(
                "Inserisci una distanza valida per " +
                g.nome
            );

            return;
        }


        distanze.push({

            giocatore: g,

            metri: metri

        });
    }


    // ====================================
    // SALVA METRI
    // ====================================

    distanze.forEach(d => {

        d.giocatore.metriTotali +=
            d.metri;

        d.giocatore.ultimoTiro =
            d.metri;

    });


    // ====================================
    // ORDINE PUNTI
    //
    // Più lontano = 1 punto
    // Poi +1 fino al più vicino
    // ====================================

    distanze.sort((a, b) => {

        return b.metri - a.metri;

    });


    let punti = 1;


    distanze.forEach(d => {

        d.giocatore.punti += punti;


        // Bonus +2 / +5 / -10

        d.giocatore.punti +=
            d.giocatore.bonusTurno;


        punti++;

    });


    // ====================================
    // AGGIORNA CLASSIFICA
    // ====================================

    aggiornaClassifica();
}


// ========================================
// AGGIORNA CLASSIFICA
// ========================================

function aggiornaClassifica() {

    // IMPORTANTE:
    // prima salvo la classifica precedente

    let classificaPrecedente =
        [...giocatori];


    classificaPrecedente.sort((a, b) => {

        if (a.punti !== b.punti) {

            return b.punti - a.punti;
        }


        return (
            a.posizionePrecedente -
            b.posizionePrecedente
        );

    });


    // Salvo la posizione precedente
    // per ogni giocatore

    classificaPrecedente.forEach(
        (g, index) => {

            let giocatore =
                giocatori.find(
                    x => x.id === g.id
                );

            if (giocatore) {

                giocatore.posizionePrecedente =
                    index;
            }
        }
    );


    // Ora creo la nuova classifica

    giocatori.sort((a, b) => {

        if (a.punti !== b.punti) {

            return b.punti - a.punti;
        }


        return (
            a.posizionePrecedente -
            b.posizionePrecedente
        );

    });


    controllaVittoria();
}


// ========================================
// CLASSIFICA DURANTE LA PARTITA
// ========================================

function mostraClassifica() {

    let lista =
        document.getElementById(
            "listaGiocatori"
        );


    lista.innerHTML = `

        <h2>CLASSIFICA</h2>

        <p>
            Dopo il turno ${turno}
        </p>

    `;


    giocatori.forEach((g, index) => {

        lista.innerHTML += `

            <div class="scheda">

                <h3>
                    ${index + 1}) ${g.nome}
                </h3>

                <p>
                    Punti: ${g.punti}
                </p>

                <p>
                    Metri totali:
                    ${g.metriTotali.toFixed(2)} m
                </p>

                <p>
                    Ultimo tiro:
                    ${g.ultimoTiro.toFixed(2)} m
                </p>

            </div>

        `;
    });


    lista.innerHTML += `

        <button onclick="iniziaTurno()">
            NUOVO TURNO
        </button>

    `;
}


// ========================================
// CONTROLLO VITTORIA
// ========================================

function controllaVittoria() {

    let vincitori =
        giocatori.filter(
            g => g.punti >= obiettivo
        );


    // Nessuno ha raggiunto l'obiettivo

    if (vincitori.length === 0) {

        mostraClassifica();

        return;
    }


    // ====================================
    // PIÙ GIOCATORI POSSONO SUPERARE
    // L'OBIETTIVO NELLO STESSO TURNO
    //
    // Vince chi ha più punti DOPO
    // l'ultimo turno.
    //
    // Solo se hanno lo stesso punteggio:
    // meno metri totali.
    // ====================================

    vincitori.sort((a, b) => {

        if (a.punti !== b.punti) {

            return b.punti - a.punti;
        }


        return (
            a.metriTotali -
            b.metriTotali
        );

    });


    let vincitore =
        vincitori[0];


    finePartita(vincitore);
}


// ========================================
// FINE PARTITA
// ========================================

function finePartita(vincitore) {

    salvaPartita();


    let partita =
        document.getElementById(
            "partita"
        );


    partita.innerHTML = `

        <div class="vittoria">

            <h1>🏆 VOLCEX 🏆</h1>

            <h2>
                ${vincitore.nome}
            </h2>

            <h3>
                Vincitore:
                ${vincitore.punti} punti
            </h3>

            <br>

            🎆🎆🎆

            <br><br>

            <button
                onclick="mostraClassificaFinale()"
            >
                CLASSIFICA FINALE
            </button>

        </div>

    `;
}


// ========================================
// SALVATAGGIO PARTITA
// ========================================

function salvaPartita() {

    // Copia della classifica

    let classificaFinale =
        [...giocatori];


    classificaFinale.sort((a, b) => {

        if (a.punti !== b.punti) {

            return b.punti - a.punti;
        }


        return (
            a.metriTotali -
            b.metriTotali
        );

    });


    // ====================================
    // SALVA TUTTI I TIRI
    // ====================================

    let tuttiTiri = [];


    giocatori.forEach(g => {

        tuttiTiri.push({

            nome: g.nome,

            metri: g.ultimoTiro,

            data:
                new Date()
                    .toLocaleDateString("it-IT")

        });

    });


    // ====================================
    // PARTITA
    // ====================================

    let partita = {

        data:
            new Date()
                .toLocaleDateString("it-IT"),

        obiettivo: obiettivo,

        vincitore:
            classificaFinale[0]?.nome || "",

        podio: [

            classificaFinale[0]?.nome || "",

            classificaFinale[1]?.nome || "",

            classificaFinale[2]?.nome || ""

        ],

        giocatori:
            classificaFinale.map(g => ({

                nome: g.nome,

                punti: g.punti,

                metriTotali:
                    g.metriTotali,

                ultimoTiro:
                    g.ultimoTiro

            })),

        tiri: tuttiTiri

    };


    storicoPartite.push(
        partita
    );


    localStorage.setItem(

        "storicoVolcex",

        JSON.stringify(
            storicoPartite
        )
    );
}


// ========================================
// CLASSIFICA FINALE
// ========================================

function mostraClassificaFinale() {

    let box =
        document.getElementById(
            "partita"
        );


    box.innerHTML =
        "<h1>CLASSIFICA FINALE</h1>";


    giocatori.forEach((g, index) => {

        box.innerHTML += `

            <div class="scheda">

                <h3>
                    ${index + 1}) ${g.nome}
                </h3>

                <p>
                    Punti:
                    ${g.punti}
                </p>

                <p>
                    Metri totali:
                    ${g.metriTotali.toFixed(2)} m
                </p>

                <p>
                    Ultimo tiro:
                    ${g.ultimoTiro.toFixed(2)} m
                </p>

            </div>

        `;
    });


    box.innerHTML += `

        <button onclick="mostra('home')">
            🏠 HOME
        </button>

    `;
}


// ========================================
// PALMARES
// ========================================

function mostraPalmares() {

    mostra("palmares");


    let box =
        document.getElementById(
            "contenutoPalmares"
        );


    box.innerHTML = "";


    if (storicoPartite.length === 0) {

        box.innerHTML =
            "<p>Nessuna partita salvata.</p>";

        return;
    }


    storicoPartite.forEach(
        (partita, index) => {

            box.innerHTML += `

                <div class="scheda">

                    <h3>
                        Partita ${index + 1}
                    </h3>

                    <p>
                        Data: ${partita.data}
                    </p>

                    <p>
                        🥇
                        ${partita.podio[0] || "-"}
                    </p>

                    <p>
                        🥈
                        ${partita.podio[1] || "-"}
                    </p>

                    <p>
                        🥉
                        ${partita.podio[2] || "-"}
                    </p>

                </div>

            `;
        }
    );
}


// ========================================
// GUINNESS
// ========================================

function mostraGuinness() {

    mostra("guinness");


    let box =
        document.getElementById(
            "contenutoGuinness"
        );


    box.innerHTML = "";


    if (storicoPartite.length === 0) {

        box.innerHTML =
            "<p>Nessun tiro registrato.</p>";

        return;
    }


    // ====================================
    // RACCOLTA TIRI
    // ====================================

    let tuttiTiri = [];


    storicoPartite.forEach(partita => {

        if (partita.giocatori) {

            partita.giocatori.forEach(g => {

                tuttiTiri.push({

                    nome: g.nome,

                    metri:
                        g.ultimoTiro,

                    data:
                        partita.data

                });

            });

        }

    });


    if (tuttiTiri.length === 0) {

        box.innerHTML =
            "<p>Nessun tiro registrato.</p>";

        return;
    }


    // ====================================
    // MIGLIOR TIRO
    // più vicino = metri minori
    // ====================================

    let miglior =
        [...tuttiTiri].sort(
            (a, b) =>
                a.metri - b.metri
        )[0];


    // ====================================
    // PEGGIOR TIRO
    // più lontano = metri maggiori
    // ====================================

    let peggior =
        [...tuttiTiri].sort(
            (a, b) =>
                b.metri - a.metri
        )[0];


    box.innerHTML = `

        <div class="scheda">

            <h2>
                🎯 MIGLIOR TIRO DI SEMPRE
            </h2>

            <h3>
                ${miglior.nome}
            </h3>

            <p>
                ${miglior.metri.toFixed(2)} m
            </p>

            <p>
                Data: ${miglior.data}
            </p>

        </div>


        <div class="scheda">

            <h2>
                💀 PEGGIOR TIRO DI SEMPRE
            </h2>

            <h3>
                ${peggior.nome}
            </h3>

            <p>
                ${peggior.metri.toFixed(2)} m
            </p>

            <p>
                Data: ${peggior.data}
            </p>

        </div>

    `;
}


// ========================================
// CLASSIFICA INTERCETTI
// ========================================

function mostraIntercetti() {

    mostra("intercetti");


    let box =
        document.getElementById(
            "contenutoIntercetti"
        );


    box.innerHTML = "";


    if (
        storicoIntercetti.length === 0
    ) {

        box.innerHTML =
            "<p>Nessun intercetto registrato.</p>";

        return;
    }


    // Ordina dal maggior numero
    // di intercetti al minore

    let classifica =
        [...storicoIntercetti].sort(
            (a, b) =>
                b.numero - a.numero
        );


    classifica.forEach(
        (g, index) => {

            box.innerHTML += `

                <div class="scheda">

                    <h3>
                        ${index + 1})
                        ${g.nome}
                    </h3>

                    <p>
                        🛡
                        ${g.numero}
                        intercetti
                    </p>

                </div>

            `;
        }
    );
}


// ========================================
// AVVIO
// ========================================

// All'apertura mostra Home

document.addEventListener(
    "DOMContentLoaded",
    function () {

        mostra("home");

    }
);
