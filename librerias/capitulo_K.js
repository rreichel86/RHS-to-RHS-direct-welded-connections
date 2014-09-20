/*jslint browser: true, maxlen: 150*/
/*global $, jQuery, estaVacio, Formulas, Mustache, Control*/

/* Estructura de los datos de entrada
 *
 * Cordón = {
 *      Material:{
 *             nombre:
 *               Fy:
 *               Fu:
 *      }
 *      Sección:{
 *              nombre:
 *                 H:
 *                 B:
 *              tdes:
 *                Sx:
 *                Sy:
 *                Zx:
 *                Zy:
 *      }
 *      Cargas: {
 *            Pi:
 *            Mi:
 *            Pd:
 *            Md:
 *      }
 * }
 *
 * Rama = {
 *      Material:{
 *             name:
 *               fy:
 *               fu:
 *      }
 *      Sección:{
 *              size:
 *                 H:
 *                 B:
 *              tdes:
 *                Sx:
 *                Sy:
 *                Zx:
 *                Zy:
 *      }
 *      Ángulo:
 *      Cargas: {
 *            P:
 *            Mip:
 *            Mop:
 *      }
 * }
 */
/**
 * Herramienta: Convierte grados a radianes
 */
var toRad = function (deg) {
    "use strict";
    var PI = Math.PI,
        rad;

    rad = (deg * PI) / 180;
    return rad;
};
// Limites de aplicación //
// Conexiones en T, Y, X, K y N //
/*  LÍMITES 

        CORDÓN:
      ----------
      -> RESISTENCIA DEL MATERIAL: Fy = __ ksi <= 52 ksi 
      -> DUCTILIDAD: Fy/Fu = __ <= 0.8 ó ASTM 500 GR. C
      -> RAZÓN DE ASPECTO:  0.5 <= H/B = __ <= 2
      -> ESBELTEZ DE LA PAREDES: B/t = __ <= 35  ó 30
                                 H/t = __ <= 35 

        RAMA-1:
      ----------    
      -> RESISTENCIA DEL MATERIAL: Fyb = __ ksi <= 52 ksi 
      -> DUCTILIDAD: Fyb/Fub = __ <= 0.8 ó ASTM 500 GR. C
      -> RAZÓN DE ASPECTO:  0.5 <= Hb/Bb = __ <= 2
      -> ESBELTEZ DE LA PAREDES: Bb/tb = __ <= 35 
                                 Bb/tb = __ <= 1.25*(E/Fyb)^0.5 = __ ó
                                               1.10*(E/Fyb)^0.5 = __
                                                
                                 Hb/tb = __ <= 35                               
                                 Hb/tb = __ <= 1.25*(E/Fyb)^0.5 = __ ó
                                               1.10*(E/Fyb)^0.5 = __
                                                
      -> ANGULO: theta = __ >= 30 deg
      -> RAZÓN DE ANCHOS: Bb/B = __ >= 0.25 ó
                                       0.1 + gamma/50 = __
                                        
                          Hb/B = __ >= 0.25 ó
                                       0.1 + gamma/50 = __


        CONEXIÓN: 
      ------------

      -> RAZÓN DE ANCHO EFECTIVO: Betha_eff = __ >= 0.35
      -> RAZÓN DE ANCHO DE LAS RAMAS: Bbi/Bbj = __ >= 0.75
                                    Bmin/Bmax = __ >= 0.63 (Si ambas son cuadradas)

      -> RAZÓN DE ESPESOR DE LAS RAMAS: tbi/tbj = __ <= 1


      -> EXCENTRICIDAD: -0.55 <= e/H = __ <= 0.25

      -> ESPACIAMIENTO: g = __ >= tb1 + tb2 = __

      -> RAZÓN DE ESPACIAMIENTO: 0.5*(1-Betha_eff) = __ <= g/B = __ <= 1.5*(1-Betha_eff) = __
      -> TRASLAPE: 25% <= Ov = __ <= 100%

*/
/*  ERRORES

      -> ERROR: CORDÓN - SECCIÓN TRANSVERSAL NO DEFINIDA !
      -> ERROR: CORDÓN - RESISTENCIA DEL MATERIAL: Fy es > 52 ksi ! 
      -> ERROR: CORDÓN - DUCTILIDAD: Fy/Fu es >  0.8 ó ASTM 500 GR. C !
      -> ERROR: CORDÓN - RAZÓN DE ASPECTO:  H/B  debe de ser < 0.5 ó es > 2 !
      -> ERROR: CORDÓN - ESBELTEZ DE LA PAREDES: B/t es > 35  ó 30 !
                                                 H/t es > 35 ! 

      -> ERROR: RAMA-# - SECCIÓN TRANSVERSAL NO DEFINIDA !
      -> ERROR: RAMA-# - RESISTENCIA DEL MATERIAL: Fyb es > 52 ksi !
      -> ERROR: RAMA-# - DUCTILIDAD: Fyb/Fub es >  0.8 ó ASTM 500 GR. C !
      -> ERROR: RAMA-# - RAZÓN DE ASPECTO:  Hb/Bb  debe de ser < 0.5 ó > 2 !
      -> ERROR: RAMA-# - ESBELTEZ DE LA PAREDES: Bb/tb es > 35 ! 
                                                 Bb/tb es > 1.25*(E/Fyb)^0.5 = __  ó
                                                            1.10*(E/Fyb)^0.5 = __ !
                                                            
                                                 Hb/tb es > 35                               
                                                 Hb/tb es > 1.25*(E/Fyb)^0.5 = __  ó
                                                            1.10*(E/Fyb)^0.5 = __ !
     
     -> ERROR: RAMA-# - ANGULO: theta es < 30 deg ó > 90 deg  !  
     -> ERROR: RAMA-# - RAZÓN DE ANCHOS: Bb/B es < 0.25 ó
                                                    0.1 + gamma/50 = __ !
                                                    
                                         Hb/B es < 0.25 ó
                                                    0.1 + gamma/50 = __ !  

      -> ERROR: RAZÓN DE ANCHO EFECTIVO: Betha_eff es < 0.35 !
      -> ERROR: RAZÓN DE ANCHO DE LAS RAMAS: Bbi/Bbj es < 0.75 !
                                            Bmin/Bmax es < 0.63 (Si ambas son cuadradas) !
                                            
      -> ERROR: RAZÓN DE ESPESOR DE LAS RAMAS: tbi/tbj es > 1 !

      -> ERROR: EXCENTRICIDAD: e esta fuera de los limites permitidos  -0.55*H  <= e <= 0.25*H !

      -> ERROR: ESPACIAMIENTO: g es < tb1 + tb2 = __ !

      -> ERROR: RAZÓN DE ESPACIAMIENTO: g = __ es <  0.5*(1-Betha_eff)*B = __
      -> ERROR: RAZÓN DE ESPACIAMIENTO: g = __ es >  1.5*(1-Betha_eff)*B = __ 
      -> ERROR: TRASLAPE:  Ov = __ es < 25% o es > 100% !

*/
var limites = {
    rama: function (miembro_b, miembro) {
        "use strict";
        var raiz = Math.sqrt,
            tipo = this.conexion.tipo,
            nombre = this.miembros[miembro_b].nombre.replace(/_|-/g, " "),
            material = this.miembros[miembro_b].material.nombre,
            Fy = this.miembros[miembro_b].material.Fy,
            Fu = this.miembros[miembro_b].material.Fu,
            H = this.miembros[miembro_b].seccion.H,
            B = this.miembros[miembro_b].seccion.B,
            t = this.miembros[miembro_b].seccion.tdes,
            Pr = this.miembros[miembro_b].cargas.P,
            nombre0 = this.miembros[miembro].nombre.replace(/_|-/g, " "),
            B0 = this.miembros[miembro].seccion.B,
            gamma = this.miembros[miembro].seccion.gamma,
            theta = this.miembros[miembro_b].theta,
            E = 29000,
            mensaje,
            titulo,
            mensajes = [];


        if (estaVacio(this.miembros[miembro].seccion) === true ||
                this.miembros[miembro].seccion.nombre === undefined ||
                this.miembros[miembro].seccion.nombre === "Designacion") {

            mensaje = "ERROR: " + nombre0 + " - SECCIÓN TRANSVERSAL NO DEFINIDA !";
            return this.Error_set(mensaje);

        } else if (estaVacio(this.miembros[miembro_b].seccion) === true ||
                   this.miembros[miembro_b].seccion.nombre === undefined ||
                   this.miembros[miembro_b].seccion.nombre === "Designacion") {

            mensaje = "ERROR: " + nombre + " - SECCIÓN TRANSVERSAL NO DEFINIDA !";
            return this.Error_set(mensaje);

        } else {

            mensaje = "<h3>-- LÍMITES DE APLICACIÓN - " + nombre + "</h3>";

            if (Fy <= 52) {
                
                mensaje += "<p>";
                mensaje += "RESISTENCIA DEL MATERIAL: F<sub>yb</sub> = " + Fy + " Ksi <= 52 Ksi";
                mensajes.push(mensaje);

            } else {

                mensaje = "ERROR: " + nombre + " - RESISTENCIA DEL MATERIAL: F<sub>yb</sub> debe ser <= 52 Ksi !";
                return this.Error_set(mensaje);

            }



            if (Fy / Fu <= 0.8 || material === "ASTM A500 Gr. C") {

                mensaje = "DUCTILIDAD DEL MATERIAL: F<sub>yb</sub>/F<sub>ub</sub> = " +
                    (Fy / Fu).toFixed(3) + " <= 0.8 ó es ASTM A500 Gr. C";
                
                mensajes.push(mensaje);


            } else {

                mensaje = "ERROR: " + nombre + " - RESISTENCIA DEL MATERIAL: F<sub>yb</sub>/F<sub>ub</sub> debe ser <= 0.8 !";
                return this.Error_set(mensaje);

            }


            if (H / B >= 0.5 && H / B <= 2.0) {

                mensaje = "RAZÓN DE ASPECTO:  0.5 <= H<sub>b</sub>/B<sub>b</sub> = " + (H / B).toFixed(2) + " <= 2";
                mensajes.push(mensaje);

            } else {

                mensaje = "ERROR: " + nombre + " - RAZÓN DE ASPECTO: H<sub>b</sub>/B<sub>b</sub> debe ser >= 0.5 y <= 2.0 !";
                return this.Error_set(mensaje);

            }



            if (B / t <= 35) {

                mensaje = "ESBELTEZ DE LA PARED: B<sub>b</sub>/t<sub>b</sub> = " + (B / t).toFixed(2) + " <= 35";
                mensajes.push(mensaje);

            } else {

                mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: B<sub>b</sub>/t<sub>b</sub> = " +
                    (B / t).toFixed(2) + " es > 35 !";
                
                return this.Error_set(mensaje);

            }

            if ((Pr <= 0) && (tipo === "CONEXION_EN_K-ESPACIAMIENTO" ||
                              tipo === "CONEXION_EN_N-ESPACIAMIENTO" ||
                              tipo === "CONEXION_EN_Y" ||
                              tipo === "CONEXION_EN_T" ||
                              tipo === "CONEXION_EN_X1" ||
                              tipo === "CONEXION_EN_X2")) {

                if (B / t <= 1.25 * raiz(E / Fy)) {

                    mensaje = "ESBELTEZ DE LA PARED: B<sub>b</sub>/t<sub>b</sub> = " + (B / t).toFixed(2) +
                        " <= 1.25*(E/F<sub>yb</sub>)<sup>0.5</sup> = " + (1.25 * raiz(E / Fy)).toFixed(2);
                    
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: B<sub>b</sub>/t<sub>b</sub> = " + (B / t).toFixed(2) +
                        " > 1.25*(E/F<sub>yb</sub>)<sup>0.5</sup> = " + (1.25 * raiz(E / Fy)).toFixed(2) + " !";
                    
                    return this.Error_set(mensaje);

                }

            } else if ((Pr <= 0) && (tipo === "CONEXION_EN_K-TRASLAPE" ||
                                     tipo === "CONEXION_EN_N-TRASLAPE")) {

                if (B / t <= 1.10 * raiz(E / Fy)) {

                    mensaje = "ESBELTEZ DE LA PARED: B<sub>b</sub>/t<sub>b</sub> = " + (B / t).toFixed(2) +
                        " <= 1.10*(E/F<sub>yb</sub>)<sup>0.5</sup> = " + (1.10 * raiz(E / Fy)).toFixed(2);
                    
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: B<sub>b</sub>/t<sub>b</sub> = " + (B / t).toFixed(2) +
                        " > 1.10*(E/F<sub>yb</sub>)<sup>0.5</sup> = " + (1.10 * raiz(E / Fy)).toFixed(2) + " !";
                    
                    return this.Error_set(mensaje);

                }
            }


            if (H / t <= 35) {

                mensaje = "ESBELTEZ DE LA PARED: H<sub>b</sub>/t<sub>b</sub> = " + (H / t).toFixed(2) + " <= 35";
                mensajes.push(mensaje);

            } else {

                mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: H<sub>b</sub>/t<sub>b</sub> = " + (H / t).toFixed(2) +
                    " es > 35 !";
                
                return this.Error_set(mensaje);
            }

            if ((Pr <= 0) && (tipo === "CONEXION_EN_K-ESPACIAMIENTO" ||
                              tipo === "CONEXION_EN_N-ESPACIAMIENTO" ||
                              tipo === "CONEXION_EN_Y" ||
                              tipo === "CONEXION_EN_T" ||
                              tipo === "CONEXION_EN_X1" ||
                              tipo === "CONEXION_EN_X2")) {

                if (H / t <= 1.25 * raiz(E / Fy)) {

                    mensaje = "ESBELTEZ DE LA PARED: H<sub>b</sub>/t<sub>b</sub> = " + (H / t).toFixed(2) +
                        " <= 1.25*(E/F<sub>yb</sub>)<sup>0.5</sup> = " + (1.25 * raiz(E / Fy)).toFixed(2);
                    
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: H<sub>b</sub>/t<sub>b</sub> = " + (H / t).toFixed(2) +
                        " > 1.25*(E/F<sub>yb</sub>)<sup>0.5</sup> = " + (1.25 * raiz(E / Fy)).toFixed(2) + " !";
                    return this.Error_set(mensaje);

                }

            } else if ((Pr <= 0) && (tipo === "CONEXION_EN_K-TRASLAPE" || tipo === "CONEXION_EN_N-TRASLAPE")) {

                if (H / t <= 1.10 * raiz(E / Fy)) {

                    mensaje = "ESBELTEZ DE LA PARED: H<sub>b</sub>/t<sub>b</sub> = " + (H / t).toFixed(2) +
                        " <= 1.10*(E/F<sub>yb</sub>)<sup>0.5</sup> = " + (1.10 * raiz(E / Fy)).toFixed(2);
                    
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: H<sub>b</sub>/t<sub>b</sub> = " + (H / t).toFixed(2) +
                        " > 1.10*(E/F<sub>yb</sub>)<sup>0.5</sup> = " + (1.10 * raiz(E / Fy)).toFixed(2) + " !";
                    return this.Error_set(mensaje);

                }
            }
            if (theta >= 30 && theta <= 90) {

                mensaje = "ANGULO DE LA RAMA: &#952; = " + theta + " >= 30";
                mensajes.push(mensaje);

            } else {

                mensaje = "ERROR:  " + nombre + " - ANGULO DE LA RAMA: &#952; = " + theta + " < 30 !";
                return this.Error_set(mensaje);

            }


            if (tipo === "CONEXION_EN_K-TRASLAPE" ||
                    tipo === "CONEXION_EN_N-TRASLAPE" ||
                    tipo === "CONEXION_EN_Y" ||
                    tipo === "CONEXION_EN_T" ||
                    tipo === "CONEXION_EN_X1" ||
                    tipo === "CONEXION_EN_X2") {

                if (B / B0 >= 0.25 && B / B0 <= 1.00) {

                    mensaje = "RAZÓN DE ANCHOS: B<sub>b</sub>/B = " + (B / B0).toFixed(3) + " >= 0.25";
                    mensajes.push(mensaje);

                } else if (B / B0 < 0.25) {

                    mensaje = "ERROR: " + nombre + " - RAZÓN DE ANCHOS: B<sub>b</sub>/B = " + (B / B0).toFixed(3) + " es < 0.25 !";
                    return this.Error_set(mensaje);

                } else if (B / B0 > 1.00) {

                    mensaje = "ERROR: " + nombre + " - RAZÓN DE ANCHOS: B<sub>b</sub>/B = " + (B / B0).toFixed(3) + " es > 1.00 !";
                    return this.Error_set(mensaje);

                }

            } else if (tipo === "CONEXION_EN_K-ESPACIAMIENTO" ||
                       tipo === "CONEXION_EN_N-ESPACIAMIENTO") {

                if (B / B0 >= (0.1 + gamma / 50) && B / B0 <= 1.00) {

                    mensaje = "RAZÓN DE ANCHOS: B<sub>b</sub>/B = " + (B / B0).toFixed(3) +
                        " >= 0.1 + gamma/50 = " + (0.1 + gamma / 50).toFixed(3);
                    
                    mensajes.push(mensaje);

                } else if (B / B0 < (0.1 + gamma / 50)) {

                    mensaje = "ERROR: " + nombre + " - RAZÓN DE ANCHOS: B<sub>b</sub>/B = " + (B / B0).toFixed(3) +
                        " es < 0.1 + gamma/50 = " + (0.1 + gamma / 50).toFixed(3) + " !";
                    
                    return this.Error_set(mensaje);

                } else if (B / B0 > 1.00) {

                    mensaje = "ERROR: " + nombre + " - RAZÓN DE ANCHOS: B<sub>b</sub>/B = " + (B / B0).toFixed(3) + " es > 1.00 !";
                    return this.Error_set(mensaje);

                }
            }


            if (tipo === "CONEXION_EN_K-TRASLAPE" ||
                    tipo === "CONEXION_EN_N-TRASLAPE" ||
                    tipo === "CONEXION_EN_Y" ||
                    tipo === "CONEXION_EN_T" ||
                    tipo === "CONEXION_EN_X1" ||
                    tipo === "CONEXION_EN_X2") {

                if (H / B0 >= 0.25) {

                    mensaje = "RAZÓN DE ANCHOS: H<sub>b</sub>/B = " + (H / B0).toFixed(3) + " >= 0.25";
                    mensaje += "</p>";
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: " + nombre + " - RAZÓN DE ANCHOS: H<sub>b</sub>/B = " + (H / B0).toFixed(3) + " es < 0.25 !";
                    return this.Error_set(mensaje);

                }

            } else if (tipo === "CONEXION_EN_K-ESPACIAMIENTO" ||
                       tipo === "CONEXION_EN_N-ESPACIAMIENTO") {

                if (H / B0 >= (0.1 + gamma / 50)) {

                    mensaje = "RAZÓN DE ANCHOS: H<sub>b</sub>/B = " + (H / B0).toFixed(3) +
                        " >= 0.1 + gamma/50 = " + (0.1 + gamma / 50).toFixed(3);
                    
                    mensaje += "</p>";
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: " + nombre + " - RAZÓN DE ANCHOS: H<sub>b</sub>/B = " + (H / B0).toFixed(3) +
                        " es < 0.1 + gamma/50 = " + (0.1 + gamma / 50).toFixed(3) + " !";
                    
                    return this.Error_set(mensaje);

                }

            }
            this.Error_reset();
            return mensajes;
        }
    },
    cordon: function (miembro) {
        "use strict";
        var raiz = Math.sqrt,
            tipo = this.conexion.tipo,
            nombre = this.miembros[miembro].nombre.replace(/_|-/g, " "),
            material = this.miembros[miembro].material.nombre,
            Fy = this.miembros[miembro].material.Fy,
            Fu = this.miembros[miembro].material.Fu,
            H = this.miembros[miembro].seccion.H,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            E = 29000,
            mensaje,
            mensajes = [];

        if (estaVacio(this.miembros[miembro].seccion) === true ||
                this.miembros[miembro].seccion.nombre === undefined ||
                this.miembros[miembro].seccion.nombre === "Designacion") {

            mensaje = "ERROR: " + nombre + " - SECCIÓN TRANSVERSAL NO DEFINIDA !";
            return this.Error_set(mensaje);

        } else {

            mensaje = "<h3>-- LÍMITES DE APLICACIÓN - " + nombre + "</h3>";

            if (Fy <= 52) {
                mensaje += "<p>";
                mensaje += "RESISTENCIA DEL MATERIAL: F<sub>y</sub> = " + Fy + " Ksi <= 52 Ksi";
                mensajes.push(mensaje);

            } else {

                mensaje = "ERROR: " + nombre + " - RESISTENCIA DEL MATERIAL: F<sub>y</sub> debe ser <= 52 Ksi !";
                return this.Error_set(mensaje);

            }

            if (Fy / Fu <= 0.8 || material === "ASTM A500 Gr. C") {

                mensaje = "DUCTILIDAD DEL MATERIAL: F<sub>y</sub>/F<sub>u</sub> = " + (Fy / Fu).toFixed(3) + " <= 0.8 ó es ASTM A500 Gr. C";
                mensajes.push(mensaje);


            } else {

                mensaje = "ERROR: " + nombre + " - RESISTENCIA DEL MATERIAL: F<sub>y</sub>/F<sub>u</sub> debe ser <= 0.8 !";
                return this.Error_set(mensaje);

            }

            if (H / B >= 0.5 && H / B <= 2.0) {

                mensaje = "RAZÓN DE ASPECTO:  0.5 <= H/B = " + (H / B).toFixed(2) + " <= 2";
                mensajes.push(mensaje);

            } else {

                mensaje = "ERROR: " + nombre + " - RAZÓN DE ASPECTO: H/B debe ser >= 0.5 y <= 2.0 !";
                return this.Error_set(mensaje);

            }

            if (tipo === "CONEXION_EN_K-ESPACIAMIENTO" ||
                    tipo === "CONEXION_EN_N-ESPACIAMIENTO" ||
                    tipo === "CONEXION_EN_Y" ||
                    tipo === "CONEXION_EN_T" ||
                    tipo === "CONEXION_EN_X1" ||
                    tipo === "CONEXION_EN_X2") {

                if (B / t <= 35) {

                    mensaje = "ESBELTEZ DE LA PARED: B/t = " + (B / t).toFixed(2) + " <= 35";

                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: B/t = " + (B / t).toFixed(2) + " es > 35 !";
                    return this.Error_set(mensaje);

                }

            } else if (tipo === "CONEXION_EN_K-TRASLAPE" || tipo === "CONEXION_EN_N-TRASLAPE") {

                if (B / t <= 30) {

                    mensaje = "ESBELTEZ DE LA PARED: B/t = " + (B / t).toFixed(2) + " <= 30";

                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: B/t = " + (B / t).toFixed(2) + " es > 30 !";
                    return this.Error_set(mensaje);

                }

            }

            if (H / t <= 35) {

                mensaje = "ESBELTEZ DE LA PARED: H/t = " + (H / t).toFixed(2) + " <= 35";
                mensaje += "</p>";
                mensajes.push(mensaje);

            } else {

                mensaje = "ERROR:  " + nombre + " - ESBELTEZ DE LA PARED: H/t = " + (H / t).toFixed(2) + " es > 35 !";
                return this.Error_set(mensaje);

            }
            this.Error_reset();
            return mensajes;
        }
    },
    conexion: function (miembro_b1, miembro_b2, miembro) {
        "use strict";
        var sin = Math.sin,
            tipo = this.conexion.tipo,
            e = this.conexion.e,
            g = this.conexion.g,
            Ov = this.conexion.Ov,
            nombre_1 = this.miembros[miembro_b1].nombre.replace(/_|-/g, " "),
            Bb_1 = this.miembros[miembro_b1].seccion.B,
            Hb_1 = this.miembros[miembro_b1].seccion.H,
            tb_1 = this.miembros[miembro_b1].seccion.tdes,
            nombre_2 = this.miembros[miembro_b2].nombre.replace(/_|-/g, " "),
            Bb_2 = this.miembros[miembro_b2].seccion.B,
            Hb_2 = this.miembros[miembro_b2].seccion.H,
            tb_2 = this.miembros[miembro_b2].seccion.tdes,
            nombre = this.miembros[miembro].nombre.replace(/_|-/g, " "),
            B = this.miembros[miembro].seccion.B,
            H = this.miembros[miembro].seccion.H,
            beta_eff,
            Bb_min,
            Bb_max,
            mensaje,
            mensajes = [];

        if (estaVacio(this.miembros[miembro].seccion) === true ||
                this.miembros[miembro].seccion.nombre === undefined ||
                this.miembros[miembro].seccion.nombre === "Designacion") {

            mensaje = "ERROR: " + nombre + " - SECCIÓN TRANSVERSAL NO DEFINIDA !";
            return this.Error_set(mensaje);

        } else if (estaVacio(this.miembros[miembro_b1].seccion) === true ||
                   this.miembros[miembro_b1].seccion.nombre === undefined ||
                   this.miembros[miembro_b1].seccion.nombre === "Designacion") {

            mensaje = "ERROR: " + nombre_1 + " - SECCIÓN TRANSVERSAL NO DEFINIDA !";
            return this.Error_set(mensaje);

        } else if (estaVacio(this.miembros[miembro_b2].seccion) === true ||
                   this.miembros[miembro_b2].seccion.nombre === undefined ||
                   this.miembros[miembro_b2].seccion.nombre === "Designacion") {

            mensaje = "ERROR: " + nombre_2 + " - SECCIÓN TRANSVERSAL NO DEFINIDA !";
            return this.Error_set(mensaje);

        } else if (e === undefined) {

            mensaje = "ERROR - EXCENTRICIDAD e NO DEFINIDA !";
            return this.Error_set(mensaje);

        } else {

            mensaje = "<h3>-- LÍMITES DE APLICACIÓN - " + tipo.replace(/_|-/g, " ") + "</h3>";

            if (tipo === "CONEXION_EN_K-ESPACIAMIENTO" || tipo === "CONEXION_EN_N-ESPACIAMIENTO") {

                //beta_eff = (Bb_1 + Hb_1 + Bb_2 + Hb_2) / (4 * B);
                beta_eff = Formulas.beta_eff.apply(this, [miembro_b1, miembro_b2, miembro]);

                if (beta_eff >= 0.35) {

                    this.conexion.beta_eff = beta_eff;
                    mensaje += "<p>";
                    mensaje += "RAZÓN DE ANCHO EFECTIVO: &#946;<sub>eff</sub> = " + (beta_eff).toFixed(3) + " >= 0.35";
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: RAZÓN DE ANCHO EFECTIVO: &#946;<sub>eff</sub> = " + (beta_eff).toFixed(3) + " < 0.35 !";
                    return this.Error_set(mensaje);

                }


                if (Bb_1 === Hb_1 && Bb_2 === Hb_2) {

                    Bb_min = (Bb_1 > Bb_2) ? Bb_2 : Bb_1;
                    Bb_max = (Bb_1 > Bb_2) ? Bb_1 : Bb_2;


                    if (Bb_min / Bb_max >= 0.63) {

                        mensaje = "RAZÓN DE ANCHO DE LAS RAMAS: B<sub>b, min</sub>/B<sub>b, max</sub> =" + (Bb_min / Bb_max).toFixed(3) +
                            " >= 0.63";
                        
                        mensajes.push(mensaje);

                    } else {

                        mensaje = "ERROR: RAZÓN DE ANCHO DE LAS RAMAS: B<sub>b, min</sub>/B<sub>b, max</sub> = " + (Bb_min / Bb_max).toFixed(3) +
                            " < 0.63 !";
                        
                        return this.Error_set(mensaje);

                    }
                }

                if (e / H >= -0.55 && e / H <= 0.25) {

                    mensaje = "EXCENTRICIDAD: -0.55 <= e/H = " + (e / H).toFixed(3) + " <= 0.25";
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: EXCENTRICIDAD: e =" + e.toFixed(3) +
                        " debe ser >= -0.55*H = " + (-0.55 * H).toFixed(3) + " y <= 0.25*H = " + (0.25 * H).toFixed(3) + " !";
                    
                    return this.Error_set(mensaje);
                }


                if (g >= tb_1 + tb_2) {

                    mensaje = "ESPACIAMIENTO: g = " + (g).toFixed(3) +
                        " >= t<sub>b, 1</sub> + t<sub>b, 2</sub> = " + (tb_1 + tb_2).toFixed(3);
                    
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: ESPACIAMIENTO: g = " + (g).toFixed(3) +
                        " < t<sub>b, 1</sub> + t<sub>b, 2</sub> = " + (tb_1 + tb_2).toFixed(3);
                    
                    return this.Error_set(mensaje);

                }


                if (g / B >= 0.5 * (1 - beta_eff) && g / B <= 1.5 * (1 - beta_eff)) {

                    mensaje = "RAZÓN DE ESPACIAMIENTO: 0.5*(1-&#946;<sub>eff</sub>) = " + (0.5 * (1 - beta_eff)).toFixed(3) +
                        " <= g/B = " + (g / B).toFixed(3) + " <= 1.5*(1-&#946;<sub>eff</sub>) = " + (1.5 * (1 - beta_eff)).toFixed(3);
                    
                    mensaje += "</p>";
                    mensajes.push(mensaje);

                } else {

                    if (g / B < 0.5 * (1 - beta_eff)) {
                        
                        mensaje = "ERROR: RAZÓN DE ESPACIAMIENTO: g/B = " + (g / B).toFixed(3) +
                            " es < 0.5*(1-&#946;<sub>eff</sub>) = " + (0.5 * (1 - beta_eff)).toFixed(3) + " !";
                        
                        return this.Error_set(mensaje);
                        
                    } else if (g / B > 1.5 * (1 - beta_eff)) {
                        
                        mensaje = "ERROR: RAZÓN DE ESPACIAMIENTO: g/B = " + (g / B).toFixed(3) +
                            " es > 1.5*(1-&#946;<sub>eff</sub>) = " + (1.5 * (1 - beta_eff)).toFixed(3) + " !";
                        
                        return this.Error_set(mensaje);

                    }

                }

            } else if (tipo === "CONEXION_EN_K-TRASLAPE" || tipo === "CONEXION_EN_N-TRASLAPE") {


                if (Bb_2 / Bb_1 >= 0.75) {
                    
                    mensaje += "<p>";
                    mensaje += "RAZÓN DE ANCHO DE LAS RAMAS: B<sub>b, 2</sub>/B<sub>b, 1</sub> = " + (Bb_2 / Bb_1).toFixed(3) + " >= 0.75";
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: RAZÓN DE ANCHO DE LAS RAMAS: B<sub>b, 2</sub>/B<sub>b, 1</sub> = " + (Bb_2 / Bb_1).toFixed(3) +
                        " < 0.75 !";
                    
                    return this.Error_set(mensaje);

                }


                if (tb_2 / tb_1 <= 1.0) {

                    mensaje = "RAZÓN DE ESPESOR DE LAS RAMAS: t<sub>b, 2</sub>/t<sub>b, 1</sub> = " + (tb_2 / tb_1).toFixed(3) +
                        " &#8804 1.0";
                    
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: RAZÓN DE ESPESOR DE LAS RAMAS: t<sub>b, 2</sub>/t<sub>b, 1</sub> = " + (tb_2 / tb_1).toFixed(3) +
                        " > 1.0 !";
                    
                    return this.Error_set(mensaje);

                }
                if (e / H >= -0.55 && e / H <= 0.25) {

                    mensaje = "EXCENTRICIDAD: -0.55 <= e/H = " + (e / H).toFixed(3) + " <= 0.25";
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: EXCENTRICIDAD: e =" + e.toFixed(3) +
                        " debe ser >= -0.55*H = " + (-0.55 * H).toFixed(3) + " y <= 0.25*H = " + (0.25 * H).toFixed(3) + " !";
                    
                    return this.Error_set(mensaje);

                }
                if (Ov >= 25 && g / B <= 100) {

                    mensaje = "TRASLAPE: 25% &#8804 O<sub>v</sub> =" + Ov.toFixed(2) + " <= 100%";
                    mensaje += "</p>";
                    mensajes.push(mensaje);

                } else {

                    mensaje = "ERROR: TRASLAPE: O<sub>v</sub> =" + Ov.toFixed(2) + " < 25% ó > 100% !";
                    return this.Error_set(mensaje);

                }
            }
            this.Error_reset();
            return mensajes;
        }
    }
};

var resistencia = {
    plantillas: ["<h3>",
                 "-- RESISTENCIA -",
                 "{{nombre}} ",
                 "{{#descripcion}}",
                 "({{descripcion}})",
                 "{{/descripcion}}",
                 "</h3>",

                 "{{#axial}}",
                 "<h4>",
                 "RESISTENCIA DE DISEÑO A AXIAL:",
                 "</h4>",
                 "<table class =\"axial\">",
                 "{{#resistencias}}",
                 "<tr>",
                 "<td colspan=\"6\">{{name}}</td>",
                 "</tr>",
                 "<tr>",
                 "<td>&#934 =</td>",
                 "<td>{{phi}}</td>",
                 "<td>P<sub>n</sub> (kip) = </td>",
                 "<td>{{fixPn}}</td>",
                 "<td>P<sub>d</sub> (kip) = </td>",
                 "<td>{{fixPd}}</td>",
                 "</tr>",
                 "{{/resistencias}}",
                 "</table>",
                 "{{/axial}}",
                 
                 "{{#flexion_ip}}",
                 "<h4>",
                 "RESISTENCIA DE DISEÑO A FLEXIÓN EN EL PLANO:",
                 "</h4>",
                 "<table class =\"flexion\">",
                 "{{#resistencias}}",
                 "<tr>",
                 "<td colspan=\"6\">{{name}}</td>",
                 "</tr>",
                 "<tr>",
                 "<td>&#934 =</td>",
                 "<td>{{phi}}</td>",
                 "<td>M<sub>n-ip</sub> (kip-in) = </td>",
                 "<td>{{fixMn}}</td>",
                 "<td>M<sub>d-ip</sub> (kip-in) = </td>",
                 "<td>{{fixMd}}</td>",
                 "</tr>",
                 "{{/resistencias}}",
                 "</table>",
                 "{{/flexion_ip}}",
                 
                 "{{#flexion_op}}",
                 "<h4>",
                 "RESISTENCIA DE DISEÑO A FLEXIÓN FUERA DEL PLANO:",
                 "</h4>",
                 "<table class =\"flexion\">",
                 "{{#resistencias}}",
                 "<tr>",
                 "<td colspan=\"6\">{{name}}</td>",
                 "</tr>",
                 "<tr>",
                 "<td>&#934 =</td>",
                 "<td>{{phi}}</td>",
                 "<td>M<sub>n-op</sub> (kip-in) = </td>",
                 "<td>{{fixMn}}</td>",
                 "<td>M<sub>d-op</sub> (kip-in) = </td>",
                 "<td>{{fixMd}}</td>",
                 "</tr>",
                 "{{/resistencias}}",
                 "</table>",
                 "{{/flexion_op}}",

                 "{{#verificar}}",
                 "<h3>",
                 "-- VERIFICAR -",
                 "{{nombre}} ",
                 "{{#descripcion}}",
                 "({{descripcion}})",
                 "{{/descripcion}}",
                 "</h3>",
                 "{{/verificar}}",

                 "{{#axial}}",
                 "{{#mostrar}}",
                 "<h4>",
                 "SOLICITADA A AXIAL",
                 "</h4>",
                 "<p>",
                 "GOBIERNA:",
                 "<br>",
                 "{{#critico}}",
                 "{{name}}",
                 "{{/critico}}",
                 "<br>",
                 "{{#estado}}",
                 "P<sub>d</sub> = {{critico.fixPd}} kip  >=  P <sub>r</sub> = |{{Pr}}| kip",
                 "{{#razon}}",
                 "<br>",
                 "P<sub>r</sub> / P<sub>d</sub> = {{razon}} <= 1",
                 "{{/razon}}",
                 "{{/estado}}",
                 "{{^estado}}",
                 "<span>",
                 "P<sub>d</sub> = {{critico.fixPd}} kip  <  P <sub>r</sub> = |{{Pr}}| kip",
                 "</span>",
                 "{{/estado}}",
                 "</p>",
                 "{{/mostrar}}",
                 "{{/axial}}",

                 "{{#flexion_ip}}",
                 "{{#mostrar}}",
                 "<h4>",
                 "SOLICITADA A FLEXIÓN EN EL PLANO",
                 "</h4>",
                 "<p>",
                 "GOBIERNA:",
                 "<br>",
                 "{{#critico}}",
                 "{{name}}",
                 "{{/critico}}",
                 "<br>",
                 "{{#estado}}",
                 "M<sub>d-ip</sub> = {{critico.fixMd}} kip-in  >=  M <sub>r-ip</sub> = |{{Mr_ip}}| kip-in",
                 "{{#razon}}",
                 "<br>",
                 "M<sub>r-ip</sub> / M<sub>d-ip</sub> = {{razon}} <= 1",
                 "{{/razon}}",
                 "{{/estado}}",
                 "{{^estado}}",
                 "<span>",
                 "M<sub>d-ip</sub> = {{critico.fixMd}} kip-in  <  M <sub>r-ip</sub> = |{{Mr_ip}}| kip-in",
                 "</span>",
                 "{{/estado}}",
                 "</p>",
                 "{{/mostrar}}",
                 "{{/flexion_ip}}",

                 "{{#flexion_op}}",
                 "{{#mostrar}}",
                 "<h4>",
                 "SOLICITADA A FLEXIÓN FUERA DEL PLANO",
                 "</h4>",
                 "<p>",
                 "GOBIERNA:",
                 "<br>",
                 "{{#critico}}",
                 "{{name}}",
                 "{{/critico}}",
                 "<br>",
                 "{{#estado}}",
                 "M<sub>d-op</sub> = {{critico.fixMd}} kip-in  >=  M <sub>r-op</sub> = |{{Mr_op}}| kip-in",
                 "{{#razon}}",
                 "<br>",
                 "M<sub>r-op</sub> / M<sub>d-op</sub> = {{razon}} <= 1",
                 "{{/razon}}",
                 "{{/estado}}",
                 "{{^estado}}",
                 "<span>",
                 "M<sub>d-op</sub> = {{critico.fixMd}} kip-in  <  M <sub>r-op</sub> = |{{Mr_op}}| kip-in",
                 "</span>",
                 "{{/estado}}",
                 "</p>",
                 "{{/mostrar}}",
                 "{{/flexion_op}}",
                 
                 "{{#interaccion}}",
                 "<h4>",
                 "EFECTOS DE INTERACCIÓN",
                 "</h4>",
                 "<p>",
                 
                 "{{#estado}}",
                 "{{#axial.razon}}",
                 "P<sub>r</sub> / P<sub>d</sub> ",
                 " + ",
                 "{{/axial.razon}}",

                 "{{#flexion_ip.razon}}",
                 "M<sub>r-ip</sub> / M<sub>d-ip</sub> ",
                 "{{/flexion_ip.razon}}",

                 "{{#flexion_op.razon}}",
                 " + ",
                 "M<sub>r-op</sub> / M<sub>d-op</sub> ",
                 "{{/flexion_op.razon}}",
                 " = ",

                 "{{#axial.razon}}",
                 "{{axial.razon}}",
                 " + ",
                 "{{/axial.razon}}",

                 "{{#flexion_ip.razon}}",
                 "{{flexion_ip.razon}}",
                 "{{/flexion_ip.razon}}",

                 "{{#flexion_op.razon}}",
                 " + ",
                 "{{flexion_op.razon}}",
                 "{{/flexion_op.razon}}",
                 " = ",
                 "{{interaccion.razon}} <= 1",
                 "{{/estado}}",

                 "{{^estado}}",

                 "<span>",
                 "{{#axial.razon}}",
                 "P<sub>r</sub> / P<sub>d</sub> ",
                 " + ",
                 "{{/axial.razon}}",

                 "{{#flexion_ip.razon}}",
                 "M<sub>r-ip</sub> / M<sub>d-ip</sub> ",
                 "{{/flexion_ip.razon}}",

                 "{{#flexion_op.razon}}",
                 " + ",
                 "M<sub>r-op</sub> / M<sub>d-op</sub> ",
                 "{{/flexion_op.razon}}",
                 " = ",
                 
                 "{{#axial.razon}}",
                 "{{axial.razon}}",
                 " + ",
                 "{{/axial.razon}}",

                 "{{#flexion_ip.razon}}",
                 "{{flexion_ip.razon}}",
                 "{{/flexion_ip.razon}}",

                 "{{#flexion_op.razon}}",
                 " + ",
                 "{{flexion_op.razon}}",
                 "{{/flexion_op.razon}}",
                 " = ",
                 "{{interaccion.razon}} > 1",

                 "</span>",
                 "{{/estado}}",
                 "</p>",
                 "{{/interaccion}}"
                ].join(""),


    min_axial: function (a, b) {
        "use strict";
        if (a.Pn > b.Pn) {

            return 1;

        } else if (a.Pn < b.Pn) {

            return -1;

        } else {

            return 0;
        }
    },
    min_flexion: function (a, b) {
        "use strict";
        if (a.Mn > b.Mn) {

            return 1;

        } else if (a.Mn < b.Mn) {

            return -1;

        } else {

            return 0;

        }
    },
    rama_K: function (miembro_b, miembro) {
        "use strict";
        var min = Math.min,
            abs = Math.abs,
            nombre = this.miembros[miembro_b].nombre.replace(/_|-/g, " "),
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            Pr = this.miembros[miembro_b].cargas.P,
            H = this.miembros[miembro].seccion.H,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            beta_eff = this.conexion.beta_eff,
            Qf_1,
            b_eop,
            b_eoi,
            Cv,
            parametros = {},
            axial = {
                resistencias: []
            },
            verificar;

        Qf_1 = Formulas.Qf_1.apply(this, [miembro]);
        parametros.beta_eff = beta_eff;
        parametros.Qf = Qf_1;
        axial.resistencias.push(Formulas.Pn_1.apply(this, [miembro_b, miembro, beta_eff, Qf_1]));

        if (Hb / Bb !== 1 && Bb <= B - 2 * t) {
            
            b_eop = Formulas.b_eop.apply(this, [miembro_b, miembro]);
            parametros.b_eop = b_eop;
            axial.resistencias.push(Formulas.Pn_2.apply(this, [miembro_b, miembro, b_eop]));

        }
        if ((Hb / Bb !== 1) || (B / t < 15)) {
            
            b_eoi = Formulas.b_eoi.apply(this, [miembro_b, miembro]);
            parametros.b_eoi = b_eoi;
            axial.resistencias.push(Formulas.Pn_3.apply(this, [miembro_b, b_eoi]));
        }
        if (H / B !== 1) {
            
            Cv = Formulas.Cv.apply(this, [miembro]);
            parametros.Cv = Cv;
            axial.resistencias.push(Formulas.Pn_4.apply(this, [miembro_b, miembro, Cv]));

        }
        axial.critico = axial.resistencias.sort(resistencia.min_axial)[0];

        if (Pr !== 0) {

            verificar = true;
            axial.mostrar = true;
            axial.Pr = Pr;

            if (axial.critico.Pd >= abs(Pr)) {

                axial.estado = true;
                axial.razon = abs(Pr / axial.critico.Pd).toFixed(4);

            } else {

                axial.estado = false;
                this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

            }
        }

        return {
            nombre: nombre,
            parametros: parametros,
            axial: axial,
            verificar: verificar
        };
    },
    rama_Ki: function (miembro_bi, miembro_bj, miembro) {
        "use strict";
        var abs = Math.abs,
            nombre = this.miembros[miembro_bi].nombre.replace(/_|-/g, " "),
            Pr = this.miembros[miembro_bi].cargas.P,
            Ov = this.conexion.Ov,
            b_eoi,
            b_eov,
            parametros = {},
            axial = {
                resistencias: []
            },
            verificar;


        b_eoi = Formulas.b_eoi.apply(this, [miembro_bi, miembro]);
        b_eov = Formulas.b_eov.apply(this, [miembro_bi, miembro_bj]);
        parametros.b_eoi = b_eoi;
        parametros.b_eov = b_eov;
        axial.resistencias.push(Formulas.Pn_11.apply(this, [miembro_bi, b_eoi, b_eov, Ov]));

        axial.critico = axial.resistencias.sort(resistencia.min_axial)[0];


        if (Pr !== 0) {

            verificar = true;
            axial.mostrar = true;
            axial.Pr = Pr;

            if (axial.critico.Pd >= abs(Pr)) {

                axial.estado = true;
                axial.razon = abs(Pr / axial.critico.Pd).toFixed(4);

            } else {

                axial.estado = false;
                this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

            }
        }

        return {
            nombre: nombre,
            descripcion: "Rama que traslapa",
            parametros: parametros,
            axial: axial,
            verificar: verificar
        };
    },
    rama_Kj: function (miembro_bi, miembro_bj, miembro) {
        "use strict";
        var abs = Math.abs,
            nombre = this.miembros[miembro_bj].nombre.replace(/_|-/g, " "),
            Pr = this.miembros[miembro_bj].cargas.P,
            Ov = this.conexion.Ov,
            b_eoi = Formulas.b_eoi.apply(this, [miembro_bi, miembro]),
            b_eov = Formulas.b_eov.apply(this, [miembro_bi, miembro_bj]),
            Pn_i = Formulas.Pn_11.apply(this, [miembro_bi, b_eoi, b_eov, Ov]).Pn,
            axial = {
                resistencias: []
            },
            verificar;

        axial.resistencias.push(Formulas.Pn_12.apply(this, [miembro_bj, miembro_bi, Pn_i]));
        axial.critico = axial.resistencias.sort(resistencia.min_axial)[0];


        if (Pr !== 0) {

            verificar = true;
            axial.mostrar = true;
            axial.Pr = Pr;

            if (axial.critico.Pd >= abs(Pr)) {

                axial.estado = true;
                axial.razon = abs(Pr / axial.critico.Pd).toFixed(4);

            } else {

                axial.estado = false;
                this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

            }
        }

        return {
            nombre: nombre,
            descripcion: "Rama traslapada",
            axial: axial,
            verificar: verificar
        };
    },
    rama_Y: function (miembro_b, miembro, lb) {
        "use strict";
        var sin = Math.sin,
            abs = Math.abs,
            nombre = this.miembros[miembro_b].nombre.replace(/_|-/g, " "),
            Pr = this.miembros[miembro_b].cargas.P,
            Mr_ip = this.miembros[miembro_b].cargas.Mip,
            Mr_op = this.miembros[miembro_b].cargas.Mop,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            theta = this.miembros[miembro_b].theta,
            thetaRad = toRad(theta),
            l_b = lb || Hb / sin(thetaRad),
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            gamma = this.miembros[miembro].seccion.gamma,
            Qf_2,
            b_eop,
            b_eoi,
            parametros = {},
            axial,
            flexion_ip,
            flexion_op,
            verificar,
            interaccion;

        if ((Pr === 0 && Mr_ip === 0 && Mr_op === 0) ||
                (Pr !== 0 && Mr_ip === 0 && Mr_op === 0) ||
                (Pr !== 0 && Mr_ip !== 0 && Mr_op === 0) ||
                (Pr !== 0 && Mr_ip === 0 && Mr_op !== 0) ||
                (Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0)) {
            
            axial = {};
            axial.resistencias = [];
            
            if (Bb / B <= 0.85) {
                
                Qf_2 = Formulas.Qf_2.apply(this, [miembro_b, miembro]);
                parametros.Qf = Qf_2;
                axial.resistencias.push(Formulas.Pn_5.apply(this, [miembro_b, miembro, Qf_2]));
            
            }

            if ((Bb / B >= 0.85 && Bb / B <= 1 - 1 / gamma) || B / t < 10) {
                
                b_eop = Formulas.b_eop.apply(this, [miembro_b, miembro]);
                parametros.b_eop = b_eop;
                axial.resistencias.push(Formulas.Pn_6.apply(this, [miembro_b, miembro, b_eop]));
            
            }

            if (Bb / B > 0.85) {
                
                b_eoi = Formulas.b_eoi.apply(this, [miembro_b, miembro]);
                parametros.b_eoi = b_eoi;
                axial.resistencias.push(Formulas.Pn_7.apply(this, [miembro_b, b_eoi]));
            
            }

            if (Bb / B === 1) {
                
                axial.resistencias.push(Formulas.Pn_8.apply(this, [miembro_b, miembro, l_b]));
            
            }

            if (Bb / B === 1 && Pr < 0) {
            
                Qf_2 = Formulas.Qf_2.apply(this, [miembro_b, miembro]);
                parametros.Qf = Qf_2;
                axial.resistencias.push(Formulas.Pn_9.apply(this, [miembro_b, miembro, Qf_2, l_b]));
            
            }
            
            axial.critico = axial.resistencias.sort(resistencia.min_axial)[0];

            if (Pr !== 0) {

                verificar = true;
                axial.mostrar = true;
                axial.Pr = Pr;

                if (axial.critico.Pd >= abs(Pr)) {

                    axial.estado = true;
                    axial.razon = abs(Pr / axial.critico.Pd).toFixed(4);

                } else {

                    axial.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

                }
            }
        }

        if (theta === 90) {

            if ((Pr === 0 && Mr_ip === 0 && Mr_op === 0) ||
                    (Pr === 0 && Mr_ip !== 0 && Mr_op === 0) ||
                    (Pr === 0 && Mr_ip !== 0 && Mr_op !== 0) ||
                    (Pr !== 0 && Mr_ip !== 0 && Mr_op === 0) ||
                    (Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0)) {
                
                flexion_ip = {};
                flexion_ip.resistencias = [];
            
                if (Bb / B <= 0.85) {
                
                    Qf_2 = Formulas.Qf_2.apply(this, [miembro_b, miembro]);
                    parametros.Qf = Qf_2;
                    flexion_ip.resistencias.push(Formulas.Mipn_1.apply(this, [miembro_b, miembro, Qf_2]));
                
                }

                if (Bb / B > 0.85) {
                    
                    flexion_ip.resistencias.push(Formulas.Mipn_2.apply(this, [miembro_b, miembro]));
                
                }
                
                if (Bb / B > 0.85) {
                    
                    b_eoi = Formulas.b_eoi.apply(this, [miembro_b, miembro]);
                    parametros.b_eoi = b_eoi;
                    flexion_ip.resistencias.push(Formulas.Mipn_3.apply(this, [miembro_b, b_eoi]));
                
                }
                
                flexion_ip.critico = flexion_ip.resistencias.sort(resistencia.min_flexion)[0];

                if (Mr_ip !== 0) {

                    verificar = true;
                    flexion_ip.mostrar = true;
                    flexion_ip.Mr_ip = Mr_ip;

                    if (flexion_ip.critico.Md >= abs(Mr_ip)) {

                        flexion_ip.estado = true;
                        flexion_ip.razon = abs(Mr_ip / flexion_ip.critico.Md).toFixed(4);

                    } else {

                        flexion_ip.estado = false;
                        this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

                    }
                }
            }

            if ((Pr === 0 && Mr_ip === 0 && Mr_op === 0) ||
                    (Pr === 0 && Mr_ip === 0 && Mr_op !== 0) ||
                    (Pr === 0 && Mr_ip !== 0 && Mr_op !== 0) ||
                    (Pr !== 0 && Mr_ip === 0 && Mr_op !== 0) ||
                    (Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0)) {

                flexion_op = {};
                flexion_op.resistencias = [];
                
                if (Bb / B <= 0.85) {
                
                    Qf_2 = Formulas.Qf_2.apply(this, [miembro_b, miembro]);
                    parametros.Qf = Qf_2;
                    flexion_op.resistencias.push(Formulas.Mopn_1.apply(this, [miembro_b, miembro, Qf_2]));
                
                }
                
                if (Bb / B > 0.85) {
                
                    flexion_op.resistencias.push(Formulas.Mopn_2.apply(this, [miembro_b, miembro]));
                
                }
                
                if (Bb / B > 0.85) {
                
                    b_eoi = Formulas.b_eoi.apply(this, [miembro_b, miembro]);
                    parametros.b_eoi = b_eoi;
                    flexion_op.resistencias.push(Formulas.Mopn_3.apply(this, [miembro_b, b_eoi]));
                
                }
                
                flexion_op.resistencias.push(Formulas.Mopn_4.apply(this, [miembro_b, miembro]));
                flexion_op.critico = flexion_op.resistencias.sort(resistencia.min_flexion)[0];

                if (Mr_op !== 0) {

                    verificar = true;
                    flexion_op.mostrar = true;
                    flexion_op.Mr_op = Mr_op;

                    if (flexion_op.critico.Md >= abs(Mr_op)) {

                        flexion_op.estado = true;
                        flexion_op.razon = abs(Mr_op / flexion_op.critico.Md).toFixed(4);

                    } else {

                        flexion_op.estado = false;
                        this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

                    }
                }
            }

            if (Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0 &&
                
                    axial.razon !== undefined &&
                    flexion_ip.razon !== undefined &&
                    flexion_op.razon !== undefined) {

                interaccion = {};
                interaccion.razon = (Number(axial.razon) + Number(flexion_ip.razon) + Number(flexion_op.razon)).toFixed(4);

                if (interaccion.razon <= 1.00) {

                    interaccion.estado = true;

                } else {

                    interaccion.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");
                }

            } else if (Pr !== 0 && Mr_ip !== 0 && axial.razon !== undefined && flexion_ip.razon !== undefined) {

                interaccion = {};
                interaccion.razon = (Number(axial.razon) + Number(flexion_ip.razon)).toFixed(4);

                if (interaccion.razon <= 1.00) {

                    interaccion.estado = true;

                } else {

                    interaccion.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");
                }

            } else if (Pr !== 0 && Mr_op !== 0 && axial.razon !== undefined && flexion_op.razon !== undefined) {

                interaccion = {};
                interaccion.razon = (Number(axial.razon) + Number(flexion_op.razon)).toFixed(4);

                if (interaccion.razon <= 1.00) {

                    interaccion.estado = true;

                } else {

                    interaccion.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");
                }

            } else if (Mr_ip !== 0 && Mr_op !== 0 && flexion_ip.razon !== undefined && flexion_op.razon !== undefined) {

                interaccion = {};
                interaccion.razon = (Number(flexion_ip.razon) + Number(flexion_op.razon)).toFixed(4);

                if (interaccion.razon <= 1.00) {

                    interaccion.estado = true;

                } else {

                    interaccion.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");
                
                }

            }


        }

        return {
            nombre: nombre,
            parametros: parametros,
            axial: axial,
            flexion_ip: flexion_ip,
            flexion_op: flexion_op,
            verificar: verificar,
            interaccion: interaccion
        };

    },
    rama_X: function (miembro_b, miembro, lb) {
        "use strict";
        var sin = Math.sin,
            cos = Math.cos,
            abs = Math.abs,
            nombre = this.miembros[miembro_b].nombre.replace(/_|-/g, " "),
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            Pr = this.miembros[miembro_b].cargas.P,
            Mr_ip = this.miembros[miembro_b].cargas.Mip,
            Mr_op = this.miembros[miembro_b].cargas.Mop,
            theta = this.miembros[miembro_b].theta,
            thetaRad = toRad(theta),
            l_b = lb || Hb / sin(thetaRad),
            B = this.miembros[miembro].seccion.B,
            H = this.miembros[miembro].seccion.H,
            t = this.miembros[miembro].seccion.tdes,
            gamma = this.miembros[miembro].seccion.gamma,
            Qf_2,
            b_eop,
            b_eoi,
            Cv,
            parametros = {},
            axial,
            flexion_ip,
            flexion_op,
            verificar,
            interaccion;

        if ((Pr === 0 && Mr_ip === 0 && Mr_op === 0) ||
                (Pr !== 0 && Mr_ip === 0 && Mr_op === 0) ||
                (Pr !== 0 && Mr_ip !== 0 && Mr_op === 0) ||
                (Pr !== 0 && Mr_ip === 0 && Mr_op !== 0) ||
                (Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0)) {
            
            axial = {};
            axial.resistencias = [];

            if (Bb / B <= 0.85) {
            
                Qf_2 = Formulas.Qf_2.apply(this, [miembro_b, miembro]);
                parametros.Qf = Qf_2;
                axial.resistencias.push(Formulas.Pn_5.apply(this, [miembro_b, miembro, Qf_2]));
            
            }

            if ((Bb / B >= 0.85 && Bb / B <= 1 - 1 / gamma) || B / t < 10) {
            
                b_eop = Formulas.b_eop.apply(this, [miembro_b, miembro]);
                parametros.b_eop = b_eop;
                axial.resistencias.push(Formulas.Pn_6.apply(this, [miembro_b, miembro, b_eop]));
            
            }

            if (Bb / B > 0.85) {
            
                b_eoi = Formulas.b_eoi.apply(this, [miembro_b, miembro]);
                parametros.b_eoi = b_eoi;
                axial.resistencias.push(Formulas.Pn_7.apply(this, [miembro_b, b_eoi]));
            
            }


            if (cos(thetaRad) > Hb / H) {
            
                Cv = Formulas.Cv.apply(this, [miembro]);
                parametros.Cv = Cv;
                axial.resistencias.push(Formulas.Pn_4.apply(this, [miembro_b, miembro, Cv]));
            
            }

            if (Bb / B === 1) {
            
                axial.resistencias.push(Formulas.Pn_8.apply(this, [miembro_b, miembro, l_b]));
            
            }

            if (Bb / B === 1 && Pr < 0) {
            
                Qf_2 = Formulas.Qf_2.apply(this, [miembro_b, miembro]);
                parametros.Qf = Qf_2;
                axial.resistencias.push(Formulas.Pn_10.apply(this, [miembro_b, miembro, Qf_2]));
            
            }
            
            axial.critico = axial.resistencias.sort(resistencia.min_axial)[0];

            if (Pr !== 0) {

                verificar = true;
                axial.mostrar = true;
                axial.Pr = Pr;

                if (axial.critico.Pd >= abs(Pr)) {

                    axial.estado = true;
                    axial.razon = abs(Pr / axial.critico.Pd).toFixed(4);

                } else {

                    axial.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

                }
            }
        }

        if (theta === 90) {

            if ((Pr === 0 && Mr_ip === 0 && Mr_op === 0) ||
                    (Pr === 0 && Mr_ip !== 0 && Mr_op === 0) ||
                    (Pr === 0 && Mr_ip !== 0 && Mr_op !== 0) ||
                    (Pr !== 0 && Mr_ip !== 0 && Mr_op === 0) ||
                    (Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0)) {

                flexion_ip = {};
                flexion_ip.resistencias = [];
                
                if (Bb / B <= 0.85) {
                
                    Qf_2 = Formulas.Qf_2.apply(this, [miembro_b, miembro]);
                    parametros.Qf = Qf_2;
                    flexion_ip.resistencias.push(Formulas.Mipn_1.apply(this, [miembro_b, miembro, Qf_2]));
                }

                if (Bb / B > 0.85) {
                    
                    flexion_ip.resistencias.push(Formulas.Mipn_2.apply(this, [miembro_b, miembro]));
                }
                
                if (Bb / B > 0.85) {
                
                    b_eoi = Formulas.b_eoi.apply(this, [miembro_b, miembro]);
                    parametros.b_eoi = b_eoi;
                    flexion_ip.resistencias.push(Formulas.Mipn_3.apply(this, [miembro_b, b_eoi]));
                
                }
                
                flexion_ip.critico = flexion_ip.resistencias.sort(resistencia.min_flexion)[0];

                if (Mr_ip !== 0) {

                    verificar = true;
                    flexion_ip.mostrar = true;
                    flexion_ip.Mr_ip = Mr_ip;

                    if (flexion_ip.critico.Md >= abs(Mr_ip)) {

                        flexion_ip.estado = true;
                        flexion_ip.razon = abs(Mr_ip / flexion_ip.critico.Md).toFixed(4);

                    } else {

                        flexion_ip.estado = false;
                        this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

                    }
                }
            }

            if ((Pr === 0 && Mr_ip === 0 && Mr_op === 0) ||
                    (Pr === 0 && Mr_ip === 0 && Mr_op !== 0) ||
                    (Pr === 0 && Mr_ip !== 0 && Mr_op !== 0) ||
                    (Pr !== 0 && Mr_ip === 0 && Mr_op !== 0) ||
                    (Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0)) {

                flexion_op = {};
                flexion_op.resistencias = [];
                
                if (Bb / B <= 0.85) {
                
                    Qf_2 = Formulas.Qf_2.apply(this, [miembro_b, miembro]);
                    parametros.Qf = Qf_2;
                    flexion_op.resistencias.push(Formulas.Mopn_1.apply(this, [miembro_b, miembro, Qf_2]));
                
                }

                if (Bb / B > 0.85) {
                
                    flexion_op.resistencias.push(Formulas.Mopn_2.apply(this, [miembro_b, miembro]));
                
                }
                
                if (Bb / B > 0.85) {
                
                    b_eoi = Formulas.b_eoi.apply(this, [miembro_b, miembro]);
                    parametros.b_eoi = b_eoi;
                    flexion_op.resistencias.push(Formulas.Mopn_3.apply(this, [miembro_b, b_eoi]));
                
                }
                
                flexion_op.critico = flexion_op.resistencias.sort(resistencia.min_flexion)[0];

                if (Mr_op !== 0) {

                    verificar = true;
                    flexion_op.mostrar = true;
                    flexion_op.Mr_op = Mr_op;

                    if (flexion_op.critico.Md >= abs(Mr_op)) {

                        flexion_op.estado = true;
                        flexion_op.razon = abs(Mr_op / flexion_op.critico.Md).toFixed(4);

                    } else {

                        flexion_op.estado = false;
                        this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");

                    }
                }
            }

            if (Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0 &&
                    axial.razon !== undefined &&
                    flexion_ip.razon !== undefined &&
                    flexion_op.razon !== undefined) {

                interaccion = {};
                interaccion.razon = (Number(axial.razon) + Number(flexion_ip.razon) + Number(flexion_op.razon)).toFixed(4);

                if (interaccion.razon <= 1.00) {

                    interaccion.estado = true;

                } else {

                    interaccion.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");
                }

            } else if (Pr !== 0 && Mr_ip !== 0 && axial.razon !== undefined && flexion_ip.razon !== undefined) {

                interaccion = {};
                interaccion.razon = (Number(axial.razon) + Number(flexion_ip.razon)).toFixed(4);

                if (interaccion.razon <= 1.00) {

                    interaccion.estado = true;

                } else {

                    interaccion.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");
                
                }

            } else if (Pr !== 0 && Mr_op !== 0 && axial.razon !== undefined && flexion_op.razon !== undefined) {

                interaccion = {};
                interaccion.razon = (Number(axial.razon) + Number(flexion_op.razon)).toFixed(4);

                if (interaccion.razon <= 1.00) {

                    interaccion.estado = true;

                } else {

                    interaccion.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");
                
                }

            } else if (Mr_ip !== 0 && Mr_op !== 0 && flexion_ip.razon !== undefined && flexion_op.razon !== undefined) {

                interaccion = {};
                interaccion.razon = (Number(flexion_ip.razon) + Number(flexion_op.razon)).toFixed(4);

                if (interaccion.razon <= 1.00) {

                    interaccion.estado = true;

                } else {

                    interaccion.estado = false;
                    this.Error_set("ERROR: " + nombre + " - RESISTENCIA DE LA CONEXIÓN INSUFICIENTE !");
                }

            }

        }
        return {
            nombre: nombre,
            parametros: parametros,
            axial: axial,
            flexion_ip: flexion_ip,
            flexion_op: flexion_op,
            verificar: verificar,
            interaccion: interaccion
        };
    }
};

var soldadura = {
    tw_min: function (t, tip) {
        "use strict";
        var tipo = tip || "filete";

        if (tipo === "filete") {

            if (t <= 0.25) {

                return 0.125;

            } else if (t > 0.25 && t <= 0.5) {

                return 0.1875;

            } else if (t > 0.5 && t <= 0.75) {

                return 0.25;

            } else if (t > 0.75) {

                return 0.3125;

            }

        } else if (tipo === "Ranura") {

            if (t <= 0.25) {

                return 0.125;

            } else if (t > 0.25 && t <= 0.5) {

                return 0.1875;

            } else if (t > 0.5 && t <= 0.75) {

                return 0.25;

            } else if (t > 0.75 && t <= 1.50) {

                return 0.3125;

            } else if (t > 1.50 && t <= 2.25) {

                return 0.3750;

            } else if (t > 2.25 && t <= 6) {

                return 0.50;

            } else if (t > 6) {

                return 0.625;
            }

        }

    },
    rama_Y: function (miembro_b, miembro) {
        "use strict";
        var abs = Math.abs,
            nombre = this.miembros[miembro_b].nombre.replace(/_|-/g, " "),
            Fyb = this.miembros[miembro_b].material.Fy,
            Bb = this.miembros[miembro_b].seccion.B,
            tb = this.miembros[miembro_b].seccion.tdes,
            theta = this.miembros[miembro_b].theta,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Pr = this.miembros[miembro_b].cargas.P,
            Mr_ip = this.miembros[miembro_b].cargas.Mip,
            Mr_op = this.miembros[miembro_b].cargas.Mip,
            b_eoi,
            le,
            tw_min,
            tw_1,
            tw_2,
            tw,
            mensaje = [],
            temp;

        if (Pr !== 0 && Mr_ip === 0 && Mr_op === 0) {

            b_eoi = Formulas.b_eoi.apply(this, [miembro_b, miembro]);
            le = Formulas.le_1.apply(this, [miembro_b, miembro, b_eoi]);

            tw_min = soldadura.tw_min(tb);
            tw_1 = (0.9 * Fyb * tb) / (0.75 * 0.6 * 70);
            tw_2 = (abs(Pr) / (0.75 * 0.6 * 70 * le)) < tw_min ? tw_min : (abs(Pr) / (0.75 * 0.6 * 70 * le));
            tw = Math.min(tw_1, tw_2);

            mensaje.push("<h3>-- ESPESORES DE GARGANTA EFECTIVA, t<sub>w</sub> - " + nombre + "</h3>");

            if (theta >= 60) {

                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            } else if (theta < 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            
            mensaje.push("PARA EL TALÓN DE LA RAMA: ");
            mensaje.push("Usar Soldadura de filete");
            temp = Math.ceil(tw * 16);
            mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            if (B - 4 * t >= Bb + Math.ceil(2 * 1.41 * tw * 16) / 16) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B === Bb) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            }
            return mensaje.slice(0, 1).join(" ") + "<p>" + mensaje.slice(1).join("<br>") + "</p>";

        } else if ((Pr === 0 && Mr_ip === 0 && Mr_op === 0) ||
                   (theta === 90 && ((Pr !== 0 && Mr_ip !== 0 && Mr_op !== 0) ||
                                     (Pr !== 0 && Mr_ip !== 0 && Mr_op === 0) ||
                                     (Pr !== 0 && Mr_ip === 0 && Mr_op !== 0) ||
                                     (Pr === 0 && Mr_ip !== 0 && Mr_op !== 0)))) {

            tw_min = soldadura.tw_min(tb);
            tw = (0.9 * Fyb * tb) / (0.75 * 0.6 * 70);

            mensaje.push("<h3>-- ESPESORES DE GARGANTA EFECTIVA, t<sub>w</sub> - " + nombre + "</h3>");

            if (theta >= 60) {

                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            } else if (theta < 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            
            mensaje.push("PARA EL TALÓN DE LA RAMA: ");
            mensaje.push("Usar Soldadura de filete");
            temp = Math.ceil(tw * 16);
            mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            if (B - 4 * t >= Bb + Math.ceil(2 * 1.41 * tw * 16) / 16) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B === Bb) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else {
                
                mensaje.push("PARA LOS LADOS DE LAS RAMAS: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            return mensaje.slice(0, 1).join(" ") + "<p>" + mensaje.slice(1).join("<br>") + "</p>";

        }


    },
    rama_K: function (miembro_b, miembro) {
        "use strict";
        var abs = Math.abs,
            nombre = this.miembros[miembro_b].nombre.replace(/_|-/g, " "),
            Fyb = this.miembros[miembro_b].material.Fy,
            Bb = this.miembros[miembro_b].seccion.B,
            tb = this.miembros[miembro_b].seccion.tdes,
            theta = this.miembros[miembro_b].theta,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Pr = this.miembros[miembro_b].cargas.P,
            b_eoi,
            le,
            tw_min,
            tw_1,
            tw_2,
            tw,
            mensaje = [],
            temp;


        if (Pr !== 0) {

            le = Formulas.le_2.apply(this, [miembro_b]);

            tw_min = soldadura.tw_min(tb);
            tw_1 = (0.9 * Fyb * tb) / (0.75 * 0.6 * 70);
            tw_2 = (abs(Pr) / (0.75 * 0.6 * 70 * le)) < tw_min ? tw_min : (abs(Pr) / (0.75 * 0.6 * 70 * le));
            tw = Math.min(tw_1, tw_2);

            mensaje.push("<h3>-- ESPESORES DE GARGANTA EFECTIVA, t<sub>w</sub> - " + nombre + "</h3>");

            if (theta >= 60) {
                
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            } else if (theta < 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }

            mensaje.push("PARA EL TALÓN DE LA RAMA: ");
            mensaje.push("Usar Soldadura de filete");
            temp = Math.ceil(tw * 16);
            mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            if (B - 4 * t >= Bb + Math.ceil(2 * 1.41 * tw * 16) / 16) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B === Bb) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else {
                
                mensaje.push("PARA LOS LADOS DE LAS RAMAS: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            return mensaje.slice(0, 1).join(" ") + "<p>" + mensaje.slice(1).join("<br>") + "</p>";

        } else if (Pr === 0) {

            tw_min = soldadura.tw_min(tb);
            tw = (0.9 * Fyb * tb) / (0.75 * 0.6 * 70);

            mensaje.push("<h3>-- ESPESORES DE GARGANTA EFECTIVA, t<sub>w</sub> - " + nombre + "</h3>");

            if (theta >= 60) {

                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            } else if (theta < 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }

            mensaje.push("PARA EL TALÓN DE LA RAMA: ");
            mensaje.push("Usar Soldadura de filete");
            temp = Math.ceil(tw * 16);
            mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            if (B - 4 * t >= Bb + Math.ceil(2 * 1.41 * tw * 16) / 16) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B === Bb) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else {
                
                mensaje.push("PARA LOS LADOS DE LAS RAMAS: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            return mensaje.slice(0, 1).join(" ") + "<p>" + mensaje.slice(1).join("<br>") + "</p>";

        }
    },
    rama_Ki: function (miembro_bi, miembro_bj, miembro) {
        "use strict";
        var abs = Math.abs,
            nombre = this.miembros[miembro_bi].nombre.replace(/_|-/g, " "),
            Fyb_i = this.miembros[miembro_bi].material.Fy,
            Bb_i = this.miembros[miembro_bi].seccion.B,
            tb_i = this.miembros[miembro_bi].seccion.tdes,
            theta_i = this.miembros[miembro_bi].theta,
            Bb_j = this.miembros[miembro_bj].seccion.B,
            tb_j = this.miembros[miembro_bj].seccion.tdes,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Pr = this.miembros[miembro_bi].cargas.P,
            Ov = this.conexion.Ov,
            b_eoi,
            b_eov,
            le,
            tw_min,
            tw_1,
            tw_2,
            tw,
            mensaje = [],
            temp;

        if (Pr !== 0) {

            b_eoi = Formulas.b_eoi.apply(this, [miembro_bi, miembro]);
            b_eov = Formulas.b_eov.apply(this, [miembro_bi, miembro_bj]);
            le = Formulas.le_3.apply(this, [miembro_bi, miembro_bj, miembro, b_eoi, b_eov, Ov]);
            tw_min = soldadura.tw_min(tb_i);

            tw_1 = (0.9 * Fyb_i * tb_i) / (0.75 * 0.6 * 70);
            tw_2 = (abs(Pr) / (0.75 * 0.6 * 70 * le)) < tw_min ? tw_min : (abs(Pr) / (0.75 * 0.6 * 70 * le));
            tw = Math.min(tw_1, tw_2);

            mensaje.push("<h3>-- ESPESORES DE GARGANTA EFECTIVA, t<sub>w</sub> - " + nombre + " (Rama que traslapa)</h3>");

            if (theta_i >= 60) {

                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            } else if (theta_i < 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb_i, "Ranura") ? soldadura.tw_min(tb_i, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            
            mensaje.push("PARA EL TALÓN DE LA RAMA: ");
            mensaje.push("Usar Soldadura de filete");
            temp = Math.ceil(tw * 16);
            mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            if (B - 4 * t >= Bb_i + Math.ceil(2 * 1.41 * tw * 16) / 16 && Ov < 100) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Para unir la Rama que traslapa al Cordón");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B - 4 * t < Bb_i + Math.ceil(2 * 1.41 * tw * 16) / 16 && B > Bb_i && Ov < 100) {
                
                mensaje.push("PARA LOS LADOS DE LAS RAMAS:");
                mensaje.push("Para unir la Rama que traslapa al Cordón");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb_i, "Ranura") ? soldadura.tw_min(tb_i, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B === Bb_i && Ov < 100) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Para unir la Rama que traslapa al Cordón");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            }

            if (Bb_j - 4 * tb_j >= Bb_i + Math.ceil(2 * 1.41 * tw * 16) / 16) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Para unir la Rama que traslapa a la Rama traslapada");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (Bb_j - 4 * tb_j < Bb_i + Math.ceil(2 * 1.41 * tw * 16) / 16 && Bb_j > Bb_i) {
                
                mensaje.push("PARA LOS LADOS DE LAS RAMAS:");
                mensaje.push("Para unir la Rama que traslapa a la Rama traslapada");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb_i, "Ranura") ? soldadura.tw_min(tb_i, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (Bb_j === Bb_i) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Para unir la Rama que traslapa a la Rama traslapada");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            }
            return mensaje.slice(0, 1).join(" ") + "<p>" + mensaje.slice(1).join("<br>") + "</p>";

        } else if (Pr === 0) {

            tw_min = soldadura.tw_min(tb_i);
            tw = (0.9 * Fyb_i * tb_i) / (0.75 * 0.6 * 70);

            mensaje.push("<h3>-- ESPESORES DE GARGANTA EFECTIVA, t<sub>w</sub> - " + nombre + " (Rama que traslapa)</h3>");

            if (theta_i >= 60) {
               
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            } else if (theta_i < 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb_i, "Ranura") ? soldadura.tw_min(tb_i, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            
            mensaje.push("PARA EL TALÓN DE LA RAMA: ");
            mensaje.push("Usar Soldadura de filete");
            temp = Math.ceil(tw * 16);
            mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            if (B - 4 * t >= Bb_i + Math.ceil(2 * 1.41 * tw * 16) / 16 && Ov < 100) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Para unir la Rama que traslapa al Cordón");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B - 4 * t < Bb_i + Math.ceil(2 * 1.41 * tw * 16) / 16 && B > Bb_i && Ov < 100) {
                
                mensaje.push("PARA LOS LADOS DE LAS RAMAS:");
                mensaje.push("Para unir la Rama que traslapa al Cordón");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb_i, "Ranura") ? soldadura.tw_min(tb_i, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B === Bb_i && Ov < 100) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Para unir la Rama que traslapa al Cordón");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            }

            if (Bb_j - 4 * tb_j >= Bb_i + Math.ceil(2 * 1.41 * tw * 16) / 16) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Para unir la Rama que traslapa a la Rama traslapada");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (Bb_j - 4 * tb_j < Bb_i + Math.ceil(2 * 1.41 * tw * 16) / 16 && Bb_j > Bb_i) {
                
                mensaje.push("PARA LOS LADOS DE LAS RAMAS:");
                mensaje.push("Para unir la Rama que traslapa a la Rama traslapada");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb_i, "Ranura") ? soldadura.tw_min(tb_i, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (Bb_j === Bb_i) {
                
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Para unir la Rama que traslapa a la Rama traslapada");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            }
            return mensaje.slice(0, 1).join(" ") + "<p>" + mensaje.slice(1).join("<br>") + "</p>";

        }

    },
    rama_Kj: function (miembro_bj, miembro) {
        "use strict";
        var abs = Math.abs,
            nombre = this.miembros[miembro_bj].nombre.replace(/_|-/g, " "),
            Fyb = this.miembros[miembro_bj].material.Fy,
            Bb = this.miembros[miembro_bj].seccion.B,
            tb = this.miembros[miembro_bj].seccion.tdes,
            theta = this.miembros[miembro_bj].theta,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Pr = this.miembros[miembro_bj].cargas.P,
            b_eoi,
            le,
            tw_min,
            tw_1,
            tw_2,
            tw,
            mensaje = [],
            temp;

        b_eoi = Formulas.b_eoi.apply(this, [miembro_bj, miembro]);
        le = Formulas.le_4.apply(this, [miembro_bj, miembro, b_eoi]);
        tw_min = soldadura.tw_min(tb);

        tw_1 = (0.9 * Fyb * tb) / (0.75 * 0.6 * 70);
        tw_2 = (abs(Pr) / (0.75 * 0.6 * 70 * le)) < tw_min ? tw_min : (abs(Pr) / (0.75 * 0.6 * 70 * le));
        tw = Math.min(tw_1, tw_2);

        if (Pr !== 0) {

            b_eoi = Formulas.b_eoi.apply(this, [miembro_bj, miembro]);
            le = Formulas.le_4.apply(this, [miembro_bj, miembro, b_eoi]);
            tw_min = soldadura.tw_min(tb);

            tw_1 = (0.9 * Fyb * tb) / (0.75 * 0.6 * 70);
            tw_2 = (abs(Pr) / (0.75 * 0.6 * 70 * le)) < tw_min ? tw_min : (abs(Pr) / (0.75 * 0.6 * 70 * le));
            tw = Math.min(tw_1, tw_2);

            mensaje.push("<h3>-- ESPESORES DE GARGANTA EFECTIVA, t<sub>w</sub> - " + nombre + " (Rama traslapada)</h3>");

            if (theta >= 60) {
                
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            } else if (theta < 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            
            mensaje.push("PARA EL TALÓN DE LA RAMA: ");
            mensaje.push("Usar Soldadura de filete");
            temp = Math.ceil(tw * 16);
            mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            if (B - 4 * t >= Bb + Math.ceil(2 * 1.41 * tw * 16) / 16) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B === Bb) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else {
            
                mensaje.push("PARA LOS LADOS DE LAS RAMAS: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            return mensaje.slice(0, 1).join(" ") + "<p>" + mensaje.slice(1).join("<br>") + "</p>";

        } else if (Pr === 0) {

            tw_min = soldadura.tw_min(tb);
            tw = (0.9 * Fyb * tb) / (0.75 * 0.6 * 70);

            mensaje.push("<h3>-- ESPESORES DE GARGANTA EFECTIVA, t<sub>w</sub> - " + nombre + " (Rama traslapada)</h3>");

            if (theta >= 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            } else if (theta < 60) {
            
                mensaje.push("PARA EL PIE DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            
            mensaje.push("PARA EL TALÓN DE LA RAMA: ");
            mensaje.push("Usar Soldadura de filete");
            temp = Math.ceil(tw * 16);
            mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            if (B - 4 * t >= Bb + Math.ceil(2 * 1.41 * tw * 16) / 16) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de filete");
                temp = Math.ceil(tw * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else if (B === Bb) {
            
                mensaje.push("PARA LOS LADOS DE LA RAMA: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < (5 / 8) * t ? Math.ceil((5 / 8) * t * 16) : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");

            } else {
            
                mensaje.push("PARA LOS LADOS DE LAS RAMAS: ");
                mensaje.push("Usar Soldadura de ranura");
                temp = tw / 1.067 < soldadura.tw_min(tb, "Ranura") ? soldadura.tw_min(tb, "Ranura") * 16 : Math.ceil(tw / 1.067 * 16);
                mensaje.push("con t<sub>w</sub> = " + temp + "/16 in");
            
            }
            return mensaje.slice(0, 1).join(" ") + "<p>" + mensaje.slice(1).join("<br>") + "</p>";

        }

    }
};

var Conexion_K = function (miembro_b1, miembro_b2, miembro) {
    "use strict";
    var abs = Math.abs,
        sin = Math.sin,
        tipo = this.conexion.tipo,
        Pr_1 = this.miembros[miembro_b1].cargas.P,
        theta_1 = this.miembros[miembro_b1].theta,
        thetaRad_1 = toRad(theta_1),
        Pr_2 = this.miembros[miembro_b2].cargas.P,
        theta_2 = this.miembros[miembro_b2].theta,
        thetaRad_2 = toRad(theta_2),
        e,
        g,
        Ov,
        axial = resistencia,
        plantilla = resistencia.plantillas,
        hacer = Mustache.to_html,
        mensaje;

    if ((Pr_1 >= 0 && Pr_2 <= 0) || (Pr_1 <= 0 && Pr_2 >= 0)) {


        if (tipo === "CONEXION_EN_K" || tipo === "CONEXION_EN_N") {

            if (limites.rama.apply(this, [miembro_b1, miembro]) !== undefined &&
                    limites.rama.apply(this, [miembro_b2, miembro]) !== undefined &&
                    limites.cordon.apply(this, [miembro]) !== undefined) {

                if ((Pr_1 === 0 && Pr_2 === 0) ||
                        ((abs((Pr_1 * sin(thetaRad_1)) / (Pr_2 * sin(thetaRad_2))) >= 0.8) &&
                        (abs((Pr_1 * sin(thetaRad_1)) / (Pr_2 * sin(thetaRad_2))) <= 1.2))) {
            
                    e = 0;
                    g = Formulas.g.apply(this, [miembro, miembro_b1, miembro_b2, e]);
                    Ov = Formulas.Ov.apply(this, [miembro_b2, g]);

                    tipo = (g >= 0) ? tipo + "-ESPACIAMIENTO" : tipo + "-TRASLAPE";

                    $("#ESPACIAMIENTO").val(g);
                    $("#EXCENTRICIDAD").val(e);
                    $("#TRASLAPE").val(Ov);

                    this.conexion = {
                        tipo: tipo,
                        e: e,
                        g: g,
                        Ov: Ov
                    };

                } else {
                
                    mensaje = "ERROR: " + tipo.replace(/_|-/g, " ") + " -- NO BALANCEADA !";
                    return this.Error_set(mensaje);
                
                }
            }

        }

        if (tipo === "CONEXION_EN_K-ESPACIAMIENTO" || tipo === "CONEXION_EN_N-ESPACIAMIENTO") {

            if (limites.rama.apply(this, [miembro_b1, miembro]) !== undefined &&
                    limites.rama.apply(this, [miembro_b2, miembro]) !== undefined &&
                    limites.cordon.apply(this, [miembro]) !== undefined &&
                    limites.conexion.apply(this, [miembro_b1, miembro_b2, miembro]) !== undefined) {

                if ((Pr_1 === 0 && Pr_2 === 0) ||
                        ((abs((Pr_1 * sin(thetaRad_1)) / (Pr_2 * sin(thetaRad_2))) >= 0.8) &&
                        (abs((Pr_1 * sin(thetaRad_1)) / (Pr_2 * sin(thetaRad_2))) <= 1.2))) {

                    this.reporte_reset();

                    this.reporte_add(this.reporte_encabezado, "p");
                    this.reporte_add("1.- COMPROBAR LÍMITES DE APLICACIÓN", "h2");
                    this.reporte_add(limites.cordon.apply(this, [miembro]).join("<br>"));
                    this.reporte_add(limites.rama.apply(this, [miembro_b1, miembro]).join("<br>"));
                    this.reporte_add(limites.rama.apply(this, [miembro_b2, miembro]).join("<br>"));
                    this.reporte_add(limites.conexion.apply(this, [miembro_b1, miembro_b2, miembro]).join("<br>"));

                    this.reporte_add("2.- RESISTENCIA DE LA " + tipo.replace(/_|-/g, " "), "h2");
                    this.reporte_add(hacer(plantilla, axial.rama_K.apply(this, [miembro_b1, miembro])), "section");
                    this.reporte_add(hacer(plantilla, axial.rama_K.apply(this, [miembro_b2, miembro])), "section");


                    this.reporte_add("3.- DIMENSIONES DE LA SOLDADURA", "h2");
                    this.reporte_add("Usar Proceso SMAW y electrodo E70");
                    this.reporte_add(soldadura.rama_K.apply(this, [miembro_b1, miembro]), "section");
                    this.reporte_add(soldadura.rama_K.apply(this, [miembro_b2, miembro]), "section");

                } else {
                
                    mensaje = "ERROR: " + tipo + " -- NO BALANCEADA !";
                    return this.Error_set(mensaje);
                
                }
            }
        }

        if (tipo === "CONEXION_EN_K-TRASLAPE" || tipo === "CONEXION_EN_N-TRASLAPE") {

            if (limites.rama.apply(this, [miembro_b1, miembro]) !== undefined &&
                    limites.rama.apply(this, [miembro_b2, miembro]) !== undefined &&
                    limites.cordon.apply(this, [miembro]) !== undefined &&
                    limites.conexion.apply(this, [miembro_b1, miembro_b2, miembro]) !== undefined) {

                if ((Pr_1 === 0 && Pr_2 === 0) ||
                        ((abs((Pr_1 * sin(thetaRad_1)) / (Pr_2 * sin(thetaRad_2))) >= 0.8) &&
                        (abs((Pr_1 * sin(thetaRad_1)) / (Pr_2 * sin(thetaRad_2)))) <= 1.2)) {
                    
                    this.reporte_reset();

                    this.reporte_add(this.reporte_encabezado, "p");
                    this.reporte_add("1.- COMPROBAR LÍMITES DE APLICACIÓN", "h2");
                    this.reporte_add(limites.cordon.apply(this, [miembro]).join("<br>"));
                    this.reporte_add(limites.rama.apply(this, [miembro_b1, miembro]).join("<br>"));
                    this.reporte_add(limites.rama.apply(this, [miembro_b2, miembro]).join("<br>"));
                    this.reporte_add(limites.conexion.apply(this, [miembro_b1, miembro_b2, miembro]).join("<br>"));

                    this.reporte_add("2.- RESISTENCIA DE LA " + tipo.replace(/_|-/g, " "), "h2");
                    this.reporte_add(hacer(plantilla, axial.rama_Ki.apply(this, [miembro_b2, miembro_b1, miembro])), "section");
                    this.reporte_add(hacer(plantilla, axial.rama_Kj.apply(this, [miembro_b2, miembro_b1, miembro])), "section");

                    this.reporte_add("3.- DIMENSIONES DE LA SOLDADURA", "h2");
                    this.reporte_add("Usar Proceso SMAW y electrodo E70");
                    this.reporte_add(soldadura.rama_Ki.apply(this, [miembro_b2, miembro_b1, miembro]), "section");
                    this.reporte_add(soldadura.rama_Kj.apply(this, [miembro_b1, miembro]), "section");

                } else {
                    
                    mensaje = "ERROR: " + tipo.replace(/_|-/g, " ") + " -- NO BALANCEADA !";
                    return this.Error_set(mensaje);
                
                }
            }

        }

    } else {
        
        mensaje = "ERROR: NO CLASIFICA, NO ES UNA CONEXION_EN_K NI UNA CONEXION_EN_N !";
        return this.Error_set(mensaje);
    
    }
};

var Conexion_Y = function (miembro_b1, miembro) {
    "use strict";
    var tipo = this.conexion.tipo,
        Pr = this.miembros[miembro_b1].cargas.P,
        Mr_ip = this.miembros[miembro_b1].cargas.Mip,
        Mr_op = this.miembros[miembro_b1].cargas.Mop,
        plantilla = resistencia.plantillas,
        hacer = Mustache.to_html;


    if (limites.rama.apply(this, [miembro_b1, miembro]) !== undefined && limites.cordon.apply(this, [miembro]) !== undefined) {

        this.reporte_reset();

        this.reporte_add(this.reporte_encabezado, "p");
        this.reporte_add("1.- COMPROBAR LÍMITES DE APLICACIÓN", "h2");
        this.reporte_add(limites.cordon.apply(this, [miembro]).join("<br>"), "section");
        this.reporte_add(limites.rama.apply(this, [miembro_b1, miembro]).join("<br>"), "section");

        this.reporte_add("2.- RESISTENCIA DE LA " + tipo.replace(/_|-/g, " "), "h2");
        this.reporte_add(hacer(plantilla, resistencia.rama_Y.apply(this, [miembro_b1, miembro])), "section");


        this.reporte_add("3.- DIMENSIONES DE LA SOLDADURA", "h2");
        this.reporte_add("Usar Proceso SMAW y electrodo E70");
        this.reporte_add(soldadura.rama_Y.apply(this, [miembro_b1, miembro]), "section");

    }
};

var Conexion_X = function (miembro_b1, miembro_b2, miembro) {
    "use strict";
    var tipo = Control.conexion.tipo,
        Pr_1 = this.miembros[miembro_b1].cargas.P,
        Mr_ip_1 = this.miembros[miembro_b1].cargas.Mip,
        Mr_op_1 = this.miembros[miembro_b1].cargas.Mop,
        Pr_2 = this.miembros[miembro_b2].cargas.P,
        Mr_ip_2 = this.miembros[miembro_b2].cargas.Mip,
        Mr_op_2 = this.miembros[miembro_b2].cargas.Mop,
        plantilla = resistencia.plantillas,
        hacer = Mustache.to_html,
        mensaje;

    if ((Pr_1 >= 0 && Pr_2 >= 0) || (Pr_1 <= 0 && Pr_2 <= 0)) {
        if (limites.rama.apply(this, [miembro_b1, miembro]) !== undefined &&
                limites.rama.apply(this, [miembro_b2, miembro]) !== undefined &&
                limites.cordon.apply(this, [miembro]) !== undefined) {

            this.reporte_reset();

            this.reporte_add(this.reporte_encabezado, "p");
            this.reporte_add("1.- COMPROBAR LÍMITES DE APLICACIÓN", "h2");
            this.reporte_add(limites.cordon.apply(this, [miembro]).join("<br>"));
            this.reporte_add(limites.rama.apply(this, [miembro_b1, miembro]).join("<br>"));
            this.reporte_add(limites.rama.apply(this, [miembro_b2, miembro]).join("<br>"));

            this.reporte_add("2.- RESISTENCIA DE LA " + tipo.replace(/_|-/g, " "), "h2");
            this.reporte_add(hacer(plantilla, resistencia.rama_X.apply(this, [miembro_b1, miembro])), "section");
            this.reporte_add(hacer(plantilla, resistencia.rama_X.apply(this, [miembro_b2, miembro])), "section");


            this.reporte_add("3.- DIMENSIONES DE LA SOLDADURA", "h2");
            this.reporte_add("Usar Proceso SMAW y electrodo E70");
            this.reporte_add(soldadura.rama_Y.apply(this, [miembro_b1, miembro]), "section");
            this.reporte_add(soldadura.rama_Y.apply(this, [miembro_b2, miembro]), "section");
        }
    } else {
    
        mensaje = "ERROR: NO CLASIFICA, NO ES UNA " + tipo.replace(/_|-/g, " ") + " !";
        return this.Error_set(mensaje);
    
    }
};

var Formulas = {
    // Resistencia disponible de las conexiones entre perfiles tubulares rectangulares en cerchas planas//
    // Conexiones en K con espaciamiento//
    /**
     * Excentricidad en las conexiones en K
     * @param {Number}       H - Altura total del cordón 
     * @param {Number}    Hb_1 - Altura total de la rama 1
     * @param {Number} theta_1 - Angulo entre la rama 1 y el cordón 
     * @param {Number}    Hb_2 - Altura total de la rama 2
     * @param {Number} theta_2 - Angulo entre la rama 2 y el cordón
     * @param {Number}      g  - (+) Espaciamiento entre los pies de la ramas de una conexión en K  o
                               - (-) = l_ov Traslape entre las ramas de una conexione en K 
     * @return {Number} Excentricidad de la conexión en K, (+) cuando se aleja de la rama, (-) cuando se acerca a las ramas 
     */
    e: function (miembro, miembro_b1, miembro_b2, g) {
        "use strict";
        var sin = Math.sin,
            H = this.miembros[miembro].seccion.H,
            Hb_1 = this.miembros[miembro_b1].seccion.H,
            theta_1 = toRad(this.miembros[miembro_b1].theta),
            Hb_2 = this.miembros[miembro_b2].seccion.H,
            theta_2 = toRad(this.miembros[miembro_b2].theta);

        return (Hb_1 / (2 * sin(theta_1)) + Hb_2 / (2 * sin(theta_2)) + g) * (sin(theta_1) * sin(theta_2)) / (sin(theta_1 + theta_2)) - H / 2;
    },
    /**
     * Espaciamiento o longitud de traslape en las conexiones en K
     * @param {Number}       H - Altura total del cordón
     * @param {Number}    Hb_1 - Altura total de la rama 1
     * @param {Number} theta_1 - Angulo entre la rama 1 y el cordón
     * @param {Number}    Hb_2 - Altura total de la rama 2
     * @param {Number} theta_2 - Angulo entre la rama 2 y el cordón
     * @param {Number}      e  - Excentricidad de la conexión en K, (+) cuando se aleja de la rama, (-) cuando se acerca a las ramas
     * @return {Number} (+) Espaciamiento entre los pies de la ramas de una conexión en K  o
     *                  (-) l_ov longitud de traslape entre las ramas de una conexione en K
     */
    g: function (miembro, miembro_b1, miembro_b2, e) {
        "use strict";
        var sin = Math.sin,
            H = this.miembros[miembro].seccion.H,
            Hb_1 = this.miembros[miembro_b1].seccion.H,
            theta_1 = toRad(this.miembros[miembro_b1].theta),
            Hb_2 = this.miembros[miembro_b2].seccion.H,
            theta_2 = toRad(this.miembros[miembro_b2].theta);

        return (e + H / 2) * (sin(theta_1 + theta_2)) / (sin(theta_1) * sin(theta_2)) - Hb_1 / (2 * sin(theta_1)) - Hb_2 / (2 * sin(theta_2));
    },
    /**
     * Razón de ancho efectivo beta_eff
     */
    beta_eff: function (miembro_b1, miembro_b2, miembro) {
        "use strict";
        var Bb_1 = this.miembros[miembro_b1].seccion.B,
            Hb_1 = this.miembros[miembro_b1].seccion.H,
            Bb_2 = this.miembros[miembro_b2].seccion.B,
            Hb_2 = this.miembros[miembro_b2].seccion.H,
            B = this.miembros[miembro].seccion.B;

        return (Bb_1 + Hb_1 + Bb_2 + Hb_2) / (4 * B);
    },
    Qf_1: function (miembro) {
        "use strict";
        var abs = Math.abs,
            min = Math.min,
            Fy = this.miembros[miembro].material.Fy,
            H = this.miembros[miembro].seccion.H,
            B = this.miembros[miembro].seccion.B,
            A = this.miembros[miembro].seccion.Ag,
            S = (H >= B ? this.miembros[miembro].seccion.Sx : this.miembros[miembro].seccion.Sy),
            Pi = this.miembros[miembro].cargas.Pi,
            Pd = this.miembros[miembro].cargas.Pd,
            Mi = this.miembros[miembro].cargas.Mi,
            Md = this.miembros[miembro].cargas.Md,
            beta_eff = this.conexion.beta_eff,
            Mro,
            Pro,
            U,
            Qf;

        if (Pi >= 0 && Mi <= 0 && Pd >= 0 && Md >= 0) {

            Qf = 1;
            return Qf;

        } else {

            U = min(Pi / (Fy * A) + (-Mi) / (Fy * S), Pd / (Fy * A) + Md / (Fy * S));

            Qf = 1.3 - 0.4 * (abs(U) / beta_eff);
            return Qf <= 1 ? Qf : 1;
        }
    },
    /**
     * Para conexiones en K con espaciamiento. Estado limite a: Plastificación de la cara del cordón, para todo Beta (Razón de ancho)
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}     gamma - Razón de esbeltez del cordón
     * @param {Number} beta_eff - Razón de ancho efectivo
     * @param {Number}     theta - Angulo entre la rama y el cordón, en radianes
     * @param {Number}        Qf - Parámetro de interacción de esfuerzos en el cordón
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Pn_1: function (miembro_b, miembro, beta_eff, Qf_1) {
        "use strict";
        var sin = Math.sin,
            raiz = Math.sqrt,
            potencia = Math.pow,
            Fy = this.miembros[miembro].material.Fy,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            gamma = B / (2 * t),
            theta = toRad(this.miembros[miembro_b].theta),
            o = {};

        o = {
            name: "Estado limite: Plastificación de la cara del cordón",
            phi: 0.90,
            Pn: 9.8 * Fy * potencia(t, 2) * raiz(gamma) * beta_eff * Qf_1 / sin(theta)
        };
        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;
    },
    /** 
     * Anchura eficaz a punzonamiento b_eop
     */
    b_eop: function (miembro_b, miembro) {
        "use strict";
        var B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Bb = this.miembros[miembro_b].seccion.B,
            b_eop = (10 / (B / t)) * Bb;

        return (b_eop <= Bb) ? b_eop : Bb;
    },
    /**
     * Para conexiones en K con espaciamiento. Estado limite b: Punzonamiento, Fluencia por corte de la cara del cordón, cuando Bb < B - 2t.
     * NO VERIFICAR EN RAMAS CUADRADAS
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}        Hb - Altura total de la rama
     * @param {Number}        Bb - Ancho total de la rama
     * @param {Number}     theta - Angulo entre la rama y el cordón, en radianes
     * @param {Number} b_eop - Anchura eficaz a punzonamiento
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Pn_2: function (miembro_b, miembro, b_eop) {
        "use strict";
        var sin = Math.sin,
            Fy = this.miembros[miembro].material.Fy,
            t = this.miembros[miembro].seccion.tdes,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            theta = toRad(this.miembros[miembro_b].theta),
            o = {};

        o = {
            name: "Estado limite: Punzonamiento, Fluencia por corte de la cara del cordón",
            phi: 0.95,
            Pn: (0.6 * Fy * t) / sin(theta) * (2 * Hb / sin(theta) + Bb + b_eop)
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;
    },
    /** 
     * Anchura eficaz de la rama  b_eoi
     */
    b_eoi: function (miembro_b, miembro) {
        "use strict";
        var Fy = this.miembros[miembro].material.Fy,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Fyb = this.miembros[miembro_b].material.Fy,
            Bb = this.miembros[miembro_b].seccion.B,
            tb = this.miembros[miembro_b].seccion.tdes,
            b_eoi = (10 / (B / t)) * (Fy * t / (Fyb * tb)) * Bb;

        return (b_eoi <= Bb) ? b_eoi : Bb;
    },
    /**
     * Para conexiones en K con espaciamiento. Estado limite c,d: Fluencia local de la rama o las ramas debido a
     * la distribución de esfuerzos desiguales.
     * NO VERIFICAR EN RAMAS CUADRADAS o si B/t >= 15
     * @param {Number}        Fyb - Esfuerzo de fluencia mínimo especificado del material de la rama
     * @param {Number}         tb - Espesor de diseño de las paredes de la rama
     * @param {Number}         Hb - Altura total de la rama
     * @param {Number}         Bb - Ancho total de la rama
     * @param {Number}      b_eoi - Anchura eficaz de la rama
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Pn_3: function (miembro_b, b_eoi) {
        "use strict";
        var Fyb = this.miembros[miembro_b].material.Fy,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            tb = this.miembros[miembro_b].seccion.tdes,
            o = {};

        o = {
            name: "Estado limite: Fluencia local de la rama debido a la distribución de esfuerzos desiguales",
            phi: 0.95,
            Pn: Fyb * tb * (2 * Hb + Bb + b_eoi - 4 * tb)
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;
    },
    Cv: function (miembro) {
        "use strict";
        var raiz = Math.sqrt,
            potencia = Math.pow,
            Fy = this.miembros[miembro].material.Fy,
            H = this.miembros[miembro].seccion.H,
            t = this.miembros[miembro].seccion.tdes,
            h = H - 3 * t,
            E = 29000,
            kv = 5;

        if (h / t <= 1.10 * raiz(kv * E / Fy)) {

            return 1.0;

        } else if (h / t >= 1.10 * raiz(kv * E / Fy) && h / t <= 1.37 * raiz(kv * E / Fy)) {

            return (1.10 * raiz(kv * E / Fy)) / (h / t);

        } else {

            return (1.51 * kv * E) / (potencia(h / t, 2) * Fy);
        
        }
    },
    /**
     *Estado limite e: Corte de las paredes del cordón en la región del espaciamiento. NO VERIFICAR PARA CORDONES CUADRADOS
     */
    Pn_4: function (miembro_b, miembro, Cv) {
        "use strict";
        var sin = Math.sin,
            theta = toRad(this.miembros[miembro_b].theta),
            Fy = this.miembros[miembro].material.Fy,
            H = this.miembros[miembro].seccion.H,
            t = this.miembros[miembro].seccion.tdes,
            h = H - 3 * t,
            Aw = 2 * h * t,
            o = {};

        o = {
            name: "Estado limite: Corte de las paredes del cordón en la región del espaciamiento",
            phi: 0.90,
            Pn: (0.6 * Fy * Aw * Cv) / sin(theta)
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;
    },
    Pn_g: function (miembro_b1, miembro_b2, miembro) {
        "use strict";
        var abs = Math.abs,
            sin = Math.sin,
            cos = Math.cos,
            max = Math.max,
            raiz = Math.sqrt,
            potencia = Math.pow,
            nombre = this.miembros[miembro].nombre,
            Fy = this.miembros[miembro].material.Fy,
            H = this.miembros[miembro].seccion.H,
            t = this.miembros[miembro].seccion.tdes,
            Ag = this.miembros[miembro].seccion.Ag,
            h = H - 3 * t,
            Aw = 2 * h * t,
            Cv = Formulas.Cv.apply(this, [miembro]),
            Vd = 0.9 * 0.6 * Fy * Aw * Cv,
            Pr_1 = this.miembros[miembro_b1].cargas.P,
            theta_1 = this.miembros[miembro_b1].theta,
            thetaRad_1 = toRad(theta_1),
            Pr_2 = this.miembros[miembro_b2].cargas.P,
            theta_2 = this.miembros[miembro_b2].theta,
            thetaRad_2 = toRad(theta_2),
            Pi = this.miembros[miembro].cargas.Pi,
            Pd = this.miembros[miembro].cargas.Pd,
            Vr_g = max(abs(Pr_1 * sin(thetaRad_1)), abs(Pr_2 * sin(thetaRad_2))),
            Pr_g = max(abs(-Pi - Pr_1 * cos(thetaRad_1)), abs(Pd + Pr_2 * cos(thetaRad_2))),
            Pn_g = (Ag - Aw) * Fy + Aw * Fy * raiz(1 - potencia((Vr_g / Vd), 2)),
            mensaje = [],
            Pd_g = 0.9 * Pn_g;


        mensaje.push("<h2>VERIFICAR:--" + nombre + "</h2>");
        mensaje.push("RESISTENCIA A AXIAL DEL CORDÓN EN EL ESPACIAMIENTO");
        mensaje.push("P<sub>d,g<sub> =" + Pd_g.toFixed(2) + "kips > P<sub>r,g<sub> =" + Pr_g.toFixed(2) + "kips");

        return mensaje.join("<br>");
    },
    //Conexiones en T,Y o X//

    /**
     * Para conexiones en T,Y,X. Estado limite a: Plastificación de la cara del cordón, para Beta (Razón de ancho) <= 0.85
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}       eta - Parámetro de longitud de carga
     * @param {Number}     beta - Razón de ancho
     * @param {Number}     theta - Angulo entre la rama y el cordón, en radianes
     * @param {Number}        Qf - Parámetro de interacción de esfuerzos en el cordón
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Qf_2: function (miembro_b, miembro) {
        "use strict";
        var abs = Math.abs,
            min = Math.min,
            Fy = this.miembros[miembro].material.Fy,
            H = this.miembros[miembro].seccion.H,
            B = this.miembros[miembro].seccion.B,
            A = this.miembros[miembro].seccion.Ag,
            S = (H >= B ? this.miembros[miembro].seccion.Sx : this.miembros[miembro].seccion.Sy),
            Pi = this.miembros[miembro].cargas.Pi,
            Pd = this.miembros[miembro].cargas.Pd,
            Mi = this.miembros[miembro].cargas.Mi,
            Md = this.miembros[miembro].cargas.Md,
            Bb = this.miembros[miembro_b].seccion.B,
            beta,
            Mro,
            Pro,
            U,
            Qf;

        if (Pi >= 0 && Mi <= 0 && Pd >= 0 && Md >= 0) {

            Qf = 1;
            return Qf;

        } else {

            U = min(Pi / (Fy * A) + (-Mi) / (Fy * S), Pd / (Fy * A) + Md / (Fy * S));
            beta = Bb / B;
            Qf = 1.3 - 0.4 * (abs(U) / beta);

            return Qf <= 1 ? Qf : 1;

        }
    },
    Pn_5: function (miembro_b, miembro, Qf_2) {
        "use strict";
        var sin = Math.sin,
            raiz = Math.sqrt,
            potencia = Math.pow,
            Fy = this.miembros[miembro].material.Fy,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            theta = toRad(this.miembros[miembro_b].theta),
            eta = Hb / (B * sin(theta)),
            beta = Bb / B,
            o = {};


        o = {
            name: "Estado limite: Plastificación de la cara del cordón",
            phi: 1.00,
            Pn: Fy * potencia(t, 2) / sin(theta) * ((2 * eta / (1 - beta)) + (4 / raiz(1 - beta))) * Qf_2
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;
    },
    /**
     * Para conexiones en T,Y,X. Estado limite b: Punzonamiento, Fluencia por corte de la cara del cordón,
     * cuando 0.85 <= beta <= 1-1/gamma o B/t < 10
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}        Hb - Altura total de la rama
     * @param {Number}     theta - Angulo entre la rama y el cordón, en radianes
     * @param {Number} b_eop - Anchura eficaz a punzonamiento
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Pn_6: function (miembro_b, miembro, b_eop) {
        "use strict";
        var sin = Math.sin,
            Fy = this.miembros[miembro].material.Fy,
            t = this.miembros[miembro].seccion.tdes,
            Hb = this.miembros[miembro_b].seccion.H,
            theta = toRad(this.miembros[miembro_b].theta),
            o = {};

        o = {
            name: "Estado limite: Punzonamiento, Fluencia por corte de la cara del cordón",
            phi: 0.95,
            Pn: (0.6 * Fy * t) / sin(theta) * (2 * Hb / sin(theta) + 2 * b_eop)
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;

    },
    /**
     * Para conexiones en T,Y,X. Estado limite c,d: Fluencia local de la rama o las ramas debido a
     * la distribución de esfuerzos desiguales, cuando beta > 0.85
     * @param {Number}        Fyb - Esfuerzo de fluencia mínimo especificado del material de la rama
     * @param {Number}         tb - Espesor de diseño de las paredes de la rama
     * @param {Number}         Hb - Altura total de la rama
     * @param {Number}      b_eoi - Anchura eficaz de la rama
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Pn_7: function (miembro_b, b_eoi) {
        "use strict";
        var Fyb = this.miembros[miembro_b].material.Fy,
            Hb = this.miembros[miembro_b].seccion.H,
            tb = this.miembros[miembro_b].seccion.tdes,
            o = {};


        o = {
            name: "Estado limite: Fluencia local de la rama debido a la distribución de esfuerzos desiguales",
            phi: 0.95,
            Pn: Fyb * tb * (2 * Hb + 2 * b_eoi - 4 * tb)
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;

    },
    /**
     * Para conexiones en T,Y,X. Estado límite f: Fluencia local de las paredes laterales del cordón,
     * cuando beta = 1
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}     theta - Angulo entre la rama y el cordón, en radianes
     * @param {Number}       l_b - longitud de apoyo de la carga, medido paralelo al eje del cordón
     * @param {Number}         k - radio externo de la esquina del cordón, si k se desconoce tomar k = 1.5*t
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Pn_8: function (miembro_b, miembro, l_b) {
        "use strict";
        var sin = Math.sin,
            Fy = this.miembros[miembro].material.Fy,
            t = this.miembros[miembro].seccion.tdes,
            theta = toRad(this.miembros[miembro_b].theta),
            K = 1.5 * t,
            o = {};

        o = {
            name: "Estado limite: Fluencia local de las paredes laterales del cordón",
            phi: 1.00,
            Pn: (2 * Fy * t) / sin(theta) * (5 * K + l_b)
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;

    },
    /**
     * Para conexiones en T,Y. Estado limite f: Pandeo local de las paredes laterales del cordón,
     * cuando beta = 1 y la rama esta en compresión.
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         E - Modulo de elasticidad del acero
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}         H - Altura total del cordón
     * @param {Number}     theta - Angulo entre la rama y el cordón, en radianes
     * @param {Number}       l_b - longitud de apoyo de la carga, medido paralelo al eje del cordón
     * @param {Number}        Qf - Parámetro de interacción de esfuerzos en el cordón
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Pn_9: function (miembro_b, miembro, Qf_2, l_b) {
        "use strict";
        var sin = Math.sin,
            potencia = Math.pow,
            raiz = Math.sqrt,
            Fy = this.miembros[miembro].material.Fy,
            E = 29000,
            H = this.miembros[miembro].seccion.H,
            t = this.miembros[miembro].seccion.tdes,
            theta = toRad(this.miembros[miembro_b].theta),
            o = {};

        o = {
            name: "Estado limite: Pandeo local de las paredes laterales del cordón",
            phi: 0.75,
            Pn: (1.6 * potencia(t, 2)) / sin(theta) * (1 + (3 * l_b) / (H - 3 * t)) * raiz(E * Fy) * Qf_2
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;

    },
    /**
     * Para conexiones en X. Estado limite f: Pandeo local de las paredes laterales del cordón,
     * cuando beta = 1 y la rama esta en compresión.
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         E - Modulo de elasticidad del acero
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}         H - Altura total del cordón
     * @param {Number}     theta - Angulo entre la rama y el cordón, en radianes
     * @param {Number}        Qf - Parámetro de interacción de esfuerzos en el cordón
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Pn_10: function (miembro_b, miembro, Qf_2) {
        "use strict";
        var sin = Math.sin,
            potencia = Math.pow,
            raiz = Math.sqrt,
            Fy = this.miembros[miembro].material.Fy,
            E = 29000,
            H = this.miembros[miembro].seccion.H,
            t = this.miembros[miembro].seccion.tdes,
            theta = toRad(this.miembros[miembro_b].theta),
            o = {};


        o = {
            name: "Estado limite: Fluencia local de las paredes laterales del cordón",
            phi: 0.90,
            Pn: ((48 * potencia(t, 3)) / (H - 3 * t)) * raiz(E * Fy) * Qf_2 / sin(theta)
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;

    },
    /**
     *Para conexiones en X. Estado limite e: Corte de las paredes del cordón en la región del espaciamiento, cuando cos(theta) > Hb/H */
    // Conexiones en K o N con traslape //
    /**
     * Coeficiente de traslape en las conexiones en K con traslape
     * @param {Number}    Hb_i - Altura total de la rama 2 (rama que traslapa)
     * @param {Number} theta_i - Angulo entre la rama 2 y el cordón
     * @return {Number} Coeficiente de traslape entre las ramas de una conexione en K con traslape
     */
    Ov: function (miembro_bi, l_ov) {
        "use strict";
        var sin = Math.sin,
            abs = Math.abs,
            Hb_2 = this.miembros[miembro_bi].seccion.H,
            theta_2 = toRad(this.miembros[miembro_bi].theta);

        if (l_ov <= 0) {

            return abs(l_ov) / (Hb_2 / sin(theta_2)) * 100;
        }
        return "-";

    },
    l_ov: function (miembro_b2, Ov) {
        "use strict";
        var sin = Math.sin,
            Hb_2 = this.miembros[miembro_b2].seccion.H,
            theta_2 = toRad(this.miembros[miembro_b2].theta);

        return -(Ov / 100) * (Hb_2 / sin(theta_2));

    },
    /** 
     * Anchura eficaz para una rama que traslapa, unida a una rama traslapada b_eov

         b_eov = b_eoi (miembro_bj,miembro_bi) 

         en donde:
         miembro_bj = rama traslapada 
         miembro_bi = rama que traslapa

    */
    b_eov: function (miembro_bi, miembro_bj) {
        "use strict";
        return Formulas.b_eoi.apply(this, [miembro_bi, miembro_bj]);
    },
    /**
     * Para conexiones en K con traslape. Estado limite c,d: Fluencia local de la rama o las ramas debido a
     * la distribución de esfuerzos desiguales.
     * @param {Number}        Fyb_i - Esfuerzo de fluencia mínimo especificado del material de la rama
     * @param {Number}         tb_i - Espesor de diseño de las paredes de la rama
     * @param {Number}         Hb_i - Altura total de la rama
     * @param {Number}         Bb_i - Ancho total de la rama
     * @param {Number}        b_eoi - Anchura eficaz de la rama
     * @param {Number}        b_eov - Anchura eficaz para una rama que traslapa, unida a una rama traslapada
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama que traslapa
     */
    Pn_11: function (miembro_bi, b_eoi, b_eov, Ov) {
        "use strict";
        var Fyb_i = this.miembros[miembro_bi].material.Fy,
            Hb_i = this.miembros[miembro_bi].seccion.H,
            Bb_i = this.miembros[miembro_bi].seccion.B,
            tb_i = this.miembros[miembro_bi].seccion.tdes,
            Pn,
            o = {};

        if (Ov >= 25 && Ov < 50) {

            Pn = Fyb_i * tb_i * ((Ov / 50) * (2 * Hb_i - 4 * tb_i) + b_eoi + b_eov);

        } else if (Ov >= 50 && Ov < 80) {

            Pn = Fyb_i * tb_i * (2 * Hb_i - 4 * tb_i + b_eoi + b_eov);

        } else if (Ov >= 80 && Ov <= 100) {

            Pn = Fyb_i * tb_i * (2 * Hb_i - 4 * tb_i + Bb_i + b_eov);

        }

        o = {
            name: "Estado limite: Fluencia local de la rama debido a distribución de esfuerzos desiguales",
            phi: 0.95,
            Pn: Pn
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;
    },

    Pn_12: function (miembro_bj, miembro_bi, Pn_i) {
        "use strict";
        var Fyb_j = this.miembros[miembro_bj].material.Fy,
            Ab_j = this.miembros[miembro_bj].seccion.Ag,
            Fyb_i = this.miembros[miembro_bi].material.Fy,
            Ab_i = this.miembros[miembro_bi].seccion.Ag,
            o;

        o = {
            name: "Estado limite: Fluencia local de la rama debido a distribución de esfuerzos desiguales",
            phi: 0.95,
            Pn: Pn_i * (Fyb_j * Ab_j / (Fyb_i * Ab_i))
        };

        o.Pd = o.phi * o.Pn;
        o.fixPn = o.Pn.toFixed(2);
        o.fixPd = o.Pd.toFixed(2);

        return o;
    },


    le_1: function (miembro_b, miembro, beoi) {
        "use strict";
        var sin = Math.sin,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            tb = this.miembros[miembro_b].seccion.tdes,
            B = this.miembros[miembro].seccion.B,
            theta = this.miembros[miembro_b].theta,
            thetaRad = toRad(theta),
            b_eoi = beoi,
            le;

        if ((Bb / B > 0.85 || theta > 50)) {

            if (b_eoi > 4 * tb) {
                b_eoi = 4 * tb;
            }

            le = (2 * Hb) / (sin(thetaRad)) + 2 * b_eoi;

        } else {

            le = (2 * Hb) / (sin(thetaRad)) + 2 * b_eoi;
        }

        return le;
    },
    le_2: function (miembro_b) {
        "use strict";
        var sin = Math.sin,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            tb = this.miembros[miembro_b].seccion.tdes,
            theta = this.miembros[miembro_b].theta,
            thetaRad = toRad(theta),
            le,
            lemiq50 = function (thetaRad) {
                return 2 * (Hb - 1.2 * tb) / (sin(thetaRad)) + 2 * (Bb - 1.2 * tb);
            },
            leMiq60 = function (thetaRad) {
                return 2 * (Hb - 1.2 * tb) / (sin(thetaRad)) + (Bb - 1.2 * tb);
            };

        if (theta <= 50) {

            le = lemiq50(thetaRad);

        } else if (theta >= 60) {

            le = leMiq60(thetaRad);

        } else if (theta > 50 && theta < 60) {

            le = (60 - theta) * (lemiq50(toRad(50)) - leMiq60(toRad(60))) / 10 + leMiq60(toRad(60));

        }
        return le;


    },
    le_3: function (miembro_bi, miembro_bj, miembro, beoi, beov, Ov) {
        "use strict";
        var sin = Math.sin,
            Hb_i = this.miembros[miembro_bi].seccion.H,
            Bb_i = this.miembros[miembro_bi].seccion.B,
            tb_i = this.miembros[miembro_bi].seccion.tdes,
            theta_i = this.miembros[miembro_bi].theta,
            thetaRad_i = toRad(theta_i),
            Bb_j = this.miembros[miembro_bj].seccion.B,
            tb_j = this.miembros[miembro_bj].seccion.tdes,
            theta_j = this.miembros[miembro_bj].theta,
            thetaRad_j = toRad(theta_j),
            t = this.miembros[miembro].seccion.tdes,
            b_eoi = beoi,
            b_eov = beov,
            le;


        if (Bb_i / Bb_j > 0.85 || theta_i > 50) {

            if (b_eoi > 4 * t) {
                b_eoi = 4 * t;
            }

        }

        if (Bb_i / Bb_j > 0.85 || (180 - theta_i - theta_j) > 50) {

            if (b_eov > 4 * tb_j) {
                b_eov = 4 * tb_j;
            }

        }


        if (Ov >= 25 && Ov < 50) {

            le = ((2 * Ov) / 50) * ((1 - (Ov / 100)) * (Hb_i / sin(thetaRad_i)) +
                                    (Ov / 100) * (Hb_i / (sin(thetaRad_i + thetaRad_j)))) + b_eoi + b_eov;

        } else if (Ov >= 50 && Ov < 80) {

            le = 2 * ((1 - (Ov / 100)) * (Hb_i / sin(thetaRad_i)) + (Ov / 100) * (Hb_i / (sin(thetaRad_i + thetaRad_j)))) + b_eoi + b_eov;

        } else if (Ov >= 80 && Ov <= 100) {

            le = 2 * ((1 - (Ov / 100)) * (Hb_i / sin(thetaRad_i)) + (Ov / 100) * (Hb_i / (sin(thetaRad_i + thetaRad_j)))) + Bb_i + b_eov;

        }

        return le;
    },
    le_4: function (miembro_bj, miembro, beoi) {
        "use strict";
        var sin = Math.sin,
            Hb_j = this.miembros[miembro_bj].seccion.H,
            Bb_j = this.miembros[miembro_bj].seccion.B,
            tb_j = this.miembros[miembro_bj].seccion.tdes,
            theta_j = this.miembros[miembro_bj].theta,
            thetaRad_j = toRad(theta_j),
            B = this.miembros[miembro].seccion.B,
            b_eoi = beoi,
            le;

        if (Bb_j / B <= 0.85 || theta_j <= 50) {

            le = ((2 * Hb_j) / (sin(thetaRad_j))) + 2 * b_eoi;


        } else if (Bb_j / B > 0.85 || theta_j > 50) {

            le = ((2 * Hb_j - 1.2 * tb_j) / (sin(thetaRad_j)));
        }

        return le;


    },


    //Resistencia disponible de las conexiones entre perfiles tubulares rectangulares sometidos a momento flexionante//

    /**
     * Para conexiones en T,X. Estado limite a: Plastificación de la cara del cordón, para Beta (Razón de ancho) <= 0.85
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}       eta - Parámetro de longitud de carga
     * @param {Number}     beta - Razón de ancho
     * @return {Number} Resistencia Nominal expresada como Momento en la Rama
     */

    Mipn_1: function (miembro_b, miembro, Qf_2) {
        "use strict";
        var raiz = Math.sqrt,
            potencia = Math.pow,
            Fy = this.miembros[miembro].material.Fy,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            eta = Hb / B,
            beta = Bb / B,
            o = {};


        o = {
            name: "Estado limite: Plastificación de la cara del cordón",
            Mn: Fy * potencia(t, 2) * ((1 / (2 * eta)) + (2 / raiz(1 - beta)) + (eta / (1 - beta))) * Qf_2,
            phi: 1.00
        };

        o.Md = o.phi * o.Mn;
        o.fixMn = o.Mn.toFixed(2);
        o.fixMd = o.Md.toFixed(2);

        return o;
    },
    /**
     * Para conexiones en T,X. Estado limite f: Fluencia local de las paredes laterales del cordón,
     * cuando beta > 0.85;
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}         Hb - Altura total de la rama
     * @return {Number}  Resistencia Nominal expresada como Momento en la Rama
     */
    Mipn_2: function (miembro_b, miembro) {
        "use strict";
        var potencia = Math.pow,
            tipo = this.conexion.tipo,
            Fy = this.miembros[miembro].material.Fy,
            t = this.miembros[miembro].seccion.tdes,
            Hb = this.miembros[miembro_b].seccion.H,
            Fy_prima,
            o = {};

        Fy_prima = tipo === "CONEXION_EN_T" ? Fy : 0.8 * Fy;

        o = {
            name: "Estado limite: Fluencia local de las paredes laterales del cordón",
            Mn: 0.5 * Fy_prima * t * potencia((5 * t + Hb), 2),
            phi: 1.00
        };

        o.Md = o.phi * o.Mn;
        o.fixMn = o.Mn.toFixed(2);
        o.fixMd = o.Md.toFixed(2);

        return o;

    },
    /**
     * Para conexiones en T,X. Estado limite c,d: Fluencia local de la rama o las ramas debido a
     * la distribución de esfuerzos desiguales, cuando beta > 0.85
     * @param {Number}        Fyb - Esfuerzo de fluencia mínimo especificado del material de la rama
     * @param {Number}         tb - Espesor de diseño de las paredes de la rama
     * @param {Number}         Hb - Altura total de la rama
     * @param {Number}         Bb - Ancho  total de la rama
     * @param {Number}         Zb - Módulo plástico de sección de la rama alrededor del eje de flexion
     * @param {Number}      b_eoi - Anchura eficaz de la rama
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Mipn_3: function (miembro_b, b_eoi) {
        "use strict";
        var Fyb = this.miembros[miembro_b].material.Fy,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            tb = this.miembros[miembro_b].seccion.tdes,
            Zb = (Hb >= Bb ? this.miembros[miembro_b].seccion.Zx : this.miembros[miembro_b].seccion.Zy),
            o = {};



        o = {
            name: "Estado limite: Fluencia local de la rama debido a la distribución de esfuerzos desiguales",
            Mn: Fyb * (Zb - (1 - (b_eoi / Bb)) * Bb * Hb * tb),
            phi: 0.95
        };

        o.Md = o.phi * o.Mn;
        o.fixMn = o.Mn.toFixed(2);
        o.fixMd = o.Md.toFixed(2);

        return o;

    },

    /**
     * Para conexiones en T,X. Estado limite a: Plastificación de la cara del cordón, para Beta (Razón de ancho) <= 0.85
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}         B - Ancho total del cordón
     * @param {Number}         Hb - alto total de la rama
     * @param {Number}         Bb - Ancho total de la rama
     * @param {Number}     beta - Razón de ancho
     * @return {Number} Resistencia Nominal expresada como Momento en la Rama
     */

    Mopn_1: function (miembro_b, miembro, Qf_2) {
        "use strict";
        var raiz = Math.sqrt,
            potencia = Math.pow,
            Fy = this.miembros[miembro].material.Fy,
            B = this.miembros[miembro].seccion.B,
            t = this.miembros[miembro].seccion.tdes,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            eta = Hb / B,
            beta = Bb / B,
            o = {};


        o = {
            name: "Estado limite: Plastificación de la cara del cordón",
            Mn: Fy * potencia(t, 2) * (((0.5 * Hb * (1 + beta)) / (1 - beta)) + raiz((2 * B * Bb * (1 + beta)) / (1 - beta))) * Qf_2,
            phi: 1.00
        };

        o.Md = o.phi * o.Mn;
        o.fixMn = o.Mn.toFixed(2);
        o.fixMd = o.Md.toFixed(2);

        return o;
    },
    /**
     * Para conexiones en T,X. Estado limite f: Fluencia local de las paredes laterales del cordón,
     * cuando beta > 0.85;
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}         B - Ancho total del cordón
     * @param {Number}         Hb - Altura total de la rama
     * @return {Number}  Resistencia Nominal expresada como Momento en la Rama
     */
    Mopn_2: function (miembro_b, miembro) {
        "use strict";
        var tipo = this.conexion.tipo,
            Fy = this.miembros[miembro].material.Fy,
            t = this.miembros[miembro].seccion.tdes,
            B = this.miembros[miembro].seccion.B,
            Hb = this.miembros[miembro_b].seccion.H,
            Fy_prima,
            o = {};

        Fy_prima = tipo === "CONEXION_EN_T" ? Fy : 0.8 * Fy;

        o = {
            name: "Estado limite: Fluencia local de las paredes laterales del cordón",
            Mn: Fy_prima * t * (B - t) * (5 * t + Hb),
            phi: 1.00
        };

        o.Md = o.phi * o.Mn;
        o.fixMn = o.Mn.toFixed(2);
        o.fixMd = o.Md.toFixed(2);

        return o;

    },
    /**
     * Para conexiones en T,X. Estado limite c,d: Fluencia local de la rama o las ramas debido a
     * la distribución de esfuerzos desiguales, cuando beta > 0.85
     * @param {Number}        Fyb - Esfuerzo de fluencia mínimo especificado del material de la rama
     * @param {Number}         tb - Espesor de diseño de las paredes de la rama
     * @param {Number}         Bb - Ancho  total de la rama
     * @param {Number}         Zb - Módulo plástico de sección de la rama alrededor del eje de flexión
     * @param {Number}      b_eoi - Anchura eficaz de la rama
     * @return {Number} Resistencia Nominal expresada como fuerza en la Rama
     */
    Mopn_3: function (miembro_b, b_eoi) {
        "use strict";
        var potencia = Math.pow,
            Fyb = this.miembros[miembro_b].material.Fy,
            Hb = this.miembros[miembro_b].seccion.H,
            Bb = this.miembros[miembro_b].seccion.B,
            tb = this.miembros[miembro_b].seccion.tdes,
            Zb = (Hb >= Bb ? this.miembros[miembro_b].seccion.Zy : this.miembros[miembro_b].seccion.Zx),
            o = {};


        o = {
            name: "Estado limite: Fluencia local de la rama debido a la distribución de esfuerzos desiguales",
            Mn: Fyb * (Zb - (0.5 * potencia((1 - (b_eoi / Bb)), 2) * potencia(Bb, 2) * tb)),
            phi: 0.95
        };
        o.Md = o.phi * o.Mn;
        o.fixMn = o.Mn.toFixed(2);
        o.fixMd = o.Md.toFixed(2);

        return o;

    },
    /**
     * Para conexiones en T,X. Estado limite g: Falla por distorsión del cordón, para conexiones en T y X desbalanceadas
     * @param {Number}        Fy - Esfuerzo de fluencia mínimo especificado del material del cordón
     * @param {Number}         t - Espesor de diseño de las paredes del cordón
     * @param {Number}         H - Ancho total del cordón
     * @param {Number}         B - Altura total dela cordón
     * @param {Number}         Hb - Ancho total de la rama
     * @return {Number} Resistencia Nominal expresada como Momento en la Rama
     */

    Mopn_4: function (miembro_b, miembro) {
        "use strict";
        var raiz = Math.sqrt,
            Fy = this.miembros[miembro].material.Fy,
            B = this.miembros[miembro].seccion.B,
            H = this.miembros[miembro].seccion.H,
            t = this.miembros[miembro].seccion.tdes,
            Hb = this.miembros[miembro_b].seccion.H,
            o = {};


        o = {
            name: "Estado limite: Falla por distorsión del cordón",
            Mn: 2 * Fy * t * (Hb * t + raiz((B * H * t * (B + H)))),
            phi: 1.00
        };

        o.Md = o.phi * o.Mn;
        o.fixMn = o.Mn.toFixed(2);
        o.fixMd = o.Md.toFixed(2);

        return o;
    }

};