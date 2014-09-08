var Ordenar = {

    /* Nominal Sizes of Rectangular HSS Shapes to Search-Object. Example "HSS 20 x 12 x 5/8" 
     * "HSS 20 x 12 x 5/8".slice(4)        ---> "20 x 12 x 5/8"
     * "20 x 12 x 5/8".split(" x " )   ---> dimensions = ["20","12","5/8"]
     *      {   H: Number(dimensions[0]),
     *          B: Number(dimensions[1]),
     *       tnom: Numero(dimensions[2])    }
     */
    toSearchObj: function (nominal) {
        var dimensiones, temporal;

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
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
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


    /*
     * Recursive merge sort implementation in JavaScript
     * Copyright (c) 2012 Nicholas C. Zakas
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
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
    
    /**
     * Merge to arrays in order based on the given condition.
     * @param {Array} left - The first array to merge
     * @param {Array} right - The second array to merge
     * @param {Function} condition - The condition for  ordering the
     * array
     * @return {Array} The merged array
     */
    merge: function (left, right, condition) {
        var result = [],
            il = 0,
            ir = 0;

        while (il < left.length && ir < right.length) {
            if (condition(left[il], right[ir])) {
                result.push(left[il++]);
            } else {
                result.push(right[ir++]);
            }
        }

        return result.concat(left.slice(il)).concat(right.slice(ir));
    },
    /**
     * Sorts an array using merge sort and the given condition
     * @param {Array} items - The array to sort
     * @param {Function} condition - The condition for sorting the
     * array
     * @return {Array} The sorted array
     */
    mergeSort: function (items, condition) {

        var merge = Ordenar.merge,
            mergeSort = Ordenar.mergeSort,
            middle,
            left,
            right,
            params;

        if (items.length < 2) {
            return items;
        }

        middle = Math.floor(items.length / 2);
        left = items.slice(0, middle);
        right = items.slice(middle);
        params = merge(mergeSort(left, condition), mergeSort(right, condition), condition);


        params.unshift(0, items.length);
        items.splice.apply(items, params);
        return items;
    },

    /**
     * Compara dos Perfiles HSS rectangulares
     * Cual Perfil es mayor?
     *
     * @param {Perfil} a - Primer Perfil HSS
     * @param {Perfil} b - Segundo Perfil HSS
     * @return {Boolean} - true:  El primer perfil HSS es mayor
     * que el segundo   ó false: El primer perfil HSS es menor
     * que el segundo
     */
    MHss: function (a, b) {

        if (a.H === b.H) {
            if (a.B === b.B) {
                return (a.tnom < b.tnom) ? false : true;
            }
            return (a.B < b.B) ? false : true;
        }
        return (a.H < b.H) ? false : true;
    },

    /**
     * Compara dos Perfiles HSS rectangulares
     * Cual Perfil es menor?
     *
     * @param {Perfil} a - Primer Perfil HSS
     * @param {Perfil} b - Segundo Perfil HSS
     * @return {Boolean} - true:  El primer perfil HSS es menor
     * que el segundo   ó false: El primer perfil HSS es mayor
     * que el segundo
     */
    mHss: function (a, b) {

        if (a.H === b.H) {
            if (a.B === b.B) {
                return (a.tnom > b.tnom) ? false : true;
            }
            return (a.B > b.B) ? false : true;
        }
        return (a.H > b.H) ? false : true;
    },
    /**
     * Compara dos Perfiles HSS rectangulares
     * Sus dimensiones son igules?
     *
     * @param {Perfil} a - Primer Perfil HSS
     * @param {Perfil} b - Segundo Perfil HSS
     * @return {Boolean} - true:  Las dimensiones de los  perfiles son iguales 
     * que el segundo   ó false: las dimensiones de los perfiles no son igules
     */
    iHss: function (a, b) {

        if (a.H === b.H && a.B === b.B && a.tnom === b.tnom) {
            return true;
        }
        return false;
    },
    
};