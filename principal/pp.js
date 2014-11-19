/*jslint browser: true, devel: true*/
/*global Control, Conexion_Y, Conexion_X, Conexion_K*/
var seleccionarTipo = {
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

        Control.miembros[1].isTheta(90)
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

        Control.miembros[1].isTheta(90)
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

        Control.miembros[1].isTheta(90)
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

        Control.miembros[1].isTheta(90)
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

        Control.miembros[1].isTheta(90)
            .desactivarTheta()
            .activarCargasElementos("Mip")
            .activarCargasElementos("Mop");

        Control.miembros[2].isTheta(90)
            .desactivarTheta()
            .activarCargasElementos("Mip")
            .activarCargasElementos("Mop");

        Conexion_X.apply(Control, [1, 2, 0]);
    }
};