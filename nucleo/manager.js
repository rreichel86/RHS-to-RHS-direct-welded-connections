/*jslint browser: true*/
/*global $, jQuery, estaVacio, Formulas, Mustache, Control, Materiales, Perfiles, Ordenar, limites, Conexion_Y,
            Conexion_X, Conexion_K*/


function estaVacio(objeto) {
    "use strict";
    var key;

    for (key in objeto) {
        if (objeto.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

function Miembro(tip, nombre) {
    "use strict";

    this.tipo = tip;
    this.nombre = nombre;
    this.material = {};
    this.seccion = {};
    this.otros();

}

Miembro.prototype = {
    otros: function () {
        "use strict";
        if (this.tipo === "Rama") {
            this.cargas = {
                P: 0,
                Mip: 0,
                Mop: 0
            };
            this.theta = 30;
            this.orientacion = "-";

        } else if (this.tipo === "Cordon") {
            this.cargas = {
                Pi: 0,
                Pd: 0,
                Mi: 0,
                Md: 0,
                P: 0
            };
            this.orientacion = "-";
        }

    }



};

var Control = {
    miembros: [new Miembro("Cordon", "CORDON"),
               new Miembro("Rama", "RAMA-1"),
               new Miembro("Rama", "RAMA-2")],
    conexion: {
        tipo: ""
    },

    indice: function (nombre) {
        "use strict";
        var i, miembros = this.miembros,
            cantidad = miembros.length;

        for (i = 0; i < cantidad; i += 1) {
            if (miembros[i].nombre === nombre) {
                return i;
            }
        }
    },

    configuracion: function () {
        "use strict";
        Control.material.poner();
        Control.material.evento();
        Control.tipo.evento();
        Control.seccion.evento();
        Control.orientacion.evento();
        Control.geometria.evento();
        Control.cargas.evento();
        Control.espaciamiento_o_traslape.evento();
        Control.menu.evento();

    },
    Error_set: function (mensaje) {
        "use strict";
        var text = "<p>";

        text += mensaje;
        text += "</p>";

        $("#MENSAJE").html(text);

    },
    Error_reset: function () {
        "use strict";
        $("#MENSAJE").html("");

    },
    reporte_add: function (mensaje, etiquet) {
        "use strict";
        var etiqueta = etiquet || "p",
            text = "<" + etiqueta + ">";

        text += mensaje;
        text += "</" + etiqueta + ">";

        $("#REPORTE").append(text);

    },
    reporte_reset: function () {
        "use strict";
        $("#REPORTE").html("");
    },
    reporte_encabezado: ["----------------------------------------------------------------------------------------------------------------------------------",
                         "RHS TO RHS DIRECT WELDED CONNECTIONS -- Beta version  v0.6.0.0",
                         "----------------------------------------------------------------------------------------------------------------------------------",
                         "Calculations are in conformance with the Load and Resistance Factor Design method (LRFD)",
                         "of the ANSI/AISC 360-10: Specification for Structural Steel Buildings - Chapter K.",
                         " ",
                         "<u>DISCLAIMER:</u>",
                         "This software is a beta version. It may contain errors and it should not be used for connection design. This tool is intended for use by qualified engineers.",
                         "Although every effort has been made to ensure the accuracy of this software and its documentation, the user of this program assumes full responsibility for any and all output produced by the software, and agrees not to hold the producers and distributors of the software responsible for any and all actions resulting from the use of this software.",
                         "The results obtained from the use of this program should not be subsitituted for sound engineering judgement",
                         " ",
                         "Design and Developed by Rainer Ernst Reichel (rreichel86@gmail.com)"].join("<br>"),

    material: {
        plantilla: ["<option>Designacion</option>",
                    "<option>ASTM A500 Gr. B</option>",
                    "<option>ASTM A500 Gr. C</option>",
                    "<option>ASTM A501 Gr. A</option>",
                    "<option>ASTM A501 Gr. B</option>",
                    "<option>ASTM A1085</option>"].join(""),
        poner: function () {
            "use strict";
            var i, miembros = Control.miembros,
                nro = miembros.length,
                contenido = this.plantilla;

            for (i = 0; i < nro; i += 1) {
                $("#" + miembros[i].nombre + "_MATERIAL").html(contenido);
            }
        },
        extraer: function (i) {
            "use strict";
            var miembro = Control.miembros[i];

            miembro.material.nombre = $("#" + miembro.nombre + "_MATERIAL").val();
        },
        propiedades: function (i) {
            "use strict";
            var material = Control.miembros[i].material;

            if (material.nombre !== "Designacion") {

                material.Fy = Materiales[material.nombre].Fy;
                material.Fu = Materiales[material.nombre].Fu;

            }

            return material;
        },
        definido: function (i) {
            "use strict";
            var miembros = Control.miembros[i],
                nombre = miembros.nombre,
                material = miembros.material;

            if (material.nombre === "Designacion" || estaVacio(material)) {

                return false;

            } else {

                return true;
            }
        },
        propiedades_a: function (i) {
            "use strict";
            var miembros = Control.miembros[i];

            $("#" + miembros.nombre + "_Fy").prop("disabled", false);
            $("#" + miembros.nombre + "_Fu").prop("disabled", false);

        },
        propiedades_des: function (i) {
            "use strict";
            var miembros = Control.miembros[i];

            $("#" + miembros.nombre + "_Fy").prop("disabled", true);
            $("#" + miembros.nombre + "_Fu").prop("disabled", true);

        },
        vista: function (i) {
            "use strict";
            var miembro = Control.miembros[i],
                nombre = miembro.nombre,
                propiedades = miembro.material;

            if (propiedades.nombre !== "Designacion") {

                $("#" + nombre + "_Fy").val(propiedades.Fy);
                $("#" + nombre + "_Fu").val(propiedades.Fu);

            }

        },
        resetear: function (i) {
            "use strict";



        },
        proceso: function (i) {
            "use strict";
            var material = Control.miembros[i].material;
            this.extraer(i);
            this.propiedades(i);
            Control.tipo.extraer(i);
            Control.seccion.activar(i);

            if (material.nombre !== "Designacion") {

                Control.seccion.resetear(i);
                Control.tipo.extraer(i);
            }
            Control.seccion.actualizar(i);
            this.vista(i);
        },
        evento: function () {
            "use strict";
            var i,
                miembros = Control.miembros,
                nro = miembros.length;

            for (i = 0; i < nro; i += 1) {
                $("#" + miembros[i].nombre + "_MATERIAL").change(function () {
                    var nombre = $(this).prop("id").split("_")[0],
                        indice = Control.indice(nombre);

                    Control.material.proceso(indice);

                });
            }
        }
    },
    orientacion: {
        evento: function () {
            "use strict";
            var i, miembros = Control.miembros,
                nro = miembros.length;

            for (i = 0; i < nro; i += 1) {

                $("#" + miembros[i].nombre + "_ST").click(function () {
                    var nombre = $(this).prop("id").split("_")[0],
                        indice = Control.indice(nombre),
                        miembro = Control.miembros[indice],
                        tipo = miembro.tipo,
                        forma = miembro.seccion["H/B"];


                    if (forma > 1 && tipo === "Cordon") {
                        miembro.orientacion = "horizontal";
                        $("#" + nombre + "_ST").removeClass().addClass(tipo + "-rectangular-horizontal");
                        Control.seccion.propiedades(indice);
                        Control.seccion.vista(indice);

                    } else if (forma < 1 && tipo === "Cordon") {
                        miembro.orientacion = "vertical";
                        $("#" + nombre + "_ST").removeClass().addClass(tipo + "-rectangular-vertical");
                        Control.seccion.propiedades(indice);
                        Control.seccion.vista(indice);

                    } else if (forma === 1 && tipo === "Cordon") {
                        miembro.orientacion = "-";
                        $("#" + nombre + "_ST").removeClass().addClass(tipo + "-cuadrado");
                        Control.seccion.propiedades(indice);
                        Control.seccion.vista(indice);

                    } else if (forma > 1 && tipo === "Rama") {
                        miembro.orientacion = "transversal";
                        $("#" + nombre + "_ST").removeClass().addClass(tipo + "-rectangular-transveral");
                        Control.seccion.propiedades(indice);
                        Control.seccion.vista(indice);

                    } else if (forma < 1 && tipo === "Rama") {
                        miembro.orientacion = "paralelo";
                        $("#" + nombre + "_ST").removeClass().addClass(tipo + "-rectangular-paralelo");
                        Control.seccion.propiedades(indice);
                        Control.seccion.vista(indice);

                    } else if (forma === 1 && tipo === "Rama") {
                        miembro.orientacion = "-";
                        $("#" + nombre + "_ST").removeClass().addClass(tipo + "-cuadrado");
                        Control.seccion.propiedades(indice);
                        Control.seccion.vista(indice);
                    }
                });
            }
        }
    },
    tipo: {
        extraer: function (i) {
            "use strict";
            var miembros = Control.miembros[i];
            miembros.seccion.tipo = $("#" + miembros.nombre + "_TIPO input:checked").prop("value");
        },
        poner: function () {
            "use strict";
            var i, miembros = Control.miembros,
                nro = miembros.length;

            for (i = 0; i < nro; i += 1) {
                this.extraer(i);
            }
        },
        evento: function () {
            "use strict";
            var i, miembros = Control.miembros,
                nro = miembros.length;

            for (i = 0; i < nro; i += 1) {
                $("#" + miembros[i].nombre + "_TIPO").change(function () {
                    var nombre = $(this).prop("id").split("_")[0],
                        indice = Control.indice(nombre);

                    if (Control.material.definido(indice)) {
                        Control.seccion.actualizar(indice);
                        Control.seccion.resetear(indice);
                        Control.tipo.extraer(indice);
                        Control.seccion.proceso(indice);
                    }

                });
            }
        }

    },
    seccion: {
        plantilla: {
            rectangular: ["<option>Designacion</option>",
                         "{{#rectangular}}",
                         "<option>{{Size}}</option>",
                         "{{/rectangular}}"].join(""),
            cuadrado: ["<option>Designacion</option>",
                      "{{#cuadrado}}",
                      "<option>{{Size}}</option>",
                      "{{/cuadrado}}"].join("")
        },
        actualizar: function (i) {
            "use strict";
            var miembros = Control.miembros[i],
                material = miembros.material,
                norma,
                HSS,
                tipo,
                contenido;


            if (material.nombre !== "Designacion") {
                norma = Perfiles.norma[material.nombre];
                HSS = Perfiles.HSS[norma];
                Ordenar.mergeSort(HSS.cuadrado, Ordenar.mHss);
                Ordenar.mergeSort(HSS.rectangular, Ordenar.mHss);

                tipo = $("#" + miembros.nombre + "_TIPO input:checked").prop("value");
                contenido = Mustache.to_html(this.plantilla[tipo], HSS);
                $("#" + miembros.nombre + "_TAMAÑO").html(contenido);
            }
        },
        desactivar: function (i) {
            "use strict";
            var miembros = Control.miembros[i];

            $("#" + miembros.nombre + "_TAMAÑO").prop("disabled", true);

        },
        activar: function (i) {
            "use strict";
            var miembros = Control.miembros[i];

            if (miembros.material.nombre !== "Designacion") {

                $("#" + miembros.nombre + "_TAMAÑO").prop("disabled", false);

            }
        },
        extraer: function (i) {
            "use strict";
            var miembros = Control.miembros[i];

            miembros.seccion.nombre = $("#" + miembros.nombre + "_TAMAÑO").val();

        },
        propiedades: function (i) {
            "use strict";
            var miembro = Control.miembros[i],
                tipo = miembro.tipo,
                orientacion = miembro.orientacion,
                material = miembro.material,
                norma = Perfiles.norma[material.nombre],
                seccion = miembro.seccion,
                HSS = Perfiles.HSS[norma][seccion.tipo],
                valor,
                posicion;


            Ordenar.mergeSort(Perfiles.HSS[norma][seccion.tipo], Ordenar.MHss);



            if (seccion.nombre !== "Designacion") {
                valor = Ordenar.toSearchObj(seccion.nombre);
                posicion = Ordenar.Search(HSS, valor);

                if ((tipo === "Cordon" && orientacion === "vertical") || (tipo === "Rama" && orientacion === "paralelo") || (tipo === "Cordon" && orientacion === "-") || (tipo === "Rama" && orientacion === "-")) {

                    seccion.H = HSS[posicion].H;
                    seccion.B = HSS[posicion].B;
                    seccion.tdes = HSS[posicion].tdes;
                    seccion["H/B"] = (seccion.H / seccion.B);
                    seccion["B/t"] = (seccion.B / seccion.tdes);
                    seccion["H/t"] = (seccion.H / seccion.tdes);
                    seccion.gamma = (seccion.B / (2 * seccion.tdes));
                    seccion.Ag = HSS[posicion].A;
                    seccion.Sx = HSS[posicion].Sx;
                    seccion.Sy = HSS[posicion].Sy;
                    seccion.Zx = HSS[posicion].Zx;
                    seccion.Zy = HSS[posicion].Zy;

                    if (seccion["H/B"] === 1 && (tipo === "Rama" || tipo === "Cordon")) {
                        miembro.orientacion = "-";
                    } else if (tipo === "Rama") {
                        miembro.orientacion = "paralelo";
                    } else if (tipo === "Cordon") {
                        miembro.orientacion = "vertical";
                    }

                } else if ((tipo === "Cordon" && orientacion === "horizontal") || (tipo === "Rama" && orientacion === "transversal")) {

                    seccion.H = HSS[posicion].B;
                    seccion.B = HSS[posicion].H;
                    seccion.tdes = HSS[posicion].tdes;
                    seccion["H/B"] = (seccion.H / seccion.B);
                    seccion["B/t"] = (seccion.B / seccion.tdes);
                    seccion["H/t"] = (seccion.H / seccion.tdes);
                    seccion.gamma = (seccion.B / (2 * seccion.tdes));
                    seccion.Ag = HSS[posicion].A;
                    seccion.Sx = HSS[posicion].Sx;
                    seccion.Sy = HSS[posicion].Sy;
                    seccion.Zx = HSS[posicion].Zx;
                    seccion.Zy = HSS[posicion].Zy;

                }
            }
        },
        propiedades_a: function (i) {
            "use strict";
            var miembros = Control.miembros[i];

            $("#" + miembros.nombre + "_H").prop("disabled", false);
            $("#" + miembros.nombre + "_B").prop("disabled", false);
            $("#" + miembros.nombre + "_tdes").prop("disabled", false);
            $("#" + miembros.nombre + "_ro").prop("disabled", false);
            $("#" + miembros.nombre + "_ri").prop("disabled", false);


        },
        propiedades_des: function (i) {
            "use strict";
            var miembros = Control.miembros[i];

            $("#" + miembros.nombre + "_H").prop("disabled", true);
            $("#" + miembros.nombre + "_B").prop("disabled", true);
            $("#" + miembros.nombre + "_tdes").prop("disabled", true);
            $("#" + miembros.nombre + "_ro").prop("disabled", true);
            $("#" + miembros.nombre + "_ri").prop("disabled", true);

        },
        vista: function (i) {
            "use strict";
            var miembro = Control.miembros[i],
                tipo = miembro.tipo,
                nombre = miembro.nombre,
                orientacion = miembro.orientacion,
                propiedades = miembro.seccion,
                text,
                clases = {
                    Rama: ["Rama-rectangular-paralelo", "Rama-rectangular-transversal", "Rama-cuadrado"],
                    Cordon: ["Cordon-rectangular-vertical", "Cordon-rectangular-horizontal", "Cordon-cuadrado"]
                };

            if (propiedades.nombre !== "Designacion") {

                $("#" + nombre + "_H").val(propiedades.H);
                $("#" + nombre + "_B").val(propiedades.B);
                $("#" + nombre + "_tdes").val(propiedades.tdes);
                $("#" + nombre + "_Ag").val(propiedades.Ag);
                $("#" + nombre + "_Sx").val(propiedades.Sx);
                $("#" + nombre + "_Sy").val(propiedades.Sy);
                $("#" + nombre + "_Zx").val(propiedades.Zx);
                $("#" + nombre + "_Zy").val(propiedades.Zy);

                if (propiedades["H/B"] === 1) {
                    $("#" + nombre + "_ST").removeClass().addClass(tipo + "-cuadrado");
                } else {
                    $("#" + nombre + "_ST").removeClass().addClass(tipo + "-rectangular-" + orientacion);
                }
            }

        },
        resetear: function (i) {
            "use strict";
            var miembro = Control.miembros[i],
                nombre = miembro.nombre;

            miembro.seccion = {};
            $("#" + nombre + "_H").val("");
            $("#" + nombre + "_B").val("");
            $("#" + nombre + "_tdes").val("");
            $("#" + nombre + "_Ag").val("");
            $("#" + nombre + "_Sx").val("");
            $("#" + nombre + "_Sy").val("");
            $("#" + nombre + "_Zx").val("");
            $("#" + nombre + "_Zy").val("");
            $("#" + nombre + "_ST").removeClass().addClass("novisible");
        },
        proceso: function (i) {
            "use strict";
            this.extraer(i);
            this.propiedades(i);
            this.vista(i);

        },
        evento: function () {
            "use strict";
            var i, miembros = Control.miembros,
                nro = miembros.length;

            for (i = 0; i < nro; i += 1) {
                $("#" + miembros[i].nombre + "_TAMAÑO").change(function () {
                    var nombre = $(this).prop("id").split("_")[0],
                        indice = Control.indice(nombre);

                    Control.seccion.proceso(indice);

                });
            }
        }
    },
    geometria: {
        poner: function (n, valor) {
            "use strict";
            var miembros = Control.miembros[n],
                tipo1 = miembros.tipo,
                tipo2 = Control.conexion.tipo,
                theta = miembros.theta;

            if (tipo1 === "Rama") {
                theta = valor;
                $("#" + miembros.nombre + "_theta").val(valor);
                Control.geometria.extraer(n);

            }
        },
        es: function (n, valor) {
            "use strict";
            var miembros = Control.miembros[n],
                tipo = miembros.tipo,
                theta = miembros.theta;

            if (miembros.tipo === "Rama") {
                return valor === Number($("#" + miembros.nombre + "_theta").val());
            }

        },
        bloquear: function (n) {
            "use strict";
            var miembros = Control.miembros[n],
                tipo = miembros.tipo;

            if (miembros.tipo === "Rama") {
                
                $("#" + miembros.nombre + "_theta").prop("disabled", true);
                
            }
        },
        bloqueado: function (n) {
            "use strict";
            var miembros = Control.miembros[n],
                tipo = miembros.tipo;

            if (miembros.tipo === "Rama") {
                return $("#" + miembros.nombre + "_theta").prop("disabled");
            }
        },
        desbloquear: function (n) {
            "use strict";
            var miembros = Control.miembros[n],
                tipo = miembros.tipo;

            if (miembros.tipo === "Rama") {
                $("#" + miembros.nombre + "_theta").prop("disabled", false);
            }
        },
        extraer: function (i) {
            "use strict";
            var miembros = Control.miembros[i],
                tipo = Control.conexion.tipo;

            if (miembros.tipo === "Rama") {
                miembros.theta = Number($("#" + miembros.nombre + "_theta").val());

                $("#" + miembros.nombre + "_Mip").prop("disabled", true);
                $("#" + miembros.nombre + "_Mop").prop("disabled", true);

                if (miembros.theta === 90 && (tipo === "CONEXION_EN_T" || tipo === "CONEXION_EN_X2")) {
                    $("#" + miembros.nombre + "_Mip").prop("disabled", false);
                    $("#" + miembros.nombre + "_Mop").prop("disabled", false);
                }

            }
        },
        evento: function () {
            "use strict";
            var i, miembros = Control.miembros,
                nro = miembros.length;

            for (i = 1; i < nro; i += 1) {


                $("#" + miembros[i].nombre + "_theta").change(function () {
                    var nombre = $(this).prop("id").split("_")[0],
                        indice = Control.indice(nombre);

                    Control.geometria.extraer(indice);

                });


            }
        }
    },
    cargas: {
        extraer: function (i, propiedad) {
            "use strict";
            var miembros = Control.miembros[i];

            miembros.cargas[propiedad] = Number($("#" + miembros.nombre + "_" + propiedad).val());

        },
        evento: function () {
            "use strict";
            var i, miembros = Control.miembros,
                nro = miembros.length;

            for (i = 0; i < nro; i += 1) {
                $("#" + miembros[i].nombre + "_CARGAS").change(function (event) {
                    var objetivo = $(event.target).prop("id"),
                        pos = objetivo.search("_"),
                        nombre = objetivo.slice(0, pos),
                        propiedades = objetivo.slice(pos + 1),
                        indice = Control.indice(nombre);




                    Control.cargas.extraer(indice, propiedades);

                });
            }
        }
    },
    espaciamiento_o_traslape: {
        evento: function () {
            "use strict";
            $("#ESPACIAMIENTO-TRASLAPE").bind("change", function (event) {
                var e, g, Ov, tipo,
                    objetivo = $(event.target).prop("id"),
                    nombre = Control.conexion.tipo;


                switch (objetivo) {

                case "ESPACIAMIENTO":

                    g = Number($("#" + objetivo).val());
                    e = Formulas.e.apply(Control, [0, 1, 2, g]);
                    Ov = Formulas.Ov.apply(Control, [2, g]);
                    break;

                case "EXCENTRICIDAD":

                    e = Number($("#" + objetivo).val());
                    g = Formulas.g.apply(Control, [0, 1, 2, e]);
                    Ov = Formulas.Ov.apply(Control, [2, g]);
                    break;

                case "TRASLAPE":

                    Ov = Number($("#" + objetivo).val());
                    g = Formulas.l_ov.apply(Control, [2, Ov]);
                    e = Formulas.e.apply(Control, [0, 1, 2, g]);
                    break;
                }

                if (nombre === "CONEXION_EN_K" || nombre === "CONEXION_EN_K-ESPACIAMIENTO" || nombre === "CONEXION_EN_K-TRASLAPE") {
                    tipo = (g >= 0) ? "CONEXION_EN_K-ESPACIAMIENTO" : "CONEXION_EN_K-TRASLAPE";
                } else if (nombre === "CONEXION_EN_N" || nombre === "CONEXION_EN_N-ESPACIAMIENTO" || nombre === "CONEXION_EN_N-TRASLAPE") {
                    tipo = (g >= 0) ? "CONEXION_EN_N-ESPACIAMIENTO" : "CONEXION_EN_N-TRASLAPE";
                }


                $("#ESPACIAMIENTO").val(g);
                $("#EXCENTRICIDAD").val(e);
                $("#TRASLAPE").val(Ov);

                Control.conexion = {
                    tipo: tipo,
                    e: e,
                    g: g,
                    Ov: Ov
                };
            });
        }
    },
    menu: {
        partes: ["CONEXION_EN_K", "CONEXION_EN_N", "CONEXION_EN_Y", "CONEXION_EN_T", "CONEXION_EN_X1", "CONEXION_EN_X2"],
        evento: function () {
            "use strict";
            var i,
                parte = Control.menu.partes,
                nro = parte.length;

            for (i = 0; i < nro; i += 1) {

                $("#" + parte[i]).click(function (event) {
                    var nombre = $(this).prop("id"),
                        objetivo = $(event.target).text(),
                        resultado_1,
                        resultado_2;


                    if (!$("#" + nombre + " > p").hasClass("seleccionado")) {
                        $(".seleccionado").removeClass("seleccionado").addClass("normal");
                        $("#" + nombre + " > p").removeClass("normal").removeClass("opaco").addClass("seleccionado");
                        $(".normal").removeClass("normal").addClass("opaco");
                        $("#" + nombre + " ul").show();

                        Control.conexion = {};
                        Control.conexion.tipo = nombre;

                    }

                    switch (objetivo) {
                    case "CORDON":
                        resultado_1 = objetivo;
                        resultado_2 = "_" + resultado_1;
                        break;
                    case "RAMA 1":
                        resultado_1 = objetivo.replace(/\s/, "-");
                        resultado_2 = "_" + resultado_1;
                        break;
                    case "RAMA 2":
                        resultado_1 = objetivo.replace(/\s/, "-");
                        resultado_2 = "_" + resultado_1;
                        break;
                    case "RAMA 3":
                        resultado_1 = objetivo.replace(/\s/, "-");
                        resultado_2 = "";
                        break;
                    case "RAMA 4":
                        resultado_1 = objetivo.replace(/\s/, "-");
                        resultado_2 = "";
                        break;
                    case "ESPACIAMIENTO/TRASLAPE":
                        resultado_1 = objetivo.replace(/\//, "-");
                        resultado_2 = "";
                        break;
                    }

                    $(".visible").removeClass("visible").addClass("novisible");
                    $("#" + resultado_1).removeClass("novisible").addClass("visible");
                    $("div[id^=detalles]").hide();
                    $("#detalles" + resultado_2).show();
                    $("#" + nombre + " ul").hide();


                });

                $("#" + parte[i]).hover(function () {
                    var nombre = $(this).prop("id"),
                        objetivo = $(event.target).text();

                    if ($("#" + nombre + " > p").hasClass("seleccionado") || $("#" + nombre + " > p").hasClass("normal")) {
                        $("#" + nombre + " ul").show();
                    }

                }, function () {
                    var nombre = $(this).prop("id");


                    if ($("#" + nombre + " > p").hasClass("seleccionado") || $("#" + nombre + " > p").hasClass("normal")) {
                        $("#" + nombre + " ul").hide();
                    }


                });


                $("#" + parte[i] + " ul li p").bind("mouseout mouseover", function (event) {
                    var objetivo = $(event.target).text(),
                        evento = event.type,
                        resultado_1,
                        resultado_2;

                    switch (objetivo) {
                    case "CORDON":
                        resultado_1 = objetivo;
                        resultado_2 = "_" + resultado_1;
                        break;
                    case "RAMA 1":
                        resultado_1 = objetivo.replace(/\s/, "-");
                        resultado_2 = "_" + resultado_1;
                        break;
                    case "RAMA 2":
                        resultado_1 = objetivo.replace(/\s/, "-");
                        resultado_2 = "_" + resultado_1;
                        break;
                    case "RAMA 3":
                        resultado_1 = objetivo.replace(/\s/, "-");
                        resultado_2 = "";
                        break;
                    case "RAMA 4":
                        resultado_1 = objetivo.replace(/\s/, "-");
                        resultado_2 = "";
                        break;
                    case "ESPACIAMIENTO/TRASLAPE":
                        resultado_1 = objetivo.replace(/\//, "-");
                        resultado_2 = "";
                        break;
                    }

                    if (evento === "mouseover") {
                        $("div[id^=detalles]").hide();
                        $("#detalles" + resultado_2).show();

                    } else if (evento === "mouseout") {

                        if ($("#" + resultado_1).hasClass("novisible")) {
                            $("div[id^=detalles]").hide();
                            $("#detalles").show();
                        }

                    }
                });
            }
        }
    },
    iniciar: function () {
        "use strict";
        $("#CORDON").change(function () {

            limites.cordon.apply(Control, [0]);

        });

        $("#RAMA-1").change(function () {

            limites.rama.apply(Control, [1, 0]);

        });

        $("#RAMA-2").change(function () {

            limites.rama.apply(Control, [2, 0]);

        });

        $("#ESPACIAMIENTO-TRASLAPE").change(function () {

            limites.conexion.apply(Control, [1, 2, 0]);

        });

        $("#ENTRADA").bind("change click", function (event) {
            var tipo = Control.conexion.tipo,
                objetivo = $(event.target).prop("id"),
                evento = event.type,
                conexiones;

            if (evento === "change" || (objetivo.split("_")[1] === "ST" && evento === "click")) {
                conexiones = {
                    "CONEXION_EN_K": function () {

                        if (Control.geometria.es(1, 90) === true) {

                            Control.geometria.poner(1, 30);
                            Control.geometria.desbloquear(1);

                        }
                        if (Control.geometria.es(2, 90) === true) {

                            Control.geometria.poner(2, 30);
                            Control.geometria.desbloquear(2);

                        }

                        Conexion_K.apply(Control, [1, 2, 0]);
                    },
                    "CONEXION_EN_N": function () {

                        Control.geometria.poner(1, 90);
                        Control.geometria.bloquear(1);

                        if (Control.geometria.es(2, 90) === true) {

                            Control.geometria.poner(2, 30);
                            Control.geometria.desbloquear(2);

                        }

                        Conexion_K.apply(Control, [1, 2, 0]);
                    },
                    "CONEXION_EN_K-ESPACIAMIENTO": function () {

                        if (Control.geometria.es(1, 90) === true) {

                            Control.geometria.poner(1, 30);
                            Control.geometria.desbloquear(1);

                        }
                        if (Control.geometria.es(2, 90) === true) {

                            Control.geometria.poner(2, 30);
                            Control.geometria.desbloquear(2);

                        }

                        Conexion_K.apply(Control, [1, 2, 0]);
                    },
                    "CONEXION_EN_N-ESPACIAMIENTO": function () {

                        Control.geometria.poner(1, 90);
                        Control.geometria.bloquear(1);

                        if (Control.geometria.es(2, 90) === true) {

                            Control.geometria.poner(2, 30);
                            Control.geometria.desbloquear(2);

                        }

                        Conexion_K.apply(Control, [1, 2, 0]);
                    },
                    "CONEXION_EN_K-TRASLAPE": function () {

                        if (Control.geometria.es(1, 90) === true) {

                            Control.geometria.poner(1, 30);
                            Control.geometria.desbloquear(1);

                        }
                        if (Control.geometria.es(2, 90) === true) {

                            Control.geometria.poner(2, 30);
                            Control.geometria.desbloquear(2);

                        }

                        Conexion_K.apply(Control, [1, 2, 0]);
                    },
                    "CONEXION_EN_N-TRASLAPE": function () {

                        Control.geometria.poner(1, 90);
                        Control.geometria.bloquear(1);

                        if (Control.geometria.es(2, 90) === true) {

                            Control.geometria.poner(2, 30);
                            Control.geometria.desbloquear(2);

                        }

                        Conexion_K.apply(Control, [1, 2, 0]);
                    },
                    "CONEXION_EN_Y": function () {

                        if (Control.geometria.es(1, 90) === true) {

                            Control.geometria.poner(1, 30);
                            Control.geometria.desbloquear(1);

                        }

                        Conexion_Y.apply(Control, [1, 0]);
                    },
                    "CONEXION_EN_T": function () {

                        Control.geometria.poner(1, 90);
                        Control.geometria.bloquear(1);

                        Conexion_Y.apply(Control, [1, 0]);
                    },
                    "CONEXION_EN_X1": function () {

                        if (Control.geometria.es(1, 90) === true) {

                            Control.geometria.poner(1, 30);
                            Control.geometria.desbloquear(1);

                        }
                        if (Control.geometria.es(2, 90) === true) {

                            Control.geometria.poner(2, 30);
                            Control.geometria.desbloquear(2);

                        }

                        Conexion_X.apply(Control, [1, 2, 0]);
                    },
                    "CONEXION_EN_X2": function () {

                        Control.geometria.poner(1, 90);
                        Control.geometria.bloquear(1);

                        Control.geometria.poner(2, 90);
                        Control.geometria.bloquear(2);

                        Conexion_X.apply(Control, [1, 2, 0]);
                    }
                };
                $("div[id^=detalles]").addClass(tipo);
                $("div[id^=detalles]").removeClass();
                $("div[id^=detalles]").addClass(tipo);
                //$("#DIAGRAMA").show();
                //$("#detalles").show();
                conexiones[tipo]();
            }
        });

        $("#MENU").bind("click", function (event) {
            var tipo = Control.conexion.tipo,
                objetivo = $(event.target).text(),
                conexiones;



            conexiones = {
                "CONEXION_EN_K": function () {


                    if (Control.geometria.es(1, 90) === true) {

                        Control.geometria.poner(1, 30);
                        Control.geometria.desbloquear(1);

                    }
                    if (Control.geometria.es(2, 90) === true) {

                        Control.geometria.poner(2, 30);
                        Control.geometria.desbloquear(2);

                    }

                    Conexion_K.apply(Control, [1, 2, 0]);
                },
                "CONEXION_EN_N": function () {

                    Control.geometria.poner(1, 90);
                    Control.geometria.bloquear(1);

                    if (Control.geometria.es(2, 90) === true) {

                        Control.geometria.poner(2, 30);
                        Control.geometria.desbloquear(2);

                    }

                    Conexion_K.apply(Control, [1, 2, 0]);
                },
                "CONEXION_EN_K-ESPACIAMIENTO": function () {

                    if (Control.geometria.es(1, 90) === true) {

                        Control.geometria.poner(1, 30);
                        Control.geometria.desbloquear(1);

                    }
                    if (Control.geometria.es(2, 90) === true) {

                        Control.geometria.poner(2, 30);
                        Control.geometria.desbloquear(2);

                    }

                    Conexion_K.apply(Control, [1, 2, 0]);
                },
                "CONEXION_EN_N-ESPACIAMIENTO": function () {

                    Control.geometria.poner(1, 90);
                    Control.geometria.bloquear(1);

                    if (Control.geometria.es(2, 90) === true) {

                        Control.geometria.poner(2, 30);
                        Control.geometria.desbloquear(2);

                    }

                    Conexion_K.apply(Control, [1, 2, 0]);
                },
                "CONEXION_EN_K-TRASLAPE": function () {

                    if (Control.geometria.es(1, 90) === true) {

                        Control.geometria.poner(1, 30);
                        Control.geometria.desbloquear(1);

                    }
                    if (Control.geometria.es(2, 90) === true) {

                        Control.geometria.poner(2, 30);
                        Control.geometria.desbloquear(2);

                    }

                    Conexion_K.apply(Control, [1, 2, 0]);
                },
                "CONEXION_EN_N-TRASLAPE": function () {

                    Control.geometria.poner(1, 90);
                    Control.geometria.bloquear(1);

                    if (Control.geometria.es(2, 90) === true) {

                        Control.geometria.poner(2, 30);
                        Control.geometria.desbloquear(2);

                    }

                    Conexion_K.apply(Control, [1, 2, 0]);
                },
                "CONEXION_EN_Y": function () {

                    if (Control.geometria.es(1, 90) === true) {

                        Control.geometria.poner(1, 30);
                        Control.geometria.desbloquear(1);

                    }

                    Conexion_Y.apply(Control, [1, 0]);
                },
                "CONEXION_EN_T": function () {

                    Control.geometria.poner(1, 90);
                    Control.geometria.bloquear(1);

                    Conexion_Y.apply(Control, [1, 0]);
                },
                "CONEXION_EN_X1": function () {

                    if (Control.geometria.es(1, 90) === true) {

                        Control.geometria.poner(1, 30);
                        Control.geometria.desbloquear(1);

                    }
                    if (Control.geometria.es(2, 90) === true) {

                        Control.geometria.poner(2, 30);
                        Control.geometria.desbloquear(2);

                    }

                    Conexion_X.apply(Control, [1, 2, 0]);
                },
                "CONEXION_EN_X2": function () {

                    Control.geometria.poner(1, 90);
                    Control.geometria.bloquear(1);

                    Control.geometria.poner(2, 90);
                    Control.geometria.bloquear(2);

                    Conexion_X.apply(Control, [1, 2, 0]);
                }
            };

            $("div[id^=detalles]").addClass(tipo);
            $("div[id^=detalles]").removeClass();
            $("div[id^=detalles]").addClass(tipo);
            $("#DIAGRAMA").show();

            if (objetivo !== "RAMA 1" && objetivo !== "RAMA 2" && objetivo !== "CORDON") {
                $("#detalles").show();
            }
            conexiones[tipo]();
        });

    }
};