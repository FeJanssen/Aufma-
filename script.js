// =============================================
// ELEMENTE
// =============================================

const hubInput =
    document.getElementById("hub");

const holzartInput =
    document.getElementById("holzart");

const qualitaetInput =
    document.getElementById("qualitaet");

const staerkeInput =
    document.getElementById("staerke");

const laengeInput =
    document.getElementById("laenge");

const breiteInput =
    document.getElementById("breite");


const labelHub =
    document.getElementById("labelHub");

const labelHolzart =
    document.getElementById("labelHolzart");

const labelQualitaet =
    document.getElementById("labelQualitaet");

const labelDimensions =
    document.getElementById("labelDimensions");


const generateBtn =
    document.getElementById("generateBtn");

const printBtn =
    document.getElementById("printBtn");

const nextBtn =
    document.getElementById("nextBtn");


const currentId =
    document.getElementById("currentId");

const barcodeValueDisplay =
    document.getElementById(
        "barcodeValueDisplay"
    );

const message =
    document.getElementById("message");


// =============================================
// HOLZ-ID LADEN
// =============================================

let holzId =
    parseInt(
        localStorage.getItem("holzId"),
        10
    );


if (
    !Number.isInteger(holzId) ||
    holzId < 1
) {

    holzId = 1;
}


// =============================================
// HILFSFUNKTIONEN
// =============================================

function padNumber(value, length) {

    return String(value)
        .padStart(length, "0");
}


function normalizeDecimal(value) {

    return String(value)
        .replace(",", ".");
}


function formatDecimal(value) {

    return String(value)
        .replace(".", ",");
}


function showError(text) {

    message.textContent =
        text;

    message.className =
        "message error";
}


function clearMessage() {

    message.textContent =
        "";

    message.className =
        "message";
}


// =============================================
// DATEN ERZEUGEN
// =============================================

function buildLabelData() {

    clearMessage();


    const hub =
        hubInput.value.trim();


    const holzart =
        holzartInput.value
            .trim()
            .toUpperCase();


    const qualitaet =
        qualitaetInput.value
            .trim()
            .toUpperCase();


    const staerkeText =
        staerkeInput.value.trim();


    const laengeText =
        normalizeDecimal(
            laengeInput.value.trim()
        );


    const breiteText =
        breiteInput.value.trim();


    // =========================================
    // PRÜFEN
    // =========================================

    if (
        !hub ||
        !holzart ||
        !qualitaet ||
        !staerkeText ||
        !laengeText ||
        !breiteText
    ) {

        showError(
            "Bitte alle Felder ausfüllen."
        );

        return null;
    }


    const staerke =
        Number(staerkeText);


    const laenge =
        Number(laengeText);


    const breite =
        Number(breiteText);


    if (
        !Number.isFinite(staerke) ||
        staerke <= 0
    ) {

        showError(
            "Ungültige Stärke."
        );

        return null;
    }


    if (
        !Number.isFinite(laenge) ||
        laenge <= 0
    ) {

        showError(
            "Ungültige Länge."
        );

        return null;
    }


    if (
        !Number.isFinite(breite) ||
        breite <= 0
    ) {

        showError(
            "Ungültige Breite."
        );

        return null;
    }


    // =========================================
    // HOLZ-ID
    // =========================================

    const visibleWoodId =
        padNumber(
            holzId,
            2
        );


    const barcodeWoodId =
        padNumber(
            holzId,
            4
        );


    // =========================================
    // BARCODE-WERTE
    // =========================================

    const staerkeCode =
        padNumber(
            Math.round(staerke),
            3
        );


    /*
       Länge:

       3,6 m
       =>
       360 cm
    */

    const laengeInCm =
        Math.round(
            laenge * 100
        );


    const laengeCode =
        padNumber(
            laengeInCm,
            3
        );


    const breiteCode =
        padNumber(
            Math.round(breite),
            3
        );


    // =========================================
    // MATERIALCODE
    //
    // Holzart
    // Stärke
    // 0
    // Länge
    // 0
    // Breite
    // Qualität
    // =========================================

    const materialCode =

        holzart +

        staerkeCode +

        "0" +

        laengeCode +

        "0" +

        breiteCode +

        qualitaet;


    // =========================================
    // KOMPLETTER BARCODE
    //
    // Beispiel:
    //
    // 016982 NUA03205400310AB 0002SH
    // =========================================

    const barcodeValue =

        hub +

        " " +

        materialCode +

        " " +

        barcodeWoodId +

        "SH";


    // =========================================
    // SICHTBARE MAßE
    // =========================================

    const dimensions =

        staerke +

        "mm x " +

        formatDecimal(laenge) +

        "m x " +

        breite +

        "cm";


    return {

        hub: hub,

        visibleWoodId:
            visibleWoodId,

        hubId:
            hub +
            "-" +
            visibleWoodId,

        holzart:
            holzart,

        qualitaet:
            qualitaet,

        dimensions:
            dimensions,

        barcode:
            barcodeValue
    };
}


// =============================================
// ETIKETT / VORSCHAU ERZEUGEN
// =============================================

function createLabel() {

    const data =
        buildLabelData();


    if (!data) {

        return false;
    }


    // =========================================
    // ZEILE 1
    // =========================================

    labelHub.textContent =
        data.hubId;


    labelHolzart.textContent =
        data.holzart;


    // =========================================
    // ZEILE 2
    // =========================================

    labelQualitaet.textContent =
        data.qualitaet;


    labelDimensions.textContent =
        data.dimensions;


    // =========================================
    // ID ANZEIGE
    // =========================================

    currentId.textContent =
        data.visibleWoodId;


    // =========================================
    // BARCODE TEXT
    // =========================================

    barcodeValueDisplay.textContent =
        data.barcode;


    // =========================================
    // CODE 128
    // =========================================

    try {

        JsBarcode(
            "#barcode",
            data.barcode,
            {

                format:
                    "CODE128",

                /*
                   Breite der einzelnen
                   Barcode-Module.
                */

                width:
                    1.45,

                /*
                   Balkenhöhe.
                */

                height:
                    57,

                /*
                   Keine zusätzlichen
                   weißen JsBarcode-Ränder.
                */

                margin:
                    0,

                marginTop:
                    0,

                marginBottom:
                    0,

                marginLeft:
                    0,

                marginRight:
                    0,

                /*
                   Barcode-Inhalt darunter.
                */

                displayValue:
                    true,

                fontSize:
                    9,

                textMargin:
                    1
            }
        );

    } catch (error) {

        console.error(
            error
        );


        showError(
            "Barcode konnte nicht erstellt werden."
        );


        return false;
    }


    return true;
}


// =============================================
// HOLZ-ID SPEICHERN
// =============================================

function saveWoodId() {

    localStorage.setItem(
        "holzId",
        String(holzId)
    );


    currentId.textContent =
        padNumber(
            holzId,
            2
        );
}


// =============================================
// NÄCHSTE HOLZ-ID
// =============================================

function nextWoodId() {

    holzId++;


    saveWoodId();


    /*
       Nur aktualisieren, wenn bereits
       gültige Eingaben vorhanden sind.
    */

    if (
        hubInput.value &&
        holzartInput.value &&
        qualitaetInput.value &&
        staerkeInput.value &&
        laengeInput.value &&
        breiteInput.value
    ) {

        createLabel();
    }
}


// =============================================
// DRUCKEN
// =============================================

function printLabel() {

    const success =
        createLabel();


    if (!success) {

        return;
    }


    /*
       Browser bekommt jetzt ausschließlich
       unser 110 x 35 mm Print-CSS.
    */

    window.print();
}


// =============================================
// NACH DEM DRUCKDIALOG
// =============================================

window.addEventListener(
    "afterprint",
    function () {

        /*
           ACHTUNG:

           Browser können nicht erkennen,
           ob im Dialog tatsächlich
           "Drucken" oder "Abbrechen"
           gewählt wurde.

           Deshalb erhöhen wir hier NICHT
           automatisch die ID.

           Das verhindert übersprungene
           Holz-IDs bei Abbruch.
        */

    }
);


// =============================================
// GROSSBUCHSTABEN
// =============================================

holzartInput.addEventListener(
    "input",
    function () {

        this.value =
            this.value.toUpperCase();
    }
);


qualitaetInput.addEventListener(
    "input",
    function () {

        this.value =
            this.value.toUpperCase();
    }
);


// =============================================
// BUTTON EVENTS
// =============================================

generateBtn.addEventListener(
    "click",
    createLabel
);


printBtn.addEventListener(
    "click",
    printLabel
);


nextBtn.addEventListener(
    "click",
    nextWoodId
);


// =============================================
// START
// =============================================

currentId.textContent =
    padNumber(
        holzId,
        2
    );