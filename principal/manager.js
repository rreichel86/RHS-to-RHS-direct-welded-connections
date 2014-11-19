/*jslint browser: true, maxlen: 150*/
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

function Miembro(tipo, nombre) {
    "use strict";
    this.tipo = tipo;
    this.nombre = nombre;
    this.descripcion = this.nombre.replace(/_|-/g, " ");
    this.material = {};
    this.seccion = {};
    this.otros();
    this.iniciar();
    return this;
}

Miembro.prototype = {
    constructor: Miembro,
    iniciar: function () {
        "use strict";
        this.putMiembrosWindow();
        this.setEventos();
    },
    setEventos: function () {
        "use strict";
        this.setMaterialEvento();
        this.setSeccionTipoEvento();
        this.setSeccionEvento();
        this.setOrientacionEvento();
        this.setThetaEvento();
        this.setCargasEventos();
    },
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
        return this;
    },
    miembrosWindow: {
        MATERIAL: {
            nombre: "_MATERIAL_NOMBRE",
            Fy: "_MATERIAL_Fy",
            Fu: "_MATERIAL_Fu"
        },
        SECCION: {
            nombre: "_SECCION_NOMBRE",
            tipo: "_SECCION_TIPO",
            H: "_SECCION_H",
            B: "_SECCION_B",
            tdes: "_SECCION_tdes",
            Ag: "_SECCION_Ag",
            Sx: "_SECCION_Sx",
            Sy: "_SECCION_Sy",
            Zx: "_SECCION_Zx",
            Zy: "_SECCION_Zy"
        },
        ORIENTACION: {
            orientacion: "_ORIENTACION"
        },
        GEOMETRIA: {
            theta: "_theta"
        },
        CARGAS: {
            contenedor: "_CARGAS",
            Cordon: {
                Pi: "_CARGAS_Pi",
                Pd: "_CARGAS_Pd",
                Mi: "_CARGAS_Mi",
                Md: "_CARGAS_Md",
                P: "_CARGAS_P"
            },
            Rama: {
                P: "_CARGAS_P",
                Mip: "_CARGAS_Mip",
                Mop: "_CARGAS_Mop"
            }
        }
    },
    miembrosWindowObservar: function (fn) {
        "use strict";

        return $("#" + this.nombre).change(fn);


    },
    miembrosWindowEliminar: function () {
        "use strict";

        $("#" + this.nombre).remove();

    },
    putMiembrosWindow: function () {
        "use strict";
        var plantilla = $("#MIEMBRO").html(),
            rendered = Mustache.render(plantilla, this),
            donde = $("#ENTRADA").append(rendered);
    },
    isRama: function () {
        "use strict";
        var condicion = this.tipo === "Rama";

        if (condicion) {

            return true;

        }
        return false;
    },
    isCordon: function () {
        "use strict";
        var condicion = this.tipo === "Cordon";

        if (condicion) {

            return true;

        }
        return false;
    },
    estaVacio: function (objeto) {
        "use strict";
        var key;

        for (key in this[objeto]) {

            if (this[objeto].hasOwnProperty(key)) {
                return false;
            }
        }
        return true;

    },
    materialDefinido: function () {
        "use strict";
        var condicion_1 = this.estaVacio("material"),
            condicion_2 = this.material.nombre === "Designacion";

        if (condicion_1 || condicion_2) {

            return false;

        }
        return true;
    },
    materialNombreDOM: function () {
        "use strict";
        var nombre = this.nombre,
            MATERIAL = this.miembrosWindow.MATERIAL,
            $MATERIAL_NOMBRE = $("#" + nombre + MATERIAL.nombre);

        return {
            nombre: $MATERIAL_NOMBRE
        };

    },
    materialPropiedadesDOM: function () {
        "use strict";
        var nombre = this.nombre,
            MATERIAL = this.miembrosWindow.MATERIAL,
            $MATERIAL_Fy = $("#" + nombre + MATERIAL.Fy),
            $MATERIAL_Fu = $("#" + nombre + MATERIAL.Fu);

        return {
            Fy: $MATERIAL_Fy,
            Fu: $MATERIAL_Fu
        };

    },
    getMaterial: function () {
        "use strict";
        var MATERIAL_NOMBRE = this.materialNombreDOM().nombre.val(),
            MATERIAL_PROPIEDADES;

        if (MATERIAL_NOMBRE !== "Designacion") {

            MATERIAL_PROPIEDADES = Materiales[MATERIAL_NOMBRE];
            this.setMaterialNombre(MATERIAL_NOMBRE);
            this.setMaterialPropiedades(MATERIAL_PROPIEDADES);

            this.putMaterialPropiedades();

            return this;
        }

    },
    setMaterialNombre: function (designacion) {
        "use strict";
        this.material.nombre = designacion;

        return this;
    },
    setMaterialPropiedades: function (propiedades) {
        "use strict";
        this.material.Fy = Number(propiedades.Fy);
        this.material.Fu = Number(propiedades.Fu);
        this.material["Fy/Fu"] = (this.material.Fy / this.material.Fu);

        return this;
    },
    putMaterialPropiedades: function () {
        "use strict";
        var propiedades,
            MATERIAL_PROPIEDADES = this.materialPropiedadesDOM();

        for (propiedades in MATERIAL_PROPIEDADES) {

            if (MATERIAL_PROPIEDADES.hasOwnProperty(propiedades)) {

                MATERIAL_PROPIEDADES[propiedades].val(this.material[propiedades]);

            }

        }

    },
    materialEvento: function () {
        "use strict";
        this.getMaterial();
        this.resetSeccionPropiedades();
        this.putPerfiles();
    },
    setMaterialEvento: function () {
        "use strict";
        var MATERIAL_NOMBRE = this.materialNombreDOM().nombre,
            self = this;

        MATERIAL_NOMBRE.change(function () {
            self.materialEvento();
        });

    },
    seccionDefinido: function () {
        "use strict";
        var condicion_1 = this.estaVacio("seccion"),
            condicion_2 = this.seccion.nombre === "Designacion";

        if (condicion_1 || condicion_2) {

            return false;

        }
        return true;

    },
    seccionTransversalDefinido: function () {
        "use strict";
        var condicion_1 = this.materialDefinido(),
            condicion_2 = this.seccionDefinido();

        if (condicion_1 && condicion_2) {

            return true;

        }
        return false;

    },
    seccionTipoDOM: function () {
        "use strict";
        var nombre = this.nombre,
            SECCION = this.miembrosWindow.SECCION,
            $SECCION_TIPO = $("#" + nombre + SECCION.tipo);

        return {
            tipo: $SECCION_TIPO
        };

    },
    seccionNombreDOM: function () {
        "use strict";
        var nombre = this.nombre,
            SECCION = this.miembrosWindow.SECCION,
            $SECCION_NOMBRE = $("#" + nombre + SECCION.nombre);

        return {
            nombre: $SECCION_NOMBRE
        };
    },
    seccionNombreDOMdeshabilitar: function () {
        "use strict";
    },
    seccionNombreDOMhabilitar: function () {
        "use strict";

    },
    seccionPropiedadesDOM: function () {
        "use strict";
        var nombre = this.nombre,
            SECCION = this.miembrosWindow.SECCION,
            $SECCION_H = $("#" + nombre + SECCION.H),
            $SECCION_B = $("#" + nombre + SECCION.B),
            $SECCION_tdes = $("#" + nombre + SECCION.tdes),
            $SECCION_Ag = $("#" + nombre + SECCION.Ag),
            $SECCION_Sx = $("#" + nombre + SECCION.Sx),
            $SECCION_Sy = $("#" + nombre + SECCION.Sy),
            $SECCION_Zx = $("#" + nombre + SECCION.Zx),
            $SECCION_Zy = $("#" + nombre + SECCION.Zy);

        return {
            H: $SECCION_H,
            B: $SECCION_B,
            tdes: $SECCION_tdes,
            Sx: $SECCION_Sx,
            Sy: $SECCION_Sy,
            Zx: $SECCION_Zx,
            Zy: $SECCION_Zy,
            Ag: $SECCION_Ag
        };

    },
    setSeccionNombre: function (designacion) {
        "use strict";
        this.seccion.nombre = designacion;

        return this;
    },
    setSeccionTipo: function (tipo) {
        "use strict";
        this.seccion.tipo = tipo;

        return this;
    },
    setSeccionPropiedades: function (propiedades) {
        "use strict";
        var orientacion = this.orientacion;

        if (orientacion === "-" ||
                orientacion === "vertical" ||
                orientacion === "paralelo") {

            this.seccion.H = Number(propiedades.H);
            this.seccion.B = Number(propiedades.B);

        } else if (orientacion === "horizontal" ||
                   orientacion === "transversal") {

            this.seccion.H = Number(propiedades.B);
            this.seccion.B = Number(propiedades.H);

        }
        this.seccion["H/B"] = (this.seccion.H / this.seccion.B);
        this.seccion.tdes = Number(propiedades.tdes);
        this.seccion["H/t"] = (this.seccion.H / this.seccion.tdes);
        this.seccion["B/t"] = (this.seccion.B / this.seccion.tdes);
        this.seccion.gamma = (this.seccion.B / (2 * this.seccion.tdes));
        this.seccion.Ag = Number(propiedades.A);
        this.seccion.Sx = Number(propiedades.Sx);
        this.seccion.Sy = Number(propiedades.Sy);
        this.seccion.Zx = Number(propiedades.Zx);
        this.seccion.Zy = Number(propiedades.Zy);

        return this;
    },
    putPerfiles: function () {
        "use strict";
        var MATERIAL_NOMBRE = this.materialNombreDOM().nombre.val(),
            DONDE = this.seccionNombreDOM().nombre,
            SECCION_TIPO = this.seccionTipoDOM().tipo.find("input:checked").val(),
            PLANTILLA = {
                cuadrado: "<option>Designacion</option> {{#cuadrado}} <option>{{Size}}</option> {{/cuadrado}}",
                rectangular: "<option>Designacion</option> {{#rectangular}} <option>{{Size}}</option> {{/rectangular}}"
            },
            NORMA,
            PERFILES,
            rendered;

        if (MATERIAL_NOMBRE !== "Designacion") {

            NORMA = Perfiles.norma[MATERIAL_NOMBRE];
            Perfiles.HSS[NORMA][SECCION_TIPO].sort(Ordenar.deMenor_aMayor);
            PERFILES = Perfiles.HSS[NORMA];
            rendered = Mustache.render(PLANTILLA[SECCION_TIPO], PERFILES);
            DONDE.html(rendered);

        }

    },
    getSeccion: function () {
        "use strict";
        var MATERIAL_NOMBRE = this.materialNombreDOM().nombre.val(),
            SECCION_TIPO = this.seccionTipoDOM().tipo.find("input:checked").val(),
            SECCION_NOMBRE = this.seccionNombreDOM().nombre.val(),
            NORMA,
            PERFILES,
            valor,
            posicion,
            SECCION_PROPIEDADES;

        if (MATERIAL_NOMBRE !== "Designacion" && SECCION_NOMBRE !== "Designacion") {

            NORMA = Perfiles.norma[MATERIAL_NOMBRE];
            PERFILES = Perfiles.HSS[NORMA][SECCION_TIPO].sort(Ordenar.deMayor_aMenor);
            valor = Ordenar.toSearchObj(SECCION_NOMBRE);
            posicion = Ordenar.Search(PERFILES, valor);

            this.setSeccionTipo(SECCION_TIPO);
            this.setSeccionNombre(SECCION_NOMBRE);
            this.setSeccionPropiedades(PERFILES[posicion]);

            this.putSeccionPropiedades();

            return this;

        } else if (SECCION_NOMBRE === "Designacion") {

            this.resetSeccionPropiedades();

            return this;
        }

    },
    resetSeccionPropiedades: function () {
        "use strict";
        var propiedades,
            SECCION_PROPIEDADES = this.seccionPropiedadesDOM(),
            ORIENTACION = this.orientacionDOM().orientacion;

        this.seccion = {};
        this.orientacion = "-";

        for (propiedades in SECCION_PROPIEDADES) {

            if (SECCION_PROPIEDADES.hasOwnProperty(propiedades)) {

                SECCION_PROPIEDADES[propiedades].val("");

            }

        }
        ORIENTACION.hide();

    },
    putSeccionPropiedades: function () {
        "use strict";
        var propiedades,
            SECCION_PROPIEDADES = this.seccionPropiedadesDOM();

        for (propiedades in SECCION_PROPIEDADES) {

            if (SECCION_PROPIEDADES.hasOwnProperty(propiedades)) {

                SECCION_PROPIEDADES[propiedades].val(this.seccion[propiedades]);

            }

        }

    },
    seccionTipoEvento: function () {
        "use strict";
        this.resetSeccionPropiedades();
        this.putPerfiles();


    },
    seccionEvento: function () {
        "use strict";
        this.getSeccion();
        this.setOrientacion();

    },
    setSeccionTipoEvento: function () {
        "use strict";
        var SECCION_TIPO = this.seccionTipoDOM().tipo,
            self = this;

        SECCION_TIPO.change(function () {
            self.seccionTipoEvento();

        });

    },
    setSeccionEvento: function () {
        "use strict";
        var SECCION_NOMBRE = this.seccionNombreDOM().nombre,
            self = this;

        SECCION_NOMBRE.change(function () {
            self.seccionEvento();
        });

    },
    orientacionDOM: function () {
        "use strict";
        var nombre = this.nombre,
            ORIENTACION = this.miembrosWindow.ORIENTACION,
            $ORIENTACION = $("#" + nombre + ORIENTACION.orientacion);

        return {
            orientacion: $ORIENTACION
        };
    },
    setOrientacion: function () {
        "use strict";
        var tipo = this.tipo,
            condicion = this.seccionDefinido,
            ORIENTACION = this.orientacionDOM().orientacion,
            forma;

        if (condicion) {

            forma = this.seccion["H/B"];

            if (forma === 1 && (tipo === "Rama" || tipo === "Cordon")) {

                this.orientacion = "-";
                ORIENTACION.removeClass().addClass(tipo + "-cuadrado");

            } else if (forma > 1 && tipo === "Rama") {

                this.orientacion = "paralelo";
                ORIENTACION.removeClass().addClass(tipo + "-rectangular-paralelo");

            } else if (forma < 1 && tipo === "Rama") {

                this.orientacion = "transversal";
                ORIENTACION.removeClass().addClass(tipo + "-rectangular-transversal");

            } else if (forma > 1 && tipo === "Cordon") {

                this.orientacion = "vertical";
                ORIENTACION.removeClass().addClass(tipo + "-rectangular-vertical");

            } else if (forma < 1 && tipo === "Cordon") {

                this.orientacion = "horizontal";
                ORIENTACION.removeClass().addClass(tipo + "-rectangular-horizontal");

            }
            ORIENTACION.show();
            return this;
        }
        return this;
    },
    changeOrientacion: function () {
        "use strict";
        var tipo = this.tipo,
            condicion = this.seccionDefinido,
            ORIENTACION = this.orientacionDOM().orientacion,
            forma;

        if (condicion) {

            forma = this.seccion["H/B"];

            if (forma > 1 && tipo === "Rama") {

                this.orientacion = "transversal";
                ORIENTACION.removeClass().addClass(tipo + "-rectangular-transversal");

            } else if (forma < 1 && tipo === "Rama") {

                this.orientacion = "paralelo";
                ORIENTACION.removeClass().addClass(tipo + "-rectangular-paralelo");

            } else if (forma > 1 && tipo === "Cordon") {

                this.orientacion = "horizontal";
                ORIENTACION.removeClass().addClass(tipo + "-rectangular-horizontal");

            } else if (forma < 1 && tipo === "Cordon") {

                this.orientacion = "vertical";
                ORIENTACION.removeClass().addClass(tipo + "-rectangular-vertical");

            }
            ORIENTACION.show();
            return this;
        }
        return this;

    },
    orientacionEvento: function () {
        "use strict";

        this.changeOrientacion();
        this.getSeccion();


    },
    setOrientacionEvento: function () {
        "use strict";
        var ORIENTACION = this.orientacionDOM().orientacion,
            self = this;

        ORIENTACION.click(function () {
            self.orientacionEvento();
        });

    },
    thetaDOM: function () {
        "use strict";
        var nombre = this.nombre,
            condition = this.isRama(),
            GEOMETRIA,
            $THETA;

        if (condition) {
            GEOMETRIA = this.miembrosWindow.GEOMETRIA;
            $THETA = $("#" + nombre + GEOMETRIA.theta);

            return {
                theta: $THETA
            };

        }

    },
    isTheta: function (valor) {
        "use strict";
        var condicion = this.isRama(),
            THETA;

        if (condicion) {
            THETA = this.thetaDOM().theta.val();

            return valor === Number(THETA);

        }

    },
    setTheta: function (theta) {
        "use strict";
        var condicion = this.isRama(),
            THETA;

        if (condicion) {

            this.theta = Number(theta);
            return this;

        }
        return this;

    },
    getTheta: function () {
        "use strict";
        var condicion = this.isRama(),
            THETA;

        if (condicion) {

            THETA = this.thetaDOM().theta.val();
            this.setTheta(THETA);

            return this;

        }
        return this;

    },
    putTheta: function (theta) {
        "use strict";
        var condicion = this.isRama(),
            THETA;

        if (condicion) {

            THETA = this.thetaDOM().theta.val(theta);
            return this;
        }
        return this;

    },
    updateTheta: function (theta) {
        "use strict";
        var condicion = this.isRama(),
            THETA;

        if (condicion) {

            this.setTheta(theta);
            this.putTheta(theta);
            return this;
        }
        return this;
          
    },
    activarTheta: function () {
        "use strict";
        var condicion = this.isRama(),
            THETA;

        if (condicion) {

            THETA = this.thetaDOM().theta.prop("disabled", false);
            return this;
        }
        return this;
    },
    desactivarTheta: function () {
        "use strict";
        var condicion = this.isRama(),
            THETA;

        if (condicion) {

            THETA = this.thetaDOM().theta.prop("disabled", true);
            return this;
        }
        return this;
    },
    thetaActivado: function () {
        "use strict";
        var condicion = this.isRama();

        if (condicion) {

            return this.thetaDOM().theta.prop("disabled");

        }

    },
    thetaEvento: function () {
        "use strict";

        this.getTheta();

    },
    setThetaEvento: function () {
        "use strict";
        var condicion = this.isRama(),
            THETA,
            self = this;

        if (condicion) {
            THETA = this.thetaDOM().theta;

            THETA.change(function () {

                self.thetaEvento();

            });

        }

    },
    cargasElementoDOM: function () {
        "use strict";
        var nombre = this.nombre,
            CARGAS = this.miembrosWindow.CARGAS,
            $CARGAS_CONTENEDOR = $("#" + nombre + CARGAS.contenedor);

        return {
            elemento: $CARGAS_CONTENEDOR
        };
    },
    cargasDOM: function () {
        "use strict";
        var tipo = this.tipo,
            nombre = this.nombre,
            CARGAS = this.miembrosWindow.CARGAS;

        if (tipo === "Rama") {

            return {
                P: $("#" + nombre + CARGAS.Rama.P),
                Mip: $("#" + nombre + CARGAS.Rama.Mip),
                Mop: $("#" + nombre + CARGAS.Rama.Mop)
            };

        } else if (tipo === "Cordon") {

            return {
                Pi: $("#" + nombre + CARGAS.Cordon.Pi),
                Pd: $("#" + nombre + CARGAS.Cordon.Pd),
                Mi: $("#" + nombre + CARGAS.Cordon.Mi),
                Md: $("#" + nombre + CARGAS.Cordon.Md)
            };

        }
    },
    setCargas: function (cargas) {
        "use strict";
        var tipo = this.tipo;

        if (tipo === "Rama") {

            this.cargas = {
                P: Number(cargas.P),
                Mip: Number(cargas.Mip),
                Mop: Number(cargas.Mop)
            };

        } else if (tipo === "Cordon") {

            this.cargas = {
                Pi: Number(cargas.Pi),
                Pd: Number(cargas.Pd),
                Mi: Number(cargas.Mi),
                Md: Number(cargas.Md),
                P: Number(cargas.P)
            };

        }
        return this;

    },
    getCargas: function () {
        "use strict";
        var cargas,
            CARGAS = this.cargasDOM();

        for (cargas in CARGAS) {

            if (CARGAS.hasOwnProperty(cargas)) {

                this.cargas[cargas] = Number(CARGAS[cargas].val());

            }

        }


    },
    activarCargasElementos: function (elemento) {
        "use strict";
        var CARGAS = this.cargasDOM();

        if (CARGAS.hasOwnProperty(elemento)) {

            CARGAS[elemento].prop("disabled", false);
            return this;
        }
        return this;
    },
    desactivarCargasElementos: function (elemento) {
        "use strict";
        var CARGAS = this.cargasDOM();

        if (CARGAS.hasOwnProperty(elemento)) {

            CARGAS[elemento].prop("disabled", true);

            return this;
        }
        return this;
    },
    resetCargas: function () {
        "use strict";
        var tipo = this.tipo,
            cargas,
            CARGAS = this.cargasDOM();

        if (tipo === "Rama") {

            this.cargas = {
                P: 0,
                Mip: 0,
                Mop: 0
            };

        } else if (tipo === "Cordon") {

            this.cargas = {
                Pi: 0,
                Pd: 0,
                Mi: 0,
                Md: 0,
                P: 0
            };

        }

        for (cargas in CARGAS) {

            if (CARGAS.hasOwnProperty(cargas)) {

                CARGAS[cargas].val("0");

            }

        }

        return this;

    },
    cargasEventos: function () {
        "use strict";

        this.getCargas();

    },
    setCargasEventos: function () {
        "use strict";
        var CARGAS_ELEMENTOS = this.cargasElementoDOM().elemento,
            self = this;

        CARGAS_ELEMENTOS.change(function () {

            self.cargasEventos();

        });

    }
};

var Control = {
    miembros: [new Miembro("Cordon", "CORDON"),
               new Miembro("Rama", "RAMA-1"),
               new Miembro("Rama", "RAMA-2")
              ],
    
    conexion: {
        tipo: ""
    },

    seleccionarTipo: {
        "CONEXION_EN_K": function () {
            "use strict";

            if (Control.miembros[1].isTheta(90)) {

                Control.miembros[1].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            if (Control.miembros[2].isTheta(90)) {

                Control.miembros[2].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            Conexion_K.apply(Control, [1, 2, 0]);

        },
        "CONEXION_EN_N": function () {
            "use strict";

            Control.miembros[1].updateTheta(90)
                .desactivarTheta()
                .desactivarCargasElementos("Mip")
                .desactivarCargasElementos("Mop");

            if (Control.miembros[2].isTheta(90)) {

                Control.miembros[2].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            Conexion_K.apply(Control, [1, 2, 0]);
        },
        "CONEXION_EN_K-ESPACIAMIENTO": function () {
            "use strict";

            if (Control.miembros[1].isTheta(90)) {

                Control.miembros[1].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            if (Control.miembros[2].isTheta(90)) {

                Control.miembros[2].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            Conexion_K.apply(Control, [1, 2, 0]);

        },
        "CONEXION_EN_N-ESPACIAMIENTO": function () {
            "use strict";

            Control.miembros[1].updateTheta(90)
                .desactivarTheta()
                .desactivarCargasElementos("Mip")
                .desactivarCargasElementos("Mop");

            if (Control.miembros[2].isTheta(90)) {

                Control.miembros[2].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            Conexion_K.apply(Control, [1, 2, 0]);

        },
        "CONEXION_EN_K-TRASLAPE": function () {
            "use strict";

            if (Control.miembros[1].isTheta(90)) {

                Control.miembros[1].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            if (Control.miembros[2].isTheta(90)) {

                Control.miembros[2].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            Conexion_K.apply(Control, [1, 2, 0]);

        },
        "CONEXION_EN_N-TRASLAPE": function () {
            "use strict";

            Control.miembros[1].updateTheta(90)
                .desactivarTheta()
                .desactivarCargasElementos("Mip")
                .desactivarCargasElementos("Mop");

            if (Control.miembros[2].isTheta(90)) {

                Control.miembros[2].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            Conexion_K.apply(Control, [1, 2, 0]);

        },
        "CONEXION_EN_Y": function () {
            "use strict";

            if (Control.miembros[1].isTheta(90)) {

                Control.miembros[1].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            Conexion_Y.apply(Control, [1, 0]);

        },
        "CONEXION_EN_T": function () {
            "use strict";

            Control.miembros[1].updateTheta(90)
                .desactivarTheta()
                .activarCargasElementos("Mip")
                .activarCargasElementos("Mop");

            Conexion_Y.apply(Control, [1, 0]);

        },
        "CONEXION_EN_X1": function () {
            "use strict";

            if (Control.miembros[1].isTheta(90)) {

                Control.miembros[1].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            if (Control.miembros[2].isTheta(90)) {

                Control.miembros[2].updateTheta(30)
                    .activarTheta()
                    .desactivarCargasElementos("Mip")
                    .desactivarCargasElementos("Mop");

            }
            Conexion_X.apply(Control, [1, 2, 0]);

        },
        "CONEXION_EN_X2": function () {
            "use strict";

            Control.miembros[1].updateTheta(90)
                .desactivarTheta()
                .activarCargasElementos("Mip")
                .activarCargasElementos("Mop");

            Control.miembros[2].updateTheta(90)
                .desactivarTheta()
                .activarCargasElementos("Mip")
                .activarCargasElementos("Mop");

            Conexion_X.apply(Control, [1, 2, 0]);
        }
    },


    configuracion: function () {
        "use strict";

        Control.espaciamiento_o_traslape.evento();
        Control.menu.evento();


    },

    Error_set: function (mensaje) {
        "use strict";
        var text = "<p>",
            $contenedor = $("#MENSAJE");

        text += mensaje;
        text += "</p>";

        $contenedor.html(text);

    },
    Error_reset: function () {
        "use strict";
        var $contenedor = $("#MENSAJE");

        $contenedor.html("");

    },
    reporte_add: function (mensaje, etiquet) {
        "use strict";
        var etiqueta = etiquet || "p",
            text = "<" + etiqueta + ">",
            $contenedor = $("#REPORTE");

        text += mensaje;
        text += "</" + etiqueta + ">";

        $contenedor.append(text);

    },
    reporte_reset: function () {
        "use strict";
        var $contenedor = $("#REPORTE");

        $contenedor.html("");

    },
    reporte_encabezado: ["----------------------------------------------------------------" +
                         "------------------------------------------------------------------",
                         "RHS TO RHS DIRECT WELDED CONNECTIONS -- Beta version  v0.6.1.0",
                         "----------------------------------------------------------------" +
                         "------------------------------------------------------------------",
                         "Calculations are in conformance with the Load and Resistance Factor Design method (LRFD)",
                         "of the ANSI/AISC 360-10: Specification for Structural Steel Buildings - Chapter K.",
                         " ",
                         "<u>DISCLAIMER:</u>",
                         "This software is a beta version." +
                         " It may contain errors and it should not be used for connection design." +
                         "This tool is intended for use by qualified engineers.",
                         "Although every effort has been made to ensure the accuracy of this software and its documentation," +
                         " the user of this program assumes full responsibility for any and all output produced by the software," +
                         " and agrees not to hold the producers and distributors of the software responsible for any and all actions" +
                         " resulting from the use of this software.",
                         "The results obtained from the use of this program should not be substituted for sound engineering judgment",
                         " ",
                         "Designed and Developed by Rainer Ernst Reichel (rreichel86@gmail.com)"
                        ].join("<br>"),

    /*editar!*/
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
        evento: function () {
            "use strict";

            $("[id^=CONEXION]").bind("click mouseenter mouseleave", function (event) {
                var evento = event.type,
                    nombre = $(this).prop("id");

                if (evento === "click" && !($(this).children("p").hasClass("seleccionado"))) {

                    $(".seleccionado").removeClass("seleccionado").addClass("normal");
                    $(".opaco").removeClass("opaco").addClass("normal");
                    $(".visible").removeClass("visible").addClass("novisible");
                    $(this).children("p").removeClass("normal").addClass("seleccionado");
                    $(".normal").removeClass("normal").addClass("opaco");

                    Control.conexion = {};
                    Control.conexion.tipo = nombre;

                    $(this).children("ul").show();

                    $("div[id^=detalles]").hide();
                    $("div[id^=detalles]").removeClass();
                    $("div[id^=detalles]").addClass(nombre);
                    $("#detalles").show();
                    $("#DIAGRAMA").show();



                } else if (evento === "mouseenter" &&
                           ($(this).children("p").hasClass("seleccionado") || $(this).children("p").hasClass("normal"))) {

                    $(this).children("ul").show();

                } else if (evento === "mouseleave" &&
                           ($(this).children("p").hasClass("seleccionado") || $(this).children("p").hasClass("normal"))) {

                    $(this).children("ul").hide();

                }

            });

            $("[id^=CONEXION] ul p").bind("click mouseenter mouseleave", function (event) {
                var evento = event.type,
                    nombre = $(event.currentTarget).attr("name"),
                    conexion = $(this).parents("[id^=CONEXION]").prop("id");

                if (evento === "click") {

                    $(".visible").removeClass("visible").addClass("novisible");
                    $("#" + nombre).removeClass("novisible").addClass("visible");

                    $(this).parents("ul:first").hide();

                    $("div[id^=detalles]").hide();
                    $("#detalles_" + nombre).show();

                } else if (evento === "mouseenter") {

                    $("div[id^=detalles]").hide();
                    $("#detalles_" + nombre).show();

                } else if (evento === "mouseleave" && $(this).parents("ul:first").is(":visible")) {

                    $("div[id^=detalles]").hide();
                    $("#detalles").show();

                }


            });
        }
    },
    iniciar: function () {
        "use strict";
        Control.configuracion();

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
                evento = event.type;

            if (evento === "change" || (objetivo.split("_")[1] === "ST" && evento === "click")) {


                $("div[id^=detalles]").addClass(tipo);
                $("div[id^=detalles]").removeClass();
                $("div[id^=detalles]").addClass(tipo);
                $("#DIAGRAMA").show();
                Control.seleccionarTipo[tipo]();
            }
        });

        $("#MENU").bind("click", function (event) {
            var tipo = Control.conexion.tipo,
                objetivo = $(event.target).text();


            $("div[id^=detalles]").addClass(tipo);
            $("div[id^=detalles]").removeClass();
            $("div[id^=detalles]").addClass(tipo);
            $("#DIAGRAMA").show();

            Control.seleccionarTipo[tipo]();
        });

    }
};

Control.iniciar();