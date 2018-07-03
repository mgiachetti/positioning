class Matrix {
    constructor(values) {
        this.values = values;
    }

    static init(rows, cols) {
        if (!cols) {
            cols = rows;
        }
        const matrixData = [];
        for (let r = 0; r < rows; r++) {
            const rowData = [];
            for (let c = 0; c < cols; c++) {
                rowData[c] = 0.0;
            }
            matrixData[r] = rowData;
        }
        return new Matrix(matrixData);
    }

    static identity(size) {
        var res = Matrix.init(size);
        for (let i = 0; i < size; i++) {
            res.values[i][i] = 1.0;
        }
        return res;
    }

    rows() {
        return this.values.length;
    }

    cols() {
        return this.values[0].length;
    }

    toString() {
        return this.values.map(row => row.toString()).join('\n');
    }

    add(right) {
        const res = Matrix.init(this.rows(), this.cols());
        const rows = res.rows();
        const cols = res.cols();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                res.values[r][c] = this.values[r][c] + right.values[r][c];
            }
        }
        return res;
    }

    subtract(right) {
        const res = Matrix.init(this.rows(), this.cols());
        const rows = res.rows();
        const cols = res.cols();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                res.values[r][c] = this.values[r][c] - right.values[r][c];
            }
        }
        return res;
    }

    multiply(right) {
        const res = Matrix.init(this.rows(), right.cols());
        const rows = res.rows();
        const cols = res.cols();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                for (let i = 0; i < this.cols(); i++) {
                    res.values[r][c] += this.values[r][i] * right.values[i][c];
                }
            }
        }
        return res;
    }

    transpose() {
        const res = Matrix.init(this.cols(), this.rows());
        const rows = res.rows();
        const cols = res.cols();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                res.values[r][c] = this.values[c][r];
            }
        }
        return res;
    }

    clone() {
        const res = Matrix.init(this.rows(), this.cols());
        const rows = res.rows();
        const cols = res.cols();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                res.values[r][c] = this.values[r][c];
            }
        }
        return res;
    }

    inverse() {
        //create the identity matrix (I), and a copy (C) of the original
        const size = this.rows();
        const I = Matrix.identity(size).values;
        const C = this.clone().values;
        
        // Perform elementary row operations
        for (let i = 0; i < size; ++i) {
            // get the element e on the diagonal
            let e = C[i][i];
            
            // if we have a 0 on the diagonal (we'll need to swap with a lower row)
            if (e == 0) {
                //look through every row below the i'th row
                for (let ii = i+1; ii < size; ++ii) {
                    //if the ii'th row has a non-0 in the i'th col
                    if (C[ii][i] != 0) {
                        //it would make the diagonal have a non-0 so swap it
                        for (let j = 0; j < size; ++j) {
                            e = C[i][j];       //temp store i'th row
                            C[i][j] = C[ii][j];//replace i'th row by ii'th
                            C[ii][j] = e;      //repace ii'th by temp
                            e = I[i][j];       //temp store i'th row
                            I[i][j] = I[ii][j];//replace i'th row by ii'th
                            I[ii][j] = e;      //repace ii'th by temp
                        }
                        //don't bother checking other rows since we've swapped
                        break;
                    }
                }
                //get the new diagonal
                e = C[i][i];
                //if it's still 0, not invertable (error)
                if (e == 0) { return }
            }
            
            // Scale this row down by e (so we have a 1 on the diagonal)
            for (let j = 0; j < size; ++j) {
                C[i][j] = C[i][j]/e; //apply to original matrix
                I[i][j] = I[i][j]/e; //apply to identity
            }
            
            // Subtract this row (scaled appropriately for each row) from ALL of
            // the other rows so that there will be 0's in this column in the
            // rows above and below this one
            for (let ii = 0; ii < size; ++ii) {
                // Only apply to other rows (we want a 1 on the diagonal)
                if (ii == i) { continue; }
                
                // We want to change this element to 0
                e = C[ii][i];
                // Subtract (the row above(or below) scaled by e) from (the
                // current row) but start at the i'th column and assume all the
                // stuff left of diagonal is 0 (which it should be if we made this
                // algorithm correctly)
                for (let j = 0; j < size; ++j) {
                    C[ii][j] -= e*C[i][j]; //apply to original matrix
                    I[ii][j] -= e*I[i][j]; //apply to identity
                }
            }
        }
        
        //we've done all operations, C should be the identity
        //matrix I should be the inverse:
        return new Matrix(I);
    }
}
