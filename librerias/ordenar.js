/*jslint maxlen: 150*/
var Ordenar = {

    /* Nominal Sizes of Rectangular HSS Shapes to Search-Object. Example "HSS 20 x 12 x 5/8" 
     * "HSS 20 x 12 x 5/8".slice(4)        ---> "20 x 12 x 5/8"
     * "20 x 12 x 5/8".split(" x " )   ---> dimensions = ["20","12","5/8"]
     *      {   H: Number(dimensions[0]),
     *          B: Number(dimensions[1]),
     *       tnom: Number(dimensions[2])    }
     */
    toSearchObj: function (nominal) {
        "use strict";

        var dimensiones,
            temporal;

        dimensiones = nominal.slice(3).split("X");
        temporal = dimensiones[2].split("/").map(Number);

        return {
            H: Number(dimensiones[0]),
            B: Number(dimensiones[1]),
            tnom: temporal[0] / temporal[1]
        };
    },


    /*
     * Binary search implementation in JavaScript
     * Copyright (c) 2009 Nicholas C. Zakas
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sub-license, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    /*
     * Uses a binary search algorithm to locate a value in the specified array.
     * This implementation has been adapted to locate a HSS shape in a specified array of HSS shapes
     * @param {Array} items - A ordered array containing  the HSS shapes
     * @param {object} value - The HSS shape object, based on the its nominal size, to search for.
     * @return {int} The zero-based index of the value in the array or -1 if not found.
     */
    Search: function (items, value) {
        "use strict";
        var startIndex = 0,
            stopIndex = items.length - 1,
            middle = Math.floor((stopIndex + startIndex) / 2),
            igual = this.iHss,
            mayor = this.MHss;

        while (!igual(items[middle], value) && startIndex < stopIndex) {

            //adjust search area
            if (mayor(value, items[middle])) {
                
                stopIndex = middle - 1;
                
            } else if (!mayor(value, items[middle])) {
                
                startIndex = middle + 1;
                
            }
            //recalculate middle
            middle = Math.floor((stopIndex + startIndex) / 2);
        }
        //make sure it's the right value
        return (!igual(items[middle], value)) ? -1 : middle;
    },

    deMenor_aMayor: function (a, b) {
        "use strict";
        
        var mayor = Ordenar.MHss(a, b),
            igual = Ordenar.iHss(a, b),
            menor = Ordenar.mHss(a, b);
        
        if (mayor) {
            
            return 1;
            
            
        } else if (igual) {
            
            return 0;
            
        } else if (menor) {
            
            return -1;
            
        }
        
    },
    
    deMayor_aMenor: function (a, b) {
        "use strict";
        
        var mayor = Ordenar.MHss(a, b),
            igual = Ordenar.iHss(a, b),
            menor = Ordenar.mHss(a, b);
        
        if (mayor) {
            
            return -1;
            
            
        } else if (igual) {
            
            return 0;
            
        } else if (menor) {
            
            return 1;
            
        }
        
    },
    /**
     * Compara dos Perfiles HSS rectangulares
     * Cu?l Perfil es mayor?
     *
     * @param {Perfil} a - Primer Perfil HSS
     * @param {Perfil} b - Segundo Perfil HSS
     * @return {Boolean} - true:  El primer perfil HSS es mayor
     * que el segundo   ó false: El primer perfil HSS es menor
     * que el segundo
     */
    MHss: function (a, b) {
        "use strict";

        if (a.H === b.H) {

            if (a.B === b.B) {

                if (a.tnom === b.tnom) {

                    return false;

                } else if (a.tnom < b.tnom) {

                    return false;

                } else {

                    return true;

                }

            }
            return (a.B < b.B) ? false : true;
        }
        return (a.H < b.H) ? false : true;
    },

    /**
     * Compara dos Perfiles HSS rectangulares
     * Cu?l Perfil es menor?
     *
     * @param {Perfil} a - Primer Perfil HSS
     * @param {Perfil} b - Segundo Perfil HSS
     * @return {Boolean} - true:  El primer perfil HSS es menor
     * que el segundo   ó false: El primer perfil HSS es mayor
     * que el segundo
     */
    mHss: function (a, b) {
        "use strict";

        if (a.H === b.H) {

            if (a.B === b.B) {

                if (a.tnom === b.tnom) {

                    return false;

                } else if (a.tnom > b.tnom) {

                    return false;

                } else {

                    return true;

                }

            }
            return (a.B > b.B) ? false : true;

        }
        return (a.H > b.H) ? false : true;

    },

    /**
     * Compara dos Perfiles HSS rectangulares
     * Son sus dimensiones iguales?
     *
     * @param {Perfil} a - Primer Perfil HSS
     * @param {Perfil} b - Segundo Perfil HSS
     * @return {Boolean} - true:  Las dimensiones de los  perfiles son iguales
     * que el segundo   ó false: las dimensiones de los perfiles no son iguales
     */
    iHss: function (a, b) {
        "use strict";

        if (a.H === b.H && a.B === b.B && a.tnom === b.tnom) {
            
            return true;
            
        }
        return false;
    }

};