// ========================================================
// KONFIGURATION
// ========================================================

// Toshiba TEC USB Vendor-ID
const TOSHIBA_VENDOR_ID = 0x08A6;

// 203 dpi = ca. 8 dots/mm
//
// Etikettenhöhe:
// 35 mm * 8 = 280 dots
//
// Maximale Druckbreite B-EX4T2:
// ca. 104 mm * 8 = 832 dots

const PRINT_WIDTH = 832;
const LABEL_HEIGHT = 280;


// ========================================================
// HTML ELEMENTE
// ========================================================

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


const connectBtn =
    document.getElementById("connectBtn");

const generateBtn =
    document.getElementById("generateBtn");

const printBtn =
    document.getElementById("printBtn");

const nextBtn =
    document.getElementById("nextBtn");


const printerStatus =
    document.getElementById("printerStatus");

const message =
    document.getElementById("message");

const currentId =
    document.getElementById("currentId");

const barcodeValueDisplay =
    document.getElementById("barcodeValueDisplay");


// ========================================================
// USB
// ========================================================

let usbDevice = null;

let usbInterfaceNumber = null;

let usbAlternateSetting = null;

let usbEndpointOut = null;


// ========================================================
// HOLZ-ID
// ========================================================

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


// ========================================================
// HILFSFUNKTIONEN
// ========================================================

function padNumber(value, length) {

    return String(value)
        .padStart(length, "0");
}


function normalizeNumber(value) {

    return String(value)
        .replace(",", ".");
}


function formatGermanNumber(value) {

    return String(value)
        .replace(".", ",");
}


function showMessage(text, type) {

    message.textContent = text;

    message.className =
        "message " + type;
}


function clearMessage() {

    message.textContent = "";

    message.className =
        "message";
}


// ========================================================
// ZPL SONDERZEICHEN VERHINDERN
// ========================================================

function safePrinterText(value) {

    return String(value)
        .replace(/\^/g, "")
        .replace(/~/g, "")
        .replace(/\r/g, "")
        .replace(/\n/g, "");
}


// ========================================================
// DATEN PRÜFEN UND AUFBAUEN
// ========================================================

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


    const staerke =
        staerkeInput.value.trim();


    const laengeText =
        normalizeNumber(
            laengeInput.value.trim()
        );


    const breite =
        breiteInput.value.trim();


    if (
        !hub ||
        !holzart ||
        !qualitaet ||
        !staerke ||
        !laengeText ||
        !breite
    ) {

        showMessage(
            "Bitte alle Felder ausfüllen.",
            "error"
        );

        return null;
    }


    const staerkeNumber =
        Number(staerke);


    const laengeNumber =
        Number(laengeText);


    const breiteNumber =
        Number(breite);


    if (
        !Number.isFinite(staerkeNumber) ||
        staerkeNumber <= 0
    ) {

        showMessage(
            "Bitte eine gültige Stärke eingeben.",
            "error"
        );

        return null;
    }


    if (
        !Number.isFinite(laengeNumber) ||
        laengeNumber <= 0
    ) {

        showMessage(
            "Bitte eine gültige Länge eingeben.",
            "error"
        );

        return null;
    }


    if (
        !Number.isFinite(breiteNumber) ||
        breiteNumber <= 0
    ) {

        showMessage(
            "Bitte eine gültige Breite eingeben.",
            "error"
        );

        return null;
    }


    // ----------------------------------------
    // SICHTBARE HOLZ-ID
    //
    // 1 -> 01
    // 47 -> 47
    // ----------------------------------------

    const sichtbareHolzId =
        padNumber(
            holzId,
            2
        );


    // ----------------------------------------
    // BARCODE HOLZ-ID
    //
    // 1 -> 0001
    // 47 -> 0047
    // ----------------------------------------

    const barcodeHolzId =
        padNumber(
            holzId,
            4
        );


    // ----------------------------------------
    // STÄRKE
    //
    // 40 -> 040
    // 32 -> 032
    // ----------------------------------------

    const staerkeCode =
        padNumber(
            Math.round(staerkeNumber),
            3
        );


    // ----------------------------------------
    // LÄNGE
    //
    // Eingabe:
    // 3.6 m
    //
    // Barcode:
    // 360
    // ----------------------------------------

    const laengeInCm =
        Math.round(
            laengeNumber * 100
        );


    const laengeCode =
        padNumber(
            laengeInCm,
            3
        );


    // ----------------------------------------
    // BREITE
    //
    // 33 -> 033
    // 310 -> 310
    // ----------------------------------------

    const breiteCode =
        padNumber(
            Math.round(breiteNumber),
            3
        );


    // ----------------------------------------
    // MATERIAL CODE
    //
    // Holzart
    // Stärke
    // 0
    // Länge
    // 0
    // Breite
    // Qualität
    //
    // Beispiel:
    //
    // NUA03205400310AB
    // ----------------------------------------

    const materialCode =

        holzart +

        staerkeCode +

        "0" +

        laengeCode +

        "0" +

        breiteCode +

        qualitaet;


    // ----------------------------------------
    // KOMPLETTER BARCODE
    //
    // Beispiel:
    //
    // 016982 NUA03205400310AB 0002SH
    // ----------------------------------------

    const barcodeValue =

        hub +

        " " +

        materialCode +

        " " +

        barcodeHolzId +

        "SH";


    // ----------------------------------------
    // SICHTBARE ZEILE 2
    //
    // AB     40mm x 3,6m x 33cm
    // ----------------------------------------

    const dimensions =

        staerkeNumber +

        "mm x " +

        formatGermanNumber(
            laengeNumber
        ) +

        "m x " +

        breiteNumber +

        "cm";


    return {

        hub:
            safePrinterText(hub),

        holzId:
            holzId,

        hubId:
            safePrinterText(
                hub +
                "-" +
                sichtbareHolzId
            ),

        sichtbareHolzId:
            sichtbareHolzId,

        holzart:
            safePrinterText(holzart),

        qualitaet:
            safePrinterText(qualitaet),

        dimensions:
            safePrinterText(dimensions),

        barcode:
            safePrinterText(barcodeValue)
    };
}


// ========================================================
// VORSCHAU ERZEUGEN
// ========================================================

function createLabel() {

    const data =
        buildLabelData();


    if (!data) {
        return false;
    }


    labelHub.textContent =
        data.hubId;


    labelHolzart.textContent =
        data.holzart;


    labelQualitaet.textContent =
        data.qualitaet;


    labelDimensions.textContent =
        data.dimensions;


    currentId.textContent =
        data.sichtbareHolzId;


    barcodeValueDisplay.textContent =
        data.barcode;


    try {

        JsBarcode(
            "#barcode",
            data.barcode,
            {
                format: "CODE128",

                width: 1.35,

                height: 54,

                margin: 0,

                displayValue: true,

                fontSize: 9,

                textMargin: 1
            }
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Barcode konnte nicht erstellt werden.",
            "error"
        );

        return false;
    }


    return true;
}


// ========================================================
// USB ENDPOINT SUCHEN
// ========================================================

function findPrinterEndpoint(device) {

    if (!device.configuration) {

        throw new Error(
            "Der Drucker besitzt keine aktive USB-Konfiguration."
        );
    }


    for (
        const usbInterface
        of device.configuration.interfaces
    ) {

        for (
            const alternate
            of usbInterface.alternates
        ) {

            const endpoint =
                alternate.endpoints.find(
                    item =>
                        item.direction === "out"
                );


            if (endpoint) {

                return {

                    interfaceNumber:
                        usbInterface.interfaceNumber,

                    alternateSetting:
                        alternate.alternateSetting,

                    endpointNumber:
                        endpoint.endpointNumber
                };
            }
        }
    }


    throw new Error(
        "Kein USB-Ausgabe-Endpunkt am Drucker gefunden."
    );
}


// ========================================================
// USB DRUCKER ÖFFNEN
// ========================================================

async function openPrinter(device) {

    if (!device.opened) {

        await device.open();
    }


    if (!device.configuration) {

        const configuration =
            device.configurations[0];


        if (!configuration) {

            throw new Error(
                "Keine USB-Konfiguration gefunden."
            );
        }


        await device.selectConfiguration(
            configuration.configurationValue
        );
    }


    const endpointInfo =
        findPrinterEndpoint(device);


    usbInterfaceNumber =
        endpointInfo.interfaceNumber;


    usbAlternateSetting =
        endpointInfo.alternateSetting;


    usbEndpointOut =
        endpointInfo.endpointNumber;


    await device.claimInterface(
        usbInterfaceNumber
    );


    if (
        usbAlternateSetting !== null &&
        usbAlternateSetting !== 0
    ) {

        await device.selectAlternateInterface(
            usbInterfaceNumber,
            usbAlternateSetting
        );
    }
}


// ========================================================
// DRUCKER VERBINDEN
// ========================================================

async function connectPrinter() {

    clearMessage();


    if (!window.isSecureContext) {

        showMessage(
            "WebUSB benötigt eine sichere Webseite (HTTPS).",
            "error"
        );

        return;
    }


    if (!("usb" in navigator)) {

        showMessage(
            "Dieser Browser unterstützt WebUSB nicht. Bitte Chrome oder Edge verwenden.",
            "error"
        );

        return;
    }


    try {

        usbDevice =
            await navigator.usb.requestDevice({
                filters: [
                    {
                        vendorId:
                            TOSHIBA_VENDOR_ID
                    }
                ]
            });


        await openPrinter(
            usbDevice
        );


        printerStatus.textContent =

            "Verbunden: " +

            (
                usbDevice.productName ||
                "TOSHIBA Drucker"
            );


        printerStatus.className =
            "printer-status connected";


        printBtn.disabled =
            false;


        connectBtn.textContent =
            "Drucker verbunden";


        showMessage(
            "Drucker erfolgreich verbunden.",
            "success"
        );

    } catch (error) {

        console.error(error);


        usbDevice = null;


        printerStatus.textContent =
            "Kein Drucker verbunden";


        printerStatus.className =
            "printer-status disconnected";


        printBtn.disabled =
            true;


        if (
            error.name ===
            "NotFoundError"
        ) {

            showMessage(
                "Es wurde kein Drucker ausgewählt.",
                "error"
            );

        } else {

            showMessage(
                "Drucker konnte nicht geöffnet werden: " +
                error.message,
                "error"
            );
        }
    }
}


// ========================================================
// BEKANNTEN DRUCKER AUTOMATISCH WIEDER VERBINDEN
// ========================================================

async function reconnectKnownPrinter() {

    if (
        !window.isSecureContext ||
        !("usb" in navigator)
    ) {
        return;
    }


    try {

        const devices =
            await navigator.usb.getDevices();


        const toshiba =
            devices.find(
                device =>
                    device.vendorId ===
                    TOSHIBA_VENDOR_ID
            );


        if (!toshiba) {
            return;
        }


        usbDevice =
            toshiba;


        await openPrinter(
            usbDevice
        );


        printerStatus.textContent =

            "Verbunden: " +

            (
                usbDevice.productName ||
                "TOSHIBA Drucker"
            );


        printerStatus.className =
            "printer-status connected";


        printBtn.disabled =
            false;


        connectBtn.textContent =
            "Drucker verbunden";

    } catch (error) {

        console.warn(
            "Automatische Verbindung nicht möglich:",
            error
        );
    }
}


// ========================================================
// ZPL ERZEUGEN
// ========================================================

function buildZpl(data) {

    /*
        203 dpi ≈ 8 dots/mm

        Druckbereich:
        832 dots breit
        280 dots hoch

        Layout:

        12343-01                NUA
        AB      40mm x 3,6m x 33cm

        BARCODE
    */


    return `
^XA
^PW${PRINT_WIDTH}
^LL${LABEL_HEIGHT}
^LH0,0
^LS0

^FO8,8
^A0N,33,33
^FD${data.hubId}^FS

^FO395,8
^A0N,33,33
^FD${data.holzart}^FS

^FO8,49
^A0N,25,25
^FD${data.qualitaet}^FS

^FO150,49
^A0N,25,25
^FD${data.dimensions}^FS

^FO10,88
^BY2,2,105
^BCN,105,Y,N,N
^FD${data.barcode}^FS

^PQ1,0,1,Y
^XZ
`.trim();
}


// ========================================================
// DATEN IN STÜCKEN ÜBER USB SENDEN
// ========================================================

async function sendUsbData(bytes) {

    if (
        !usbDevice ||
        usbEndpointOut === null
    ) {

        throw new Error(
            "Kein Drucker verbunden."
        );
    }


    // Kleine Blöcke sind bei USB-Druckern
    // häufig zuverlässiger als ein riesiger Transfer.

    const CHUNK_SIZE =
        4096;


    for (
        let offset = 0;
        offset < bytes.length;
        offset += CHUNK_SIZE
    ) {

        const chunk =
            bytes.slice(
                offset,
                Math.min(
                    offset + CHUNK_SIZE,
                    bytes.length
                )
            );


        const result =
            await usbDevice.transferOut(
                usbEndpointOut,
                chunk
            );


        if (
            result.status !==
            "ok"
        ) {

            throw new Error(
                "USB-Übertragung fehlgeschlagen: " +
                result.status
            );
        }
    }
}


// ========================================================
// DRUCKEN
// ========================================================

async function printLabel() {

    clearMessage();


    const data =
        buildLabelData();


    if (!data) {
        return;
    }


    createLabel();


    if (!usbDevice) {

        showMessage(
            "Bitte zuerst den Drucker verbinden.",
            "error"
        );

        return;
    }


    printBtn.disabled =
        true;


    printBtn.textContent =
        "Wird gedruckt...";


    try {

        const zpl =
            buildZpl(data);


        console.log(
            "Gesendete Druckdaten:"
        );


        console.log(
            zpl
        );


        const encoder =
            new TextEncoder();


        const bytes =
            encoder.encode(zpl);


        await sendUsbData(
            bytes
        );


        showMessage(
            "Etikett wurde an den Drucker gesendet.",
            "success"
        );


        // ----------------------------------------
        // Holz-ID erst NACH erfolgreicher
        // USB-Übertragung erhöhen.
        // ----------------------------------------

        holzId++;


        localStorage.setItem(
            "holzId",
            String(holzId)
        );


        currentId.textContent =
            padNumber(
                holzId,
                2
            );

    } catch (error) {

        console.error(error);


        showMessage(
            "Drucken fehlgeschlagen: " +
            error.message,
            "error"
        );


        if (
            !usbDevice ||
            !usbDevice.opened
        ) {

            printerStatus.textContent =
                "Verbindung verloren";


            printerStatus.className =
                "printer-status disconnected";
        }

    } finally {

        printBtn.disabled =
            usbDevice === null;


        printBtn.textContent =
            "Etikett drucken";
    }
}


// ========================================================
// HOLZ-ID MANUELL ERHÖHEN
// ========================================================

function nextWoodId() {

    holzId++;


    localStorage.setItem(
        "holzId",
        String(holzId)
    );


    currentId.textContent =
        padNumber(
            holzId,
            2
        );


    createLabel();
}


// ========================================================
// AUTOMATISCH GROSSSCHREIBEN
// ========================================================

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


// ========================================================
// EVENTS
// ========================================================

connectBtn.addEventListener(
    "click",
    connectPrinter
);


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


// ========================================================
// USB ABGEZOGEN
// ========================================================

if ("usb" in navigator) {

    navigator.usb.addEventListener(
        "disconnect",
        event => {

            if (
                usbDevice &&
                event.device === usbDevice
            ) {

                usbDevice = null;

                usbEndpointOut = null;

                usbInterfaceNumber = null;


                printBtn.disabled =
                    true;


                printerStatus.textContent =
                    "Drucker getrennt";


                printerStatus.className =
                    "printer-status disconnected";


                connectBtn.textContent =
                    "Drucker verbinden";


                showMessage(
                    "Die USB-Verbindung zum Drucker wurde getrennt.",
                    "error"
                );
            }
        }
    );
}


// ========================================================
// START
// ========================================================

currentId.textContent =
    padNumber(
        holzId,
        2
    );


reconnectKnownPrinter();