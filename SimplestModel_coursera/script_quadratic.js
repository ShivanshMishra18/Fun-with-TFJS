// To fit : y = x^2 - 5

async function run() {
    await model.fit(xs,ys,
        {
            epochs: 200,
            callbacks: {
                onEpochEnd: async(epoch, log) => {
                    console.log("E:",epoch,"   loss:", log.loss)
                }
            }
        })

    alert( model.predict(tf.tensor2d([50.0], [1,1])) )
}

const xs = tf.tensor2d([ -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0 ] , [7,1] )
const ys = tf.tensor2d([ -1.0, -4.0, -5.0, -4.0, -1.0, 4.0 , 11.0 ] , [7,1])

const model = tf.sequential()
model.add(tf.layers.dense({units: 1, inputShape: [1], activation: 'relu'}))
model.add(tf.layers.dense({units: 1}))
model.compile({
    loss: 'meanSquaredError',
    optimizer: 'sgd'
})
model.summary()
run()


