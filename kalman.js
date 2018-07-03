class Kalman {
    // N - Number of variables in the state
    // No - Number of observable variables in the state
    // var x: Matrix // state N x 1
    // var P: Matrix // Uncertainty covariance (N x N)
    // var F: Matrix // state transition (N x N)
    // var u: Matrix // External motion vector (N x 1)
    // // var z: Matrix // Measurement (No x 1)
    // var H: Matrix // Projection (extract observables) Measurement function (No x N)
    // let I: Matrix // Identity (N x N)
    // var R: Matrix // Measurement Noise (No x No)
    // var Q: Matrix // Prediction error (N x N)

    constructor(N, No) {
        // state [lat, long, h, a, vx, vy, vz, va, ax, ay, az, aa]
        // state has position (lat,long,h,a) h is height, a is rotation, velocity (vlat, vlong, vh, va) and acceleration (alat, along, ah, aa) in all axis
        // the only observable values are the position (lat,long,h,a)
        this.x = Matrix.init(N, 1);
        this.P = Matrix.init(N, N);
        this.F = Matrix.init(N, N);
        this.Q = Matrix.init(N, N);
        this.u = Matrix.init(N, 1);
        this.H = Matrix.init(No, N);

        // Projection matrix return only the observable values (position in this case)
        for (let i = 0; i < No; i++) {
            this.H.values[i][i] = 1.0;
        }

        // Identity
        this.I = Matrix.identity(N);

        // Measurement Noise
        this.R = Matrix.init(No, No);
    }

    predict() {
        this.x = this.F.multiply(this.x).add(this.u); // F * x + u
        this.P = this.F.multiply(this.P).multiply(this.F.transpose()).add(Q); // F * P * Ft + Q
        if (isNaN(this.x.values[0][0])) {
            console.log("Naan Predict");
        }
    }

    measurementUpdate(z) {
        let Ht = this.H.transpose();
        let y = z.subtract(this.H.multiply(this.x)); // z - (H*x)
        let S = this.H.multiply(this.P).multiply(Ht).add(R); // H * P * Ht + R
        let K = this.P.multiply(Ht).multiply(S.inverse()); // P * Ht * S.inverse()

        this.x = this.x.add(K.multiply(y)); // x + K*y
        this.P = (this.I.subtract(K.multiply(this.H))).multiply(this.P); // (I - K*H)*P

        if (isNaN(this.x.values[0][0])) {
            console.log(`Naan Measurement z: ${this.z.values} s: ${this.S.values} si: ${this.S.inverse().values} K: ${this.K.values} y: ${this.y.values} h: ${this.H.values}`);
        }
    }
}

